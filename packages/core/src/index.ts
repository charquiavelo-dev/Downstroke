import { access, copyFile, mkdir, readFile, readdir, realpath, rename, stat, writeFile } from "node:fs/promises";
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

export type BreakdownInstallPlan = {
  status: "ready" | "blocked" | "noop";
  tools: string[];
  command: string;
  files: string[];
  mutations: string[];
  blockers: string[];
};

export type BootstrapExecutor = (root: string) => Promise<number>;

export const cadenceChoices = ["one-at-a-time", "blocks", "sprint", "final-draft"] as const;
export type ReviewMode = typeof cadenceChoices[number];
export type PlanningCadence = {
  reviewMode: ReviewMode;
  blockSize?: number;
  sprintLengthDays?: number;
  workingDays?: string[];
  capacityHoursPerDay?: number;
  capacityHoursPerWeek?: number;
  grossCapacityHoursPerSprint?: number;
  wipLimit?: number;
  highRiskReview: "individual";
  lastReviewedStory: string | null;
};
export type CadencePlan = {
  status: "ready" | "blocked";
  files: [".downstroke/planning.json", "docs/SPEC.md"];
  next: PlanningCadence;
  blockers: string[];
};

export type DecisionKind = "deterministic" | "contextual" | "high-risk";
export type DecisionGovernance = {
  status: "ready" | "needs-input" | "approved" | "blocked";
  requiresAuthorization: boolean;
  responsibilities: { user: "approves"; llm: "advises"; cli: "executes"; repository: "records"; provider: "applies infrastructure" };
  questions: string[];
  blockers: string[];
  selectedOption?: string;
};

const expectedBmadVersion = "6.9.0";

const responsibilities = {
  user: "approves",
  llm: "advises",
  cli: "executes",
  repository: "records",
  provider: "applies infrastructure",
} as const;

export function governDecision(input: {
  kind: DecisionKind;
  mutates: boolean;
  options?: unknown[];
  selectedOption?: string;
  scope?: string;
  owner?: string;
  environment?: string;
  risk?: string;
  rollback?: string;
}): DecisionGovernance {
  const questions: string[] = [];
  const blockers: string[] = [];

  if (input.kind === "contextual") {
    if (!input.options || input.options.length < 2) questions.push("Provide at least two options with rationale, tradeoffs and affected artifacts.");
    else {
      const declaredIds: string[] = [];
      for (const value of input.options) {
        const option = typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
        const id = typeof option.id === "string" ? option.id : "";
        const rationale = typeof option.rationale === "string" ? option.rationale : "";
        const tradeoffs = Array.isArray(option.tradeoffs) && option.tradeoffs.every((item) => typeof item === "string") ? option.tradeoffs : [];
        const artifacts = Array.isArray(option.artifacts) && option.artifacts.every((item) => typeof item === "string") ? option.artifacts : [];
        if (!id || !rationale || tradeoffs.length === 0 || artifacts.length === 0) {
          blockers.push(`Option ${id || "<missing-id>"} is incomplete`);
        } else if (artifacts.some((artifact) => isAbsolute(artifact) || /^(?:\.\.[/\\]|[/\\])/.test(artifact))) {
          blockers.push(`Option ${id} contains a non-repository-relative artifact`);
        }
        if (id) declaredIds.push(id);
      }
      if (new Set(declaredIds).size !== declaredIds.length) blockers.push("Option IDs must be unique");
      if (!input.selectedOption) questions.push("Which declared option do you approve?");
      else if (!declaredIds.includes(input.selectedOption)) blockers.push("Selected option is not declared");
    }
  }

  if (input.kind === "high-risk") {
    if (!input.scope) questions.push("What is the exact scope?");
    if (!input.owner) questions.push("Who owns the decision?");
    if (!input.environment) questions.push("Which environment is affected?");
    if (!input.risk) questions.push("What is the material risk?");
    if (!input.rollback) questions.push("What is the rollback plan?");
  }

  return {
    status: blockers.length ? "blocked" : questions.length ? "needs-input" : input.kind === "contextual" ? "approved" : "ready",
    requiresAuthorization: input.mutates || input.kind !== "deterministic",
    responsibilities,
    questions,
    blockers,
    ...(input.kind === "contextual" && blockers.length === 0 && questions.length === 0 ? { selectedOption: input.selectedOption } : {}),
  };
}

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

