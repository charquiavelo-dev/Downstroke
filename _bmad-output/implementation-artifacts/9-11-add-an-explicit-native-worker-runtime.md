---
baseline_commit: 9b799dd14d3771dfde173902f1bdb1e5d3e95b88
---

# Story 9.11: Add an Explicit Native Worker Runtime

Status: review

## Story

As a maintainer,
I want schema-bound native worker orchestration declarations,
so that worker use is explicit, auditable and rejected whenever a deterministic or single-path route is sufficient.

## Acceptance Criteria

1. Given an orchestration proposal, when it is inspected, then Planner, Scheduler, Executor, Verifier and Recorder responsibilities are explicit without executing any stage.
2. Given a deterministic or tool-proven task, when worker orchestration is requested, then Downstroke selects the simpler deterministic route, returns the exact next action and creates no worker state.
3. Given a native worker manifest, when it is validated or registered, then its Downstroke role, strict input/output schemas, allowed tools, mutation rights, finite budget, stop condition, evidence requirements and audit requirements are declared and unknown or malformed fields block.
4. Given the built-in catalog, when it is listed, then exactly Planner, Repository Inspector, Risk Auditor, Evidence Validator, Workflow Guardian, Context Compiler and Release Guardian exist as immutable Downstroke-native, read-only declarations.
5. Given a worker manifest or proposal that requests mutation, when required preview, execution capability, ownership, persisted workflow checkpoints or individual high-risk review evidence is absent, then registration blocks; registration itself never executes a tool or mutation.
6. Given worker output containing claims, when validated, then only `observed` or `inferred` claims are accepted; a worker assertion cannot create verified facts, approve checkpoints, complete work or grant release approval.
7. Given a justified read-only local worker, when registration is previewed and then explicitly applied, then preview is read-only, apply revalidates the exact plan, repository-local registry and hash-chained audit records are append-only and sanitized, and identical registration is idempotent.

## Tasks / Subtasks

- [x] Define the minimal native runtime contracts and built-in catalog (AC: 1, 3, 4)
  - [x] Add RED core tests for the five explicit runtime-stage responsibilities and exact seven-role catalog.
  - [x] Add strict `NativeWorkerManifest`, schema, budget, stop, evidence, audit, claim and registration-plan types in `packages/core/src/index.ts`; narrow external data from `unknown` without `any`.
  - [x] Declare immutable built-ins as data only, using existing Downstroke capabilities and read-only tool identifiers; do not create classes, factories, dynamic plugins or provider adapters.
  - [x] Reject unknown fields, unknown roles/tools, unsafe IDs, unbounded budgets, empty stop/evidence/audit requirements and schemas that permit undeclared properties.
- [x] Route unnecessary orchestration to the simpler path (AC: 1, 2)
  - [x] Reuse token task classes and deterministic/tool-proven signals rather than creating a second routing policy.
  - [x] Produce a stable orchestration proposal with selected mode, stage responsibilities, workers, blockers, next action and SHA-256 plan hash; preview must not create `.downstroke/workers/`.
  - [x] Make the Story 9.14 boundary explicit: this story selects and records contracts only; it does not add `downstroke run`, invoke workers or execute Planner through Recorder.
- [x] Guard registration, mutation rights and worker claims (AC: 3, 5, 6, 7)
  - [x] Add RED tests for manipulated plans, duplicate registration, unsafe mutation rights, missing workflow/ownership/high-risk evidence, verified self-claims and secret-like audit data.
  - [x] Allow only justified read-only local registration in this story; mutation-capable manifests remain blocked until an execution task and existing persisted approval gates can be proven by Story 9.14.
  - [x] Persist versioned repository-relative manifests and hash-chained audit records under `.downstroke/workers/` only after explicit authorization; re-plan immediately before append and make identical apply a no-op.
  - [x] Validate outputs as claims only; retain `observed`/`inferred` status and evidence references without writing Experience facts or changing workflow/release state.
- [x] Expose the narrow CLI and documentation surface (AC: 1-7)
  - [x] Add `downstroke worker list` and `downstroke worker register --manifest <json>` preview/apply (`--yes`) with JSON/human parity and precise blockers/next commands.
  - [x] Add one temporary-Git CLI fixture proving catalog listing, preview non-mutation, guarded idempotent apply and deterministic-route rejection without execution.
  - [x] Update README status/commands and current limits: worker contracts exist, while scheduling, invocation, fan-out and `downstroke run` remain Story 9.14.
- [x] Run the Definition of Done gate (AC: 1-7)
  - [x] Run `npm.cmd run typecheck`, `npm.cmd test` and `npm.cmd run build`.
  - [x] Run the native-only surface scan, prohibited release-product-name scan and `git diff --check`.
  - [x] Confirm no dependency, worker thread, subprocess worker, queue, retry engine, network/model call, dynamic module loader or remote registry was added.

## Dev Notes

### Minimal Runtime Boundary

- Investigation confirmed a real gap: routing, workflow, context, evidence and release primitives exist, but no worker manifest, catalog, registration or audit contract exists. [Source: `_bmad-output/implementation-artifacts/investigations/native-worker-runtime-investigation.md`]
- Story 9.11 is declaration and guard infrastructure. Story 9.14 owns execution tasks, `downstroke run`, deterministic operation execution, Planner -> Scheduler -> Executor -> Verifier -> Recorder sequencing, worker invocation/fan-out, failure recording and resume behavior.
- The phrase "runs the simpler path" is implemented here as a deterministic selection/refusal contract and exact next action. Actual execution is intentionally deferred to 9.14.
- Registration is not execution authority. Built-ins remain immutable and read-only. A locally registered manifest may only narrow behavior and remains inert until a later execution task selects it.

