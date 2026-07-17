import { access, appendFile, chmod, copyFile, cp, lstat, mkdir, mkdtemp, open, readFile, readdir, realpath, rename, rm, stat, unlink, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { basename, dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { canonicalContractHash, diffCanonicalContracts, type CmsCanonicalContentContract, type CmsContractDiff, type CmsProposal, type CmsProposalDrift, type CmsSourceFamily } from "@downstroke/cms-contracts";

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

export const tokenEconomyModes = ["greedy", "balanced", "rich"] as const;
export type TokenEconomyMode = typeof tokenEconomyModes[number];
export const tokenTaskClasses = ["deterministic", "contextual", "creative"] as const;
export type TokenTaskClass = typeof tokenTaskClasses[number];
export type TokenRouteRequest = {
  taskId: string;
  mode: TokenEconomyMode;
  taskClass: TokenTaskClass;
  risk: "normal" | "high";
  ambiguity: "low" | "high";
  toolProven: boolean;
  verification: "pending" | "passed" | "failed";
};
export type TokenRouteRecord = TokenRouteRequest & {
  schemaVersion: 1;
  recordedAt: string;
  modelTier: "none" | "economy" | "standard" | "advanced";
  contextBudget: number;
  cacheStrategy: "none" | "content-hash";
  escalationTrigger: "none" | "high-risk" | "high-ambiguity" | "verification-failed";
  verificationGate: "tool-proof" | "standard" | "blocking";
  outcome: "no-llm" | "routed" | "escalated";
};
export type TokenRoutePlan = {
  status: "ready" | "blocked";
  action: "append";
  file: ".downstroke/token-economy/ledger.jsonl";
  request: TokenRouteRequest;
  record: TokenRouteRecord | null;
  blockers: string[];
};

export const nativeReleaseChannels = ["stable", "beta", "rc"] as const;
export type NativeReleaseChannel = typeof nativeReleaseChannels[number];
export type NativeReleaseBump = "none" | "patch" | "minor" | "major";
export type NativeReleaseRequest = { channel: NativeReleaseChannel; packages: string[] };
export type NativeReleaseCommit = { sha: string; subject: string; type: string; breaking: boolean };
export type NativeReleasePackage = { path: string; name: string; currentVersion: string; manifestHash: string };
export type NativeReleasePlan = {
  schemaVersion: 1;
  policyVersion: 1;
  status: "ready" | "blocked";
  request: NativeReleaseRequest;
  branch: string | null;
  head: string | null;
  baselineTag: string | null;
  baselineSha: string | null;
  baselineVersion: string | null;
  bump: NativeReleaseBump;
  nextVersion: string | null;
  gitTag: string | null;
  distTag: "latest" | "beta" | "rc";
  commits: NativeReleaseCommit[];
  notes: { breaking: string[]; features: string[]; fixes: string[] };
  changelog: string;
  packages: NativeReleasePackage[];
  checks: string[];
  risks: string[];
  rollback: string;
  requiredApprovals: string[];
  planHash: string | null;
  blockers: string[];
};

export type KnowledgeRecord = {
  schemaVersion: 1;
  id: string;
  key: string;
  kind: "rule" | "decision" | "preference" | "stack-note" | "stack-package";
  scope: "repository" | "team" | "organization" | "global";
  status: "accepted" | "proposed" | "deprecated" | "stale" | "invalidated" | "conflicted" | "quarantined";
  trust: "verified" | "observed" | "inferred";
  stack?: string[] | undefined;
  tags?: string[] | undefined;
  summary: string;
  source: { type: "file" | "experience"; path: string; hash: string; section?: string; experienceFactId?: string };
  evidenceRefs: string[];
  lifecycle: { expiresAt?: string; stackPackage?: { technology: string; version: string } };
  transition: { reason: string; evidenceRef?: string };
  recordedAt: string;
};
export type KnowledgePlan = { status: "ready" | "blocked"; action: "append" | "skip"; record: KnowledgeRecord | null; blockers: string[]; planHash: string | null };
export type KnowledgeFinding = { code: string; severity: "warn" | "block"; recordId?: string; message: string; nextAction: string };
export type EffectiveKnowledgeRecord = KnowledgeRecord & { effectiveStatus: KnowledgeRecord["status"]; lifecycleReasons: string[] };
export type KnowledgeAudit = { status: "ok" | "warn" | "blocked"; evaluatedAt: string; records: EffectiveKnowledgeRecord[]; candidates: KnowledgeRecord[]; findings: KnowledgeFinding[]; blockers: string[] };
export type ContextCompileRequest = {
  taskId: string;
  paths: string[];
  stack?: string[];
  budget?: number;
};
export type ContextReference = {
  id: string;
  category: "identity" | "active-rules" | "relevant-facts" | "evidence" | "risks" | "unknowns" | "blocked-assumptions" | "stack-notes";
  summary: string;
  source?: { path?: string; hash?: string; section?: string } | undefined;
};
export type ContextExclusion = {
  id: string;
  reason: "budget" | "not-accepted" | "stale" | "conflicted" | "quarantined" | "secret-like-content" | "malformed" | "not-relevant";
  source?: { path?: string; hash?: string; section?: string } | undefined;
};
export type CompiledTaskContext = {
  status: "ready" | "blocked";
  task: { id: string; paths: string[]; stack: string[]; budget: number };
  sections: Record<ContextReference["category"], ContextReference[]>;
  included: ContextReference[];
  excluded: ContextExclusion[];
  blockers: string[];
  stableHash: string;
};

export const nativeWorkerRoles = ["Planner", "Repository Inspector", "Risk Auditor", "Evidence Validator", "Workflow Guardian", "Context Compiler", "Release Guardian"] as const;
export type NativeWorkerRole = typeof nativeWorkerRoles[number];
export const nativeWorkerToolIds = ["workflow.read", "repository.inspect", "simplicity.audit", "evidence.validate", "context.compile", "release.plan"] as const;
export type NativeWorkerToolId = typeof nativeWorkerToolIds[number];
export type NativeWorkerValueType = "string" | "number" | "boolean" | "array" | "object";
export type NativeWorkerObjectSchema = {
  type: "object";
  properties: Readonly<Record<string, NativeWorkerValueType>>;
  required: readonly string[];
  additionalProperties: false;
};
export type NativeWorkerManifest = {
  schemaVersion: 1;
  id: string;
  role: NativeWorkerRole;
  purpose: string;
  inputSchema: NativeWorkerObjectSchema;
  outputSchema: NativeWorkerObjectSchema;
  allowedTools: readonly NativeWorkerToolId[];
  mutationRights: readonly string[];
  budget: { maxSteps: number; maxTokens: number };
  stopCondition: { type: "complete-or-blocked"; maxFailures: number };
  evidenceRequirements: readonly string[];
  auditRequirements: readonly string[];
};
export type NativeWorkerClaim = { id: string; status: "observed" | "inferred"; statement: string; evidenceRefs: string[] };
export type NativeWorkerTask = {
  id: string;
  taskClass: TokenTaskClass;
  toolProven: boolean;
  singlePathSufficient: boolean;
  justification: string;
};
export type NativeWorkerRegistrationRequest = { manifest: unknown; task: NativeWorkerTask };
export type NativeWorkerRegistrationPlan = {
  schemaVersion: 1;
  status: "ready" | "blocked";
  mode: "deterministic" | "worker";
  action: "append" | "skip";
  task: NativeWorkerTask;
  manifest: NativeWorkerManifest | null;
  manifestHash: string | null;
  responsibilities: typeof nativeRuntimeResponsibilities;
  blockers: string[];
  nextAction: string;
  planHash: string | null;
};

export type NativeExecutionMode = "deterministic" | "worker";
export type NativeExecutionStatus = "running" | "blocked" | "failed" | "completed";
export type NativeExecutionTask = {
  id: string;
  operation: "project.verify";
  objective: string;
  owner: string;
  dependencies: string[];
  priority: "low" | "normal" | "high";
  estimateMinutes: number;
  risk: "normal" | "high";
  rollbackReference: string;
  workflowItemId?: string;
  mode?: NativeExecutionMode;
  workerId?: string;
  justification?: string;
  simplicity: SimplicityGateInput;
};
export type NativeExecutionWorker = {
  id: string;
  manifestHash: string;
  allowedTools: readonly NativeWorkerToolId[];
  budget: NativeWorkerManifest["budget"];
  stopCondition: NativeWorkerManifest["stopCondition"];
  evidenceRequirements: readonly string[];
};
export type NativeExecutionPlan = {
  schemaVersion: 1;
  status: "ready" | "blocked";
  head: string | null;
  task: NativeExecutionTask | null;
  mode: NativeExecutionMode;
  stages: typeof nativeRuntimeResponsibilities;
  selectedWorker: NativeExecutionWorker | null;
  requiredApprovals: ("execution" | "high-risk-review")[];
  workflow: WorkflowNextAction | null;
  simplicity: SimplicityGateReport | null;
  unmetDependencies: string[];
  retryOf: string | null;
  blockers: string[];
  nextAction: string;
  planHash: string | null;
};
export type NativeExecutionOutcome = {
  id: "execution.run";
  status: "ok" | "warn" | "fail";
  taskId: string | null;
  executionStatus: "completed" | "blocked" | "failed";
  planHash: string | null;
  evidence: string[];
  nextAction: string;
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
export type LocalCommitPlan = {
  status: "ready" | "blocked";
  root: ".";
  branch: string | null;
  head: string | null;
  indexTree: string | null;
  changed: string[];
  staged: string[];
  selected: string[];
  message: string;
  fingerprint: string | null;
  blockers: string[];
};
export type LocalCommitResult = {
  id: "git.commit";
  status: "ok" | "fail";
  message: string;
  branch?: string;
  commit?: string;
  remediation: string;
};
export type RepositoryTopology = {
  status: "ready" | "ambiguous" | "blocked";
  workspaceRoot: string;
  kind: "repository" | "monorepo" | "multi-repository" | "unknown";
  repositories: { root: string; branch: string | null; dirty: boolean; remotes: { name: string; fetch: string | null; push: string | null }[]; relation: "primary" | "nested" | "submodule" | "worktree" }[];
  blockers: string[];
};
export type GitCredentialRecoveryPlan = {
  status: "ready" | "blocked";
  remote: string;
  remoteUrl: string | null;
  target: { protocol: "http" | "https"; host: string; account: string } | null;
  failure: 401 | 403;
  blockers: string[];
  planHash: string;
};
export type GitCredentialRecoveryResult = { status: "ok" | "blocked" | "failed"; message: string; remediation: string };
export type HostedRepositoryImportRequest = { remote: string; destination: string; branch?: string; tag?: string; commit?: string; depth?: number; submodules?: boolean; lfs?: boolean; install?: boolean };
export type HostedRepositoryImportPlan = {
  status: "ready" | "blocked";
  provider: "github" | "codeberg" | "gitlab" | "bitbucket" | "generic";
  remote: string | null;
  destination: string;
  engine: "git";
  ref: { kind: "branch" | "tag" | "commit"; value: string } | null;
  depth: number | null;
  submodules: boolean;
  lfs: boolean;
  install: boolean;
  blockers: string[];
  planHash: string;
};
export type HostedRepositoryImportResult = { status: "ok" | "blocked" | "failed"; destination: string; message: string; remediation: string };
export type RepositoryReadiness = {
  status: "ready" | "blocked";
  provider: HostedRepositoryImportPlan["provider"];
  protocol: "https" | "ssh" | "file" | "unknown";
  destination: string;
  contextNamespace: string;
  tools: { git: boolean; lfs: boolean; providerCli: string | null };
  authentication: "not-required" | "user-verification-required";
  blockers: string[];
  nextActions: string[];
};
export type PublicationDestination = { name: string; url: string; branch: string; mode: "full-history" | "sanitized-projection"; manifest?: string; forceWithLease?: boolean; expectedOldCommit?: string };
export type PublicationPlan = { status: "ready" | "blocked"; root: string; head: string | null; destinations: (PublicationDestination & { contextNamespace: string; refspec: string; manifestHash: string | null; blockers: string[] })[]; blockers: string[]; planHash: string };
export type PublicationResult = { status: "ok" | "failed" | "blocked"; atomic: false; destinations: { name: string; status: "ok" | "failed" | "blocked"; oldCommit: string | null; newCommit: string | null; message: string }[] };
export type CmsBoundaryRequest = { enabled: boolean; database?: "postgresql" | "mysql" | "sqlite" | "mongodb" | "external"; orm?: "prisma" | "drizzle" | "typeorm" | "ef-core" | "payload" | "strapi" | "none"; deployment?: string; backup?: string; owner?: string; rollback?: string; dashboard?: { enabled: true; projectName: string; domain: string }; contentTypes?: { id: string; name: string; fields: { id: string; type: "string" | "text" | "rich-text" | "number" | "boolean" | "date" | "datetime" | "media" | "relation" | "json" | "slug"; required: boolean }[] }[]; projectionTargets?: ("prisma" | "drizzle" | "typeorm" | "ef-core" | "payload" | "strapi")[] };
export type CmsCanonicalContract = { schemaVersion: 1; revision: number; enabled: true; modules: { cms: true; dashboard: true; separatelyPackaged: true }; decisions: { database: NonNullable<CmsBoundaryRequest["database"]>; orm: NonNullable<CmsBoundaryRequest["orm"]>; deployment: string; backup: string; owner: string; rollback: string; dashboard: NonNullable<CmsBoundaryRequest["dashboard"]> }; contentTypes: NonNullable<CmsBoundaryRequest["contentTypes"]>; sourceHash: string };
export type CmsBoundaryPlan = { status: "ready" | "blocked"; action: "disabled" | "create" | "update"; detected: { projectKind: ProjectInspection["projectKind"]; stacks: string[] }; request: CmsBoundaryRequest; contract: CmsCanonicalContract | null; projections: { target: string; path: string; sourceHash: string }[]; blockers: string[]; planHash: string };
export type NeutralDesignRequest = { product: string; users: string[]; brand: { name: string; personality: "neutral" | "technical" | "editorial" | "playful" | "premium"; accent: string }; platforms: ("web" | "mobile" | "desktop")[]; accessibility: "wcag-aa" | "wcag-aaa"; content: "text-light" | "balanced" | "data-dense"; constraints: string[]; density: "compact" | "comfortable" | "spacious"; radius: "sharp" | "soft" | "rounded"; motion: "none" | "subtle" | "expressive"; theme: "light" | "dark" | "both" };
export type NeutralDesignSource = { schemaVersion: 1; revision: number; request: NeutralDesignRequest; foundations: { colors: Record<string, string>; typography: { sans: string; mono: string; scale: Record<string, number>; lineHeight: Record<string, number> }; spacing: Record<string, number>; radius: Record<string, number>; elevation: Record<string, string>; motion: { level: NeutralDesignRequest["motion"]; durations: Record<string, number>; easing: Record<string, string>; reducedMotion: true }; states: string[]; responsive: { mobile: number; tablet: number; desktop: number; wide: number } }; sourceHash: string };
export type NeutralDesignPlan = { status: "ready" | "blocked"; action: "create" | "update"; source: NeutralDesignSource | null; impacts: string[]; blockers: string[]; planHash: string };
export type DesignTokenTarget = "json" | "yaml" | "css" | "tailwind" | "scss" | "typescript";
export type DesignTokenDocument = { schemaVersion: 1; generatorVersion: 1; tokenVersion: number; sourceHash: string; tokens: { color: Record<string, string>; spacing: Record<string, string>; radius: Record<string, string>; elevation: Record<string, string>; typography: Record<string, string>; motion: Record<string, string>; zIndex: Record<string, number>; opacity: Record<string, number> }; tokenHash: string };
export type DesignTokenPlan = { status: "ready" | "blocked"; document: DesignTokenDocument | null; projections: { target: DesignTokenTarget; path: string; content: string; hash: string; changed: boolean }[]; removals: { target: DesignTokenTarget; path: string }[]; impacts: string[]; blockers: string[]; planHash: string };
export type DesignConsumerTarget = "design-system" | "tokens" | "tailwind" | "figma" | "claude" | "codex" | "copilot" | "cursor";
export type DesignConsumerPlan = { status: "ready" | "blocked"; sourceHash: string | null; revision: number | null; projections: { target: DesignConsumerTarget; path: string; content: string; hash: string; changed: boolean }[]; removals: { target: DesignConsumerTarget; path: string }[]; blockers: string[]; planHash: string };
export type DesignConsumerValidation = { status: "ok" | "drift" | "blocked"; findings: { target: DesignConsumerTarget; path: string; status: "current" | "missing" | "modified" | "unselected" }[]; guidance: string };

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
  stateHash: string | null;
  planHash: string | null;
};
export type WorkflowResolutionPlan = {
  status: "ready" | "blocked";
  input: WorkflowResolveInput;
  conflict: WorkflowConflict | null;
  blockers: string[];
  stateHash: string | null;
  planHash: string | null;
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
export const simplicityGateSteps = ["delete", "reuse", "configure", "platform", "existing-dependency", "small-local-code", "new-dependency", "abstraction", "rewrite"] as const;
export type SimplicityGateStep = typeof simplicityGateSteps[number];
export type SimplicityRiskSeverity = "low" | "medium" | "high";
export type SimplicityRiskFinding = {
  id: string;
  severity: SimplicityRiskSeverity;
  category: "unsafe-execution" | "secret-leakage" | "path-traversal" | "injection" | "redos" | "supply-chain" | "generated-artifact";
  evidence: string;
  nextAction: string;
};
export type SimplicityGateFinding = {
  id: string;
  status: "ok" | "warn" | "blocked";
  message: string;
  evidence?: string;
  nextAction: string;
};
export type SimplicityGateInput = {
  proposal?: string;
  simplerPaths?: Partial<Record<"delete" | "reuse" | "configure" | "platform" | "existing-dependency" | "small-local-code", string>>;
  risk?: string;
  dependency?: boolean | string;
  sharedPackage?: boolean | string;
  abstraction?: boolean | string;
  rewrite?: boolean | string;
  safetyException?: boolean | string;
  evidence?: string;
  consumers?: string | string[];
  impact?: string;
  owner?: string;
  tests?: string;
  rollback?: string;
  files?: { path: string; content?: string; generated?: boolean }[];
  dependencies?: { name: string; spec?: string; source?: string; hasInstallScript?: boolean }[];
};
export type SimplicityGateReport = {
  status: "ready" | "blocked";
  ladder: { step: SimplicityGateStep; considered: boolean; evidence: string }[];
  findings: SimplicityGateFinding[];
  risks: SimplicityRiskFinding[];
  exception: { active: boolean; reason: string | null };
  blockers: string[];
};
export type CodeIndexManifest = {
  schemaVersion: "0.1.0";
  module: "downstroke-code-intelligence";
  createdAt: string;
  updatedAt: string;
  files: number;
};
export type CodeIndexedFile = {
  path: string;
  hash: string;
  bytes: number;
  packagePath: string | null;
  imports: string[];
  exports: string[];
  symbols: string[];
  action: "index" | "skip";
};
export type CodePackageRecord = {
  path: string;
  name: string | null;
  packageManager: string | null;
  dependencies: Record<string, string>;
};
export type CodeStackObservation = {
  technology: string;
  version: string | null;
  source: { path: string; hash: string };
  status: "observed";
};
export type CodeIndexExclusion = { path: string; reason: string };
export type CodeIndexPlan = {
  status: "ready" | "blocked";
  action: "write" | "skip";
  files: string[];
  manifest: CodeIndexManifest | null;
  indexedFiles: CodeIndexedFile[];
  packages: CodePackageRecord[];
  stack: CodeStackObservation[];
  exclusions: CodeIndexExclusion[];
  blockers: string[];
};
export type CodeContextReport = {
  status: "ready" | "stale" | "missing-index" | "invalid-index";
  requested: string[];
  files: CodeIndexedFile[];
  stale: string[];
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

export function planTokenEconomyRoute(input: TokenRouteRequest, recordedAt = new Date().toISOString()): TokenRoutePlan {
  const blockers: string[] = [];
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(input.taskId)) blockers.push("taskId must be 1-128 safe identifier characters");
  if (!tokenEconomyModes.includes(input.mode)) blockers.push("mode must be greedy, balanced or rich");
  if (!tokenTaskClasses.includes(input.taskClass)) blockers.push("taskClass must be deterministic, contextual or creative");
  if (input.risk !== "normal" && input.risk !== "high") blockers.push("risk must be normal or high");
  if (input.ambiguity !== "low" && input.ambiguity !== "high") blockers.push("ambiguity must be low or high");
  if (typeof input.toolProven !== "boolean") blockers.push("toolProven must be boolean");
  if (input.verification !== "pending" && input.verification !== "passed" && input.verification !== "failed") blockers.push("verification must be pending, passed or failed");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(recordedAt) || !Number.isFinite(Date.parse(recordedAt))) blockers.push("recordedAt must be an ISO timestamp");
  if (blockers.length) return { status: "blocked", action: "append", file: ".downstroke/token-economy/ledger.jsonl", request: input, record: null, blockers };

  const escalationTrigger = input.verification === "failed" ? "verification-failed"
    : input.risk === "high" ? "high-risk"
    : input.ambiguity === "high" ? "high-ambiguity"
    : "none";
  const noLlm = escalationTrigger === "none" && input.taskClass === "deterministic" && input.toolProven && input.verification === "passed";
  const escalated = escalationTrigger !== "none";
  const selectedMode: TokenEconomyMode = escalated ? "rich" : input.mode;
  const tiers = { greedy: "economy", balanced: "standard", rich: "advanced" } as const;
  const budgets = { greedy: 4_000, balanced: 12_000, rich: 32_000 } as const;
  const record: TokenRouteRecord = {
    schemaVersion: 1,
    ...input,
    mode: selectedMode,
    recordedAt,
    modelTier: noLlm ? "none" : tiers[selectedMode],
    contextBudget: noLlm ? 0 : budgets[selectedMode],
    cacheStrategy: noLlm ? "none" : "content-hash",
    escalationTrigger,
    verificationGate: noLlm ? "tool-proof" : escalated ? "blocking" : "standard",
    outcome: noLlm ? "no-llm" : escalated ? "escalated" : "routed",
  };
  return { status: "ready", action: "append", file: ".downstroke/token-economy/ledger.jsonl", request: input, record, blockers: [] };
}

export async function applyTokenEconomyRoute(root: string, plan: TokenRoutePlan): Promise<DoctorResult> {
  if (plan.status !== "ready" || !plan.record) return { id: "token-economy.route", status: "fail", message: plan.blockers.join("; ") || "Token route is blocked", remediation: "Correct and preview the route again" };
  const fresh = planTokenEconomyRoute(plan.request, plan.record.recordedAt);
  if (fresh.status !== "ready" || JSON.stringify(fresh.record) !== JSON.stringify(plan.record)) return { id: "token-economy.route", status: "fail", message: "Token route changed after preview", remediation: "Preview the route again" };
  const resolved = await gitRoot(root);
  const directory = join(resolved, ".downstroke", "token-economy");
  const ledger = join(directory, "ledger.jsonl");
  await mkdir(directory, { recursive: true });
  await appendFile(ledger, `${JSON.stringify(plan.record)}\n`, { encoding: "utf8", mode: 0o600 });
  await chmod(ledger, 0o600);
  return { id: "token-economy.route", status: "ok", message: "Token route recorded", evidence: plan.record.taskId, remediation: "Run verification required by the recorded gate" };
}

const contextCategories = ["identity", "active-rules", "relevant-facts", "evidence", "risks", "unknowns", "blocked-assumptions", "stack-notes"] as const;
const knowledgeStatuses: KnowledgeRecord["status"][] = ["accepted", "proposed", "deprecated", "stale", "invalidated", "conflicted", "quarantined"];
const knowledgeKinds: KnowledgeRecord["kind"][] = ["rule", "decision", "preference", "stack-note", "stack-package"];

function emptyContextSections(): CompiledTaskContext["sections"] {
  return Object.fromEntries(contextCategories.map((category) => [category, []])) as unknown as CompiledTaskContext["sections"];
}

async function readJsonLines(root: string, path: string): Promise<unknown[]> {
  const file = await readLocalFile(await gitRoot(root), path);
  if (file.kind === "missing") return [];
  if (file.kind !== "file") throw new Error(`${path} cannot be inspected safely`);
  if (file.content.byteLength > 1_048_576) throw new Error(`${path} exceeds the 1 MiB context limit`);
  const lines = file.content.toString("utf8").split(/\r?\n/).filter(Boolean);
  if (lines.length > 5_000) throw new Error(`${path} exceeds the 5000-record context limit`);
  return lines.map((line) => { try { return JSON.parse(line) as unknown; } catch { return undefined; } });
}

export const knowledgeManifest = Object.freeze({ schemaVersion: 1 as const, module: "downstroke-knowledge", storage: { driver: "local-jsonl", path: ".downstroke/knowledge/records.jsonl" }, candidateThreshold: 3, allowNetwork: false, allowShell: false });

function knowledgeId(value: Pick<KnowledgeRecord, "key" | "kind" | "scope" | "summary" | "source">): string {
  return `knowledge.${createHash("sha256").update(JSON.stringify(normalizeJson({ key: value.key, kind: value.kind, scope: value.scope, summary: value.summary, source: { type: value.source.type, path: value.source.path, experienceFactId: value.source.experienceFactId ?? null } }))).digest("hex")}`;
}

function parseKnowledgeRecord(value: unknown): KnowledgeRecord | undefined {
  if (!plainObject(value) || unknownKeys(value, ["schemaVersion", "id", "key", "kind", "scope", "status", "trust", "stack", "tags", "summary", "source", "evidenceRefs", "lifecycle", "transition", "recordedAt"]).length || value.schemaVersion !== 1) return undefined;
  if (typeof value.key !== "string" || !/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/.test(value.key) || value.key.length > 128) return undefined;
  if (!knowledgeKinds.includes(value.kind as KnowledgeRecord["kind"]) || !knowledgeStatuses.includes(value.status as KnowledgeRecord["status"]) || !["repository", "team", "organization", "global"].includes(String(value.scope)) || !["verified", "observed", "inferred"].includes(String(value.trust))) return undefined;
  if (value.stack !== undefined && (!Array.isArray(value.stack) || value.stack.some((item) => !boundedText(item, 80)) || new Set(value.stack).size !== value.stack.length)) return undefined;
  if (value.tags !== undefined && (!Array.isArray(value.tags) || value.tags.some((item) => !boundedText(item, 80)) || new Set(value.tags).size !== value.tags.length)) return undefined;
  if (!boundedText(value.summary, 500) || secretLike(value.summary) || absolutePathLike(value.summary)) return undefined;
  if (!plainObject(value.source) || unknownKeys(value.source, ["type", "path", "hash", "section", "experienceFactId"]).length || !["file", "experience"].includes(String(value.source.type)) || typeof value.source.path !== "string" || !safeExperiencePath(value.source.path) || typeof value.source.hash !== "string" || !/^[a-f0-9]{64}$/i.test(value.source.hash)) return undefined;
  if (value.source.section !== undefined && !boundedText(value.source.section, 120)) return undefined;
  if (value.source.type === "experience" && (typeof value.source.experienceFactId !== "string" || !/^[A-Za-z0-9._:-]{1,128}$/.test(value.source.experienceFactId))) return undefined;
  if (!Array.isArray(value.evidenceRefs) || value.evidenceRefs.length > 32 || value.evidenceRefs.some((item) => !boundedText(item, 120)) || new Set(value.evidenceRefs).size !== value.evidenceRefs.length) return undefined;
  if (!plainObject(value.lifecycle) || unknownKeys(value.lifecycle, ["expiresAt", "stackPackage"]).length) return undefined;
  if (value.lifecycle.expiresAt !== undefined && (typeof value.lifecycle.expiresAt !== "string" || Number.isNaN(Date.parse(value.lifecycle.expiresAt)) || new Date(value.lifecycle.expiresAt).toISOString() !== value.lifecycle.expiresAt)) return undefined;
  if (value.lifecycle.stackPackage !== undefined && (!plainObject(value.lifecycle.stackPackage) || unknownKeys(value.lifecycle.stackPackage, ["technology", "version"]).length || !boundedText(value.lifecycle.stackPackage.technology, 80) || !boundedText(value.lifecycle.stackPackage.version, 80))) return undefined;
  if (!plainObject(value.transition) || unknownKeys(value.transition, ["reason", "evidenceRef"]).length || !boundedText(value.transition.reason, 240) || secretLike(value.transition.reason) || (value.transition.evidenceRef !== undefined && !boundedText(value.transition.evidenceRef, 120))) return undefined;
  if (typeof value.recordedAt !== "string" || Number.isNaN(Date.parse(value.recordedAt)) || new Date(value.recordedAt).toISOString() !== value.recordedAt) return undefined;
  const source: KnowledgeRecord["source"] = { type: value.source.type as "file" | "experience", path: value.source.path, hash: value.source.hash.toLowerCase(), ...(typeof value.source.section === "string" ? { section: value.source.section } : {}), ...(typeof value.source.experienceFactId === "string" ? { experienceFactId: value.source.experienceFactId } : {}) };
  const record: KnowledgeRecord = {
    schemaVersion: 1,
    id: String(value.id), key: value.key, kind: value.kind as KnowledgeRecord["kind"], scope: value.scope as KnowledgeRecord["scope"], status: value.status as KnowledgeRecord["status"], trust: value.trust as KnowledgeRecord["trust"],
    ...(value.stack === undefined ? {} : { stack: [...value.stack as string[]].sort() }), ...(value.tags === undefined ? {} : { tags: [...value.tags as string[]].sort() }), summary: value.summary.trim(), source,
    evidenceRefs: [...value.evidenceRefs as string[]].sort(), lifecycle: { ...(typeof value.lifecycle.expiresAt === "string" ? { expiresAt: value.lifecycle.expiresAt } : {}), ...(plainObject(value.lifecycle.stackPackage) ? { stackPackage: { technology: String(value.lifecycle.stackPackage.technology), version: String(value.lifecycle.stackPackage.version) } } : {}) },
    transition: { reason: value.transition.reason, ...(typeof value.transition.evidenceRef === "string" ? { evidenceRef: value.transition.evidenceRef } : {}) }, recordedAt: value.recordedAt,
  };
  return typeof value.id === "string" && value.id === knowledgeId(record) ? record : undefined;
}

async function readKnowledgeHistory(root: string): Promise<KnowledgeRecord[]> {
  const resolved = await gitRoot(root);
  const records = await readLocalFile(resolved, ".downstroke/knowledge/records.jsonl");
  if (records.kind === "missing") return [];
  if (records.kind !== "file") throw new Error("Knowledge registry cannot be inspected safely");
  const manifest = await readLocalFile(resolved, ".downstroke/knowledge/manifest.json");
  if (manifest.kind !== "file" || JSON.stringify(normalizeJson(JSON.parse(manifest.content.toString("utf8")) as unknown)) !== JSON.stringify(normalizeJson(knowledgeManifest))) throw new Error("Knowledge manifest is missing or malformed");
  if (records.content.byteLength > 1024 * 1024) throw new Error("Knowledge registry exceeds the 1 MiB safety limit");
  const lines = records.content.toString("utf8").split(/\r?\n/).filter(Boolean);
  if (lines.length > 5_000) throw new Error("Knowledge registry exceeds the 5,000-record safety limit");
  return lines.map((line) => {
    const record = parseKnowledgeRecord(JSON.parse(line) as unknown);
    if (!record) throw new Error("Knowledge registry contains a malformed record");
    return record;
  });
}

export async function listKnowledgeRecords(root: string): Promise<KnowledgeRecord[]> {
  const latest = new Map<string, KnowledgeRecord>();
  for (const record of await readKnowledgeHistory(root)) latest.set(record.id, record);
  return [...latest.values()].sort((left, right) => left.id.localeCompare(right.id));
}

function knowledgePlanHash(plan: KnowledgePlan): string {
  const { status: _status, action: _action, blockers: _blockers, planHash: _hash, ...stable } = plan;
  return createHash("sha256").update(JSON.stringify(normalizeJson(stable))).digest("hex");
}

export async function planKnowledgeRecord(root: string, input: unknown): Promise<KnowledgePlan> {
  const blockers: string[] = [];
  if (!plainObject(input)) return { status: "blocked", action: "append", record: null, blockers: ["Knowledge record input must be an object"], planHash: null };
  const allowed = ["schemaVersion", "id", "key", "kind", "scope", "status", "trust", "stack", "tags", "summary", "source", "evidenceRefs", "lifecycle", "transition", "recordedAt"];
  const extra = unknownKeys(input, allowed);
  if (extra.length) blockers.push(`Knowledge record input contains unknown fields: ${extra.join(", ")}`);
  let resolved = root;
  let recordedAt = typeof input.recordedAt === "string" ? input.recordedAt : "";
  let source: Record<string, unknown> = plainObject(input.source) ? { ...input.source } : {};
  try {
    resolved = await gitRoot(root);
    if (!recordedAt) {
      const timestamp = await runGit(resolved, ["show", "-s", "--format=%cI", "HEAD"]);
      if (timestamp.code !== 0) blockers.push("Knowledge record requires a committed Git HEAD");
      else recordedAt = new Date(timestamp.stdout).toISOString();
    }
    if (source.type === "file" && typeof source.path === "string" && safeExperiencePath(source.path)) {
      const file = await readLocalFile(resolved, source.path);
      if (file.kind !== "file") blockers.push("Knowledge source file is missing or unreadable");
      else source.hash = createHash("sha256").update(file.content).digest("hex");
    }
  } catch (error: unknown) { blockers.push(error instanceof Error ? error.message : "Knowledge repository cannot be inspected"); }
  const candidate = { ...input, schemaVersion: 1, source, recordedAt } as Record<string, unknown>;
  if (typeof candidate.id !== "string" && typeof candidate.key === "string" && typeof candidate.kind === "string" && typeof candidate.scope === "string" && typeof candidate.summary === "string" && plainObject(candidate.source)) {
    candidate.id = knowledgeId({ key: candidate.key, kind: candidate.kind as KnowledgeRecord["kind"], scope: candidate.scope as KnowledgeRecord["scope"], summary: candidate.summary.trim(), source: candidate.source as KnowledgeRecord["source"] });
  }
  const record = parseKnowledgeRecord(candidate);
  if (!record) blockers.push("Knowledge record is malformed or its deterministic id does not match");
  if (record?.trust === "verified" && !record.evidenceRefs.length) blockers.push("Verified knowledge requires evidence references");
  if (["accepted", "deprecated", "invalidated"].includes(record?.status ?? "") && !record?.transition.evidenceRef) blockers.push("Accepted and terminal knowledge transitions require workflow evidence");
  let action: "append" | "skip" = "append";
  try {
    if (record) {
      const existing = await readKnowledgeHistory(resolved);
      if (existing.some((item) => JSON.stringify(normalizeJson(item)) === JSON.stringify(normalizeJson(record)))) action = "skip";
    }
  } catch (error: unknown) { if (!(error instanceof Error && /manifest/.test(error.message) && !(await exists(join(resolved, ".downstroke", "knowledge", "records.jsonl"))))) blockers.push(error instanceof Error ? error.message : "Knowledge registry cannot be inspected"); }
  const plan: KnowledgePlan = { status: blockers.length ? "blocked" : "ready", action, record: blockers.length ? null : record ?? null, blockers, planHash: null };
  if (plan.status === "ready") plan.planHash = knowledgePlanHash(plan);
  return plan;
}

export async function applyKnowledgeRecord(root: string, plan: KnowledgePlan, expectedPlanHash: string): Promise<DoctorResult> {
  if (plan.status !== "ready" || !plan.record || !plan.planHash || expectedPlanHash !== plan.planHash || knowledgePlanHash(plan) !== plan.planHash) return { id: "knowledge.record", status: "fail", message: "Knowledge plan is blocked, malformed or has the wrong hash", remediation: "Preview the knowledge record again" };
  const resolved = await gitRoot(root);
  try {
    if ((await readKnowledgeHistory(resolved)).some((item) => JSON.stringify(normalizeJson(item)) === JSON.stringify(normalizeJson(plan.record)))) return { id: "knowledge.record", status: "ok", message: "Knowledge record already exists", evidence: plan.record.id };
  } catch { return { id: "knowledge.record", status: "fail", message: "Knowledge registry cannot be validated", remediation: "Repair the registry and preview again" }; }
  const fresh = await planKnowledgeRecord(resolved, plan.record);
  if (fresh.status !== "ready" || fresh.planHash !== plan.planHash || fresh.action !== plan.action) return { id: "knowledge.record", status: "fail", message: "Knowledge state changed after preview", remediation: "Preview the knowledge record again" };
  const base = join(resolved, ".downstroke", "knowledge");
  await mkdir(base, { recursive: true });
  const lockPath = join(base, "write.lock");
  let lock: Awaited<ReturnType<typeof open>> | undefined;
  try {
    lock = await open(lockPath, "wx", 0o600);
    if (!(await exists(join(base, "manifest.json")))) await writeFile(join(base, "manifest.json"), JSON.stringify(knowledgeManifest), { flag: "wx", mode: 0o600 });
    if (plan.action === "append") await appendFile(join(base, "records.jsonl"), `${JSON.stringify(plan.record)}\n`, { encoding: "utf8", mode: 0o600 });
    return { id: "knowledge.record", status: "ok", message: plan.action === "skip" ? "Knowledge record already exists" : "Knowledge record stored", evidence: plan.record.id };
  } catch { return { id: "knowledge.record", status: "fail", message: "Knowledge record could not be stored", remediation: "Inspect the registry and preview again" }; }
  finally { await lock?.close().catch(() => undefined); if (lock) await unlink(lockPath).catch(() => undefined); }
}

export async function auditProjectKnowledge(root: string, evaluatedAt = new Date().toISOString()): Promise<KnowledgeAudit> {
  const findings: KnowledgeFinding[] = [];
  const blockers: string[] = [];
  let records: KnowledgeRecord[] = [];
  if (Number.isNaN(Date.parse(evaluatedAt)) || new Date(evaluatedAt).toISOString() !== evaluatedAt) return { status: "blocked", evaluatedAt, records: [], candidates: [], findings: [], blockers: ["Knowledge audit time is invalid"] };
  try { records = await listKnowledgeRecords(root); }
  catch { return { status: "blocked", evaluatedAt, records: [], candidates: [], findings: [{ code: "knowledge.lifecycle-invalid", severity: "block", message: "Knowledge registry validation failed", nextAction: "Repair or restore the registry" }], blockers: ["Knowledge registry validation failed"] }; }
  const stack = await detectCodeStack(root).catch(() => ({ status: "blocked" as const, stack: [], packages: [], blockers: ["Stack detection failed"] }));
  const effective: EffectiveKnowledgeRecord[] = [];
  for (const record of records) {
    const lifecycleReasons: string[] = [];
    let effectiveStatus = record.status;
    if (record.lifecycle.expiresAt && Date.parse(record.lifecycle.expiresAt) <= Date.parse(evaluatedAt)) { effectiveStatus = "stale"; lifecycleReasons.push("expired"); findings.push({ code: "knowledge.expired", severity: "warn", recordId: record.id, message: `${record.key} expired`, nextAction: "Refresh or invalidate the record with evidence" }); }
    if (record.source.type === "file") {
      try { const file = await readLocalFile(await gitRoot(root), record.source.path); if (file.kind !== "file" || createHash("sha256").update(file.content).digest("hex") !== record.source.hash) { effectiveStatus = "stale"; lifecycleReasons.push("source-drift"); findings.push({ code: "knowledge.source-drift", severity: "warn", recordId: record.id, message: `${record.key} source changed`, nextAction: "Review the changed source and append a refreshed record" }); } }
      catch { effectiveStatus = "stale"; lifecycleReasons.push("source-unavailable"); findings.push({ code: "knowledge.source-unavailable", severity: "warn", recordId: record.id, message: `${record.key} source is unavailable`, nextAction: "Restore the source or invalidate the record with evidence" }); }
    }
    const packagePolicy = record.lifecycle.stackPackage;
    if (packagePolicy) {
      const observed = stack.stack.find((item) => item.technology.toLowerCase() === packagePolicy.technology.toLowerCase());
      if (observed?.version && observed.version !== packagePolicy.version) { effectiveStatus = "stale"; lifecycleReasons.push("stack-mismatch"); findings.push({ code: "knowledge.stack-mismatch", severity: "warn", recordId: record.id, message: `${record.key} expects ${packagePolicy.version} but observed ${observed.version}`, nextAction: "Review the stack package for the observed version" }); }
      else if (!observed?.version) { effectiveStatus = "stale"; lifecycleReasons.push("stack-unknown"); findings.push({ code: "knowledge.stack-unknown", severity: "warn", recordId: record.id, message: `${record.key} stack version is unavailable`, nextAction: "Restore stack evidence" }); }
    }
    if (record.trust === "inferred") findings.push({ code: "knowledge.low-trust", severity: "warn", recordId: record.id, message: `${record.key} remains inferred`, nextAction: "Add observed or verified evidence before relying on this record" });
    if (record.status === "accepted" && !record.evidenceRefs.length) { const message = `${record.key} lacks evidence`; findings.push({ code: "knowledge.evidence-gap", severity: "block", recordId: record.id, message, nextAction: "Append an evidenced transition" }); blockers.push(message); }
    effective.push({ ...record, effectiveStatus, lifecycleReasons });
  }
  const activeGroups = new Map<string, EffectiveKnowledgeRecord[]>();
  for (const record of effective.filter((item) => item.effectiveStatus === "accepted")) {
    const key = `${record.scope}:${record.key}`;
    activeGroups.set(key, [...activeGroups.get(key) ?? [], record]);
  }
  for (const group of activeGroups.values()) if (new Set(group.map((record) => record.summary)).size > 1) {
    for (const record of group) { record.effectiveStatus = "conflicted"; record.lifecycleReasons.push("active-conflict"); }
    const message = `Conflicting accepted knowledge for ${group[0]!.key}`;
    findings.push({ code: "knowledge.conflict", severity: "block", recordId: group[0]!.id, message, nextAction: "Record the human-owned resolution and invalidate the losing candidate" }); blockers.push(message);
  }
  const candidates: KnowledgeRecord[] = [];
  const observationGroups = new Map<string, EffectiveKnowledgeRecord[]>();
  for (const record of effective.filter((item) => item.effectiveStatus === "proposed" && ["observed", "verified"].includes(item.trust))) {
    const key = `${record.kind}:${record.scope}:${record.key}:${record.summary}`;
    observationGroups.set(key, [...observationGroups.get(key) ?? [], record]);
  }
  for (const group of observationGroups.values()) if (new Set(group.map((item) => `${item.source.path}:${item.source.hash}:${item.evidenceRefs.join(",")}`)).size >= knowledgeManifest.candidateThreshold) {
    const first = group[0]!;
    const candidate: KnowledgeRecord = { ...first, id: `knowledge.${createHash("sha256").update(`candidate:${first.kind}:${first.scope}:${first.key}:${first.summary}`).digest("hex")}`, status: "proposed", trust: "inferred", evidenceRefs: [...new Set(group.flatMap((item) => item.evidenceRefs))].sort(), transition: { reason: "Repeated distinct observations reached the native candidate threshold." } };
    candidates.push(candidate);
    findings.push({ code: "knowledge.candidate", severity: "warn", recordId: candidate.id, message: `Proposed candidate available for ${candidate.key}`, nextAction: "Review and explicitly add an accepted evidenced record if appropriate" });
  }
  try {
    const releases = await readReleaseEvents(await gitRoot(root));
    const latest = releases.at(-1);
    if (latest?.state === "failed" || latest?.state === "prepared") { const message = latest.state === "failed" ? "Latest release verification failed" : "Prepared release lacks ready verification"; findings.push({ code: "release.evidence", severity: "block", message, nextAction: "Run native release verification and resolve its evidence" }); blockers.push(message); }
  } catch { findings.push({ code: "release.lifecycle-invalid", severity: "block", message: "Release evidence state is malformed", nextAction: "Repair release evidence before readiness" }); blockers.push("Release evidence state is malformed"); }
  return { status: blockers.length ? "blocked" : findings.length ? "warn" : "ok", evaluatedAt, records: effective.sort((a, b) => a.id.localeCompare(b.id)), candidates: candidates.sort((a, b) => a.id.localeCompare(b.id)), findings, blockers };
}

function contextSource(source: { path?: string; hash?: string; section?: string } | undefined): ContextReference["source"] | undefined {
  if (!source) return undefined;
  return { ...(source.path ? { path: source.path } : {}), ...(source.hash ? { hash: source.hash } : {}), ...(source.section ? { section: source.section } : {}) };
}

function compactSummary(value: unknown): string {
  const text = typeof value === "string" ? value : JSON.stringify(normalizeJson(value));
  return text.replace(/\s+/g, " ").slice(0, 240);
}

function addContextReference(compiled: CompiledTaskContext, reference: ContextReference, categoryBudget: number): void {
  const section = compiled.sections[reference.category];
  if (compiled.included.length >= compiled.task.budget || section.length >= categoryBudget) {
    compiled.excluded.push({ id: reference.id, reason: "budget", source: reference.source });
    return;
  }
  section.push(reference);
  compiled.included.push(reference);
}

function addRequiredContextUnknown(compiled: CompiledTaskContext, reference: ContextReference, categoryBudget: number): void {
  const section = compiled.sections.unknowns;
  if (section.length >= categoryBudget || compiled.included.length >= compiled.task.budget) {
    const displaced = section.length >= categoryBudget ? section.pop() : compiled.included.at(-1);
    if (displaced) {
      const displacedSection = compiled.sections[displaced.category];
      const sectionIndex = displacedSection.findIndex(({ id }) => id === displaced.id);
      if (sectionIndex >= 0) displacedSection.splice(sectionIndex, 1);
      const included = compiled.included.findIndex(({ id }) => id === displaced.id);
      if (included >= 0) compiled.included.splice(included, 1);
      compiled.excluded.push({ id: displaced.id, reason: "budget", source: displaced.source });
    }
  }
  section.push(reference);
  compiled.included.push(reference);
}

function excludeContext(compiled: CompiledTaskContext, exclusion: ContextExclusion): void {
  compiled.excluded.push(exclusion);
}

function knowledgeCategory(kind: KnowledgeRecord["kind"]): ContextReference["category"] {
  if (kind === "rule") return "active-rules";
  if (kind === "stack-note") return "stack-notes";
  return "relevant-facts";
}

function knowledgeRelevant(record: KnowledgeRecord, request: ContextCompileRequest): boolean {
  const normalize = (value: string) => value.normalize("NFC").trim().toLowerCase();
  const requestedStack = new Set((request.stack ?? []).map(normalize));
  if (record.stack?.length && requestedStack.size) return record.stack.some((item) => requestedStack.has(normalize(item)));
  if (record.tags?.some((tag) => normalize(tag) === normalize(request.taskId))) return true;
  return !record.stack?.length;
}

function unsafeContextSummary(value: string): boolean {
  return secretLike(value) || absolutePathLike(value) || /\b(ignore|override|disregard)\b.{0,40}\b(instruction|rule|system|developer|previous)\b/i.test(value);
}

function addSafeContextReference(compiled: CompiledTaskContext, reference: ContextReference, categoryBudget: number): void {
  if (unsafeContextSummary(reference.summary)) {
    compiled.blockers.push(`Critical leakage in context reference: ${reference.id}`);
    excludeContext(compiled, { id: reference.id, reason: "secret-like-content", source: reference.source });
    return;
  }
  addContextReference(compiled, reference, categoryBudget);
}

export async function compileTaskContext(root: string, input: ContextCompileRequest): Promise<CompiledTaskContext> {
  const taskId = input.taskId.normalize("NFC").trim();
  const paths = [...new Set(input.paths.map((path) => posixPath(path).normalize("NFC").trim()))].sort();
  const requestedStack = [...new Set((input.stack ?? []).map((item) => item.normalize("NFC").trim()).filter(Boolean))];
  const detectedStack = await detectCodeStack(root).then((result) => result.stack.map(({ technology }) => technology), () => []);
  const stack = [...new Set([...requestedStack, ...detectedStack])].sort((a, b) => a.localeCompare(b));
  const budget = input.budget ?? 24;
  const compiled: CompiledTaskContext = { status: "ready", task: { id: taskId, paths, stack, budget }, sections: emptyContextSections(), included: [], excluded: [], blockers: [], stableHash: "" };
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(taskId)) compiled.blockers.push("taskId must be 1-128 safe identifier characters");
  if (!Number.isInteger(budget) || budget < 1 || budget > 200) compiled.blockers.push("budget must be an integer from 1 to 200");
  for (const path of paths) if (!safeExperiencePath(path)) compiled.blockers.push(`Unsafe context path: ${path}`);
  const categoryBudget = Math.max(1, Math.floor(budget / contextCategories.length));
  if (compiled.blockers.length) {
    compiled.status = "blocked";
    compiled.stableHash = createHash("sha256").update(JSON.stringify(normalizeJson(JSON.parse(JSON.stringify({ task: compiled.task, sections: compiled.sections, included: compiled.included, excluded: compiled.excluded, blockers: compiled.blockers })) as unknown))).digest("hex");
    return compiled;
  }

  try {
    const facts = (await readJsonLines(root, ".downstroke/experience/facts.jsonl")).map(parseExperienceFact);
    const seenFacts = new Set<string>();
    for (const fact of facts.sort((left, right) => String(left?.id).localeCompare(String(right?.id)))) {
      if (!fact) { excludeContext(compiled, { id: "experience.<malformed>", reason: "malformed" }); continue; }
      if (seenFacts.has(fact.id)) { compiled.blockers.push(`Duplicate experience fact: ${fact.id}`); excludeContext(compiled, { id: fact.id, reason: "conflicted", source: contextSource(fact.source) }); continue; }
      seenFacts.add(fact.id);
      const scanned = scanExperienceFact(fact);
      const source = contextSource(scanned.source);
      if (scanned.security.secretScan === "failed") { compiled.blockers.push(`Critical leakage in experience fact: ${scanned.id}`); excludeContext(compiled, { id: scanned.id, reason: "secret-like-content", source }); continue; }
      if (scanned.status === "quarantined" || scanned.status === "rejected") { excludeContext(compiled, { id: scanned.id, reason: "quarantined", source }); continue; }
      if (scanned.status === "conflicted") { excludeContext(compiled, { id: scanned.id, reason: "conflicted", source }); continue; }
      if (scanned.status === "stale" || scanned.expiresAt && Date.parse(scanned.expiresAt) <= Date.now()) { excludeContext(compiled, { id: scanned.id, reason: "stale", source }); continue; }
      const category: ContextReference["category"] = scanned.status === "unknown" ? "unknowns" : scanned.kind === "risk" || scanned.kind === "security" ? "risks" : scanned.kind === "rule" || scanned.kind === "gate" ? "active-rules" : "relevant-facts";
      addContextReference(compiled, { id: scanned.id, category, summary: compactSummary(scanned.value), source }, categoryBudget);
      if (scanned.evidence) addContextReference(compiled, { id: scanned.evidence.ref, category: "evidence", summary: scanned.evidence.type, source }, categoryBudget);
    }
  } catch { compiled.blockers.push("Experience state cannot be inspected safely"); }

  try {
    const items = (await readWorkflowItems(root)).sort((left, right) => left.id.localeCompare(right.id));
    const matches = items.filter((item) => item.id.normalize("NFC") === taskId || paths.some((path) => item.source?.path?.normalize("NFC") === path));
    if (!matches.length) addContextReference(compiled, { id: `workflow.${taskId}.missing`, category: "unknowns", summary: "No matching workflow item found" }, categoryBudget);
    for (const item of matches) {
      addSafeContextReference(compiled, { id: item.id, category: "identity", summary: `${item.type}:${item.status}:${item.title}`, source: contextSource(item.source) }, categoryBudget);
      if (item.risk === "high") addContextReference(compiled, { id: `${item.id}.risk`, category: "risks", summary: "High-risk workflow item requires individual review", source: contextSource(item.source) }, categoryBudget);
      for (const deferred of item.deferredWork) addSafeContextReference(compiled, { id: `${item.id}.deferred.${createHash("sha256").update(deferred).digest("hex").slice(0, 8)}`, category: "blocked-assumptions", summary: deferred, source: contextSource(item.source) }, categoryBudget);
      for (const evidenceItem of item.evidence) addSafeContextReference(compiled, { id: `${item.id}.evidence.${createHash("sha256").update(evidenceItem).digest("hex").slice(0, 8)}`, category: "evidence", summary: evidenceItem, source: contextSource(item.source) }, categoryBudget);
    }
    for (const conflict of (await readWorkflowConflicts(root)).filter((item) => item.status === "pending" && (item.itemId === taskId || matches.some((match) => match.id === item.itemId))).sort((a, b) => a.id.localeCompare(b.id))) {
      compiled.blockers.push(`Pending workflow conflict: ${conflict.id}`);
      addSafeContextReference(compiled, { id: conflict.id, category: "blocked-assumptions", summary: `Pending owner decision: ${conflict.consequences.join("; ")}`, source: conflict.sources[0] }, categoryBudget);
    }
  } catch { addContextReference(compiled, { id: "workflow.unavailable", category: "unknowns", summary: "Workflow state is unavailable" }, categoryBudget); }

  try {
    const code = await queryCodeContext(root, paths, "context");
    if (code.status === "missing-index") addRequiredContextUnknown(compiled, { id: "code.index.missing", category: "unknowns", summary: code.reason }, categoryBudget);
    if (code.status === "invalid-index") compiled.blockers.push(code.reason);
    if (code.status === "stale") addRequiredContextUnknown(compiled, { id: "code.index.stale", category: "unknowns", summary: code.reason }, categoryBudget);
    const stale = new Set(code.stale);
    for (const file of code.files.sort((left, right) => left.path.localeCompare(right.path))) if (!stale.has(file.path)) addContextReference(compiled, { id: `code.${file.path}`, category: "identity", summary: `code symbols=${file.symbols.length} imports=${file.imports.length}`, source: { path: file.path, hash: file.hash } }, categoryBudget);
    for (const stalePath of [...code.stale].sort()) excludeContext(compiled, { id: `code.${stalePath}`, reason: "stale", source: { path: stalePath } });
  } catch { addContextReference(compiled, { id: "code.unavailable", category: "unknowns", summary: "Code intelligence state is unavailable" }, categoryBudget); }

  try {
    const audit = await auditProjectKnowledge(root);
    compiled.blockers.push(...audit.findings.filter((finding) => finding.severity === "block" && finding.code.startsWith("knowledge.")).map((finding) => finding.message));
    const records = audit.records;
    for (const record of records) {
      if (record.effectiveStatus !== "accepted") { excludeContext(compiled, { id: record.id, reason: record.effectiveStatus === "quarantined" ? "quarantined" : record.effectiveStatus === "conflicted" ? "conflicted" : record.effectiveStatus === "stale" || record.effectiveStatus === "deprecated" || record.effectiveStatus === "invalidated" ? "stale" : "not-accepted", source: record.source }); continue; }
      if (!knowledgeRelevant(record, { ...input, taskId, paths, stack })) { excludeContext(compiled, { id: record.id, reason: "not-relevant", source: record.source }); continue; }
      addSafeContextReference(compiled, { id: record.id, category: knowledgeCategory(record.kind), summary: `${record.kind}: ${record.summary}`, source: record.source }, categoryBudget);
    }
  } catch { compiled.blockers.push("Knowledge registry cannot be inspected safely"); }

  for (const category of contextCategories) compiled.sections[category].sort((a, b) => a.id.localeCompare(b.id));
  compiled.included.sort((a, b) => a.category.localeCompare(b.category) || a.id.localeCompare(b.id));
  compiled.excluded.sort((a, b) => a.id.localeCompare(b.id) || a.reason.localeCompare(b.reason));
  compiled.blockers.sort();
  compiled.status = compiled.blockers.length ? "blocked" : "ready";
  const stableContent = { task: compiled.task, sections: compiled.sections, included: compiled.included, excluded: compiled.excluded, blockers: compiled.blockers };
  compiled.stableHash = createHash("sha256").update(JSON.stringify(normalizeJson(JSON.parse(JSON.stringify(stableContent)) as unknown))).digest("hex");
  return compiled;
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

function runGit(root: string, args: readonly string[], rawStdout = false): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn("git", ["-C", root, ...args], { shell: false, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk: string) => { stdout += chunk; });
    child.stderr.setEncoding("utf8").on("data", (chunk: string) => { stderr += chunk; });
    child.once("error", (error) => resolve({ code: 1, stdout, stderr: error.message }));
    child.once("exit", (code) => resolve({ code: code ?? 1, stdout: rawStdout ? stdout : stdout.trim(), stderr: stderr.trim() }));
  });
}

