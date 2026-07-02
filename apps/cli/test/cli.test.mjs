import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { run } from "../dist/index.js";

test("lite init creates its canonical documents", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-"));
  assert.equal(await run(["init", "--preset", "lite"], root), 0);
  assert.equal(await run(["doctor", "--json"], root), 0);
});

test("doctor JSON keeps its envelope and includes structured Breakdown Stack results", async () => {
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
  const bmad = report.results.find((result) => result.id === "bmad.exists");
  assert.equal(bmad.version, "6.9.0");
  assert.equal(bmad.evidence, "_bmad/bmm/config.yaml");
  assert.equal(JSON.stringify(report).includes(root), false);
});

test("setup-agents emits a redacted plan and does not mutate without authorization", async () => {
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
  assert.equal(plan.status, "ready");
  assert.equal(JSON.stringify(plan).includes("secret"), false);
  await assert.rejects(readFile(join(root, ".codegraph", "codegraph.db")));
});
