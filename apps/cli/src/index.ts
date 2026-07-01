#!/usr/bin/env node
import { parseArgs } from "node:util";
import { checkFiles, inspectProject, installFiles, runProjectChecks } from "@downstroke/core";
import { liteFiles } from "@downstroke/presets";

const requirements = [
  { id: "spec.exists", path: "docs/SPEC.md", severity: "fail" },
  { id: "agents.exists", path: "AGENTS.md", severity: "fail" },
  { id: "claude.exists", path: "CLAUDE.md", severity: "warn" },
  { id: "codegraph.exists", path: ".codegraph", severity: "warn" },
  { id: "bmad.exists", path: "_bmad", severity: "warn" },
  { id: "caveman.exists", path: ".agents/skills/caveman/SKILL.md", severity: "warn" },
  { id: "ponytail.exists", path: ".agents/skills/ponytail/SKILL.md", severity: "warn" },
] as const;

export async function run(argv: string[], cwd = process.cwd()): Promise<number> {
  const command = argv[0];
  const { values } = parseArgs({
    args: argv.slice(1),
    options: {
      preset: { type: "string", default: "lite" },
      "dry-run": { type: "boolean", default: false },
      json: { type: "boolean", default: false },
      "run-checks": { type: "boolean", default: false },
    },
    strict: true,
  });

  if (command === "init") {
    if (values.preset !== "lite") throw new Error(`Unknown preset: ${values.preset}`);
    const actions = await installFiles(cwd, liteFiles, values["dry-run"]);
    for (const item of actions) console.log(`${item.action.toUpperCase()} ${item.target}`);
    return 0;
  }

  if (command === "doctor") {
    const inspection = await inspectProject(cwd);
    const results = await checkFiles(cwd, requirements);
    const verification = values["run-checks"]
      ? await runProjectChecks(cwd, inspection.scripts)
      : { status: "not-run", checks: [] } as const;
    if (values.json) console.log(JSON.stringify({ inspection, verification, results }, null, 2));
    else {
      console.log(`STAGE ${inspection.stage}`);
      console.log(`STACK ${inspection.stacks.join(", ") || "unknown"}`);
      console.log(`ORIGIN ${inspection.originInference}`);
      console.log(`VERIFY ${verification.status}`);
      for (const result of results) console.log(`${result.status.toUpperCase().padEnd(4)} ${result.id} ${result.message}`);
    }
    return verification.status === "failed" || results.some((result) => result.status === "fail") ? 1 : 0;
  }

  console.error("Usage: downstroke <init|doctor> [--preset lite] [--dry-run] [--json] [--run-checks]");
  return 1;
}

if (process.argv[1]?.endsWith("index.js")) {
  process.exitCode = await run(process.argv.slice(2));
}
