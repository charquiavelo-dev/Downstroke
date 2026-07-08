import { access, appendFile, copyFile, lstat, mkdir, open, readFile, readdir, realpath, rename, stat, unlink, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { dirname, extname, isAbsolute, join, relative } from "node:path";
import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";

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
export type ExperienceImportRecord = {
  path: string;
  hash: string;
  bytes: number;
  format: "markdown" | "yaml" | "json" | "unsupported";
  classification: "requirement" | "decision" | "rule" | "workflow" | "qa" | "unknown";
  trust: "project" | "external" | "untrusted";
  importability: "importable" | "quarantine" | "reject";
  instructionRisk: "none" | "suspicious" | "active";
  reason?: string;
  action: "append" | "skip" | "none";
  fact?: ExperienceFact;
};
export type ExperienceImportPlan = { status: "ready" | "blocked"; records: ExperienceImportRecord[]; blockers: string[] };

export const workflowPhases = ["plan", "review", "implementation", "verification"] as const;
export type WorkflowPhase = typeof workflowPhases[number];
export type WorkflowStatus = "backlog" | "ready-for-dev" | "in-progress" | "review" | "done" | "blocked";
export type WorkflowItem = {
  id: string;
  type: "brief" | "spec" | "epic" | "story" | "task";
  title: string;
  status: WorkflowStatus;
  risk: "normal" | "high";
  review: "cadence" | "individual";
  acceptanceCriteria: string[];
  tasks: string[];
  evidence: string[];
  deferredWork: string[];
  source?: Pick<ExperienceFact["source"], "type" | "path" | "hash">;
  createdAt: string;
  updatedAt: string;
};
export type WorkflowCheckpoint = {
  id: string;
  itemId: string;
  phase: WorkflowPhase;
  status: "pending" | "approved";
  createdAt: string;
  approvedAt?: string;
};
export type WorkflowConflict = {
  id: string;
  itemId: string;
  owner: string;
  sources: { path: string; hash: string }[];
  options: { id: string; consequence: string }[];
  consequences: string[];
  status: "pending" | "resolved";
  createdAt: string;
  selectedOption?: string;
  rationale?: string;
  resolvedBy?: string;
  resolvedAt?: string;
};
export type WorkflowNextAction = {
  status: "ready" | "blocked";
  itemId: string | null;
  action: "plan" | "implement" | "verify" | "review" | "done" | "approve-plan" | "approve-review" | "approve-implementation" | "approve-verification" | "resolve-conflict";
  reason: string;
};
export type WorkflowItemInput = {
  item: unknown;
  controlled?: boolean;
  phase?: WorkflowPhase;
  approved?: boolean;
  conflict?: unknown;
};
export type WorkflowResolveInput = { itemId: string; selectedOption: string; owner: string; rationale: string };
export type WorkflowPlan = {
  status: "ready" | "blocked";
  action: "append" | "skip";
  files: string[];
  item: WorkflowItem | null;
  checkpoint?: WorkflowCheckpoint;
  conflict?: WorkflowConflict;
  nextAction?: WorkflowNextAction;
  blockers: string[];
};

export const communicationModes = ["normal", "compact", "technical", "audit", "handoff"] as const;
export type CommunicationMode = typeof communicationModes[number];
export const protectedCommunicationCategories = ["code", "commands", "diffs", "schemas", "security", "permissions", "qa", "rollback", "acceptance-criteria"] as const;
export type ProtectedCommunicationCategory = typeof protectedCommunicationCategories[number];
export type CommunicationPolicy = {
  schemaVersion: "0.1.0";
  revision: number;
  mode: CommunicationMode;
  budgetTokens: number;
  protectedCategories: ProtectedCommunicationCategory[];
  createdAt: string;
  updatedAt: string;
};
export type CommunicationPreference = {
  id: string;
  status: "active" | "inactive";
  value: string;
  reason: string;
  source: { type: "user-input" | "file"; path?: string };
  createdAt: string;
};
export type CommunicationPlan = {
  status: "ready" | "blocked";
  action: "append" | "skip";
  files: string[];
  policy: CommunicationPolicy | null;
  preference?: CommunicationPreference;
  blockers: string[];
};
export type CommunicationProtection = {
  category: ProtectedCommunicationCategory | "prose";
  mode: CommunicationMode;
  compression: "allowed" | "protected";
  reason: string;
};

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
const maxExperienceBytes = 10 * 1024 * 1024;

function safeExperiencePath(path: string): boolean {
  return path.length > 0 && !/[\u0000-\u001f\u007f\\]/.test(path) && !isAbsolute(path) && !path.split("/").includes("..");
}

function normalizeJson(value: unknown, depth = 0): unknown {
  if (depth > 20) throw new Error("Experience value is too deeply nested");
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (Array.isArray(value)) return value.map((item) => normalizeJson(item, depth + 1));
  if (typeof value !== "object") throw new Error("Experience value must be valid JSON");
  const input = value as Record<string, unknown>;
  return Object.fromEntries(Object.keys(input).sort().map((key) => [key, normalizeJson(input[key], depth + 1)]));
}

function parseExperienceFact(value: unknown): ExperienceFact | undefined {
  try {
    if (typeof value !== "object" || value === null) return undefined;
    const input = value as Record<string, unknown>;
    const allowed = ["id", "kind", "scope", "status", "value", "source", "confidence", "createdAt", "updatedAt", "expiresAt", "evidence", "security"];
    if (Object.keys(input).some((key) => !allowed.includes(key))) return undefined;
    const kinds = ["stack", "dependency", "rule", "decision", "risk", "gate", "script", "integration", "repo", "qa", "security"];
    const scopes = ["repo", "workspace", "module", "file", "org"];
    const statuses = ["unknown", "observed", "inferred", "verified", "stale", "conflicted", "quarantined", "rejected"];
    if (typeof input.id !== "string" || !/^[A-Za-z0-9._:-]{1,200}$/.test(input.id) || ["__proto__", "prototype", "constructor"].includes(input.id) || !kinds.includes(String(input.kind)) || !scopes.includes(String(input.scope)) || !statuses.includes(String(input.status))) return undefined;
    if (typeof input.confidence !== "number" || !Number.isFinite(input.confidence) || input.confidence < 0 || input.confidence > 1) return undefined;
    const validDate = (date: unknown) => typeof date === "string" && !Number.isNaN(Date.parse(date)) && new Date(date).toISOString() === date;
    if (!validDate(input.createdAt) || !validDate(input.updatedAt) || Date.parse(input.updatedAt as string) < Date.parse(input.createdAt as string)
      || (input.expiresAt !== undefined && (!validDate(input.expiresAt) || Date.parse(input.expiresAt as string) <= Date.parse(input.updatedAt as string)))) return undefined;
    if (typeof input.source !== "object" || input.source === null || typeof input.security !== "object" || input.security === null) return undefined;
    const source = input.source as Record<string, unknown>;
    const sourceTypes = ["file", "command", "git", "manifest", "managed-block", "user-input", "llm-output", "external-tool", "bridge"];
    if (Object.keys(source).some((key) => !["type", "path", "command", "hash", "bridgeId"].includes(key)) || !sourceTypes.includes(String(source.type))) return undefined;
    if (source.path !== undefined && (typeof source.path !== "string" || !safeExperiencePath(source.path))) return undefined;
    for (const key of ["command", "hash", "bridgeId"] as const) if (source[key] !== undefined && typeof source[key] !== "string") return undefined;
    if (["file", "manifest", "managed-block"].includes(String(source.type)) && source.path === undefined) return undefined;
    if (source.type === "command" && source.command === undefined || source.type === "git" && source.hash === undefined || source.type === "bridge" && source.bridgeId === undefined) return undefined;
    if (source.type === "external-tool" && source.path === undefined && source.command === undefined && source.bridgeId === undefined) return undefined;
    const security = input.security as Record<string, unknown>;
    if (Object.keys(security).some((key) => !["trustLevel", "secretScan", "injectionScan"].includes(key)) || !["trusted", "project", "generated", "external", "untrusted"].includes(String(security.trustLevel))) return undefined;
    if (source.type === "llm-output" && !["generated", "untrusted"].includes(String(security.trustLevel)) || ["external-tool", "bridge"].includes(String(source.type)) && !["external", "untrusted"].includes(String(security.trustLevel))) return undefined;
    let evidence: ExperienceFact["evidence"];
    if (input.evidence !== undefined) {
      if (typeof input.evidence !== "object" || input.evidence === null) return undefined;
      const item = input.evidence as Record<string, unknown>;
      if (Object.keys(item).some((key) => !["type", "ref"].includes(key)) || !experienceManifest.verification.acceptedEvidenceTypes.includes(item.type as never) || typeof item.ref !== "string" || !/^[A-Za-z0-9._:-]+$/.test(item.ref)) return undefined;
      evidence = { type: item.type as NonNullable<ExperienceFact["evidence"]>["type"], ref: item.ref };
    }
    const normalizedValue = normalizeJson(input.value);
    if (Buffer.byteLength(JSON.stringify(normalizedValue)) > 64 * 1024) return undefined;
    return {
      id: input.id, kind: input.kind as ExperienceFact["kind"], scope: input.scope as ExperienceFact["scope"], status: input.status as ExperienceFact["status"], value: normalizedValue,
      source: { type: source.type as ExperienceFact["source"]["type"], ...(source.path === undefined ? {} : { path: source.path as string }), ...(source.command === undefined ? {} : { command: source.command as string }), ...(source.hash === undefined ? {} : { hash: source.hash as string }), ...(source.bridgeId === undefined ? {} : { bridgeId: source.bridgeId as string }) },
      confidence: input.confidence, createdAt: input.createdAt as string, updatedAt: input.updatedAt as string, ...(input.expiresAt === undefined ? {} : { expiresAt: input.expiresAt as string }), ...(evidence ? { evidence } : {}),
      security: { trustLevel: security.trustLevel as ExperienceFact["security"]["trustLevel"], secretScan: "not_run", injectionScan: "not_run" },
    };
  } catch { return undefined; }
}

async function checkedExperienceRoot(root: string, create = false): Promise<string> {
  const resolved = await gitRoot(root);
  const downstroke = join(resolved, ".downstroke");
  if (await exists(downstroke) && (await lstat(downstroke)).isSymbolicLink()) throw new Error("Experience storage parent cannot be a symbolic link");
  if (create) await mkdir(join(downstroke, "experience"), { recursive: true });
  const base = await realpath(join(downstroke, "experience"));
  const location = relative(resolved, base);
  if (location.startsWith("..") || isAbsolute(location)) throw new Error("Experience storage resolves outside the repository");
  return base;
}

async function validateExperienceEntry(base: string, path: string, kind: "file" | "directory"): Promise<boolean> {
  const target = join(base, ...path.split("/"));
  try {
    const info = await lstat(target);
    if (info.isSymbolicLink() || kind === "file" && !info.isFile() || kind === "directory" && !info.isDirectory()) throw new Error(`Invalid experience storage entry: ${path}`);
    return true;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") return false;
    throw error;
  }
}

export async function initializeExperience(root: string, dryRun = false): Promise<{ status: "ok" | "fail"; actions: { path: string; action: "create" | "skip" }[]; message: string }> {
  try {
    const resolved = await gitRoot(root);
    const downstrokePath = join(resolved, ".downstroke");
    if (await exists(downstrokePath) && (await lstat(downstrokePath)).isSymbolicLink()) throw new Error("Experience storage parent cannot be a symbolic link");
    const basePath = join(resolved, ".downstroke", "experience");
    const base = dryRun && !(await exists(basePath)) ? basePath : await checkedExperienceRoot(resolved, true);
    const manifestPath = join(base, "manifest.json");
    if (await exists(manifestPath)) {
      if (!(await validateExperienceEntry(base, "manifest.json", "file"))) throw new Error("Invalid experience manifest");
      const existing = JSON.parse(await readFile(manifestPath, "utf8")) as unknown;
      if (JSON.stringify(existing) !== JSON.stringify(experienceManifest)) return { status: "fail", actions: [], message: "Experience manifest is malformed or weakens lite security defaults" };
    }
    const actions: { path: string; action: "create" | "skip" }[] = [];
    for (const [path, kind] of experienceFiles) {
      const present = await validateExperienceEntry(base, path, kind).catch((error: unknown) => { if (dryRun && !(error instanceof Error && error.message.startsWith("Invalid"))) return false; throw error; });
      const display = `.downstroke/experience/${path}`;
      if (present) { actions.push({ path: display, action: "skip" }); continue; }
      if (!dryRun) {
        const target = join(base, ...path.split("/"));
        if (kind === "directory") await mkdir(target);
        else await writeFile(target, path === "manifest.json" ? `${JSON.stringify(experienceManifest, null, 2)}\n` : path.endsWith(".json") ? "{}\n" : "", { flag: "wx" });
      }
      actions.push({ path: display, action: "create" });
    }
    return { status: "ok", actions, message: dryRun ? "Experience initialization preview" : "Experience storage is ready with lite security defaults" };
  } catch { return { status: "fail", actions: [], message: "Experience storage cannot be initialized safely" }; }
}

async function readExperienceLines(path: string): Promise<string[]> {
  const content = await readFile(path);
  if (content.byteLength > maxExperienceBytes) throw new Error("Experience store exceeds the lite size limit");
  return content.toString("utf8").split(/\r?\n/).filter(Boolean);
}

function scanExperienceFact(fact: ExperienceFact): ExperienceFact {
  const text = JSON.stringify({ value: fact.value, source: fact.source });
  const secret = /(-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----|\b(?:ghp_|github_pat_|npm_)[A-Za-z0-9_]{20,}|\bAKIA[0-9A-Z]{16}|(?:password|secret|token|api[_-]?key)\s*[:=]\s*[^\s,}]+)/i.test(text);
  const injection = /(ignore (?:all |the )?previous|reveal (?:the )?system prompt|override (?:security |project )?policy|execute (?:this |the )?command)/i.test(text);
  return { ...fact, security: { ...fact.security, secretScan: secret ? "failed" : "passed", injectionScan: injection ? "failed" : "passed" } };
}

