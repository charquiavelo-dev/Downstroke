import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import { run } from "../dist/index.js";

const exec = promisify(execFile);
process.env.GIT_CONFIG_NOSYSTEM = "1";
process.env.GIT_CONFIG_GLOBAL = process.platform === "win32" ? "NUL" : "/dev/null";

test("lite init creates its canonical documents", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-"));
  assert.equal(await run(["init", "--preset", "lite"], root), 0);
  assert.match(await readFile(join(root, "docs", "process", "downstroke-workflow.md"), "utf8"), /Downstroke Workflow/);
  await assert.rejects(readFile(join(root, "docs", "process", "bmad-method.md")));
  const generated = await Promise.all([
    "AGENTS.md",
    "CLAUDE.md",
    "docs/SPEC.md",
    "docs/process/downstroke-workflow.md",
  ].map((path) => readFile(join(root, ...path.split("/")), "utf8")));
  assert.equal(/codegraph|bmad|caveman|ponytail|breakdown stack|bootstrap-agents/i.test(generated.join("\n")), false);
  assert.equal(await run(["doctor", "--json"], root), 0);
});

test("empty CLI entry shows native help without mutation", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-help-"));
  const output = [];
  const originalLog = console.log;
  console.log = (value) => output.push(String(value));
  try {
    assert.equal(await run([], root), 0);
  } finally { console.log = originalLog; }
  assert.match(output.join("\n"), /Downstroke/);
  assert.match(output.join("\n"), /downstroke init --preset lite/);
  assert.deepEqual(await readdir(root), []);
});

test("doctor JSON reports legacy artifacts as migration risks", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-"));
  await mkdir(join(root, "docs"));
  await mkdir(join(root, ".codegraph"));
  await mkdir(join(root, "_bmad", "bmm"), { recursive: true });
  await mkdir(join(root, ".agents", "skills", "caveman"), { recursive: true });
  await mkdir(join(root, ".agents", "skills", "ponytail"), { recursive: true });
  await writeFile(join(root, "AGENTS.md"), "rules");
  await writeFile(join(root, "docs", "SPEC.md"), "spec");
  await writeFile(join(root, ".codegraph", "codegraph.db"), Buffer.concat([Buffer.from("SQLite format 3\0"), Buffer.alloc(84)]));
  await writeFile(join(root, "_bmad", "bmm", "config.yaml"), "# Version: 6.9.0\n");
  await writeFile(join(root, ".agents", "skills", "caveman", "SKILL.md"), "---\nname: caveman\n---\n");
  await writeFile(join(root, ".agents", "skills", "ponytail", "SKILL.md"), "---\nname: ponytail\n---\n");
  const output = [];
  const originalLog = console.log;
  console.log = (value) => output.push(String(value));

  try {
    assert.equal(await run(["doctor", "--json"], root), 0);
  } finally {
    console.log = originalLog;
  }

  const report = JSON.parse(output.join("\n"));
  assert.deepEqual(Object.keys(report), ["inspection", "verification", "results"]);
  const workflow = report.results.find((result) => result.id === "legacy.workflow");
  assert.equal(workflow.status, "warn");
  assert.equal(/install/i.test(workflow.remediation), false);
  assert.equal(JSON.stringify(report).includes(root), false);
});

test("setup-agents is a deterministic deprecated no-op", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-"));
  await mkdir(join(root, "scripts"));
  await writeFile(join(root, "scripts", "bootstrap-agents.ps1"), "Write-Host bootstrap");
  const output = [];
  const originalLog = console.log;
  console.log = (value) => output.push(String(value));

  try {
    assert.equal(await run(["setup-agents", "--json"], root, { PONYTAIL_INSTALL_COMMAND: "secret" }), 0);
  } finally {
    console.log = originalLog;
  }

  const plan = JSON.parse(output.join("\n"));
  assert.equal(plan.status, "deprecated");
  assert.deepEqual(plan.mutations, []);
  assert.equal(JSON.stringify(plan).includes("secret"), false);
  await assert.rejects(readFile(join(root, ".codegraph", "codegraph.db")));
});

