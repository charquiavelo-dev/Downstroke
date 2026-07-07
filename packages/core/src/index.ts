import { access, appendFile, copyFile, mkdir, open, readFile, readdir, realpath, rename, stat, unlink, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative } from "node:path";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";

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
export type TokenEstimate = {
  scope: "task" | "backlog" | "sprint";
  range: { low: number; high: number };
  modelAssumption: string;
  includedContext: string[];
  uncertainty: "high";
};

export type GitPermission = {
  enabled: boolean;
  scope: "repository";
  lifetime: "project";
  requiresFreshAuthorization: boolean;
};
export type GitPolicy = {
  schemaVersion: 1;
  revision: number;
  enabled: boolean;
  strategy: "gitflow";
  branches: { main: "main"; develop: "develop"; feature: "feature/*"; release: "release/*"; hotfix: "hotfix/*" };
  permissions: { branch: GitPermission; commit: GitPermission; push: GitPermission };
};
export type GitPolicyPlan = {
  status: "ready" | "blocked";
  root: ".";
  file: ".downstroke/git-policy.json";
  currentBranch: string | null;
  head: string | null;
  createBranches: string[];
  expectedRevision: number;
  next: GitPolicy;
  blockers: string[];
};

export const experienceManifest = {
  schemaVersion: "0.1.0",
  module: "downstroke-experience",
  status: "experimental",
  storage: { driver: "local-jsonl", path: ".downstroke/experience" },
  security: {
    defaultTrust: "untrusted",
    allowNetwork: false,
    allowShell: false,
    allowWriteOutsideManagedBlocks: false,
    secretScanning: true,
    promptInjectionScanning: true,
    quarantineSuspiciousContext: true,
  },
  performance: {
    maxContextTokens: 12000,
    maxMemoryItemsPerContext: 40,
    enableFileHashCache: true,
    enableIncrementalSnapshots: true,
    enableEmbeddings: false,
  },
  verification: {
    verifiedRequiresExecution: true,
    acceptedEvidenceTypes: ["command_exit_code", "file_hash", "git_status", "test_report", "typecheck_report", "build_report", "lint_report", "manual_approval"],
  },
  bridges: {
    enabled: false,
    defaultOutputTrust: "external",
    requireCapabilityDeclaration: true,
    requireDescriptorHash: true,
    allowWriteCapabilities: false,
    allowNetworkCapabilities: false,
    allowSecretCapabilities: false,
  },
} as const;

export type ExperienceFact = {
  id: string;
  kind: "stack" | "dependency" | "rule" | "decision" | "risk" | "gate" | "script" | "integration" | "repo" | "qa" | "security";
  scope: "repo" | "workspace" | "module" | "file" | "org";
  status: "unknown" | "observed" | "inferred" | "verified" | "stale" | "conflicted" | "quarantined" | "rejected";
  value: unknown;
  source: { type: "file" | "command" | "git" | "manifest" | "managed-block" | "user-input" | "llm-output" | "external-tool" | "bridge"; path?: string; command?: string; hash?: string; bridgeId?: string };
  confidence: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  evidence?: { type: typeof experienceManifest.verification.acceptedEvidenceTypes[number]; ref: string };
  security: { trustLevel: "trusted" | "project" | "generated" | "external" | "untrusted"; secretScan: "passed" | "failed" | "not_run"; injectionScan: "passed" | "failed" | "not_run" };
};

export type ExperienceFactPlan = { status: "ready" | "blocked"; action: "append" | "skip"; fact: ExperienceFact | null; blockers: string[] };

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

export async function estimateTokenUsage(root: string, scope: TokenEstimate["scope"], paths: readonly string[]): Promise<TokenEstimate> {
  if (paths.length === 0) throw new Error("At least one --path is required");
  let characters = 0;
  for (const path of paths) {
    const file = await readLocalFile(root, path);
    if (file.kind !== "file") throw new Error(`${path}: ${evidence(path, file)}`);
    characters += file.content.toString("utf8").length;
    if (characters > 1_000_000) throw new Error("Selected context exceeds the 1,000,000 character limit");
  }
  return {
    scope,
    range: { low: Math.ceil(characters / 5), high: Math.ceil(characters / 3) },
    modelAssumption: "generic text estimate at 3-5 characters per token",
    includedContext: [...paths],
    uncertainty: "high",
  };
}