function validEvidence(item: Record<string, unknown>, fact: ExperienceFact): boolean {
  const keys = ["id", "type", "createdAt", "source", "result", "security"];
  if (!fact.evidence || Object.keys(item).length !== keys.length || keys.some((key) => !(key in item)) || Object.keys(item).some((key) => !keys.includes(key)) || item.id !== fact.evidence.ref || item.type !== fact.evidence.type) return false;
  if (typeof item.createdAt !== "string" || Number.isNaN(Date.parse(item.createdAt)) || typeof item.source !== "object" || item.source === null) return false;
  const result = typeof item.result === "object" && item.result !== null ? item.result as Record<string, unknown> : {};
  const security = typeof item.security === "object" && item.security !== null ? item.security as Record<string, unknown> : {};
  if (result.status !== "passed" || security.sanitized !== true || security.containsSecrets !== false || security.secretScan !== "passed") return false;
  if (fact.kind === "qa" && !["command_exit_code", "test_report", "typecheck_report", "build_report", "lint_report"].includes(String(item.type))) return false;
  return item.type !== "manual_approval" || fact.kind === "decision";
}

export async function planExperienceFact(root: string, value: unknown): Promise<ExperienceFactPlan> {
  const blockers: string[] = [];
  const parsed = parseExperienceFact(value);
  if (!parsed) return { status: "blocked", action: "append", fact: null, blockers: ["Experience fact is malformed"] };
  const fact = scanExperienceFact(parsed);
  if (fact.security.secretScan === "failed") blockers.push("Facts containing likely secrets cannot be persisted");
  if (fact.security.injectionScan === "failed" && !["quarantined", "rejected"].includes(fact.status)) blockers.push("Suspicious instructions require quarantined or rejected status");
  if (fact.status === "verified" && fact.source.type === "llm-output") blockers.push("LLM output cannot directly create a verified fact");
  if (fact.status === "verified" && !fact.evidence) blockers.push("Verified facts require evidence");
  try {
    const base = await checkedExperienceRoot(root);
    for (const [path, kind] of experienceFiles) if (!(await validateExperienceEntry(base, path, kind))) throw new Error("Experience storage is incomplete");
    if (JSON.stringify(JSON.parse(await readFile(join(base, "manifest.json"), "utf8"))) !== JSON.stringify(experienceManifest)) blockers.push("Experience manifest is malformed or weakens lite security defaults");
    if (fact.status === "verified" && fact.evidence) {
      const evidence = (await readExperienceLines(join(base, "evidence.jsonl"))).map((line) => JSON.parse(line) as Record<string, unknown>);
      const matches = evidence.filter(({ id }) => id === fact.evidence?.ref);
      if (matches.length !== 1 || !validEvidence(matches[0]!, fact)) blockers.push("Verified fact evidence is missing, duplicated, invalid or ineligible");
    }
    const records = (await readExperienceLines(join(base, "facts.jsonl"))).map((line) => JSON.parse(line) as Record<string, unknown>);
    const matches = records.filter(({ id }) => id === fact.id);
    if (matches.length > 1) blockers.push("Experience store contains duplicate fact IDs");
    if (matches.length === 1) {
      if (JSON.stringify(normalizeJson(matches[0])) !== JSON.stringify(normalizeJson(fact))) blockers.push("Experience fact ID already exists with different content");
      return { status: blockers.length ? "blocked" : "ready", action: "skip", fact, blockers };
    }
  } catch { blockers.push("Experience storage cannot be inspected safely"); }
  return { status: blockers.length ? "blocked" : "ready", action: "append", fact, blockers };
}

