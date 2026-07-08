---
baseline_commit: a4de8182f4d17bf77e79cc6831a967494673eee4
---

# Story 9.9: Compile Safe Task Context

Status: review

## Story

As a developer,
I want deterministic task-specific context packs,
so that agents receive relevant project truth without full-history dumps or poisoned memory.

## Acceptance Criteria

1. Given experience records and a task, when context compiles, then identity, active rules, relevant facts, evidence, risks, unknowns and blocked assumptions fit configured category budgets.
2. Given accepted knowledge records and detected stack, when context compiles, then matching rules, decisions, preferences and stack notes are included by ID and source reference.
3. Given quarantine, secrets, conflicted or stale authority, when encountered, then compilation excludes or labels it and fails on critical leakage.
4. Given identical inputs, when compiled repeatedly, then output is stable apart from explicitly volatile metadata.

## Tasks / Subtasks

- [x] Add native context compiler contracts in `packages/core/src/index.ts` (AC: 1-4)
  - [x] Define task input, category budgets, context sections, included/excluded references and leakage blockers.
  - [x] Keep records source-linked by ID/path/hash; do not include raw imported payloads, prompts, secrets, model output or absolute paths.
  - [x] Make output deterministic by sorting records and excluding volatile fields from stable content.
- [x] Compile context from existing local Downstroke state (AC: 1, 3, 4)
  - [x] Read `.downstroke/experience/facts.jsonl` when present and include only active non-conflicted, non-stale, non-secret facts.
  - [x] Read `.downstroke/workflows/items.jsonl` when present and include matching workflow identity, risks, unknowns and blocked assumptions.
  - [x] Read `.downstroke/code-intelligence/index.json` when present and include stack/file references without executing project scripts.
  - [x] Treat malformed, quarantined, conflicted or secret-like records as excluded references or blockers according to severity.
- [x] Add accepted knowledge registry support with a minimal native schema (AC: 2, 3)
  - [x] Read `.downstroke/knowledge/records.jsonl` when present.
  - [x] Include only records with `status: "accepted"` and matching scope, stack or tags.
  - [x] Include rule, decision, preference and stack-note records by deterministic ID and source reference.
  - [x] Exclude proposed, deprecated, stale, invalidated, conflicted or quarantined records.
- [x] Add `downstroke knowledge compile` CLI preview output (AC: 1-4)
  - [x] Accept `--task-id`, repeated `--path`, optional `--stack`, `--budget`, and `--json`.
  - [x] Keep the command read-only; it must never write compiled context to disk in this story.
  - [x] Show included IDs, excluded IDs/reasons, budget use, blockers and a safe compact context summary.
- [x] Add focused core and CLI tests (AC: 1-4)
  - [x] Cover budget clipping by category.
  - [x] Cover deterministic repeat output.
  - [x] Cover accepted knowledge inclusion and non-accepted exclusion.
  - [x] Cover quarantine/conflict/secret leakage blocking.
  - [x] Cover CLI read-only behavior.
- [x] Run build, typecheck, tests and native-only distributed-surface scan.

## Dev Notes

### Scope Boundary

- This story compiles safe context only. It does not call an LLM, create embeddings, implement RAG, schedule workers, cache compiled packs, write generated context files or replace the final Knowledge Engine lifecycle.
- Use Node.js built-ins and existing project patterns only. No dependency is justified.
- The compiler should be useful before the full Knowledge Registry exists: absent state is allowed and should produce empty sections plus explicit unknowns, not failure.
- Critical leakage fails the compile. Lower-risk exclusions should be visible as excluded references with reasons.

### Existing Code to Reuse

- `gitRoot`, `safeRelative`, `repoPath`, `stable`, `redact`, `secretPatterns`, JSONL read/write patterns and safe path checks already exist in `packages/core/src/index.ts`.
- `ExperienceFact`, `readFacts`, import classification and quarantine behavior already model trust, status, evidence and unsafe source handling.
- `WorkflowItem`, `readWorkflowItems`, `resolveWorkflowNextAction` and controlled checkpoint fields already model task identity, risk, assumptions, conflicts and resume state.
- `detectCodeStack`, `planCodeIntelligenceIndex` and `queryCodeContext` already provide stack and bounded code references without executing scripts.
- Story 9.8 added provider-neutral route records. This story may reference task ID and budget concepts but must not call providers or estimate cost.