### Existing Code to Reuse

- `tokenTaskClasses` and `planTokenEconomyRoute`: existing deterministic/contextual/creative and tool-proven routing vocabulary.
- `normalizeJson`: canonical stable hashing input.
- `gitRoot`: resolved repository confinement.
- `planWorkflowItem`, `resolveWorkflowNextAction` and controlled checkpoint state: authoritative workflow safety; do not create parallel approvals.
- `ExperienceFact` trust/status vocabulary: worker claims cannot bypass fact validation.
- `compileTaskContext`, `detectCodeStack`, `evaluateSimplicityGates`, `scanNativeOnlySurfaces` and native release planning are existing capabilities behind built-in role declarations, not tools to invoke in this story.

### Contract Guidance

- Keep manifests serializable, schema-versioned and strict. Use a small native object-schema description with declared property types, required keys and `additionalProperties: false`; do not add a JSON Schema dependency.
- Use a small allowlist of existing capability identifiers. A tool identifier names permission only; it is not a dynamic dispatch string and must never be executed from manifest input.
- Budgets must be positive bounded integers. Stop conditions must be finite and machine-readable. Audit evidence stores IDs/hashes/status, never prompts, arbitrary outputs, secrets, absolute paths or full private payloads.
- Registration state belongs under `<git-root>/.downstroke/workers/`. Use JSONL append-only records, stable hashes, optimistic revalidation and idempotent duplicate handling consistent with workflow/release state patterns.
- Public output and code use only Downstroke-native terminology.

### Files to Update and Preserve

- `packages/core/src/index.ts`: add strict data contracts and plan/apply/output-validation functions without changing existing public signatures.
- `apps/cli/src/index.ts`: parse/render only; all repository effects stay in core.
- `packages/core/test/core.test.mjs` and `apps/cli/test/cli.test.mjs`: keep Node test runner and temporary Git fixtures.
- `README.md`: describe catalog/registration honestly and retain execution as roadmap work.
- Preserve all Story 10.2 planning and implementation changes already present in the dirty worktree.

### Test Requirements

- Core catalog test: exact roles, complete bounded manifests, five stage responsibilities and stable serialization.
- Core guard test: deterministic fallback, malformed manifests, unknown tools, mutation requests, verified claims, unsafe evidence and preview non-mutation block correctly.
- Core apply test: justified read-only registration, stale/manipulated plan rejection, hash-chained audit record, repository-relative sanitized state and idempotent rerun.
- CLI test: list plus preview/apply in one fixture; no `run` or execution test belongs here.
- Full regression must remain green; no lint script exists.

### Previous Story and Git Intelligence

- Story 9.10 established concise health blockers, conservative archive-only cleanup and native-only gates. Worker registration must report exact blockers and never weaken those surfaces.
- Story 9.9 established stable bounded task context. The Context Compiler worker is a declaration over that capability, not a new compiler.
- Recent commits use additive single-file core/CLI patterns and focused Node fixtures; preserve those conventions and add no package.

### Architecture and Requirements

- Functional core/imperative shell; core owns effects and CLI owns rendering. [Architecture AD-1]
- Mutations follow `inspect -> plan -> authorize -> apply -> verify`. [AD-2]
- State is resolved-Git-root local, scoped authorization cannot expand, and persisted state is validated/atomic. [AD-4, AD-5, AD-11]
- Downstroke-owned runtime contracts only; no external product runtime or branding. [AD-6]
- Workers cannot mutate without execution capability, manifest permission and workflow approval; simple tasks remain single-path; outputs remain claims. [PRD NFR46-NFR48]
- Source requirements: `docs/SPEC.md` BR-005 and Native worker entity; PRD FR66, FR84 and FR87; Epic 9 Story 9.11.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- RED: focused core imports and CLI worker commands failed because no native worker contract or surface existed.
- GREEN: exact built-in catalog, deterministic fallback, strict manifest/output validation and guarded local registration passed focused tests.
- REFACTOR: local-state corruption fails closed; persisted manifest/output data rejects secret-like content and absolute paths.

### Implementation Plan

- Add strict plain-data contracts and tests before registration effects.
- Reuse existing routing/workflow/evidence vocabulary and persist only inert read-only manifests plus audit hashes.
- Keep all execution, fan-out and provider behavior out of Story 9.11.

### Completion Notes List

- Added explicit Planner, Scheduler, Executor, Verifier and Recorder responsibility declarations without an execution loop.
- Added exactly seven immutable read-only Downstroke-native worker manifests with strict bounded schemas, capabilities, budgets, stop conditions, evidence and audit requirements.
- Added deterministic/single-path refusal, stable plan hashes, inert preview/apply registration and repository-local hash-chained audit state.
- Added claim validation that accepts only bounded `observed` or `inferred` claims and never writes facts, approvals or completion state.
- Added `downstroke worker list` and preview-first `worker register`; Story 9.14 remains the sole owner of execution and fan-out.
- Validation passed: typecheck, build, 84/84 tests, native-only scan, prohibited-name scan and `git diff --check`.

### File List

- `README.md`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`
- `docs/SPEC.md`
- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`
- `_bmad-output/implementation-artifacts/investigations/native-worker-runtime-investigation.md`
- `_bmad-output/implementation-artifacts/9-11-add-an-explicit-native-worker-runtime.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-07-13: Added the minimal schema-bound native worker catalog, deterministic routing guard, inert local registration, claim validation, CLI surface and audit evidence.