async function acquireExperienceLock(path: string): Promise<Awaited<ReturnType<typeof open>>> {
  const create = async () => { const handle = await open(path, "wx"); await handle.writeFile(JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() })); return handle; };
  try { return await create(); }
  catch {
    try {
      const metadata = JSON.parse(await readFile(path, "utf8")) as { pid?: unknown; createdAt?: unknown };
      const age = typeof metadata.createdAt === "string" ? Date.now() - Date.parse(metadata.createdAt) : 0;
      let alive = true;
      if (typeof metadata.pid === "number") try { process.kill(metadata.pid, 0); } catch (error: unknown) { alive = !(typeof error === "object" && error !== null && "code" in error && error.code === "ESRCH"); }
      if (age > 300_000 && !alive) { await unlink(path); return create(); }
    } catch { /* keep unknown locks fail-closed */ }
    throw new Error("Another experience fact write is in progress");
  }
}

async function rebuildFactIndex(base: string): Promise<void> {
  const records = (await readExperienceLines(join(base, "facts.jsonl"))).map((line) => JSON.parse(line) as { id?: unknown });
  const index = Object.create(null) as Record<string, number>;
  records.forEach(({ id }, position) => { if (typeof id === "string") index[id] = position + 1; });
  const indexPath = join(base, "indexes", "facts-by-id.json");
  const temporary = `${indexPath}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(index, null, 2)}\n`, { flag: "wx" });
  await rename(temporary, indexPath);
}

export async function applyExperienceFact(root: string, plan: ExperienceFactPlan): Promise<DoctorResult> {
  if (plan.status === "blocked" || !plan.fact) return { id: "experience.fact", status: "fail", message: plan.blockers.join("; ") || "Experience fact plan is blocked", remediation: "Correct and preview the fact again" };
  let lock: Awaited<ReturnType<typeof open>> | undefined;
  let lockPath = "";
  try {
    const base = await checkedExperienceRoot(root);
    lockPath = join(base, "facts.lock");
    lock = await acquireExperienceLock(lockPath);
    const fresh = await planExperienceFact(root, plan.fact);
    if (JSON.stringify(fresh) !== JSON.stringify(plan)) return { id: "experience.fact", status: "fail", message: "Experience facts changed after preview", remediation: "Preview the fact again" };
    if (plan.action === "append") await appendFile(join(base, "facts.jsonl"), `${JSON.stringify(plan.fact)}\n`);
    await rebuildFactIndex(base);
    return { id: "experience.fact", status: "ok", message: plan.action === "skip" ? "Experience fact and index already exist" : "Experience fact stored", evidence: plan.fact.id, remediation: "No action required" };
  } catch (error: unknown) {
    const message = error instanceof Error && ["Another experience fact write is in progress", "Experience facts changed after preview"].includes(error.message) ? error.message : "Experience fact write failed safely";
    return { id: "experience.fact", status: "fail", message, remediation: "Inspect repository-relative experience storage and preview again" };
  } finally {
    if (lock) { await lock.close().catch(() => undefined); await unlink(lockPath).catch(() => undefined); }
  }
}

const maxImportBytes = 256 * 1024;

function importClassification(path: string, text: string): ExperienceImportRecord["classification"] {
  const sample = `${path}\n${text.slice(0, 8192)}`.toLowerCase();
  if (/\b(decision|adr|chosen|rationale)\b/.test(sample)) return "decision";
  if (/\b(workflow|story|task|sprint|epic|process)\b/.test(sample)) return "workflow";
  if (/\b(requirement|acceptance criteria|\bmust\b|\bshall\b|specification)\b/.test(sample)) return "requirement";
  if (/\b(rule|policy|standard|non-negotiable)\b/.test(sample)) return "rule";
  if (/\b(qa|test|build|typecheck|lint|verification)\b/.test(sample)) return "qa";
  return "unknown";
}