export function tokenUsageStatus(estimate: TokenEstimate, consumedTokens?: number): {
  consumedTokens: number | "unavailable";
  projectedRemainingTokens: TokenEstimate["range"];
  estimate: TokenEstimate;
} {
  if (consumedTokens !== undefined && (!Number.isInteger(consumedTokens) || consumedTokens < 0)) throw new Error("consumedTokens must be a non-negative integer");
  return { consumedTokens: consumedTokens ?? "unavailable", projectedRemainingTokens: estimate.range, estimate };
}

const gitBranches = { main: "main", develop: "develop", feature: "feature/*", release: "release/*", hotfix: "hotfix/*" } as const;

function permission(enabled: boolean, fresh = false): GitPermission {
  return { enabled, scope: "repository", lifetime: "project", requiresFreshAuthorization: fresh };
}

function parseGitPolicy(value: unknown): GitPolicy | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const input = value as Record<string, unknown>;
  const permissions = typeof input.permissions === "object" && input.permissions !== null ? input.permissions as Record<string, unknown> : {};
  const exactKeys = (value: Record<string, unknown>, keys: readonly string[]) => Object.keys(value).sort().join() === [...keys].sort().join();
  const validPermission = (value: unknown, fresh: boolean): value is GitPermission => {
    if (typeof value !== "object" || value === null) return false;
    const item = value as Record<string, unknown>;
    return exactKeys(item, ["enabled", "scope", "lifetime", "requiresFreshAuthorization"])
      && typeof item.enabled === "boolean" && item.scope === "repository" && item.lifetime === "project" && item.requiresFreshAuthorization === fresh;
  };
  if (!exactKeys(input, ["schemaVersion", "revision", "enabled", "strategy", "branches", "permissions"])) return undefined;
  if (input.schemaVersion !== 1 || !Number.isSafeInteger(input.revision) || !positiveInteger(input.revision) || typeof input.enabled !== "boolean" || input.strategy !== "gitflow") return undefined;
  if (typeof input.branches !== "object" || input.branches === null) return undefined;
  const branches = input.branches as Record<string, unknown>;
  if (!exactKeys(branches, Object.keys(gitBranches)) || Object.entries(gitBranches).some(([key, expected]) => branches[key] !== expected)) return undefined;
  if (!exactKeys(permissions, ["branch", "commit", "push"])) return undefined;
  if (!validPermission(permissions.branch, false) || !validPermission(permissions.commit, false) || !validPermission(permissions.push, true)) return undefined;
  return {
    schemaVersion: 1,
    revision: input.revision as number,
    enabled: input.enabled,
    strategy: "gitflow",
    branches: gitBranches,
    permissions: {
      branch: permission(permissions.branch.enabled),
      commit: permission(permissions.commit.enabled),
      push: permission(permissions.push.enabled, true),
    },
  };
}

function runGit(root: string, args: readonly string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn("git", ["-C", root, ...args], { shell: false, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk: string) => { stdout += chunk; });
    child.stderr.setEncoding("utf8").on("data", (chunk: string) => { stderr += chunk; });
    child.once("error", (error) => resolve({ code: 1, stdout, stderr: error.message }));
    child.once("exit", (code) => resolve({ code: code ?? 1, stdout: stdout.trim(), stderr: stderr.trim() }));
  });
}

async function gitRoot(root: string): Promise<string> {
  const result = await runGit(root, ["rev-parse", "--show-toplevel"]);
  if (result.code !== 0 || !result.stdout) throw new Error(result.stderr || "Not a Git repository");
  return realpath(result.stdout);
}

export async function readGitPolicy(root: string): Promise<GitPolicy | null> {
  const resolved = await gitRoot(root);
  const state = await readLocalFile(resolved, ".downstroke/git-policy.json");
  if (state.kind === "missing") return null;
  if (state.kind !== "file") throw new Error(`Cannot read Git policy (${state.code})`);
  try {
    const policy = parseGitPolicy(JSON.parse(state.content.toString("utf8")) as unknown);
    if (!policy) throw new Error("Git policy is malformed");
    return policy;
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Git policy is malformed") throw error;
    throw new Error("Git policy is malformed");
  }
}

