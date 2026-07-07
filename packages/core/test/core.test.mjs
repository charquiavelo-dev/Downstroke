import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import { applyCadenceUpdate, applyExperienceFact, applyGitPolicy, diagnoseLegacyAgentStack, diagnosePlanningCadence, estimateTokenUsage, experienceManifest, governDecision, initializeExperience, inspectProject, installFiles, nativeOnlySurfaces, planCadenceUpdate, planExperienceFact, planGitPolicy, readGitPolicy, runProjectChecks, scanNativeOnlySurfaces, tokenUsageStatus } from "../dist/index.js";

const exec = promisify(execFile);
process.env.GIT_CONFIG_NOSYSTEM = "1";
process.env.GIT_CONFIG_GLOBAL = process.platform === "win32" ? "NUL" : "/dev/null";

async function gitFixture() {
  const root = await mkdtemp(join(tmpdir(), "downstroke-git-policy-"));
  await exec("git", ["init", "-b", "main"], { cwd: root });
  await exec("git", ["config", "user.name", "Downstroke Test"], { cwd: root });
  await exec("git", ["config", "user.email", "test@example.invalid"], { cwd: root });
  await writeFile(join(root, "README.md"), "fixture\n");
  await exec("git", ["add", "README.md"], { cwd: root });
  await exec("git", ["commit", "-m", "chore: initialize fixture"], { cwd: root });
  return root;
}

test("copy-if-missing preserves an existing user file", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-"));
  const source = join(root, "source.md");
  const target = join(root, "AGENTS.md");
  await writeFile(source, "framework");
  await writeFile(target, "user");

  const [result] = await installFiles(root, [{ source, target: "AGENTS.md" }]);

  assert.equal(result?.action, "skip");
  assert.equal(await readFile(target, "utf8"), "user");
});

test("dry-run reports creation without writing", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-"));
  const source = join(root, "source.md");
  await writeFile(source, "framework");

  const [result] = await installFiles(root, [{ source, target: "docs/SPEC.md" }], true);

  assert.equal(result?.action, "create");
  await assert.rejects(readFile(join(root, "docs/SPEC.md"), "utf8"));
});

test("inspection distinguishes an AI-assisted implemented React project", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-"));
  await writeFile(join(root, "AGENTS.md"), "rules");
  await writeFile(join(root, "package.json"), JSON.stringify({ dependencies: { react: "19.0.0" }, scripts: { build: "vite build" } }));
  await import("node:fs/promises").then(({ mkdir }) => mkdir(join(root, "src")));

  const result = await inspectProject(root);

  assert.equal(result.stage, "implemented");
  assert.deepEqual(result.stacks, ["Node.js", "React"]);
  assert.match(result.originInference, /cannot be proven/);
});

test("verification stays not-run when the project exposes no checks", async () => {
  const result = await runProjectChecks(process.cwd(), []);
  assert.deepEqual(result, { status: "not-run", checks: [] });
});

test("verification stops on the first failing project check", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-check-"));
  await writeFile(join(root, "package.json"), JSON.stringify({
    scripts: { typecheck: "node -e \"process.exit(1)\"", test: "node -e \"process.exit(0)\"" },
  }));

  const result = await runProjectChecks(root, ["typecheck", "test"]);

  assert.equal(result.status, "failed");
  assert.deepEqual(result.checks, [{ script: "typecheck", exitCode: 1 }]);
});

test("legacy agent stack diagnosis treats artifacts as migration risks", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-stack-"));
  await mkdir(join(root, ".codegraph"));
  await mkdir(join(root, "_bmad", "bmm"), { recursive: true });
  await mkdir(join(root, ".agents", "skills", "caveman"), { recursive: true });
  await mkdir(join(root, ".agents", "skills", "ponytail"), { recursive: true });
  await writeFile(join(root, ".codegraph", "codegraph.db"), Buffer.concat([Buffer.from("SQLite format 3\0"), Buffer.alloc(84)]));
  await writeFile(join(root, "_bmad", "bmm", "config.yaml"), "# Version: 6.9.0\n");
  await writeFile(join(root, ".agents", "skills", "caveman", "SKILL.md"), "---\nname: \"caveman\"\n---\nname: wrong-outside-frontmatter\n");
  await writeFile(join(root, ".agents", "skills", "ponytail", "SKILL.md"), "---\nname: ponytail\nversion: 4.8.4\n---\n");

  const results = await diagnoseLegacyAgentStack(root);

  assert.deepEqual(results.map(({ id, status }) => ({ id, status })), [
    { id: "legacy.code-intel", status: "warn" },
    { id: "legacy.workflow", status: "warn" },
    { id: "legacy.communication", status: "warn" },
    { id: "legacy.simplicity", status: "warn" },
  ]);
  assert.ok(results.every((result) => result.evidence && result.remediation));
  assert.equal(results.some((result) => /install|npx/i.test(result.remediation ?? "")), false);
});