function runGitInput(root: string, args: readonly string[], input: string): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn("git", ["-C", root, ...args], { shell: false, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = ""; let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk: string) => { stdout += chunk; });
    child.stderr.setEncoding("utf8").on("data", (chunk: string) => { stderr += chunk; });
    child.once("error", (error) => resolve({ code: 1, stdout, stderr: error.message }));
    child.once("exit", (code) => resolve({ code: code ?? 1, stdout: stdout.trim(), stderr: stderr.trim() }));
    child.stdin.end(input);
  });
}

function runProcess(command: string, args: readonly string[], cwd: string): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(command, [...args], { cwd, shell: false, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = ""; let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk: string) => { stdout += chunk; });
    child.stderr.setEncoding("utf8").on("data", (chunk: string) => { stderr += chunk; });
    child.once("error", (error) => resolve({ code: 1, stdout, stderr: error.message }));
    child.once("exit", (code) => resolve({ code: code ?? 1, stdout: stdout.trim(), stderr: stderr.trim() }));
  });
}

function nulPaths(value: string): string[] {
  return value.split("\0").filter(Boolean).map((path) => path.replaceAll("\\", "/")).sort();
}

function validCommitMessage(message: string): boolean {
  return /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9._/-]+\))?!?: [^\r\n]+$/.test(message)
    && !/\bAI\b|artificial intelligence|co-authored-by/i.test(message);
}

async function gitRoot(root: string): Promise<string> {
  const result = await runGit(root, ["rev-parse", "--show-toplevel"]);
  if (result.code !== 0 || !result.stdout) throw new Error(result.stderr || "Not a Git repository");
  return realpath(result.stdout);
}

function safeRemote(value: string): string {
  try { const url = new URL(value); if (url.username || url.password) { url.username = ""; url.password = ""; } return url.toString(); }
  catch { return value.replace(/^(https?:\/\/)[^/@]+@/i, "$1"); }
}

export async function inspectRepositoryTopology(start: string): Promise<RepositoryTopology> {
  const requested = resolve(start); const blockers: string[] = []; let primary: string | null = null;
  try { primary = await gitRoot(requested); } catch { /* A workspace parent may not itself be a repository. */ }
  const workspace = primary ?? requested; const roots = new Set<string>(); if (primary) roots.add(primary);
  const walk = async (directory: string, depth: number): Promise<void> => {
    if (depth > 5) return;
    let entries; try { entries = await readdir(directory, { withFileTypes: true }); } catch { return; }
    if (entries.some(({ name }) => name === ".git")) { try { roots.add(await gitRoot(directory)); } catch { /* malformed repositories are ignored here and surfaced when selected */ } }
    for (const entry of entries) if (entry.isDirectory() && ![".git", "node_modules", "dist", "build", "coverage", ".downstroke"].includes(entry.name)) await walk(join(directory, entry.name), depth + 1);
  };
  await walk(workspace, 0);
  const ordered = [...roots].sort();
  const submodules = new Set<string>();
  if (primary) {
    const listed = await runGit(primary, ["config", "-f", ".gitmodules", "--get-regexp", "path"]);
    if (listed.code === 0) for (const line of listed.stdout.split(/\r?\n/)) { const path = line.trim().split(/\s+/).slice(1).join(" "); if (path) submodules.add(resolve(primary, path)); }
  }
  const repositories = await Promise.all(ordered.map(async (root) => {
    const [branch, dirty, remotes, gitEntry] = await Promise.all([runGit(root, ["symbolic-ref", "--quiet", "--short", "HEAD"]), runGit(root, ["status", "--porcelain"]), runGit(root, ["remote", "-v"]), lstat(join(root, ".git")).catch(() => null)]);
    const map = new Map<string, { name: string; fetch: string | null; push: string | null }>();
    for (const line of remotes.stdout.split(/\r?\n/)) { const match = /^(\S+)\s+(\S+)\s+\((fetch|push)\)$/.exec(line); if (!match) continue; const item = map.get(match[1]!) ?? { name: match[1]!, fetch: null, push: null }; item[match[3] as "fetch" | "push"] = safeRemote(match[2]!); map.set(item.name, item); }
    const relation = root === primary ? "primary" : submodules.has(root) ? "submodule" : gitEntry?.isFile() ? "worktree" : "nested";
    return { root: relative(workspace, root).replaceAll("\\", "/") || ".", branch: branch.code === 0 ? branch.stdout : null, dirty: dirty.code === 0 && dirty.stdout.length > 0, remotes: [...map.values()].sort((a, b) => a.name.localeCompare(b.name)), relation } as const;
  }));
  const ambiguous = repositories.filter(({ relation }) => relation === "nested");
  if (ambiguous.length && primary) blockers.push(`Undeclared nested repositories require target selection: ${ambiguous.map(({ root }) => root).join(", ")}`);
  let monorepo = false;
  if (primary && repositories.length === 1) {
    try { const manifest = JSON.parse(await readFile(join(primary, "package.json"), "utf8")) as Record<string, unknown>; monorepo = Array.isArray(manifest.workspaces); } catch { /* optional marker */ }
    monorepo ||= await Promise.any(["nx.json", "turbo.json", "pnpm-workspace.yaml"].map((name) => access(join(primary!, name)).then(() => true))).catch(() => false);
  }
  return { status: !repositories.length ? "blocked" : blockers.length ? "ambiguous" : "ready", workspaceRoot: ".", kind: !repositories.length ? "unknown" : repositories.length > 1 ? "multi-repository" : monorepo ? "monorepo" : "repository", repositories, blockers: !repositories.length ? ["No Git repository was found"] : blockers };
}

export async function planGitCredentialRecovery(root: string, remote: string, account: string, failure: number): Promise<GitCredentialRecoveryPlan> {
  const blockers: string[] = [];
  if (!/^[A-Za-z0-9._-]+$/.test(remote)) blockers.push("Remote name contains unsafe characters");
  if (!account || /[\r\n\0]/.test(account)) blockers.push("Account is required and must be a single safe line");
  if (failure !== 401 && failure !== 403) blockers.push("Credential recovery requires an observed HTTPS 401 or 403");
  let remoteUrl: string | null = null; let target: GitCredentialRecoveryPlan["target"] = null;
  try {
    const resolved = await gitRoot(root);
    const configured = await runGit(resolved, ["remote", "get-url", remote]);
    if (configured.code !== 0) blockers.push(`Remote ${remote} was not found`);
    else {
      remoteUrl = safeRemote(configured.stdout);
      try {
        const url = new URL(configured.stdout);
        if (url.protocol !== "https:" && url.protocol !== "http:") blockers.push("Credential recovery supports HTTPS remotes only");
        else if (url.username || url.password) blockers.push("Remove embedded URL credentials before recovery");
        else target = { protocol: url.protocol.slice(0, -1) as "http" | "https", host: url.host, account };
      } catch { blockers.push("Remote URL is not a valid HTTPS URL"); }
    }
  } catch { blockers.push("No Git repository was found"); }
  const stable = { status: blockers.length ? "blocked" : "ready", remote, remoteUrl, target, failure: failure === 403 ? 403 : 401, blockers } as const;
  return { ...stable, planHash: createHash("sha256").update(JSON.stringify(normalizeJson(stable))).digest("hex") };
}

export async function applyGitCredentialRecovery(root: string, plan: GitCredentialRecoveryPlan): Promise<GitCredentialRecoveryResult> {
  const fresh = await planGitCredentialRecovery(root, plan.remote, plan.target?.account ?? "", plan.failure);
  if (plan.status !== "ready" || !plan.target || fresh.status !== "ready" || fresh.planHash !== plan.planHash) return { status: "blocked", message: "Credential recovery plan is stale or blocked", remediation: "Preview the recovery again and review the exact target" };
  const input = `protocol=${plan.target.protocol}\nhost=${plan.target.host}\nusername=${plan.target.account}\n\n`;
  const result = await runGitInput(await gitRoot(root), ["credential", "reject"], input);
  return result.code === 0
    ? { status: "ok", message: `Rejected the cached credential for ${plan.target.account}@${plan.target.host}`, remediation: "Retry authentication interactively with the intended account before any push" }
    : { status: "failed", message: "Git credential rejection failed", remediation: "Review the configured credential helper without exposing stored secrets" };
}