function importTrust(path: string): ExperienceImportRecord["trust"] {
  if (/^(?:docs\/legacy|_bmad(?:-output)?|\.agents|\.codegraph|dist|build|coverage|out)(?:\/|$)/.test(path)) return "external";
  return path.startsWith(".") ? "untrusted" : "project";
}

function importClaims(text: string): { key: string; value: string }[] {
  return [...text.matchAll(/^\s*(?:[-*]\s*)?claim\s*:\s*([A-Za-z0-9._-]{1,80})\s*=\s*([^\r\n]{1,200})\s*$/gim)]
    .map((match) => ({ key: match[1]!.toLowerCase(), value: match[2]!.trim().replace(/\s+/g, " ").toLowerCase() }))
    .sort((a, b) => a.key.localeCompare(b.key) || a.value.localeCompare(b.value));
}

function importFormat(path: string): ExperienceImportRecord["format"] {
  const extension = extname(path).toLowerCase();
  if ([".md", ".markdown"].includes(extension)) return "markdown";
  if ([".yaml", ".yml"].includes(extension)) return "yaml";
  if (extension === ".json") return "json";
  return "unsupported";
}

function importFact(record: Omit<ExperienceImportRecord, "action" | "fact">, timestamp: string, claims: { key: string; value: string }[]): ExperienceFact | undefined {
  if (record.importability === "reject") return undefined;
  const kinds: Record<ExperienceImportRecord["classification"], ExperienceFact["kind"]> = { requirement: "gate", decision: "decision", rule: "rule", workflow: "rule", qa: "qa", unknown: "risk" };
  return {
    id: `import.${record.hash.slice(0, 24)}.${record.classification}`,
    kind: kinds[record.classification], scope: "repo", status: record.importability === "quarantine" ? "quarantined" : "observed",
    value: { classification: record.classification, bytes: record.bytes, claims, reason: record.reason ?? "classified-source" },
    source: { type: "file", path: record.path, hash: record.hash }, confidence: record.trust === "project" ? 0.8 : 0.5,
    createdAt: timestamp, updatedAt: timestamp,
    security: { trustLevel: record.trust, secretScan: "not_run", injectionScan: "not_run" },
  };
}

export async function planExperienceImport(root: string, requestedPaths: string[]): Promise<ExperienceImportPlan> {
  const records: ExperienceImportRecord[] = [];
  const blockers: string[] = [];
  let repository: string;
  try { repository = await gitRoot(root); }
  catch { return { status: "blocked", records, blockers: ["Repository root cannot be resolved"] }; }
  let existing: ExperienceFact[] = [];
  try {
    const base = await checkedExperienceRoot(repository);
    existing = (await readExperienceLines(join(base, "facts.jsonl"))).map((line) => JSON.parse(line) as ExperienceFact);
  } catch { blockers.push("Experience storage cannot be inspected safely"); }

  const seen = new Set<string>();
  for (const requestedPath of [...new Set(requestedPaths)].sort()) {
    let path = requestedPath;
    const format = importFormat(path);
    const rejected = (reason: string, displayPath = path): ExperienceImportRecord => ({ path: displayPath, hash: "", bytes: 0, format, classification: "unknown", trust: "untrusted", importability: "reject", instructionRisk: "none", reason, action: "none" });
    if (!safeExperiencePath(path)) { records.push(rejected("unsafe-path", "<unsafe-path>")); blockers.push("Unsafe import path requires correction"); continue; }
    if (format === "unsupported") { records.push(rejected("unsupported-format")); continue; }
    try {
      const target = join(repository, ...path.split("/"));
      const resolved = await realpath(target);
      const location = relative(repository, resolved);
      if (location === ".." || location.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) || isAbsolute(location)) { records.push(rejected("outside-repository")); continue; }
      path = location.replaceAll("\\", "/");
      if (seen.has(path)) continue;
      seen.add(path);
      const linkInfo = await lstat(target);
      if (linkInfo.isSymbolicLink()) { records.push(rejected("not-contained-regular-file")); continue; }
      const handle = await open(target, fsConstants.O_RDONLY | (fsConstants.O_NOFOLLOW ?? 0));
      const before = await handle.stat();
      let content: Buffer;
      let after: Awaited<ReturnType<typeof handle.stat>>;
      try {
        if (!before.isFile()) { records.push(rejected("not-contained-regular-file")); continue; }
        if (before.size > maxImportBytes) { records.push({ ...rejected("oversized"), bytes: before.size }); continue; }
        content = await handle.readFile();
        after = await handle.stat();
      } finally { await handle.close(); }
      if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size || before.mtimeMs !== after.mtimeMs) { records.push(rejected("source-changed-during-read")); continue; }
      const hash = createHash("sha256").update(content).digest("hex");
      if (content.includes(0)) { records.push({ ...rejected("binary-content"), hash, bytes: content.byteLength }); continue; }
      let text: string;
      try { text = new TextDecoder("utf-8", { fatal: true }).decode(content); }
      catch { records.push({ ...rejected("binary-content"), hash, bytes: content.byteLength }); continue; }
      const secret = /(-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----|\b(?:ghp_|github_pat_|npm_)[A-Za-z0-9_]{20,}|\bAKIA[0-9A-Z]{16}|(?:password|secret|token|api[_-]?key)\s*[:=]\s*[^\s,}]+)/i.test(text);
      const active = /(ignore (?:all |the )?previous|reveal (?:the )?system prompt|override (?:security |project )?policy|execute (?:this |the )?command)/i.test(text);
      const classification = importClassification(path, text);
      const trust = importTrust(path);
      const importability: ExperienceImportRecord["importability"] = secret ? "reject" : active || classification === "unknown" ? "quarantine" : "importable";
      const reason = secret ? "secret-like-content" : active ? "active-instruction" : classification === "unknown" ? "unknown-content" : undefined;
      const claims = importClaims(text);
      const baseRecord = { path, hash, bytes: content.byteLength, format, classification, trust, importability, instructionRisk: active ? "active" as const : "none" as const, ...(reason ? { reason } : {}) };
      let fact = importFact(baseRecord, before.mtime.toISOString(), claims);
      const activeFacts = existing.filter((item) => !["quarantined", "rejected", "stale"].includes(item.status));
      const conflictingFacts = activeFacts.filter((item) => item.source.path === path && item.source.hash !== hash || claims.some((claim) => {
        const value = typeof item.value === "object" && item.value !== null ? item.value as { claims?: unknown } : {};
        return Array.isArray(value.claims) && value.claims.some((candidate) => typeof candidate === "object" && candidate !== null && (candidate as { key?: unknown }).key === claim.key && (candidate as { value?: unknown }).value !== claim.value);
      }));
      const conflict = conflictingFacts.length > 0;
      if (conflict && fact) {
        fact = { ...fact, status: "conflicted", value: { ...(fact.value as object), conflictsWith: conflictingFacts.map((item) => ({ path: item.source.path, hash: item.source.hash })).sort((a, b) => String(a.path).localeCompare(String(b.path))), reason: "material-source-conflict" } };
        blockers.push(`Material source conflict requires human resolution: ${path}`);
      }
      const factPlan = fact ? await planExperienceFact(repository, fact) : undefined;
      records.push({ ...baseRecord, action: factPlan?.action ?? "none", ...(fact ? { fact } : {}) });
      if (fact) existing.push(fact);
      if (factPlan?.status === "blocked" && !conflict) blockers.push(...factPlan.blockers.map((item) => `${path}: ${item}`));
    } catch { records.push(rejected("unreadable-source")); }
  }
  if (requestedPaths.length === 0) blockers.push("At least one repository-relative path is required");
  return { status: blockers.length ? "blocked" : "ready", records, blockers: [...new Set(blockers)] };
}

