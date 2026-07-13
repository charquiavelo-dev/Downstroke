---
baseline_commit: 1250988d296fa3cef9a5e5fd6bc69474e53c51f4
---

# Story 9.14: Add Native Execution Engine

Status: review

## Story

As a developer,
I want explicit execution tasks,
so that Downstroke can plan, run, verify and record work without hidden chat memory or external orchestration.

## Acceptance Criteria

1. Given a requested operation, when `downstroke run` previews it, then the execution task shows objective, owner, dependencies, priority, estimate, risk, rollback reference, selected mode and required approvals; the preview has a stable plan hash and writes no execution state.
2. Given the allowlisted `project.verify` operation, when execution is explicitly authorized with the exact plan hash, then Planner, Scheduler, Executor, Verifier and Recorder run in order through existing native functions without worker fan-out, and a verified rerun is idempotent.
3. Given worker mode is justified, when execution starts, then the selected immutable worker manifest, manifest hash, budget, stop condition, allowed tools and evidence requirements are persisted before any invocation; because no concrete native worker adapter exists yet, execution then remains blocked with an exact next safe action and never fabricates worker output.
4. Given verification fails, when Recorder writes state, then the task is `failed` with bounded check evidence and a next safe action, never `completed`; the same failed evidence cannot be resumed into success silently.
5. Given dependencies, workflow state, repository HEAD or the supplied plan hash change after preview, when apply is requested, then execution blocks before the operation runs and asks for a new preview.

## Tasks / Subtasks

- [x] Define the execution task and append-only ledger contracts (AC: 1-5)
  - [x] Add RED core tests for stable read-only preview, strict input validation, dependency/workflow blocking and plan-hash revalidation.
  - [x] Add schema-versioned task, plan, stage and event types in `packages/core/src/index.ts`; narrow external input from `unknown` and reject unknown fields.
  - [x] Store repository-relative, secret-safe, hash-chained events under `.downstroke/executions/events.jsonl`; use an exclusive transient lock for apply.
- [x] Implement the single deterministic execution path (AC: 2, 4, 5)
  - [x] Support only `project.verify`, reusing `inspectProject` and `runProjectChecks`; add no arbitrary command, handler registry, queue, retry engine or dependency.
  - [x] Execute and record Planner -> Scheduler -> Executor -> Verifier -> Recorder in order.
  - [x] Complete only from passing verifier evidence; record failure and next safe action on a failed check; make a verified identical rerun a no-op.
- [x] Record the honest worker-mode ceiling (AC: 3, 5)
  - [x] Resolve only immutable built-in manifests from Story 9.11 and persist their complete preflight contract before any possible invocation.
  - [x] Leave worker execution blocked until a concrete typed native capability adapter exists; do not dispatch tool IDs, registered manifests, prompts, providers or shell commands.
  - [x] Confirm worker preflight cannot mutate workflow, facts, approvals, releases or the worker registry.
- [x] Expose `downstroke run` and document the boundary (AC: 1-5)
  - [x] Add preview-first CLI parsing and human/JSON output; apply requires `--plan <exact-hash> --yes`, and high risk additionally requires `--approved`.
  - [x] Add one temporary-Git CLI fixture proving preview non-mutation, exact deterministic apply and stale hash rejection.
  - [x] Update README and `docs/SPEC.md` to describe the available deterministic operation and worker preflight honestly.
- [x] Run the Definition of Done gate (AC: 1-5)
  - [x] Run `npm.cmd run typecheck`, `npm.cmd test` and `npm.cmd run build`.
  - [x] Run native-only and prohibited external release-product surface scans plus `git diff --check`.
  - [x] Confirm no generic shell executor, worker thread, subprocess pool, scheduler framework, dynamic dispatch, model/provider call or new dependency was added.

## Dev Notes

### Minimal Execution Boundary

- There is a real missing seam: native routing, workflow state, context, verification functions and worker contracts exist, but no durable execution task coordinates them. [Source: `_bmad-output/planning-artifacts/epics.md:1147-1154`]
- The first executable operation is exactly `project.verify`. It composes `inspectProject` and `runProjectChecks`; it does not accept command strings and does not broaden the existing `typecheck`, `test`, `build` check allowlist.
- Planner, Scheduler, Executor, Verifier and Recorder are plain recorded stages, not classes or services. Reuse `nativeRuntimeResponsibilities` as their public descriptions.
- Worker mode is preflight-only in this cut. Story 9.11 manifests are inert permission declarations, and no real typed adapter currently exists. Recording a truthful blocked state satisfies the safety boundary without simulating work.