export async function planGitPolicy(root: string, input: { enabled: boolean; branch: boolean; commit: boolean; push: boolean }): Promise<GitPolicyPlan> {
  const blockers: string[] = [];
  let resolved = root;
  let currentBranch: string | null = null;
  let head: string | null = null;
  let previous: GitPolicy | null = null;
  try {
    resolved = await gitRoot(root);
    const branch = await runGit(resolved, ["symbolic-ref", "--quiet", "--short", "HEAD"]);
    const revision = await runGit(resolved, ["rev-parse", "HEAD"]);
    if (branch.code !== 0) blockers.push("Detached or unborn HEAD is not supported");
    else currentBranch = branch.stdout;
    if (revision.code !== 0) blockers.push("Repository has no commit to anchor GitFlow branches");
    else head = revision.stdout;
    previous = await readGitPolicy(resolved);
  } catch (error: unknown) {
    blockers.push(error instanceof Error ? error.message : "Git repository cannot be inspected");
  }
  const expectedRevision = previous?.revision ?? 0;
  const next: GitPolicy = {
    schemaVersion: 1,
    revision: expectedRevision + 1,
    enabled: input.enabled,
    strategy: "gitflow",
    branches: gitBranches,
    permissions: {
      branch: permission(input.enabled && input.branch),
      commit: permission(input.enabled && input.commit),
      push: permission(input.enabled && input.push, true),
    },
  };
  const createBranches: string[] = [];
  if (input.enabled && head && blockers.length === 0) {
    for (const branch of ["main", "develop"] as const) {
      const found = await runGit(resolved, ["show-ref", "--verify", "--quiet", `refs/heads/${branch}`]);
      if (found.code === 1) createBranches.push(branch);
      else if (found.code !== 0) blockers.push(`Cannot inspect ${branch}: ${found.stderr || `git exited ${found.code}`}`);
    }
  }
  return { status: blockers.length ? "blocked" : "ready", root: ".", file: ".downstroke/git-policy.json", currentBranch, head, createBranches, expectedRevision, next, blockers };
}