export async function applyExperienceImport(root: string, plan: ExperienceImportPlan): Promise<DoctorResult> {
  const conflictOnly = plan.blockers.length > 0 && plan.blockers.every((blocker) => blocker.startsWith("Material source conflict"));
  if (plan.status === "blocked" && !conflictOnly) return { id: "experience.import", status: "fail", message: plan.blockers.join("; "), remediation: "Resolve blockers and preview the import again" };
  const fresh = await planExperienceImport(root, plan.records.map(({ path }) => path));
  if (JSON.stringify(fresh) !== JSON.stringify(plan)) return { id: "experience.import", status: "fail", message: "Import sources changed after preview", remediation: "Preview the import again" };
  for (const record of plan.records) {
    if (!record.fact) continue;
    const source = await readFile(join(await gitRoot(root), ...record.path.split("/")));
    if (createHash("sha256").update(source).digest("hex") !== record.hash) return { id: "experience.import", status: "fail", message: "Import source changed before write", remediation: "Preview the import again" };
    const result = await applyExperienceFact(root, await planExperienceFact(root, record.fact));
    if (result.status !== "ok") return { id: "experience.import", status: "fail", message: "Import write failed safely", remediation: "Inspect experience storage and preview again" };
  }
  const appended = plan.records.filter(({ fact, action }) => fact && action === "append").length;
  const skipped = plan.records.filter(({ fact, action }) => fact && action === "skip").length;
  return conflictOnly
    ? { id: "experience.import", status: "warn", message: "Conflict candidates retained; human resolution required", evidence: `appended=${appended};skipped=${skipped}`, remediation: "Resolve the reported material conflicts" }
    : { id: "experience.import", status: "ok", message: "Project knowledge import applied", evidence: `appended=${appended};skipped=${skipped}`, remediation: "No action required" };
}

export const workflowManifest = {
  schemaVersion: "0.1.0",
  module: "downstroke-workflows",
  storage: { driver: "local-jsonl", path: ".downstroke/workflows" },
  controlledPhases: workflowPhases,
} as const;

const workflowFiles = [
  ["manifest.json", "file"],
  ["items.jsonl", "file"],
  ["evidence.jsonl", "file"],
  ["decisions.jsonl", "file"],
  ["checkpoints.jsonl", "file"],
] as const;

async function checkedWorkflowRoot(root: string, create = false): Promise<string> {
  const repository = await gitRoot(root);
  const downstroke = join(repository, ".downstroke");
  if (create) await mkdir(join(downstroke, "workflows"), { recursive: true });
  const base = await realpath(join(downstroke, "workflows"));
  if (relative(repository, base).startsWith("..")) throw new Error("Workflow storage is outside repository");
  return base;
}

async function readWorkflowLines(path: string): Promise<string[]> {
  try {
    const content = await readFile(path, "utf8");
    return content.split("\n").filter(Boolean);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }
}

function validWorkflowSource(value: unknown): WorkflowItem["source"] | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const source = value as Record<string, unknown>;
  if (!["file", "command", "git", "manifest", "managed-block", "user-input", "llm-output", "external-tool", "bridge"].includes(String(source.type))) return undefined;
  if (typeof source.path !== "string" || !safeExperiencePath(source.path)) return undefined;
  if (source.hash !== undefined && (typeof source.hash !== "string" || !/^[a-f0-9]{64}$/i.test(source.hash))) return undefined;
  return { type: source.type as ExperienceFact["source"]["type"], path: source.path, ...(typeof source.hash === "string" ? { hash: source.hash.toLowerCase() } : {}) };
}

function parseWorkflowItem(value: unknown, timestamp: string): WorkflowItem | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const input = value as Record<string, unknown>;
  if (typeof input.id !== "string" || !/^[A-Za-z0-9._:-]{1,120}$/.test(input.id)) return undefined;
  if (!["brief", "spec", "epic", "story", "task"].includes(String(input.type))) return undefined;
  if (typeof input.title !== "string" || input.title.trim().length === 0 || input.title.length > 200) return undefined;
  if (input.status !== undefined && !["backlog", "ready-for-dev", "in-progress", "review", "done", "blocked"].includes(String(input.status))) return undefined;
  if (input.risk !== undefined && !["normal", "high"].includes(String(input.risk))) return undefined;
  const source = input.source === undefined ? undefined : validWorkflowSource(input.source);
  if (input.source !== undefined && source === undefined) return undefined;
  const strings = (items: unknown) => Array.isArray(items) && items.every((item) => typeof item === "string" && item.length <= 500) ? items as string[] : [];
  const risk = input.risk === "high" ? "high" : "normal";
  return {
    id: input.id,
    type: input.type as WorkflowItem["type"],
    title: input.title.trim(),
    status: (input.status ?? "backlog") as WorkflowStatus,
    risk,
    review: risk === "high" ? "individual" : "cadence",
    acceptanceCriteria: strings(input.acceptanceCriteria),
    tasks: strings(input.tasks),
    evidence: strings(input.evidence),
    deferredWork: strings(input.deferredWork),
    ...(source ? { source } : {}),
    createdAt: typeof input.createdAt === "string" ? input.createdAt : timestamp,
    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : timestamp,
  };
}

function parseWorkflowConflict(value: unknown, itemId: string, timestamp: string): WorkflowConflict | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "object" || value === null) return undefined;
  const input = value as Record<string, unknown>;
  const sources = Array.isArray(input.sources) ? input.sources.map((source) => {
    if (typeof source !== "object" || source === null) return undefined;
    const record = source as Record<string, unknown>;
    return typeof record.path === "string" && safeExperiencePath(record.path) && typeof record.hash === "string" && /^[a-f0-9]{64}$/i.test(record.hash)
      ? { path: record.path, hash: record.hash.toLowerCase() }
      : undefined;
  }) : [];
  const options = Array.isArray(input.options) ? input.options.map((option) => {
    if (typeof option !== "object" || option === null) return undefined;
    const record = option as Record<string, unknown>;
    return typeof record.id === "string" && /^[A-Za-z0-9._:-]{1,80}$/.test(record.id) && typeof record.consequence === "string" && record.consequence.length > 0
      ? { id: record.id, consequence: record.consequence }
      : undefined;
  }) : [];
  const consequences = Array.isArray(input.consequences) && input.consequences.every((item) => typeof item === "string" && item.length > 0) ? input.consequences : [];
  if (typeof input.owner !== "string" || input.owner.trim() === "" || sources.length < 2 || sources.some((item) => !item) || options.length < 2 || options.some((item) => !item) || consequences.length === 0) return undefined;
  return {
    id: `conflict.${itemId}.${createHash("sha256").update(JSON.stringify(normalizeJson({ sources, options, consequences }))).digest("hex").slice(0, 12)}`,
    itemId,
    owner: input.owner.trim(),
    sources: sources as { path: string; hash: string }[],
    options: options as { id: string; consequence: string }[],
    consequences,
    status: "pending",
    createdAt: timestamp,
  };
}