test("cadence query exposes English choices without mutation", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-"));
  const output = [];
  const originalLog = console.log;
  console.log = (value) => output.push(String(value));

  try {
    assert.equal(await run(["cadence", "--json"], root), 0);
  } finally {
    console.log = originalLog;
  }

  const query = JSON.parse(output.join("\n"));
  assert.deepEqual(query.choices, ["one-at-a-time", "blocks", "sprint", "final-draft"]);
  await assert.rejects(readFile(join(root, ".downstroke", "planning.json")));
});

test("govern reports deterministic responsibility without filesystem mutation", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-"));
  const output = [];
  const originalLog = console.log;
  console.log = (value) => output.push(String(value));

  try {
    assert.equal(await run(["govern", "--kind", "deterministic", "--json"], root), 0);
  } finally {
    console.log = originalLog;
  }

  const result = JSON.parse(output.join("\n"));
  assert.equal(result.status, "ready");
  assert.equal(result.responsibilities.llm, "advises");
  assert.deepEqual(await readdir(root), []);
});

test("status separates unavailable consumption from projected tokens", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-"));
  await writeFile(join(root, "task.md"), "a".repeat(30));
  const output = [];
  const originalLog = console.log;
  console.log = (value) => output.push(String(value));
  try {
    assert.equal(await run(["status", "--scope", "task", "--path", "task.md", "--json"], root), 0);
  } finally {
    console.log = originalLog;
  }
  const status = JSON.parse(output.join("\n"));
  assert.equal(status.consumedTokens, "unavailable");
  assert.deepEqual(status.projectedRemainingTokens, { low: 6, high: 10 });
});

test("git-policy JSON previews without mutation and applies only with authorization", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-git-policy-"));
  await exec("git", ["init", "-b", "main"], { cwd: root });
  await exec("git", ["config", "user.name", "Downstroke Test"], { cwd: root });
  await exec("git", ["config", "user.email", "test@example.invalid"], { cwd: root });
  await writeFile(join(root, "README.md"), "fixture\n");
  await exec("git", ["add", "README.md"], { cwd: root });
  await exec("git", ["commit", "-m", "chore: initialize fixture"], { cwd: root });
  const output = [];
  const originalLog = console.log;
  console.log = (value) => output.push(String(value));
  try {
    assert.equal(await run(["git-policy", "--allow-branch", "--allow-commit", "--json"], root), 0);
  } finally {
    console.log = originalLog;
  }
  const preview = JSON.parse(output.join("\n"));
  assert.equal(preview.status, "ready");
  assert.deepEqual(preview.createBranches, ["develop"]);
  assert.equal(JSON.stringify(preview).includes(root), false);
  await assert.rejects(readFile(join(root, ".downstroke", "git-policy.json")));

  assert.equal(await run(["git-policy", "--allow-branch", "--allow-commit", "--yes"], root), 0);
  assert.equal(JSON.parse(await readFile(join(root, ".downstroke", "git-policy.json"), "utf8")).permissions.push.enabled, false);

  assert.equal(await run(["git-policy", "--allow-push", "--yes"], root), 0);
  const updated = JSON.parse(await readFile(join(root, ".downstroke", "git-policy.json"), "utf8"));
  assert.equal(updated.permissions.branch.enabled, true);
  assert.equal(updated.permissions.commit.enabled, true);
  assert.equal(updated.permissions.push.enabled, true);
  assert.equal(await run(["git-policy", "--disable", "--allow-commit"], root), 1);
});

test("git-policy human output shows the policy and each permission", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-git-policy-human-"));
  await exec("git", ["init", "-b", "main"], { cwd: root });
  await exec("git", ["config", "user.name", "Downstroke Test"], { cwd: root });
  await exec("git", ["config", "user.email", "test@example.invalid"], { cwd: root });
  await writeFile(join(root, "README.md"), "fixture\n");
  await exec("git", ["add", "README.md"], { cwd: root });
  await exec("git", ["commit", "-m", "chore: initialize fixture"], { cwd: root });
  const output = [];
  const originalLog = console.log;
  console.log = (value) => output.push(String(value));
  try {
    assert.equal(await run(["git-policy", "--allow-commit"], root), 0);
  } finally {
    console.log = originalLog;
  }
  assert.match(output.join("\n"), /NEXT enabled=true/);
  assert.match(output.join("\n"), /PERMISSION branch/);
  assert.match(output.join("\n"), /PERMISSION commit enabled=true/);
  assert.match(output.join("\n"), /PERMISSION push/);
});