export async function applyGitPolicy(root: string, plan: GitPolicyPlan): Promise<DoctorResult> {
  if (plan.status === "blocked" || !plan.head) return { id: "git.policy", status: "fail", message: plan.blockers.join("; ") || "Git policy plan is blocked", remediation: "Correct the Git policy plan" };
  const normalized = parseGitPolicy(plan.next);
  if (!normalized || JSON.stringify(normalized) !== JSON.stringify(plan.next) || plan.root !== "." || plan.file !== ".downstroke/git-policy.json"
    || plan.createBranches.some((branch) => branch !== "main" && branch !== "develop")
    || new Set(plan.createBranches).size !== plan.createBranches.length) {
    return { id: "git.policy", status: "fail", message: "Git policy plan is malformed", remediation: "Preview the Git policy again" };
  }
  let lock: Awaited<ReturnType<typeof open>> | undefined;
  let lockPath = "";
  let temporary = "";
  const created: string[] = [];
  try {
    const resolved = await gitRoot(root);
    const statePath = join(resolved, ".downstroke", "git-policy.json");
    lockPath = `${statePath}.lock`;
    await mkdir(dirname(statePath), { recursive: true });
    try {
      lock = await open(lockPath, "wx");
    } catch {
      return { id: "git.policy", status: "fail", message: "Another Git policy apply is in progress", remediation: "Wait and preview the policy again" };
    }
    const fresh = await planGitPolicy(resolved, {
      enabled: plan.next.enabled,
      branch: plan.next.permissions.branch.enabled,
      commit: plan.next.permissions.commit.enabled,
      push: plan.next.permissions.push.enabled,
    });
    if (JSON.stringify(fresh) !== JSON.stringify(plan)) {
      return { id: "git.policy", status: "fail", message: "Git state changed after preview", remediation: "Preview the Git policy again" };
    }
    for (const branch of plan.createBranches) {
      const result = await runGit(resolved, ["branch", branch, plan.head]);
      if (result.code !== 0) throw new Error(`Cannot create ${branch}: ${result.stderr || `git exited ${result.code}`}`);
      created.push(branch);
    }
    temporary = `${statePath}.${process.pid}.${randomUUID()}.tmp`;
    const output = await open(temporary, "wx");
    try {
      await output.writeFile(`${JSON.stringify(plan.next, null, 2)}\n`);
    } finally {
      await output.close();
    }
    await rename(temporary, statePath);
    temporary = "";
    const verified = await readGitPolicy(resolved);
    return JSON.stringify(verified) === JSON.stringify(plan.next)
      ? { id: "git.policy", status: "ok", message: `Git policy is ${plan.next.enabled ? "enabled" : "disabled"}`, evidence: ".downstroke/git-policy.json", remediation: "No action required" }
      : { id: "git.policy", status: "fail", message: "Git policy verification failed", remediation: "Preview and apply the policy again" };
  } catch (error: unknown) {
    return {
      id: "git.policy",
      status: "fail",
      message: error instanceof Error ? error.message : "Git policy apply failed",
      ...(created.length ? { evidence: `Created branches preserved: ${created.join(", ")}` } : {}),
      remediation: "Inspect repository state and preview the policy again",
    };
  } finally {
    if (temporary) await unlink(temporary).catch(() => undefined);
    if (lock) {
      await lock.close().catch(() => undefined);
      await unlink(lockPath).catch(() => undefined);
    }
  }
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

const experienceFiles = [
  ["evidence", "directory"], ["quarantine", "directory"], ["indexes", "directory"],
  ["manifest.json", "file"], ["facts.jsonl", "file"], ["evidence.jsonl", "file"], ["indexes/facts-by-id.json", "file"],
] as const;

function safeExperiencePath(path: string): boolean {
  return path.length > 0 && !path.includes("\\") && !isAbsolute(path) && !path.split("/").includes("..");
}

function parseExperienceFact(value: unknown): ExperienceFact | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const input = value as Record<string, unknown>;
  const allowed = ["id", "kind", "scope", "status", "value", "source", "confidence", "createdAt", "updatedAt", "expiresAt", "evidence", "security"];
  if (Object.keys(input).some((key) => !allowed.includes(key))) return undefined;
  const kinds = ["stack", "dependency", "rule", "decision", "risk", "gate", "script", "integration", "repo", "qa", "security"];
  const scopes = ["repo", "workspace", "module", "file", "org"];
  const statuses = ["unknown", "observed", "inferred", "verified", "stale", "conflicted", "quarantined", "rejected"];
  if (typeof input.id !== "string" || !/^[A-Za-z0-9._:-]+$/.test(input.id) || !kinds.includes(String(input.kind)) || !scopes.includes(String(input.scope)) || !statuses.includes(String(input.status))) return undefined;
  if (typeof input.confidence !== "number" || !Number.isFinite(input.confidence) || input.confidence < 0 || input.confidence > 1) return undefined;
  const validDate = (date: unknown) => typeof date === "string" && !Number.isNaN(Date.parse(date)) && new Date(date).toISOString() === date;
  if (!validDate(input.createdAt) || !validDate(input.updatedAt) || (input.expiresAt !== undefined && (!validDate(input.expiresAt) || Date.parse(input.expiresAt as string) <= Date.parse(input.updatedAt as string)))) return undefined;
  if (typeof input.source !== "object" || input.source === null || typeof input.security !== "object" || input.security === null) return undefined;
  const source = input.source as Record<string, unknown>;
  const sourceTypes = ["file", "command", "git", "manifest", "managed-block", "user-input", "llm-output", "external-tool", "bridge"];
  if (Object.keys(source).some((key) => !["type", "path", "command", "hash", "bridgeId"].includes(key)) || !sourceTypes.includes(String(source.type))) return undefined;
  if (source.path !== undefined && (typeof source.path !== "string" || !safeExperiencePath(source.path))) return undefined;
  for (const key of ["command", "hash", "bridgeId"] as const) if (source[key] !== undefined && typeof source[key] !== "string") return undefined;
  const security = input.security as Record<string, unknown>;
  if (Object.keys(security).some((key) => !["trustLevel", "secretScan", "injectionScan"].includes(key)) || !["trusted", "project", "generated", "external", "untrusted"].includes(String(security.trustLevel))
    || !["passed", "failed", "not_run"].includes(String(security.secretScan)) || !["passed", "failed", "not_run"].includes(String(security.injectionScan))) return undefined;
  let evidence: ExperienceFact["evidence"];
  if (input.evidence !== undefined) {
    if (typeof input.evidence !== "object" || input.evidence === null) return undefined;
    const item = input.evidence as Record<string, unknown>;
    if (Object.keys(item).some((key) => !["type", "ref"].includes(key)) || !experienceManifest.verification.acceptedEvidenceTypes.includes(item.type as never) || typeof item.ref !== "string" || !/^[A-Za-z0-9._:-]+$/.test(item.ref)) return undefined;
    evidence = { type: item.type as NonNullable<ExperienceFact["evidence"]>["type"], ref: item.ref };
  }
  return {
    id: input.id, kind: input.kind as ExperienceFact["kind"], scope: input.scope as ExperienceFact["scope"], status: input.status as ExperienceFact["status"], value: input.value,
    source: { type: source.type as ExperienceFact["source"]["type"], ...(source.path === undefined ? {} : { path: source.path as string }), ...(source.command === undefined ? {} : { command: source.command as string }), ...(source.hash === undefined ? {} : { hash: source.hash as string }), ...(source.bridgeId === undefined ? {} : { bridgeId: source.bridgeId as string }) },
    confidence: input.confidence, createdAt: input.createdAt as string, updatedAt: input.updatedAt as string, ...(input.expiresAt === undefined ? {} : { expiresAt: input.expiresAt as string }), ...(evidence ? { evidence } : {}), security: security as ExperienceFact["security"],
  };
}