async function readWorkflowItems(root: string): Promise<WorkflowItem[]> {
  const base = await checkedWorkflowRoot(root);
  return (await readWorkflowLines(join(base, "items.jsonl"))).map((line) => JSON.parse(line) as WorkflowItem);
}

async function readWorkflowCheckpoints(root: string): Promise<WorkflowCheckpoint[]> {
  const base = await checkedWorkflowRoot(root);
  return (await readWorkflowLines(join(base, "checkpoints.jsonl"))).map((line) => JSON.parse(line) as WorkflowCheckpoint);
}

async function readWorkflowConflicts(root: string): Promise<WorkflowConflict[]> {
  const base = await checkedWorkflowRoot(root);
  return (await readWorkflowLines(join(base, "decisions.jsonl"))).map((line) => JSON.parse(line) as WorkflowConflict);
}

function nextFromItem(item: WorkflowItem | undefined): WorkflowNextAction {
  if (!item) return { status: "blocked", itemId: null, action: "plan", reason: "No workflow item is available" };
  if (item.status === "blocked") return { status: "blocked", itemId: item.id, action: "resolve-conflict", reason: "Item is blocked" };
  if (item.status === "done") return { status: "ready", itemId: item.id, action: "done", reason: "Item is complete" };
  if (item.status === "review") return { status: "ready", itemId: item.id, action: "review", reason: "Item is ready for review" };
  if (item.status === "in-progress") return { status: "ready", itemId: item.id, action: "verify", reason: "Item is in progress" };
  if (item.status === "ready-for-dev") return { status: "ready", itemId: item.id, action: "implement", reason: "Item is ready for implementation" };
  return { status: "ready", itemId: item.id, action: "plan", reason: "Item is in backlog" };
}

function lastMatching<T>(items: T[], predicate: (item: T) => boolean): T | undefined {
  for (let index = items.length - 1; index >= 0; index -= 1) if (predicate(items[index]!)) return items[index];
  return undefined;
}

function controlledAction(phase: WorkflowPhase): WorkflowNextAction["action"] {
  return `approve-${phase}` as WorkflowNextAction["action"];
}

function workflowIdentity(item: WorkflowItem): unknown {
  const { createdAt: _createdAt, updatedAt: _updatedAt, ...stable } = item;
  return normalizeJson(stable);
}

function latestCheckpointsByPhase(checkpoints: WorkflowCheckpoint[], itemId: string): Map<WorkflowPhase, WorkflowCheckpoint> {
  const latest = new Map<WorkflowPhase, WorkflowCheckpoint>();
  for (const checkpoint of checkpoints.filter((item) => item.itemId === itemId)) latest.set(checkpoint.phase, checkpoint);
  return latest;
}

function unresolvedConflicts(conflicts: WorkflowConflict[], itemId: string): WorkflowConflict[] {
  const latest = new Map<string, WorkflowConflict>();
  for (const conflict of conflicts.filter((item) => item.itemId === itemId)) latest.set(conflict.id, conflict);
  return [...latest.values()].filter((conflict) => conflict.status === "pending");
}

function controlledNext(item: WorkflowItem, checkpoints: WorkflowCheckpoint[]): WorkflowNextAction | undefined {
  const latest = latestCheckpointsByPhase(checkpoints, item.id);
  for (const phase of workflowPhases) {
    const checkpoint = latest.get(phase);
    if (!checkpoint) return undefined;
    if (checkpoint.status === "pending") return { status: "ready", itemId: item.id, action: controlledAction(phase), reason: "Controlled checkpoint requires approval" };
  }
  return undefined;
}

async function validateControlledPhase(root: string, itemId: string, phase: WorkflowPhase, approved: boolean): Promise<string[]> {
  let checkpoints: WorkflowCheckpoint[] = [];
  try { checkpoints = await readWorkflowCheckpoints(root); }
  catch { checkpoints = []; }
  const latest = latestCheckpointsByPhase(checkpoints, itemId);
  const phaseIndex = workflowPhases.indexOf(phase);
  const current = latest.get(phase);
  if (approved) {
    if (current?.status !== "pending") return [`Controlled ${phase} approval requires a pending ${phase} checkpoint`];
    return [];
  }
  for (const previous of workflowPhases.slice(0, phaseIndex)) {
    if (latest.get(previous)?.status !== "approved") return [`Controlled ${phase} checkpoint requires approved ${previous}`];
  }
  if (current?.status === "pending") return [`Controlled ${phase} checkpoint is already pending`];
  if (current?.status === "approved") return [`Controlled ${phase} checkpoint is already approved`];
  return [];
}

export async function resolveWorkflowNextAction(root: string, itemId?: string): Promise<WorkflowNextAction> {
  try {
    const items = await readWorkflowItems(root);
    const item = itemId ? lastMatching(items, (candidate) => candidate.id === itemId) : items[items.length - 1];
    if (!item) return nextFromItem(undefined);
    const conflicts = await readWorkflowConflicts(root);
    if (unresolvedConflicts(conflicts, item.id).length > 0) {
      return { status: "blocked", itemId: item.id, action: "resolve-conflict", reason: "Material conflict requires owner decision" };
    }
    const checkpoints = await readWorkflowCheckpoints(root);
    const controlled = controlledNext(item, checkpoints);
    if (controlled) return controlled;
    return nextFromItem(item);
  } catch {
    return { status: "blocked", itemId: itemId ?? null, action: "plan", reason: "Workflow state cannot be inspected safely" };
  }
}