test("experience init and authorized fact writes stay repository-local and secret-free", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-experience-"));
  await exec("git", ["init", "-b", "main"], { cwd: root });
  await exec("git", ["config", "user.name", "Downstroke Test"], { cwd: root });
  await exec("git", ["config", "user.email", "test@example.invalid"], { cwd: root });
  await writeFile(join(root, "README.md"), "fixture\n");
  await exec("git", ["add", "README.md"], { cwd: root });
  await exec("git", ["commit", "-m", "chore: initialize fixture"], { cwd: root });
  assert.equal(await run(["experience", "init", "--json"], root), 0);
  const fact = JSON.stringify({
    id: "fact.repo.ready", kind: "repo", scope: "repo", status: "observed", value: "private-value",
    source: { type: "manifest", path: "package.json" }, confidence: 0.9,
    createdAt: "2026-07-07T00:00:00.000Z", updatedAt: "2026-07-07T00:00:00.000Z",
    security: { trustLevel: "project", secretScan: "passed", injectionScan: "passed" },
  });
  const output = [];
  const originalLog = console.log;
  console.log = (value) => output.push(String(value));
  try {
    assert.equal(await run(["experience", "add", "--fact", fact, "--json"], root), 0);
  } finally { console.log = originalLog; }
  assert.equal(output.join("\n").includes("private-value"), false);
  assert.equal(await run(["experience", "add", "--fact", fact, "--yes"], root), 0);
  assert.match(await readFile(join(root, ".downstroke", "experience", "facts.jsonl"), "utf8"), /fact\.repo\.ready/);
});

test("experience dry-run and JSON errors remain read-only and machine-readable", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-experience-dry-"));
  await exec("git", ["init", "-b", "main"], { cwd: root });
  await writeFile(join(root, "README.md"), "fixture\n");
  await exec("git", ["add", "README.md"], { cwd: root });
  await exec("git", ["-c", "user.name=Downstroke Test", "-c", "user.email=test@example.invalid", "commit", "-m", "chore: initialize fixture"], { cwd: root });
  assert.equal(await run(["experience", "init", "--dry-run", "--json"], root), 0);
  await assert.rejects(readFile(join(root, ".downstroke", "experience", "manifest.json")));
  const output = [];
  const originalLog = console.log;
  console.log = (value) => output.push(String(value));
  try { assert.equal(await run(["experience", "add", "--fact", "{", "--json"], root), 1); }
  finally { console.log = originalLog; }
  assert.deepEqual(JSON.parse(output.join("\n")), { status: "fail", error: "invalid-fact-json", message: "--fact must be valid JSON" });
  assert.equal(output.join("\n").includes(root), false);
});

test("experience import previews payload-free metadata and writes only with authorization", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-import-"));
  await exec("git", ["init", "-b", "main"], { cwd: root });
  await writeFile(join(root, "README.md"), "# Requirements\nPRIVATE_PAYLOAD must remain hidden.\n");
  await exec("git", ["add", "README.md"], { cwd: root });
  await exec("git", ["-c", "user.name=Downstroke Test", "-c", "user.email=test@example.invalid", "commit", "-m", "chore: initialize fixture"], { cwd: root });
  assert.equal(await run(["experience", "init"], root), 0);
  const output = [];
  const originalLog = console.log;
  console.log = (value) => output.push(String(value));
  try { assert.equal(await run(["experience", "import", "--path", "README.md", "--json"], root), 0); }
  finally { console.log = originalLog; }
  const preview = output.join("\n");
  assert.equal(preview.includes("PRIVATE_PAYLOAD"), false);
  assert.equal(preview.includes(root), false);
  assert.equal(await readFile(join(root, ".downstroke", "experience", "facts.jsonl"), "utf8"), "");
  assert.equal(await run(["experience", "import", "--path", "README.md", "--yes"], root), 0);
  assert.match(await readFile(join(root, ".downstroke", "experience", "facts.jsonl"), "utf8"), /README\.md/);
});