async function experienceRoot(root: string, create = false): Promise<string> {
  const resolved = await gitRoot(root);
  const base = join(resolved, ".downstroke", "experience");
  if (create) await mkdir(base, { recursive: true });
  const actual = await realpath(base);
  const location = relative(resolved, actual);
  if (location.startsWith("..") || isAbsolute(location)) throw new Error("Experience storage resolves outside the repository");
  return actual;
}

export async function initializeExperience(root: string): Promise<{ status: "ok" | "fail"; actions: { path: string; action: "create" | "skip" }[]; message: string }> {
  try {
    const resolved = await gitRoot(root);
    const base = await experienceRoot(resolved, true);
    const manifestPath = join(base, "manifest.json");
    if (await exists(manifestPath)) {
      const existing = JSON.parse(await readFile(manifestPath, "utf8")) as unknown;
      if (JSON.stringify(existing) !== JSON.stringify(experienceManifest)) return { status: "fail", actions: [], message: "Experience manifest is malformed or weakens lite security defaults" };
    }
    const actions: { path: string; action: "create" | "skip" }[] = [];
    for (const [path, kind] of experienceFiles) {
      const target = join(base, ...path.split("/"));
      const display = `.downstroke/experience/${path}`;
      if (await exists(target)) { actions.push({ path: display, action: "skip" }); continue; }
      if (kind === "directory") await mkdir(target);
      else await writeFile(target, path === "manifest.json" ? `${JSON.stringify(experienceManifest, null, 2)}\n` : path.endsWith(".json") ? "{}\n" : "", { flag: "wx" });
      actions.push({ path: display, action: "create" });
    }
    return { status: "ok", actions, message: "Experience storage is ready with lite security defaults" };
  } catch (error: unknown) {
    return { status: "fail", actions: [], message: error instanceof Error ? error.message : "Experience initialization failed" };
  }
}

