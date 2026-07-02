#!/usr/bin/env node
import { parseArgs } from "node:util";
import { applyBreakdownStack, applyCadenceUpdate, cadenceChoices, checkFiles, diagnoseBreakdownStack, diagnosePlanningCadence, estimateTokenUsage, governDecision, inspectProject, installFiles, planBreakdownStack, planCadenceUpdate, readPlanningCadence, runProjectChecks, tokenUsageStatus, type DecisionKind, type ReviewMode } from "@downstroke/core";
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
      risk: { type: "string" },
      rollback: { type: "string" },
      path: { type: "string", multiple: true },
      "consumed-tokens": { type: "string" },
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
      await diagnosePlanningCadence(cwd),
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

  console.error("Usage: downstroke <init|doctor|setup-agents|cadence|govern|estimate|status> [options]");
  return 1;
}

if (process.argv[1]?.endsWith("index.js")) {
  process.exitCode = await run(process.argv.slice(2));
}