test("experience import retains authorized conflict candidates and pauses", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-import-conflict-"));
  await exec("git", ["init", "-b", "main"], { cwd: root });
  await writeFile(join(root, "local.md"), "# Rule\nclaim: storage=local\n");
  await writeFile(join(root, "remote.md"), "# Rule\nclaim: storage=remote\n");
  await exec("git", ["add", "."], { cwd: root });
  await exec("git", ["-c", "user.name=Downstroke Test", "-c", "user.email=test@example.invalid", "commit", "-m", "chore: initialize fixture"], { cwd: root });
  await run(["experience", "init"], root);
  assert.equal(await run(["experience", "import", "--path", "local.md", "--path", "remote.md", "--yes"], root), 1);
  assert.equal((await readFile(join(root, ".downstroke", "experience", "facts.jsonl"), "utf8")).trim().split("\n").length, 2);
});

test("workflow add previews and applies native workflow items", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-workflow-"));
  await exec("git", ["init", "-b", "main"], { cwd: root });
  await writeFile(join(root, "README.md"), "fixture\n");
  await exec("git", ["add", "README.md"], { cwd: root });
  await exec("git", ["-c", "user.name=Downstroke Test", "-c", "user.email=test@example.invalid", "commit", "-m", "chore: initialize fixture"], { cwd: root });
  const item = JSON.stringify({ id: "story.9.4", type: "story", title: "Native workflows", status: "ready-for-dev", risk: "high" });
  const output = [];
  const originalLog = console.log;
  console.log = (value) => output.push(String(value));
  try {
    assert.equal(await run(["workflow", "add", "--item", item, "--json"], root), 0);
  } finally { console.log = originalLog; }
  const preview = JSON.parse(output.join("\n"));
  assert.equal(preview.status, "ready");
  assert.equal(preview.item.review, "individual");
  await assert.rejects(readFile(join(root, ".downstroke", "workflows", "items.jsonl")));

  assert.equal(await run(["workflow", "add", "--item", item, "--yes"], root), 0);
  assert.equal(await run(["workflow", "add", "--item", item, "--yes"], root), 0);
  assert.match(await readFile(join(root, ".downstroke", "workflows", "items.jsonl"), "utf8"), /story\.9\.4/);
  assert.equal((await readFile(join(root, ".downstroke", "workflows", "items.jsonl"), "utf8")).trim().split("\n").length, 1);
});

