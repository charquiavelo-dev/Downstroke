#!/usr/bin/env node
import { parseArgs } from "node:util";
import { applyCadenceUpdate, applyCodeIntelligenceIndex, applyCommunicationPolicy, applyExperienceFact, applyExperienceImport, applyGitPolicy, applyTokenEconomyRoute, applyWorkflowItem, cadenceChoices, checkFiles, communicationModes, compileTaskContext, detectCodeStack, diagnoseLegacyAgentStack, diagnosePlanningCadence, estimateTokenUsage, evaluateCommunicationProtection, evaluateSimplicityGates, governDecision, initializeExperience, inspectProject, installFiles, planCadenceUpdate, planCodeIntelligenceIndex, planCommunicationPolicy, planExperienceFact, planExperienceImport, planGitPolicy, planTokenEconomyRoute, planWorkflowItem, protectedCommunicationCategories, queryCodeContext, readCommunicationPolicy, readGitPolicy, readPlanningCadence, resolveWorkflowConflict, resolveWorkflowNextAction, runProjectChecks, tokenEconomyModes, tokenTaskClasses, tokenUsageStatus, workflowPhases, type CommunicationMode, type DecisionKind, type GitPolicy, type ReviewMode, type TokenEconomyMode, type TokenTaskClass, type WorkflowPhase } from "@downstroke/core";
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
      "  downstroke init --preset lite --dry-run",
      "  downstroke init --preset lite",
      "  downstroke doctor --run-checks",
      "",
      "Native state",
      "  downstroke cadence --review-mode one-at-a-time --yes",
      "  downstroke communication --mode compact --yes",
      "  downstroke simplicity --proposal \"reuse existing helper\" --json",
      "  downstroke code index --yes",
      "  downstroke route --task-id task.1 --task-class contextual --mode balanced",
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
    if (values.json) console.log(JSON.stringify({ status: "fail", error: "invalid-knowledge-command", message: "Use knowledge compile --task-id <id> [--path <path>] [--stack <name>] [--budget <items>]" }, null, 2));
    else console.error("Usage: downstroke knowledge compile --task-id <id> [--path <path>] [--stack <name>] [--budget <items>] [--json]");
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
          console.log(`NEXT COMMAND downstroke workflow add --item '<same item json>' --controlled --phase ${phase} --approved --yes`);
        }
        if (result.status === "blocked" && result.itemId && result.action === "resolve-conflict") {
          console.log(`NEXT COMMAND downstroke workflow resolve --item-id ${result.itemId} --select <option> --owner <owner> --rationale <text> --yes`);
        }
      }
      return result.status === "blocked" ? 1 : 0;
    }
    if (action === "resolve") {
      const result = await resolveWorkflowConflict(cwd, {
        itemId: values["item-id"] ?? "",
        selectedOption: values.select ?? "",
        owner: values.owner ?? "",
        rationale: values.rationale ?? "",
      });
      if (values.json) console.log(JSON.stringify(result, null, 2));
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
      };
      const conflictOnly = plan.blockers.length > 0 && plan.blockers.every((blocker) => blocker.startsWith("Material workflow conflict"));
      if (!values.yes || values["dry-run"] || plan.status === "blocked" && !conflictOnly) {
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
          if (plan.status === "ready") console.log("Run again with --yes to authorize this workflow update.");
        }
        return plan.status === "blocked" ? 1 : 0;
      }
      const result = await applyWorkflowItem(cwd, plan);
      if (values.json) console.log(JSON.stringify({ plan: summary, result }, null, 2));
      else console.log(`${result.status.toUpperCase()} ${result.message} id=${result.evidence ?? "unknown"}`);
      return result.status === "ok" ? 0 : 1;
    }
    if (values.json) console.log(JSON.stringify({ status: "fail", error: "invalid-workflow-command", message: "Use workflow add --item <json>, workflow resume [--item-id <id>], or workflow resolve --item-id <id> --select <option> --owner <owner> --rationale <text>" }, null, 2));
    else console.error("Usage: downstroke workflow <add|resume|resolve> [--item <json>] [--item-id <id>] [--controlled] [--phase <phase>] [--approved] [--conflict <json>] [--select <option>] [--owner <owner>] [--rationale <text>] [--yes] [--json]");
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

  console.error("Usage: downstroke <init|doctor|setup-agents|cadence|communication|simplicity|code|stack|govern|estimate|status|git-policy|experience|workflow> [options]");
  return 1;
}

if (process.argv[1]?.endsWith("index.js")) {
  process.exitCode = await run(process.argv.slice(2));
}
