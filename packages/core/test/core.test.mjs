import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { applyBreakdownStack, applyCadenceUpdate, diagnoseBreakdownStack, diagnosePlanningCadence, inspectProject, installFiles, planBreakdownStack, planCadenceUpdate, runProjectChecks } from "../dist/index.js";

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

test("Breakdown Stack diagnosis reports local health and versions", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-stack-"));
  await mkdir(join(root, ".codegraph"));
  await mkdir(join(root, "_bmad", "bmm"), { recursive: true });
  await mkdir(join(root, ".agents", "skills", "caveman"), { recursive: true });
  await mkdir(join(root, ".agents", "skills", "ponytail"), { recursive: true });
  await writeFile(join(root, ".codegraph", "codegraph.db"), Buffer.concat([Buffer.from("SQLite format 3\0"), Buffer.alloc(84)]));
  await writeFile(join(root, "_bmad", "bmm", "config.yaml"), "# Version: 6.9.0\n");
  await writeFile(join(root, ".agents", "skills", "caveman", "SKILL.md"), "---\nname: \"caveman\"\n---\nname: wrong-outside-frontmatter\n");
  await writeFile(join(root, ".agents", "skills", "ponytail", "SKILL.md"), "---\nname: ponytail\nversion: 4.8.4\n---\n");

  const results = await diagnoseBreakdownStack(root);

  assert.deepEqual(results.map(({ id, status, version }) => ({ id, status, version })), [
    { id: "codegraph.exists", status: "ok", version: undefined },
    { id: "bmad.exists", status: "ok", version: "6.9.0" },
    { id: "caveman.exists", status: "ok", version: undefined },
    { id: "ponytail.exists", status: "ok", version: "4.8.4" },
  ]);
  assert.ok(results.every((result) => result.evidence && result.remediation));
});

test("Breakdown Stack diagnosis does not treat a CodeGraph directory as a healthy index", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-stack-"));
  await mkdir(join(root, ".codegraph"));
  await mkdir(join(root, "_bmad", "bmm"), { recursive: true });
  await writeFile(join(root, "_bmad", "bmm", "config.yaml"), "project: malformed-version-metadata\n");
  const before = await readdir(root, { recursive: true });

  const results = await diagnoseBreakdownStack(root);
  const codegraph = results.find((result) => result.id === "codegraph.exists");
  const bmad = results.find((result) => result.id === "bmad.exists");

  assert.equal(codegraph?.status, "warn");
  assert.match(codegraph?.message ?? "", /index is missing or invalid/);
  assert.equal(bmad?.status, "warn");
  assert.equal(bmad?.version, undefined);
  assert.deepEqual(await readdir(root, { recursive: true }), before);
});

test("Breakdown Stack diagnosis rejects a fake CodeGraph database and invalid skill identity", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-stack-"));
  await mkdir(join(root, ".codegraph"));
  await mkdir(join(root, ".agents", "skills", "ponytail"), { recursive: true });
  await writeFile(join(root, ".codegraph", "codegraph.db"), "not sqlite");
  await writeFile(join(root, ".agents", "skills", "ponytail", "SKILL.md"), "---\nname: wrong\nversion: 9.9.9\n---\nname: ponytail\n");

  const results = await diagnoseBreakdownStack(root);
  const codegraph = results.find((result) => result.id === "codegraph.exists");
  const ponytail = results.find((result) => result.id === "ponytail.exists");

  assert.equal(codegraph?.status, "warn");
  assert.equal(ponytail?.status, "warn");
  assert.equal(ponytail?.version, undefined);
});

test("Breakdown Stack installation plan is blocked by conflicts and redacts Ponytail configuration", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-stack-plan-"));
  await mkdir(join(root, "scripts"));
  await mkdir(join(root, "_bmad", "bmm"), { recursive: true });
  await writeFile(join(root, "scripts", "bootstrap-agents.ps1"), "Write-Host bootstrap");
  await writeFile(join(root, "_bmad", "bmm", "config.yaml"), "malformed");

  const plan = await planBreakdownStack(root, { PONYTAIL_INSTALL_COMMAND: "secret canonical command" });

  assert.equal(plan.status, "blocked");
  assert.ok(plan.blockers.some((blocker) => blocker.includes("bmad.exists")));
  assert.equal(JSON.stringify(plan).includes("secret canonical command"), false);
  assert.ok(plan.files.every((path) => !path.includes(root)));
});

test("Breakdown Stack apply executes once and verifies all tools", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-stack-apply-"));
  await mkdir(join(root, "scripts"));
  await writeFile(join(root, "scripts", "bootstrap-agents.ps1"), "Write-Host bootstrap");
  const plan = await planBreakdownStack(root, { PONYTAIL_INSTALL_COMMAND: "canonical" });
  let calls = 0;

  const result = await applyBreakdownStack(root, plan, async () => {
    calls += 1;
    await mkdir(join(root, ".codegraph"));
    await mkdir(join(root, "_bmad", "bmm"), { recursive: true });
    await mkdir(join(root, ".agents", "skills", "caveman"), { recursive: true });
    await mkdir(join(root, ".agents", "skills", "ponytail"), { recursive: true });
    await writeFile(join(root, ".codegraph", "codegraph.db"), Buffer.concat([Buffer.from("SQLite format 3\0"), Buffer.alloc(84)]));
    await writeFile(join(root, "_bmad", "bmm", "config.yaml"), "# Version: 6.9.0\n");
    await writeFile(join(root, ".agents", "skills", "caveman", "SKILL.md"), "---\nname: caveman\n---\n");
    await writeFile(join(root, ".agents", "skills", "ponytail", "SKILL.md"), "---\nname: ponytail\n---\n");
    return 0;
  });

  assert.equal(calls, 1);
  assert.equal(result.status, "verified");
  assert.ok(result.results.every(({ status }) => status === "ok"));
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