test("workflow resume reports controlled checkpoints and conflicts", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-workflow-resume-"));
  await exec("git", ["init", "-b", "main"], { cwd: root });
  await writeFile(join(root, "README.md"), "fixture\n");
  await exec("git", ["add", "README.md"], { cwd: root });
  await exec("git", ["-c", "user.name=Downstroke Test", "-c", "user.email=test@example.invalid", "commit", "-m", "chore: initialize fixture"], { cwd: root });
  const item = JSON.stringify({ id: "story.controlled", type: "story", title: "Controlled story", status: "ready-for-dev" });
  assert.equal(await run(["workflow", "add", "--item", item, "--controlled", "--phase", "plan", "--yes"], root), 0);

  const output = [];
  const originalLog = console.log;
  console.log = (value) => output.push(String(value));
  try {
    assert.equal(await run(["workflow", "resume", "--item-id", "story.controlled", "--json"], root), 0);
  } finally { console.log = originalLog; }
  assert.equal(JSON.parse(output.join("\n")).action, "approve-plan");

  const conflict = JSON.stringify({
    owner: "maintainer",
    sources: [{ path: "a.md", hash: "a".repeat(64) }, { path: "b.md", hash: "b".repeat(64) }],
    options: [{ id: "a", consequence: "Keep A" }, { id: "b", consequence: "Keep B" }],
    consequences: ["Pause"],
  });
  assert.equal(await run(["workflow", "add", "--item", JSON.stringify({ id: "story.conflict", type: "story", title: "Conflict", status: "blocked" }), "--conflict", conflict, "--yes"], root), 1);
  const humanOutput = [];
  console.log = (value) => humanOutput.push(String(value));
  try {
    assert.equal(await run(["workflow", "add", "--item", JSON.stringify({ id: "story.conflict2", type: "story", title: "Conflict", status: "blocked" }), "--conflict", conflict], root), 1);
  } finally { console.log = originalLog; }
  assert.match(humanOutput.join("\n"), /SOURCE a\.md/);
  assert.match(humanOutput.join("\n"), /OPTION a Keep A/);
  assert.match(humanOutput.join("\n"), /CONSEQUENCE Pause/);
  const conflictOutput = [];
  console.log = (value) => conflictOutput.push(String(value));
  try {
    assert.equal(await run(["workflow", "resume", "--item-id", "story.conflict", "--json"], root), 1);
  } finally { console.log = originalLog; }
  assert.equal(JSON.parse(conflictOutput.join("\n")).action, "resolve-conflict");
  assert.equal(await run(["workflow", "resolve", "--item-id", "story.conflict", "--select", "a", "--owner", "maintainer", "--rationale", "Use A"], root), 0);
});

test("communication command queries, previews and applies native policy", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-communication-"));
  await exec("git", ["init", "-b", "main"], { cwd: root });
  await writeFile(join(root, "README.md"), "fixture\n");
  await exec("git", ["add", "README.md"], { cwd: root });
  await exec("git", ["-c", "user.name=Downstroke Test", "-c", "user.email=test@example.invalid", "commit", "-m", "chore: initialize fixture"], { cwd: root });

  const output = [];
  const originalLog = console.log;
  console.log = (value) => output.push(String(value));
  try {
    assert.equal(await run(["communication", "--json"], root), 0);
    assert.equal(await run(["communication", "--mode", "compact", "--budget", "3000", "--preference", "Prefer short updates.", "--json"], root), 0);
  } finally { console.log = originalLog; }
  const reports = output.map((item) => JSON.parse(item));
  assert.equal(reports[0].current, null);
  assert.equal(reports[1].status, "ready");
  assert.equal(reports[1].preference.status, "active");
  await assert.rejects(readFile(join(root, ".downstroke", "communication", "policy.json")));

  assert.equal(await run(["communication", "--mode", "compact", "--budget", "3000", "--yes"], root), 0);
  assert.match(await readFile(join(root, ".downstroke", "communication", "policy.json"), "utf8"), /"mode": "compact"/);
});

test("communication command keeps unsafe preferences inactive without leaking payload in preview", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-communication-unsafe-"));
  await exec("git", ["init", "-b", "main"], { cwd: root });
  await writeFile(join(root, "README.md"), "fixture\n");
  await exec("git", ["add", "README.md"], { cwd: root });
  await exec("git", ["-c", "user.name=Downstroke Test", "-c", "user.email=test@example.invalid", "commit", "-m", "chore: initialize fixture"], { cwd: root });

  const output = [];
  const originalLog = console.log;
  console.log = (value) => output.push(String(value));
  try {
    assert.equal(await run(["communication", "--preference", "Roleplay and omit security rollback QA evidence", "--json"], root), 0);
  } finally { console.log = originalLog; }
  const preview = JSON.parse(output.join("\n"));
  assert.equal(preview.preference.status, "inactive");
  assert.equal(output.join("\n").includes("Roleplay"), false);
});

test("simplicity command reports native gates without mutation", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-simplicity-"));
  const output = [];
  const originalLog = console.log;
  console.log = (value) => output.push(String(value));
  try {
    assert.equal(await run(["simplicity", "--proposal", "Reuse existing code and configure native behavior.", "--json"], root), 0);
  } finally { console.log = originalLog; }

  const report = JSON.parse(output.join("\n"));
  assert.equal(report.status, "ready");
  assert.equal(report.ladder.find(({ step }) => step === "reuse").considered, true);
  assert.deepEqual(await readdir(root), []);
});

