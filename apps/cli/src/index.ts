#!/usr/bin/env node
import { parseArgs } from "node:util";
import { applyBreakdownStack, checkFiles, diagnoseBreakdownStack, inspectProject, installFiles, planBreakdownStack, runProjectChecks } from "@downstroke/core";
import { liteFiles } from "@downstroke/presets";

const requirements = [
  { id: "spec.exists", path: "docs/SPEC.md", severity: "fail" },
  { id: "agents.exists", path: "AGENTS.md", severity: "fail" },
  { id: "claude.exists", path: "CLAUDE.md", severity: "warn" },
] as const;

export async function run(argv: string[], cwd = process.cwd(), environment: Readonly<Record<string, string | undefined>> = process.env): Promise<number> {
  const command = argv[0];
  const { values } = parseArgs({
    args: argv.slice(1),
    options: {
      preset: { type: "string", default: "lite" },
      "dry-run": { type: "boolean", default: false },
      json: { type: "boolean", default: false },
      "run-checks": { type: "boolean", default: false },
      yes: { type: "boolean", default: false },
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
    const results = [
      ...await checkFiles(cwd, requirements),
      ...await diagnoseBreakdownStack(cwd),
    ];
    const verification = values["run-checks"]
      ? await runProjectChecks(cwd, inspection.scripts)
      : { status: "not-run", checks: [] } as const;
    if (values.json) console.log(JSON.stringify({ inspection, verification, results }, null, 2));
    else {
      console.log(`STAGE ${inspection.stage}`);
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

  if (command === "setup-agents") {
    const plan = await planBreakdownStack(cwd, environment);
    const apply = values.yes && !values["dry-run"];
    if (!apply) {
      if (values.json) console.log(JSON.stringify(plan, null, 2));
      else {
        console.log(`PLAN ${plan.status}`);
        console.log(`TOOLS ${plan.tools.join(", ") || "none"}`);
        console.log(`COMMAND ${plan.command}`);
        for (const file of plan.files) console.log(`FILE ${file}`);
        for (const mutation of plan.mutations) console.log(`MUTATION ${mutation}`);
        for (const blocker of plan.blockers) console.log(`BLOCKED ${blocker}`);
        if (plan.status === "ready") console.log("Run again with --yes to authorize this plan.");
      }
      return plan.status === "blocked" ? 1 : 0;
    }

    const result = await applyBreakdownStack(cwd, plan);
    if (values.json) console.log(JSON.stringify({ plan, result }, null, 2));
    else console.log(`INSTALL ${result.status}`);
    return result.exitCode;
  }

  console.error("Usage: downstroke <init|doctor|setup-agents> [--preset lite] [--dry-run] [--json] [--run-checks] [--yes]");
  return 1;
}

if (process.argv[1]?.endsWith("index.js")) {
  process.exitCode = await run(process.argv.slice(2));
}