test("legacy absence is healthy and native-only scan rejects contaminated public surfaces", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-native-"));
  assert.ok((await diagnoseLegacyAgentStack(root)).every(({ status }) => status === "ok"));
  for (const path of nativeOnlySurfaces) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), "Downstroke native surface");
  }
  await writeFile(join(root, "README.md"), "Install CodeGraph for every project");
  const failed = await scanNativeOnlySurfaces(root);
  assert.equal(failed.status, "fail");
  assert.deepEqual(failed.files, ["README.md"]);
  await writeFile(join(root, "README.md"), "Downstroke uses native project intelligence.");
  assert.equal((await scanNativeOnlySurfaces(root)).status, "ok");
  await rm(join(root, "README.md"));
  assert.deepEqual((await scanNativeOnlySurfaces(root)).files, ["README.md"]);
});

test("legacy diagnosis fails closed when the project root cannot be inspected", async () => {
  assert.ok((await diagnoseLegacyAgentStack("\0")).every(({ status }) => status === "fail"));
});

test("inspection recognizes renamed legacy workflow signals", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-legacy-origin-"));
  await mkdir(join(root, "_bmad"));
  assert.match((await inspectProject(root)).originInference, /cannot be proven/);
});

test("cadence planning validates mode-specific fields without mutation", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cadence-"));
  const plan = await planCadenceUpdate(root, { reviewMode: "sprint" });

  assert.equal(plan.status, "blocked");
  assert.deepEqual(plan.blockers, ["sprintLengthDays must be a positive integer", "grossCapacityHoursPerSprint must be a positive integer", "wipLimit must be a positive integer"]);
  await assert.rejects(readFile(join(root, ".downstroke", "planning.json")));
});

test("cadence planning blocks malformed existing state instead of overwriting it", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cadence-"));
  await mkdir(join(root, ".downstroke"));
  await writeFile(join(root, ".downstroke", "planning.json"), '{"reviewMode":"sprint"}');

  const plan = await planCadenceUpdate(root, { reviewMode: "one-at-a-time" });

  assert.equal(plan.status, "blocked");
  assert.ok(plan.blockers.includes("Planning cadence is malformed"));
});

test("authorized cadence update synchronizes state and SPEC while preserving unrelated content", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cadence-"));
  await mkdir(join(root, "docs"));
  await writeFile(join(root, "docs", "SPEC.md"), "# Product\n\n## BMAD Governance\n\n- Review mode: `one-at-a-time`\n- Block size when applicable: `not-applicable`\n- Sprint length: `not-applicable`\n- Gross capacity: `not-applicable`\n- WIP limit: `not-applicable`\n- High-risk review: `individual`\n\n## Kept\n\nDo not change.\n");
  const plan = await planCadenceUpdate(root, {
    reviewMode: "sprint",
    sprintLengthDays: 15,
    grossCapacityHoursPerSprint: 120,
    wipLimit: 3,
  });

  const result = await applyCadenceUpdate(root, plan);

  assert.equal(result.status, "ok");
  assert.equal(JSON.parse(await readFile(join(root, ".downstroke", "planning.json"), "utf8")).reviewMode, "sprint");
  const spec = await readFile(join(root, "docs", "SPEC.md"), "utf8");
  assert.match(spec, /Review mode: `sprint`/);
  assert.match(spec, /Do not change\./);
  assert.equal((await diagnosePlanningCadence(root)).status, "ok");
  await writeFile(join(root, ".downstroke", "planning.json"), (await readFile(join(root, ".downstroke", "planning.json",), "utf8")).replace('"wipLimit": 3', '"wipLimit": 4'));
  assert.equal((await diagnosePlanningCadence(root)).status, "fail");
});

test("decision governance requires explicit contextual selection and reports fixed responsibilities", () => {
  const proposal = {
    kind: "contextual",
    mutates: true,
    options: [
      { id: "a", rationale: "Smallest change", tradeoffs: ["Less flexibility"], artifacts: ["docs/SPEC.md"] },
      { id: "b", rationale: "More configurable", tradeoffs: ["More code"], artifacts: ["packages/core/src/index.ts"] },
    ],
  };

  const pending = governDecision(proposal);
  const approved = governDecision({ ...proposal, selectedOption: "a" });

  assert.equal(pending.status, "needs-input");
  assert.deepEqual(pending.questions, ["Which declared option do you approve?"]);
  assert.equal(approved.status, "approved");
  assert.equal(approved.selectedOption, "a");
  assert.deepEqual(approved.responsibilities, { user: "approves", llm: "advises", cli: "executes", repository: "records", provider: "applies infrastructure" });
});

