import { access, copyFile, mkdir, readFile, readdir, realpath, stat } from "node:fs/promises";
import { dirname, isAbsolute, join, relative } from "node:path";
import { spawn } from "node:child_process";

export type FileOperation = {
  source: string;
  target: string;
};

export type FileAction = FileOperation & {
  action: "create" | "skip";
};

export type DoctorResult = {
  id: string;
  status: "ok" | "warn" | "fail";
  message: string;
  version?: string;
  evidence?: string;
  remediation?: string;
};

export type ProjectInspection = {
  stage: "empty" | "documented" | "scaffolded" | "implemented";
  stacks: string[];
  scripts: string[];
  signals: string[];
  originInference: string;
};

export type ProjectVerification = {
  status: "verified" | "failed" | "not-run";
  checks: { script: string; exitCode: number }[];
};

async function exists(path: string): Promise<boolean> {
  return access(path).then(() => true, () => false);
}

type LocalRead =
  | { kind: "file"; content: Buffer }
  | { kind: "missing" }
  | { kind: "error"; code: string };

async function readLocalFile(root: string, path: string): Promise<LocalRead> {
  try {
    const rootPath = await realpath(root);
    const targetPath = await realpath(join(root, ...path.split("/")));
    const targetRelative = relative(rootPath, targetPath);
    if (targetRelative.startsWith("..") || isAbsolute(targetRelative)) return { kind: "error", code: "OUTSIDE_ROOT" };
    if (!(await stat(targetPath)).isFile()) return { kind: "error", code: "NOT_A_FILE" };
    return { kind: "file", content: await readFile(targetPath) };
  } catch (error: unknown) {
    const code = typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
      ? error.code
      : "READ_ERROR";
    return code === "ENOENT" ? { kind: "missing" } : { kind: "error", code };
  }
}

function evidence(path: string, read: LocalRead): string {
  return read.kind === "file" ? path : read.kind === "missing" ? `${path} not found` : `${path} unreadable (${read.code})`;
}

function text(read: LocalRead): string | undefined {
  return read.kind === "file" ? read.content.toString("utf8") : undefined;
}