export async function planWorkflowItem(root: string, input: WorkflowItemInput | unknown): Promise<WorkflowPlan> {
  const timestamp = new Date().toISOString();
  const normalized = typeof input === "object" && input !== null && "item" in input ? input as WorkflowItemInput : { item: input };
  const blockers: string[] = [];
  const item = parseWorkflowItem(normalized.item, timestamp);
  if (!item) return { status: "blocked", action: "append", files: workflowFiles.map(([path]) => `.downstroke/workflows/${path}`), item: null, blockers: ["Workflow item is malformed"] };
  const phase = normalized.phase ?? "plan";
  if (!workflowPhases.includes(phase)) blockers.push("Controlled phase is invalid");
  let checkpoint: WorkflowCheckpoint | undefined;
  if (normalized.controlled) {
    blockers.push(...await validateControlledPhase(root, item.id, phase, normalized.approved === true));
    checkpoint = {
      id: `checkpoint.${item.id}.${phase}.${createHash("sha256").update(`${item.id}:${phase}:${timestamp}`).digest("hex").slice(0, 12)}`,
      itemId: item.id,
      phase,
      status: normalized.approved ? "approved" : "pending",
      createdAt: timestamp,
      ...(normalized.approved ? { approvedAt: timestamp } : {}),
    };
  }
  const conflict = parseWorkflowConflict(normalized.conflict, item.id, timestamp);
  if (normalized.conflict !== undefined && !conflict) blockers.push("Material conflict checkpoint is incomplete");
  if (conflict) blockers.push("Material workflow conflict requires human decision");
  let existing: WorkflowItem[] = [];
  try { existing = await readWorkflowItems(root); }
  catch { /* missing workflow storage is valid during preview */ }
  const duplicate = existing.find((candidate) => candidate.id === item.id && JSON.stringify(workflowIdentity(candidate)) === JSON.stringify(workflowIdentity(item)));
  const nextAction = conflict
    ? { status: "blocked", itemId: item.id, action: "resolve-conflict", reason: "Material conflict requires owner decision" } satisfies WorkflowNextAction
    : checkpoint && checkpoint.status === "pending"
      ? { status: "ready", itemId: item.id, action: controlledAction(checkpoint.phase), reason: "Controlled checkpoint requires approval" } satisfies WorkflowNextAction
      : nextFromItem(item);
  return {
    status: blockers.length ? "blocked" : "ready",
    action: duplicate && !checkpoint && !conflict ? "skip" : "append",
    files: workflowFiles.map(([path]) => `.downstroke/workflows/${path}`),
    item,
    ...(checkpoint ? { checkpoint } : {}),
    ...(conflict ? { conflict } : {}),
    nextAction,
    blockers,
  };
}

async function initializeWorkflowStorage(root: string): Promise<string> {
  const base = await checkedWorkflowRoot(root, true);
  for (const [path] of workflowFiles) {
    const target = join(base, path);
    if (await exists(target)) continue;
    await writeFile(target, path === "manifest.json" ? `${JSON.stringify(workflowManifest, null, 2)}\n` : "", { flag: "wx" });
  }
  return base;
}

export async function applyWorkflowItem(root: string, plan: WorkflowPlan): Promise<DoctorResult> {
  const conflictOnly = plan.blockers.length > 0 && plan.blockers.every((blocker) => blocker.startsWith("Material workflow conflict"));
  if ((plan.status === "blocked" && !conflictOnly) || !plan.item) return { id: "workflow.item", status: "fail", message: plan.blockers.join("; ") || "Workflow plan is blocked", remediation: "Correct and preview the workflow item again" };
  const fresh = await planWorkflowItem(root, { item: plan.item, ...(plan.checkpoint ? { controlled: true, phase: plan.checkpoint.phase, approved: plan.checkpoint.status === "approved" } : {}), ...(plan.conflict ? { conflict: plan.conflict } : {}) });
  if (fresh.status !== plan.status || fresh.action !== plan.action || JSON.stringify(normalizeJson(fresh.item)) !== JSON.stringify(normalizeJson(plan.item))) return { id: "workflow.item", status: "fail", message: "Workflow state changed after preview", remediation: "Preview the workflow item again" };
  const base = await initializeWorkflowStorage(root);
  if (plan.checkpoint) await appendFile(join(base, "checkpoints.jsonl"), `${JSON.stringify(plan.checkpoint)}\n`);
  if (plan.conflict) await appendFile(join(base, "decisions.jsonl"), `${JSON.stringify(plan.conflict)}\n`);
  if (plan.action === "append") await appendFile(join(base, "items.jsonl"), `${JSON.stringify(plan.item)}\n`);
  return conflictOnly
    ? { id: "workflow.item", status: "warn", message: "Workflow conflict retained; human resolution required", evidence: plan.item.id, remediation: "Resolve the reported material conflict" }
    : { id: "workflow.item", status: "ok", message: plan.action === "skip" ? "Workflow item already exists" : "Workflow item stored", evidence: plan.item.id, remediation: "No action required" };
}

export async function resolveWorkflowConflict(root: string, input: WorkflowResolveInput): Promise<DoctorResult> {
  if (!input.itemId || !input.selectedOption || !input.owner || !input.rationale) return { id: "workflow.conflict", status: "fail", message: "Conflict resolution requires itemId, selectedOption, owner and rationale", remediation: "Provide complete resolution details" };
  let conflicts: WorkflowConflict[];
  try { conflicts = await readWorkflowConflicts(root); }
  catch { return { id: "workflow.conflict", status: "fail", message: "Workflow decisions cannot be inspected safely", remediation: "Inspect workflow storage" }; }
  const conflict = lastMatching(conflicts, (item) => item.itemId === input.itemId && item.status === "pending");
  if (!conflict) return { id: "workflow.conflict", status: "fail", message: "No pending workflow conflict found", remediation: "Run workflow resume and resolve the reported item" };
  if (!conflict.options.some((option) => option.id === input.selectedOption)) return { id: "workflow.conflict", status: "fail", message: "Selected option is not declared", remediation: "Choose one of the recorded conflict options" };
  const base = await initializeWorkflowStorage(root);
  const resolved: WorkflowConflict = {
    ...conflict,
    status: "resolved",
    selectedOption: input.selectedOption,
    rationale: input.rationale,
    resolvedBy: input.owner,
    resolvedAt: new Date().toISOString(),
  };
  await appendFile(join(base, "decisions.jsonl"), `${JSON.stringify(resolved)}\n`);
  return { id: "workflow.conflict", status: "ok", message: "Workflow conflict resolution stored", evidence: `${input.itemId}:${input.selectedOption}`, remediation: "Resume the workflow" };
}

export const communicationManifest = {
  schemaVersion: "0.1.0",
  module: "downstroke-communication",
  storage: { driver: "local-jsonl", path: ".downstroke/communication" },
  modes: communicationModes,
  protectedCategories: protectedCommunicationCategories,
} as const;

const communicationFiles = [
  ["manifest.json", "file"],
  ["policy.json", "file"],
  ["preferences.jsonl", "file"],
] as const;

const defaultCommunicationBudget: Record<CommunicationMode, number> = {
  normal: 12000,
  compact: 4000,
  technical: 10000,
  audit: 14000,
  handoff: 6000,
};