test("high-risk governance asks only for missing boundary context", () => {
  const result = governDecision({ kind: "high-risk", mutates: true, scope: "production database", owner: "platform" });
  assert.deepEqual(result.questions, ["Which environment is affected?", "What is the material risk?", "What is the rollback plan?"]);
});

test("token estimation is bounded, repository-relative and separates observed usage", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-tokens-"));
  await writeFile(join(root, "task.md"), "a".repeat(300));
  const estimate = await estimateTokenUsage(root, "task", ["task.md"]);
  assert.deepEqual(estimate.range, { low: 60, high: 100 });
  assert.equal(tokenUsageStatus(estimate).consumedTokens, "unavailable");
  assert.equal(tokenUsageStatus(estimate, 42).consumedTokens, 42);
  await assert.rejects(estimateTokenUsage(root, "task", ["../outside.md"]), /outside|OUTSIDE_ROOT|not found/i);
});

test("git policy previews and applies repository-scoped permissions without push", async () => {
  const root = await gitFixture();
  const plan = await planGitPolicy(root, { enabled: true, branch: true, commit: true, push: false });

  assert.equal(plan.status, "ready");
  assert.equal(plan.root, ".");
  assert.deepEqual(plan.createBranches, ["develop"]);
  assert.equal(plan.next.permissions.push.enabled, false);
  assert.equal(plan.next.permissions.push.requiresFreshAuthorization, true);
  await assert.rejects(readFile(join(root, ".downstroke", "git-policy.json")));

  const result = await applyGitPolicy(root, plan);
  assert.equal(result.status, "ok");
  assert.deepEqual(await readGitPolicy(root), plan.next);
  assert.match((await exec("git", ["branch", "--list", "develop"], { cwd: root })).stdout, /develop/);
  assert.equal((await exec("git", ["remote"], { cwd: root })).stdout, "");

  const rerun = await planGitPolicy(root, { enabled: true, branch: true, commit: true, push: false });
  assert.deepEqual(rerun.createBranches, []);
  assert.equal((await applyGitPolicy(root, rerun)).status, "ok");
});

test("git policy blocks non-git directories and malformed state", async () => {
  const outside = await mkdtemp(join(tmpdir(), "downstroke-not-git-"));
  assert.equal((await planGitPolicy(outside, { enabled: true, branch: true, commit: false, push: false })).status, "blocked");

  const root = await gitFixture();
  await mkdir(join(root, ".downstroke"));
  await writeFile(join(root, ".downstroke", "git-policy.json"), "{}");
  const plan = await planGitPolicy(root, { enabled: false, branch: false, commit: false, push: false });
  assert.equal(plan.status, "blocked");
  assert.match(plan.blockers.join(" "), /malformed/i);
});

test("git policy rejects stale or manipulated plans and disables without changing history", async () => {
  const root = await gitFixture();
  const plan = await planGitPolicy(root, { enabled: true, branch: true, commit: true, push: false });
  assert.equal((await applyGitPolicy(root, { ...plan, createBranches: ["main;push"] })).status, "fail");
  assert.equal((await applyGitPolicy(root, { ...plan, next: { ...plan.next, revision: 99 } })).status, "fail");
  assert.equal((await applyGitPolicy(root, { ...plan, next: { ...plan.next, token: "secret" } })).status, "fail");

  await exec("git", ["switch", "-c", "feature/review"], { cwd: root });
  assert.equal((await applyGitPolicy(root, plan)).status, "fail");
  await exec("git", ["switch", "main"], { cwd: root });

  await writeFile(join(root, "next.md"), "next\n");
  await exec("git", ["add", "next.md"], { cwd: root });
  await exec("git", ["commit", "-m", "chore: advance fixture"], { cwd: root });
  assert.equal((await applyGitPolicy(root, plan)).status, "fail");

  const before = (await exec("git", ["rev-list", "--count", "HEAD"], { cwd: root })).stdout.trim();
  const disabled = await planGitPolicy(root, { enabled: false, branch: false, commit: false, push: false });
  assert.equal((await applyGitPolicy(root, disabled)).status, "ok");
  assert.equal((await readGitPolicy(root)).enabled, false);
  assert.equal((await exec("git", ["rev-list", "--count", "HEAD"], { cwd: root })).stdout.trim(), before);
});