export async function planHostedRepositoryImport(workspace: string, request: HostedRepositoryImportRequest): Promise<HostedRepositoryImportPlan> {
  const blockers: string[] = []; const refs = [request.branch && ["branch", request.branch], request.tag && ["tag", request.tag], request.commit && ["commit", request.commit]].filter(Boolean) as ["branch" | "tag" | "commit", string][];
  if (refs.length > 1) blockers.push("Select only one branch, tag or commit");
  if (refs.some(([, value]) => !value || /[\r\n\0]/.test(value))) blockers.push("Ref contains unsafe characters");
  if (request.depth !== undefined && (!Number.isSafeInteger(request.depth) || request.depth < 1)) blockers.push("Depth must be a positive integer");
  let remote: string | null = null; let provider: HostedRepositoryImportPlan["provider"] = "generic";
  const shorthand = /^(github|codeberg|gitlab|bitbucket):([A-Za-z0-9._-]+\/[A-Za-z0-9._-]+)$/.exec(request.remote);
  if (shorthand) { const shorthandProvider = shorthand[1] as "github" | "codeberg" | "gitlab" | "bitbucket"; provider = shorthandProvider; const host = shorthandProvider === "github" ? "github.com" : shorthandProvider === "gitlab" ? "gitlab.com" : shorthandProvider === "bitbucket" ? "bitbucket.org" : "codeberg.org"; remote = `https://${host}/${shorthand[2]}.git`; }
  else {
      try { const url = new URL(request.remote); if (!['https:', 'ssh:', 'file:'].includes(url.protocol) || url.password || url.protocol !== "ssh:" && url.username) blockers.push("Remote must be credential-free HTTPS or SSH"); else { remote = url.toString(); provider = url.hostname.includes("github.com") ? "github" : url.hostname.includes("codeberg.org") ? "codeberg" : url.hostname.includes("gitlab.com") ? "gitlab" : url.hostname.includes("bitbucket.org") ? "bitbucket" : "generic"; } }
    catch { if (/^git@[A-Za-z0-9.-]+:[A-Za-z0-9._/-]+$/.test(request.remote)) remote = request.remote; else blockers.push("Remote is not a supported shorthand, HTTPS URL or SSH URL"); }
  }
  const destination = resolve(workspace, request.destination);
  try { if ((await readdir(destination)).length) blockers.push("Destination must be empty"); } catch { /* Missing destination is expected. */ }
  let parent = dirname(destination); while (parent !== dirname(parent)) { try { const root = await gitRoot(parent); if (destination.startsWith(`${root}${process.platform === "win32" ? "\\" : "/"}`)) blockers.push("Destination is inside an existing Git repository"); break; } catch { parent = dirname(parent); } }
  const stable = { status: blockers.length ? "blocked" : "ready", provider, remote, destination, engine: "git", ref: refs[0] ? { kind: refs[0][0], value: refs[0][1] } : null, depth: request.depth ?? null, submodules: request.submodules ?? false, lfs: request.lfs ?? false, install: request.install ?? true, blockers } as const;
  return { ...stable, planHash: createHash("sha256").update(JSON.stringify(normalizeJson(stable))).digest("hex") };
}

export async function applyHostedRepositoryImport(workspace: string, plan: HostedRepositoryImportPlan): Promise<HostedRepositoryImportResult> {
  const { planHash, ...stable } = plan;
  const actualHash = createHash("sha256").update(JSON.stringify(normalizeJson(stable))).digest("hex");
  if (plan.status !== "ready" || !plan.remote || actualHash !== planHash) return { status: "blocked", destination: plan.destination, message: "Import plan is blocked or malformed", remediation: "Preview the import again" };
  const refRequest = plan.ref ? { [plan.ref.kind]: plan.ref.value } : {};
  const fresh = await planHostedRepositoryImport(workspace, { remote: plan.remote, destination: plan.destination, ...refRequest, ...(plan.depth ? { depth: plan.depth } : {}), submodules: plan.submodules, lfs: plan.lfs, install: plan.install });
  if (fresh.status !== "ready" || fresh.planHash !== plan.planHash) return { status: "blocked", destination: plan.destination, message: "Import target changed after preview", remediation: "Review a new import plan" };
  const args = ["clone"];
  if (plan.depth) args.push("--depth", String(plan.depth));
  if (plan.ref?.kind === "branch" || plan.ref?.kind === "tag") args.push("--branch", plan.ref.value);
  if (plan.submodules) args.push("--recurse-submodules");
  args.push("--", plan.remote, plan.destination);
  const cloned = await runProcess("git", args, workspace);
  if (cloned.code !== 0) { await rm(plan.destination, { recursive: true, force: true }); return { status: "failed", destination: plan.destination, message: "Git clone failed", remediation: "Run repository readiness diagnostics and retry" }; }
  if (plan.ref?.kind === "commit" && (await runGit(plan.destination, ["checkout", "--detach", plan.ref.value])).code !== 0) return { status: "failed", destination: plan.destination, message: "Commit checkout failed", remediation: "Inspect the cloned repository and select a reachable commit" };
  if (plan.lfs && ((await runGit(plan.destination, ["lfs", "install", "--local"])).code !== 0 || (await runGit(plan.destination, ["lfs", "pull"])).code !== 0)) return { status: "failed", destination: plan.destination, message: "Git LFS setup failed", remediation: "Install Git LFS and retry in the cloned repository" };
  return { status: "ok", destination: plan.destination, message: "Repository cloned and verified", remediation: plan.install ? "Initialize Downstroke in the cloned repository" : "Downstroke initialization was intentionally skipped" };
}

export async function diagnoseRepositoryReadiness(workspace: string, request: HostedRepositoryImportRequest): Promise<RepositoryReadiness> {
  const plan = await planHostedRepositoryImport(workspace, request);
  const git = (await runProcess("git", ["--version"], workspace)).code === 0;
  const lfs = git && (await runProcess("git", ["lfs", "version"], workspace)).code === 0;
  const cli = plan.provider === "github" ? "gh" : plan.provider === "gitlab" ? "glab" : plan.provider === "bitbucket" ? "bb" : plan.provider === "codeberg" ? "tea" : null;
  const providerCli = cli && (await runProcess(cli, ["--version"], workspace)).code === 0 ? cli : null;
  const protocol = plan.remote?.startsWith("https:") ? "https" : plan.remote?.startsWith("ssh:") || plan.remote?.startsWith("git@") ? "ssh" : plan.remote?.startsWith("file:") ? "file" : "unknown";
  const blockers = [...plan.blockers]; if (!git) blockers.push("Git is unavailable"); if (plan.lfs && !lfs) blockers.push("Git LFS is unavailable");
  const nextActions = protocol === "file" ? [] : protocol === "ssh" ? ["Verify the selected SSH key with the provider before cloning"] : [providerCli ? `Verify the intended account with ${providerCli} auth status` : "Sign in with the provider credential manager for only the intended host and account"];
  return { status: blockers.length ? "blocked" : "ready", provider: plan.provider, protocol, destination: plan.destination, contextNamespace: `repository.${createHash("sha256").update(`${plan.remote}:${plan.destination}`).digest("hex").slice(0, 12)}`, tools: { git, lfs, providerCli }, authentication: protocol === "file" ? "not-required" : "user-verification-required", blockers, nextActions };
}

function safePublicationUrl(value: string): boolean {
  try { const url = new URL(value); return ["https:", "ssh:", "file:"].includes(url.protocol) && !url.password && (url.protocol === "ssh:" || !url.username); }
  catch { return /^git@[A-Za-z0-9.-]+:[A-Za-z0-9._/-]+$/.test(value); }
}

export async function planPublication(root: string, requested: readonly PublicationDestination[]): Promise<PublicationPlan> {
  const blockers: string[] = []; let resolved = root; let head: string | null = null;
  try { resolved = await gitRoot(root); const result = await runGit(resolved, ["rev-parse", "HEAD"]); if (result.code === 0) head = result.stdout; else blockers.push("Repository HEAD is unavailable"); } catch { blockers.push("No Git repository was found"); }
  if (requested.length < 2) blockers.push("Publication requires at least two independent destinations");
  const names = new Set<string>();
  const destinations = await Promise.all(requested.map(async (item) => {
    const own: string[] = [];
    if (!/^[a-z][a-z0-9._-]*$/.test(item.name) || names.has(item.name)) own.push("Destination name is invalid or duplicated"); else names.add(item.name);
    if (!safePublicationUrl(item.url)) own.push("Destination URL is invalid or contains credentials");
    if (item.mode !== "full-history" && item.mode !== "sanitized-projection") own.push("Destination mode is invalid");
    if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(item.branch) || item.branch.includes("..")) own.push("Destination branch is invalid");
    let manifestHash: string | null = null;
    if (item.mode === "sanitized-projection") {
      if (!item.manifest || isAbsolute(item.manifest) || item.manifest.split(/[\\/]/).includes("..")) own.push("Sanitized destinations require a repository-relative manifest");
      else try { manifestHash = createHash("sha256").update(await readFile(join(resolved, item.manifest))).digest("hex"); } catch { own.push("Projection manifest is missing"); }
    } else if (item.manifest) own.push("Full-history destinations cannot declare a projection manifest");
    if (item.forceWithLease && (!item.expectedOldCommit || !/^[a-f0-9]{40,64}$/.test(item.expectedOldCommit))) own.push("Force-with-lease requires the expected old commit");
    return { ...item, contextNamespace: `destination.${createHash("sha256").update(`${item.name}:${item.url}`).digest("hex").slice(0, 12)}`, refspec: `HEAD:refs/heads/${item.branch}`, manifestHash, blockers: own };
  }));
  if (destinations.some((item) => item.forceWithLease) && !destinations.some((item) => item.mode === "full-history")) blockers.push("Forced projection requires a full-history destination in the same plan");
  if (destinations.some((item, index) => item.forceWithLease && !destinations.slice(0, index).some((candidate) => candidate.mode === "full-history"))) blockers.push("A full-history destination must precede every forced projection");
  for (const item of destinations) blockers.push(...item.blockers.map((value) => `${item.name}: ${value}`));
  const stable = { status: blockers.length ? "blocked" : "ready", root: resolved, head, destinations, blockers } as const;
  return { ...stable, planHash: createHash("sha256").update(JSON.stringify(normalizeJson(stable))).digest("hex") };
}

async function safeProjectionSource(root: string, relativePath: string): Promise<void> {
  if (isAbsolute(relativePath) || relativePath.split(/[\\/]/).includes("..")) throw new Error(`Unsafe projection path: ${relativePath}`);
  if (relativePath.split(/[\\/]/)[0] === ".git") throw new Error("Git internals cannot be projected");
  const source = join(root, relativePath); const info = await lstat(source); if (info.isSymbolicLink()) throw new Error(`Symlinks are forbidden in projections: ${relativePath}`);
  if (info.isDirectory()) for (const entry of await readdir(source)) await safeProjectionSource(root, join(relativePath, entry));
  else if (info.size > 10 * 1024 * 1024) throw new Error(`Oversized projection file requires an explicit smaller artifact: ${relativePath}`);
  else if (projectionSecretLike(await readFile(source, "utf8").catch(() => ""))) throw new Error(`Secret-like content found in projection: ${relativePath}`);
}

