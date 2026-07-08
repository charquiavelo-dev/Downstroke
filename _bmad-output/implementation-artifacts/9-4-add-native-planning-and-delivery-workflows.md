---
baseline_commit: cb19297
---

# Story 9.4: Add Native Planning and Delivery Workflows

Status: review

## Story

As a developer,
I want native briefs, specs, epics, stories, cadence, QA and review checkpoints,
so that Downstroke owns its delivery workflow end to end.

## Acceptance Criteria

1. Given imported or new work, when workflows run, then items, acceptance criteria, tasks, status, evidence, deferred work and review cadence use native versioned state.
2. Given a checkpoint, when work resumes, then deterministic state identifies the next valid action without depending on an external workflow engine.
3. Given high-risk work, when planned, then individual review remains mandatory.
4. Given controlled mode, when work advances, then plan, review, implementation and verification are separate persisted checkpoints with explicit approval and resume behavior.
5. Given materially conflicting active sources, when encountered, then source evidence, options, consequences and decision owner are shown and execution pauses instead of choosing silently.

## Tasks / Subtasks

- [x] Add native workflow state contracts in `packages/core/src/index.ts` (AC: 1-5)
  - [x] Define minimal versioned workflow item, acceptance criterion, task, evidence, deferred work, checkpoint, phase and decision records.
  - [x] Store state under `.downstroke/workflows/` using repository-relative paths, JSON/JSONL, schema versions and atomic writes.
  - [x] Reuse Experience provenance where a workflow item is imported or source-linked; do not trust generated output as verified truth.
- [x] Add planning/resume operations in core (AC: 1-4)
  - [x] Implement preview-first plan/apply functions for creating or updating workflow items.
  - [x] Implement a deterministic `nextAction` resolver from persisted state; do not infer from chat history or external workflow files.
  - [x] Preserve existing cadence behavior and make high-risk work require individual review regardless of review mode.
- [x] Add controlled mode checkpoint behavior (AC: 4)
  - [x] Persist `plan`, `review`, `implementation` and `verification` checkpoints independently.
  - [x] Require explicit approval to advance across controlled-mode checkpoints.
  - [x] Resume from the last valid persisted checkpoint after interruption.
- [x] Add material conflict checkpoint behavior (AC: 5)
  - [x] Record conflicting sources with path/hash/evidence, options, consequences and decision owner.
  - [x] Pause execution until a responsible human decision is persisted; never select a semantic winner silently.
- [x] Add CLI surface in `apps/cli/src/index.ts` (AC: 1-5)
  - [x] Add compact native commands for workflow preview/apply/resume/status/controlled-mode behavior.
  - [x] Support human-readable and `--json` output without leaking source payloads or secrets.
- [x] Add focused tests (AC: 1-5)
  - [x] Core tests for state validation, deterministic resume, high-risk review, controlled phase progression and conflict pause.
  - [x] CLI tests for preview/no mutation, authorized apply, JSON output and resume.
- [x] Run build, typecheck, tests and native-only distributed-surface scan.

## Dev Notes

### Scope Boundary

- This story creates native Downstroke workflow state and resume behavior. It must not call, install, depend on or expose external workflow engines.
- External development artifacts may be read only as imported source-linked data from Story 9.3.
- The stale FR coverage map conflict was resolved by owner decision: Story 9.4 binds to FR65, FR82 and FR83. FR64 remains Story 9.6 simplicity gates.
- Any future feature, skill or agent-like capability added to Downstroke must be implemented as a native Downstroke capability, even when external examples are used as design input.

### Existing Code to Reuse

- `PlanningCadence` already stores `reviewMode`, block/sprint capacity fields, `highRiskReview: "individual"` and `lastReviewedStory`; extend or compose with it instead of replacing cadence state.
- `planCadenceUpdate`, `applyCadenceUpdate`, `readPlanningCadence` and `diagnosePlanningCadence` already define current cadence persistence and SPEC synchronization behavior; preserve existing CLI/tests.
- `ExperienceFact` already carries `source`, `status`, `evidence`, `trustLevel`, secret scan and injection scan fields. Workflow imports should link to this model rather than creating a parallel provenance system.
- `governDecision` already validates contextual and high-risk decisions. Reuse its option/owner/risk/rollback semantics for controlled and conflict checkpoints where practical.

### Required State Shape

Use the smallest state model that satisfies the ACs:

- `.downstroke/workflows/manifest.json` for schema/version metadata.
- `.downstroke/workflows/items.jsonl` for briefs/specs/epics/stories/tasks and status.
- `.downstroke/workflows/evidence.jsonl` for QA/review/build/test evidence.
- `.downstroke/workflows/decisions.jsonl` for controlled-mode approvals and conflict resolutions.
- `.downstroke/workflows/checkpoints.jsonl` for resumable plan/review/implementation/verification checkpoints.

Each persisted record must include stable ID, type, status, created/updated timestamps, source reference when applicable, and repository-relative file references only.

### Deterministic Resume Rules

- `nextAction` must be computed from persisted state only.
- Invalid, stale or conflicting state returns a blocked result with remediation instead of guessing.
- Controlled mode can advance only in order: `plan -> review -> implementation -> verification`.
- High-risk workflow items require individual review even when cadence is blocks, sprint or final-draft.
- Conflicts must include evidence, options, consequences and decision owner before pausing.

### Architecture Compliance

- AD-1: core owns filesystem effects; CLI owns parsing/rendering.
- AD-2: mutations follow inspect/plan/authorize/apply/verify; default command behavior should preview where feasible.
- AD-4: state is scoped to the resolved Git root under `.downstroke/`.
- AD-6: no external construction-tool runtime, package, command or public terminology.
- AD-11: persisted state is schema-versioned, validated and written atomically.
- AD-12: material product conflicts require owned human decisions and resumable checkpoints.

### Testing Requirements

- Use existing Node test runner patterns in `packages/core/test/core.test.mjs` and `apps/cli/test/cli.test.mjs`.
- Add one focused test per non-trivial state rule: idempotent preview/apply, deterministic resume, controlled checkpoint order, high-risk individual review, conflict pause.
- Tests must not require network, external daemons, external workflow tools, embeddings or arbitrary shell.

### Code Smell / Risk Audit Follow-up

- The requested native code-smell/risk audit belongs in Story 9.6, not this story.
- Story 9.6 now includes dangerous code smells and supply-chain risk as native simplicity-gate audit inputs.
- Useful references for 9.6 are OWASP Top 10, GitHub CodeQL, Semgrep rule patterns, npm audit/provenance and Sonar clean-code concepts; they are design sources only, not runtime dependencies.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story-94-Add-Native-Planning-and-Delivery-Workflows`]
- [Source: `_bmad-output/planning-artifacts/prds/prd-Downstroke-2026-07-01/prd.md#FR65`]
- [Source: `_bmad-output/planning-artifacts/prds/prd-Downstroke-2026-07-01/prd.md#FR82`]
- [Source: `_bmad-output/planning-artifacts/prds/prd-Downstroke-2026-07-01/prd.md#FR83`]
- [Source: `docs/SPEC.md#Business-Rules-And-Invariants`]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-Downstroke-2026-07-01/ARCHITECTURE-SPINE.md#AD-12--Product-conflicts-require-an-owned-human-decision`]
- [Source: `_bmad-output/planning-artifacts/experience-docs-integration-2026-07-07.md`]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm run typecheck` — passing.
- `npm test` — 51/51 passing.
- Native-only distributed-surface scan — passing.
- `git diff --check` — passing.

### Completion Notes List

- Created implementation-ready Story 9.4 context from the accepted Epic 9 contract, PRD FR65/FR82/FR83, SPEC BR-002/BR-003 and architecture AD-12.
- Resolved the stale FR coverage map contradiction by binding Story 9.4 to native planning/delivery workflows and leaving simplicity gates in Story 9.6.
- Recorded the user's native-only rule for future feature/skill/agent-like capabilities.
- Implemented native workflow state contracts and `.downstroke/workflows/` persistence with versioned manifest, items, decisions and checkpoints.
- Added deterministic resume behavior from persisted state only, including controlled-mode checkpoint resume and material-conflict pauses.
- Added `downstroke workflow add` and `downstroke workflow resume` with JSON and human output.
- Added core and CLI coverage for preview/no mutation, authorized apply, high-risk individual review, controlled checkpointing and conflict pause.

### File List

- `_bmad-output/implementation-artifacts/9-4-add-native-planning-and-delivery-workflows.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/planning-artifacts/epics.md`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`
- `docs/SPEC.md`
- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`

## Change Log

- 2026-07-07: Created implementation-ready Story 9.4 contract.
- 2026-07-07: Implemented native planning and delivery workflow state; moved story to review.