export async function planBreakdownStack(
  root: string,
  environment: Readonly<Record<string, string | undefined>> = process.env,
): Promise<BreakdownInstallPlan> {
  const results = await diagnoseBreakdownStack(root);
  const script = await readLocalFile(root, "scripts/bootstrap-agents.ps1");
  const blockers = results
    .filter((result) => result.status !== "ok" && !result.evidence?.endsWith(" not found"))
    .map((result) => `${result.id}: ${result.message}; manual review required`);
  const bmad = results.find((result) => result.id === "bmad.exists");
  if (bmad?.status === "ok" && bmad.version !== expectedBmadVersion) {
    blockers.push(`bmad.exists: expected ${expectedBmadVersion}, found ${bmad.version}; manual review required`);
  }
  if (script.kind !== "file") blockers.push(`scripts/bootstrap-agents.ps1: ${evidence("scripts/bootstrap-agents.ps1", script)}`);

  const missing = results.filter((result) => result.status !== "ok" && result.evidence?.endsWith(" not found"));
  if (missing.some((result) => result.id === "ponytail.exists") && !environment.PONYTAIL_INSTALL_COMMAND) {
    blockers.push("ponytail.exists: set PONYTAIL_INSTALL_COMMAND to the canonical install command");
  }

  const tools = missing.map((result) => result.id.split(".")[0] ?? result.id);
  return {
    status: blockers.length > 0 ? "blocked" : tools.length === 0 ? "noop" : "ready",
    tools,
    command: `${process.platform === "win32" ? "powershell.exe" : "pwsh"} -NoProfile -File ./scripts/bootstrap-agents.ps1`,
    files: [
      "scripts/bootstrap-agents.ps1",
      ...missing.map((result) => result.evidence?.replace(/ not found$/, "") ?? result.id),
    ],
    mutations: tools.map((tool) => `install missing ${tool} repository evidence`),
    blockers,
  };
}

const executeBootstrap: BootstrapExecutor = async (root) => new Promise<number>((resolve, reject) => {
  const command = process.platform === "win32" ? "powershell.exe" : "pwsh";
  const child = spawn(command, ["-NoProfile", "-File", "./scripts/bootstrap-agents.ps1"], {
    cwd: root,
    env: process.env,
    shell: false,
    stdio: "inherit",
  });
  child.once("error", reject);
  child.once("exit", (code) => resolve(code ?? 1));
});

export async function applyBreakdownStack(
  root: string,
  plan: BreakdownInstallPlan,
  execute: BootstrapExecutor = executeBootstrap,
): Promise<{ status: "verified" | "failed" | "blocked"; exitCode: number; results: DoctorResult[] }> {
  if (plan.status === "blocked") return { status: "blocked", exitCode: 1, results: await diagnoseBreakdownStack(root) };
  if (plan.status === "noop") return { status: "verified", exitCode: 0, results: await diagnoseBreakdownStack(root) };
  const exitCode = await execute(root);
  const results = await diagnoseBreakdownStack(root);
  const verified = exitCode === 0
    && results.every((result) => result.status === "ok")
    && results.find((result) => result.id === "bmad.exists")?.version === expectedBmadVersion;
  return { status: verified ? "verified" : "failed", exitCode: verified ? 0 : exitCode || 1, results };
}

function positiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

function parseCadence(value: unknown): PlanningCadence | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const input = value as Record<string, unknown>;
  const legacyModes: Record<string, ReviewMode> = {
    "una-a-una": "one-at-a-time",
    bloques: "blocks",
    "por-sprint": "sprint",
    "solo-al-final": "final-draft",
  };
  const reviewMode = cadenceChoices.includes(input.reviewMode as ReviewMode)
    ? input.reviewMode as ReviewMode
    : typeof input.reviewMode === "string" ? legacyModes[input.reviewMode] : undefined;
  if (!reviewMode) return undefined;
  const cadence: PlanningCadence = {
    reviewMode,
    highRiskReview: "individual",
    lastReviewedStory: typeof input.lastReviewedStory === "string" ? input.lastReviewedStory : null,
  };
  if (positiveInteger(input.blockSize)) cadence.blockSize = input.blockSize;
  if (positiveInteger(input.sprintLengthDays)) cadence.sprintLengthDays = input.sprintLengthDays;
  if (Array.isArray(input.workingDays) && input.workingDays.every((day) => typeof day === "string")) cadence.workingDays = input.workingDays;
  if (positiveInteger(input.capacityHoursPerDay)) cadence.capacityHoursPerDay = input.capacityHoursPerDay;
  if (positiveInteger(input.capacityHoursPerWeek)) cadence.capacityHoursPerWeek = input.capacityHoursPerWeek;
  if (positiveInteger(input.grossCapacityHoursPerSprint)) cadence.grossCapacityHoursPerSprint = input.grossCapacityHoursPerSprint;
  if (positiveInteger(input.wipLimit)) cadence.wipLimit = input.wipLimit;
  if (input.highRiskReview !== undefined && input.highRiskReview !== "individual") return undefined;
  if (reviewMode === "blocks" && cadence.blockSize === undefined) return undefined;
  if (reviewMode === "sprint" && (cadence.sprintLengthDays === undefined || cadence.grossCapacityHoursPerSprint === undefined || cadence.wipLimit === undefined)) return undefined;
  return cadence;
}

