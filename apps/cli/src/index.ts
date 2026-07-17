#!/usr/bin/env node
import { lstat, mkdir, readFile, realpath, readdir, rename, rm, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { applyCadenceUpdate, applyCodeIntelligenceIndex, applyCommunicationPolicy, applyExperienceFact, applyExperienceImport, applyGitPolicy, applyLocalCommit, applyKnowledgeRecord, applyNativeExecution, applyNativeReleasePreparation, applyNativeWorkerRegistration, applyTokenEconomyRoute, applyWorkflowItem, auditProjectKnowledge, cadenceChoices, checkFiles, communicationModes, compileTaskContext, detectCodeStack, diagnoseLegacyAgentStack, diagnosePlanningCadence, estimateTokenUsage, evaluateCommunicationProtection, evaluateSimplicityGates, governDecision, initializeExperience, inspectProject, installFiles, legacyCleanupSources, listNativeWorkers, nativeReleaseChannels, planCadenceUpdate, planCodeIntelligenceIndex, planCommunicationPolicy, planExperienceFact, planExperienceImport, planGitPolicy, planLocalCommit, planKnowledgeRecord, planNativeExecution, planNativeRelease, planNativeWorkerRegistration, planTokenEconomyRoute, planWorkflowConflictResolution, planWorkflowItem, protectedCommunicationCategories, queryCodeContext, readCommunicationPolicy, readGitPolicy, readNativeReleasePlan, readPlanningCadence, resolveWorkflowConflict, resolveWorkflowNextAction, runProjectChecks, tokenEconomyModes, tokenTaskClasses, tokenUsageStatus, verifyNativeRelease, workflowPhases, type CommunicationMode, type DecisionKind, type GitPolicy, type NativeExecutionMode, type NativeReleaseChannel, type PlanningCadence, type ReviewMode, type TokenEconomyMode, type TokenTaskClass, type WorkflowPhase } from "@downstroke/core";
import { liteFiles } from "@downstroke/presets";
import { runMcpServer } from "./mcp.js";
import { agentIntegrationFiles } from "@downstroke/agents";
import { canonicalContractHash } from "@downstroke/cms-contracts";
import { inspectRepositoryTopology } from "@downstroke/core";
import { applyGitCredentialRecovery, planGitCredentialRecovery } from "@downstroke/core";
import { applyHostedRepositoryImport, planHostedRepositoryImport } from "@downstroke/core";
import { diagnoseRepositoryReadiness } from "@downstroke/core";
import { nativeOnlySurfaces, scanNativeOnlySurfaces } from "@downstroke/core";
import { applyPublication, planPublication, type PublicationDestination } from "@downstroke/core";
import { applyCmsBoundary, applyCmsContractProjections, planCmsBoundary, planCmsContentContractScan, planCmsContractSynchronization, recordCmsProposalScan, type CmsBoundaryRequest } from "@downstroke/core";
import { applyDesignConsumers, applyDesignTokens, applyNeutralDesignSystem, planDesignConsumers, planDesignTokens, planNeutralDesignSystem, validateDesignConsumers, type DesignConsumerTarget, type DesignTokenTarget, type NeutralDesignRequest } from "@downstroke/core";

const requirements = [
  { id: "spec.exists", path: "docs/SPEC.md", severity: "fail" },
  { id: "agents.exists", path: "AGENTS.md", severity: "fail" },
  { id: "claude.exists", path: "CLAUDE.md", severity: "warn" },
] as const;

function manifestDoctorResult(inspection: Awaited<ReturnType<typeof inspectProject>>) {
  return inspection.manifestError
    ? [{ id: "manifest.valid", status: "fail" as const, message: `package.json is invalid: ${inspection.manifestError}`, evidence: "package.json", remediation: "Repair package.json and retry", version: undefined }]
    : [];
}

async function rollbackCreatedFiles(root: string, actions: readonly { target: string; action: "create" | "skip" }[]): Promise<void> {
  await Promise.all(actions.filter(({ action }) => action === "create").map(({ target }) => rm(resolve(root, target), { force: true })));
}

type HealthWorkflowItem = { id: string; title: string; status: string; risk: string };
type HealthWorkflowConflict = { id: string; itemId: string; owner: string; status: string };
type CleanupTarget = { source: string; archive: string; reason: string };
type CleanupPlan = {
  status: "ready" | "blocked";
  nativeParity: string[];
  importedHashes: string[];
  verifiedFiles: { path: string; hash: string }[];
  rewrittenActiveDocs: string[];
  quarantineTargets: string[];
  archiveTargets: CleanupTarget[];
  blockers: string[];
};

const cleanupSources = legacyCleanupSources;
const nativeParity = ["AGENTS.md", "CLAUDE.md", "docs/SPEC.md", "docs/process/downstroke-workflow.md", ".downstroke/workflows"] as const;
const nativeHealth = ["AGENTS.md", "CLAUDE.md", "docs/SPEC.md", "docs/process/downstroke-workflow.md", ".downstroke/planning.json"] as const;
const safeHealthText = (value: unknown, limit = 200): value is string => typeof value === "string" && value.length > 0 && value.length <= limit && !/[\u0000-\u001f\u007f]/.test(value);
const secretText = (value: string): boolean => /(?:api[_-]?key|token|secret|password)\s*[:=]\s*["']?[A-Za-z0-9_\-]{12,}|\bBearer\s+[A-Za-z0-9._~+\/-]{12,}|\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|https?:\/\/[^\s/:]+:[^\s/@]+@|-----BEGIN [A-Z ]*PRIVATE KEY-----/i.test(value);
const workflowStatuses = new Set(["backlog", "ready-for-dev", "in-progress", "review", "done", "blocked"]);

async function diagnoseNativeParity(cwd: string) {
  return Promise.all(nativeHealth.map(async (path) => {
    try {
      const entry = await lstat(await safeCleanupPath(cwd, path, true));
      if (!entry.isFile()) throw new Error(`${path} is not a regular file`);
      return { id: `native.parity.${path}`, status: "ok" as const, message: `${path} is available`, evidence: path, version: undefined };
    } catch {
      return { id: `native.parity.${path}`, status: "fail" as const, message: `${path} is missing or unsafe`, evidence: path, remediation: "Restore the native workflow artifact", version: undefined };
    }
  }));
}

async function readHealthWorkflowItems(cwd: string): Promise<{ items: HealthWorkflowItem[]; blockers: string[] }> {
  try {
    const content = await readFile(join(cwd, ".downstroke", "workflows", "items.jsonl"), "utf8");
    const items: HealthWorkflowItem[] = [];
    for (const line of content.split(/\r?\n/).filter(Boolean)) {
      const parsed = JSON.parse(line) as unknown;
      if (typeof parsed !== "object" || parsed === null) return { items, blockers: ["workflow.items: malformed workflow item record"] };
      const record = parsed as Record<string, unknown>;
      if (!safeHealthText(record.id, 128) || !/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(record.id) || !safeHealthText(record.title) || secretText(record.title) || !safeHealthText(record.status, 40) || !workflowStatuses.has(record.status) || !safeHealthText(record.risk, 40) || !["normal", "high"].includes(record.risk)) return { items: [], blockers: ["workflow.items: malformed or unsafe workflow item record"] };
      if (record.risk === "high" || record.status === "blocked") items.push({ id: record.id, title: record.title, status: record.status, risk: record.risk });
    }
    return { items: items.sort((left, right) => left.id.localeCompare(right.id)), blockers: [] };
  } catch (error: unknown) {
    const code = typeof error === "object" && error !== null && "code" in error && typeof error.code === "string" ? error.code : "READ_ERROR";
    return code === "ENOENT" ? { items: [], blockers: [] } : { items: [], blockers: [`workflow.items: unreadable (${code})`] };
  }
}

async function readHealthWorkflowConflicts(cwd: string): Promise<{ conflicts: HealthWorkflowConflict[]; blockers: string[] }> {
  try {
    const content = await readFile(join(cwd, ".downstroke", "workflows", "decisions.jsonl"), "utf8");
    const conflicts: HealthWorkflowConflict[] = [];
    for (const line of content.split(/\r?\n/).filter(Boolean)) {
      const parsed = JSON.parse(line) as unknown;
      if (typeof parsed !== "object" || parsed === null) return { conflicts, blockers: ["workflow.decisions: malformed decision record"] };
      const record = parsed as Record<string, unknown>;
      if (!safeHealthText(record.id, 128) || !safeHealthText(record.itemId, 128) || !safeHealthText(record.owner, 120) || secretText(record.owner) || !safeHealthText(record.status, 40) || !["pending", "resolved"].includes(record.status)) return { conflicts: [], blockers: ["workflow.decisions: malformed or unsafe decision record"] };
      if (record.status === "pending") conflicts.push({ id: record.id, itemId: record.itemId, owner: record.owner, status: record.status });
    }
    return { conflicts: conflicts.sort((left, right) => left.id.localeCompare(right.id)), blockers: [] };
  } catch (error: unknown) {
    const code = typeof error === "object" && error !== null && "code" in error && typeof error.code === "string" ? error.code : "READ_ERROR";
    return code === "ENOENT" ? { conflicts: [], blockers: [] } : { conflicts: [], blockers: [`workflow.decisions: unreadable (${code})`] };
  }
}

async function readImportedHashes(cwd: string): Promise<{ entries: { path: string; hash: string }[]; blockers: string[] }> {
  try {
    const content = await readFile(join(cwd, ".downstroke", "experience", "facts.jsonl"), "utf8");
    const entries = new Map<string, string>();
    for (const line of content.split(/\r?\n/).filter(Boolean)) {
      const parsed = JSON.parse(line) as unknown;
      if (typeof parsed !== "object" || parsed === null) throw new Error("malformed record");
      const source = (parsed as Record<string, unknown>).source;
      if (typeof source !== "object" || source === null) throw new Error("missing source evidence");
      const hash = (source as Record<string, unknown>).hash;
      const path = (source as Record<string, unknown>).path;
      if (typeof hash !== "string" || !/^[a-f0-9]{64}$/i.test(hash) || typeof path !== "string") throw new Error("invalid source evidence");
      const normalized = path.replace(/\\/g, "/");
      const resolved = resolve(cwd, normalized);
      const root = resolve(cwd);
      if (resolved === root || !resolved.startsWith(`${root}\\`) && !resolved.startsWith(`${root}/`)) throw new Error("source path escapes repository");
      const normalizedHash = hash.toLowerCase();
      if (entries.has(normalized) && entries.get(normalized) !== normalizedHash) throw new Error("conflicting source evidence");
      entries.set(normalized, normalizedHash);
    }
    return { entries: [...entries].sort(([left], [right]) => left.localeCompare(right)).map(([path, hash]) => ({ path, hash })), blockers: [] };
  } catch (error: unknown) {
    const code = typeof error === "object" && error !== null && "code" in error && typeof error.code === "string" ? error.code : "INVALID";
    return code === "ENOENT" ? { entries: [], blockers: ["Imported experience evidence is missing"] } : { entries: [], blockers: [`Imported experience evidence is unreadable or invalid (${code})`] };
  }
}

async function cleanupFiles(cwd: string, relative: string): Promise<string[]> {
  const absolute = await safeCleanupPath(cwd, relative, true);
  const entry = await lstat(absolute);
  if (entry.isFile()) return [relative];
  if (!entry.isDirectory()) throw new Error(`${relative} is not a regular file or directory`);
  const files: string[] = [];
  for (const child of await readdir(absolute, { withFileTypes: true })) {
    const path = `${relative}/${child.name}`;
    if (child.isSymbolicLink()) throw new Error(`${path} uses a symbolic link`);
    if (child.isDirectory()) files.push(...await cleanupFiles(cwd, path));
    else if (child.isFile()) files.push(path);
    else throw new Error(`${path} is not a regular file`);
  }
  return files.sort();
}

async function safeCleanupPath(cwd: string, relative: string, mustExist: boolean): Promise<string> {
  const root = await realpath(cwd);
  const target = resolve(root, relative);
  if (target === root || !target.startsWith(`${root}\\`) && !target.startsWith(`${root}/`)) throw new Error(`${relative} escapes the repository`);
  let current = root;
  for (const part of relative.split("/")) {
    current = join(current, part);
    let entry: Awaited<ReturnType<typeof lstat>>;
    try { entry = await lstat(current); }
    catch (error: unknown) {
      if (!mustExist && typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") break;
      throw error;
    }
    if (entry.isSymbolicLink()) throw new Error(`${relative} uses a symbolic link`);
  }
  return target;
}

function cleanupArchivePath(source: string): string {
  return `docs/legacy/downstroke-cleanup/${source.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

async function planCleanup(cwd: string): Promise<CleanupPlan> {
  const targets: CleanupTarget[] = [];
  const blockers: string[] = [];
  for (const item of cleanupSources) {
    try {
      await safeCleanupPath(cwd, item.source, true);
      const archive = cleanupArchivePath(item.source);
      try {
        await stat(resolve(cwd, archive));
        blockers.push(`${archive} already exists`);
      } catch (error: unknown) {
        const code = typeof error === "object" && error !== null && "code" in error && typeof error.code === "string" ? error.code : "READ_ERROR";
        if (code === "ENOENT") targets.push({ source: item.source, archive, reason: item.reason });
        else blockers.push(`${archive} could not be inspected (${code})`);
      }
    } catch (error: unknown) {
      const code = typeof error === "object" && error !== null && "code" in error && typeof error.code === "string" ? error.code : "READ_ERROR";
      if (code !== "ENOENT") blockers.push(`${item.source} could not be inspected (${code})`);
    }
  }
  const imported = await readImportedHashes(cwd);
  const verifiedHashes = new Set<string>();
  const verifiedFiles: { path: string; hash: string }[] = [];
  const rewrittenActiveDocs: string[] = [];
  if (targets.length) {
    for (const path of nativeParity) {
      try {
        const entry = await lstat(await safeCleanupPath(cwd, path, true));
        const expectedDirectory = path === ".downstroke/workflows";
        if (expectedDirectory ? !entry.isDirectory() : !entry.isFile()) throw new Error("wrong file type");
      }
      catch { blockers.push(`Missing or unsafe native parity: ${path}`); }
    }
    for (const path of ["AGENTS.md", "CLAUDE.md", "docs/SPEC.md", "docs/process/downstroke-workflow.md"]) {
      const content = await readFile(resolve(cwd, path), "utf8").catch(() => "");
      if (/\b(?:install|initialize|use|require|run)\b[^\r\n]{0,120}\b(?:codegraph|bmad|caveman|ponytail)\b/i.test(content)) blockers.push(`Active legacy instruction remains in ${path}`);
      else rewrittenActiveDocs.push(path);
    }
    blockers.push(...imported.blockers);
    const evidence = new Map(imported.entries.map(({ path, hash }) => [path, hash]));
    for (const target of targets) {
      try {
        for (const path of await cleanupFiles(cwd, target.source)) {
          const hash = evidence.get(path);
          if (!hash || createHash("sha256").update(await readFile(resolve(cwd, path))).digest("hex") !== hash) blockers.push(`No verified imported evidence covers ${path}`);
          else { verifiedHashes.add(hash); verifiedFiles.push({ path, hash }); }
        }
      } catch (error: unknown) { blockers.push(error instanceof Error ? error.message : `${target.source} cannot be verified`); }
    }
  }
  try { await safeCleanupPath(cwd, "docs/legacy/downstroke-cleanup", false); }
  catch (error: unknown) { blockers.push(error instanceof Error ? error.message : "Cleanup archive path is unsafe"); }
  const archiveTargets = targets.sort((left, right) => left.source.localeCompare(right.source));
  return {
    status: blockers.length ? "blocked" : "ready",
    nativeParity: [...nativeParity],
    importedHashes: [...verifiedHashes].sort(),
    verifiedFiles: verifiedFiles.sort((left, right) => left.path.localeCompare(right.path)),
    rewrittenActiveDocs: rewrittenActiveDocs.sort(),
    quarantineTargets: archiveTargets.map((target) => target.archive),
    archiveTargets,
    blockers,
  };
}

export async function applyCleanup(cwd: string, targets: CleanupTarget[], verifiedFiles: readonly { path: string; hash: string }[]): Promise<string[]> {
  const moved: CleanupTarget[] = [];
  try {
    const evidence = new Map(verifiedFiles.map(({ path, hash }) => [path, hash]));
    for (const target of targets) for (const path of await cleanupFiles(cwd, target.source)) {
      const hash = evidence.get(path);
      if (!hash || createHash("sha256").update(await readFile(resolve(cwd, path))).digest("hex") !== hash) throw new Error(`${path} changed after cleanup preview`);
    }
    for (const target of targets) {
      const source = await safeCleanupPath(cwd, target.source, true);
      const archive = await safeCleanupPath(cwd, target.archive, false);
      if (await lstat(archive).then(() => true).catch(() => false)) throw new Error(`${target.archive} already exists`);
      await mkdir(dirname(archive), { recursive: true });
      await rename(source, archive);
      moved.push(target);
    }
    return moved.map(({ archive }) => archive);
  } catch (error) {
    const unrecovered: string[] = [];
    for (const target of moved.reverse()) {
      try { await rename(await safeCleanupPath(cwd, target.archive, true), await safeCleanupPath(cwd, target.source, false)); }
      catch { unrecovered.push(`${target.archive} -> ${target.source}`); }
    }
    const reason = error instanceof Error ? error.message : "cleanup move failed";
    throw new Error(unrecovered.length ? `${reason}; rollback failed for ${unrecovered.join(", ")}` : `${reason}; completed moves were rolled back`);
  }
}

async function readHealthLeakage(cwd: string): Promise<string[]> {
  const blockers: string[] = [];
  try {
    const content = await readFile(join(cwd, ".downstroke", "experience", "facts.jsonl"), "utf8");
    for (const line of content.split(/\r?\n/).filter(Boolean)) {
      const record = JSON.parse(line) as Record<string, unknown>;
      const security = typeof record.security === "object" && record.security !== null ? record.security as Record<string, unknown> : {};
      if (record.status === "quarantined") blockers.push("experience.quarantine: quarantined experience remains next=Review and remove or resolve quarantined experience");
      if (security.secretScan === "failed" || secretText(JSON.stringify(record.value ?? ""))) blockers.push("experience.secret: secret leakage remains next=Remove the secret and rotate affected credentials");
    }
  } catch (error: unknown) {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "INVALID";
    if (code !== "ENOENT") blockers.push(`experience.health: experience state is unreadable (${code}) next=Repair or quarantine the experience registry`);
  }
  for (const path of [".downstroke/experience/quarantine", ".downstroke/knowledge/quarantine"]) {
    try {
      const entries = await readdir(resolve(cwd, path));
      if (entries.length) blockers.push(`${path}: quarantined files remain next=Review and resolve the quarantined files`);
    } catch (error: unknown) {
      const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "INVALID";
      if (code !== "ENOENT") blockers.push(`${path}: quarantine state is unreadable (${code}) next=Restore read access and inspect quarantine`);
    }
  }
  const required = new Set(["AGENTS.md", "CLAUDE.md", "docs/process/downstroke-workflow.md"]);
  for (const path of new Set([...required, ...nativeOnlySurfaces])) {
    try {
      const content = await readFile(resolve(cwd, path), "utf8");
      if (secretText(content)) blockers.push(`${path}: secret leakage remains next=Remove the secret and rotate affected credentials`);
    } catch (error: unknown) {
      const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "INVALID";
      if (required.has(path) || code !== "ENOENT") blockers.push(`${path}: active native document is unreadable (${code}) next=Restore read access and validate the document`);
    }
  }
  return blockers;
}

type Question = (prompt: string) => Promise<string>;

function hasOption(argv: string[], name: string): boolean {
  return argv.some((value) => value === `--${name}` || value.startsWith(`--${name}=`));
}

async function requiredAnswer(question: Question, prompt: string): Promise<string> {
  const answer = (await question(prompt)).trim();
  if (!answer) throw new Error(`${prompt.trim()} requires an answer`);
  return answer;
}

export async function run(argv: string[], cwd = process.cwd(), _environment: Readonly<Record<string, string | undefined>> = process.env, question?: Question): Promise<number> {
  const command = argv[0];
  const { values, positionals } = parseArgs({
    args: argv.slice(1),
    options: {
      preset: { type: "string", default: "lite" },
      "dry-run": { type: "boolean", default: false },
      json: { type: "boolean", default: false },
      "run-checks": { type: "boolean", default: false },
      strict: { type: "boolean", default: false },
      yes: { type: "boolean", default: false },
      "review-mode": { type: "string" },
      "block-size": { type: "string" },
      "sprint-days": { type: "string" },
      "capacity-hours": { type: "string" },
      "wip-limit": { type: "string" },
      kind: { type: "string" },
      mutates: { type: "boolean", default: false },
      option: { type: "string", multiple: true },
      select: { type: "string" },
      scope: { type: "string" },
      owner: { type: "string" },
      environment: { type: "string" },
      instance: { type: "string" },
      project: { type: "string" },
      previous: { type: "string" },
      next: { type: "string" },
      schema: { type: "string" },
      risk: { type: "string" },
      rollback: { type: "string" },
      path: { type: "string", multiple: true },
      remote: { type: "string" },
      account: { type: "string" },
      "status-code": { type: "string" },
      destination: { type: "string" },
      branch: { type: "string" },
      tag: { type: "string" },
      commit: { type: "string" },
      depth: { type: "string" },
      submodules: { type: "boolean", default: false },
      lfs: { type: "boolean", default: false },
      "no-install": { type: "boolean", default: false },
      "destination-config": { type: "string", multiple: true },
      "authorize-destination": { type: "string", multiple: true },
      config: { type: "string" },
      file: { type: "string", multiple: true },
      message: { type: "string" },
      "consumed-tokens": { type: "string" },
      "allow-branch": { type: "boolean", default: false },
      "allow-commit": { type: "boolean", default: false },
      "allow-push": { type: "boolean", default: false },
      disable: { type: "boolean", default: false },
      fact: { type: "string" },
      item: { type: "string" },
      "item-id": { type: "string" },
      controlled: { type: "boolean", default: false },
      phase: { type: "string" },
      approved: { type: "boolean", default: false },
      conflict: { type: "string" },
      rationale: { type: "string" },
      mode: { type: "string" },
      budget: { type: "string" },
      preference: { type: "string" },
      proposal: { type: "string" },
      simplicity: { type: "string" },
      dependency: { type: "string", multiple: true },
      "shared-package": { type: "boolean", default: false },
      abstraction: { type: "boolean", default: false },
      rewrite: { type: "boolean", default: false },
      "safety-exception": { type: "string" },
      evidence: { type: "string" },
      consumers: { type: "string", multiple: true },
      impact: { type: "string" },
      tests: { type: "string" },
      "task-id": { type: "string" },
      "task-class": { type: "string" },
      stack: { type: "string", multiple: true },
      ambiguity: { type: "string" },
      "tool-proven": { type: "boolean", default: false },
      verification: { type: "string" },
      channel: { type: "string" },
      package: { type: "string", multiple: true },
      plan: { type: "string" },
      manifest: { type: "string" },
      justification: { type: "string" },
      "single-path": { type: "boolean", default: false },
      objective: { type: "string" },
      operation: { type: "string", default: "project.verify" },
      priority: { type: "string", default: "normal" },
      estimate: { type: "string", default: "5" },
      "worker-id": { type: "string" },
      record: { type: "string" },
      target: { type: "string", multiple: true },
    },
    strict: true,
    allowPositionals: true,
  });

  if (!command || command === "help" || command === "--help") {
    const help = [
      "Downstroke",
      "Native project discipline for AI-assisted software delivery.",
      "",
      "Start",
      "  downstroke init --preset lite --review-mode one-at-a-time --dry-run",
      "  downstroke init --preset lite --review-mode one-at-a-time --yes",
      "  downstroke doctor --run-checks",
      "  downstroke health --strict --run-checks",
      "  downstroke cleanup --dry-run",
      "",
      "Native state",
      "  downstroke cadence --review-mode one-at-a-time --yes",
      "  downstroke communication --mode compact --yes",
      "  downstroke simplicity --proposal \"reuse existing helper\" --json",
      "  downstroke code index --yes",
      "  downstroke route --task-id task.1 --task-class contextual --mode balanced",
      "  downstroke release plan --channel stable --package apps/cli --json",
      "  downstroke worker list --json",
      "  downstroke run --task-id task.verify --objective \"Verify the repository\" --owner maintainer --rollback docs/production-readiness.md --simplicity '<structured-json>' --json",
      "  downstroke knowledge compile --task-id task.1 --path src/index.ts --json",
      "  downstroke stack detect --json",
      "  downstroke experience init",
      "  downstroke workflow add --item '{\"id\":\"story.1\",\"type\":\"story\",\"title\":\"Add feature\",\"status\":\"ready-for-dev\"}'",
      "  downstroke workflow resume --item-id story.1",
      "  downstroke workflow add --item '<same item json>' --controlled --phase plan --approved --yes",
      "",
      "Safety",
      "  Preview first. Use --yes for authorized writes. Use --json for automation.",
    ].join("\n");
    console.log(help);
    return 0;
  }

  if (command === "init") {
    const inspection = await inspectProject(cwd);
    if (inspection.projectKind === "maintenance-checkout") {
      console.error("This is the Downstroke maintenance checkout. Pack and install Downstroke into a separate consumer project, then run init there.");
      return 1;
    }
    let preset = hasOption(argv, "preset") ? values.preset : undefined;
    let reviewMode = values["review-mode"];
    let blockSize = values["block-size"];
    let sprintDays = values["sprint-days"];
    let capacityHours = values["capacity-hours"];
    let wipLimit = values["wip-limit"];
    const guided = !values.yes && !values["dry-run"] ? question : undefined;
    if (guided) {
      const target = (await guided(`Initialize ${cwd}? [y/N] `)).trim();
      if (!/^y(?:es)?$/i.test(target)) return 1;
      preset ??= (await guided("Preset [lite]: ")).trim() || "lite";
      reviewMode ??= await requiredAnswer(guided, `Review mode (${cadenceChoices.join(", ")}): `);
      if (reviewMode === "blocks") blockSize ??= await requiredAnswer(guided, "Stories per review block: ");
      if (reviewMode === "sprint") {
        sprintDays ??= await requiredAnswer(guided, "Sprint length in working days: ");
        capacityHours ??= await requiredAnswer(guided, "Capacity hours per sprint: ");
        wipLimit ??= await requiredAnswer(guided, "WIP limit: ");
      }
    }
    const missing = [
      !preset && "--preset lite",
      !reviewMode && `--review-mode <${cadenceChoices.join("|")}>`,
      reviewMode === "blocks" && !blockSize && "--block-size <number>",
      reviewMode === "sprint" && !sprintDays && "--sprint-days <number>",
      reviewMode === "sprint" && !capacityHours && "--capacity-hours <number>",
      reviewMode === "sprint" && !wipLimit && "--wip-limit <number>",
    ].filter(Boolean);
    if (missing.length) {
      console.error(`init requires explicit non-interactive choices: ${missing.join(", ")}`);
      return 1;
    }
    if (preset !== "lite") throw new Error(`Unknown preset: ${preset}`);
    if (!cadenceChoices.includes(reviewMode as ReviewMode)) {
      console.error(`Unknown review mode: ${reviewMode}`);
      return 1;
    }
    if (reviewMode !== "blocks" && blockSize !== undefined || reviewMode !== "sprint" && [sprintDays, capacityHours, wipLimit].some((value) => value !== undefined)) {
      console.error("Cadence options must match the selected review mode");
      return 1;
    }
    const positiveInteger = (value: string | undefined) => value !== undefined && Number.isInteger(Number(value)) && Number(value) > 0;
    if (reviewMode === "blocks" && !positiveInteger(blockSize)
      || reviewMode === "sprint" && ![sprintDays, capacityHours, wipLimit].every(positiveInteger)) {
      console.error("Mode-specific cadence values must be positive integers");
      return 1;
    }
    const cadenceInput: Omit<PlanningCadence, "highRiskReview" | "lastReviewedStory"> = {
      reviewMode: reviewMode as ReviewMode,
      ...(blockSize === undefined ? {} : { blockSize: Number(blockSize) }),
      ...(sprintDays === undefined ? {} : { sprintLengthDays: Number(sprintDays) }),
      ...(capacityHours === undefined ? {} : { grossCapacityHoursPerSprint: Number(capacityHours) }),
      ...(wipLimit === undefined ? {} : { wipLimit: Number(wipLimit) }),
    };
    const actions = await installFiles(cwd, liteFiles, true);
    const existingSpec = await stat(join(cwd, "docs", "SPEC.md")).then(() => true, () => false);
    const preflight = existingSpec ? await planCadenceUpdate(cwd, cadenceInput) : undefined;
    if (preflight?.status === "blocked") {
      preflight.blockers.forEach((blocker) => console.error(`BLOCKED ${blocker}`));
      return 1;
    }
    if (!values.json) {
      for (const item of actions) console.log(`${item.action.toUpperCase()} ${item.target}`);
      console.log("CADENCE FILES .downstroke/planning.json, docs/SPEC.md");
      console.log(`CADENCE ${JSON.stringify(cadenceInput)}`);
    }
    const authorized = values.yes || Boolean(guided && /^y(?:es)?$/i.test((await guided("Apply these changes? [y/N] ")).trim()));
    if (values["dry-run"] || !authorized) {
      if (values.json) console.log(JSON.stringify({ status: "preview", projectKind: inspection.projectKind, actions, cadenceFiles: [".downstroke/planning.json", "docs/SPEC.md"], cadence: cadenceInput }, null, 2));
      else console.log("Preview only. Run again with --yes to authorize these changes.");
      return 0;
    }
    const installed = await installFiles(cwd, liteFiles);
    const cadencePlan = preflight ?? await planCadenceUpdate(cwd, cadenceInput);
    if (cadencePlan.status === "blocked") {
      await rollbackCreatedFiles(cwd, installed);
      cadencePlan.blockers.forEach((blocker) => console.error(`BLOCKED ${blocker}`));
      return 1;
    }
    const result = await applyCadenceUpdate(cwd, cadencePlan);
    if (result.status !== "ok") await rollbackCreatedFiles(cwd, installed);
    if (values.json) console.log(JSON.stringify({ status: "applied", projectKind: inspection.projectKind, actions, cadenceFiles: cadencePlan.files, cadence: cadencePlan.next, result }, null, 2));
    else console.log(`${result.status.toUpperCase()} ${result.message}`);
    return result.status === "ok" ? 0 : 1;
  }

  if (command === "doctor") {
    const inspection = await inspectProject(cwd);
    const results = [
      ...await checkFiles(cwd, requirements),
      ...await diagnoseLegacyAgentStack(cwd),
      ...await diagnoseNativeParity(cwd),
      ...manifestDoctorResult(inspection),
      await diagnosePlanningCadence(cwd),
    ];
    const verification = values["run-checks"]
      ? await runProjectChecks(cwd, inspection.scripts)
      : { status: "not-run", checks: [] } as const;
    if (values.json) console.log(JSON.stringify({ inspection, verification, results }, null, 2));
    else {
      console.log(`STAGE ${inspection.stage}`);
      console.log(`PROJECT ${inspection.projectKind}`);
      console.log(`STACK ${inspection.stacks.join(", ") || "unknown"}`);
      console.log(`ORIGIN ${inspection.originInference}`);
      console.log(`VERIFY ${verification.status}`);
      for (const result of results) {
        const details = [result.version && `version=${result.version}`, result.evidence && `evidence=${result.evidence}`, result.remediation && `next=${result.remediation}`]
          .filter(Boolean)
          .join(" ");
        console.log(`${result.status.toUpperCase().padEnd(4)} ${result.id} ${result.message}${details ? ` ${details}` : ""}`);
      }
    }
    return verification.status === "failed" || results.some((result) => result.status === "fail") ? 1 : 0;
  }

  if (command === "health") {
    const inspection = await inspectProject(cwd);
    const workflow = await readHealthWorkflowItems(cwd);
    const conflicts = await readHealthWorkflowConflicts(cwd);
    const knowledge = await auditProjectKnowledge(cwd);
    const results = [
      ...await checkFiles(cwd, requirements),
      ...await diagnoseLegacyAgentStack(cwd),
      ...await diagnoseNativeParity(cwd),
      ...manifestDoctorResult(inspection),
      await diagnosePlanningCadence(cwd),
    ];
    const verification = values["run-checks"]
      ? await runProjectChecks(cwd, inspection.scripts)
      : { status: "not-run", checks: [] } as const;
    const leakage = await readHealthLeakage(cwd);
    const nativeSurfaces = values.strict ? await scanNativeOnlySurfaces(cwd) : { status: "ok" as const, files: [], matches: [] };
    const blockers = [
      ...results.filter((result) => result.status === "fail" || values.strict && result.status === "warn").map((result) => `${result.id}: ${result.message}${result.remediation ? ` next=${result.remediation}` : ""}`),
      ...workflow.blockers,
      ...conflicts.blockers,
      ...workflow.items.filter((item) => item.status === "blocked").map((item) => `workflow.${item.id}: blocked high-risk item ${item.title}`),
      ...(values.strict ? workflow.items.filter((item) => item.risk === "high" && item.status !== "done" && item.status !== "blocked").map((item) => `workflow.${item.id}: unresolved high-risk item ${item.title} next=Complete its individual review`) : []),
      ...conflicts.conflicts.map((conflict) => `workflow.${conflict.itemId}: unresolved conflict ${conflict.id} owner=${conflict.owner}`),
      ...(verification.status === "failed" ? verification.checks.filter((check) => check.exitCode !== 0).map((check) => `check.${check.script}: failed with exit ${check.exitCode}`) : []),
      ...(values.strict && verification.status === "not-run" ? ["verification.not-run: project checks were not run next=Run downstroke health --strict --run-checks"] : []),
      ...(values.strict ? leakage : []),
      ...(values.strict ? nativeSurfaces.matches.map((finding) => `native.surface.${finding.path}: ${finding.terms.join(", ")} next=Replace active legacy instructions with native Downstroke commands`) : []),
      ...(values.strict ? knowledge.records.filter((record) => record.status === "quarantined").map((record) => `knowledge.${record.id}: quarantined knowledge remains next=Review and resolve the quarantined record`) : []),
      ...knowledge.findings.filter((finding) => finding.severity === "block" || values.strict).map((finding) => `${finding.code}: ${finding.message} next=${finding.nextAction}`),
    ];
    const nextActions = blockers.map((blocker) => blocker.includes(" next=") ? blocker.split(" next=")[1]! : "Resolve the reported blocker and rerun downstroke health --strict --run-checks");
    const status = blockers.length ? "fail" : results.some((result) => result.status === "warn") || knowledge.findings.length ? "warn" : "ok";
    if (values.json) console.log(JSON.stringify({ status, strict: values.strict, inspection, verification, results, workflow: workflow.items, conflicts: conflicts.conflicts, knowledge, blockers, nextActions }, null, 2));
    else {
      console.log(`HEALTH ${status} strict=${values.strict ? "on" : "off"}`);
      console.log(`STACK ${inspection.stacks.join(", ") || "unknown"}`);
      console.log(`VERIFY ${verification.status}`);
      for (const item of workflow.items) console.log(`WORKFLOW ${item.risk} ${item.status} ${item.id} ${item.title}`);
      for (const conflict of conflicts.conflicts) console.log(`CONFLICT ${conflict.status} ${conflict.id} item=${conflict.itemId} owner=${conflict.owner}`);
      for (const finding of knowledge.findings) console.log(`KNOWLEDGE ${finding.severity} ${finding.code} ${finding.message} next=${finding.nextAction}`);
      for (const blocker of blockers) console.log(`BLOCKER ${blocker}`);
      for (const action of nextActions) console.log(`NEXT ${action}`);
      if (!blockers.length && results.some((result) => result.status === "warn")) console.log("NEXT Resolve warnings before release or rerun with --strict to gate them.");
    }
    return status === "fail" ? 1 : 0;
  }

  if (command === "cleanup") {
    const plan = await planCleanup(cwd);
    const applies = values.yes && !values["dry-run"] && plan.status === "ready" && plan.archiveTargets.length > 0;
    if (!values.json) {
      console.log(`CLEANUP ${plan.status} targets=${plan.archiveTargets.length}`);
      console.log(`NATIVE PARITY ${plan.nativeParity.join(", ")}`);
      console.log(`IMPORTED HASHES ${plan.importedHashes.length}`);
      console.log(`REWRITTEN ACTIVE DOCS ${plan.rewrittenActiveDocs.length}`);
      for (const target of plan.quarantineTargets) console.log(`QUARANTINE ${target}`);
      for (const target of plan.archiveTargets) console.log(`ARCHIVE ${target.source} -> ${target.archive} reason=${target.reason}`);
      for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`);
      if (plan.status === "ready" && plan.archiveTargets.length && (!values.yes || values["dry-run"])) console.log("Run again with --yes to archive these legacy sources.");
    }
    if (!applies) {
      if (values.json) console.log(JSON.stringify({ ...plan, applies: false }, null, 2));
      return plan.status === "blocked" ? 1 : 0;
    }
    try {
      const archived = await applyCleanup(cwd, plan.archiveTargets, plan.verifiedFiles);
      if (values.json) console.log(JSON.stringify({ ...plan, applies: true, archived }, null, 2));
      else console.log("OK Cleanup archived legacy sources");
      return 0;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Cleanup failed";
      if (values.json) console.log(JSON.stringify({ ...plan, status: "blocked", applies: false, archived: [], blockers: [...plan.blockers, message] }, null, 2));
      else console.error(`BLOCKED ${message}`);
      return 1;
    }
  }

  if (command === "release") {
    const action = positionals[0];
    if (!action || !["plan", "prepare", "verify"].includes(action)) {
      console.error("release action must be plan, prepare or verify; publication and Git mutation require a later high-risk workflow");
      return 1;
    }
    if (action === "verify") {
      if (!values.plan) {
        console.error("--plan must identify the prepared release plan");
        return 1;
      }
      const saved = await readNativeReleasePlan(cwd, values.plan);
      if (!saved) {
        console.error("Release plan was not found or failed integrity validation");
        return 1;
      }
      const result = await verifyNativeRelease(cwd, saved);
      if (values.json) console.log(JSON.stringify(result, null, 2));
      else console.log(`${result.status.toUpperCase()} ${result.message}${result.remediation ? ` next=${result.remediation}` : ""}`);
      return result.status === "ok" ? 0 : 1;
    }
    const channel = values.channel;
    if (!channel || !nativeReleaseChannels.includes(channel as NativeReleaseChannel)) {
      console.error("--channel must be stable, beta or rc");
      return 1;
    }
    const plan = await planNativeRelease(cwd, { channel: channel as NativeReleaseChannel, packages: values.package ?? [] });
    if (action === "plan" || !values.yes || plan.status === "blocked") {
      if (values.json) console.log(JSON.stringify(plan, null, 2));
      else {
        console.log(`RELEASE ${plan.status} bump=${plan.bump} version=${plan.nextVersion ?? "none"} channel=${plan.request.channel}`);
        console.log(`BASE ${plan.baselineTag ?? "missing"} head=${plan.head ?? "missing"} branch=${plan.branch ?? "detached"}`);
        console.log(`TARGETS ${plan.packages.map((item) => `${item.name}@${item.currentVersion}`).join(", ") || "none"}`);
        console.log(`OUTPUT tag=${plan.gitTag ?? "none"} dist-tag=${plan.distTag} plan=${plan.planHash ?? "blocked"}`);
        console.log(`NOTES breaking=${plan.notes.breaking.length} features=${plan.notes.features.length} fixes=${plan.notes.fixes.length}`);
        console.log(`CHECKS ${plan.checks.join(", ")}`);
        console.log(`APPROVALS ${plan.requiredApprovals.join(", ")}`);
        for (const risk of plan.risks) console.log(`RISK ${risk}`);
        console.log(`ROLLBACK ${plan.rollback}`);
        for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`);
        if (action === "prepare" && plan.status === "ready") console.log(`NEXT downstroke release prepare --channel ${plan.request.channel} --package ${plan.request.packages.join(" --package ")} --plan ${plan.planHash} --yes`);
      }
      return plan.status === "blocked" ? 1 : 0;
    }
    if (!values.plan || values.plan !== plan.planHash) {
      console.error("--plan must match the current release plan hash");
      return 1;
    }
    const result = await applyNativeReleasePreparation(cwd, plan, values.plan);
    if (values.json) console.log(JSON.stringify(result, null, 2));
    else console.log(`${result.status.toUpperCase()} ${result.message}${result.remediation ? ` next=${result.remediation}` : ""}`);
    return result.status === "ok" ? 0 : 1;
  }

  if (command === "worker") {
    const action = positionals[0];
    if (action === "list") {
      const workers = await listNativeWorkers(cwd);
      if (values.json) console.log(JSON.stringify(workers, null, 2));
      else for (const worker of workers) console.log(`WORKER ${worker.id} role=${worker.role} tools=${worker.allowedTools.join(",")} mutations=${worker.mutationRights.length}`);
      return 0;
    }
    if (action !== "register" || !values.manifest || !values["task-id"] || !values["task-class"] || !values.justification) {
      console.error("Usage: downstroke worker <list|register> --manifest <json> --task-id <id> --task-class <class> --justification <text> [--plan <hash>] [--yes] [--json]");
      return 1;
    }
    if (!tokenTaskClasses.includes(values["task-class"] as TokenTaskClass)) {
      console.error("--task-class must be deterministic, contextual or creative");
      return 1;
    }
    let manifest: unknown;
    try { manifest = JSON.parse(values.manifest) as unknown; }
    catch { console.error("--manifest must be valid JSON"); return 1; }
    const plan = await planNativeWorkerRegistration(cwd, {
      manifest,
      task: { id: values["task-id"], taskClass: values["task-class"] as TokenTaskClass, toolProven: values["tool-proven"], singlePathSufficient: values["single-path"], justification: values.justification },
    });
    if (!values.yes || plan.status === "blocked") {
      if (values.json) console.log(JSON.stringify(plan, null, 2));
      else {
        console.log(`WORKER REGISTRATION ${plan.status} mode=${plan.mode} action=${plan.action} plan=${plan.planHash ?? "blocked"}`);
        for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`);
        console.log(`NEXT ${plan.nextAction}`);
      }
      return plan.status === "ready" ? 0 : 1;
    }
    if (!values.plan || values.plan !== plan.planHash) {
      console.error("--plan must match the current worker registration plan hash");
      return 1;
    }
    const result = await applyNativeWorkerRegistration(cwd, plan, values.plan);
    if (values.json) console.log(JSON.stringify({ plan, result }, null, 2));
    else console.log(`${result.status.toUpperCase()} ${result.message}${result.remediation ? ` next=${result.remediation}` : ""}`);
    return result.status === "ok" ? 0 : 1;
  }

  if (command === "run") {
    if (!values["task-id"] || !values.objective || !values.owner || !values.rollback) {
      console.error("Usage: downstroke run --task-id <id> --objective <text> --owner <owner> --rollback <reference> --simplicity <json> [--dependency <task>] [--priority <level>] [--estimate <minutes>] [--risk <level>] [--mode worker --worker-id <id> --justification <text>] [--plan <hash> --yes] [--approved] [--json]");
      return 1;
    }
    let simplicity: unknown;
    try { simplicity = values.simplicity === undefined ? undefined : JSON.parse(values.simplicity) as unknown; }
    catch { if (values.json) console.log(JSON.stringify({ status: "blocked", blockers: ["--simplicity must be one valid JSON object"] }, null, 2)); else console.error("--simplicity must be one valid JSON object"); return 1; }
    const task = {
      id: values["task-id"],
      operation: values.operation,
      objective: values.objective,
      owner: values.owner,
      dependencies: values.dependency ?? [],
      priority: values.priority,
      estimateMinutes: Number(values.estimate),
      risk: values.risk ?? "normal",
      rollbackReference: values.rollback,
      simplicity,
      ...(values["item-id"] ? { workflowItemId: values["item-id"] } : {}),
      ...(values.mode ? { mode: values.mode as NativeExecutionMode } : {}),
      ...(values["worker-id"] ? { workerId: values["worker-id"] } : {}),
      ...(values.justification ? { justification: values.justification } : {}),
    };
    const plan = await planNativeExecution(cwd, task);
    if (!values.yes || plan.status === "blocked") {
      if (values.json) console.log(JSON.stringify(plan, null, 2));
      else {
        console.log(`EXECUTION ${plan.status} task=${plan.task?.id ?? "invalid"} mode=${plan.mode} plan=${plan.planHash ?? "blocked"}`);
        if (plan.task) {
          console.log(`OBJECTIVE ${plan.task.objective}`);
          console.log(`OWNER ${plan.task.owner} PRIORITY ${plan.task.priority} ESTIMATE ${plan.task.estimateMinutes}m RISK ${plan.task.risk}`);
          console.log(`DEPENDENCIES ${plan.task.dependencies.join(", ") || "none"}`);
          console.log(`ROLLBACK ${plan.task.rollbackReference}`);
        }
        console.log(`APPROVALS ${plan.requiredApprovals.join(", ")}`);
        if (plan.simplicity) {
          console.log(`SIMPLICITY ${plan.simplicity.status} risks=${plan.simplicity.risks.length} exception=${plan.simplicity.exception.active}`);
          for (const finding of plan.simplicity.findings) console.log(`SIMPLICITY FINDING ${finding.status} ${finding.id} ${finding.message}`);
          for (const risk of plan.simplicity.risks) console.log(`SIMPLICITY RISK ${risk.severity} ${risk.category} ${risk.evidence}`);
        }
        for (const stage of plan.stages) console.log(`STAGE ${stage.stage} ${stage.responsibility}`);
        if (plan.selectedWorker) console.log(`WORKER ${plan.selectedWorker.id} manifest=${plan.selectedWorker.manifestHash} budget=${plan.selectedWorker.budget.maxSteps}/${plan.selectedWorker.budget.maxTokens}`);
        for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`);
        console.log(`NEXT ${plan.nextAction}`);
      }
      return plan.status === "ready" ? 0 : 1;
    }
    if (!values.plan || values.plan !== plan.planHash) {
      console.error("--plan must match the current execution plan hash");
      return 1;
    }
    const result = await applyNativeExecution(cwd, plan, values.plan, { execution: values.yes, highRisk: values.approved });
    if (values.json) console.log(JSON.stringify({ plan, result }, null, 2));
    else console.log(`${result.status.toUpperCase()} EXECUTION ${result.executionStatus} task=${result.taskId ?? "invalid"} next=${result.nextAction}`);
    return result.executionStatus === "completed" ? 0 : 1;
  }

  if (command === "setup-agents") {
    const result = { status: "deprecated", replacement: "Native migration is planned in Epic 9", mutations: [] } as const;
    if (values.json) console.log(JSON.stringify(result, null, 2));
    else console.log("DEPRECATED setup-agents performs no installation; use the native migration roadmap.");
    return 0;
  }

  if (command === "cadence") {
    const reviewMode = values["review-mode"];
    if (!reviewMode) {
      const query = { choices: cadenceChoices, current: await readPlanningCadence(cwd) };
      if (values.json) console.log(JSON.stringify(query, null, 2));
      else {
        console.log("How do you want to review this work?");
        cadenceChoices.forEach((choice, index) => console.log(`${index + 1}. ${choice}`));
        console.log(`CURRENT ${query.current?.reviewMode ?? "not-configured"}`);
      }
      return 0;
    }
    if (!cadenceChoices.includes(reviewMode as ReviewMode)) {
      console.error(`Unknown review mode: ${reviewMode}`);
      return 1;
    }
    const number = (value: string | undefined) => value === undefined ? undefined : Number(value);
    const blockSize = number(values["block-size"]);
    const sprintLengthDays = number(values["sprint-days"]);
    const grossCapacityHoursPerSprint = number(values["capacity-hours"]);
    const wipLimit = number(values["wip-limit"]);
    const plan = await planCadenceUpdate(cwd, {
      reviewMode: reviewMode as ReviewMode,
      ...(blockSize === undefined ? {} : { blockSize }),
      ...(sprintLengthDays === undefined ? {} : { sprintLengthDays }),
      ...(grossCapacityHoursPerSprint === undefined ? {} : { grossCapacityHoursPerSprint }),
      ...(wipLimit === undefined ? {} : { wipLimit }),
    });
    if (!values.yes || values["dry-run"] || plan.status === "blocked") {
      if (values.json) console.log(JSON.stringify(plan, null, 2));
      else {
        console.log(`PLAN ${plan.status}`);
        console.log(`FILES ${plan.files.join(", ")}`);
        console.log(`NEXT ${JSON.stringify(plan.next)}`);
        for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`);
        if (plan.status === "ready") console.log("Run again with --yes to authorize this plan.");
      }
      return plan.status === "blocked" ? 1 : 0;
    }
    const result = await applyCadenceUpdate(cwd, plan);
    if (values.json) console.log(JSON.stringify({ plan, result }, null, 2));
    else console.log(`${result.status.toUpperCase()} ${result.message}`);
    return result.status === "ok" ? 0 : 1;
  }

  if (command === "govern") {
    const kind = values.kind;
    if (!kind || !["deterministic", "contextual", "high-risk"].includes(kind)) {
      console.error("--kind must be deterministic, contextual or high-risk");
      return 1;
    }
    let options: unknown[] | undefined;
    try {
      options = values.option?.map((option) => JSON.parse(option) as unknown);
    } catch {
      console.error("Each --option must be valid JSON");
      return 1;
    }
    const result = governDecision({
      kind: kind as DecisionKind,
      mutates: values.mutates,
      ...(options ? { options } : {}),
      ...(values.select ? { selectedOption: values.select } : {}),
      ...(values.scope ? { scope: values.scope } : {}),
      ...(values.owner ? { owner: values.owner } : {}),
      ...(values.environment ? { environment: values.environment } : {}),
      ...(values.risk ? { risk: values.risk } : {}),
      ...(values.rollback ? { rollback: values.rollback } : {}),
    });
    if (values.json) console.log(JSON.stringify(result, null, 2));
    else {
      console.log(`GOVERNANCE ${result.status}`);
      console.log(`RESPONSIBILITY user=${result.responsibilities.user} llm=${result.responsibilities.llm} cli=${result.responsibilities.cli} repository=${result.responsibilities.repository} provider=${result.responsibilities.provider}`);
      console.log(`AUTHORIZATION ${result.requiresAuthorization ? "required" : "not-required"}`);
      for (const question of result.questions) console.log(`QUESTION ${question}`);
      for (const blocker of result.blockers) console.log(`BLOCKED ${blocker}`);
    }
    return result.status === "blocked" ? 1 : 0;
  }

  if (command === "estimate" || command === "status") {
    const scope = values.scope;
    if (!scope || !["task", "backlog", "sprint"].includes(scope)) {
      console.error("--scope must be task, backlog or sprint");
      return 1;
    }
    try {
      const estimate = await estimateTokenUsage(cwd, scope as "task" | "backlog" | "sprint", values.path ?? []);
      if (command === "estimate") {
        if (values.json) console.log(JSON.stringify(estimate, null, 2));
        else console.log(`ESTIMATE ${estimate.range.low}-${estimate.range.high} tokens (${estimate.uncertainty} uncertainty)`);
      } else {
        const status = tokenUsageStatus(estimate, values["consumed-tokens"] === undefined ? undefined : Number(values["consumed-tokens"]));
        if (values.json) console.log(JSON.stringify(status, null, 2));
        else console.log(`STATUS consumed=${status.consumedTokens} projected=${status.projectedRemainingTokens.low}-${status.projectedRemainingTokens.high}`);
      }
      return 0;
    } catch (error: unknown) {
      console.error(error instanceof Error ? error.message : "Token estimation failed");
      return 1;
    }
  }

  if (command === "experience") {
    const action = positionals[0];
    if (action === "init") {
      const result = await initializeExperience(cwd, values["dry-run"]);
      if (values.json) console.log(JSON.stringify(result, null, 2));
      else {
        console.log(`EXPERIENCE ${result.status}`);
        for (const item of result.actions) console.log(`${item.action.toUpperCase()} ${item.path}`);
        console.log(result.message);
      }
      return result.status === "ok" ? 0 : 1;
    }
    if (action === "add" && values.fact) {
      let input: unknown;
      try { input = JSON.parse(values.fact) as unknown; }
      catch {
        const error = { status: "fail", error: "invalid-fact-json", message: "--fact must be valid JSON" };
        if (values.json) console.log(JSON.stringify(error, null, 2)); else console.error(error.message);
        return 1;
      }
      const plan = await planExperienceFact(cwd, input);
      const summary = { status: plan.status, action: plan.action, id: plan.fact?.id ?? null, blockers: plan.blockers };
      if (!values.yes || values["dry-run"] || plan.status === "blocked") {
        if (values.json) console.log(JSON.stringify(summary, null, 2));
        else {
          console.log(`EXPERIENCE FACT ${plan.status} ${plan.action} ${plan.fact?.id ?? "invalid"}`);
          for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`);
          if (plan.status === "ready" && plan.action === "append") console.log("Run again with --yes to authorize this fact write.");
        }
        return plan.status === "blocked" ? 1 : 0;
      }
      const result = await applyExperienceFact(cwd, plan);
      if (values.json) console.log(JSON.stringify({ plan: summary, result }, null, 2));
      else console.log(`${result.status.toUpperCase()} ${result.message} id=${result.evidence ?? "unknown"}`);
      return result.status === "ok" ? 0 : 1;
    }
    if (action === "import") {
      const plan = await planExperienceImport(cwd, values.path ?? []);
      const summary = {
        status: plan.status,
        records: plan.records.map(({ fact: _fact, ...record }) => record),
        blockers: plan.blockers,
      };
      const conflictOnly = plan.blockers.length > 0 && plan.blockers.every((blocker) => blocker.startsWith("Material source conflict"));
      if (!values.yes || values["dry-run"] || plan.status === "blocked" && !conflictOnly) {
        if (values.json) console.log(JSON.stringify(summary, null, 2));
        else {
          console.log(`EXPERIENCE IMPORT ${plan.status}`);
          for (const record of summary.records) console.log(`${record.importability.toUpperCase()} ${record.path} ${record.hash || "no-hash"} ${record.classification}`);
          for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`);
          if (plan.status === "ready") console.log("Run again with --yes to authorize this import.");
        }
        return plan.status === "blocked" ? 1 : 0;
      }
      const result = await applyExperienceImport(cwd, plan);
      if (values.json) console.log(JSON.stringify({ plan: summary, result }, null, 2));
      else console.log(`${result.status.toUpperCase()} ${result.message} imported=${result.evidence ?? "0"}`);
      return result.status === "ok" ? 0 : 1;
    }
    if (values.json) console.log(JSON.stringify({ status: "fail", error: "invalid-experience-command", message: "Use experience init, experience add --fact <json>, or experience import --path <path>" }, null, 2));
    else console.error("Usage: downstroke experience <init|add|import> [--path <path>] [--fact <json>] [--yes] [--json]");
    return 1;
  }

  if (command === "communication") {
    const budget = values.budget === undefined ? undefined : Number(values.budget);
    if (values.mode !== undefined && !communicationModes.includes(values.mode as CommunicationMode)) {
      const error = { status: "fail", error: "invalid-communication-mode", message: "--mode must be normal, compact, technical, audit or handoff" };
      if (values.json) console.log(JSON.stringify(error, null, 2)); else console.error(error.message);
      return 1;
    }
    if (values.mode === undefined && values.budget === undefined && values.preference === undefined) {
      const current = await readCommunicationPolicy(cwd);
      const report = {
        current,
        modes: communicationModes,
        protectedCategories: protectedCommunicationCategories,
        protection: protectedCommunicationCategories.map((category) => evaluateCommunicationProtection(current?.mode ?? "normal", category)),
      };
      if (values.json) console.log(JSON.stringify(report, null, 2));
      else {
        console.log(`COMMUNICATION ${current?.mode ?? "not-configured"}`);
        console.log(`BUDGET ${current?.budgetTokens ?? "default"}`);
        for (const category of protectedCommunicationCategories) console.log(`PROTECTED ${category}`);
      }
      return 0;
    }
    const plan = await planCommunicationPolicy(cwd, {
      ...(values.mode ? { mode: values.mode } : {}),
      ...(budget === undefined ? {} : { budgetTokens: budget }),
      ...(values.preference ? { preference: values.preference } : {}),
    });
    const summary = {
      status: plan.status,
      action: plan.action,
      mode: plan.policy?.mode ?? null,
      budgetTokens: plan.policy?.budgetTokens ?? null,
      preference: plan.preference ? { id: plan.preference.id, status: plan.preference.status, reason: plan.preference.reason } : null,
      blockers: plan.blockers,
    };
    if (!values.yes || values["dry-run"] || plan.status === "blocked") {
      if (values.json) console.log(JSON.stringify(summary, null, 2));
      else {
        console.log(`COMMUNICATION POLICY ${plan.status} ${plan.action} ${summary.mode ?? "invalid"}`);
        if (summary.preference) console.log(`PREFERENCE ${summary.preference.status} ${summary.preference.reason}`);
        for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`);
        if (plan.status === "ready" && plan.action === "append") console.log("Run again with --yes to authorize this communication policy update.");
      }
      return plan.status === "blocked" ? 1 : 0;
    }
    const result = await applyCommunicationPolicy(cwd, plan);
    if (values.json) console.log(JSON.stringify({ plan: summary, result }, null, 2));
    else console.log(`${result.status.toUpperCase()} ${result.message} mode=${result.evidence ?? "unknown"}`);
    return result.status === "ok" ? 0 : 1;
  }

  if (command === "simplicity") {
    const dependencies = (values.dependency ?? []).map((item) => {
      const splitAt = item.lastIndexOf("@");
      const hasVersion = splitAt > 0;
      return { name: hasVersion ? item.slice(0, splitAt) : item, ...(hasVersion ? { spec: item.slice(splitAt + 1) } : {}) };
    });
    const report = evaluateSimplicityGates({
      ...(values.proposal ? { proposal: values.proposal } : {}),
      ...(values.risk ? { risk: values.risk } : {}),
      ...(dependencies.length ? { dependency: true, dependencies } : {}),
      ...(values["shared-package"] ? { sharedPackage: true } : {}),
      ...(values.abstraction ? { abstraction: true } : {}),
      ...(values.rewrite ? { rewrite: true } : {}),
      ...(values["safety-exception"] ? { safetyException: values["safety-exception"] } : {}),
      ...(values.evidence ? { evidence: values.evidence } : {}),
      ...(values.consumers ? { consumers: values.consumers } : {}),
      ...(values.impact ? { impact: values.impact } : {}),
      ...(values.owner ? { owner: values.owner } : {}),
      ...(values.tests ? { tests: values.tests } : {}),
      ...(values.rollback ? { rollback: values.rollback } : {}),
      files: (values.path ?? []).map((path) => ({ path, generated: /(^|[\\/])(dist|build|generated|coverage|vendor)([\\/]|$)|\.min\.(js|css)$/i.test(path) })),
    });
    if (values.json) console.log(JSON.stringify(report, null, 2));
    else {
      console.log(`SIMPLICITY ${report.status}`);
      for (const item of report.ladder) console.log(`LADDER ${item.step} ${item.considered ? "considered" : "missing"}`);
      for (const finding of report.findings) console.log(`${finding.status.toUpperCase()} ${finding.id} ${finding.message} next=${finding.nextAction}`);
      for (const risk of report.risks) console.log(`RISK ${risk.severity} ${risk.category} ${risk.evidence} next=${risk.nextAction}`);
      for (const blocker of report.blockers) console.log(`BLOCKED ${blocker}`);
    }
    return report.status === "blocked" ? 1 : 0;
  }

  if (command === "code") {
    const action = positionals[0];
    if (action === "index") {
      const plan = await planCodeIntelligenceIndex(cwd);
      const summary = { status: plan.status, action: plan.action, files: plan.indexedFiles.length, packages: plan.packages.length, stack: plan.stack.length, exclusions: plan.exclusions, blockers: plan.blockers };
      if (!values.yes || values["dry-run"] || plan.status === "blocked") {
        if (values.json) console.log(JSON.stringify(summary, null, 2));
        else {
          console.log(`CODE INDEX ${plan.status} ${plan.action} files=${plan.indexedFiles.length}`);
          for (const exclusion of plan.exclusions.slice(0, 20)) console.log(`EXCLUDED ${exclusion.path} ${exclusion.reason}`);
          for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`);
          if (plan.status === "ready" && plan.action === "write") console.log("Run again with --yes to authorize this code index update.");
        }
        return plan.status === "blocked" ? 1 : 0;
      }
      const result = await applyCodeIntelligenceIndex(cwd, plan);
      if (values.json) console.log(JSON.stringify({ plan: summary, result }, null, 2));
      else console.log(`${result.status.toUpperCase()} ${result.message} files=${result.evidence ?? "0"}`);
      return result.status === "ok" ? 0 : 1;
    }
    if (action === "impact" || action === "context") {
      const requestedPaths = Array.isArray(values.path) ? values.path : values.path ? [values.path] : [];
      const report = await queryCodeContext(cwd, requestedPaths, action);
      if (values.json) console.log(JSON.stringify(report, null, 2));
      else {
        console.log(`CODE ${action.toUpperCase()} ${report.status} files=${report.files.length}`);
        for (const file of report.files) console.log(`FILE ${file.path}`);
        for (const path of report.stale) console.log(`STALE ${path}`);
      }
      return report.status === "ready" ? 0 : 1;
    }
    if (values.json) console.log(JSON.stringify({ status: "fail", error: "invalid-code-command", message: "Use code index, code impact --path <path>, or code context --path <path>" }, null, 2));
    else console.error("Usage: downstroke code <index|impact|context> [--path <path>] [--yes] [--json]");
    return 1;
  }

  if (command === "route") {
    const mode = values.mode ?? "balanced";
    const taskClass = values["task-class"] ?? "contextual";
    const risk = values.risk ?? "normal";
    const ambiguity = values.ambiguity ?? "low";
    const verification = values.verification ?? "pending";
    if (!tokenEconomyModes.includes(mode as TokenEconomyMode) || !tokenTaskClasses.includes(taskClass as TokenTaskClass) || !["normal", "high"].includes(risk) || !["low", "high"].includes(ambiguity) || !["pending", "passed", "failed"].includes(verification)) {
      const error = { status: "fail", error: "invalid-token-route", message: "Use valid --mode, --task-class, --risk, --ambiguity and --verification values" };
      if (values.json) console.log(JSON.stringify(error, null, 2)); else console.error(error.message);
      return 1;
    }
    const plan = planTokenEconomyRoute({
      taskId: values["task-id"] ?? "",
      mode: mode as TokenEconomyMode,
      taskClass: taskClass as TokenTaskClass,
      risk: risk as "normal" | "high",
      ambiguity: ambiguity as "low" | "high",
      toolProven: values["tool-proven"],
      verification: verification as "pending" | "passed" | "failed",
    });
    if (!values.yes || values["dry-run"] || plan.status === "blocked") {
      if (values.json) console.log(JSON.stringify(plan, null, 2));
      else {
        console.log(`ROUTE ${plan.status} ${plan.record?.outcome ?? "invalid"} task=${plan.request.taskId || "missing"}`);
        if (plan.record) console.log(`POLICY mode=${plan.record.mode} class=${plan.record.taskClass} risk=${plan.record.risk} tier=${plan.record.modelTier} budget=${plan.record.contextBudget} cache=${plan.record.cacheStrategy} escalation=${plan.record.escalationTrigger} verification=${plan.record.verificationGate}`);
        for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`);
        if (plan.status === "ready") console.log("Run again with --yes to record this token route.");
      }
      return plan.status === "blocked" ? 1 : 0;
    }
    const result = await applyTokenEconomyRoute(cwd, plan);
    if (values.json) console.log(JSON.stringify({ plan, result }, null, 2)); else console.log(`${result.status.toUpperCase()} ${result.message} task=${result.evidence ?? "unknown"}`);
    return result.status === "ok" ? 0 : 1;
  }

  if (command === "knowledge") {
    const action = positionals[0];
    if (action === "list") {
      try {
        const report = await auditProjectKnowledge(cwd);
        if (values.json) console.log(JSON.stringify(report.records, null, 2));
        else for (const record of report.records) console.log(`KNOWLEDGE ${record.effectiveStatus} ${record.trust} ${record.id} key=${record.key}`);
        return report.status === "blocked" ? 1 : 0;
      } catch { console.error("Knowledge registry cannot be inspected safely"); return 1; }
    }
    if (action === "audit") {
      const report = await auditProjectKnowledge(cwd);
      if (values.json) console.log(JSON.stringify(report, null, 2));
      else {
        console.log(`KNOWLEDGE AUDIT ${report.status} records=${report.records.length} candidates=${report.candidates.length}`);
        for (const finding of report.findings) console.log(`${finding.severity.toUpperCase()} ${finding.code} ${finding.message} next=${finding.nextAction}`);
      }
      return report.status === "blocked" ? 1 : 0;
    }
    if (action === "add" && values.record) {
      let record: unknown;
      try { record = JSON.parse(values.record) as unknown; }
      catch { console.error("--record must be valid JSON"); return 1; }
      const plan = await planKnowledgeRecord(cwd, record);
      if (!values.yes || plan.status === "blocked") {
        if (values.json) console.log(JSON.stringify(plan, null, 2));
        else {
          console.log(`KNOWLEDGE ADD ${plan.status} action=${plan.action} id=${plan.record?.id ?? "invalid"} plan=${plan.planHash ?? "blocked"}`);
          for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`);
        }
        return plan.status === "blocked" ? 1 : 0;
      }
      if (!values.plan || values.plan !== plan.planHash) { console.error("--plan must match the current knowledge plan hash"); return 1; }
      const result = await applyKnowledgeRecord(cwd, plan, values.plan);
      if (values.json) console.log(JSON.stringify({ plan, result }, null, 2)); else console.log(`${result.status.toUpperCase()} ${result.message}`);
      return result.status === "ok" ? 0 : 1;
    }
    if (action === "compile") {
      const report = await compileTaskContext(cwd, {
        taskId: values["task-id"] ?? "",
        paths: values.path ?? [],
        ...(values.stack ? { stack: values.stack } : {}),
        ...(values.budget === undefined ? {} : { budget: Number(values.budget) }),
      });
      if (values.json) console.log(JSON.stringify(report, null, 2));
      else {
        console.log(`KNOWLEDGE COMPILE ${report.status} task=${report.task.id || "missing"} hash=${report.stableHash}`);
        for (const category of Object.keys(report.sections)) console.log(`SECTION ${category} items=${report.sections[category as keyof typeof report.sections].length}`);
        for (const item of report.included.slice(0, 20)) console.log(`INCLUDED ${item.category} ${item.id}`);
        for (const item of report.excluded.slice(0, 20)) console.log(`EXCLUDED ${item.id} ${item.reason}`);
        for (const blocker of report.blockers) console.log(`BLOCKED ${blocker}`);
      }
      return report.status === "blocked" ? 1 : 0;
    }
    if (values.json) console.log(JSON.stringify({ status: "fail", error: "invalid-knowledge-command", message: "Use knowledge <list|add|compile|audit>" }, null, 2));
    else console.error("Usage: downstroke knowledge <list|add|compile|audit> [options]");
    return 1;
  }

  if (command === "stack") {
    const action = positionals[0];
    if (action === "detect") {
      const report = await detectCodeStack(cwd);
      if (values.json) console.log(JSON.stringify(report, null, 2));
      else {
        console.log(`STACK DETECT ${report.status}`);
        for (const item of report.stack) console.log(`TECH ${item.technology} ${item.version ?? "unknown"} source=${item.source.path}`);
        for (const blocker of report.blockers) console.log(`BLOCKED ${blocker}`);
      }
      return report.status === "blocked" ? 1 : 0;
    }
    if (values.json) console.log(JSON.stringify({ status: "fail", error: "invalid-stack-command", message: "Use stack detect" }, null, 2));
    else console.error("Usage: downstroke stack detect [--json]");
    return 1;
  }

  if (command === "workflow") {
    const action = positionals[0];
    if (action === "resume") {
      const result = await resolveWorkflowNextAction(cwd, values["item-id"]);
      if (values.json) console.log(JSON.stringify(result, null, 2));
      else {
        console.log(`WORKFLOW NEXT ${result.status} ${result.itemId ?? "none"} ${result.action} ${result.reason}`);
        if (result.status === "ready" && result.itemId && result.action.startsWith("approve-")) {
          const phase = result.action.replace("approve-", "");
          console.log(`NEXT COMMAND preview: downstroke workflow add --item '<same item json>' --controlled --phase ${phase} --approved; then repeat with --plan <printed-hash> --yes`);
        }
        if (result.status === "blocked" && result.itemId && result.action === "resolve-conflict") {
          console.log(`NEXT COMMAND preview: downstroke workflow resolve --item-id ${result.itemId} --select <option> --owner <owner> --rationale <text>; then repeat with --plan <printed-hash> --yes`);
        }
      }
      return result.status === "blocked" ? 1 : 0;
    }
    if (action === "resolve") {
      const plan = await planWorkflowConflictResolution(cwd, {
        itemId: values["item-id"] ?? "",
        selectedOption: values.select ?? "",
        owner: values.owner ?? "",
        rationale: values.rationale ?? "",
      });
      if (!values.yes || values["dry-run"] || values.plan !== plan.planHash || plan.status === "blocked") {
        if (values.json) console.log(JSON.stringify(plan, null, 2));
        else { console.log(`WORKFLOW RESOLUTION ${plan.status}`); for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`); if (plan.status === "ready") console.log(`Run again with --plan ${plan.planHash} --yes to authorize this resolution.`); }
        return plan.status === "blocked" ? 1 : 0;
      }
      const result = await resolveWorkflowConflict(cwd, plan, values.plan);
      if (values.json) console.log(JSON.stringify({ plan, result }, null, 2));
      else console.log(`${result.status.toUpperCase()} ${result.message}`);
      return result.status === "ok" ? 0 : 1;
    }
    if (action === "add" && values.item) {
      if (values.phase !== undefined && !workflowPhases.includes(values.phase as WorkflowPhase)) {
        const error = { status: "fail", error: "invalid-workflow-phase", message: "--phase must be plan, review, implementation or verification" };
        if (values.json) console.log(JSON.stringify(error, null, 2)); else console.error(error.message);
        return 1;
      }
      let item: unknown;
      let conflict: unknown;
      try {
        item = JSON.parse(values.item) as unknown;
        conflict = values.conflict === undefined ? undefined : JSON.parse(values.conflict) as unknown;
      } catch {
        const error = { status: "fail", error: "invalid-workflow-json", message: "--item and --conflict must be valid JSON" };
        if (values.json) console.log(JSON.stringify(error, null, 2)); else console.error(error.message);
        return 1;
      }
      const plan = await planWorkflowItem(cwd, {
        item,
        ...(values.controlled ? { controlled: true } : {}),
        ...(values.phase ? { phase: values.phase as WorkflowPhase } : {}),
        ...(values.approved ? { approved: true } : {}),
        ...(conflict === undefined ? {} : { conflict }),
      });
      const summary = {
        status: plan.status,
        action: plan.action,
        item: plan.item ? { id: plan.item.id, type: plan.item.type, status: plan.item.status, risk: plan.item.risk, review: plan.item.review } : null,
        checkpoint: plan.checkpoint ? { itemId: plan.checkpoint.itemId, phase: plan.checkpoint.phase, status: plan.checkpoint.status } : null,
        conflict: plan.conflict ? { id: plan.conflict.id, itemId: plan.conflict.itemId, owner: plan.conflict.owner, sources: plan.conflict.sources, options: plan.conflict.options, consequences: plan.conflict.consequences, status: plan.conflict.status } : null,
        nextAction: plan.nextAction,
        blockers: plan.blockers,
        planHash: plan.planHash,
      };
      const conflictOnly = plan.blockers.length > 0 && plan.blockers.every((blocker) => blocker.startsWith("Material workflow conflict"));
      if (!values.yes || values["dry-run"] || values.plan !== plan.planHash || plan.status === "blocked" && !conflictOnly) {
        if (values.json) console.log(JSON.stringify(summary, null, 2));
        else {
          console.log(`WORKFLOW ${plan.status} ${plan.action} ${summary.item?.id ?? "invalid"}`);
          if (summary.nextAction) console.log(`NEXT ${summary.nextAction.action} ${summary.nextAction.reason}`);
          if (summary.conflict) {
            console.log(`CONFLICT owner=${summary.conflict.owner}`);
            for (const source of summary.conflict.sources) console.log(`SOURCE ${source.path} ${source.hash}`);
            for (const option of summary.conflict.options) console.log(`OPTION ${option.id} ${option.consequence}`);
            for (const consequence of summary.conflict.consequences) console.log(`CONSEQUENCE ${consequence}`);
          }
          for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`);
          if (plan.planHash) console.log(`Run again with --plan ${plan.planHash} --yes to authorize this workflow update.`);
        }
        return plan.status === "blocked" ? 1 : 0;
      }
      const result = await applyWorkflowItem(cwd, plan, values.plan);
      if (values.json) console.log(JSON.stringify({ plan: summary, result }, null, 2));
      else console.log(`${result.status.toUpperCase()} ${result.message} id=${result.evidence ?? "unknown"}`);
      return result.status === "ok" ? 0 : 1;
    }
    if (values.json) console.log(JSON.stringify({ status: "fail", error: "invalid-workflow-command", message: "Use workflow add --item <json>, workflow resume [--item-id <id>], or workflow resolve --item-id <id> --select <option> --owner <owner> --rationale <text>" }, null, 2));
    else console.error("Usage: downstroke workflow <add|resume|resolve> [--item <json>] [--item-id <id>] [--controlled] [--phase <phase>] [--approved] [--conflict <json>] [--select <option>] [--owner <owner>] [--rationale <text>] [--yes] [--json]");
    return 1;
  }

  if (command === "git") {
    if (positionals[0] !== "auth" || positionals[1] !== "recover" || !values.remote || !values.account || !values["status-code"]) {
      console.error("Usage: downstroke git auth recover --remote <name> --account <username> --status-code <401|403> [--plan <hash> --yes] [--json]");
      return 1;
    }
    const plan = await planGitCredentialRecovery(cwd, values.remote, values.account, Number(values["status-code"]));
    if (!values.yes || values["dry-run"] || plan.status === "blocked") {
      if (values.json) console.log(JSON.stringify(plan, null, 2));
      else {
        console.log(`GIT AUTH RECOVERY ${plan.status} remote=${plan.remote} url=${plan.remoteUrl ?? "unknown"}`);
        if (plan.target) console.log(`TARGET protocol=${plan.target.protocol} host=${plan.target.host} account=${plan.target.account}`);
        for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`);
        if (plan.status === "ready") console.log(`Run again with --plan ${plan.planHash} --yes to remove only this cached credential.`);
      }
      return plan.status === "blocked" ? 1 : 0;
    }
    if (values.plan !== plan.planHash) {
      console.error("Credential recovery requires the exact current --plan hash");
      return 1;
    }
    const result = await applyGitCredentialRecovery(cwd, plan);
    if (values.json) console.log(JSON.stringify({ plan, result }, null, 2));
    else console.log(`${result.status.toUpperCase()} ${result.message}. ${result.remediation}`);
    return result.status === "ok" ? 0 : 1;
  }

  if (command === "git-policy") {
    const allows = values["allow-branch"] || values["allow-commit"] || values["allow-push"];
    if (values.disable && allows) {
      console.error("--disable cannot be combined with --allow-branch, --allow-commit or --allow-push");
      return 1;
    }
    const changing = values.disable || allows;
    let current = null;
    try {
      current = await readGitPolicy(cwd);
    } catch {
      // The plan returns the actionable repository/state blocker.
    }
    const plan = await planGitPolicy(cwd, changing
      ? {
          enabled: !values.disable,
          branch: !values.disable && (values["allow-branch"] || current?.permissions.branch.enabled || false),
          commit: !values.disable && (values["allow-commit"] || current?.permissions.commit.enabled || false),
          push: !values.disable && (values["allow-push"] || current?.permissions.push.enabled || false),
        }
      : {
          enabled: current?.enabled ?? true,
          branch: current?.permissions.branch.enabled ?? false,
          commit: current?.permissions.commit.enabled ?? false,
          push: current?.permissions.push.enabled ?? false,
        });
    if (!changing || !values.yes || values["dry-run"] || plan.status === "blocked") {
      const output = changing ? plan : { current, recommendation: plan.next, ...plan };
      if (values.json) console.log(JSON.stringify(output, null, 2));
      else {
        const printPolicy = (label: string, policy: GitPolicy | null) => {
          console.log(`${label} ${policy ? `enabled=${policy.enabled} revision=${policy.revision} strategy=${policy.strategy}` : "not-configured"}`);
          if (policy) for (const [name, permission] of Object.entries(policy.permissions)) {
            console.log(`PERMISSION ${name} enabled=${permission.enabled} scope=${permission.scope} lifetime=${permission.lifetime} fresh=${permission.requiresFreshAuthorization}`);
          }
        };
        console.log(`GIT POLICY ${plan.status}`);
        console.log(`ROOT ${plan.root} BRANCH ${plan.currentBranch ?? "unavailable"}`);
        console.log(`FILE ${plan.file}`);
        printPolicy(changing ? "NEXT" : "CURRENT", changing ? plan.next : current);
        if (!changing) printPolicy("RECOMMENDATION", plan.next);
        for (const branch of plan.createBranches) console.log(`CREATE BRANCH ${branch}`);
        for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`);
        if (changing && plan.status === "ready") console.log("Run again with --yes to authorize this plan.");
      }
      return plan.status === "blocked" ? 1 : 0;
    }
    const result = await applyGitPolicy(cwd, plan).catch((error: unknown) => ({
      id: "git.policy",
      status: "fail" as const,
      message: error instanceof Error ? error.message : "Git policy apply failed",
      remediation: "Inspect repository state and preview the policy again",
    }));
    if (values.json) console.log(JSON.stringify({ plan, result }, null, 2));
    else console.log(`${result.status.toUpperCase()} ${result.message}`);
    return result.status === "ok" ? 0 : 1;
  }

  if (command === "repo") {
    if (positionals[0] === "doctor") {
      const remote = positionals[1];
      if (!remote || !values.destination) { console.error("Usage: downstroke repo doctor <remote> --destination <path> [--lfs] [--json]"); return 1; }
      const report = await diagnoseRepositoryReadiness(cwd, { remote, destination: values.destination, lfs: values.lfs, install: false });
      if (values.json) console.log(JSON.stringify(report, null, 2));
      else { console.log(`REPOSITORY READINESS ${report.status} provider=${report.provider} protocol=${report.protocol}`); console.log(`DESTINATION ${report.destination} context=${report.contextNamespace}`); console.log(`TOOLS git=${report.tools.git} lfs=${report.tools.lfs} provider=${report.tools.providerCli ?? "none"}`); console.log(`AUTH ${report.authentication}`); for (const blocker of report.blockers) console.log(`BLOCKED ${blocker}`); for (const action of report.nextActions) console.log(`NEXT ${action}`); }
      return report.status === "ready" ? 0 : 1;
    }
    if (positionals[0] === "import") {
      const remote = positionals[1];
      if (!remote || !values.destination || (!values["no-install"] && !values["review-mode"])) {
        console.error("Usage: downstroke repo import <remote> --destination <path> [--branch|--tag|--commit <ref>] [--depth <n>] [--submodules] [--lfs] [--review-mode <mode>|--no-install] [--plan <hash> --yes]");
        return 1;
      }
      const plan = await planHostedRepositoryImport(cwd, { remote, destination: values.destination, ...(values.branch ? { branch: values.branch } : {}), ...(values.tag ? { tag: values.tag } : {}), ...(values.commit ? { commit: values.commit } : {}), ...(values.depth ? { depth: Number(values.depth) } : {}), submodules: values.submodules, lfs: values.lfs, install: !values["no-install"] });
      if (!values.yes || values["dry-run"] || plan.status === "blocked") {
        if (values.json) console.log(JSON.stringify(plan, null, 2));
        else { console.log(`REPOSITORY IMPORT ${plan.status} provider=${plan.provider} engine=${plan.engine}`); console.log(`REMOTE ${plan.remote ?? "invalid"}`); console.log(`DESTINATION ${plan.destination}`); for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`); if (plan.status === "ready") console.log(`Run again with --plan ${plan.planHash} --yes to clone.`); }
        return plan.status === "blocked" ? 1 : 0;
      }
      if (values.plan !== plan.planHash) { console.error("Repository import requires the exact current --plan hash"); return 1; }
      const result = await applyHostedRepositoryImport(cwd, plan);
      if (result.status === "ok" && plan.install) {
        await installFiles(result.destination, liteFiles);
        const cadenceInput = { reviewMode: values["review-mode"] as ReviewMode, ...(values["block-size"] ? { blockSize: Number(values["block-size"]) } : {}), ...(values["sprint-days"] ? { sprintLengthDays: Number(values["sprint-days"]) } : {}), ...(values["capacity-hours"] ? { grossCapacityHoursPerSprint: Number(values["capacity-hours"]) } : {}), ...(values["wip-limit"] ? { wipLimit: Number(values["wip-limit"]) } : {}) };
        const cadence = await planCadenceUpdate(result.destination, cadenceInput);
        if (cadence.status === "ready") await applyCadenceUpdate(result.destination, cadence);
        else return 1;
      }
      if (values.json) console.log(JSON.stringify({ plan, result }, null, 2)); else console.log(`${result.status.toUpperCase()} ${result.message}`);
      return result.status === "ok" ? 0 : 1;
    }
    if (positionals[0] !== "topology") {
      console.error("Usage: downstroke repo topology [--json] | downstroke repo import <remote> --destination <path>");
      return 1;
    }
    if ((values.path?.length ?? 0) > 1) {
      console.error("repo topology accepts at most one --path");
      return 1;
    }
    const report = await inspectRepositoryTopology(values.path?.[0] ? resolve(cwd, values.path[0]) : cwd);
    if (values.json) console.log(JSON.stringify(report, null, 2));
    else {
      console.log(`REPOSITORY TOPOLOGY ${report.status} kind=${report.kind}`);
      for (const repository of report.repositories) {
        console.log(`REPOSITORY ${repository.root} relation=${repository.relation} branch=${repository.branch ?? "detached"} dirty=${repository.dirty}`);
        for (const remote of repository.remotes) console.log(`REMOTE ${repository.root} ${remote.name} fetch=${remote.fetch ?? "none"} push=${remote.push ?? "none"}`);
      }
      for (const blocker of report.blockers) console.log(`BLOCKED ${blocker}`);
    }
    return report.status === "blocked" ? 1 : 0;
  }

  if (command === "publish") {
    let destinations: PublicationDestination[];
    try { destinations = (values["destination-config"] ?? []).map((value) => JSON.parse(value) as PublicationDestination); } catch { console.error("Each --destination-config must be valid JSON"); return 1; }
    const plan = await planPublication(cwd, destinations);
    if (positionals[0] !== "run" || !values.yes || values["dry-run"] || plan.status === "blocked") {
      if (values.json) console.log(JSON.stringify(plan, null, 2));
      else { console.log(`PUBLICATION ${plan.status} head=${plan.head ?? "unknown"} atomic=false`); for (const item of plan.destinations) { console.log(`DESTINATION ${item.name} mode=${item.mode} branch=${item.branch} context=${item.contextNamespace}`); for (const blocker of item.blockers) console.log(`BLOCKED ${item.name}: ${blocker}`); } for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`); if (plan.status === "ready") console.log(`Run publish run with --plan ${plan.planHash}, --authorize-destination for each target, and --yes.`); }
      return plan.status === "blocked" ? 1 : 0;
    }
    if (values.plan !== plan.planHash) { console.error("Publication requires the exact current --plan hash"); return 1; }
    const result = await applyPublication(cwd, plan, values["authorize-destination"] ?? []);
    if (values.json) console.log(JSON.stringify(result, null, 2)); else { console.log(`PUBLICATION ${result.status} atomic=${result.atomic}`); for (const item of result.destinations) console.log(`RESULT ${item.name} ${item.status} old=${item.oldCommit ?? "unknown"} new=${item.newCommit ?? "unknown"} ${item.message}`); }
    return result.status === "ok" ? 0 : 1;
  }

  if (command === "cms") {
    if (positionals[0] === "sync") {
      if (!values.previous || !values.next || !values.instance || !values.project || !values.environment || !values.schema) { console.error("Usage: downstroke cms sync --previous <contract.json> --next <contract.json> --instance <id> --project <id> --environment <id> --schema <name> [--target <orm>...] [--plan <hash> --yes] [--json]"); return 1; }
      try {
        const readContract = async (path: string) => { if (resolve(path) === path || path.split(/[\\/]/).includes("..")) throw new Error("CMS sync contract paths must stay inside the repository"); const full = resolve(cwd, path); let cursor = cwd; for (const part of path.split(/[\\/]/).filter(Boolean)) { cursor = resolve(cursor, part); if ((await lstat(cursor)).isSymbolicLink()) throw new Error("CMS sync contract paths cannot use symbolic links"); } return JSON.parse(await readFile(full, "utf8")); };
        const previous = await readContract(values.previous); const next = await readContract(values.next); const baseHash = canonicalContractHash(previous);
        const plan = planCmsContractSynchronization({ previous, next, instanceId: values.instance, projectId: values.project, environmentId: values.environment, schemaName: values.schema, codeBaseHash: baseHash, cmsBaseHash: baseHash, projectionTargets: values.target ?? [] });
        if (!values.yes || values["dry-run"] || plan.status === "blocked") { if (values.json) console.log(JSON.stringify(plan, null, 2)); else { console.log(`CMS SYNC ${plan.status} compatibility=${plan.diff.compatibility}`); for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`); if (plan.status === "ready") console.log(`Run again with --plan ${plan.planHash} --yes to write owned projections; reviewed SQL remains a separate pre-deploy operation.`); } return plan.status === "blocked" ? 1 : 0; }
        if (values.plan !== plan.planHash) { console.error("CMS sync apply requires the exact current --plan hash"); return 1; }
        const result = await applyCmsContractProjections(cwd, plan, values.plan); if (values.json) console.log(JSON.stringify({ plan, result }, null, 2)); else console.log(`${result.status.toUpperCase()} ${result.message}`); return result.status === "ok" ? 0 : 1;
      } catch (error: unknown) { console.error(error instanceof Error ? error.message : "CMS sync input is invalid"); return 1; }
    }
    if (positionals[0] === "detect") {
      const paths = values.path ?? [];
      if (!values.instance || !values.environment || !paths.length) { console.error("Usage: downstroke cms detect --instance <id> --environment <id> --path <file>... [--plan <hash> --yes] [--json]"); return 1; }
      const plan = await planCmsContentContractScan(cwd, { instanceId: values.instance, environmentId: values.environment, paths });
      if (!values.yes || values["dry-run"]) {
        if (values.json) console.log(JSON.stringify(plan, null, 2)); else { console.log(`CMS DETECT ready proposals=${plan.proposals.length}`); for (const proposal of plan.proposals) console.log(`PROPOSAL ${proposal.sourceFamily} ${proposal.proposalId} confidence=${proposal.confidence} unknown=${proposal.unknownCoverage.length}`); console.log(`Run again with --plan ${plan.planHash} --yes to append proposal evidence.`); }
        return 0;
      }
      if (values.plan !== plan.planHash) { console.error("CMS detect apply requires the exact current --plan hash"); return 1; }
      const result = await recordCmsProposalScan(cwd, { instanceId: values.instance, environmentId: values.environment, paths, expectedProposalIds: plan.proposals.map(({ proposalId }) => proposalId) });
      if (values.json) console.log(JSON.stringify({ plan, result }, null, 2)); else console.log(`OK Recorded ${result.proposals.length} proposals and ${result.drift.length} drift records`);
      return 0;
    }
    if (positionals[0] !== "plan" || !values.config) { console.error("Usage: downstroke cms plan --config <json> [--plan <hash> --yes] [--json]"); return 1; }
    let request: CmsBoundaryRequest; try { request = JSON.parse(values.config) as CmsBoundaryRequest; } catch { console.error("--config must be valid CMS boundary JSON"); return 1; }
    const plan = await planCmsBoundary(cwd, request);
    if (!values.yes || values["dry-run"] || plan.status === "blocked") {
      if (values.json) console.log(JSON.stringify(plan, null, 2));
      else { console.log(`CMS BOUNDARY ${plan.status} action=${plan.action} project=${plan.detected.projectKind}`); console.log(`STACK ${plan.detected.stacks.join(",") || "unknown"}`); if (plan.contract) console.log(`CONTRACT revision=${plan.contract.revision} hash=${plan.contract.sourceHash}`); for (const projection of plan.projections) console.log(`PROJECTION ${projection.target} ${projection.path}`); for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`); if (plan.status === "ready" && request.enabled) console.log(`Run again with --plan ${plan.planHash} --yes to store only the CMS contract.`); }
      return plan.status === "blocked" ? 1 : 0;
    }
    if (values.plan !== plan.planHash) { console.error("CMS boundary apply requires the exact current --plan hash"); return 1; }
    const result = await applyCmsBoundary(cwd, plan, values.plan);
    if (values.json) console.log(JSON.stringify({ plan, result }, null, 2)); else console.log(`${result.status.toUpperCase()} ${result.message}`);
    return result.status === "ok" ? 0 : 1;
  }

  if (command === "design-system") {
    if (positionals[0] === "consumers" || positionals[0] === "validate") {
      const targets = (values.target ?? []) as DesignConsumerTarget[];
      if (positionals[0] === "validate") { const report = await validateDesignConsumers(cwd, targets); if (values.json) console.log(JSON.stringify(report, null, 2)); else { console.log(`CONSUMERS ${report.status}`); for (const finding of report.findings) console.log(`${finding.status.toUpperCase()} ${finding.path}`); console.log(report.guidance); } return report.status === "ok" ? 0 : 1; }
      const plan = await planDesignConsumers(cwd, targets);
      if (!values.yes || values["dry-run"] || plan.status === "blocked") { if (values.json) console.log(JSON.stringify(plan, null, 2)); else { console.log(`CONSUMERS ${plan.status}`); for (const item of plan.projections) console.log(`${item.changed ? "WRITE" : "KEEP"} ${item.path}`); for (const item of plan.removals) console.log(`DELETE ${item.path}`); for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`); if (plan.status === "ready") console.log(`Run again with --plan ${plan.planHash} --yes to generate selected projections.`); } return plan.status === "blocked" ? 1 : 0; }
      if (values.plan !== plan.planHash) { console.error("Consumer apply requires the exact current --plan hash"); return 1; }
      const result = await applyDesignConsumers(cwd, plan, values.plan); if (values.json) console.log(JSON.stringify({ plan, result }, null, 2)); else console.log(`${result.status.toUpperCase()} ${result.message}`); return result.status === "ok" ? 0 : 1;
    }
    if (positionals[0] === "tokens") {
      const plan = await planDesignTokens(cwd, (values.target ?? []) as DesignTokenTarget[]);
      if (!values.yes || values["dry-run"] || plan.status === "blocked") {
        if (values.json) console.log(JSON.stringify(plan, null, 2)); else { console.log(`TOKENS ${plan.status}`); for (const projection of plan.projections) console.log(`${projection.changed ? "WRITE" : "KEEP"} ${projection.path}`); for (const removal of plan.removals) console.log(`DELETE ${removal.path}`); for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`); if (plan.status === "ready") console.log(`Run again with --plan ${plan.planHash} --yes to generate selected projections.`); }
        return plan.status === "blocked" ? 1 : 0;
      }
      if (values.plan !== plan.planHash) { console.error("Token apply requires the exact current --plan hash"); return 1; }
      const result = await applyDesignTokens(cwd, plan, values.plan); if (values.json) console.log(JSON.stringify({ plan, result }, null, 2)); else console.log(`${result.status.toUpperCase()} ${result.message}`); return result.status === "ok" ? 0 : 1;
    }
    if (positionals[0] !== "plan" || !values.config) { console.error("Usage: downstroke design-system plan --config <json> | tokens|consumers|validate --target <target>"); return 1; }
    let request: NeutralDesignRequest; try { request = JSON.parse(values.config) as NeutralDesignRequest; } catch { console.error("--config must be valid design-system JSON"); return 1; }
    const plan = await planNeutralDesignSystem(cwd, request);
    if (!values.yes || values["dry-run"] || plan.status === "blocked") {
      if (values.json) console.log(JSON.stringify(plan, null, 2));
      else { console.log(`DESIGN SYSTEM ${plan.status} action=${plan.action}`); if (plan.source) console.log(`SOURCE revision=${plan.source.revision} hash=${plan.source.sourceHash}`); for (const impact of plan.impacts) console.log(`IMPACT ${impact}`); for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`); if (plan.status === "ready") console.log(`Run again with --plan ${plan.planHash} --yes to store the neutral source.`); }
      return plan.status === "blocked" ? 1 : 0;
    }
    if (values.plan !== plan.planHash) { console.error("Design-system apply requires the exact current --plan hash"); return 1; }
    const result = await applyNeutralDesignSystem(cwd, plan, values.plan);
    if (values.json) console.log(JSON.stringify({ plan, result }, null, 2)); else console.log(`${result.status.toUpperCase()} ${result.message}`);
    return result.status === "ok" ? 0 : 1;
  }

  if (command === "integrate") {
    const provider = positionals[0];
    if (provider !== "codex" && provider !== "claude" && provider !== "cursor") {
      console.error("Usage: downstroke integrate <codex|claude|cursor> [--yes] [--dry-run] [--json]");
      return 1;
    }
    const results = await installFiles(cwd, [agentIntegrationFiles[provider]], !values.yes || values["dry-run"]);
    if (values.json) console.log(JSON.stringify({ status: values.yes && !values["dry-run"] ? "applied" : "preview", provider, results }, null, 2));
    else {
      for (const result of results) console.log(`${result.action.toUpperCase()} ${result.target}`);
      if (!values.yes || values["dry-run"]) console.log("Run again with --yes to authorize this project integration.");
    }
    return 0;
  }

  if (command === "commit") {
    const plan = await planLocalCommit(cwd, values.file ?? [], values.message ?? "");
    if (!values.yes || values["dry-run"] || plan.status === "blocked") {
      if (values.json) console.log(JSON.stringify(plan, null, 2));
      else {
        console.log(`LOCAL COMMIT ${plan.status}`);
        console.log(`ROOT ${plan.root} BRANCH ${plan.branch ?? "unavailable"}`);
        console.log(`MESSAGE ${plan.message || "missing"}`);
        for (const path of plan.changed) console.log(`CHANGED ${path}`);
        for (const path of plan.staged) console.log(`STAGED ${path}`);
        for (const path of plan.selected) console.log(`SELECTED ${path}`);
        for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`);
        if (plan.status === "ready") console.log("Run again with --yes to create this local commit; push remains separate.");
      }
      return plan.status === "blocked" ? 1 : 0;
    }
    const result = await applyLocalCommit(cwd, plan);
    if (values.json) console.log(JSON.stringify({ plan, result }, null, 2));
    else console.log(`${result.status.toUpperCase()} ${result.message}${result.commit ? ` branch=${result.branch} commit=${result.commit}` : ""}`);
    return result.status === "ok" ? 0 : 1;
  }

  console.error("Usage: downstroke <init|doctor|health|cleanup|setup-agents|cadence|communication|simplicity|code|stack|govern|estimate|status|git-policy|commit|release|worker|run|experience|workflow> [options]");
  return 1;
}

if (process.argv[1]?.endsWith("index.js")) {
  if (process.argv[2] === "mcp") await runMcpServer(process.stdin, process.stdout);
  else {
  let close: (() => void) | undefined;
  let question: Question | undefined;
  if (process.stdin.isTTY && process.stdout.isTTY && !process.argv.includes("--json")) {
    const { createInterface } = await import("node:readline/promises");
    const readline = createInterface({ input: process.stdin, output: process.stdout });
    close = () => readline.close();
    question = (prompt) => readline.question(prompt);
  }
  try {
    process.exitCode = await run(process.argv.slice(2), process.cwd(), process.env, question);
  } finally {
    close?.();
  }
  }
}