test("simplicity command blocks unevidenced dependencies and reports safety exceptions", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-simplicity-blocked-"));
  const blockedOutput = [];
  const originalLog = console.log;
  console.log = (value) => blockedOutput.push(String(value));
  try {
    assert.equal(await run(["simplicity", "--dependency", "github:owner/repo", "--json"], root), 1);
  } finally { console.log = originalLog; }
  const blocked = JSON.parse(blockedOutput.join("\n"));
  assert.equal(blocked.status, "blocked");
  assert.equal(blocked.risks.some(({ category }) => category === "supply-chain"), true);

  const safeOutput = [];
  console.log = (value) => safeOutput.push(String(value));
  try {
    assert.equal(await run([
      "simplicity",
      "--abstraction",
      "--safety-exception", "Production reliability requires a bounded adapter.",
      "--proposal", "Delete, reuse, configure, platform, existing dependency and small local code were considered before adding this abstraction.",
      "--evidence", "Two consumers share the same reliability path.",
      "--consumers", "cli",
      "--consumers", "core",
      "--impact", "Validation path only.",
      "--owner", "platform",
      "--tests", "core unit",
      "--rollback", "Inline adapter if no longer needed.",
      "--json",
    ], root), 0);
  } finally { console.log = originalLog; }
  const safe = JSON.parse(safeOutput.join("\n"));
  assert.equal(safe.exception.active, true);
  assert.equal(safe.status, "ready");
});

test("simplicity command human output reports blocked gates", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-simplicity-human-"));
  const output = [];
  const originalLog = console.log;
  console.log = (value) => output.push(String(value));
  try {
    assert.equal(await run(["simplicity", "--shared-package"], root), 1);
  } finally { console.log = originalLog; }

  assert.match(output.join("\n"), /SIMPLICITY blocked/);
  assert.match(output.join("\n"), /BLOCKED/);
});

test("code intelligence CLI indexes stack and context without script execution", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-code-"));
  await exec("git", ["init", "-b", "main"], { cwd: root });
  await mkdir(join(root, "src"));
  await writeFile(join(root, "package.json"), JSON.stringify({ scripts: { postinstall: "exit 1" }, dependencies: { react: "19.0.0" } }));
  await writeFile(join(root, "src", "util.ts"), "export const util = 1;\n");
  await writeFile(join(root, "src", "app.ts"), "import { util } from './util';\nexport const app = util;\n");
  await exec("git", ["add", "."], { cwd: root });
  await exec("git", ["-c", "user.name=Downstroke Test", "-c", "user.email=test@example.invalid", "commit", "-m", "chore: add code"], { cwd: root });

  const output = [];
  const originalLog = console.log;
  console.log = (value) => output.push(String(value));
  try {
    assert.equal(await run(["code", "index", "--json"], root), 0);
    assert.equal(await run(["stack", "detect", "--json"], root), 0);
  } finally { console.log = originalLog; }
  assert.equal(JSON.parse(output[0]).status, "ready");
  assert.equal(JSON.parse(output[1]).stack.some(({ technology }) => technology === "React"), true);
  await assert.rejects(readFile(join(root, ".downstroke", "code-intelligence", "files.jsonl")));

  assert.equal(await run(["code", "index", "--yes"], root), 0);
  const contextOutput = [];
  console.log = (value) => contextOutput.push(String(value));
  try {
    assert.equal(await run(["code", "impact", "--path", "src/util.ts", "--json"], root), 0);
    assert.equal(await run(["code", "context", "--path", "src/app.ts", "--json"], root), 0);
  } finally { console.log = originalLog; }
  assert.equal(JSON.parse(contextOutput[0]).files.some(({ path }) => path === "src/app.ts"), true);
  assert.equal(JSON.parse(contextOutput[1]).files.some(({ path }) => path === "src/app.ts"), true);
});