export async function planExperienceFact(root: string, value: unknown): Promise<ExperienceFactPlan> {
  const blockers: string[] = [];
  const fact = parseExperienceFact(value);
  if (!fact) return { status: "blocked", action: "append", fact: null, blockers: ["Experience fact is malformed"] };
  if (fact.status === "verified" && fact.source.type === "llm-output") blockers.push("LLM output cannot directly create a verified fact");
  if ((fact.security.secretScan === "failed" || fact.security.injectionScan === "failed") && !["quarantined", "rejected"].includes(fact.status)) blockers.push("Failed security scans require quarantined or rejected status");
  if (fact.status === "verified" && !fact.evidence) blockers.push("Verified facts require evidence");
  try {
    const base = await experienceRoot(root);
    if (JSON.stringify(JSON.parse(await readFile(join(base, "manifest.json"), "utf8"))) !== JSON.stringify(experienceManifest)) blockers.push("Experience manifest is malformed or weakens lite security defaults");
    if (fact.status === "verified" && fact.evidence) {
      const evidence = (await readFile(join(base, "evidence.jsonl"), "utf8")).split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as Record<string, unknown>);
      const item = evidence.find(({ id }) => id === fact.evidence?.ref);
      const result = typeof item?.result === "object" && item.result !== null ? item.result as Record<string, unknown> : {};
      const security = typeof item?.security === "object" && item.security !== null ? item.security as Record<string, unknown> : {};
      if (!item || item.type !== fact.evidence.type || result.status !== "passed" || security.sanitized !== true || security.containsSecrets !== false || security.secretScan !== "passed") blockers.push("Verified fact evidence is missing, failed, unsanitized or the wrong type");
      if (fact.evidence.type === "manual_approval" && fact.kind !== "decision") blockers.push("Manual approval can verify decisions only, not technical claims");
    }
    const records = (await readFile(join(base, "facts.jsonl"), "utf8")).split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as Record<string, unknown>);
    const existing = records.find(({ id }) => id === fact.id);
    if (existing) {
      if (JSON.stringify(existing) !== JSON.stringify(fact)) blockers.push("Experience fact ID already exists with different content");
      return { status: blockers.length ? "blocked" : "ready", action: "skip", fact, blockers };
    }
  } catch (error: unknown) { blockers.push(error instanceof Error ? error.message : "Experience storage cannot be inspected"); }
  return { status: blockers.length ? "blocked" : "ready", action: "append", fact, blockers };
}