### State and Safety Contract

- Persist one append-only ledger at `.downstroke/executions/events.jsonl`; embed the normalized task and selected worker contract in the first event rather than adding speculative plan/schedule files.
- Plan hashes exclude timestamps and outcomes. Apply replans against current Git HEAD, workflow state, completed dependencies and built-in manifest hashes before it acquires the lock or executes checks.
- A task dependency is satisfied only by a valid prior terminal `completed` event for that task ID. Malformed state or a broken hash chain fails closed.
- Required approvals are derived, not user-declared: `execution` for apply and `high-risk-review` for high-risk tasks. `--yes` authorizes execution; `--approved` is separately required for high risk.
- Store check name, exit code and bounded output only. Never store prompts, chat history, arbitrary worker output, secrets, absolute paths or full private payloads.
- Recorder may emit `completed`, `failed` or `blocked`. Only `Verifier` evidence with overall status `passed` can produce `completed`.

### Existing Code to Reuse

- `inspectProject` and `runProjectChecks`: deterministic repository verification and structured check results.
- `nativeRuntimeResponsibilities`, `nativeWorkerCatalog` and `listNativeWorkers`: five-stage descriptions and immutable built-in worker contracts.
- `resolveWorkflowNextAction`: persisted workflow conflicts/checkpoints and next safe action; do not create a parallel approval engine.
- `gitRoot`, `normalizeJson`, stable SHA-256 plan hashing and worker/release append-only patterns: repository confinement and revalidation conventions.

### Files to Update and Preserve

- `packages/core/src/index.ts`: add execution contracts and effects without changing existing exported signatures.
- `apps/cli/src/index.ts`: parse/render only; execution effects remain in core.
- `packages/core/test/core.test.mjs`, `apps/cli/test/cli.test.mjs`: preserve Node test runner and temporary Git fixture patterns.
- `README.md`, `docs/SPEC.md`: document only working behavior and its worker ceiling.
- Preserve release planning and worker registration behavior from commit `1250988`.

### Architecture and Requirements

- Functional core/imperative shell and one mutation lifecycle. [Source: `_bmad-output/planning-artifacts/architecture/architecture-Downstroke-2026-07-01/ARCHITECTURE-SPINE.md:20-43`]
- Repository-local state, scoped authorization, strict persisted validation and atomic/locked mutation. [Source: `_bmad-output/planning-artifacts/architecture/architecture-Downstroke-2026-07-01/ARCHITECTURE-SPINE.md:57-67`, `100-104`]
- Explicit execution task is repository-owned and deterministic-first. [Source: `docs/SPEC.md:115`]
- FR84 and FR88 require native execution stages and durable ownership/dependency/priority/estimate/rollback state. [Source: `_bmad-output/planning-artifacts/epics.md:193-201`]
- Native workers cannot mutate without task capability, manifest permission and workflow approval; simple work remains single-path and claims cannot complete work. [Source: `_bmad-output/planning-artifacts/epics.md:305-309`]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- RED: the full test run failed because `planNativeExecution` and `applyNativeExecution` did not exist.
- GREEN: focused core and CLI tests passed for deterministic execution, worker preflight and failed verification.
- REFACTOR: ledger validation fails closed on malformed fields, unsafe evidence, invalid hashes and broken hash chains.

### Implementation Plan

- Write focused core and CLI failures first.
- Add one strict execution contract and one allowlisted deterministic operation.
- Persist truthful terminal evidence and block worker mode after preflight.

### Completion Notes List

- Added strict Git-anchored execution tasks with objective, ownership, dependencies, priority, estimate, risk, rollback, approvals and stable plan hashes.
- Added one allowlisted deterministic `project.verify` operation that composes existing inspection and project-check functions through all five native stages.
- Added a secret-safe hash-chained execution ledger, exclusive apply lock, dependency/workflow revalidation, high-risk approval and idempotent completed reruns.
- Added built-in worker preflight evidence that blocks before invocation and cannot mutate worker, workflow, knowledge or release state.
- Added preview-first `downstroke run` with human/JSON parity and exact plan authorization.
- Validation passed: typecheck, build, 88/88 tests, native-only scan, prohibited release-product-name scan and `git diff --check`.

### File List

- `README.md`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`
- `docs/SPEC.md`
- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`
- `_bmad-output/implementation-artifacts/9-14-add-native-execution-engine.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-07-13: Added native deterministic execution planning, five-stage verification, durable evidence, guarded worker preflight and the `downstroke run` CLI.