export async function readPlanningCadence(root: string): Promise<PlanningCadence | null> {
  const state = await readLocalFile(root, ".downstroke/planning.json");
  if (state.kind === "missing") return null;
  if (state.kind !== "file") throw new Error(`Cannot read planning cadence (${state.code})`);
  try {
    const cadence = parseCadence(JSON.parse(state.content.toString("utf8")) as unknown);
    if (!cadence) throw new Error("Planning cadence is malformed");
    return cadence;
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Planning cadence is malformed") throw error;
    throw new Error("Planning cadence is malformed");
  }
}

export async function planCadenceUpdate(
  root: string,
  input: Omit<PlanningCadence, "highRiskReview" | "lastReviewedStory">,
): Promise<CadencePlan> {
  const blockers: string[] = [];
  if (input.reviewMode === "blocks" && !positiveInteger(input.blockSize)) blockers.push("blockSize must be a positive integer");
  if (input.reviewMode === "sprint") {
    if (!positiveInteger(input.sprintLengthDays)) blockers.push("sprintLengthDays must be a positive integer");
    if (!positiveInteger(input.grossCapacityHoursPerSprint)) blockers.push("grossCapacityHoursPerSprint must be a positive integer");
    if (!positiveInteger(input.wipLimit)) blockers.push("wipLimit must be a positive integer");
  }
  let previous: PlanningCadence | null = null;
  try {
    previous = await readPlanningCadence(root);
  } catch (error: unknown) {
    blockers.push(error instanceof Error ? error.message : "Planning cadence is unreadable");
  }
  const next: PlanningCadence = {
    reviewMode: input.reviewMode,
    ...(input.reviewMode === "blocks" ? { blockSize: input.blockSize } : {}),
    ...(input.reviewMode === "sprint" ? {
      sprintLengthDays: input.sprintLengthDays,
      ...(previous?.workingDays ? { workingDays: previous.workingDays } : {}),
      ...(previous?.capacityHoursPerDay ? { capacityHoursPerDay: previous.capacityHoursPerDay } : {}),
      ...(previous?.capacityHoursPerWeek ? { capacityHoursPerWeek: previous.capacityHoursPerWeek } : {}),
      grossCapacityHoursPerSprint: input.grossCapacityHoursPerSprint,
      wipLimit: input.wipLimit,
    } : {}),
    highRiskReview: "individual",
    lastReviewedStory: previous?.lastReviewedStory ?? null,
  };
  if (blockers.length === 0) {
    const spec = await readLocalFile(root, "docs/SPEC.md");
    if (spec.kind !== "file") blockers.push(`docs/SPEC.md: ${evidence("docs/SPEC.md", spec)}`);
    else {
      try {
        updateCadenceSpec(spec.content.toString("utf8"), next);
      } catch (error: unknown) {
        blockers.push(error instanceof Error ? error.message : "docs/SPEC.md cannot be updated safely");
      }
    }
  }
  return {
    status: blockers.length ? "blocked" : "ready",
    files: [".downstroke/planning.json", "docs/SPEC.md"],
    next,
    blockers,
  };
}

function cadenceSpecLines(cadence: PlanningCadence): string[] {
  const workingDays = cadence.workingDays?.join(", ") === "monday, tuesday, wednesday, thursday, friday"
    ? "Monday through Friday"
    : cadence.workingDays?.join(", ");
  const sprintLength = cadence.sprintLengthDays === undefined
    ? "not-applicable"
    : workingDays
      ? `${cadence.sprintLengthDays} working days, ${workingDays}`
      : String(cadence.sprintLengthDays);
  const capacity = cadence.grossCapacityHoursPerSprint === undefined
    ? "not-applicable"
    : cadence.capacityHoursPerDay && cadence.capacityHoursPerWeek
      ? `${cadence.capacityHoursPerDay} hours/day, ${cadence.capacityHoursPerWeek} hours/week, ${cadence.grossCapacityHoursPerSprint} hours/sprint`
      : String(cadence.grossCapacityHoursPerSprint);
  return [
    `- Review mode: \`${cadence.reviewMode}\``,
    `- Block size when applicable: \`${cadence.blockSize ?? "not-applicable"}\``,
    `- Sprint length: \`${sprintLength}\``,
    `- Gross capacity: \`${capacity}\``,
    `- WIP limit: \`${cadence.wipLimit ?? "not-applicable"}\``,
    "- High-risk review: `individual`",
  ];
}