export async function applyExperienceFact(root: string, plan: ExperienceFactPlan): Promise<DoctorResult> {
  if (plan.status === "blocked" || !plan.fact) return { id: "experience.fact", status: "fail", message: plan.blockers.join("; ") || "Experience fact plan is blocked", remediation: "Correct and preview the fact again" };
  let lock: Awaited<ReturnType<typeof open>> | undefined;
  let lockPath = "";
  try {
    const base = await experienceRoot(root);
    lockPath = join(base, "facts.lock");
    lock = await open(lockPath, "wx");
    const fresh = await planExperienceFact(root, plan.fact);
    if (JSON.stringify(fresh) !== JSON.stringify(plan)) return { id: "experience.fact", status: "fail", message: "Experience facts changed after preview", remediation: "Preview the fact again" };
    if (plan.action === "skip") return { id: "experience.fact", status: "ok", message: "Experience fact already exists", evidence: plan.fact.id, remediation: "No action required" };
    const factsPath = join(base, "facts.jsonl");
    const line = (await readFile(factsPath, "utf8")).split(/\r?\n/).filter(Boolean).length + 1;
    await appendFile(factsPath, `${JSON.stringify(plan.fact)}\n`);
    const indexPath = join(base, "indexes", "facts-by-id.json");
    const index = JSON.parse(await readFile(indexPath, "utf8")) as Record<string, number>;
    index[plan.fact.id] = line;
    const temporary = `${indexPath}.${process.pid}.${randomUUID()}.tmp`;
    await writeFile(temporary, `${JSON.stringify(index, null, 2)}\n`, { flag: "wx" });
    await rename(temporary, indexPath);
    return { id: "experience.fact", status: "ok", message: "Experience fact stored", evidence: plan.fact.id, remediation: "No action required" };
  } catch (error: unknown) {
    return { id: "experience.fact", status: "fail", message: error instanceof Error ? error.message : "Experience fact write failed", remediation: "Inspect experience storage and preview again" };
  } finally {
    if (lock) { await lock.close().catch(() => undefined); await unlink(lockPath).catch(() => undefined); }
  }
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

const legacySources = [
  { id: "legacy.code-intel", paths: [".codegraph"], label: "Legacy code-intelligence artifacts" },
  { id: "legacy.workflow", paths: ["_bmad", "_bmad-output"], label: "Legacy workflow artifacts" },
  { id: "legacy.communication", paths: [".agents/skills/caveman", "skills/caveman"], label: "Legacy communication instructions" },
  { id: "legacy.simplicity", paths: [".agents/skills/ponytail"], label: "Legacy simplicity instructions" },
] as const;

async function inspectLegacyPath(path: string): Promise<"present" | "missing" | "unreadable"> {
  try {
    await stat(path);
    return "present";
  } catch (error: unknown) {
    return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT"
      ? "missing"
      : "unreadable";
  }
}

export async function diagnoseLegacyAgentStack(root: string): Promise<DoctorResult[]> {
  return Promise.all(legacySources.map(async ({ id, paths, label }) => {
    const inspected = await Promise.all(paths.map(async (path) => ({ path, state: await inspectLegacyPath(join(root, path)) })));
    const found = inspected.find(({ state }) => state === "present");
    const unreadable = inspected.find(({ state }) => state === "unreadable");
    return {
      id,
      status: found ? "warn" : unreadable ? "fail" : "ok",
      message: found
        ? `${label} detected; preserve for native migration`
        : unreadable
          ? `${label} could not be inspected`
          : `No active ${label.toLowerCase()} detected`,
      evidence: found?.path ?? (unreadable ? `${unreadable.path} unreadable` : `${paths[0]} not found`),
      remediation: found
        ? "Preserve this source for native migration; do not execute or delete it"
        : unreadable
          ? "Restore read access and run doctor again"
          : "No action required",
    };
  }));
}

export const nativeOnlySurfaces = [
  "README.md",
  "apps/cli/src/index.ts",
  "docs/dotnet-bridge.md",
  "docs/process/downstroke-workflow.md",
  "docs/project-start-guides.md",
  "docs/proven-project-rules.md",
  "packages/agents/templates/AGENTS.md",
  "packages/agents/templates/CLAUDE.md",
  "packages/gates/src/index.ts",
  "packages/gates/templates/downstroke-workflow.md",
  "packages/spec/templates/SPEC.md",
] as const;

export async function scanNativeOnlySurfaces(root: string): Promise<{
  status: "ok" | "fail";
  files: string[];
  matches: { path: string; terms: string[] }[];
}> {
  const forbidden = ["codegraph", "bmad", "caveman", "ponytail", "breakdown stack", "bootstrap-agents"];
  const matches: { path: string; terms: string[] }[] = [];
  const invalid: string[] = [];
  for (const path of nativeOnlySurfaces) {
    const source = await readLocalFile(root, path);
    if (source.kind !== "file") {
      invalid.push(path);
      continue;
    }
    const content = source.content.toString("utf8").toLowerCase();
    const terms = forbidden.filter((term) => content.includes(term));
    if (terms.length) matches.push({ path, terms });
  }
  return { status: matches.length || invalid.length ? "fail" : "ok", files: [...invalid, ...matches.map(({ path }) => path)], matches };
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
  const headings = ["## Downstroke Workflow Governance", "## BMAD Governance"];
  const start = headings.map((heading) => content.indexOf(heading)).filter((index) => index >= 0).sort((left, right) => left - right)[0] ?? -1;
  const end = start < 0 ? -1 : content.indexOf("\n## ", start + 3);
  return start < 0 || end < 0 ? undefined : { start, end };
}

function updateCadenceSpec(content: string, cadence: PlanningCadence): string {
  const bounds = cadenceSpecBounds(content);
  if (!bounds) throw new Error("docs/SPEC.md has no bounded Downstroke Workflow Governance section");
  const { start, end } = bounds;
  let section = content.slice(start, end).replace(/^## BMAD Governance$/m, "## Downstroke Workflow Governance");
  const patterns = [
    /^- Review mode:.*$/m,
    /^- Block size when applicable:.*$/m,
    /^- Sprint length:.*$/m,
    /^- Gross capacity:.*$/m,
    /^- WIP limit:.*$/m,
  ];
  const lines = cadenceSpecLines(cadence);
  for (let index = 0; index < patterns.length; index += 1) {
    if (!patterns[index]?.test(section)) throw new Error("docs/SPEC.md Downstroke Workflow Governance fields are incomplete");
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
    return { id: "planning.cadence", status: "fail", message: error instanceof Error ? error.message : "docs/SPEC.md cannot be updated safely", evidence: "docs/SPEC.md", remediation: "Restore the Downstroke Workflow Governance section" };
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
  if (names.has("_bmad") || names.has("_bmad-output")) signals.push("legacy-workflow");
  if (names.has(".codegraph")) signals.push("legacy-code-intel");

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
    originInference: ["agent-instructions", "legacy-workflow", "legacy-code-intel"].some((signal) => signals.includes(signal))
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
