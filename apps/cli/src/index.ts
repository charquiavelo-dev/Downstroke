#!/usr/bin/env node
import { parseArgs } from "node:util";
import { applyCadenceUpdate, applyExperienceFact, applyGitPolicy, cadenceChoices, checkFiles, diagnoseLegacyAgentStack, diagnosePlanningCadence, estimateTokenUsage, governDecision, initializeExperience, inspectProject, installFiles, planCadenceUpdate, planExperienceFact, planGitPolicy, readGitPolicy, readPlanningCadence, runProjectChecks, tokenUsageStatus, type DecisionKind, type GitPolicy, type ReviewMode } from "@downstroke/core";
import { liteFiles } from "@downstroke/presets";

const requirements = [
  { id: "spec.exists", path: "docs/SPEC.md", severity: "fail" },
  { id: "agents.exists", path: "AGENTS.md", severity: "fail" },
  { id: "claude.exists", path: "CLAUDE.md", severity: "warn" },
] as const;

export async function run(argv: string[], cwd = process.cwd(), _environment: Readonly<Record<string, string | undefined>> = process.env): Promise<number> {
  const command = argv[0];
  const { values, positionals } = parseArgs({
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
      "allow-branch": { type: "boolean", default: false },
      "allow-commit": { type: "boolean", default: false },
      "allow-push": { type: "boolean", default: false },
      disable: { type: "boolean", default: false },
      fact: { type: "string" },
    },
    strict: true,
    allowPositionals: true,
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
      ...await diagnoseLegacyAgentStack(cwd),
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
    if (values.json) console.log(JSON.stringify({ status: "fail", error: "invalid-experience-command", message: "Use experience init or experience add --fact <json>" }, null, 2));
    else console.error("Usage: downstroke experience <init|add> [--fact <json>] [--yes] [--json]");
    return 1;
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

  console.error("Usage: downstroke <init|doctor|setup-agents|cadence|govern|estimate|status|git-policy|experience> [options]");
  return 1;
}

if (process.argv[1]?.endsWith("index.js")) {
  process.exitCode = await run(process.argv.slice(2));
}