function projectionSecretLike(content: string): boolean {
  const githubToken = "ghp" + "_"; const npmToken = "npm" + "_";
  return new RegExp("-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----").test(content) || new RegExp(`\\b(?:${githubToken}|github_pat_|${npmToken})[A-Za-z0-9_]{20,}`).test(content) || /\bAKIA[0-9A-Z]{16}/.test(content) || /["']?(?:password|secret|token|api[_-]?key|private[_-]?key)["']?\s*[:=]\s*["'][A-Za-z0-9_./+=-]{16,}["']/i.test(content);
}

export async function preparePublicationProjection(root: string, manifestPath: string, target?: string): Promise<{ root: string; commit: string; checks: ProjectVerification }> {
  const resolved = await gitRoot(root); const manifest = JSON.parse(await readFile(join(resolved, manifestPath), "utf8")) as { schemaVersion: number; include: string[]; forbiddenTopLevel: string[]; overrides?: { source: string; target: string }[]; rootPackageRemoveScripts?: string[]; gitignore?: string };
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.include) || !Array.isArray(manifest.forbiddenTopLevel)) throw new Error("Projection manifest is invalid");
  const projection = target ?? await mkdtemp(join(tmpdir(), "downstroke-publication-"));
  if (target) try { if ((await readdir(projection)).length) throw new Error("Projection target must be empty"); } catch (error: unknown) { if (!(typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT")) throw error; }
  await mkdir(projection, { recursive: true });
  for (const path of manifest.include) { await safeProjectionSource(resolved, path); await mkdir(dirname(join(projection, path)), { recursive: true }); await cp(join(resolved, path), join(projection, path), { recursive: true }); }
  for (const override of manifest.overrides ?? []) { await safeProjectionSource(resolved, override.source); await mkdir(dirname(join(projection, override.target)), { recursive: true }); await cp(join(resolved, override.source), join(projection, override.target), { recursive: true }); }
  if (manifest.rootPackageRemoveScripts?.length) { const path = join(projection, "package.json"); const value = JSON.parse(await readFile(path, "utf8")) as { scripts?: Record<string, string> }; for (const name of manifest.rootPackageRemoveScripts) delete value.scripts?.[name]; await writeFile(path, `${JSON.stringify(value, null, 2)}\n`); }
  if (manifest.gitignore) await writeFile(join(projection, ".gitignore"), manifest.gitignore);
  const projectedNames = new Set(await readdir(projection)); const leaked = manifest.forbiddenTopLevel.filter((path) => projectedNames.has(path)); if (leaked.length) throw new Error(`Forbidden projection paths found: ${leaked.join(", ")}`);
  if (projectedNames.has("package-lock.json") && (await runLocalCommand(process.platform === "win32" ? "npm.cmd" : "npm", ["ci", "--ignore-scripts"], projection)).code !== 0) throw new Error("Projection dependency installation failed");
  const inspection = await inspectProject(projection); const checks = await runProjectChecks(projection, inspection.scripts);
  if (checks.status === "failed") throw new Error("Projection checks failed");
  await runProcess("git", ["init", "-b", "main"], projection); await runGit(projection, ["add", "--all"]); await runGit(projection, ["-c", "user.name=Downstroke", "-c", "user.email=downstroke@example.invalid", "commit", "-m", "chore: publish sanitized projection"]);
  const commit = await runGit(projection, ["rev-parse", "HEAD"]); if (commit.code !== 0) throw new Error("Projection commit failed");
  return { root: projection, commit: commit.stdout, checks };
}

export async function applyPublication(root: string, plan: PublicationPlan, authorizedDestinations: readonly string[]): Promise<PublicationResult> {
  const { planHash, ...stable } = plan; const actual = createHash("sha256").update(JSON.stringify(normalizeJson(stable))).digest("hex");
  if (plan.status !== "ready" || actual !== planHash) return { status: "blocked", atomic: false, destinations: plan.destinations.map(({ name }) => ({ name, status: "blocked", oldCommit: null, newCommit: null, message: "Publication plan is blocked or malformed" })) };
  const current = await runGit(await gitRoot(root), ["rev-parse", "HEAD"]); if (current.code !== 0 || current.stdout !== plan.head) return { status: "blocked", atomic: false, destinations: plan.destinations.map(({ name }) => ({ name, status: "blocked", oldCommit: null, newCommit: null, message: "Repository changed after preview" })) };
  const authorized = new Set(authorizedDestinations); const results: PublicationResult["destinations"] = []; let fullHistoryVerified = false;
  for (const destination of plan.destinations) {
    if (!authorized.has(destination.name)) { results.push({ name: destination.name, status: "blocked", oldCommit: destination.expectedOldCommit ?? null, newCommit: null, message: "Fresh destination authorization is required" }); continue; }
    if (destination.forceWithLease && !fullHistoryVerified) { results.push({ name: destination.name, status: "blocked", oldCommit: destination.expectedOldCommit ?? null, newCommit: null, message: "A full-history destination must succeed before forced projection" }); continue; }
    let publicationRoot = plan.root; let newCommit = plan.head; let temporary = false;
    try {
      if (destination.mode === "sanitized-projection") {
        if (!destination.manifest || createHash("sha256").update(await readFile(join(plan.root, destination.manifest))).digest("hex") !== destination.manifestHash) throw new Error("Projection manifest changed after preview");
        const prepared = await preparePublicationProjection(plan.root, destination.manifest); publicationRoot = prepared.root; newCommit = prepared.commit; temporary = true;
      }
      const args = ["push", "--porcelain"];
      if (destination.forceWithLease) args.push(`--force-with-lease=refs/heads/${destination.branch}:${destination.expectedOldCommit}`);
      args.push("--", destination.url, `HEAD:refs/heads/${destination.branch}`);
      const pushed = await runGit(publicationRoot, args);
      if (pushed.code !== 0) throw new Error("Git push failed");
      if (destination.mode === "full-history") fullHistoryVerified = true;
      results.push({ name: destination.name, status: "ok", oldCommit: destination.expectedOldCommit ?? null, newCommit, message: "Destination published independently" });
    } catch (error: unknown) { results.push({ name: destination.name, status: "failed", oldCommit: destination.expectedOldCommit ?? null, newCommit, message: error instanceof Error ? error.message : "Publication failed" }); }
    finally { if (temporary) await rm(publicationRoot, { recursive: true, force: true }); }
  }
  return { status: results.every(({ status }) => status === "ok") ? "ok" : results.some(({ status }) => status === "ok") ? "failed" : "blocked", atomic: false, destinations: results };
}

export async function planCmsBoundary(root: string, request: CmsBoundaryRequest): Promise<CmsBoundaryPlan> {
  const blockers: string[] = []; let inspection: ProjectInspection;
  try { inspection = await inspectProject(root); } catch { inspection = { projectKind: "consumer", stage: "empty", stacks: [], scripts: [], signals: [], originInference: "Project inspection failed." }; blockers.push("Project cannot be inspected"); }
  let revision = 1; let existing = false;
  try { const path = join(await gitRoot(root), ".downstroke", "cms", "contract.json"); try { const value = JSON.parse(await readFile(path, "utf8")) as { revision?: unknown }; if (!Number.isSafeInteger(value.revision) || Number(value.revision) < 1) blockers.push("Existing CMS contract is malformed"); else { revision = Number(value.revision) + 1; existing = true; } } catch (error: unknown) { if (!(typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT")) blockers.push("Existing CMS contract is unreadable or malformed"); } } catch { blockers.push("CMS project is not a Git repository"); }
  if (typeof request.enabled !== "boolean") blockers.push("CMS enabled decision is required");
  if (!request.enabled) {
    const stable: Omit<CmsBoundaryPlan, "planHash"> = { status: blockers.length ? "blocked" : "ready", action: "disabled", detected: { projectKind: inspection.projectKind, stacks: inspection.stacks }, request: { enabled: false }, contract: null, projections: [], blockers };
    return { ...stable, planHash: createHash("sha256").update(JSON.stringify(normalizeJson(stable))).digest("hex") };
  }
  for (const [name, value] of Object.entries({ database: request.database, orm: request.orm, deployment: request.deployment, backup: request.backup, owner: request.owner, rollback: request.rollback })) if (typeof value !== "string" || !value.trim()) blockers.push(`${name} decision is required`); else if (!boundedText(value, 300) || secretLike(value)) blockers.push(`${name} decision is unsafe`);
  if (!request.dashboard || request.dashboard.enabled !== true || !boundedText(request.dashboard.projectName, 120) || !/^(?:https?:\/\/)?[A-Za-z0-9.-]+(?::\d+)?(?:\/.*)?$/.test(request.dashboard.domain)) blockers.push("Enabled CMS requires Downstroke dashboard project name and deployment domain");
  const contentTypes = request.contentTypes ?? []; const typeIds = new Set<string>();
  for (const type of contentTypes) {
    if (!/^[a-z][a-z0-9-]*$/.test(type.id) || typeIds.has(type.id) || !boundedText(type.name, 120)) { blockers.push("Content type identifiers and names must be unique and valid"); continue; } typeIds.add(type.id);
    const fieldIds = new Set<string>(); for (const field of type.fields ?? []) { if (!/^[a-z][a-z0-9-]*$/.test(field.id) || fieldIds.has(field.id) || !["string", "text", "rich-text", "number", "boolean", "date", "datetime", "media", "relation", "json", "slug"].includes(field.type) || typeof field.required !== "boolean") blockers.push(`Content type ${type.id} has an invalid field`); else fieldIds.add(field.id); }
  }
  const targets = [...new Set(request.projectionTargets ?? [])]; if (targets.some((target) => !["prisma", "drizzle", "typeorm", "ef-core", "payload", "strapi"].includes(target))) blockers.push("CMS projection target is unsupported");
  if (request.orm !== "none" && request.orm && !targets.includes(request.orm)) blockers.push("The selected ORM must be declared as a projection target");
  let contract: CmsCanonicalContract | null = null; let projections: CmsBoundaryPlan["projections"] = [];
  if (!blockers.length) {
    const decisions = { database: request.database!, orm: request.orm!, deployment: request.deployment!.trim(), backup: request.backup!.trim(), owner: request.owner!.trim(), rollback: request.rollback!.trim(), dashboard: request.dashboard! };
    const canonical = { schemaVersion: 1 as const, revision, enabled: true as const, modules: { cms: true as const, dashboard: true as const, separatelyPackaged: true as const }, decisions, contentTypes };
    const sourceHash = createHash("sha256").update(JSON.stringify(normalizeJson(canonical))).digest("hex"); contract = { ...canonical, sourceHash };
    projections = targets.sort().map((target) => ({ target, path: `.downstroke/cms/projections/${target}.json`, sourceHash }));
  }
  const stable: Omit<CmsBoundaryPlan, "planHash"> = { status: blockers.length ? "blocked" : "ready", action: existing ? "update" : "create", detected: { projectKind: inspection.projectKind, stacks: inspection.stacks }, request, contract, projections, blockers };
  return { ...stable, planHash: createHash("sha256").update(JSON.stringify(normalizeJson(stable))).digest("hex") };
}

export async function applyCmsBoundary(root: string, plan: CmsBoundaryPlan, expectedPlanHash: string): Promise<DoctorResult> {
  if (plan.status !== "ready" || expectedPlanHash !== plan.planHash) return { id: "cms.boundary", status: "fail", message: "CMS boundary plan is blocked or unauthorized", remediation: "Preview and authorize the exact current plan" };
  const fresh = await planCmsBoundary(root, plan.request); if (fresh.planHash !== plan.planHash) return { id: "cms.boundary", status: "fail", message: "CMS boundary changed after preview", remediation: "Review a new CMS boundary plan" };
  if (!plan.request.enabled || !plan.contract) return { id: "cms.boundary", status: "ok", message: "CMS remains disabled; no files or dependencies were added", evidence: plan.planHash };
  const resolved = await gitRoot(root); const base = join(resolved, ".downstroke", "cms"); await mkdir(join(base, "projections"), { recursive: true }); const lockPath = join(base, "boundary.lock"); let lock: Awaited<ReturnType<typeof open>> | undefined;
  try {
    lock = await open(lockPath, "wx", 0o600); const latest = await planCmsBoundary(resolved, plan.request); if (latest.planHash !== plan.planHash) return { id: "cms.boundary", status: "fail", message: "CMS boundary changed before write", remediation: "Review a new CMS boundary plan" };
    await writeFile(join(base, "contract.json.tmp"), `${JSON.stringify(plan.contract, null, 2)}\n`); await rename(join(base, "contract.json.tmp"), join(base, "contract.json"));
    const selected = new Set(plan.projections.map(({ target }) => `${target}.json`)); for (const name of await readdir(join(base, "projections"))) if (name.endsWith(".json") && !selected.has(name)) await unlink(join(base, "projections", name));
    for (const projection of plan.projections) await writeFile(join(resolved, projection.path), `${JSON.stringify({ schemaVersion: 1, target: projection.target, authority: ".downstroke/cms/contract.json", sourceHash: projection.sourceHash }, null, 2)}\n`);
    return { id: "cms.boundary", status: "ok", message: "Canonical CMS boundary stored", evidence: plan.contract.sourceHash, remediation: "Review authentication and RBAC before exposing remote administration" };
  } catch (error: unknown) { return { id: "cms.boundary", status: "fail", message: error instanceof Error ? error.message : "CMS boundary write failed", remediation: "Inspect CMS state and preview again" }; }
  finally { await lock?.close().catch(() => undefined); await unlink(lockPath).catch(() => undefined); }
}

function accentContrast(accent: string): { foreground: string; ratio: number } {
  const channels = [accent.slice(1, 3), accent.slice(3, 5), accent.slice(5, 7)].map((value) => Number.parseInt(value, 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
  const white = 1.05 / (luminance + 0.05); const black = (luminance + 0.05) / 0.05;
  return white >= black ? { foreground: "#ffffff", ratio: white } : { foreground: "#000000", ratio: black };
}

async function readNeutralDesignSource(root: string): Promise<NeutralDesignSource> {
  const parsed = JSON.parse(await readFile(join(await gitRoot(root), ".downstroke", "design-system", "source.json"), "utf8")) as unknown;
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("Existing design-system source is malformed");
  const source = parsed as NeutralDesignSource;
  const { sourceHash, ...canonical } = source;
  if (source.schemaVersion !== 1 || !Number.isSafeInteger(source.revision) || source.revision < 1 || typeof source.request !== "object" || source.request === null || typeof source.foundations !== "object" || source.foundations === null || !/^[a-f0-9]{64}$/.test(sourceHash) || createHash("sha256").update(JSON.stringify(normalizeJson(canonical))).digest("hex") !== sourceHash) throw new Error("Existing design-system source is malformed");
  return source;
}

export async function planNeutralDesignSystem(root: string, request: NeutralDesignRequest): Promise<NeutralDesignPlan> {
  const blockers: string[] = []; let revision = 1; let previous: NeutralDesignSource | null = null;
  try { await gitRoot(root); } catch { blockers.push("Design-system project is not a Git repository"); }
  for (const [name, value] of [["product", request.product], ["brand name", request.brand?.name]] as const) if (!boundedText(value, 160) || secretLike(value)) blockers.push(`${name} is required and must be safe`);
  if (!Array.isArray(request.users) || !request.users.length || request.users.some((value) => !boundedText(value, 120) || secretLike(value))) blockers.push("At least one safe user description is required");
  if (!request.brand || !["neutral", "technical", "editorial", "playful", "premium"].includes(request.brand.personality) || !/^#[0-9a-fA-F]{6}$/.test(request.brand.accent)) blockers.push("Brand personality and six-digit accent color are required");
  else if (accentContrast(request.brand.accent).ratio < (request.accessibility === "wcag-aaa" ? 7 : 4.5)) blockers.push("Brand accent cannot meet the selected text contrast target with black or white foreground");
  if (!Array.isArray(request.platforms) || !request.platforms.length || request.platforms.some((value) => !["web", "mobile", "desktop"].includes(value))) blockers.push("At least one supported platform is required");
  if (!["wcag-aa", "wcag-aaa"].includes(request.accessibility) || !["text-light", "balanced", "data-dense"].includes(request.content) || !["compact", "comfortable", "spacious"].includes(request.density) || !["sharp", "soft", "rounded"].includes(request.radius) || !["none", "subtle", "expressive"].includes(request.motion) || !["light", "dark", "both"].includes(request.theme)) blockers.push("Design-system choices contain unsupported values");
  if (!Array.isArray(request.constraints) || request.constraints.some((value) => !boundedText(value, 240) || secretLike(value))) blockers.push("Design constraints must be safe bounded text");
  try { previous = await readNeutralDesignSource(root); revision = previous.revision + 1; } catch (error: unknown) { if (!(typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT")) blockers.push("Existing design-system source is unreadable or malformed"); }
  let source: NeutralDesignSource | null = null;
  if (!blockers.length) {
    const accent = request.brand.accent.toLowerCase(); const colors: Record<string, string> = { accent, "accent-foreground": accentContrast(accent).foreground, focus: accent, success: "#15803d", warning: "#a16207", danger: "#b91c1c" };
    if (request.theme !== "dark") Object.assign(colors, { "light-background": "#ffffff", "light-foreground": "#171717", "light-surface": "#fafafa", "light-muted": "#e5e5e5", "light-border": "#d4d4d4" });
    if (request.theme !== "light") Object.assign(colors, { "dark-background": "#0a0a0a", "dark-foreground": "#fafafa", "dark-surface": "#171717", "dark-muted": "#404040", "dark-border": "#525252" });
    const unit = request.density === "compact" ? 3 : request.density === "spacious" ? 5 : 4; const radiusUnit = request.radius === "sharp" ? 0 : request.radius === "rounded" ? 8 : 4; const typeRatio = request.content === "data-dense" ? 1.125 : request.content === "text-light" ? 1.25 : 1.2;
    const canonical = { schemaVersion: 1 as const, revision, request, foundations: { colors, typography: { sans: "system-ui, sans-serif", mono: "ui-monospace, monospace", scale: { xs: 0.75, sm: 0.875, base: 1, lg: typeRatio, xl: typeRatio ** 2, display: typeRatio ** 4 }, lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.7 } }, spacing: { 0: 0, 1: unit, 2: unit * 2, 3: unit * 3, 4: unit * 4, 6: unit * 6, 8: unit * 8, 12: unit * 12 }, radius: { none: 0, sm: radiusUnit / 2, md: radiusUnit, lg: radiusUnit * 2, full: 9999 }, elevation: { none: "none", sm: "0 1px 2px rgb(0 0 0 / 0.08)", md: "0 4px 12px rgb(0 0 0 / 0.12)", lg: "0 12px 32px rgb(0 0 0 / 0.16)" }, motion: { level: request.motion, durations: request.motion === "none" ? { instant: 0, fast: 0, normal: 0, slow: 0 } : { instant: 0, fast: 120, normal: 200, slow: 320 }, easing: { standard: "cubic-bezier(0.2, 0, 0, 1)", enter: "cubic-bezier(0, 0, 0, 1)", exit: "cubic-bezier(0.3, 0, 1, 1)" }, reducedMotion: true as const }, states: ["default", "hover", "focus-visible", "active", "disabled", "loading", "empty", "error", "success", "permission-denied"], responsive: { mobile: 0, tablet: 640, desktop: 1024, wide: 1440 } } };
    source = { ...canonical, sourceHash: createHash("sha256").update(JSON.stringify(normalizeJson(canonical))).digest("hex") };
  }
  const impacts = !previous || !source ? [] : Object.keys(source.foundations).filter((key) => JSON.stringify(normalizeJson(previous!.foundations[key as keyof NeutralDesignSource["foundations"]])) !== JSON.stringify(normalizeJson(source!.foundations[key as keyof NeutralDesignSource["foundations"]]))).sort();
  const stable: Omit<NeutralDesignPlan, "planHash"> = { status: blockers.length ? "blocked" : "ready", action: previous ? "update" : "create", source, impacts, blockers };
  return { ...stable, planHash: createHash("sha256").update(JSON.stringify(normalizeJson(stable))).digest("hex") };
}

export async function applyNeutralDesignSystem(root: string, plan: NeutralDesignPlan, expectedPlanHash: string): Promise<DoctorResult> {
  if (plan.status !== "ready" || !plan.source || plan.planHash !== expectedPlanHash) return { id: "design-system.source", status: "fail", message: "Design-system plan is blocked or unauthorized", remediation: "Preview and authorize the exact current plan" };
  const fresh = await planNeutralDesignSystem(root, plan.source.request); if (fresh.planHash !== plan.planHash) return { id: "design-system.source", status: "fail", message: "Design-system source changed after preview", remediation: "Review a new design-system plan" };
  const resolved = await gitRoot(root); const base = join(resolved, ".downstroke", "design-system"); await mkdir(base, { recursive: true }); const lockPath = join(base, "source.lock"); let lock: Awaited<ReturnType<typeof open>> | undefined;
  try { lock = await open(lockPath, "wx", 0o600); const latest = await planNeutralDesignSystem(resolved, plan.source.request); if (latest.planHash !== plan.planHash) return { id: "design-system.source", status: "fail", message: "Design-system source changed before write", remediation: "Review a new plan" }; await writeFile(join(base, "source.json.tmp"), `${JSON.stringify(plan.source, null, 2)}\n`); await rename(join(base, "source.json.tmp"), join(base, "source.json")); return { id: "design-system.source", status: "ok", message: "Neutral design-system source stored", evidence: plan.source.sourceHash, remediation: "Generate only selected token projections from this authority" }; }
  catch (error: unknown) { return { id: "design-system.source", status: "fail", message: error instanceof Error ? error.message : "Design-system write failed", remediation: "Inspect state and preview again" }; }
  finally { await lock?.close().catch(() => undefined); await unlink(lockPath).catch(() => undefined); }
}

function flattenTokenValues(value: unknown, prefix = ""): [string, string | number][] {
  if (typeof value === "string" || typeof value === "number") return [[prefix, value]];
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => flattenTokenValues(child, prefix ? `${prefix}-${key}` : key));
}

function serializeTokenProjection(target: DesignTokenTarget, document: DesignTokenDocument): string {
  const header = `source=${document.sourceHash} token-version=${document.tokenVersion}`; const entries = flattenTokenValues(document.tokens);
  if (target === "json") return `${JSON.stringify(document, null, 2)}\n`;
  if (target === "yaml") return `# ${header}\n${JSON.stringify(document, null, 2)}\n`; // JSON is valid YAML 1.2.
  if (target === "css") return `/* ${header} */\n:root {\n${entries.map(([key, value]) => `  --ds-${key}: ${value};`).join("\n")}\n}\n`;
  if (target === "scss") return `// ${header}\n${entries.map(([key, value]) => `$ds-${key}: ${value};`).join("\n")}\n`;
  const json = JSON.stringify({ sourceHash: document.sourceHash, tokenVersion: document.tokenVersion, tokens: document.tokens }, null, 2);
  return target === "typescript" ? `// ${header}\nexport const designTokens = ${json} as const;\n` : `// ${header}\nexport default ${JSON.stringify({ content: [], theme: { extend: document.tokens }, plugins: [] }, null, 2)};\n`;
}

export async function planDesignTokens(root: string, requestedTargets: DesignTokenTarget[]): Promise<DesignTokenPlan> {
  const allowed: DesignTokenTarget[] = ["json", "yaml", "css", "tailwind", "scss", "typescript"]; const targets = [...new Set(requestedTargets)].sort() as DesignTokenTarget[]; const blockers: string[] = [];
  if (!targets.length || targets.some((target) => !allowed.includes(target))) blockers.push("At least one supported token target is required");
  let source: NeutralDesignSource | null = null; try { source = await readNeutralDesignSource(root); } catch { blockers.push("A valid neutral design-system source is required"); }
  let document: DesignTokenDocument | null = null;
  if (!blockers.length && source) {
    const canonical = { schemaVersion: 1 as const, generatorVersion: 1 as const, tokenVersion: source.revision, sourceHash: source.sourceHash, tokens: { color: source.foundations.colors, spacing: Object.fromEntries(Object.entries(source.foundations.spacing).map(([key, value]) => [key, `${value}px`])), radius: Object.fromEntries(Object.entries(source.foundations.radius).map(([key, value]) => [key, `${value}px`])), elevation: source.foundations.elevation, typography: { "font-sans": source.foundations.typography.sans, "font-mono": source.foundations.typography.mono, ...Object.fromEntries(Object.entries(source.foundations.typography.scale).map(([key, value]) => [`size-${key}`, `${value}rem`])), ...Object.fromEntries(Object.entries(source.foundations.typography.lineHeight).map(([key, value]) => [`line-${key}`, String(value)])) }, motion: { level: source.foundations.motion.level, ...Object.fromEntries(Object.entries(source.foundations.motion.durations).map(([key, value]) => [`duration-${key}`, `${value}ms`])), ...Object.fromEntries(Object.entries(source.foundations.motion.easing).map(([key, value]) => [`easing-${key}`, value])) }, zIndex: { base: 0, dropdown: 1000, sticky: 1100, overlay: 1200, modal: 1300, toast: 1400 }, opacity: { disabled: 0.5, muted: 0.7, overlay: 0.8 } } };
    document = { ...canonical, tokenHash: createHash("sha256").update(JSON.stringify(normalizeJson(canonical))).digest("hex") };
  }
  const paths: Record<DesignTokenTarget, string> = { json: "tokens.json", yaml: "tokens.yaml", css: "tokens.css", tailwind: "tailwind.tokens.ts", scss: "tokens.scss", typescript: "tokens.ts" }; const projections: DesignTokenPlan["projections"] = []; const removals: DesignTokenPlan["removals"] = [];
  for (const target of targets) if (document) { const content = serializeTokenProjection(target, document); const path = join(".downstroke", "design-system", "generated", paths[target]); let changed = true; try { changed = await readFile(join(await gitRoot(root), path), "utf8") !== content; } catch { /* absent projection */ } projections.push({ target, path: path.replaceAll("\\", "/"), content, hash: createHash("sha256").update(content).digest("hex"), changed }); }
  if (document) for (const target of allowed) if (!targets.includes(target)) try { await stat(join(await gitRoot(root), ".downstroke", "design-system", "generated", paths[target])); removals.push({ target, path: `.downstroke/design-system/generated/${paths[target]}` }); } catch { /* absent projection */ }
  const impacts = [...new Set([...projections.filter(({ changed }) => changed).map(({ target }) => target), ...removals.map(({ target }) => target)])]; const stable: Omit<DesignTokenPlan, "planHash"> = { status: blockers.length ? "blocked" : "ready", document, projections, removals, impacts, blockers };
  return { ...stable, planHash: createHash("sha256").update(JSON.stringify(normalizeJson(stable))).digest("hex") };
}

export async function applyDesignTokens(root: string, plan: DesignTokenPlan, expectedPlanHash: string): Promise<DoctorResult> {
  const { planHash, ...canonicalPlan } = plan; const suppliedHash = createHash("sha256").update(JSON.stringify(normalizeJson(canonicalPlan))).digest("hex");
  if (plan.status !== "ready" || !plan.document || planHash !== expectedPlanHash || planHash !== suppliedHash) return { id: "design-system.tokens", status: "fail", message: "Token plan is blocked, altered or unauthorized", remediation: "Preview and authorize the exact current plan" };
  const designBase = join(await gitRoot(root), ".downstroke", "design-system"); const base = join(designBase, "generated"); await mkdir(designBase, { recursive: true }); const sourceLockPath = join(designBase, "source.lock"); const tokenLockPath = join(designBase, "tokens.lock"); const staging = join(designBase, `generated-${randomUUID()}.tmp`); const backup = join(designBase, `generated-${randomUUID()}.bak`); let sourceLock: Awaited<ReturnType<typeof open>> | undefined; let tokenLock: Awaited<ReturnType<typeof open>> | undefined; let movedExisting = false;
  try { sourceLock = await open(sourceLockPath, "wx", 0o600); tokenLock = await open(tokenLockPath, "wx", 0o600); const fresh = await planDesignTokens(root, plan.projections.map(({ target }) => target)); if (fresh.planHash !== plan.planHash) return { id: "design-system.tokens", status: "fail", message: "Token source or projections changed after preview", remediation: "Review a new token plan" }; await mkdir(staging); for (const projection of plan.projections) await writeFile(join(staging, basename(projection.path)), projection.content); try { await rename(base, backup); movedExisting = true; } catch (error: unknown) { if (!(typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT")) throw error; } try { await rename(staging, base); } catch (error) { if (movedExisting) await rename(backup, base); throw error; } movedExisting = false; await rm(backup, { recursive: true, force: true }).catch(() => undefined); return { id: "design-system.tokens", status: "ok", message: "Selected token projections generated", evidence: plan.document.tokenHash }; }
  catch (error: unknown) { return { id: "design-system.tokens", status: "fail", message: error instanceof Error ? error.message : "Token generation failed", remediation: "Inspect state and preview again" }; }
  finally { await rm(staging, { recursive: true, force: true }).catch(() => undefined); if (movedExisting) try { await rename(backup, base); movedExisting = false; } catch { /* preserve backup for recovery */ } if (!movedExisting) await rm(backup, { recursive: true, force: true }).catch(() => undefined); if (tokenLock) { await tokenLock.close().catch(() => undefined); await unlink(tokenLockPath).catch(() => undefined); } if (sourceLock) { await sourceLock.close().catch(() => undefined); await unlink(sourceLockPath).catch(() => undefined); } }
}

const consumerPaths: Record<DesignConsumerTarget, string> = { "design-system": "design-system.md", tokens: "tokens.json", tailwind: "tailwind.tokens.ts", figma: "figma-tokens.json", claude: "claude.md", codex: "codex.md", copilot: "copilot.md", cursor: "cursor.md" };

function serializeDesignConsumer(target: DesignConsumerTarget, source: NeutralDesignSource): string {
  const authority = `Generated projection only. Authority: .downstroke/design-system/source.json\nSource revision: ${source.revision}\nSource hash: ${source.sourceHash}`;
  if (target === "tokens") return `${JSON.stringify({ generatedOnly: true, sourceRevision: source.revision, sourceHash: source.sourceHash, foundations: source.foundations }, null, 2)}\n`;
  if (target === "tailwind") return `// ${authority.replaceAll("\n", "; ")}\nexport default ${JSON.stringify({ content: [], theme: { extend: source.foundations }, plugins: [] }, null, 2)};\n`;
  if (target === "figma") return `${JSON.stringify({ generatedOnly: true, sourceRevision: source.revision, sourceHash: source.sourceHash, tokens: source.foundations, guidance: { preferred: "Use approved Figma MCP structured variables, components, Dev Mode and Code Connect mappings when available.", fallback: "Use this provider-neutral token contract when Figma capabilities are unavailable.", approvalRequired: ["paid or beta capability", "write back to Figma"], productionGate: "Prototype output is not production code; implement and review against the neutral source." } }, null, 2)}\n`;
  const provider = target === "claude" ? "Prefer Claude Design for approved exploration when available; otherwise use the same provider-neutral contract." : "Use this provider-neutral contract.";
  const contract = JSON.stringify({ request: source.request, foundations: source.foundations }, null, 2).replaceAll("`", "\\u0060");
  return `# Generated design-system projection\n\n${authority}\n\n${provider}\n\n- Do not edit this projection or back-propagate changes.\n- Paid, beta, or write-back capabilities require explicit approval.\n- Prototype output is not production code; implementation requires normal review and validation.\n\n## Neutral contract\n\n\`\`\`json\n${contract}\n\`\`\`\n`;
}

export async function planDesignConsumers(root: string, requestedTargets: DesignConsumerTarget[]): Promise<DesignConsumerPlan> {
  const allowed = Object.keys(consumerPaths) as DesignConsumerTarget[]; const targets = [...new Set(requestedTargets)].sort() as DesignConsumerTarget[]; const blockers: string[] = [];
  if (!targets.length || targets.some((target) => !allowed.includes(target))) blockers.push(`At least one supported consumer target is required: ${allowed.join(", ")}`);
  let source: NeutralDesignSource | null = null; try { source = await readNeutralDesignSource(root); } catch { blockers.push("A valid neutral design-system source is required"); }
  const projections: DesignConsumerPlan["projections"] = []; const removals: DesignConsumerPlan["removals"] = []; const base = join(".downstroke", "design-system", "consumers"); const projectRoot = source ? await gitRoot(root) : null;
  if (source && projectRoot) for (const target of targets.filter((target) => allowed.includes(target))) { const content = serializeDesignConsumer(target, source); const path = join(base, consumerPaths[target]).replaceAll("\\", "/"); let changed = true; try { changed = await readFile(join(projectRoot, path), "utf8") !== content; } catch (error: unknown) { if (!(typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT")) blockers.push(`Consumer projection is unreadable: ${path}`); } projections.push({ target, path, content, hash: createHash("sha256").update(content).digest("hex"), changed }); }
  if (source && projectRoot) for (const target of allowed) if (!targets.includes(target)) try { await stat(join(projectRoot, base, consumerPaths[target])); removals.push({ target, path: join(base, consumerPaths[target]).replaceAll("\\", "/") }); } catch (error: unknown) { if (!(typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT")) blockers.push(`Consumer projection cannot be inspected: ${join(base, consumerPaths[target]).replaceAll("\\", "/")}`); }
  if (source && projectRoot) try { const known = new Set(Object.values(consumerPaths)); const unknown = (await readdir(join(projectRoot, base))).filter((name) => !known.has(name)); if (unknown.length) blockers.push(`Unknown consumer files require manual review: ${unknown.join(", ")}`); } catch (error: unknown) { if (!(typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT")) blockers.push("Consumer projection directory cannot be inspected"); }
  const stable: Omit<DesignConsumerPlan, "planHash"> = { status: blockers.length ? "blocked" : "ready", sourceHash: source?.sourceHash ?? null, revision: source?.revision ?? null, projections, removals, blockers };
  return { ...stable, planHash: createHash("sha256").update(JSON.stringify(normalizeJson(stable))).digest("hex") };
}

export async function applyDesignConsumers(root: string, plan: DesignConsumerPlan, expectedPlanHash: string): Promise<DoctorResult> {
  const { planHash, ...canonical } = plan; if (plan.status !== "ready" || planHash !== expectedPlanHash || planHash !== createHash("sha256").update(JSON.stringify(normalizeJson(canonical))).digest("hex")) return { id: "design-system.consumers", status: "fail", message: "Consumer plan is blocked, altered or unauthorized", remediation: "Preview and authorize the exact current plan" };
  const designBase = join(await gitRoot(root), ".downstroke", "design-system"); const base = join(designBase, "consumers"); const staging = join(designBase, `consumers-${randomUUID()}.tmp`); const backup = join(designBase, `consumers-${randomUUID()}.bak`); const sourceLockPath = join(designBase, "source.lock"); const consumerLockPath = join(designBase, "consumers.lock"); let sourceLock: Awaited<ReturnType<typeof open>> | undefined; let consumerLock: Awaited<ReturnType<typeof open>> | undefined; let moved = false;
  try { await mkdir(designBase, { recursive: true }); sourceLock = await open(sourceLockPath, "wx", 0o600); consumerLock = await open(consumerLockPath, "wx", 0o600); const fresh = await planDesignConsumers(root, plan.projections.map(({ target }) => target)); if (fresh.planHash !== planHash) return { id: "design-system.consumers", status: "fail", message: "Consumer source or projections changed after preview", remediation: "Review a new consumer plan" }; await mkdir(staging); for (const item of plan.projections) await writeFile(join(staging, basename(item.path)), item.content); try { await rename(base, backup); moved = true; } catch (error: unknown) { if (!(typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT")) throw error; } try { await rename(staging, base); } catch (error) { if (moved) try { await rename(backup, base); moved = false; } catch (rollbackError: unknown) { moved = false; throw new Error(`Consumer swap failed and rollback failed; recover the preserved backup at ${backup}: ${rollbackError instanceof Error ? rollbackError.message : "unknown rollback error"}`, { cause: error }); } throw error; } moved = false; await rm(backup, { recursive: true, force: true }).catch(() => undefined); return { id: "design-system.consumers", status: "ok", message: "Selected consumer projections generated", evidence: planHash }; }
  catch (error: unknown) { return { id: "design-system.consumers", status: "fail", message: error instanceof Error ? error.message : "Consumer generation failed", remediation: "Inspect state and preview again" }; }
  finally { await rm(staging, { recursive: true, force: true }).catch(() => undefined); if (moved) await rename(backup, base).catch(() => undefined); if (consumerLock) { await consumerLock.close().catch(() => undefined); await unlink(consumerLockPath).catch(() => undefined); } if (sourceLock) { await sourceLock.close().catch(() => undefined); await unlink(sourceLockPath).catch(() => undefined); } }
}

export async function validateDesignConsumers(root: string, targets: DesignConsumerTarget[]): Promise<DesignConsumerValidation> {
  const plan = await planDesignConsumers(root, targets); if (plan.status === "blocked") return { status: "blocked", findings: [], guidance: plan.blockers.join("; ") };
  const findings: DesignConsumerValidation["findings"] = []; for (const { target, path, changed } of plan.projections) { let status: "current" | "missing" | "modified" = changed ? "modified" : "current"; if (changed) try { await access(join(await gitRoot(root), path)); } catch { status = "missing"; } findings.push({ target, path, status }); } for (const { target, path } of plan.removals) findings.push({ target, path, status: "unselected" });
  const status = findings.some(({ status: findingStatus }) => findingStatus !== "current") ? "drift" : "ok"; return { status, findings, guidance: status === "drift" ? `Regenerate with the exact current plan: downstroke design-system consumers ${targets.map((target) => `--target ${target}`).join(" ")} --plan ${plan.planHash} --yes` : "Selected consumer projections are current" };
}

type ParsedVersion = { major: number; minor: number; patch: number; channel?: "beta" | "rc"; sequence?: number };

function parseNativeVersion(value: string): ParsedVersion | undefined {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(beta|rc)\.(0|[1-9]\d*))?$/.exec(value);
  if (!match) return undefined;
  const numbers = [match[1], match[2], match[3], match[5]].filter((item): item is string => item !== undefined).map(Number);
  if (numbers.some((item) => !Number.isSafeInteger(item))) return undefined;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]), ...(match[4] ? { channel: match[4] as "beta" | "rc", sequence: Number(match[5]) } : {}) };
}

function compareNativeVersions(left: ParsedVersion, right: ParsedVersion): number {
  for (const key of ["major", "minor", "patch"] as const) if (left[key] !== right[key]) return left[key] - right[key];
  if (!left.channel && right.channel) return 1;
  if (left.channel && !right.channel) return -1;
  if (left.channel !== right.channel) return (left.channel ?? "").localeCompare(right.channel ?? "");
  return (left.sequence ?? 0) - (right.sequence ?? 0);
}

function bumpNativeVersion(version: ParsedVersion, bump: Exclude<NativeReleaseBump, "none">): ParsedVersion {
  if (bump === "major") return { major: version.major + 1, minor: 0, patch: 0 };
  if (bump === "minor") return { major: version.major, minor: version.minor + 1, patch: 0 };
  return { major: version.major, minor: version.minor, patch: version.patch + 1 };
}

function nativeVersionText(version: ParsedVersion): string {
  return `${version.major}.${version.minor}.${version.patch}${version.channel ? `-${version.channel}.${version.sequence}` : ""}`;
}

function nativeReleaseHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(normalizeJson(value))).digest("hex");
}

function nativeReleasePlanHash(plan: NativeReleasePlan): string {
  const { planHash: _planHash, blockers: _blockers, status: _status, ...stable } = plan;
  return nativeReleaseHash(stable);
}

async function readJsonObject(path: string): Promise<Record<string, unknown>> {
  const value = JSON.parse(await readFile(path, "utf8")) as unknown;
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(`${basename(path)} must contain a JSON object`);
  return value as Record<string, unknown>;
}

function safeReleasePath(path: string): boolean {
  return path.length > 0 && !isAbsolute(path) && !path.split(/[\\/]/).includes("..") && !path.includes("\0");
}

function branchAllowsChannel(branch: string, channel: NativeReleaseChannel): boolean {
  return channel === "stable" ? branch === "main" : channel === "beta" ? branch === "develop" : branch.startsWith("release/") && branch.length > 8;
}

function parseReleaseCommit(sha: string, message: string): NativeReleaseCommit | undefined {
  const [subject = "", ...body] = message.replace(/\r\n/g, "\n").split("\n");
  const match = /^([A-Za-z][A-Za-z0-9-]*)(?:\([^)\r\n]+\))?(!)?: .+$/.exec(subject);
  if (!match) return undefined;
  const lastSeparator = body.length - 1 - [...body].reverse().findIndex((line) => line.trim() === "");
  const footers = lastSeparator >= 0 && lastSeparator < body.length ? body.slice(lastSeparator + 1) : [];
  const breaking = Boolean(match[2]) || footers.some((line) => /^BREAKING(?: CHANGE|-CHANGE):\s+\S/.test(line));
  return { sha, subject, type: match[1]!.toLowerCase(), breaking };
}

export async function planNativeRelease(root: string, input: NativeReleaseRequest): Promise<NativeReleasePlan> {
  const blockers: string[] = [];
  const request: NativeReleaseRequest = { channel: input.channel, packages: [...new Set(input.packages)].sort() };
  if (!nativeReleaseChannels.includes(input.channel)) blockers.push("channel must be stable, beta or rc");
  if (!request.packages.length) blockers.push("At least one explicit release package is required");
  if (request.packages.some((path) => !safeReleasePath(path))) blockers.push("Release package paths must be safe repository-relative paths");
  let resolved = root;
  let branch: string | null = null;
  let head: string | null = null;
  let baselineTag: string | null = null;
  let baselineSha: string | null = null;
  let baselineVersion: string | null = null;
  const packages: NativeReleasePackage[] = [];
  const commits: NativeReleaseCommit[] = [];
  try {
    resolved = await gitRoot(root);
    const branchResult = await runGit(resolved, ["symbolic-ref", "--quiet", "--short", "HEAD"]);
    const headResult = await runGit(resolved, ["rev-parse", "HEAD"]);
    if (branchResult.code !== 0) blockers.push("Detached or unborn HEAD cannot plan a release");
    else {
      branch = branchResult.stdout;
      if (!branchAllowsChannel(branch, input.channel)) blockers.push(`Branch ${branch} is not authorized for channel ${input.channel}`);
    }
    if (headResult.code !== 0) blockers.push("Repository has no release HEAD");
    else head = headResult.stdout;

    const tagResult = await runGit(resolved, ["tag", "--merged", "HEAD", "--list", "v*"]);
    if (tagResult.code !== 0) blockers.push(`Release tags cannot be inspected: ${tagResult.stderr || tagResult.code}`);
    const parsedTags = tagResult.stdout.split(/\r?\n/).filter(Boolean).map((tag) => ({ tag, version: parseNativeVersion(tag.slice(1)) })).filter((item): item is { tag: string; version: ParsedVersion } => Boolean(item.version));
    parsedTags.sort((left, right) => compareNativeVersions(right.version, left.version) || left.tag.localeCompare(right.tag));
    if (!parsedTags.length) blockers.push("No unique reachable canonical release baseline tag exists");
    else {
      const top = parsedTags[0]!;
      if (parsedTags[1] && compareNativeVersions(top.version, parsedTags[1].version) === 0) blockers.push("Multiple baseline tags represent the same release version");
      else {
        baselineTag = top.tag;
        baselineVersion = nativeVersionText(top.version);
        const sha = await runGit(resolved, ["rev-list", "-n", "1", baselineTag]);
        if (sha.code !== 0 || !sha.stdout) blockers.push("Baseline tag cannot be resolved");
        else baselineSha = sha.stdout;
      }
    }

    const owned = ["package.json", ...request.packages.map((path) => `${path}/package.json`), "package-lock.json", "CHANGELOG.md", ".downstroke/releases"];
    const dirty = await runGit(resolved, ["status", "--porcelain", "--", ...owned]);
    if (dirty.code !== 0) blockers.push("Release-owned file state cannot be inspected");
    else if (dirty.stdout) blockers.push(`Release-owned files are dirty: ${dirty.stdout.split(/\r?\n/).map((line) => line.slice(3)).join(", ")}`);

    let packageVersion: string | null = null;
    const selectedManifests = new Map<string, Record<string, unknown>>();
    for (const path of request.packages) {
      try {
        const manifestPath = join(resolved, ...path.split("/"), "package.json");
        const content = await readFile(manifestPath, "utf8");
        const manifest = JSON.parse(content) as unknown;
        if (typeof manifest !== "object" || manifest === null || Array.isArray(manifest)) throw new Error("manifest must be an object");
        const item = manifest as Record<string, unknown>;
        if (typeof item.name !== "string" || typeof item.version !== "string" || item.private === true || !parseNativeVersion(item.version)) throw new Error("manifest name/version/private state is invalid");
        if (packageVersion !== null && packageVersion !== item.version) blockers.push("Release packages must use one fixed version");
        packageVersion = item.version;
        selectedManifests.set(path, item);
        packages.push({ path, name: item.name, currentVersion: item.version, manifestHash: nativeReleaseHash(content) });
      } catch (error: unknown) {
        blockers.push(`${path}/package.json is invalid: ${error instanceof Error ? error.message : "read failed"}`);
      }
    }
    try {
      const rootManifest = await readJsonObject(join(resolved, "package.json"));
      if (rootManifest.private !== true || !Array.isArray(rootManifest.workspaces) || !rootManifest.workspaces.every((path) => typeof path === "string" && safeReleasePath(path) && !/[?*]/.test(path))) {
        blockers.push("The private root must declare explicit workspace paths");
      } else {
        const workspaceNames = new Map<string, { path: string; version: string | null; private: boolean }>();
        for (const path of rootManifest.workspaces as string[]) {
          const workspace = await readJsonObject(join(resolved, ...path.split("/"), "package.json"));
          if (typeof workspace.name !== "string") blockers.push(`${path}/package.json has no package name`);
          else if (workspaceNames.has(workspace.name)) blockers.push(`Duplicate workspace package name ${workspace.name}`);
          else workspaceNames.set(workspace.name, { path, version: typeof workspace.version === "string" ? workspace.version : null, private: workspace.private === true });
        }
        const selectedNames = new Set(packages.map((item) => item.name));
        for (const [path, manifest] of selectedManifests) for (const key of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
          if (typeof manifest[key] !== "object" || manifest[key] === null || Array.isArray(manifest[key])) continue;
          const bundled = new Set(Array.isArray(manifest.bundleDependencies) ? manifest.bundleDependencies.filter((name): name is string => typeof name === "string") : []);
          for (const [name, specifier] of Object.entries(manifest[key] as Record<string, unknown>)) {
            const workspace = workspaceNames.get(name);
            if (!workspace) continue;
            if (selectedNames.has(name)) {
              if (specifier !== packageVersion) blockers.push(`${path} must use the exact internal version for ${name}`);
            } else if (!bundled.has(name)) blockers.push(`${path} depends on unpublished workspace package ${name} without bundling it`);
            else if (!workspace.private) blockers.push(`${path} bundled workspace ${name} must be private`);
            else if (specifier !== workspace.version) blockers.push(`${path} must pin bundled workspace ${name} to ${workspace.version ?? "its declared version"}`);
          }
        }
      }
    } catch (error: unknown) {
      blockers.push(error instanceof Error ? `Workspace topology is invalid: ${error.message}` : "Workspace topology is invalid");
    }
    for (const alternative of ["npm-shrinkwrap.json", "pnpm-lock.yaml", "yarn.lock"]) {
      try {
        await stat(join(resolved, alternative));
        blockers.push(`Multiple package-manager state is unsupported: ${alternative}`);
      } catch (error: unknown) {
        const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "READ_ERROR";
        if (code !== "ENOENT") blockers.push(`${alternative} cannot be inspected`);
      }
    }
    try {
      const lock = await readJsonObject(join(resolved, "package-lock.json"));
      if (lock.lockfileVersion !== 3 || typeof lock.packages !== "object" || lock.packages === null) blockers.push("package-lock.json must use supported lockfileVersion 3");
      else for (const item of packages) if (!Object.hasOwn(lock.packages as object, item.path)) blockers.push(`package-lock.json is missing ${item.path}`);
    } catch (error: unknown) {
      blockers.push(error instanceof Error ? error.message : "package-lock.json is invalid");
    }
    if (baselineVersion && packageVersion && baselineVersion !== packageVersion) blockers.push(`Package version ${packageVersion} does not match baseline ${baselineVersion}`);

    if (baselineTag) {
      const log = await runGit(resolved, ["log", "--no-merges", "--format=%H%x00%B%x00%x1e", `${baselineTag}..HEAD`]);
      if (log.code !== 0) blockers.push(`Release commits cannot be read: ${log.stderr || log.code}`);
      else for (const record of log.stdout.split("\x1e").map((item) => item.trim()).filter(Boolean)) {
        const [sha = "", message = ""] = record.split("\0");
        const parsed = parseReleaseCommit(sha, message);
        if (!parsed) blockers.push(`Commit ${sha.slice(0, 12) || "unknown"} is not a valid Conventional Commit`);
        else commits.push(parsed);
      }
    }
  } catch (error: unknown) {
    blockers.push(error instanceof Error ? error.message : "Release repository cannot be inspected");
  }

  const rank: Record<NativeReleaseBump, number> = { none: 0, patch: 1, minor: 2, major: 3 };
  let bump: NativeReleaseBump = "none";
  for (const commit of commits) {
    const candidate: NativeReleaseBump = commit.breaking ? "major" : commit.type === "feat" ? "minor" : commit.type === "fix" ? "patch" : "none";
    if (rank[candidate] > rank[bump]) bump = candidate;
  }
  let nextVersion: string | null = null;
  if (baselineVersion && bump !== "none") {
    const base = bumpNativeVersion(parseNativeVersion(baselineVersion)!, bump);
    if (input.channel !== "stable") {
      const prefix = `${base.major}.${base.minor}.${base.patch}-${input.channel}.`;
      let sequence = 1;
      const tags = await runGit(resolved, ["tag", "--merged", "HEAD", "--list", `v${prefix}*`]);
      if (tags.code !== 0) blockers.push("Prerelease tags cannot be inspected");
      for (const tag of tags.stdout.split(/\r?\n/)) {
        const parsed = parseNativeVersion(tag.slice(1));
        if (parsed?.channel === input.channel) sequence = Math.max(sequence, (parsed.sequence ?? 0) + 1);
      }
      base.channel = input.channel;
      base.sequence = sequence;
    }
    nextVersion = nativeVersionText(base);
    const collision = await runGit(resolved, ["show-ref", "--verify", "--quiet", `refs/tags/v${nextVersion}`]);
    if (collision.code === 0) blockers.push(`Release tag v${nextVersion} already exists`);
    else if (collision.code !== 1) blockers.push("Next release tag collision cannot be inspected");
  }
  const notes = {
    breaking: commits.filter((item) => item.breaking).map((item) => item.subject),
    features: commits.filter((item) => item.type === "feat").map((item) => item.subject),
    fixes: commits.filter((item) => item.type === "fix").map((item) => item.subject),
  };
  const changelog = nextVersion ? [`## ${nextVersion}`, ...notes.breaking.map((item) => `- BREAKING: ${item}`), ...notes.features.map((item) => `- ${item}`), ...notes.fixes.map((item) => `- ${item}`), ""].join("\n") : "";
  const plan: NativeReleasePlan = {
    schemaVersion: 1, policyVersion: 1, status: blockers.length ? "blocked" : "ready", request, branch, head, baselineTag, baselineSha, baselineVersion, bump, nextVersion,
    gitTag: nextVersion ? `v${nextVersion}` : null, distTag: input.channel === "stable" ? "latest" : input.channel, commits, notes, changelog, packages,
    checks: ["typecheck", "test", "build", "package-contents", "clean-install", "native-only"],
    risks: ["publication requires separate high-risk authorization", "published versions are immutable"],
    rollback: "Before publication, restore prepared files; after publication, create a patch, deprecate or correct the dist-tag with fresh approval.",
    requiredApprovals: ["prepare-local-files", "publish-separately"], planHash: null, blockers,
  };
  if (plan.status === "ready") plan.planHash = nativeReleasePlanHash(plan);
  return plan;
}

type ReleaseEvent = { schemaVersion: 1; state: "planned" | "prepared" | "ready" | "failed"; planHash: string; version: string; previousHash: string | null; evidence: string[]; recordHash: string };

async function readReleaseEvents(root: string): Promise<ReleaseEvent[]> {
  try {
    const values = (await readFile(join(root, ".downstroke", "releases", "events.jsonl"), "utf8")).split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as unknown);
    const records: ReleaseEvent[] = [];
    let previous: string | null = null;
    for (const value of values) {
      if (!plainObject(value) || unknownKeys(value, ["schemaVersion", "state", "planHash", "version", "previousHash", "evidence", "recordHash"]).length || value.schemaVersion !== 1 || !["planned", "prepared", "ready", "failed"].includes(String(value.state)) || !/^[a-f0-9]{64}$/.test(String(value.planHash)) || !parseNativeVersion(String(value.version)) || (value.previousHash !== null && !/^[a-f0-9]{64}$/.test(String(value.previousHash))) || !Array.isArray(value.evidence) || value.evidence.some((item) => typeof item !== "string" || item.length > 1000 || secretLike(item) || absolutePathLike(item)) || !/^[a-f0-9]{64}$/.test(String(value.recordHash))) throw new Error("Release evidence contains a malformed record");
      const record = value as ReleaseEvent;
      const { recordHash, ...stable } = record;
      if (record.previousHash !== previous || nativeReleaseHash(stable) !== recordHash) throw new Error("Release evidence hash chain is invalid");
      previous = recordHash;
      records.push(record);
    }
    return records;
  } catch (error: unknown) {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "READ_ERROR";
    if (code === "ENOENT") return [];
    throw error;
  }
}

async function appendReleaseEvents(root: string, existing: ReleaseEvent[], additions: ReleaseEvent[]): Promise<void> {
  const path = join(root, ".downstroke", "releases", "events.jsonl");
  const temporary = `${path}.tmp`;
  await writeFile(temporary, `${[...existing, ...additions].map((item) => JSON.stringify(item)).join("\n")}\n`, { encoding: "utf8", mode: 0o600 });
  await rename(temporary, path);
}

export async function readNativeReleasePlan(root: string, planHash: string): Promise<NativeReleasePlan | null> {
  if (!/^[a-f0-9]{64}$/.test(planHash)) return null;
  const resolved = await gitRoot(root);
  try {
    const value = JSON.parse(await readFile(join(resolved, ".downstroke", "releases", `${planHash}.json`), "utf8")) as unknown;
    if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
    const plan = value as NativeReleasePlan;
    return plan.planHash === planHash && nativeReleasePlanHash(plan) === planHash ? plan : null;
  } catch { return null; }
}

function releaseEvent(state: ReleaseEvent["state"], plan: NativeReleasePlan, previousHash: string | null, evidence: string[]): ReleaseEvent {
  const sanitized = evidence.map((item) => item.length > 1000 || secretLike(item) || absolutePathLike(item) ? `redacted:${nativeReleaseHash(item)}` : item);
  const value = { schemaVersion: 1 as const, state, planHash: plan.planHash!, version: plan.nextVersion!, previousHash, evidence: sanitized };
  return { ...value, recordHash: nativeReleaseHash(value) };
}

export async function applyNativeReleasePreparation(root: string, plan: NativeReleasePlan, expectedPlanHash: string): Promise<DoctorResult> {
  if (plan.status !== "ready" || !plan.planHash || !plan.nextVersion || expectedPlanHash !== plan.planHash || nativeReleasePlanHash(plan) !== plan.planHash) return { id: "release.prepare", status: "fail", message: "Release plan is blocked, malformed or has the wrong hash", remediation: "Run downstroke release plan again" };
  let resolved: string;
  try { resolved = await gitRoot(root); } catch { return { id: "release.prepare", status: "fail", message: "Release repository is unavailable", remediation: "Restore the repository and plan again" }; }
  let existing: ReleaseEvent[];
  try { existing = await readReleaseEvents(resolved); }
  catch { return { id: "release.prepare", status: "fail", message: "Release evidence integrity validation failed", remediation: "Repair or restore release evidence and plan again" }; }
  if (existing.some((item) => item.planHash === plan.planHash && (item.state === "prepared" || item.state === "ready"))) return { id: "release.prepare", status: "ok", message: "Release is already prepared", evidence: plan.planHash };
  if (existing.some((item) => item.version === plan.nextVersion && item.planHash !== plan.planHash)) return { id: "release.prepare", status: "fail", message: `Release version ${plan.nextVersion} already belongs to another plan`, remediation: "Resolve the release evidence conflict and plan a new version" };
  const fresh = await planNativeRelease(resolved, plan.request);
  if (fresh.status !== "ready" || fresh.planHash !== plan.planHash) return { id: "release.prepare", status: "fail", message: "Release plan changed after preview", remediation: "Review a new release plan" };
  const releaseRoot = join(resolved, ".downstroke", "releases");
  await mkdir(releaseRoot, { recursive: true });
  const lockPath = join(releaseRoot, "prepare.lock");
  let lock: Awaited<ReturnType<typeof open>> | undefined;
  try {
    lock = await open(lockPath, "wx", 0o600);
    const targetNames = new Set(plan.packages.map((item) => item.name));
    const rendered = new Map<string, string>();
    const updateManifest = async (path: string) => {
      const manifest = await readJsonObject(path);
      manifest.version = plan.nextVersion;
      for (const key of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
        if (typeof manifest[key] !== "object" || manifest[key] === null || Array.isArray(manifest[key])) continue;
        const dependencies = manifest[key] as Record<string, unknown>;
        for (const name of targetNames) if (Object.hasOwn(dependencies, name)) dependencies[name] = plan.nextVersion;
      }
      rendered.set(path, `${JSON.stringify(manifest, null, 2)}\n`);
    };
    for (const item of plan.packages) await updateManifest(join(resolved, ...item.path.split("/"), "package.json"));
    const rootManifestPath = join(resolved, "package.json");
    const rootManifest = await readJsonObject(rootManifestPath);
    if (rootManifest.private === true && rootManifest.version === plan.baselineVersion) await updateManifest(rootManifestPath);
    const lockFilePath = join(resolved, "package-lock.json");
    const packageLock = await readJsonObject(lockFilePath);
    if (packageLock.lockfileVersion !== 3 || typeof packageLock.packages !== "object" || packageLock.packages === null) throw new Error("Unsupported package-lock.json");
    packageLock.version = plan.nextVersion;
    for (const [path, value] of Object.entries(packageLock.packages as Record<string, unknown>)) {
      if (typeof value !== "object" || value === null || Array.isArray(value)) continue;
      const entry = value as Record<string, unknown>;
      if (path === "" || plan.packages.some((item) => item.path === path)) entry.version = plan.nextVersion;
      for (const key of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
        if (typeof entry[key] !== "object" || entry[key] === null || Array.isArray(entry[key])) continue;
        for (const name of targetNames) if (Object.hasOwn(entry[key] as object, name)) (entry[key] as Record<string, unknown>)[name] = plan.nextVersion;
      }
    }
    rendered.set(lockFilePath, `${JSON.stringify(packageLock, null, 2)}\n`);
    const changelogPath = join(resolved, "CHANGELOG.md");
    let previousChangelog = "# Changelog\n\n";
    try { previousChangelog = await readFile(changelogPath, "utf8"); } catch { /* first changelog */ }
    rendered.set(changelogPath, `${previousChangelog.trimEnd()}\n\n${plan.changelog}`);
    const transactionPath = join(releaseRoot, "transaction.json");
    await writeFile(transactionPath, `${JSON.stringify({ planHash: plan.planHash, files: [...rendered.keys()].map((path) => relative(resolved, path).replaceAll("\\", "/")) }, null, 2)}\n`, { mode: 0o600 });
    const backups = new Map<string, string | null>();
    const temps = new Map<string, string>();
    try {
      let index = 0;
      for (const [path, content] of rendered) {
        const temp = `${path}.downstroke-${plan.planHash.slice(0, 12)}.tmp`;
        const backup = join(releaseRoot, `backup-${index++}`);
        try { await copyFile(path, backup); backups.set(path, backup); } catch (error: unknown) { const code = plainObject(error) && typeof error.code === "string" ? error.code : "READ_ERROR"; if (code !== "ENOENT") throw error; backups.set(path, null); }
        await writeFile(temp, content, { encoding: "utf8", mode: 0o600 });
        temps.set(path, temp);
      }
      for (const [path, temp] of temps) await rename(temp, path);
      const planned = releaseEvent("planned", plan, existing.at(-1)?.recordHash ?? null, [`head=${plan.head}`, `baseline=${plan.baselineTag}`]);
      const prepared = releaseEvent("prepared", plan, planned.recordHash, [...rendered.keys()].map((path) => relative(resolved, path).replaceAll("\\", "/")));
      const savedPlan = join(releaseRoot, `${plan.planHash}.json`);
      await writeFile(`${savedPlan}.tmp`, `${JSON.stringify(plan, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
      await rename(`${savedPlan}.tmp`, savedPlan);
      await appendReleaseEvents(resolved, existing, [planned, prepared]);
    } catch (error: unknown) {
      for (const [path, backup] of backups) {
        if (backup) await copyFile(backup, path);
        else await unlink(path).catch(() => undefined);
      }
      await unlink(join(releaseRoot, `${plan.planHash}.json`)).catch(() => undefined);
      await unlink(join(releaseRoot, `${plan.planHash}.json.tmp`)).catch(() => undefined);
      throw error;
    } finally {
      for (const temp of temps.values()) await unlink(temp).catch(() => undefined);
      for (const backup of backups.values()) if (backup) await unlink(backup).catch(() => undefined);
      await unlink(transactionPath).catch(() => undefined);
    }
    return { id: "release.prepare", status: "ok", message: `Prepared Downstroke release ${plan.nextVersion}`, evidence: plan.planHash };
  } catch (error: unknown) {
    return { id: "release.prepare", status: "fail", message: error instanceof Error ? error.message : "Release preparation failed", remediation: "Inspect release transaction evidence and plan again" };
  } finally {
    await lock?.close().catch(() => undefined);
    if (lock) await unlink(lockPath).catch(() => undefined);
  }
}

function runLocalCommand(command: string, args: readonly string[], cwd: string): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const executable = process.platform === "win32" && command.toLowerCase().endsWith(".cmd") ? process.env.ComSpec ?? "cmd.exe" : command;
    const commandArgs = executable === command ? [...args] : ["/d", "/s", "/c", command, ...args];
    const child = spawn(executable, commandArgs, {
      cwd,
      env: { ...process.env, npm_config_cache: join(tmpdir(), "downstroke-npm-cache") },
      shell: false,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = ""; let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk: string) => { stdout += chunk; });
    child.stderr.setEncoding("utf8").on("data", (chunk: string) => { stderr += chunk; });
    child.once("error", (error) => resolve({ code: 1, stdout, stderr: error.message }));
    child.once("exit", (code) => resolve({ code: code ?? 1, stdout: stdout.trim(), stderr: stderr.trim() }));
  });
}

export async function verifyNativeRelease(root: string, plan: NativeReleasePlan): Promise<DoctorResult> {
  if (plan.status !== "ready" || !plan.planHash || !plan.nextVersion || nativeReleasePlanHash(plan) !== plan.planHash) return { id: "release.verify", status: "fail", message: "A ready unmodified release plan is required", remediation: "Plan and prepare the release" };
  const resolved = await gitRoot(root);
  let events: ReleaseEvent[];
  try { events = await readReleaseEvents(resolved); }
  catch { return { id: "release.verify", status: "fail", message: "Release evidence integrity validation failed", remediation: "Repair or restore release evidence" }; }
  if (!events.some((item) => item.planHash === plan.planHash && item.state === "prepared")) return { id: "release.verify", status: "fail", message: "Release has not been prepared", remediation: "Run downstroke release prepare" };
  const evidence: string[] = [];
  let failure: string | null = null;
  try {
    for (const item of plan.packages) {
      const manifest = await readJsonObject(join(resolved, ...item.path.split("/"), "package.json"));
      if (manifest.version !== plan.nextVersion) throw new Error(`${item.path} version does not match the release plan`);
    }
    const rootManifest = await readJsonObject(join(resolved, "package.json"));
    const scripts = typeof rootManifest.scripts === "object" && rootManifest.scripts !== null ? rootManifest.scripts as Record<string, unknown> : {};
    const npm = process.platform === "win32" ? "npm.cmd" : "npm";
    for (const script of ["typecheck", "test", "build"]) {
      if (typeof scripts[script] !== "string") throw new Error(`Required release check ${script} is not configured`);
      const result = await runLocalCommand(npm, ["run", script], resolved);
      evidence.push(`${script}:${result.code}`);
      if (result.code !== 0) throw new Error(`${script} failed: ${result.stderr || result.stdout}`);
    }
    const packRoot = await mkdtemp(join(tmpdir(), "downstroke-release-pack-"));
    const installRoot = await mkdtemp(join(tmpdir(), "downstroke-release-install-"));
    try {
      const tarballs: string[] = [];
      for (const item of plan.packages) {
        const sourceManifest = await readJsonObject(join(resolved, ...item.path.split("/"), "package.json"));
        const allowlist = Array.isArray(sourceManifest.files) && sourceManifest.files.every((entry) => typeof entry === "string" && safeReleasePath(entry)) ? sourceManifest.files as string[] : [];
        if (!allowlist.length) throw new Error(`${item.name} must declare a package files allowlist`);
        const bundled = Array.isArray(sourceManifest.bundleDependencies) && sourceManifest.bundleDependencies.every((name) => typeof name === "string") ? sourceManifest.bundleDependencies as string[] : [];
        if (item.name === "downstroke") {
          const bin = typeof sourceManifest.bin === "object" && sourceManifest.bin !== null ? (sourceManifest.bin as Record<string, unknown>).downstroke : undefined;
          const engine = typeof sourceManifest.engines === "object" && sourceManifest.engines !== null ? (sourceManifest.engines as Record<string, unknown>).node : undefined;
          const repository = typeof sourceManifest.repository === "object" && sourceManifest.repository !== null ? sourceManifest.repository as Record<string, unknown> : {};
          if (sourceManifest.license !== "Apache-2.0" || typeof sourceManifest.description !== "string" || !sourceManifest.description || repository.type !== "git" || typeof repository.url !== "string" || !repository.url || typeof bin !== "string" || !safeReleasePath(bin) || engine !== ">=22") throw new Error("downstroke package metadata is incomplete or invalid");
          if (!["dist", "README.md", "LICENSE"].every((path) => allowlist.includes(path))) throw new Error("downstroke package files allowlist is incomplete");
          const internal = typeof sourceManifest.dependencies === "object" && sourceManifest.dependencies !== null ? Object.keys(sourceManifest.dependencies as Record<string, unknown>).filter((name) => name.startsWith("@downstroke/")) : [];
          if (!internal.length || internal.some((name) => !bundled.includes(name))) throw new Error("downstroke package has an unbundled internal dependency");
        }
        const result = await runLocalCommand(npm, ["pack", join(resolved, ...item.path.split("/")), "--json", "--pack-destination", packRoot, "--ignore-scripts"], resolved);
        if (result.code !== 0) throw new Error(`npm pack failed for ${item.name}: ${result.stderr || result.stdout}`);
        const output = JSON.parse(result.stdout) as unknown;
        if (!Array.isArray(output) || typeof output[0] !== "object" || output[0] === null || typeof (output[0] as Record<string, unknown>).filename !== "string") throw new Error(`npm pack returned invalid evidence for ${item.name}`);
        const packed = output[0] as Record<string, unknown>;
        const packedPaths = Array.isArray(packed.files) ? packed.files.map((entry) => typeof entry === "object" && entry !== null ? (entry as Record<string, unknown>).path : undefined) : [];
        if (!packedPaths.length || packedPaths.some((path) => typeof path !== "string" || !safeReleasePath(path))) throw new Error(`npm pack returned unsafe file evidence for ${item.name}`);
        if ((packedPaths as string[]).some((path) => /(^|\/)(?:_bmad(?:-output)?|\.codegraph|\.agents|\.downstroke|\.env(?:\.|$)|\.npmrc)(?:\/|$)/i.test(path))) throw new Error(`${item.name} tarball contains maintenance, planning or secret-bearing artifacts`);
        const automatic = /^(?:package\.json|readme(?:\.[^/]+)?|licen[cs]e(?:\.[^/]+)?|notice(?:\.[^/]+)?)$/i;
        const unexpected = (packedPaths as string[]).filter((path) => !automatic.test(path) && !allowlist.some((allowed) => path === allowed || path.startsWith(`${allowed.replace(/\/$/, "")}/`)) && !bundled.some((name) => path.startsWith(`node_modules/${name}/`)));
        if (unexpected.length) throw new Error(`${item.name} packed files outside its allowlist: ${unexpected.join(", ")}`);
        const packedBundles = Array.isArray(packed.bundled) ? packed.bundled.filter((name): name is string => typeof name === "string") : [];
        if (bundled.some((name) => !packedBundles.includes(name))) throw new Error(`${item.name} tarball is missing bundled dependencies`);
        const tarball = join(packRoot, packed.filename as string);
        tarballs.push(tarball);
        evidence.push(`files:${item.name}:${(packedPaths as string[]).sort().join(",")}`);
        evidence.push(`tarball:${basename(tarball)}:${createHash("sha256").update(await readFile(tarball)).digest("hex")}`);
      }
      await writeFile(join(installRoot, "package.json"), `${JSON.stringify({ name: "downstroke-release-verification", private: true }, null, 2)}\n`);
      const installed = await runLocalCommand(npm, ["install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund", ...tarballs], installRoot);
      if (installed.code !== 0) throw new Error(`clean install failed: ${installed.stderr || installed.stdout}`);
      for (const item of plan.packages) {
        const installedRoot = join(installRoot, "node_modules", ...item.name.split("/"));
        const installedManifest = await readJsonObject(join(installedRoot, "package.json"));
        if (installedManifest.version !== plan.nextVersion) throw new Error(`${item.name} clean-install version drifted`);
        const downstrokeBin = typeof installedManifest.bin === "object" && installedManifest.bin !== null ? (installedManifest.bin as Record<string, unknown>).downstroke : undefined;
        if (item.name === "downstroke" && typeof downstrokeBin === "string") {
          const sourceManifestPath = join(resolved, ...item.path.split("/"), "package.json");
          const installedManifestPath = join(installedRoot, "package.json");
          const sourceManifestBefore = await readFile(sourceManifestPath);
          const installedManifestBefore = await readFile(installedManifestPath);
          const smoke = await runLocalCommand(process.execPath, [join(installedRoot, downstrokeBin), "--help"], installRoot);
          if (smoke.code !== 0) throw new Error(`downstroke CLI smoke failed: ${smoke.stderr || smoke.stdout}`);
          const fixture = join(installRoot, "fixture");
          await mkdir(fixture);
          await writeFile(join(fixture, "AGENTS.md"), "consumer-owned\n");
          await writeFile(join(fixture, "package.json"), `${JSON.stringify({ name: "downstroke-consumer-fixture", private: true, scripts: { typecheck: "node -e \"process.exit(0)\"" } }, null, 2)}\n`);
          const init = await runLocalCommand(process.execPath, [join(installedRoot, downstrokeBin), "init", "--preset", "lite", "--review-mode", "one-at-a-time", "--yes"], fixture);
          const doctor = await runLocalCommand(process.execPath, [join(installedRoot, downstrokeBin), "doctor", "--run-checks"], fixture);
          if (init.code !== 0 || doctor.code !== 0) throw new Error(`downstroke clean-fixture smoke failed: ${init.stderr || doctor.stderr || init.stdout || doctor.stdout}`);
          const cadence = await readJsonObject(join(fixture, ".downstroke", "planning.json"));
          if (cadence.reviewMode !== "one-at-a-time" || await readFile(join(fixture, "AGENTS.md"), "utf8") !== "consumer-owned\n"
            || !doctor.stdout.includes("VERIFY verified")
            || !sourceManifestBefore.equals(await readFile(sourceManifestPath))
            || !installedManifestBefore.equals(await readFile(installedManifestPath))) throw new Error("downstroke clean-fixture state, checks, preservation or isolation failed");
          evidence.push("cli-smoke:help,init,cadence,doctor-checks,preservation,isolation");
        }
      }
      evidence.push("clean-install:passed");
    } finally {
      await rm(packRoot, { recursive: true, force: true });
      await rm(installRoot, { recursive: true, force: true });
    }
    const nativeResults = await scanNativeOnlySurfaces(resolved);
    if (nativeResults.status === "fail") throw new Error("native-only scan failed");
    evidence.push("native-only:passed");
  } catch (error: unknown) {
    failure = error instanceof Error ? error.message : "Release verification failed";
    evidence.push(failure);
  }
  const previousHash = events.at(-1)?.recordHash ?? null;
  const event = releaseEvent(failure ? "failed" : "ready", plan, previousHash, evidence);
  await appendReleaseEvents(resolved, events, [event]);
  return failure ? { id: "release.verify", status: "fail", message: failure, remediation: "Fix verification evidence and prepare a new release plan" } : { id: "release.verify", status: "ok", message: `Verified Downstroke release ${plan.nextVersion}`, evidence: plan.planHash };
}

export const nativeRuntimeResponsibilities = Object.freeze([
  { stage: "Planner", responsibility: "Select the deterministic or justified worker route and declare required evidence." },
  { stage: "Scheduler", responsibility: "Order declared dependencies and budgets without invoking work." },
  { stage: "Executor", responsibility: "Use only the selected contract and scoped capabilities." },
  { stage: "Verifier", responsibility: "Evaluate checks and evidence independently of worker claims." },
  { stage: "Recorder", responsibility: "Record verified outcomes, failures and the next safe action." },
] as const);

const builtInWorkerDefinitions: readonly { id: string; role: NativeWorkerRole; purpose: string; tools: readonly NativeWorkerToolId[]; evidence: readonly string[] }[] = [
  { id: "downstroke.planner", role: "Planner", purpose: "Select the smallest sufficient route from repository evidence.", tools: ["workflow.read"], evidence: ["routing-decision", "source-reference"] },
  { id: "downstroke.repository-inspector", role: "Repository Inspector", purpose: "Inspect bounded repository structure without executing project code.", tools: ["repository.inspect"], evidence: ["repository-relative-path", "content-hash"] },
  { id: "downstroke.risk-auditor", role: "Risk Auditor", purpose: "Audit bounded changes for safety and simplicity risks.", tools: ["simplicity.audit"], evidence: ["finding-severity", "source-reference"] },
  { id: "downstroke.evidence-validator", role: "Evidence Validator", purpose: "Validate evidence without promoting worker assertions by itself.", tools: ["evidence.validate"], evidence: ["evidence-reference", "validation-result"] },
  { id: "downstroke.workflow-guardian", role: "Workflow Guardian", purpose: "Inspect workflow checkpoints and decision ownership without approving them.", tools: ["workflow.read"], evidence: ["workflow-item-id", "checkpoint-status"] },
  { id: "downstroke.context-compiler", role: "Context Compiler", purpose: "Compile bounded task context through the native context capability.", tools: ["context.compile"], evidence: ["context-hash", "exclusion-reason"] },
  { id: "downstroke.release-guardian", role: "Release Guardian", purpose: "Inspect native release plans and blockers without publishing.", tools: ["release.plan"], evidence: ["release-plan-hash", "release-blocker"] },
];

function frozenBuiltInWorker(definition: typeof builtInWorkerDefinitions[number]): NativeWorkerManifest {
  const inputSchema = Object.freeze({ type: "object" as const, properties: Object.freeze({ taskId: "string" as const, context: "object" as const }), required: Object.freeze(["taskId", "context"]), additionalProperties: false as const });
  const outputSchema = Object.freeze({ type: "object" as const, properties: Object.freeze({ summary: "string" as const, claims: "array" as const }), required: Object.freeze(["summary", "claims"]), additionalProperties: false as const });
  return Object.freeze({
    schemaVersion: 1 as const,
    id: definition.id,
    role: definition.role,
    purpose: definition.purpose,
    inputSchema,
    outputSchema,
    allowedTools: Object.freeze([...definition.tools]),
    mutationRights: Object.freeze([]),
    budget: Object.freeze({ maxSteps: 8, maxTokens: 20000 }),
    stopCondition: Object.freeze({ type: "complete-or-blocked" as const, maxFailures: 1 }),
    evidenceRequirements: Object.freeze([...definition.evidence]),
    auditRequirements: Object.freeze(["plan-hash", "input-hash", "claim-status"]),
  });
}

export const nativeWorkerCatalog: readonly NativeWorkerManifest[] = Object.freeze(builtInWorkerDefinitions.map(frozenBuiltInWorker));

function plainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unknownKeys(value: Record<string, unknown>, allowed: readonly string[]): string[] {
  const accepted = new Set(allowed);
  return Object.keys(value).filter((key) => !accepted.has(key));
}

function boundedText(value: unknown, maximum = 240): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maximum && !/[\u0000-\u001f]/.test(value);
}

function absolutePathLike(value: string): boolean {
  return /(?:^|[\s"'=:])(?:[A-Za-z]:[\\/]|\\\\|\/(?:[A-Za-z0-9._-]+(?:\/|$)))/.test(value);
}

function stringList(value: unknown, maximumItems = 16): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.length <= maximumItems && value.every((item) => boundedText(item, 120)) && new Set(value).size === value.length;
}

function parseNativeWorkerSchema(value: unknown, label: string, blockers: string[]): NativeWorkerObjectSchema | null {
  if (!plainObject(value)) { blockers.push(`${label} must be an object schema`); return null; }
  const extra = unknownKeys(value, ["type", "properties", "required", "additionalProperties"]);
  if (extra.length) blockers.push(`${label} contains unknown fields: ${extra.join(", ")}`);
  if (value.type !== "object" || value.additionalProperties !== false || !plainObject(value.properties) || !Array.isArray(value.required)) {
    blockers.push(`${label} must be a strict object schema`);
    return null;
  }
  const allowedTypes = new Set<NativeWorkerValueType>(["string", "number", "boolean", "array", "object"]);
  const properties: Record<string, NativeWorkerValueType> = {};
  for (const [key, type] of Object.entries(value.properties)) {
    if (!/^[A-Za-z][A-Za-z0-9]{0,63}$/.test(key) || !allowedTypes.has(type as NativeWorkerValueType)) blockers.push(`${label} property ${key} is invalid`);
    else properties[key] = type as NativeWorkerValueType;
  }
  if (!Object.keys(properties).length || !value.required.every((key) => typeof key === "string" && Object.hasOwn(properties, key)) || new Set(value.required).size !== value.required.length) blockers.push(`${label} required keys are invalid`);
  return { type: "object", properties, required: value.required.filter((key): key is string => typeof key === "string"), additionalProperties: false };
}

function parseNativeWorkerManifest(value: unknown): { manifest: NativeWorkerManifest | null; blockers: string[] } {
  const blockers: string[] = [];
  if (!plainObject(value)) return { manifest: null, blockers: ["Worker manifest must be an object"] };
  const allowed = ["schemaVersion", "id", "role", "purpose", "inputSchema", "outputSchema", "allowedTools", "mutationRights", "budget", "stopCondition", "evidenceRequirements", "auditRequirements"];
  const extra = unknownKeys(value, allowed);
  if (extra.length) blockers.push(`Worker manifest contains unknown fields: ${extra.join(", ")}`);
  if (value.schemaVersion !== 1) blockers.push("Worker manifest schemaVersion must be 1");
  if (typeof value.id !== "string" || !/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(value.id) || value.id.length > 96) blockers.push("Worker manifest id is invalid");
  if (!nativeWorkerRoles.includes(value.role as NativeWorkerRole)) blockers.push("Worker manifest role is unknown");
  if (!boundedText(value.purpose)) blockers.push("Worker manifest purpose is invalid");
  const inputSchema = parseNativeWorkerSchema(value.inputSchema, "inputSchema", blockers);
  const outputSchema = parseNativeWorkerSchema(value.outputSchema, "outputSchema", blockers);
  const tools = Array.isArray(value.allowedTools) ? value.allowedTools : [];
  if (!tools.length || tools.some((tool) => !nativeWorkerToolIds.includes(tool as NativeWorkerToolId)) || new Set(tools).size !== tools.length) blockers.push("Worker manifest allowedTools must be a unique native allowlist");
  const mutations = Array.isArray(value.mutationRights) ? value.mutationRights : [];
  if (mutations.some((right) => typeof right !== "string" || !/^[a-z][a-z0-9.-]{1,63}$/.test(right)) || new Set(mutations).size !== mutations.length) blockers.push("Worker manifest mutationRights are invalid");
  if (!plainObject(value.budget) || unknownKeys(value.budget, ["maxSteps", "maxTokens"]).length || !Number.isInteger(value.budget.maxSteps) || Number(value.budget.maxSteps) < 1 || Number(value.budget.maxSteps) > 64 || !Number.isInteger(value.budget.maxTokens) || Number(value.budget.maxTokens) < 1 || Number(value.budget.maxTokens) > 1_000_000) blockers.push("Worker manifest budget must be finite and bounded");
  if (!plainObject(value.stopCondition) || unknownKeys(value.stopCondition, ["type", "maxFailures"]).length || value.stopCondition.type !== "complete-or-blocked" || !Number.isInteger(value.stopCondition.maxFailures) || Number(value.stopCondition.maxFailures) < 1 || Number(value.stopCondition.maxFailures) > 5) blockers.push("Worker manifest stopCondition must be finite");
  if (!stringList(value.evidenceRequirements)) blockers.push("Worker manifest evidenceRequirements are invalid");
  if (!stringList(value.auditRequirements)) blockers.push("Worker manifest auditRequirements are invalid");
  const serialized = JSON.stringify(value);
  if (secretLike(serialized)) blockers.push("Worker manifest contains secret-like content");
  if (absolutePathLike(serialized)) blockers.push("Worker manifest contains an absolute path");
  if (blockers.length || !inputSchema || !outputSchema || typeof value.id !== "string" || typeof value.purpose !== "string" || !plainObject(value.budget) || !plainObject(value.stopCondition)) return { manifest: null, blockers };
  return { manifest: {
    schemaVersion: 1, id: value.id, role: value.role as NativeWorkerRole, purpose: value.purpose, inputSchema, outputSchema,
    allowedTools: tools as NativeWorkerToolId[], mutationRights: mutations as string[],
    budget: { maxSteps: Number(value.budget.maxSteps), maxTokens: Number(value.budget.maxTokens) },
    stopCondition: { type: "complete-or-blocked", maxFailures: Number(value.stopCondition.maxFailures) },
    evidenceRequirements: value.evidenceRequirements as string[], auditRequirements: value.auditRequirements as string[],
  }, blockers };
}

type NativeWorkerRegistryRecord = { schemaVersion: 1; manifest: NativeWorkerManifest; manifestHash: string };
type NativeWorkerAuditRecord = { schemaVersion: 1; event: "registered"; workerId: string; manifestHash: string; planHash: string; previousHash: string | null; recordHash: string };

function nativeWorkerHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(normalizeJson(value))).digest("hex");
}

function nativeWorkerPlanHash(plan: NativeWorkerRegistrationPlan): string {
  const { planHash: _hash, status: _status, blockers: _blockers, action: _action, nextAction: _nextAction, ...stable } = plan;
  return nativeWorkerHash(stable);
}

async function readNativeWorkerRegistry(root: string): Promise<NativeWorkerRegistryRecord[]> {
  try {
    const lines = (await readFile(join(root, ".downstroke", "workers", "registry.jsonl"), "utf8")).split(/\r?\n/).filter(Boolean);
    return lines.map((line) => {
      const value = JSON.parse(line) as unknown;
      if (!plainObject(value) || unknownKeys(value, ["schemaVersion", "manifest", "manifestHash"]).length || value.schemaVersion !== 1 || !plainObject(value.manifest) || typeof value.manifestHash !== "string") throw new Error("Worker registry contains a malformed record");
      const parsed = parseNativeWorkerManifest(value.manifest);
      if (!parsed.manifest || parsed.blockers.length || nativeWorkerHash(parsed.manifest) !== value.manifestHash) throw new Error("Worker registry integrity validation failed");
      return { schemaVersion: 1, manifest: parsed.manifest, manifestHash: value.manifestHash };
    });
  } catch (error: unknown) {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "READ_ERROR";
    if (code === "ENOENT") return [];
    throw error;
  }
}

async function readNativeWorkerAudit(root: string): Promise<NativeWorkerAuditRecord[]> {
  try {
    const records = (await readFile(join(root, ".downstroke", "workers", "audit.jsonl"), "utf8")).split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as unknown);
    let previous: string | null = null;
    const validated: NativeWorkerAuditRecord[] = [];
    for (const value of records) {
      if (!plainObject(value) || unknownKeys(value, ["schemaVersion", "event", "workerId", "manifestHash", "planHash", "previousHash", "recordHash"]).length || value.schemaVersion !== 1 || value.event !== "registered" || typeof value.workerId !== "string" || typeof value.manifestHash !== "string" || typeof value.planHash !== "string" || (value.previousHash !== null && typeof value.previousHash !== "string") || typeof value.recordHash !== "string") throw new Error("Worker audit contains a malformed record");
      const record = value as NativeWorkerAuditRecord;
      const { recordHash, ...stable } = record;
      if (record.previousHash !== previous || nativeWorkerHash(stable) !== recordHash) throw new Error("Worker audit hash chain is invalid");
      previous = recordHash;
      validated.push(record);
    }
    return validated;
  } catch (error: unknown) {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "READ_ERROR";
    if (code === "ENOENT") return [];
    throw error;
  }
}

export async function listNativeWorkers(root: string): Promise<NativeWorkerManifest[]> {
  let resolved: string;
  try { resolved = await gitRoot(root); }
  catch { return [...nativeWorkerCatalog]; }
  return [...nativeWorkerCatalog, ...(await readNativeWorkerRegistry(resolved)).map(({ manifest }) => manifest)];
}

export async function planNativeWorkerRegistration(root: string, request: NativeWorkerRegistrationRequest): Promise<NativeWorkerRegistrationPlan> {
  const blockers: string[] = [];
  const task = request.task;
  if (!plainObject(task) || typeof task.id !== "string" || !/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/.test(task.id) || !tokenTaskClasses.includes(task.taskClass) || typeof task.toolProven !== "boolean" || typeof task.singlePathSufficient !== "boolean" || !boundedText(task.justification, 400) || secretLike(task.justification)) blockers.push("Worker task routing input is invalid");
  const deterministic = task?.singlePathSufficient === true || task?.toolProven === true;
  const parsed = parseNativeWorkerManifest(request.manifest);
  if (!deterministic) blockers.push(...parsed.blockers);
  let manifest = deterministic ? null : parsed.manifest;
  let manifestHash = manifest ? nativeWorkerHash(manifest) : null;
  let action: "append" | "skip" = "append";
  if (deterministic) blockers.push("Worker orchestration is unnecessary because a deterministic or single path is sufficient");
  if (manifest && nativeWorkerCatalog.some((item) => item.id === manifest!.id)) blockers.push("Built-in worker manifests are immutable");
  if (manifest?.mutationRights.length) blockers.push("Mutation-capable workers require a scoped Story 9.14 execution task, ownership and persisted workflow approvals");
  try {
    const resolved = await gitRoot(root);
    if (manifest && manifestHash) {
      const existing = (await readNativeWorkerRegistry(resolved)).find((item) => item.manifest.id === manifest!.id);
      if (existing?.manifestHash === manifestHash) action = "skip";
      else if (existing) blockers.push(`Worker id ${manifest.id} is already registered with another manifest`);
    }
  } catch (error: unknown) {
    blockers.push(error instanceof Error ? error.message : "Worker repository cannot be inspected");
  }
  const plan: NativeWorkerRegistrationPlan = {
    schemaVersion: 1,
    status: blockers.length ? "blocked" : "ready",
    mode: deterministic ? "deterministic" : "worker",
    action,
    task,
    manifest,
    manifestHash,
    responsibilities: nativeRuntimeResponsibilities,
    blockers,
    nextAction: deterministic ? "Use the deterministic function or single execution path; Story 9.14 will execute selected routes." : blockers.length ? "Correct the manifest or approval boundary and preview registration again." : action === "skip" ? "No action required; the worker is already registered." : "Review the inert worker contract, then apply the exact plan with --yes.",
    planHash: null,
  };
  if (plan.status === "ready") plan.planHash = nativeWorkerPlanHash(plan);
  return plan;
}

export async function applyNativeWorkerRegistration(root: string, plan: NativeWorkerRegistrationPlan, expectedPlanHash: string): Promise<DoctorResult> {
  if (plan.status !== "ready" || plan.mode !== "worker" || !plan.manifest || !plan.manifestHash || !plan.planHash || expectedPlanHash !== plan.planHash || nativeWorkerPlanHash(plan) !== plan.planHash) return { id: "worker.register", status: "fail", message: "Worker registration plan is blocked, malformed or has the wrong hash", remediation: "Preview registration again" };
  let resolved: string;
  try { resolved = await gitRoot(root); } catch { return { id: "worker.register", status: "fail", message: "Worker repository is unavailable", remediation: "Restore the repository and preview again" }; }
  const base = join(resolved, ".downstroke", "workers");
  const existingBefore = await readNativeWorkerRegistry(resolved).catch(() => []);
  const auditBefore = await readNativeWorkerAudit(resolved).catch(() => []);
  const registeredBefore = existingBefore.some((item) => item.manifest.id === plan.manifest!.id && item.manifestHash === plan.manifestHash);
  const auditedBefore = auditBefore.some((item) => item.workerId === plan.manifest!.id && item.manifestHash === plan.manifestHash && item.planHash === plan.planHash);
  if (registeredBefore && auditedBefore) return { id: "worker.register", status: "ok", message: "Native worker is already registered", evidence: plan.manifestHash };
  const fresh = await planNativeWorkerRegistration(resolved, { manifest: plan.manifest, task: plan.task });
  if (fresh.status !== "ready" || fresh.planHash !== plan.planHash || fresh.manifestHash !== plan.manifestHash) return { id: "worker.register", status: "fail", message: "Worker registration changed after preview", remediation: "Review a new registration plan" };
  await mkdir(base, { recursive: true });
  const lockPath = join(base, "register.lock");
  let lock: Awaited<ReturnType<typeof open>> | undefined;
  try {
    lock = await open(lockPath, "wx", 0o600);
    const registry = await readNativeWorkerRegistry(resolved);
    const audit = await readNativeWorkerAudit(resolved);
    const registered = registry.some((item) => item.manifest.id === plan.manifest!.id && item.manifestHash === plan.manifestHash);
    const audited = audit.some((item) => item.workerId === plan.manifest!.id && item.manifestHash === plan.manifestHash && item.planHash === plan.planHash);
    if (!registered) await appendFile(join(base, "registry.jsonl"), `${JSON.stringify({ schemaVersion: 1, manifest: plan.manifest, manifestHash: plan.manifestHash })}\n`, { encoding: "utf8", mode: 0o600 });
    if (!audited) {
      const stable = { schemaVersion: 1 as const, event: "registered" as const, workerId: plan.manifest.id, manifestHash: plan.manifestHash, planHash: plan.planHash, previousHash: audit.at(-1)?.recordHash ?? null };
      await appendFile(join(base, "audit.jsonl"), `${JSON.stringify({ ...stable, recordHash: nativeWorkerHash(stable) })}\n`, { encoding: "utf8", mode: 0o600 });
    }
    return { id: "worker.register", status: "ok", message: registered && audited ? "Native worker is already registered" : "Native worker registered as an inert local contract", evidence: plan.manifestHash };
  } catch (error: unknown) {
    return { id: "worker.register", status: "fail", message: error instanceof Error ? error.message : "Worker registration failed", remediation: "Inspect the local worker audit state and preview again" };
  } finally {
    await lock?.close().catch(() => undefined);
    if (lock) await unlink(lockPath).catch(() => undefined);
  }
}

export function validateNativeWorkerOutput(value: unknown): { status: "ok" | "blocked"; claims: NativeWorkerClaim[]; blockers: string[] } {
  const blockers: string[] = [];
  const claims: NativeWorkerClaim[] = [];
  if (!plainObject(value) || unknownKeys(value, ["summary", "claims"]).length || !boundedText(value.summary, 1000) || !Array.isArray(value.claims) || value.claims.length > 64) return { status: "blocked", claims, blockers: ["Worker output must contain only a bounded summary and claims"] };
  if (secretLike(value.summary) || absolutePathLike(value.summary)) blockers.push("Worker output summary contains secret-like or absolute-path content");
  for (const candidate of value.claims) {
    if (!plainObject(candidate) || unknownKeys(candidate, ["id", "status", "statement", "evidenceRefs"]).length || typeof candidate.id !== "string" || !/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/.test(candidate.id) || !["observed", "inferred"].includes(String(candidate.status)) || !boundedText(candidate.statement, 1000) || !stringList(candidate.evidenceRefs)) {
      blockers.push("Worker claims must remain bounded observed or inferred claims with evidence references");
      continue;
    }
    const claimText = `${candidate.statement} ${candidate.evidenceRefs.join(" ")}`;
    if (secretLike(claimText) || absolutePathLike(claimText)) { blockers.push(`Worker claim ${candidate.id} contains unsafe content`); continue; }
    claims.push({ id: candidate.id, status: candidate.status as "observed" | "inferred", statement: candidate.statement, evidenceRefs: candidate.evidenceRefs });
  }
  return { status: blockers.length ? "blocked" : "ok", claims, blockers };
}

type NativeExecutionEvent = {
  schemaVersion: 1;
  taskId: string;
  planHash: string;
  stage: typeof nativeRuntimeResponsibilities[number]["stage"];
  status: NativeExecutionStatus;
  evidence: string[];
  nextAction: string;
  recordedAt: string;
  previousHash: string | null;
  recordHash: string;
  task?: NativeExecutionTask;
  worker?: NativeExecutionWorker;
};

function executionHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(normalizeJson(value))).digest("hex");
}

function parseExecutionSimplicity(value: unknown): SimplicityGateInput | undefined {
  let serialized: string;
  try { serialized = JSON.stringify(value); } catch { return undefined; }
  if (!plainObject(value) || typeof serialized !== "string" || serialized.length > 12_000) return undefined;
  const allowed = ["proposal", "simplerPaths", "risk", "dependency", "sharedPackage", "abstraction", "rewrite", "safetyException", "evidence", "consumers", "impact", "owner", "tests", "rollback", "files", "dependencies"];
  if (unknownKeys(value, allowed).length || !boundedText(value.proposal, 1000)) return undefined;
  const simplerPathKeys = ["delete", "reuse", "configure", "platform", "existing-dependency", "small-local-code"] as const;
  const simplerPaths = plainObject(value.simplerPaths) ? value.simplerPaths : undefined;
  if (!simplerPaths || unknownKeys(simplerPaths, simplerPathKeys).length || simplerPathKeys.some((key) => !boundedText(simplerPaths[key], 500))) return undefined;
  for (const key of ["dependency", "sharedPackage", "abstraction", "rewrite"] as const) {
    const item = value[key];
    if (item !== undefined && typeof item !== "boolean" && !boundedText(item, 2000)) return undefined;
  }
  if (value.safetyException !== undefined && !boundedText(value.safetyException, 2000)) return undefined;
  for (const key of ["risk", "evidence", "impact", "owner", "tests", "rollback"] as const) if (value[key] !== undefined && !boundedText(value[key], 2000)) return undefined;
  if (value.consumers !== undefined && !boundedText(value.consumers, 1000) && (!Array.isArray(value.consumers) || value.consumers.length > 16 || value.consumers.some((item) => !boundedText(item, 200)))) return undefined;
  if (value.files !== undefined && (!Array.isArray(value.files) || value.files.length > 16 || value.files.some((file) => !plainObject(file) || unknownKeys(file, ["path", "content", "generated"]).length || !boundedText(file.path, 240) || file.content !== undefined && !boundedText(file.content, 4000) || file.generated !== undefined && typeof file.generated !== "boolean"))) return undefined;
  if (value.dependencies !== undefined && (!Array.isArray(value.dependencies) || value.dependencies.length > 16 || value.dependencies.some((dependency) => !plainObject(dependency) || unknownKeys(dependency, ["name", "spec", "source", "hasInstallScript"]).length || !boundedText(dependency.name, 120) || dependency.spec !== undefined && !boundedText(dependency.spec, 240) || dependency.source !== undefined && !boundedText(dependency.source, 240) || dependency.hasInstallScript !== undefined && typeof dependency.hasInstallScript !== "boolean"))) return undefined;
  return value as SimplicityGateInput;
}

function parseNativeExecutionTask(value: unknown, requireSimplicity = true): { task: NativeExecutionTask | null; blockers: string[] } {
  const blockers: string[] = [];
  if (!plainObject(value)) return { task: null, blockers: ["Execution task must be an object"] };
  const allowed = ["id", "operation", "objective", "owner", "dependencies", "priority", "estimateMinutes", "risk", "rollbackReference", "workflowItemId", "mode", "workerId", "justification", "simplicity"];
  const extra = unknownKeys(value, allowed);
  if (extra.length) blockers.push(`Execution task contains unknown fields: ${extra.join(", ")}`);
  if (typeof value.id !== "string" || !/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/.test(value.id) || value.id.length > 96) blockers.push("Execution task id is invalid");
  if (value.operation !== "project.verify") blockers.push("Execution operation must be the native project.verify capability");
  if (!boundedText(value.objective, 400) || secretLike(String(value.objective)) || absolutePathLike(String(value.objective))) blockers.push("Execution objective is invalid");
  if (typeof value.owner !== "string" || !/^[A-Za-z][A-Za-z0-9._-]{0,63}$/.test(value.owner)) blockers.push("Execution owner is invalid");
  const dependencies = Array.isArray(value.dependencies) ? value.dependencies : [];
  if (!Array.isArray(value.dependencies) || dependencies.length > 32 || dependencies.some((item) => typeof item !== "string" || !/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/.test(item)) || new Set(dependencies).size !== dependencies.length || dependencies.includes(value.id)) blockers.push("Execution dependencies are invalid");
  if (!["low", "normal", "high"].includes(String(value.priority))) blockers.push("Execution priority is invalid");
  if (!Number.isInteger(value.estimateMinutes) || Number(value.estimateMinutes) < 1 || Number(value.estimateMinutes) > 10080) blockers.push("Execution estimateMinutes must be between 1 and 10080");
  if (!["normal", "high"].includes(String(value.risk))) blockers.push("Execution risk is invalid");
  if (!boundedText(value.rollbackReference, 240) || absolutePathLike(String(value.rollbackReference)) || secretLike(String(value.rollbackReference)) || isAbsolute(String(value.rollbackReference)) || String(value.rollbackReference).split(/[\\/]/).includes("..")) blockers.push("Execution rollbackReference must be a safe repository-relative reference");
  for (const key of ["workflowItemId", "workerId"] as const) if (value[key] !== undefined && (typeof value[key] !== "string" || !/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/.test(value[key]))) blockers.push(`Execution ${key} is invalid`);
  if (value.mode !== undefined && !["deterministic", "worker"].includes(String(value.mode))) blockers.push("Execution mode is invalid");
  if (value.justification !== undefined && (!boundedText(value.justification, 400) || secretLike(String(value.justification)) || absolutePathLike(String(value.justification)))) blockers.push("Execution justification is invalid");
  const simplicity = parseExecutionSimplicity(value.simplicity);
  if (value.simplicity !== undefined && !simplicity) blockers.push("Execution simplicity evidence is malformed");
  if (!simplicity && requireSimplicity) blockers.push("Execution requires bounded structured simplicity evidence with a proposal");
  if (blockers.length || typeof value.id !== "string" || typeof value.objective !== "string" || typeof value.owner !== "string" || typeof value.rollbackReference !== "string") return { task: null, blockers };
  const task: NativeExecutionTask = {
    id: value.id,
    operation: "project.verify",
    objective: value.objective,
    owner: value.owner,
    dependencies: dependencies as string[],
    priority: value.priority as NativeExecutionTask["priority"],
    estimateMinutes: Number(value.estimateMinutes),
    risk: value.risk as NativeExecutionTask["risk"],
    rollbackReference: value.rollbackReference,
    simplicity: simplicity ?? { proposal: "Legacy execution evidence was not recorded." },
    ...(typeof value.workflowItemId === "string" ? { workflowItemId: value.workflowItemId } : {}),
    ...(typeof value.mode === "string" ? { mode: value.mode as NativeExecutionMode } : {}),
    ...(typeof value.workerId === "string" ? { workerId: value.workerId } : {}),
    ...(typeof value.justification === "string" ? { justification: value.justification } : {}),
  };
  return { task, blockers };
}

function parseNativeExecutionWorker(value: unknown): NativeExecutionWorker | undefined {
  if (!plainObject(value) || unknownKeys(value, ["id", "manifestHash", "allowedTools", "budget", "stopCondition", "evidenceRequirements"]).length) return undefined;
  const manifest = nativeWorkerCatalog.find((candidate) => candidate.id === value.id);
  if (!manifest || value.manifestHash !== nativeWorkerHash(manifest)) return undefined;
  const expected: NativeExecutionWorker = { id: manifest.id, manifestHash: nativeWorkerHash(manifest), allowedTools: manifest.allowedTools, budget: manifest.budget, stopCondition: manifest.stopCondition, evidenceRequirements: manifest.evidenceRequirements };
  return JSON.stringify(normalizeJson(value)) === JSON.stringify(normalizeJson(expected)) ? expected : undefined;
}

async function readNativeExecutionEvents(root: string): Promise<NativeExecutionEvent[]> {
  try {
    const values = (await readFile(join(root, ".downstroke", "executions", "events.jsonl"), "utf8")).split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as unknown);
    const records: NativeExecutionEvent[] = [];
    let previous: string | null = null;
    for (const value of values) {
      if (!plainObject(value) || unknownKeys(value, ["schemaVersion", "taskId", "planHash", "stage", "status", "evidence", "nextAction", "recordedAt", "previousHash", "recordHash", "task", "worker"]).length || value.schemaVersion !== 1 || typeof value.taskId !== "string" || !/^[a-f0-9]{64}$/.test(String(value.planHash)) || !nativeRuntimeResponsibilities.some(({ stage }) => stage === value.stage) || !["running", "blocked", "failed", "completed"].includes(String(value.status)) || !Array.isArray(value.evidence) || value.evidence.some((item) => typeof item !== "string" || item.length > 240 || secretLike(item) || absolutePathLike(item)) || !boundedText(value.nextAction, 400) || secretLike(String(value.nextAction)) || absolutePathLike(String(value.nextAction)) || typeof value.recordedAt !== "string" || Number.isNaN(Date.parse(value.recordedAt)) || new Date(value.recordedAt).toISOString() !== value.recordedAt || (value.previousHash !== null && !/^[a-f0-9]{64}$/.test(String(value.previousHash))) || !/^[a-f0-9]{64}$/.test(String(value.recordHash))) throw new Error("Execution ledger contains a malformed record");
      if (value.task !== undefined && !parseNativeExecutionTask(value.task, false).task) throw new Error("Execution ledger contains a malformed task");
      if (value.worker !== undefined && !parseNativeExecutionWorker(value.worker)) throw new Error("Execution ledger contains a malformed worker preflight");
      const record = value as NativeExecutionEvent;
      const { recordHash, ...stable } = record;
      if (record.previousHash !== previous || executionHash(stable) !== recordHash) throw new Error("Execution ledger hash chain is invalid");
      previous = recordHash;
      records.push(record);
    }
    return records;
  } catch (error: unknown) {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "READ_ERROR";
    if (code === "ENOENT") return [];
    throw error;
  }
}

function nativeExecutionPlanHash(plan: NativeExecutionPlan): string {
  const { planHash: _hash, status: _status, blockers: _blockers, nextAction: _nextAction, ...stable } = plan;
  return executionHash(stable);
}

export async function planNativeExecution(root: string, input: unknown): Promise<NativeExecutionPlan> {
  const parsed = parseNativeExecutionTask(input);
  const blockers = [...parsed.blockers];
  const task = parsed.task;
  const simplicity = task ? evaluateSimplicityGates(task.simplicity) : null;
  if (simplicity?.status === "blocked") blockers.push(...simplicity.blockers.map((blocker) => `Simplicity blocks execution: ${blocker}`));
  for (const risk of simplicity?.risks.filter(({ severity }) => severity === "high") ?? []) blockers.push(`Simplicity high risk blocks execution: ${risk.category}`);
  const mode: NativeExecutionMode = task?.mode ?? (task?.workerId ? "worker" : "deterministic");
  if (mode === "deterministic" && task?.workerId) blockers.push("Deterministic execution cannot select a worker");
  if (mode === "worker" && (!task?.workerId || !task.justification)) blockers.push("Worker execution requires a built-in workerId and bounded justification");
  const workerManifest = mode === "worker" && task?.workerId ? nativeWorkerCatalog.find((candidate) => candidate.id === task.workerId) : undefined;
  if (mode === "worker" && task?.workerId && !workerManifest) blockers.push("Execution worker must be an immutable built-in manifest");
  const selectedWorker: NativeExecutionWorker | null = workerManifest ? {
    id: workerManifest.id,
    manifestHash: nativeWorkerHash(workerManifest),
    allowedTools: workerManifest.allowedTools,
    budget: workerManifest.budget,
    stopCondition: workerManifest.stopCondition,
    evidenceRequirements: workerManifest.evidenceRequirements,
  } : null;
  let head: string | null = null;
  let events: NativeExecutionEvent[] = [];
  let workflow: WorkflowNextAction | null = null;
  try {
    const resolved = await gitRoot(root);
    const revision = await runGit(resolved, ["rev-parse", "HEAD"]);
    if (revision.code !== 0) blockers.push("Execution requires a committed Git HEAD");
    else head = revision.stdout;
    events = await readNativeExecutionEvents(resolved);
    if (task?.workflowItemId) {
      workflow = await resolveWorkflowNextAction(resolved, task.workflowItemId);
      if (workflow.status === "blocked") blockers.push(`Workflow blocks execution: ${workflow.reason}`);
    }
  } catch (error: unknown) {
    blockers.push(error instanceof Error ? error.message : "Execution repository cannot be inspected");
  }
  const completed = new Set(events.filter((event) => event.stage === "Recorder" && event.status === "completed").map((event) => event.taskId));
  const unmetDependencies = task ? task.dependencies.filter((dependency) => !completed.has(dependency)) : [];
  const retryOf = task ? [...events].reverse().find((event) => event.taskId === task.id && event.stage === "Recorder" && event.status === "failed")?.recordHash ?? null : null;
  if (unmetDependencies.length) blockers.push(`Execution dependencies are incomplete: ${unmetDependencies.join(", ")}`);
  const requiredApprovals: ("execution" | "high-risk-review")[] = task?.risk === "high" ? ["execution", "high-risk-review"] : ["execution"];
  const plan: NativeExecutionPlan = {
    schemaVersion: 1,
    status: blockers.length ? "blocked" : "ready",
    head,
    task,
    mode,
    stages: nativeRuntimeResponsibilities,
    selectedWorker,
    requiredApprovals,
    workflow,
    simplicity,
    unmetDependencies,
    retryOf,
    blockers,
    nextAction: blockers.length ? "Resolve the reported execution blockers and preview again." : "Review the exact plan hash, then apply with --plan and --yes.",
    planHash: null,
  };
  if (plan.status === "ready") plan.planHash = nativeExecutionPlanHash(plan);
  return plan;
}

function executionOutcome(plan: NativeExecutionPlan, executionStatus: "completed" | "blocked" | "failed", evidence: string[], nextAction: string): NativeExecutionOutcome {
  return { id: "execution.run", status: executionStatus === "completed" ? "ok" : executionStatus === "blocked" ? "warn" : "fail", taskId: plan.task?.id ?? null, executionStatus, planHash: plan.planHash, evidence, nextAction };
}

export async function applyNativeExecution(root: string, plan: NativeExecutionPlan, expectedPlanHash: string, approvals: { execution: boolean; highRisk: boolean }): Promise<NativeExecutionOutcome> {
  if (plan.status !== "ready" || !plan.task || !plan.head || !plan.planHash || expectedPlanHash !== plan.planHash || nativeExecutionPlanHash(plan) !== plan.planHash) return executionOutcome(plan, "blocked", plan.blockers, "Preview the execution task again and supply its exact plan hash.");
  if (!approvals.execution || (plan.task.risk === "high" && !approvals.highRisk)) return executionOutcome(plan, "blocked", ["Required execution approval is missing"], "Provide explicit execution and any required high-risk approval.");
  let resolved: string;
  try { resolved = await gitRoot(root); }
  catch { return executionOutcome(plan, "blocked", ["Execution repository is unavailable"], "Restore the repository and preview again."); }
  const base = join(resolved, ".downstroke", "executions");
  await mkdir(base, { recursive: true });
  const lockPath = join(base, "run.lock");
  let lock: Awaited<ReturnType<typeof open>> | undefined;
  try {
    lock = await open(lockPath, "wx", 0o600);
    const events = await readNativeExecutionEvents(resolved);
    const fresh = await planNativeExecution(resolved, plan.task);
    if (fresh.status !== "ready" || fresh.planHash !== plan.planHash || fresh.head !== plan.head) return executionOutcome(plan, "blocked", fresh.blockers, "Repository, workflow or prior execution state changed; preview execution again.");
    const completed = events.find((event) => event.taskId === plan.task!.id && event.planHash === plan.planHash && event.stage === "Recorder" && event.status === "completed");
    if (completed) return executionOutcome(plan, "completed", completed.evidence, "No action required; the exact execution already completed.");
    let previousHash = events.at(-1)?.recordHash ?? null;
    const append = async (stage: NativeExecutionEvent["stage"], status: NativeExecutionStatus, evidence: string[], nextAction: string, first = false): Promise<void> => {
      const stable = {
        schemaVersion: 1 as const,
        taskId: plan.task!.id,
        planHash: plan.planHash!,
        stage,
        status,
        evidence,
        nextAction,
        recordedAt: new Date().toISOString(),
        previousHash,
        ...(first ? { task: plan.task!, ...(plan.selectedWorker ? { worker: plan.selectedWorker } : {}) } : {}),
      };
      const record = { ...stable, recordHash: executionHash(stable) };
      await appendFile(join(base, "events.jsonl"), `${JSON.stringify(record)}\n`, { encoding: "utf8", mode: 0o600 });
      previousHash = record.recordHash;
    };
    await append("Planner", "running", [`operation:${plan.task.operation}`, `head:${plan.head}`], "Schedule declared dependencies.", true);
    if (plan.mode === "worker") {
      const nextAction = "Add a concrete typed native worker adapter, then preview a new execution plan.";
      await append("Scheduler", "blocked", [`worker:${plan.selectedWorker!.id}`, `manifest:${plan.selectedWorker!.manifestHash}`], nextAction);
      return executionOutcome(plan, "blocked", [`worker-preflight:${plan.selectedWorker!.id}`], nextAction);
    }
    await append("Scheduler", "running", ["dependencies:ready"], "Execute the allowlisted native operation.");
    await append("Executor", "running", ["capability:project.verify"], "Verify structured check evidence.");
    const inspection = await inspectProject(resolved);
    const verification = await runProjectChecks(resolved, inspection.scripts);
    const evidence = verification.checks.map((check) => `${check.script}:exit=${check.exitCode}`);
    if (verification.status !== "verified") {
      const nextAction = verification.status === "not-run" ? "Add at least one declared typecheck, test or build script and preview again." : "Fix the failed project check and preview execution again.";
      await append("Verifier", "failed", evidence.length ? evidence : ["checks:not-run"], nextAction);
      await append("Recorder", "failed", evidence.length ? evidence : ["checks:not-run"], nextAction);
      return executionOutcome(plan, "failed", evidence.length ? evidence : ["checks:not-run"], nextAction);
    }
    await append("Verifier", "completed", evidence, "Record the verified outcome.");
    await append("Recorder", "completed", evidence, "No action required; execution completed with verified evidence.");
    return executionOutcome(plan, "completed", evidence, "No action required; execution completed with verified evidence.");
  } catch {
    return executionOutcome(plan, "blocked", ["Execution could not acquire or update its local ledger"], "Inspect the execution ledger and preview again.");
  } finally {
    await lock?.close().catch(() => undefined);
    if (lock) await unlink(lockPath).catch(() => undefined);
  }
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

export async function planLocalCommit(root: string, selectedInput: readonly string[], message: string): Promise<LocalCommitPlan> {
  const blockers: string[] = [];
  let resolved = root;
  let branch: string | null = null;
  let head: string | null = null;
  let indexTree: string | null = null;
  let changed: string[] = [];
  let staged: string[] = [];
  let fingerprint: string | null = null;
  const selected = [...new Set(selectedInput.map((path) => path.replaceAll("\\", "/")))].sort();
  if (!selected.length) blockers.push("Select at least one changed file with --file");
  if (selected.some((path) => !path || path.startsWith("/") || /^[A-Za-z]:\//.test(path) || path.split("/").includes(".."))) blockers.push("Selected paths must be repository-relative and cannot traverse parents");
  if (!validCommitMessage(message)) blockers.push("Message must be a single-line Conventional Commit without AI attribution");
  try {
    resolved = await gitRoot(root);
    const [branchResult, headResult, indexResult, trackedResult, untrackedResult, stagedResult] = await Promise.all([
      runGit(resolved, ["symbolic-ref", "--quiet", "--short", "HEAD"]),
      runGit(resolved, ["rev-parse", "HEAD"]),
      runGit(resolved, ["write-tree"]),
      runGit(resolved, ["diff", "HEAD", "--name-only", "-z"]),
      runGit(resolved, ["ls-files", "--others", "--exclude-standard", "-z"]),
      runGit(resolved, ["diff", "--cached", "--name-only", "-z"]),
    ]);
    if (branchResult.code !== 0) blockers.push("Detached or unborn HEAD is not supported"); else branch = branchResult.stdout;
    if (headResult.code !== 0) blockers.push("Repository has no commit to anchor the local commit"); else head = headResult.stdout;
    if (indexResult.code !== 0) blockers.push("Git index cannot be inspected"); else indexTree = indexResult.stdout;
    if (trackedResult.code || untrackedResult.code || stagedResult.code) blockers.push("Changed files cannot be inspected");
    else {
      changed = [...new Set([...nulPaths(trackedResult.stdout), ...nulPaths(untrackedResult.stdout)])].sort();
      staged = nulPaths(stagedResult.stdout);
      const missing = selected.filter((path) => !changed.includes(path));
      if (missing.length) blockers.push(`Selected paths are not changed: ${missing.join(", ")}`);
      const unrelated = staged.filter((path) => !selected.includes(path));
      if (unrelated.length) blockers.push(`Unrelated staged paths must be resolved first: ${unrelated.join(", ")}`);
      if (selected.length && !missing.length) {
        const state = await runGit(resolved, ["diff", "HEAD", "--binary", "--", ...selected]);
        const objects = await Promise.all(selected.map((path) => runGit(resolved, ["hash-object", "--no-filters", "--", path])));
        fingerprint = createHash("sha256").update(JSON.stringify([state.stdout, ...objects.map((item) => item.code === 0 ? item.stdout : "deleted")])).digest("hex");
      }
    }
    const policy = await readGitPolicy(resolved);
    if (!policy?.enabled || !policy.permissions.commit.enabled) blockers.push("Repository policy does not allow local commits");
  } catch (error: unknown) {
    blockers.push(error instanceof Error ? error.message : "Git repository cannot be inspected");
  }
  return { status: blockers.length ? "blocked" : "ready", root: ".", branch, head, indexTree, changed, staged, selected, message, fingerprint, blockers };
}

export async function applyLocalCommit(root: string, plan: LocalCommitPlan): Promise<LocalCommitResult> {
  if (plan.status !== "ready" || !plan.branch || !plan.head || !plan.indexTree || !plan.fingerprint) return { id: "git.commit", status: "fail", message: plan.blockers.join("; ") || "Local commit plan is blocked", remediation: "Preview the local commit again" };
  try {
    const resolved = await gitRoot(root);
    const fresh = await planLocalCommit(resolved, plan.selected, plan.message);
    if (JSON.stringify(fresh) !== JSON.stringify(plan)) return { id: "git.commit", status: "fail", message: "Git state changed after preview", remediation: "Preview the local commit again" };
    const staged = await runGit(resolved, ["add", "--", ...plan.selected]);
    if (staged.code !== 0) throw new Error(staged.stderr || "Selected paths could not be staged");
    const committed = await runGit(resolved, ["commit", "-m", plan.message]);
    if (committed.code !== 0) throw new Error(committed.stderr || "Local commit failed");
    const [commit, branch, message, tree, committedPaths] = await Promise.all([
      runGit(resolved, ["rev-parse", "HEAD"]), runGit(resolved, ["symbolic-ref", "--quiet", "--short", "HEAD"]),
      runGit(resolved, ["show", "-s", "--format=%B", "HEAD"]), runGit(resolved, ["show", "-s", "--format=%T", "HEAD"]),
      runGit(resolved, ["diff-tree", "--no-commit-id", "--name-only", "-r", "-z", "HEAD"]),
    ]);
    if (commit.code || branch.code || message.code || tree.code || committedPaths.code || branch.stdout !== plan.branch || message.stdout !== plan.message
      || JSON.stringify(nulPaths(committedPaths.stdout)) !== JSON.stringify(plan.selected)) throw new Error("Local commit verification failed");
    return { id: "git.commit", status: "ok", message: "Focused local commit created", branch: branch.stdout, commit: commit.stdout, remediation: "Push remains separately authorized" };
  } catch (error: unknown) {
    return { id: "git.commit", status: "fail", message: error instanceof Error ? error.message : "Local commit failed", remediation: "Inspect the index and preview the local commit again" };
  }
}

export type ProjectInspection = {
  projectKind: "consumer" | "maintenance-checkout";
  stage: "empty" | "documented" | "scaffolded" | "implemented";
  stacks: string[];
  scripts: string[];
  signals: string[];
  originInference: string;
  manifestError?: string;
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
  for (const [name] of workflowFiles) {
    try { if ((await lstat(join(base, name))).isSymbolicLink()) throw new Error(`Workflow file cannot be symlinked: ${name}`); }
    catch (error: unknown) { if (!isMissing(error)) throw error; }
  }
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
  if (typeof input.owner !== "string" || input.owner.trim() === "" || sources.length < 2 || sources.some((item) => !item) || options.length < 2 || options.some((item) => !item) || new Set(options.map((item) => item?.id)).size !== options.length || consequences.length === 0) return undefined;
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
  return (await readWorkflowLines(join(base, "items.jsonl"))).map((line) => {
    const value = JSON.parse(line) as Record<string, unknown>;
    const parsed = parseWorkflowItem(value, "");
    if (!parsed || !Array.isArray(value.acceptanceCriteria) || !Array.isArray(value.tasks) || !Array.isArray(value.evidence) || !Array.isArray(value.deferredWork) || !validWorkflowTimestamp(value.createdAt) || !validWorkflowTimestamp(value.updatedAt)) throw new Error("Workflow item record is malformed");
    return parsed;
  });
}

async function readWorkflowCheckpoints(root: string): Promise<WorkflowCheckpoint[]> {
  const base = await checkedWorkflowRoot(root);
  return (await readWorkflowLines(join(base, "checkpoints.jsonl"))).map((line) => {
    const value = JSON.parse(line) as Record<string, unknown>;
    if (typeof value.id !== "string" || typeof value.itemId !== "string" || !workflowPhases.includes(value.phase as WorkflowPhase) || !["pending", "approved"].includes(String(value.status)) || !validWorkflowTimestamp(value.createdAt) || value.status === "approved" && !validWorkflowTimestamp(value.approvedAt)) throw new Error("Workflow checkpoint record is malformed");
    return value as WorkflowCheckpoint;
  });
}

async function readWorkflowConflicts(root: string): Promise<WorkflowConflict[]> {
  const base = await checkedWorkflowRoot(root);
  return (await readWorkflowLines(join(base, "decisions.jsonl"))).map((line) => {
    const value = JSON.parse(line) as Record<string, unknown>;
    if (typeof value.id !== "string" || typeof value.itemId !== "string" || typeof value.owner !== "string" || !["pending", "resolved"].includes(String(value.status)) || !validWorkflowTimestamp(value.createdAt) || !Array.isArray(value.sources) || !Array.isArray(value.options) || new Set(value.options.map((option) => typeof option === "object" && option !== null ? (option as Record<string, unknown>).id : undefined)).size !== value.options.length || !Array.isArray(value.consequences) || value.status === "resolved" && (!validWorkflowTimestamp(value.resolvedAt) || typeof value.resolvedBy !== "string" || typeof value.selectedOption !== "string" || typeof value.rationale !== "string")) throw new Error("Workflow conflict record is malformed");
    return value as WorkflowConflict;
  });
}

function validWorkflowTimestamp(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function workflowHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(normalizeJson(value))).digest("hex");
}

function workflowPlanHash(plan: Omit<WorkflowPlan, "planHash">): string {
  return workflowHash({ action: plan.action, files: plan.files, stateHash: plan.stateHash, item: plan.item ? workflowIdentity(plan.item) : null, checkpoint: plan.checkpoint ? { itemId: plan.checkpoint.itemId, phase: plan.checkpoint.phase, status: plan.checkpoint.status } : null, conflict: plan.conflict ? { itemId: plan.conflict.itemId, owner: plan.conflict.owner, sources: plan.conflict.sources, options: plan.conflict.options, consequences: plan.conflict.consequences } : null, nextAction: plan.nextAction, blockers: plan.blockers });
}

function isMissing(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

function isExists(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "EEXIST";
}

async function workflowStateHash(root: string): Promise<string> {
  try {
    const base = await checkedWorkflowRoot(root);
    const state: Record<string, unknown[]> = {};
    for (const name of ["items.jsonl", "checkpoints.jsonl", "decisions.jsonl"] as const) state[name] = (await readWorkflowLines(join(base, name))).map((line) => JSON.parse(line) as unknown);
    return workflowHash(state);
  } catch (error: unknown) {
    if (isMissing(error)) return workflowHash({ "items.jsonl": [], "checkpoints.jsonl": [], "decisions.jsonl": [] });
    throw error;
  }
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
  if (!item) return { status: "blocked", action: "append", files: workflowFiles.map(([path]) => `.downstroke/workflows/${path}`), item: null, blockers: ["Workflow item is malformed"], stateHash: null, planHash: null };
  let stateHash: string | null = null;
  try { stateHash = await workflowStateHash(root); } catch { blockers.push("Workflow state is malformed or cannot be inspected safely"); }
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
  if (conflict) {
    try { if ((await readWorkflowConflicts(root)).some((existingConflict) => existingConflict.id === conflict.id)) blockers.push("Material workflow conflict is already recorded"); }
    catch (error: unknown) { if (!isMissing(error)) blockers.push("Workflow state is malformed or cannot be inspected safely"); }
  }
  let existing: WorkflowItem[] = [];
  try { existing = await readWorkflowItems(root); }
  catch (error: unknown) { if (!isMissing(error)) blockers.push("Workflow state is malformed or cannot be inspected safely"); }
  const duplicate = existing.find((candidate) => candidate.id === item.id && JSON.stringify(workflowIdentity(candidate)) === JSON.stringify(workflowIdentity(item)));
  const nextAction = conflict
    ? { status: "blocked", itemId: item.id, action: "resolve-conflict", reason: "Material conflict requires owner decision" } satisfies WorkflowNextAction
    : checkpoint && checkpoint.status === "pending"
      ? { status: "ready", itemId: item.id, action: controlledAction(checkpoint.phase), reason: "Controlled checkpoint requires approval" } satisfies WorkflowNextAction
      : nextFromItem(item);
  const result: Omit<WorkflowPlan, "planHash"> = {
    status: blockers.length ? "blocked" : "ready",
    action: duplicate && !checkpoint && !conflict ? "skip" : "append",
    files: workflowFiles.map(([path]) => `.downstroke/workflows/${path}`),
    item,
    ...(checkpoint ? { checkpoint } : {}),
    ...(conflict ? { conflict } : {}),
    nextAction,
    blockers,
    stateHash,
  };
  return { ...result, planHash: workflowPlanHash(result) };
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

async function withWorkflowTransaction<T>(root: string, files: string[], operation: (base: string) => Promise<T>): Promise<T> {
  const repository = await gitRoot(root);
  const downstroke = join(repository, ".downstroke");
  await mkdir(downstroke, { recursive: true });
  if ((await lstat(downstroke)).isSymbolicLink()) throw new Error("Workflow parent cannot be symlinked");
  const lockPath = join(downstroke, "workflow.lock");
  let lock: Awaited<ReturnType<typeof open>> | undefined;
  try {
    lock = await open(lockPath, "wx", 0o600);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "EEXIST") throw new Error("Workflow mutation is locked; retry after the current mutation completes");
    throw error;
  }
  const snapshots = new Map<string, Buffer | null>();
  try {
    for (const name of files) {
      const target = join(downstroke, "workflows", name);
      try { snapshots.set(target, await readFile(target)); } catch (error: unknown) { if (isMissing(error)) snapshots.set(target, null); else throw error; }
    }
    return await operation(await initializeWorkflowStorage(repository));
  } catch (error: unknown) {
    const failures: string[] = [];
    for (const [target, content] of snapshots) {
      try { if (content === null) await unlink(target).catch((restoreError: unknown) => { if (!isMissing(restoreError)) throw restoreError; }); else await writeFile(target, content); }
      catch (restoreError: unknown) { failures.push(`${target}: ${restoreError instanceof Error ? restoreError.message : "restore failed"}`); }
    }
    if (failures.length) throw new Error(`Workflow mutation failed and rollback failed: ${failures.join("; ")}`, { cause: error });
    throw error;
  } finally {
    await lock?.close().catch(() => undefined);
    await unlink(lockPath).catch(() => undefined);
  }
}

export async function applyWorkflowItem(root: string, plan: WorkflowPlan, expectedPlanHash = ""): Promise<DoctorResult> {
  const conflictOnly = plan.blockers.length > 0 && plan.blockers.every((blocker) => blocker.startsWith("Material workflow conflict"));
  if ((plan.status === "blocked" && !conflictOnly) || !plan.item || !plan.planHash || expectedPlanHash !== plan.planHash) return { id: "workflow.item", status: "fail", message: plan.blockers.join("; ") || "Workflow plan is blocked, malformed or has the wrong hash", remediation: "Correct and preview the workflow item again" };
  try { await withWorkflowTransaction(root, workflowFiles.map(([name]) => name), async (base) => {
    const fresh = await planWorkflowItem(root, { item: plan.item, ...(plan.checkpoint ? { controlled: true, phase: plan.checkpoint.phase, approved: plan.checkpoint.status === "approved" } : {}), ...(plan.conflict ? { conflict: plan.conflict } : {}) });
    if (fresh.planHash !== plan.planHash || !fresh.item) throw new Error("Workflow state changed after preview");
    const timestamp = new Date().toISOString();
    if (fresh.checkpoint) await appendFile(join(base, "checkpoints.jsonl"), `${JSON.stringify({ ...fresh.checkpoint, createdAt: timestamp, ...(fresh.checkpoint.status === "approved" ? { approvedAt: timestamp } : {}) })}\n`);
    if (fresh.conflict) await appendFile(join(base, "decisions.jsonl"), `${JSON.stringify({ ...fresh.conflict, createdAt: timestamp })}\n`);
    if (fresh.action === "append") await appendFile(join(base, "items.jsonl"), `${JSON.stringify({ ...fresh.item, createdAt: timestamp, updatedAt: timestamp })}\n`);
  }); } catch (error: unknown) { return { id: "workflow.item", status: "fail", message: error instanceof Error ? error.message : "Workflow mutation failed safely", remediation: "Inspect workflow storage and preview again" }; }
  return conflictOnly
    ? { id: "workflow.item", status: "warn", message: "Workflow conflict retained; human resolution required", evidence: plan.item.id, remediation: "Resolve the reported material conflict" }
    : { id: "workflow.item", status: "ok", message: plan.action === "skip" ? "Workflow item already exists" : "Workflow item stored", evidence: plan.item.id, remediation: "No action required" };
}

export async function planWorkflowConflictResolution(root: string, input: WorkflowResolveInput): Promise<WorkflowResolutionPlan> {
  const blockers: string[] = [];
  if (!input.itemId || !input.selectedOption || !input.owner || !input.rationale) blockers.push("Conflict resolution requires itemId, selectedOption, owner and rationale");
  let conflicts: WorkflowConflict[];
  try { conflicts = await readWorkflowConflicts(root); }
  catch { return { status: "blocked", input, conflict: null, blockers: ["Workflow decisions cannot be inspected safely"], stateHash: null, planHash: null }; }
  const latest = lastMatching(conflicts, (item) => item.itemId === input.itemId);
  const conflict = latest?.status === "pending" ? latest : undefined;
  if (!conflict) blockers.push("No pending workflow conflict found");
  else {
    if (!conflict.options.some((option) => option.id === input.selectedOption)) blockers.push("Selected option is not declared");
    if (input.owner !== conflict.owner) blockers.push("Only the designated conflict owner may resolve it");
  }
  let stateHash: string | null = null;
  try { stateHash = await workflowStateHash(root); } catch { blockers.push("Workflow state is malformed or cannot be inspected safely"); }
  const semantic = conflict && stateHash ? { stateHash, conflictId: conflict.id, conflict: { owner: conflict.owner, sources: conflict.sources, options: conflict.options, consequences: conflict.consequences, status: conflict.status }, input } : null;
  return { status: blockers.length ? "blocked" : "ready", input, conflict: conflict ?? null, blockers, stateHash, planHash: semantic ? workflowHash(semantic) : null };
}

export async function resolveWorkflowConflict(root: string, plan: WorkflowResolutionPlan, expectedPlanHash = ""): Promise<DoctorResult> {
  if (plan.status !== "ready" || !plan.conflict || !plan.planHash || expectedPlanHash !== plan.planHash) return { id: "workflow.conflict", status: "fail", message: plan.blockers.join("; ") || "Conflict plan is blocked, malformed or has the wrong hash", remediation: "Preview the conflict resolution again" };
  try { await withWorkflowTransaction(root, ["decisions.jsonl"], async (base) => {
    const fresh = await planWorkflowConflictResolution(root, plan.input);
    if (fresh.planHash !== plan.planHash) throw new Error("Workflow conflict changed after preview");
    if (!fresh.conflict) throw new Error("Workflow conflict changed after preview");
    const resolved: WorkflowConflict = { ...fresh.conflict, status: "resolved", selectedOption: fresh.input.selectedOption, rationale: fresh.input.rationale, resolvedBy: fresh.input.owner, resolvedAt: new Date(Math.max(Date.now(), Date.parse(fresh.conflict.createdAt))).toISOString() };
    await appendFile(join(base, "decisions.jsonl"), `${JSON.stringify(resolved)}\n`);
  }); } catch (error: unknown) { return { id: "workflow.conflict", status: "fail", message: error instanceof Error ? error.message : "Workflow conflict mutation failed safely", remediation: "Inspect workflow storage and preview again" }; }
  return { id: "workflow.conflict", status: "ok", message: "Workflow conflict resolution stored", evidence: `${plan.input.itemId}:${plan.input.selectedOption}`, remediation: "Resume the workflow" };
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
  const state = await readCommunicationPolicyState(root);
  return state.kind === "ready" ? state.policy : null;
}

async function readCommunicationPolicyState(root: string): Promise<{ kind: "ready"; policy: CommunicationPolicy } | { kind: "missing" } | { kind: "malformed" }> {
  try {
    const parsed = parseCommunicationPolicy(JSON.parse(await readFile(join(await checkedCommunicationRoot(root), "policy.json"), "utf8")));
    return parsed ? { kind: "ready", policy: parsed } : { kind: "malformed" };
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") return { kind: "missing" };
    return { kind: "malformed" };
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

function communicationPreferenceIdentity(value: CommunicationPreference | undefined): unknown {
  return value ? { id: value.id, status: value.status, value: value.value, reason: value.reason, source: value.source } : null;
}

export async function planCommunicationPolicy(root: string, input: { mode?: unknown; budgetTokens?: unknown; preference?: unknown } = {}): Promise<CommunicationPlan> {
  const timestamp = new Date().toISOString();
  const blockers: string[] = [];
  const state = await readCommunicationPolicyState(root);
  if (state.kind === "malformed") blockers.push("Communication policy is malformed");
  const current = state.kind === "ready" ? state.policy : null;
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
  if (JSON.stringify(communicationPreferenceIdentity(fresh.preference)) !== JSON.stringify(communicationPreferenceIdentity(plan.preference))) return { id: "communication.policy", status: "fail", message: "Communication preference changed after preview", remediation: "Preview the communication preference again" };
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

function nonEmpty(value: unknown): boolean {
  return typeof value === "string" ? value.trim().length > 0 : Array.isArray(value) ? value.length > 0 : Boolean(value);
}

function textSample(input: SimplicityGateInput): string {
  return [
    input.proposal,
    input.risk,
    input.evidence,
    input.impact,
    input.owner,
    input.tests,
    input.rollback,
    ...(input.files ?? []).map((file) => `${file.path}\n${file.content ?? ""}`),
    ...(input.dependencies ?? []).map((dependency) => `${dependency.name}@${dependency.spec ?? ""} ${dependency.source ?? ""}`),
  ].filter((item): item is string => typeof item === "string").join("\n").slice(0, 20000);
}

function addRisk(risks: SimplicityRiskFinding[], finding: SimplicityRiskFinding): void {
  if (!risks.some((item) => item.id === finding.id)) risks.push(finding);
}

function auditSimplicityRisks(input: SimplicityGateInput): SimplicityRiskFinding[] {
  const risks: SimplicityRiskFinding[] = [];
  const text = textSample(input);
  if (/\b(eval|Function|exec|execSync|spawn|spawnSync)\s*\(/.test(text)) addRisk(risks, {
    id: "risk.unsafe-execution",
    severity: "high",
    category: "unsafe-execution",
    evidence: "Dynamic code or process execution pattern detected",
    nextAction: "Replace string-built execution with argument arrays, allowlists and explicit approval",
  });
  if (/\b(token|password|secret|api[_-]?key|private[_-]?key)\b\s*[:=]\s*["']?[A-Za-z0-9_./+=-]{16,}/i.test(text)) addRisk(risks, {
    id: "risk.secret-leakage",
    severity: "high",
    category: "secret-leakage",
    evidence: "Secret-like key/value pattern detected",
    nextAction: "Remove the value, rotate it if real and store only non-secret configuration",
  });
  if (/\b(ghp_|github_pat_|npm_|AKIA)[A-Za-z0-9_=-]{12,}|-----BEGIN (RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/.test(text)) addRisk(risks, {
    id: "risk.secret-leakage",
    severity: "high",
    category: "secret-leakage",
    evidence: "Credential-shaped token detected",
    nextAction: "Remove the value, rotate it if real and store only non-secret configuration",
  });
  if (/\.\.[\\/]/.test(text) || /(^|[\s="'`])([A-Za-z]:[\\/]|\/(?:etc|var|home|root|Users)\b)/.test(text)) addRisk(risks, {
    id: "risk.path-traversal",
    severity: "high",
    category: "path-traversal",
    evidence: "Unsafe relative or absolute path detected",
    nextAction: "Resolve paths against the repository root and reject paths outside the allowed root",
  });
  if (/(SELECT|UPDATE|DELETE|INSERT)\b[\s\S]{0,120}\$\{|innerHTML\s*=|dangerouslySetInnerHTML|exec\s*\([\s\S]{0,80}\$\{/i.test(text)) addRisk(risks, {
    id: "risk.injection",
    severity: "high",
    category: "injection",
    evidence: "Interpolated sensitive sink detected",
    nextAction: "Use parameterized APIs, escaping or structured arguments at the trust boundary",
  });
  if (/\([^)]*[+*][^)]*\)(?:[+*]|\{\d+,?\d*\})|\((\w+)\|\1\w+\)[+*]/.test(text)) addRisk(risks, {
    id: "risk.redos",
    severity: "medium",
    category: "redos",
    evidence: "Catastrophic regex shape detected",
    nextAction: "Replace with a bounded parser, anchored regex or input length limit",
  });
  for (const dependency of input.dependencies ?? []) {
    const spec = dependency.spec ?? "";
    if (!spec || dependency.hasInstallScript || /^(git\+|https?:|github:|file:|\*|latest$|[\^~]|[<>]=?)/i.test(spec) || /^(git\+|https?:|github:|file:)/i.test(dependency.source ?? "")) addRisk(risks, {
      id: `risk.supply-chain.${dependency.name}`,
      severity: "medium",
      category: "supply-chain",
      evidence: `${dependency.name}@${spec || dependency.source || "unknown"}`,
      nextAction: "Pin the dependency, review provenance and document why native/platform code is insufficient",
    });
  }
  for (const file of input.files ?? []) {
    if (file.generated || /(^|[\\/])(dist|build|generated|coverage|vendor)([\\/]|$)|\.min\.(js|css)$/i.test(file.path)) addRisk(risks, {
      id: `risk.generated-artifact.${file.path}`,
      severity: "low",
      category: "generated-artifact",
      evidence: file.path,
      nextAction: "Exclude generated output or attach review evidence explaining why it is source-controlled",
    });
  }
  return risks;
}

export function evaluateSimplicityGates(input: SimplicityGateInput = {}): SimplicityGateReport {
  const sample = textSample(input).toLowerCase();
  const majorChange = Boolean(input.dependency || input.sharedPackage || input.abstraction || input.rewrite);
  const safetyException = Boolean(input.safetyException);
  const aliases: Record<SimplicityGateStep, string[]> = {
    delete: ["delete", "remove", "unnecessary"],
    reuse: ["reuse", "existing code"],
    configure: ["configure", "config"],
    platform: ["platform", "stdlib", "standard library", "native"],
    "existing-dependency": ["existing dependency", "installed dependency"],
    "small-local-code": ["small local", "local code"],
    "new-dependency": ["new dependency", "package"],
    abstraction: ["abstraction", "interface", "shared"],
    rewrite: ["rewrite", "replace"],
  };
  const ladder = simplicityGateSteps.map((step) => {
    const baselineStep = ["delete", "reuse", "configure", "platform", "existing-dependency", "small-local-code"].includes(step);
    const structuredEvidence = baselineStep ? input.simplerPaths?.[step as keyof NonNullable<SimplicityGateInput["simplerPaths"]>] : undefined;
    const considered = structuredEvidence !== undefined ? nonEmpty(structuredEvidence) : baselineStep && !majorChange || aliases[step].some((alias) => sample.includes(alias)) || step === "new-dependency" && Boolean(input.dependency) || step === "abstraction" && Boolean(input.abstraction || input.sharedPackage) || step === "rewrite" && Boolean(input.rewrite);
    return { step, considered, evidence: structuredEvidence ?? (considered ? "considered" : "not-evidenced") };
  });
  const required = ["evidence", "consumers", "impact", "owner", "tests", "rollback"] as const;
  const findings: SimplicityGateFinding[] = [];
  const missingBaseline = ladder.filter((item) => ["delete", "reuse", "configure", "platform", "existing-dependency", "small-local-code"].includes(item.step) && !item.considered).map((item) => item.step);
  if (majorChange && missingBaseline.length) findings.push({
    id: "gate.simplicity-ladder",
    status: "blocked",
    message: `Major change is missing simpler-path evidence for ${missingBaseline.join(", ")}`,
    nextAction: "Document why deletion, reuse, configuration, platform capability, existing dependency and small local code are insufficient",
  });
  if (majorChange) {
    const missing = required.filter((field) => !nonEmpty(input[field]));
    const finding: SimplicityGateFinding = {
      id: "gate.major-change-evidence",
      status: missing.length ? "blocked" : "ok",
      message: missing.length ? `Major change is missing ${missing.join(", ")}` : "Major change evidence is complete",
      nextAction: missing.length ? "Provide the missing fields before adding dependency, abstraction, shared package or broad rewrite" : "Proceed with the reviewed minimal safe path",
    };
    if (!missing.length) finding.evidence = "evidence, consumers, impact, owner, tests and rollback provided";
    findings.push(finding);
  } else {
    findings.push({ id: "gate.simplicity-ladder", status: "ok", message: "Simplicity ladder considered", evidence: ladder.map((item) => item.step).join(" > "), nextAction: "Prefer the first safe step that works" });
  }
  if (safetyException) findings.push({
    id: "gate.safety-exception",
    status: "warn",
    message: "Safety exception recorded; safety takes precedence over minimality",
    evidence: typeof input.safetyException === "string" ? input.safetyException : "safety exception requested",
    nextAction: "Keep the extra complexity bounded and verify the safety requirement",
  });
  const risks = auditSimplicityRisks(input);
  const blockers = findings.filter((finding) => finding.status === "blocked").map((finding) => finding.message);
  return {
    status: blockers.length ? "blocked" : "ready",
    ladder,
    findings,
    risks,
    exception: { active: safetyException, reason: safetyException ? String(input.safetyException === true ? "safety requirement" : input.safetyException) : null },
    blockers,
  };
}

const codeIntelligenceManifestPath = ".downstroke/code-intelligence/manifest.json";
const codeIntelligenceFiles = [
  codeIntelligenceManifestPath,
  ".downstroke/code-intelligence/files.jsonl",
  ".downstroke/code-intelligence/packages.jsonl",
  ".downstroke/code-intelligence/stack.jsonl",
] as const;
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts"]);
const configNames = new Set(["package.json", "tsconfig.json", "vite.config.ts", "vite.config.js", "next.config.js", "next.config.mjs", "expo.json", "app.json", "eslint.config.js", "tailwind.config.js", "vitest.config.ts", "playwright.config.ts", "package-lock.json", "npm-shrinkwrap.json", "pnpm-lock.yaml", "yarn.lock"]);
const excludedDirectories = new Set([".git", ".downstroke", "node_modules", "dist", "build", "coverage", "generated", "vendor"]);

function posixPath(path: string): string {
  return path.replace(/\\/g, "/");
}

function codeHash(content: Buffer | string): string {
  return createHash("sha256").update(content).digest("hex");
}

function secretLike(content: string): boolean {
  return /\b(token|password|secret|api[_-]?key|private[_-]?key)\b\s*[:=]\s*["']?[A-Za-z0-9_./+=-]{16,}/i.test(content)
    || /\b(ghp_|github_pat_|npm_|AKIA)[A-Za-z0-9_=-]{12,}|-----BEGIN (RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/.test(content)
    || /\bBearer\s+[A-Za-z0-9._~+\/-]{16,}|\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|\b[a-z][a-z0-9+.-]*:\/\/[^\s/:]+:[^\s/@]+@/i.test(content);
}

function allowedCodePath(path: string): boolean {
  const name = basename(path);
  return sourceExtensions.has(extname(path)) || configNames.has(name);
}

function extractSpecifiers(pattern: RegExp, content: string): string[] {
  const found = new Set<string>();
  for (const match of content.matchAll(pattern)) if (match[1]) found.add(match[1]);
  return [...found].sort();
}

function extractCodeFacts(path: string, content: string): Pick<CodeIndexedFile, "imports" | "exports" | "symbols"> {
  if (!sourceExtensions.has(extname(path))) return { imports: [], exports: [], symbols: [] };
  const imports = extractSpecifiers(/\bimport\s+(?:[^'"]+\s+from\s+)?["']([^"']+)["']/g, content);
  const reExports = extractSpecifiers(/\bexport\s+[^'"]*\s+from\s+["']([^"']+)["']/g, content);
  const exports = [...content.matchAll(/\bexport\s+(?:async\s+)?(?:function|class|interface|type|const|let|var)\s+([A-Za-z_$][\w$]*)/g)].map((match) => match[1]!).sort();
  const symbols = [...content.matchAll(/^(?:export\s+)?(?:async\s+)?(?:function|class|interface|type|const|let|var)\s+([A-Za-z_$][\w$]*)/gm)].map((match) => match[1]!).sort();
  return { imports: [...new Set([...imports, ...reExports])].sort(), exports: [...new Set(exports)], symbols: [...new Set(symbols)] };
}

function packageDependencies(input: Record<string, unknown>): Record<string, string> {
  const dependencies: Record<string, string> = {};
  for (const key of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
    const group = input[key];
    if (typeof group !== "object" || group === null || Array.isArray(group)) continue;
    for (const [name, version] of Object.entries(group)) if (typeof version === "string") dependencies[name] = version;
  }
  return Object.fromEntries(Object.entries(dependencies).sort());
}

function packageManagerFromFiles(paths: Set<string>, packageManager: unknown): string | null {
  if (typeof packageManager === "string" && packageManager.trim()) return packageManager;
  if (paths.has("pnpm-lock.yaml")) return "pnpm";
  if (paths.has("yarn.lock")) return "yarn";
  if (paths.has("package-lock.json") || paths.has("npm-shrinkwrap.json")) return "npm";
  return null;
}

function stackFromPackage(path: string, hash: string, dependencies: Record<string, string>): CodeStackObservation[] {
  const map: Record<string, string> = {
    typescript: "TypeScript",
    react: "React",
    next: "Next.js",
    expo: "Expo",
    "react-native": "React Native",
    vite: "Vite",
    vitest: "Vitest",
    playwright: "Playwright",
    tailwindcss: "Tailwind CSS",
    zod: "Zod",
    drizzle: "Drizzle",
    prisma: "Prisma",
    "@nestjs/core": "NestJS",
    express: "Express",
  };
  return Object.entries(map).filter(([name]) => dependencies[name]).map(([name, technology]) => ({ technology, version: dependencies[name] ?? null, source: { path, hash }, status: "observed" as const }));
}

function stackFromConfig(path: string, hash: string): CodeStackObservation[] {
  const name = basename(path);
  const configTech: Record<string, string> = {
    "tsconfig.json": "TypeScript",
    "vite.config.ts": "Vite",
    "vite.config.js": "Vite",
    "next.config.js": "Next.js",
    "next.config.mjs": "Next.js",
    "tailwind.config.js": "Tailwind CSS",
    "vitest.config.ts": "Vitest",
    "playwright.config.ts": "Playwright",
    "expo.json": "Expo",
    "app.json": "Expo",
  };
  const technology = configTech[name];
  return technology ? [{ technology, version: null, source: { path, hash }, status: "observed" }] : [];
}

async function readExistingCodeHashes(root: string): Promise<Map<string, string>> {
  const state = await readLocalFile(root, ".downstroke/code-intelligence/files.jsonl");
  if (state.kind !== "file") return new Map();
  const hashes = new Map<string, string>();
  for (const line of state.content.toString("utf8").split(/\r?\n/).filter(Boolean)) {
    try {
      const record = JSON.parse(line) as Partial<CodeIndexedFile>;
      if (typeof record.path === "string" && typeof record.hash === "string") hashes.set(record.path, record.hash);
    } catch { return new Map(); }
  }
  return hashes;
}

async function collectCodeCandidates(root: string): Promise<{ paths: string[]; exclusions: CodeIndexExclusion[]; blocker?: string }> {
  const paths: string[] = [];
  const exclusions: CodeIndexExclusion[] = [];
  const excluded = new Set<string>();
  const listed = await runGit(root, ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], true);
  if (listed.code !== 0) return { paths, exclusions, blocker: `Git file enumeration failed${listed.stderr ? `: ${listed.stderr}` : ""}` };
  for (const rawPath of listed.stdout.split("\0").filter(Boolean)) {
    const relativePath = posixPath(rawPath);
    const parts = relativePath.split("/");
    const excludedIndex = parts.findIndex((part) => excludedDirectories.has(part));
    if (excludedIndex >= 0) { excluded.add(parts.slice(0, excludedIndex + 1).join("/")); continue; }
    if (!allowedCodePath(relativePath)) { exclusions.push({ path: relativePath, reason: "not-allowlisted" }); continue; }
    paths.push(relativePath);
  }
  exclusions.push(...[...excluded].sort().map((path) => ({ path, reason: "excluded-directory" as const })));
  return { paths: [...new Set(paths)].sort(), exclusions };
}

async function readCodeIndex(root: string): Promise<{ status: "ready" | "missing-index" | "invalid-index"; files: CodeIndexedFile[]; reason: string }> {
  const resolved = await gitRoot(root);
  const manifestState = await readLocalFile(resolved, ".downstroke/code-intelligence/manifest.json");
  const filesState = await readLocalFile(resolved, ".downstroke/code-intelligence/files.jsonl");
  if (manifestState.kind === "missing" && filesState.kind === "missing") return { status: "missing-index", files: [], reason: "Code intelligence index is missing" };
  if (manifestState.kind !== "file" || filesState.kind !== "file") return { status: "invalid-index", files: [], reason: "Code intelligence index is incomplete" };
  try {
    const manifest = JSON.parse(manifestState.content.toString("utf8")) as unknown;
    const files = filesState.content.toString("utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as unknown);
    if (!plainObject(manifest) || manifest.schemaVersion !== "0.1.0" || manifest.module !== "downstroke-code-intelligence" || typeof manifest.createdAt !== "string" || !Number.isFinite(Date.parse(manifest.createdAt)) || typeof manifest.updatedAt !== "string" || !Number.isFinite(Date.parse(manifest.updatedAt)) || !Number.isInteger(manifest.files) || manifest.files !== files.length) throw new Error("manifest");
    if (!files.every((file) => plainObject(file) && typeof file.path === "string" && safeExperiencePath(file.path) && typeof file.hash === "string" && /^[a-f0-9]{64}$/.test(file.hash) && Number.isSafeInteger(file.bytes) && Number(file.bytes) >= 0 && (file.packagePath === null || typeof file.packagePath === "string" && safeExperiencePath(file.packagePath)) && [file.imports, file.exports, file.symbols].every((value) => Array.isArray(value) && value.length === Object.keys(value).length && value.every((item) => typeof item === "string")) && (file.action === "index" || file.action === "skip"))) throw new Error("records");
    if (new Set(files.map((file) => (file as CodeIndexedFile).path)).size !== files.length) throw new Error("duplicates");
    return { status: "ready", files: files as CodeIndexedFile[], reason: "Code intelligence index is valid" };
  } catch { return { status: "invalid-index", files: [], reason: "Code intelligence index is malformed or schema-invalid" }; }
}

export async function planCodeIntelligenceIndex(root: string): Promise<CodeIndexPlan> {
  const blockers: string[] = [];
  let resolved = root;
  try { resolved = await gitRoot(root); } catch (error: unknown) { blockers.push(error instanceof Error ? error.message : "Git repository cannot be inspected"); }
  const timestamp = new Date().toISOString();
  const indexedFiles: CodeIndexedFile[] = [];
  const packages: CodePackageRecord[] = [];
  const stack: CodeStackObservation[] = [];
  let exclusions: CodeIndexExclusion[] = [];
  if (!blockers.length) {
    const existing = await readExistingCodeHashes(resolved);
    const candidates = await collectCodeCandidates(resolved);
    if (candidates.blocker) blockers.push(candidates.blocker);
    exclusions = candidates.exclusions;
    const packageByDirectory = new Map<string, CodePackageRecord>();
    const pathSet = new Set(candidates.paths);
    const safeFiles: { path: string; content: Buffer; text: string; hash: string }[] = [];
    for (const path of blockers.length ? [] : candidates.paths) {
      try {
        const absolute = join(resolved, ...path.split("/"));
        const info = await lstat(absolute);
        if (info.isSymbolicLink()) { exclusions.push({ path, reason: "symlink" }); continue; }
        if (info.size > 256 * 1024) { exclusions.push({ path, reason: "oversized" }); continue; }
        const content = await readFile(absolute);
        if (content.includes(0)) { exclusions.push({ path, reason: "binary" }); continue; }
        let text: string;
        try { text = new TextDecoder("utf-8", { fatal: true }).decode(content); }
        catch { exclusions.push({ path, reason: "invalid-utf8" }); continue; }
        if (secretLike(text)) { exclusions.push({ path, reason: "secret-like-content" }); continue; }
        const hash = codeHash(content);
        safeFiles.push({ path, content, text, hash });
        stack.push(...stackFromConfig(path, hash));
        if (basename(path) === "package.json") {
          const parsed = JSON.parse(text) as Record<string, unknown>;
          const dependencies = packageDependencies(parsed);
          const packageRecord = { path, name: typeof parsed.name === "string" ? parsed.name : null, packageManager: packageManagerFromFiles(pathSet, parsed.packageManager), dependencies };
          packageByDirectory.set(dirname(path) === "." ? "" : dirname(path), packageRecord);
          packages.push(packageRecord);
          stack.push(...stackFromPackage(path, hash, dependencies));
        }
      } catch { exclusions.push({ path, reason: basename(path) === "package.json" ? "malformed-package-json" : "unreadable" }); }
    }
    for (const { path, content, text, hash } of safeFiles.sort((left, right) => left.path.localeCompare(right.path))) {
      let owner: string | null = null;
      for (let directory = dirname(path); directory !== "."; directory = dirname(directory)) if (packageByDirectory.has(directory)) { owner = packageByDirectory.get(directory)?.path ?? null; break; }
      if (!owner && packageByDirectory.has("")) owner = packageByDirectory.get("")?.path ?? null;
      indexedFiles.push({ path, hash, bytes: content.byteLength, packagePath: owner, ...extractCodeFacts(path, text), action: existing.get(path) === hash ? "skip" : "index" });
    }
  }
  const manifest: CodeIndexManifest = { schemaVersion: "0.1.0", module: "downstroke-code-intelligence", createdAt: timestamp, updatedAt: timestamp, files: indexedFiles.length };
  return { status: blockers.length ? "blocked" : "ready", action: indexedFiles.every((file) => file.action === "skip") ? "skip" : "write", files: [...codeIntelligenceFiles], manifest: blockers.length ? null : manifest, indexedFiles, packages: packages.sort((left, right) => left.path.localeCompare(right.path)), stack: stack.sort((left, right) => left.technology.localeCompare(right.technology)), exclusions, blockers };
}

function codeIndexIdentity(plan: CodeIndexPlan): string {
  return JSON.stringify({
    indexedFiles: plan.indexedFiles.map(({ action: _action, ...file }) => file),
    packages: plan.packages,
    stack: plan.stack,
    exclusions: plan.exclusions,
  });
}

export async function applyCodeIntelligenceIndex(root: string, plan: CodeIndexPlan): Promise<DoctorResult> {
  if (plan.status === "blocked" || !plan.manifest) return { id: "code-intelligence.index", status: "fail", message: plan.blockers.join("; ") || "Code intelligence plan is blocked", remediation: "Correct and preview the index again" };
  const resolved = await gitRoot(root);
  const fresh = await planCodeIntelligenceIndex(resolved);
  if (fresh.status !== "ready" || codeIndexIdentity(fresh) !== codeIndexIdentity(plan)) return { id: "code-intelligence.index", status: "fail", message: "Code intelligence index changed after preview", remediation: "Preview the index again" };
  const base = join(resolved, ".downstroke", "code-intelligence");
  await mkdir(base, { recursive: true });
  await writeFile(join(base, "manifest.json"), `${JSON.stringify(plan.manifest, null, 2)}\n`);
  await writeFile(join(base, "files.jsonl"), plan.indexedFiles.map((record) => JSON.stringify({ ...record, action: "skip" })).join("\n") + (plan.indexedFiles.length ? "\n" : ""));
  await writeFile(join(base, "packages.jsonl"), plan.packages.map((record) => JSON.stringify(record)).join("\n") + (plan.packages.length ? "\n" : ""));
  await writeFile(join(base, "stack.jsonl"), plan.stack.map((record) => JSON.stringify(record)).join("\n") + (plan.stack.length ? "\n" : ""));
  return { id: "code-intelligence.index", status: "ok", message: plan.action === "skip" ? "Code intelligence index already current" : "Code intelligence index stored", evidence: String(plan.indexedFiles.length), remediation: "No action required" };
}

export async function detectCodeStack(root: string): Promise<{ status: "ready" | "blocked"; stack: CodeStackObservation[]; packages: CodePackageRecord[]; blockers: string[] }> {
  const plan = await planCodeIntelligenceIndex(root);
  return { status: plan.status, stack: plan.stack, packages: plan.packages, blockers: plan.blockers };
}

export async function queryCodeContext(root: string, paths: readonly string[], mode: "impact" | "context" = "context"): Promise<CodeContextReport> {
  const requested = [...new Set(paths.map(posixPath))];
  const state = await readCodeIndex(root);
  if (state.status !== "ready") return { status: state.status, requested, files: [], stale: [], reason: state.reason };
  const indexed = state.files;
  if (requested.length === 0) return { status: "stale", requested, files: [], stale: [], reason: "No paths requested" };
  const resolved = await gitRoot(root);
  const stale: string[] = [];
  const selected = new Map<string, CodeIndexedFile>();
  for (const path of requested) {
    const direct = indexed.find((file) => file.path === path);
    if (direct) selected.set(direct.path, direct);
    else stale.push(path);
    if (mode === "impact") {
      for (const file of indexed) if (file.imports.some((specifier) => importMayReference(file.path, specifier, path))) selected.set(file.path, file);
    } else if (direct?.packagePath) {
      for (const file of indexed) if (file.packagePath === direct.packagePath && selected.size < 12) selected.set(file.path, file);
    }
  }
  for (const file of selected.values()) {
    const state = await readLocalFile(resolved, file.path);
    if ((state.kind !== "file" || codeHash(state.content) !== file.hash) && !stale.includes(file.path)) stale.push(file.path);
  }
  return { status: stale.length ? "stale" : "ready", requested, files: [...selected.values()].slice(0, 20), stale, reason: stale.length ? "Indexed files changed after indexing" : "Context resolved from native index" };
}

function importMayReference(importerPath: string, specifier: string, requestedPath: string): boolean {
  if (!specifier.startsWith(".")) return false;
  const base = posixPath(join(dirname(importerPath), specifier));
  const withoutExtension = requestedPath.replace(/\.[^.]+$/, "");
  return base === withoutExtension || base === requestedPath || `${base}/index` === withoutExtension;
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
  {
    id: "workflow.markdown-stories",
    paths: ["docs/stories"],
    label: "Non-native Markdown story workflow state",
    foundMessage: "Markdown story workflow state detected; native workflow state belongs in .downstroke/workflows",
    remediation: "Move workflow source-of-truth into .downstroke/workflows; keep Markdown only as optional human-readable summary",
  },
  { id: "legacy.communication", paths: [".agents/skills/caveman", "skills/caveman"], label: "Legacy communication instructions" },
  { id: "legacy.simplicity", paths: [".agents/skills/ponytail"], label: "Legacy simplicity instructions" },
] as const;

export const legacyCleanupSources = [
  { source: "_bmad", reason: "legacy workflow source" },
  { source: "_bmad-output", reason: "legacy workflow output" },
  { source: ".codegraph", reason: "legacy code-intelligence source" },
  { source: ".agents/skills/caveman", reason: "legacy communication skill" },
  { source: ".agents/skills/ponytail", reason: "legacy simplicity skill" },
  { source: "docs/stories", reason: "non-native Markdown workflow state" },
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
  return Promise.all(legacySources.map(async (source) => {
    const { id, paths, label } = source;
    const inspected = await Promise.all(paths.map(async (path) => ({ path, state: await inspectLegacyPath(join(root, path)) })));
    const found = inspected.find(({ state }) => state === "present");
    const unreadable = inspected.find(({ state }) => state === "unreadable");
    const foundMessage = "foundMessage" in source ? source.foundMessage : undefined;
    const remediation = "remediation" in source ? source.remediation : undefined;
    return {
      id,
      status: found ? "warn" : unreadable ? "fail" : "ok",
      message: found
        ? foundMessage ?? `${label} detected; preserve for native migration`
        : unreadable
          ? `${label} could not be inspected`
          : `No active ${label.toLowerCase()} detected`,
      evidence: found?.path ?? (unreadable ? `${unreadable.path} unreadable` : `${paths[0]} not found`),
      remediation: found
        ? remediation ?? "Preserve this source for native migration; do not execute or delete it"
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

export async function applyCadenceUpdate(root: string, plan: CadencePlan, moveFile: typeof rename = rename): Promise<DoctorResult> {
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
  const transaction = randomUUID();
  const stateTemp = `${statePath}.${transaction}.tmp`;
  const specTemp = `${specPath}.${transaction}.tmp`;
  const previousState = await readLocalFile(root, ".downstroke/planning.json");
  await mkdir(dirname(statePath), { recursive: true });
  try {
    await writeFile(stateTemp, `${JSON.stringify(plan.next, null, 2)}\n`);
    await writeFile(specTemp, updatedSpec);
    await moveFile(stateTemp, statePath);
    await moveFile(specTemp, specPath);
  } catch (error: unknown) {
    const rollback = await Promise.allSettled([
      previousState.kind === "file" ? writeFile(statePath, previousState.content) : rm(statePath, { force: true }),
      writeFile(specPath, spec.content),
      rm(stateTemp, { force: true }),
      rm(specTemp, { force: true }),
    ]);
    const rollbackFailed = rollback.some((result) => result.status === "rejected");
    return { id: "planning.cadence", status: "fail", message: `${error instanceof Error ? error.message : "Planning cadence update failed"}${rollbackFailed ? "; rollback failed" : ""}`, evidence: ".downstroke/planning.json + docs/SPEC.md", remediation: rollbackFailed ? "Restore both cadence files from version control before retrying" : "Correct the filesystem problem and preview the cadence again" };
  }
  return diagnosePlanningCadence(root);
}

export async function installFiles(
  root: string,
  operations: readonly FileOperation[],
  dryRun = false,
): Promise<FileAction[]> {
  const actions: FileAction[] = [];
  const created: string[] = [];
  const base = await realpath(root);

  try {
    for (const operation of operations) {
      const target = resolve(base, operation.target);
      const location = relative(base, target);
      if (!location || location.startsWith("..") || isAbsolute(location)) throw new Error(`Install target is outside the project: ${operation.target}`);
      let parent = dirname(target);
      while (parent !== base) {
        try { if ((await lstat(parent)).isSymbolicLink()) throw new Error(`Install parent cannot be a symbolic link: ${operation.target}`); }
        catch (error: unknown) { if (!isMissing(error)) throw error; }
        parent = dirname(parent);
      }
      try {
        const existing = await lstat(target);
        if (existing.isSymbolicLink() || !existing.isFile()) throw new Error(`Install target must be a regular file: ${operation.target}`);
        actions.push({ ...operation, action: "skip" });
        continue;
      } catch (error: unknown) { if (!isMissing(error)) throw error; }
      if ((await lstat(operation.source)).isSymbolicLink() || !(await stat(operation.source)).isFile()) throw new Error(`Install source must be a regular file: ${operation.source}`);
      const action: FileAction = { ...operation, action: "create" };
      actions.push(action);
      if (!dryRun) {
        await mkdir(dirname(target), { recursive: true });
        const resolvedParent = await realpath(dirname(target));
        const parentLocation = relative(base, resolvedParent);
        if (parentLocation.startsWith("..") || isAbsolute(parentLocation)) throw new Error(`Install parent resolves outside the project: ${operation.target}`);
        try { await copyFile(operation.source, target, fsConstants.COPYFILE_EXCL); created.push(target); }
        catch (error: unknown) {
          if (!isExists(error)) throw error;
          const existing = await lstat(target);
          if (existing.isSymbolicLink() || !existing.isFile()) throw new Error(`Install target must be a regular file: ${operation.target}`);
          action.action = "skip";
        }
      }
    }
  } catch (error) {
    await Promise.allSettled(created.reverse().map((path) => rm(path, { force: true })));
    throw error;
  }

  return actions;
}

export async function checkFiles(
  root: string,
  requirements: readonly { id: string; path: string; severity: "warn" | "fail" }[],
): Promise<DoctorResult[]> {
  return Promise.all(requirements.map(async (requirement) => {
    const found = await lstat(join(root, requirement.path)).then((entry) => entry.isFile() && !entry.isSymbolicLink(), () => false);
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
  let manifestName: string | undefined;
  let manifestError: string | undefined;

  if (names.has("AGENTS.md") || names.has("CLAUDE.md")) signals.push("agent-instructions");
  if (names.has("_bmad") || names.has("_bmad-output")) signals.push("legacy-workflow");
  if (names.has(".codegraph")) signals.push("legacy-code-intel");

  if (names.has("package.json")) {
    try { const manifest = JSON.parse(await readFile(join(root, "package.json"), "utf8")) as {
      name?: string;
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    manifestName = manifest.name;
    if (manifest.scripts !== undefined && (typeof manifest.scripts !== "object" || manifest.scripts === null || Object.values(manifest.scripts).some((value) => typeof value !== "string" || !value.trim()))) throw new Error("package.json scripts must be non-empty strings");
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
    } catch (error: unknown) { stacks.add("Node.js"); signals.push("invalid-node-manifest"); manifestError = error instanceof Error ? error.message : "package.json is invalid"; }
  }

  if (entries.some((entry) => entry.name.endsWith(".sln") || entry.name.endsWith(".csproj"))) stacks.add(".NET");
  if (names.has("next.config.js") || names.has("next.config.mjs") || names.has("next.config.ts")) stacks.add("Next.js");
  if (names.has("app.json") || names.has("app.config.js") || names.has("app.config.ts")) stacks.add("Expo");

  const sourceDirs: string[] = [];
  for (const name of ["app", "src", "pages", "apps"]) {
    const entry = entries.find((candidate) => candidate.name === name);
    if (entry?.isDirectory() && (await readdir(join(root, name))).length > 0) sourceDirs.push(name);
  }
  const meaningfulEntries = entries.filter((entry) => entry.name !== ".git");
  const hasManifest = signals.includes("node-manifest") || stacks.has(".NET");
  const stage = meaningfulEntries.length === 0
    ? "empty"
    : sourceDirs.length > 0
      ? "implemented"
      : hasManifest
        ? "scaffolded"
        : signals.length > 0 || names.has("docs")
          ? "documented"
          : "scaffolded";

  return {
    projectKind: manifestName === "downstroke-workspace"
      && await exists(join(root, "apps", "cli"))
      && await exists(join(root, "packages", "core"))
      ? "maintenance-checkout"
      : "consumer",
    stage,
    stacks: [...stacks].sort(),
    scripts: scripts.sort(),
    signals,
    originInference: ["agent-instructions", "legacy-workflow", "legacy-code-intel"].some((signal) => signals.includes(signal))
      ? "AI-assisted workflow artifacts found; prompting origin cannot be proven from files alone."
      : "No AI-assisted workflow artifacts detected; project origin is unknown.",
    ...(manifestError ? { manifestError } : {}),
  };
}

export async function runProjectChecks(root: string, scripts: readonly string[]): Promise<ProjectVerification> {
  const selected = ["typecheck", "test", "build"].filter((script) => scripts.includes(script));
  if (selected.length === 0) return { status: "not-run", checks: [] };

  const checks: { script: string; exitCode: number }[] = [];
  for (const script of selected) {
    const exitCode = await new Promise<number>((resolve) => {
      const command = process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : "npm";
      const args = process.platform === "win32"
        ? ["/d", "/s", "/c", "npm.cmd", "run", script]
        : ["run", script];
      const child = spawn(command, args, {
        cwd: root,
        shell: false,
        stdio: "ignore",
      });
      child.once("error", () => resolve(1));
      child.once("exit", (code) => resolve(code ?? 1));
    });
    checks.push({ script, exitCode });
    if (exitCode !== 0) return { status: "failed", checks };
  }

  return { status: "verified", checks };
}

const cmsFamilySignals: readonly [CmsSourceFamily, RegExp][] = [
  ["prisma", /\bmodel\s+[A-Z]\w*\s*\{/], ["drizzle", /\b(?:pgTable|mysqlTable|sqliteTable)\s*\(/],
  ["typeorm", /(?:@Entity\s*\(|\bnew\s+EntitySchema\s*\()/], ["ef-core", /\b(?:DbSet<|IEntityTypeConfiguration<)/],
  ["strapi", /(?:["']?kind["']?\s*:\s*["']collectionType["'])/], ["payload", /\bslug\s*:\s*["'][a-z][\w-]*["'][\s\S]{0,300}\bfields\s*:/],
  ["nextjs", /\bexport\s+(?:async\s+)?function\s+(?:GET|POST|PUT|PATCH|DELETE)\b/], ["nestjs", /@Controller\s*\(/],
  ["express", /\b(?:app|router)\.(?:get|post|put|patch|delete)\s*\(/], ["graphql", /\btype\s+(?:Query|Mutation|[A-Z]\w*)\s*\{/],
];

function cmsSourceFamily(path: string, source: string): CmsSourceFamily | null {
  if (path.endsWith(".prisma")) return "prisma";
  if (path.endsWith(".graphql") || path.endsWith(".gql")) return "graphql";
  return cmsFamilySignals.find(([, signal]) => signal.test(source))?.[0] ?? null;
}

function sourceLines(source: string, signal: RegExp): { value: string; line: number }[] {
  const flags = signal.flags.includes("g") ? signal.flags : `${signal.flags}g`; const matcher = new RegExp(signal.source, flags); const matches: { value: string; line: number }[] = [];
  for (const match of source.matchAll(matcher)) matches.push({ value: match.slice(1).find((value) => value !== undefined) ?? match[0], line: source.slice(0, match.index).split("\n").length });
  return matches;
}

function cmsCandidates(family: CmsSourceFamily, source: string): { kind: "content" | "endpoint"; name: string; method?: string; path?: string; line: number }[] {
  const contentSignal = family === "prisma" ? /\bmodel\s+([A-Z]\w*)\s*\{/g : family === "graphql" ? /\btype\s+(?!Query\b|Mutation\b)([A-Z]\w*)\s*\{/g : family === "typeorm" ? /@Entity\s*\(\s*(?:["']([^"']+)["']\s*)?\)\s*(?:export\s+)?class\s+([A-Z]\w*)/g : /(?:(?:pgTable|mysqlTable|sqliteTable)\s*\(\s*["']([^"']+)|\b(?:slug|singularName)\s*:\s*["']([^"']+)|\bDbSet<([A-Z]\w*)>)/g;
  const contents = sourceLines(source, contentSignal).map(({ value, line }) => ({ kind: "content" as const, name: value, line }));
  const endpoints: { kind: "endpoint"; name: string; method?: string; path?: string; line: number }[] = [];
  for (const match of source.matchAll(/\b(?:app|router)\.(get|post|put|patch|delete)\s*\(\s*["']([^"']+)/g)) endpoints.push({ kind: "endpoint", name: `${match[1]!.toUpperCase()} ${match[2]!}`, method: match[1]!.toUpperCase(), path: match[2]!, line: source.slice(0, match.index).split("\n").length });
  for (const { value, line } of sourceLines(source, /\bexport\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\b/g)) endpoints.push({ kind: "endpoint", name: value, method: value, line });
  for (const { value, line } of sourceLines(source, /@Controller\s*\(\s*["']([^"']*)/g)) endpoints.push({ kind: "endpoint", name: value || "controller", line });
  if (family === "graphql") for (const { value, line } of sourceLines(source, /\btype\s+(Query|Mutation)\s*\{/g)) endpoints.push({ kind: "endpoint", name: value, line });
  return [...contents, ...endpoints];
}

export async function scanCmsContentContracts(root: string, input: { instanceId: string; environmentId: string; paths: readonly string[]; now?: Date }): Promise<CmsProposal[]> {
  if (!/^[A-Za-z0-9._-]{1,120}$/.test(input.instanceId) || !/^[A-Za-z0-9._-]{1,120}$/.test(input.environmentId) || input.paths.length === 0 || input.paths.length > 64) throw new Error("CMS scan scope is invalid");
  const resolved = await gitRoot(root); const proposals: CmsProposal[] = [];
  for (const path of [...new Set(input.paths)].sort()) {
    if (isAbsolute(path) || path.split(/[\\/]/).includes("..")) throw new Error(`Unsafe CMS scan path: ${path}`);
    const parts = path.split(/[\\/]/).filter(Boolean); let cursor = resolved;
    for (const part of parts) { cursor = join(cursor, part); if ((await lstat(cursor)).isSymbolicLink()) throw new Error(`${path}: symbolic links are forbidden`); }
    const read = await readLocalFile(resolved, path); if (read.kind !== "file") throw new Error(`${path}: ${evidence(path, read)}`);
    if (read.content.length > 1024 * 1024) throw new Error(`${path}: CMS scan input exceeds 1 MiB`);
    const source = read.content.toString("utf8"); const family = cmsSourceFamily(path, source); if (!family) continue;
    const sourcePath = path.replaceAll("\\", "/"); const sourceHash = createHash("sha256").update(read.content).digest("hex"); const found = cmsCandidates(family, source);
    const ambiguous = source.split(/\r?\n/).map((value, index) => ({ value, line: index + 1 })).filter(({ value }) => /\.\.\.|\$\{|\b(?:eval|require|import)\s*\(/.test(value)).slice(0, 64);
    if (!found.length && !ambiguous.length) ambiguous.push({ value: "", line: 1 });
    const stable = { schemaVersion: 1 as const, instanceId: input.instanceId, environmentId: input.environmentId, sourceFamily: family, sourcePath, sourceHash, status: "unconfirmed" as const, candidates: found.map(({ line: _line, ...candidate }) => candidate), provenance: found.map(({ kind, line }) => ({ path: sourcePath, sourceHash, line, family, kind })), confidence: found.length ? (ambiguous.length ? 0.5 : 0.8) : 0, confidenceReasons: found.length ? ["recognized-static-syntax"] : ["no-static-candidate"], unknownCoverage: ambiguous.map(({ line, value }) => ({ path: sourcePath, line, reason: value ? "dynamic-or-imported-expression" : "recognized-source-without-static-candidate" })), canonicalPlanHash: null };
    const proposalId = createHash("sha256").update(JSON.stringify(normalizeJson(stable))).digest("hex"); proposals.push({ ...stable, proposalId, scannedAt: (input.now ?? new Date()).toISOString() });
  }
  return proposals;
}

export async function planCmsContentContractScan(root: string, input: { instanceId: string; environmentId: string; paths: readonly string[] }): Promise<{ status: "ready"; proposals: CmsProposal[]; planHash: string }> {
  const proposals = await scanCmsContentContracts(root, input);
  const stable = { status: "ready" as const, instanceId: input.instanceId, environmentId: input.environmentId, paths: [...new Set(input.paths)].sort(), proposalIds: proposals.map(({ proposalId }) => proposalId) };
  return { status: "ready", proposals, planHash: createHash("sha256").update(JSON.stringify(normalizeJson(stable))).digest("hex") };
}

export function planCmsProposalAcceptance(proposal: CmsProposal, contract: CmsCanonicalContentContract): { status: "ready" | "blocked"; contractHash: string | null; planHash: string; blockers: string[] } {
  const blockers: string[] = []; let contractHash: string | null = null;
  if (proposal.unknownCoverage.length) blockers.push("Proposal has unknown coverage requiring confirmation");
  try { contractHash = canonicalContractHash(contract); } catch (error: unknown) { blockers.push(error instanceof Error ? error.message : "Canonical contract is invalid"); }
  const stable = { status: blockers.length ? "blocked" as const : "ready" as const, proposalId: proposal.proposalId, sourceHash: proposal.sourceHash, instanceId: proposal.instanceId, environmentId: proposal.environmentId, contractHash, blockers };
  return { status: stable.status, contractHash, blockers, planHash: createHash("sha256").update(JSON.stringify(normalizeJson(stable))).digest("hex") };
}

export async function recordCmsProposalScan(root: string, input: { instanceId: string; environmentId: string; paths: readonly string[]; expectedProposalIds: readonly string[]; now?: Date }): Promise<{ proposals: CmsProposal[]; drift: CmsProposalDrift[] }> {
  const proposals = await scanCmsContentContracts(root, input); if (proposals.length !== input.expectedProposalIds.length || proposals.some((item, index) => item.proposalId !== input.expectedProposalIds[index])) throw new Error("CMS proposal scan changed after preview");
  const base = join(await gitRoot(root), ".downstroke", "cms"); await mkdir(base, { recursive: true }); const historyPath = join(base, "history.jsonl"); let previous: CmsProposal[] = [];
  try { previous = (await readFile(historyPath, "utf8")).split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as { kind: string; value: CmsProposal }).filter(({ kind }) => kind === "proposal").map(({ value }) => value); } catch (error: unknown) { if (!(typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT")) throw error; }
  const drift: CmsProposalDrift[] = []; for (const proposal of proposals) {
    const prior = [...previous].reverse().find((item) => item.instanceId === proposal.instanceId && item.environmentId === proposal.environmentId && item.sourceFamily === proposal.sourceFamily && item.sourcePath === proposal.sourcePath);
    if (prior && prior.sourceHash !== proposal.sourceHash) drift.push({ schemaVersion: 1, priorProposalId: prior.proposalId, replacementProposalId: proposal.proposalId, priorSourceHash: prior.sourceHash, replacementSourceHash: proposal.sourceHash, detectedAt: (input.now ?? new Date()).toISOString() });
  }
  const records = [...proposals.map((value) => ({ kind: "proposal", value })), ...drift.map((value) => ({ kind: "drift", value }))];
  if (records.length) await appendFile(historyPath, `${records.map((item) => JSON.stringify(item)).join("\n")}\n`, { encoding: "utf8", mode: 0o600 });
  return { proposals, drift };
}

export type CmsSynchronizationPlan = { schemaVersion: 1; status: "ready" | "blocked"; instanceId: string; projectId: string; environmentId: string; schemaName: string; codeBaseHash: string; cmsBaseHash: string; diff: CmsContractDiff; apiImpact: CmsContractDiff["changes"]; migrationId: string; sql: string; sqlChecksum: string; projections: { target: string; path: string; contractHash: string }[]; recoveryRequired: boolean; recoveryRequirements: string[]; rollback: { strategy: "forward-recovery"; contract: CmsCanonicalContentContract; sql: string; sqlChecksum: string }; blockers: string[]; planHash: string };

export function planCmsContractSynchronization(input: { previous: CmsCanonicalContentContract; next: CmsCanonicalContentContract; instanceId: string; projectId: string; environmentId: string; schemaName: string; codeBaseHash: string; cmsBaseHash: string; projectionTargets?: readonly string[] }): CmsSynchronizationPlan {
  const diff = diffCanonicalContracts(input.previous, input.next); const blockers: string[] = [];
  if (!/^[A-Za-z0-9._-]{1,120}$/.test(input.instanceId) || !/^[A-Za-z0-9._-]{1,120}$/.test(input.projectId) || !/^[A-Za-z0-9._-]{1,120}$/.test(input.environmentId) || !/^[a-z][a-z0-9_]{0,62}$/.test(input.schemaName)) blockers.push("CMS synchronization scope is invalid");
  if (input.next.revision !== input.previous.revision + 1) blockers.push("Canonical revision must advance exactly once");
  if (!/^[a-f0-9]{64}$/.test(input.codeBaseHash) || !/^[a-f0-9]{64}$/.test(input.cmsBaseHash)) blockers.push("Both canonical base hashes are required"); else if (input.codeBaseHash !== input.cmsBaseHash) blockers.push("Code and CMS contract bases diverged and require a scoped server decision");
  const recoveryRequired = ["public-breaking", "destructive"].includes(diff.compatibility);
  const encoded = Buffer.from(JSON.stringify(input.next)).toString("hex"); const sql = `INSERT INTO ${input.schemaName}.cms_contract_revision (instance_id, project_id, environment_id, schema_name, revision, contract_hash, previous_contract_hash, contract_json) VALUES ('${input.instanceId}', '${input.projectId}', '${input.environmentId}', '${input.schemaName}', ${input.next.revision}, '${diff.nextHash}', '${diff.previousHash}', convert_from(decode('${encoded}', 'hex'), 'UTF8')::jsonb);`;
  const sqlChecksum = createHash("sha256").update(sql).digest("hex"); const allowed = new Set(["prisma", "drizzle", "typeorm", "ef-core", "payload", "strapi"]); const targets = [...new Set(input.projectionTargets ?? [])].sort();
  if (targets.some((target) => !allowed.has(target))) blockers.push("CMS projection target is unsupported");
  const projections = targets.map((target) => ({ target, path: `.downstroke/cms/projections/${target}.json`, contractHash: diff.nextHash }));
  const apiImpact = diff.changes; const recoveryRequirements = recoveryRequired ? ["project-owner-exact-approval", "current-isolated-restore-evidence", "previous-release-retirement-evidence"] : [];
  const rollbackContract = { ...input.previous, revision: input.next.revision + 1 }; const rollbackHash = canonicalContractHash(rollbackContract); const rollbackEncoded = Buffer.from(JSON.stringify(rollbackContract)).toString("hex"); const rollbackSql = `INSERT INTO ${input.schemaName}.cms_contract_revision (instance_id, project_id, environment_id, schema_name, revision, contract_hash, previous_contract_hash, contract_json) VALUES ('${input.instanceId}', '${input.projectId}', '${input.environmentId}', '${input.schemaName}', ${rollbackContract.revision}, '${rollbackHash}', '${diff.nextHash}', convert_from(decode('${rollbackEncoded}', 'hex'), 'UTF8')::jsonb);`;
  const rollback = { strategy: "forward-recovery" as const, contract: rollbackContract, sql: rollbackSql, sqlChecksum: createHash("sha256").update(rollbackSql).digest("hex") }; const migrationId = `${String(input.next.revision).padStart(6, "0")}-${diff.nextHash.slice(0, 12)}`;
  const stable = { schemaVersion: 1 as const, status: blockers.length ? "blocked" as const : "ready" as const, instanceId: input.instanceId, projectId: input.projectId, environmentId: input.environmentId, schemaName: input.schemaName, codeBaseHash: input.codeBaseHash, cmsBaseHash: input.cmsBaseHash, diff, apiImpact, migrationId, sql, sqlChecksum, projections, recoveryRequired, recoveryRequirements, rollback, blockers };
  return { ...stable, planHash: createHash("sha256").update(JSON.stringify(normalizeJson(stable))).digest("hex") };
}

export async function applyCmsContractProjections(root: string, plan: CmsSynchronizationPlan, expectedPlanHash: string): Promise<DoctorResult> {
  const { planHash, ...stable } = plan; const actual = createHash("sha256").update(JSON.stringify(normalizeJson(stable))).digest("hex"); if (plan.status !== "ready" || planHash !== expectedPlanHash || actual !== planHash) return { id: "cms.sync.projections", status: "fail", message: "CMS synchronization plan is blocked or unauthorized" };
  const resolved = await gitRoot(root); try { const authority = JSON.parse(await readFile(join(resolved, ".downstroke", "cms", "contract.json"), "utf8")) as CmsCanonicalContentContract; if (canonicalContractHash(authority) !== plan.diff.nextHash) throw new Error("Accepted CMS contract authority does not match the synchronization plan"); } catch (error: unknown) { return { id: "cms.sync.projections", status: "fail", message: error instanceof Error ? error.message : "Accepted CMS contract authority is unavailable" }; }
  const base = join(resolved, ".downstroke", "cms", "projections"); await mkdir(base, { recursive: true }); const staged: { path: string; temp: string; prior: Buffer | null }[] = [];
  try { for (const projection of plan.projections) { const path = join(resolved, ...projection.path.split("/")); if (dirname(path) !== base) throw new Error("CMS projection path escaped its owned directory"); let prior: Buffer | null = null; try { prior = await readFile(path); } catch (error: unknown) { if (!(typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT")) throw error; } const temp = `${path}.${randomUUID()}.tmp`; await writeFile(temp, `${JSON.stringify({ schemaVersion: 1, target: projection.target, authority: ".downstroke/cms/contract.json", contractHash: projection.contractHash }, null, 2)}\n`); staged.push({ path, temp, prior }); }
    for (const item of staged) await rename(item.temp, item.path); return { id: "cms.sync.projections", status: "ok", message: "CMS owned projections synchronized", evidence: plan.diff.nextHash };
  } catch (error: unknown) { for (const item of staged) { await unlink(item.temp).catch(() => undefined); if (item.prior) await writeFile(item.path, item.prior); else await unlink(item.path).catch(() => undefined); } return { id: "cms.sync.projections", status: "fail", message: error instanceof Error ? error.message : "CMS projection synchronization failed" }; }
}