test("git policy blocks unborn and detached repositories plus base-ref drift", async () => {
  const unborn = await mkdtemp(join(tmpdir(), "downstroke-unborn-"));
  await exec("git", ["init", "-b", "main"], { cwd: unborn });
  assert.equal((await planGitPolicy(unborn, { enabled: true, branch: true, commit: false, push: false })).status, "blocked");

  const detached = await gitFixture();
  await exec("git", ["checkout", "--detach"], { cwd: detached });
  assert.equal((await planGitPolicy(detached, { enabled: true, branch: true, commit: false, push: false })).status, "blocked");

  const drifted = await gitFixture();
  const plan = await planGitPolicy(drifted, { enabled: true, branch: true, commit: false, push: false });
  await exec("git", ["branch", "develop"], { cwd: drifted });
  assert.equal((await applyGitPolicy(drifted, plan)).status, "fail");
});

test("concurrent Git policy applies cannot both commit the same revision", async () => {
  const root = await gitFixture();
  const plan = await planGitPolicy(root, { enabled: false, branch: false, commit: false, push: false });
  const results = await Promise.all([applyGitPolicy(root, plan), applyGitPolicy(root, plan)]);
  assert.equal(results.filter(({ status }) => status === "ok").length, 1);
});

test("Git policy returns a structured failure when the repository disappears after preview", async () => {
  const root = await gitFixture();
  const plan = await planGitPolicy(root, { enabled: true, branch: true, commit: false, push: false });
  await rename(join(root, ".git"), join(root, ".git-gone"));
  const result = await applyGitPolicy(root, plan);
  assert.equal(result.status, "fail");
  assert.match(result.message, /repository/i);
});

test("experience initialization is local, secure and idempotent", async () => {
  const root = await gitFixture();
  const first = await initializeExperience(root);
  assert.equal(first.status, "ok");
  assert.equal(first.actions.filter(({ action }) => action === "create").length, 7);
  assert.deepEqual(JSON.parse(await readFile(join(root, ".downstroke", "experience", "manifest.json"), "utf8")), experienceManifest);
  const second = await initializeExperience(root);
  assert.equal(second.status, "ok");
  assert.ok(second.actions.every(({ action }) => action === "skip"));

  await writeFile(join(root, ".downstroke", "experience", "manifest.json"), "{}");
  assert.equal((await initializeExperience(root)).status, "fail");
});

test("experience facts require provenance and cannot launder generated output into verified truth", async () => {
  const root = await gitFixture();
  await initializeExperience(root);
  const fact = {
    id: "fact.stack.node",
    kind: "stack",
    scope: "repo",
    status: "verified",
    value: { runtime: "node" },
    source: { type: "llm-output" },
    confidence: 1,
    createdAt: "2026-07-07T00:00:00.000Z",
    updatedAt: "2026-07-07T00:00:00.000Z",
    evidence: { type: "build_report", ref: "evidence.build" },
    security: { trustLevel: "generated", secretScan: "passed", injectionScan: "passed" },
  };
  assert.equal((await planExperienceFact(root, fact)).status, "blocked");

  const observed = { ...fact, status: "observed", evidence: undefined };
  const plan = await planExperienceFact(root, observed);
  assert.equal(plan.status, "ready");
  assert.equal((await applyExperienceFact(root, plan)).status, "ok");
  assert.equal((await planExperienceFact(root, observed)).action, "skip");
  assert.deepEqual(JSON.parse(await readFile(join(root, ".downstroke", "experience", "indexes", "facts-by-id.json"), "utf8")), { "fact.stack.node": 1 });
});

test("experience fact previews do not initialize storage and verified facts require sanitized matching evidence", async () => {
  const root = await gitFixture();
  const fact = {
    id: "fact.qa.build", kind: "qa", scope: "repo", status: "verified", value: { passed: true },
    source: { type: "manifest", path: "package.json" }, confidence: 1,
    createdAt: "2026-07-07T00:00:00.000Z", updatedAt: "2026-07-07T00:00:00.000Z",
    evidence: { type: "build_report", ref: "evidence.build" },
    security: { trustLevel: "project", secretScan: "passed", injectionScan: "passed" },
  };
  assert.equal((await planExperienceFact(root, fact)).status, "blocked");
  await assert.rejects(readFile(join(root, ".downstroke", "experience", "manifest.json")));
  await initializeExperience(root);
  await writeFile(join(root, ".downstroke", "experience", "evidence.jsonl"), `${JSON.stringify({ id: "evidence.build", type: "build_report", result: { status: "passed" }, security: { sanitized: true, containsSecrets: false, secretScan: "passed" } })}\n`);
  assert.equal((await planExperienceFact(root, fact)).status, "ready");
  assert.equal((await planExperienceFact(root, { ...fact, evidence: { type: "manual_approval", ref: "evidence.build" } })).status, "blocked");
});