function cadenceSpecBounds(content: string): { start: number; end: number } | undefined {
  const start = content.indexOf("## BMAD Governance");
  const end = start < 0 ? -1 : content.indexOf("\n## ", start + 3);
  return start < 0 || end < 0 ? undefined : { start, end };
}

function updateCadenceSpec(content: string, cadence: PlanningCadence): string {
  const bounds = cadenceSpecBounds(content);
  if (!bounds) throw new Error("docs/SPEC.md has no bounded BMAD Governance section");
  const { start, end } = bounds;
  let section = content.slice(start, end);
  const patterns = [
    /^- Review mode:.*$/m,
    /^- Block size when applicable:.*$/m,
    /^- Sprint length:.*$/m,
    /^- Gross capacity:.*$/m,
    /^- WIP limit:.*$/m,
  ];
  const lines = cadenceSpecLines(cadence);
  for (let index = 0; index < patterns.length; index += 1) {
    if (!patterns[index]?.test(section)) throw new Error("docs/SPEC.md BMAD Governance fields are incomplete");
    section = section.replace(patterns[index]!, lines[index]!);
  }
  section = /^- High-risk review:.*$/m.test(section)
    ? section.replace(/^- High-risk review:.*$/m, lines[5]!)
    : section.replace(lines[4]!, `${lines[4]}\n${lines[5]}`);
  return content.slice(0, start) + section + content.slice(end);
}

export async function diagnosePlanningCadence(root: string): Promise<DoctorResult> {
  let cadence: PlanningCadence | null;
  try {
    cadence = await readPlanningCadence(root);
  } catch (error: unknown) {
    return { id: "planning.cadence", status: "fail", message: error instanceof Error ? error.message : "Planning cadence is unreadable", evidence: ".downstroke/planning.json", remediation: "Run downstroke cadence with valid options" };
  }
  if (!cadence) return { id: "planning.cadence", status: "warn", message: "Planning cadence is not configured", evidence: ".downstroke/planning.json not found", remediation: "Run downstroke cadence" };
  const spec = await readLocalFile(root, "docs/SPEC.md");
  if (spec.kind !== "file") return { id: "planning.cadence", status: "fail", message: "Planning cadence cannot be verified against docs/SPEC.md", evidence: evidence("docs/SPEC.md", spec), remediation: "Restore docs/SPEC.md and run downstroke cadence" };
  const specContent = spec.content.toString("utf8");
  const bounds = cadenceSpecBounds(specContent);
  const section = bounds ? specContent.slice(bounds.start, bounds.end) : "";
  const matches = cadenceSpecLines(cadence).every((line) => section.includes(line));
  return {
    id: "planning.cadence",
    status: matches ? "ok" : "fail",
    message: matches ? `Planning cadence is synchronized (${cadence.reviewMode})` : "Planning cadence differs from docs/SPEC.md",
    evidence: ".downstroke/planning.json + docs/SPEC.md",
    remediation: matches ? "No action required" : "Preview and apply downstroke cadence again",
  };
}

export async function applyCadenceUpdate(root: string, plan: CadencePlan): Promise<DoctorResult> {
  if (plan.status === "blocked") return { id: "planning.cadence", status: "fail", message: plan.blockers.join("; "), remediation: "Correct the cadence options" };
  const spec = await readLocalFile(root, "docs/SPEC.md");
  if (spec.kind !== "file") return { id: "planning.cadence", status: "fail", message: "docs/SPEC.md is missing or unreadable", evidence: evidence("docs/SPEC.md", spec), remediation: "Restore docs/SPEC.md" };
  let updatedSpec: string;
  try {
    updatedSpec = updateCadenceSpec(spec.content.toString("utf8"), plan.next);
  } catch (error: unknown) {
    return { id: "planning.cadence", status: "fail", message: error instanceof Error ? error.message : "docs/SPEC.md cannot be updated safely", evidence: "docs/SPEC.md", remediation: "Restore the BMAD Governance section" };
  }
  const statePath = join(root, ".downstroke", "planning.json");
  const specPath = join(root, "docs", "SPEC.md");
  await mkdir(dirname(statePath), { recursive: true });
  await writeFile(`${statePath}.tmp`, `${JSON.stringify(plan.next, null, 2)}\n`);
  await writeFile(`${specPath}.tmp`, updatedSpec);
  await rename(`${statePath}.tmp`, statePath);
  await rename(`${specPath}.tmp`, specPath);
  return diagnosePlanningCadence(root);
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