function frontmatterValue(content: string | undefined, key: string): string | undefined {
  const block = content?.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
  const raw = block?.match(new RegExp(`^${key}:\\s*([^\\r\\n]+)$`, "m"))?.[1]?.trim();
  if (!raw) return undefined;
  return raw.match(/^(["'])(.*)\1$/)?.[2] ?? raw;
}

const semver = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

async function bootstrapRemediation(root: string, fallback: string): Promise<string> {
  const script = await readLocalFile(root, "scripts/bootstrap-agents.ps1");
  return script.kind === "file" ? "pwsh -File ./scripts/bootstrap-agents.ps1" : fallback;
}

export async function diagnoseBreakdownStack(root: string): Promise<DoctorResult[]> {
  const codegraphDatabase = await readLocalFile(root, ".codegraph/codegraph.db");
  const codegraphHealthy = codegraphDatabase.kind === "file"
    && codegraphDatabase.content.subarray(0, 16).equals(Buffer.from("SQLite format 3\0"));
  const codegraph: DoctorResult = {
    id: "codegraph.exists",
    status: codegraphHealthy ? "ok" : codegraphDatabase.kind === "error" ? "fail" : "warn",
    message: codegraphHealthy ? "CodeGraph SQLite index is readable" : "CodeGraph index is missing or invalid",
    evidence: evidence(".codegraph/codegraph.db", codegraphDatabase),
    remediation: codegraphHealthy ? "No action required" : "npx @colbymchenry/codegraph init -i",
  };

  const bmadPath = "_bmad/bmm/config.yaml";
  const bmadConfig = await readLocalFile(root, bmadPath);
  const rawBmadVersion = text(bmadConfig)?.match(/^# Version:\s*(\S+)/m)?.[1];
  const bmadVersion = rawBmadVersion && semver.test(rawBmadVersion) ? rawBmadVersion : undefined;
  const bmad: DoctorResult = {
    id: "bmad.exists",
    status: bmadVersion ? "ok" : bmadConfig.kind === "error" ? "fail" : "warn",
    message: bmadVersion ? `BMAD ${bmadVersion} is configured` : "BMAD version metadata is missing or malformed",
    ...(bmadVersion ? { version: bmadVersion } : {}),
    evidence: evidence(bmadPath, bmadConfig),
    remediation: bmadVersion ? "No action required" : await bootstrapRemediation(root, "Install BMAD with its canonical project command"),
  };

  const skillResult = async (name: "caveman" | "ponytail"): Promise<DoctorResult> => {
    const path = `.agents/skills/${name}/SKILL.md`;
    const skill = await readLocalFile(root, path);
    const content = text(skill);
    const detectedName = frontmatterValue(content, "name");
    const rawVersion = frontmatterValue(content, "version");
    const valid = detectedName === name;
    const version = valid && rawVersion && semver.test(rawVersion) ? rawVersion : undefined;
    return {
      id: `${name}.exists`,
      status: valid ? "ok" : skill.kind === "error" ? "fail" : "warn",
      message: valid ? `${name} project skill is configured` : `${name} project skill is missing or malformed`,
      ...(version ? { version } : {}),
      evidence: evidence(path, skill),
      remediation: valid ? "No action required" : await bootstrapRemediation(root, `Install ${name} with its canonical project command`),
    };
  };

  return [codegraph, bmad, await skillResult("caveman"), await skillResult("ponytail")];
}

export async function installFiles(
  root: string,
  operations: readonly FileOperation[],
  dryRun = false,
): Promise<FileAction[]> {
  const actions: FileAction[] = [];

  for (const operation of operations) {
    const target = join(root, operation.target);
    if (await exists(target)) {
      actions.push({ ...operation, action: "skip" });
      continue;
    }

    actions.push({ ...operation, action: "create" });
    if (!dryRun) {
      await mkdir(dirname(target), { recursive: true });
      await copyFile(operation.source, target);
    }
  }

  return actions;
}

export async function checkFiles(
  root: string,
  requirements: readonly { id: string; path: string; severity: "warn" | "fail" }[],
): Promise<DoctorResult[]> {
  return Promise.all(requirements.map(async (requirement) => {
    const found = await exists(join(root, requirement.path));
    return {
      id: requirement.id,
      status: found ? "ok" : requirement.severity,
      message: found ? `${requirement.path} exists` : `${requirement.path} is missing`,
    };
  }));
}

export async function inspectProject(root: string): Promise<ProjectInspection> {
  const entries = await readdir(root, { withFileTypes: true });
  const names = new Set(entries.map((entry) => entry.name));
  const signals: string[] = [];
  const stacks = new Set<string>();
  let scripts: string[] = [];

  if (names.has("AGENTS.md") || names.has("CLAUDE.md")) signals.push("agent-instructions");
  if (names.has("_bmad") || names.has("_bmad-output")) signals.push("bmad");
  if (names.has(".codegraph")) signals.push("codegraph");

  if (names.has("package.json")) {
    const manifest = JSON.parse(await readFile(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    scripts = Object.keys(manifest.scripts ?? {});
    const dependencies = { ...manifest.dependencies, ...manifest.devDependencies };
    stacks.add("Node.js");
    if (dependencies.typescript) stacks.add("TypeScript");
    if (dependencies.next) stacks.add("Next.js");
    if (dependencies.expo) stacks.add("Expo");
    if (dependencies["react-native"]) stacks.add("React Native");
    if (dependencies.react) stacks.add("React");
    if (dependencies["@nestjs/core"]) stacks.add("NestJS");
    if (dependencies.express) stacks.add("Express");
    signals.push("node-manifest");
  }

  if (entries.some((entry) => entry.name.endsWith(".sln") || entry.name.endsWith(".csproj"))) stacks.add(".NET");
  if (names.has("next.config.js") || names.has("next.config.mjs") || names.has("next.config.ts")) stacks.add("Next.js");
  if (names.has("app.json") || names.has("app.config.js") || names.has("app.config.ts")) stacks.add("Expo");

  const sourceDirs = ["app", "src", "pages", "apps"].filter((name) => names.has(name));
  const hasManifest = signals.includes("node-manifest") || stacks.has(".NET");
  const stage = entries.length === 0
    ? "empty"
    : sourceDirs.length > 0
      ? "implemented"
      : hasManifest
        ? "scaffolded"
        : signals.length > 0 || names.has("docs")
          ? "documented"
          : "scaffolded";

  return {
    stage,
    stacks: [...stacks].sort(),
    scripts: scripts.sort(),
    signals,
    originInference: signals.includes("agent-instructions") || signals.includes("bmad")
      ? "AI-assisted workflow artifacts found; prompting origin cannot be proven from files alone."
      : "No AI-assisted workflow artifacts detected; project origin is unknown.",
  };
}

export async function runProjectChecks(root: string, scripts: readonly string[]): Promise<ProjectVerification> {
  const selected = ["typecheck", "test", "build"].filter((script) => scripts.includes(script));
  if (selected.length === 0) return { status: "not-run", checks: [] };

  const checks: { script: string; exitCode: number }[] = [];
  for (const script of selected) {
    const exitCode = await new Promise<number>((resolve, reject) => {
      const command = process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : "npm";
      const args = process.platform === "win32"
        ? ["/d", "/s", "/c", "npm.cmd", "run", script]
        : ["run", script];
      const child = spawn(command, args, {
        cwd: root,
        shell: false,
        stdio: "ignore",
      });
      child.once("error", reject);
      child.once("exit", (code) => resolve(code ?? 1));
    });
    checks.push({ script, exitCode });
    if (exitCode !== 0) return { status: "failed", checks };
  }

  return { status: "verified", checks };
}