### Minimal Knowledge Record Shape

Use the smallest schema needed for this story:

```ts
type KnowledgeRecord = {
  id: string;
  kind: "rule" | "decision" | "preference" | "stack-note";
  status: "accepted" | "proposed" | "deprecated" | "stale" | "invalidated" | "conflicted" | "quarantined";
  scope?: "repository" | "team" | "organization" | "global";
  stack?: string[];
  tags?: string[];
  summary: string;
  source: { path: string; hash?: string; section?: string };
};
```

Do not add a larger registry abstraction unless implementation proves this shape cannot satisfy the acceptance criteria.

### Context Pack Shape

The compiled output should be compact and machine-readable:

- `task`: task ID, requested paths, requested stack, budget.
- `sections`: identity, active rules, relevant facts, evidence, risks, unknowns, blocked assumptions, stack notes.
- `included`: source-linked IDs with category and reason.
- `excluded`: source-linked IDs or paths with reason.
- `blockers`: critical leakage, malformed trusted state or unsafe authority.
- `stableHash`: hash of stable content only; timestamps or runtime metadata must not change it.

Category budgets should be small integer item counts in this story. Token calibration remains Story 10.7.

### Safety Rules

- Never include raw secret-like strings in compiled output. If a candidate record contains a secret-like value, block rather than redact-and-include.
- Never include quarantined content as active context.
- Conflicted or stale authority cannot guide execution; label it excluded.
- Unknowns and blocked assumptions are valid context. They should be included as constraints, not silently dropped.
- Repository-relative paths only; absolute paths must be rejected or normalized before output.

### CLI Pattern

Follow existing CLI command style:

```bash
downstroke knowledge compile --task-id story.9.9 --path packages/core/src/index.ts --budget 12 --json
downstroke knowledge compile --task-id story.9.9 --stack TypeScript
```

The command is read-only, so `--yes` is not required and should not change behavior.

### Previous Story Intelligence

- Story 9.8 established the task ID validation pattern: `^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$`.
- Story 9.8 review found that exported core APIs need runtime validation, not only CLI validation. Apply that lesson here for budgets, task ID, status, kind, path and source validation.
- Story 9.8 uses append-only state for routes; this story should remain read-only.

### Testing Requirements

- Add core tests in `packages/core/test/core.test.mjs`.
- Add CLI tests in `apps/cli/test/cli.test.mjs`.
- Use temporary git fixtures and repository-local `.downstroke` state.
- Verify no compiled output contains absolute paths, raw secret-like values or quarantined payload.
- Verify repeated compiles from identical files produce identical `stableHash` and stable sections.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story-99-Compile-Safe-Task-Context`]
- [Source: `_bmad-output/planning-artifacts/prds/prd-Downstroke-2026-07-01/prd.md#FR63`]
- [Source: `_bmad-output/planning-artifacts/prds/prd-Downstroke-2026-07-01/prd.md#FR82`]
- [Source: `_bmad-output/planning-artifacts/prds/prd-Downstroke-2026-07-01/prd.md#FR87`]
- [Source: `_bmad-output/planning-artifacts/prds/prd-Downstroke-2026-07-01/prd.md#FR91`]
- [Source: `docs/SPEC.md#Business-Rules-And-Invariants`]
- [Source: `_bmad-output/implementation-artifacts/9-8-route-work-with-native-token-economy.md`]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm.cmd run build` — passing.
- `npm.cmd run typecheck` — passing.
- `npm.cmd test` — passing, 72/72.
- `node --input-type=module -e "import { scanNativeOnlySurfaces } from './packages/core/dist/index.js'; console.log(JSON.stringify(await scanNativeOnlySurfaces(process.cwd()), null, 2));"` — passing, `status: ok`.

### Completion Notes List

- Added deterministic `compileTaskContext` core API with category budgets, included/excluded references, blockers and stable hash.
- Added minimal accepted knowledge record support from `.downstroke/knowledge/records.jsonl`.
- Added read-only `downstroke knowledge compile` CLI command.
- Added core and CLI coverage for deterministic output, accepted knowledge, unsafe exclusion/blocking and read-only behavior.

### File List

- `_bmad-output/implementation-artifacts/9-9-compile-safe-task-context.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`

## Change Log

- 2026-07-08: Created implementation-ready Story 9.9 contract.
- 2026-07-08: Implemented read-only native safe task context compiler and marked story ready for review.