function defaultCommunicationPolicy(timestamp: string): CommunicationPolicy {
  return {
    schemaVersion: "0.1.0",
    revision: 1,
    mode: "normal",
    budgetTokens: defaultCommunicationBudget.normal,
    protectedCategories: [...protectedCommunicationCategories],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

async function checkedCommunicationRoot(root: string, create = false): Promise<string> {
  const repository = await gitRoot(root);
  const downstroke = join(repository, ".downstroke");
  if (create) await mkdir(join(downstroke, "communication"), { recursive: true });
  const base = await realpath(join(downstroke, "communication"));
  if (relative(repository, base).startsWith("..")) throw new Error("Communication storage is outside repository");
  return base;
}

function parseCommunicationPolicy(value: unknown): CommunicationPolicy | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const input = value as Record<string, unknown>;
  if (input.schemaVersion !== "0.1.0" || !positiveInteger(input.revision)) return undefined;
  if (!communicationModes.includes(input.mode as CommunicationMode)) return undefined;
  if (!positiveInteger(input.budgetTokens) || Number(input.budgetTokens) > 200000) return undefined;
  if (!Array.isArray(input.protectedCategories) || input.protectedCategories.some((item) => !protectedCommunicationCategories.includes(item as ProtectedCommunicationCategory))) return undefined;
  if (typeof input.createdAt !== "string" || typeof input.updatedAt !== "string") return undefined;
  return {
    schemaVersion: "0.1.0",
    revision: input.revision,
    mode: input.mode as CommunicationMode,
    budgetTokens: input.budgetTokens,
    protectedCategories: [...new Set(input.protectedCategories as ProtectedCommunicationCategory[])],
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

export async function readCommunicationPolicy(root: string): Promise<CommunicationPolicy | null> {
  try {
    return parseCommunicationPolicy(JSON.parse(await readFile(join(await checkedCommunicationRoot(root), "policy.json"), "utf8"))) ?? null;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") return null;
    return null;
  }
}

function unsafeCommunicationPreference(value: string): string | undefined {
  if (/(roleplay|pretend to be|act as|ignore (?:all |the )?previous|override (?:security|project|source)|bypass|jailbreak)/i.test(value)) return "roleplay or instruction override preference is inactive";
  if (/(omit|hide|skip|remove|drop|compress away).*(security|permission|qa|rollback|evidence|blocker|failure|command|code|schema|acceptance)/i.test(value)) return "safety-reducing compression preference is inactive";
  if (/(less|no).*(safety|security|qa|evidence|rollback|permission)/i.test(value)) return "safety-reducing preference is inactive";
  return undefined;
}

function parseCommunicationPreference(value: unknown, timestamp: string): CommunicationPreference | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.trim().length === 0 || value.length > 1000) return undefined;
  const text = value.trim();
  const secret = /(-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----|\b(?:ghp_|github_pat_|npm_)[A-Za-z0-9_]{20,}|\bAKIA[0-9A-Z]{16}|(?:password|secret|token|api[_-]?key)\s*[:=]\s*[^\s,}]+)/i.test(text);
  const reason = secret ? "secret-like preference is inactive" : unsafeCommunicationPreference(text) ?? "safe communication style preference";
  return {
    id: `communication.preference.${createHash("sha256").update(text).digest("hex").slice(0, 16)}`,
    status: reason === "safe communication style preference" ? "active" : "inactive",
    value: text,
    reason,
    source: { type: "user-input" },
    createdAt: timestamp,
  };
}

export async function planCommunicationPolicy(root: string, input: { mode?: unknown; budgetTokens?: unknown; preference?: unknown } = {}): Promise<CommunicationPlan> {
  const timestamp = new Date().toISOString();
  const blockers: string[] = [];
  const current = await readCommunicationPolicy(root);
  const mode = input.mode ?? current?.mode ?? "normal";
  if (!communicationModes.includes(mode as CommunicationMode)) blockers.push("Communication mode is invalid");
  const selectedMode = communicationModes.includes(mode as CommunicationMode) ? mode as CommunicationMode : "normal";
  const budgetTokens = input.budgetTokens ?? current?.budgetTokens ?? defaultCommunicationBudget[selectedMode];
  if (!positiveInteger(budgetTokens) || Number(budgetTokens) > 200000) blockers.push("Communication budget must be a positive integer up to 200000");
  const next: CommunicationPolicy = {
    ...(current ?? defaultCommunicationPolicy(timestamp)),
    revision: (current?.revision ?? 0) + 1,
    mode: selectedMode,
    budgetTokens: positiveInteger(budgetTokens) ? budgetTokens : defaultCommunicationBudget[selectedMode],
    protectedCategories: [...protectedCommunicationCategories],
    updatedAt: timestamp,
  };
  const preference = parseCommunicationPreference(input.preference, timestamp);
  if (input.preference !== undefined && !preference) blockers.push("Communication preference is malformed");
  const samePolicy = current && JSON.stringify({ ...current, revision: 0, updatedAt: "" }) === JSON.stringify({ ...next, revision: 0, updatedAt: "" });
  return {
    status: blockers.length ? "blocked" : "ready",
    action: samePolicy && !preference ? "skip" : "append",
    files: communicationFiles.map(([path]) => `.downstroke/communication/${path}`),
    policy: blockers.length ? null : next,
    ...(preference ? { preference } : {}),
    blockers,
  };
}

async function initializeCommunicationStorage(root: string): Promise<string> {
  const base = await checkedCommunicationRoot(root, true);
  for (const [path] of communicationFiles) {
    const target = join(base, path);
    if (await exists(target)) continue;
    await writeFile(target, path === "manifest.json" ? `${JSON.stringify(communicationManifest, null, 2)}\n` : "", { flag: "wx" });
  }
  return base;
}

export async function applyCommunicationPolicy(root: string, plan: CommunicationPlan): Promise<DoctorResult> {
  if (plan.status === "blocked" || !plan.policy) return { id: "communication.policy", status: "fail", message: plan.blockers.join("; ") || "Communication policy plan is blocked", remediation: "Correct and preview the communication policy again" };
  const fresh = await planCommunicationPolicy(root, { mode: plan.policy.mode, budgetTokens: plan.policy.budgetTokens, ...(plan.preference ? { preference: plan.preference.value } : {}) });
  if (fresh.status !== plan.status || fresh.action !== plan.action || fresh.policy?.mode !== plan.policy.mode || fresh.policy?.budgetTokens !== plan.policy.budgetTokens) return { id: "communication.policy", status: "fail", message: "Communication policy changed after preview", remediation: "Preview the communication policy again" };
  const base = await initializeCommunicationStorage(root);
  if (plan.preference) await appendFile(join(base, "preferences.jsonl"), `${JSON.stringify(plan.preference)}\n`);
  if (plan.action === "append") {
    const target = join(base, "policy.json");
    const temporary = join(base, `policy.${randomUUID()}.tmp`);
    await writeFile(temporary, `${JSON.stringify(plan.policy, null, 2)}\n`, { flag: "wx" });
    await rename(temporary, target);
  }
  return { id: "communication.policy", status: "ok", message: plan.action === "skip" ? "Communication policy already current" : "Communication policy stored", evidence: plan.policy.mode, remediation: "No action required" };
}

export function evaluateCommunicationProtection(mode: CommunicationMode, category: ProtectedCommunicationCategory | "prose"): CommunicationProtection {
  if (category !== "prose") return { category, mode, compression: "protected", reason: `${category} must remain complete in ${mode} mode` };
  return mode === "compact" || mode === "handoff"
    ? { category, mode, compression: "allowed", reason: `${mode} mode may summarize non-protected prose` }
    : { category, mode, compression: "allowed", reason: `${mode} mode keeps normal prose detail` };
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
