# Investigation: Native Worker Runtime Necessity

## Hand-off Brief

1. **What happened.** Story 9.11 proposes an explicit native worker runtime, but its necessity has not yet been established against the current implementation.
2. **Where the case stands.** Concluded with high confidence: existing safeguards cover deterministic routing, workflow gates, context, and evidence, but no native worker contract, registry, or audit runtime exists.
3. **What's needed next.** Keep Story 9.11, scope it to worker declarations and guarded registration, and leave `downstroke run` plus Planner-to-Recorder execution to Story 9.14.

## Case Info

| Field | Value |
| --- | --- |
| Ticket | Story 9.11 |
| Date opened | 2026-07-13 |
| Status | Concluded |
| System | Windows; branch `feature/platform-roadmap` |
| Evidence sources | `epics.md`, sprint status, source code, tests, version control |

## Problem Statement

Determine whether Story 9.11 represents a real missing capability or whether the existing implementation already provides a sufficient deterministic worker path.

## Evidence Inventory

| Source | Status | Notes |
| --- | --- | --- |
| `_bmad-output/planning-artifacts/epics.md` Story 9.11 | Available | Requires explicit responsibilities, worker contracts, native roles, mutation gates, and evidence promotion. |
| `_bmad-output/implementation-artifacts/sprint-status.yaml` | Available | Story 9.11 is `backlog`. |
| Runtime and CLI source | Available | Deterministic routing and safeguards exist; worker contracts and registration do not. |
| Automated tests | Available | Cover routing, checkpoints, context, and evidence; no worker runtime tests exist. |

## Investigation Backlog

| # | Path to Explore | Priority | Status | Notes |
| - | --- | --- | --- | --- |
| 1 | Extract Story 9.11 requirements | High | Done | Six acceptance criteria establish the contract. |
| 2 | Trace existing worker/runtime execution paths | High | Done | No worker runtime exists; reusable safeguards were identified. |
| 3 | Compare tests and gaps against acceptance criteria | High | Done | Keep a reduced 9.11; defer execution engine behavior to 9.14. |

## Timeline of Events

| Time | Event | Source | Confidence |
| --- | --- | --- | --- |
| 2026-07-13 | Story 9.11 recorded as backlog with no story artifact | sprint status and artifact inventory | Confirmed |
| 2026-07-13 | Directed CodeGraph and literal scans found deterministic safeguards but no worker manifest, registry, or runtime command | source and tests | Confirmed |

## Confirmed Findings

### Finding 1: Story 9.11 is planning-only

**Evidence:** `_bmad-output/implementation-artifacts/sprint-status.yaml`

**Detail:** The item is marked `backlog`, and no matching implementation story file exists.

### Finding 2: Existing primitives cover part of the safety contract

**Evidence:** `packages/core/src/index.ts:46`, `packages/core/src/index.ts:86`, `packages/core/src/index.ts:122`, `packages/core/src/index.ts:225`, `packages/core/test/core.test.mjs:530`, `packages/core/test/core.test.mjs:733`, `packages/core/test/core.test.mjs:755`

**Detail:** Downstroke already models deterministic/contextual/high-risk decisions, deterministic token routing, bounded context, workflow checkpoints, and evidence-backed facts.

### Finding 3: The native worker capability is absent

**Evidence:** `apps/cli/src/index.ts:134`, `apps/cli/src/index.ts:197`, `README.md:494`

**Detail:** The CLI has no `run` command or worker registration path, and public documentation still identifies explicit worker orchestration as roadmap work. Directed searches found no `NativeWorker`, `WorkerManifest`, worker registry, or worker audit implementation or tests.

### Finding 4: Story 9.14 owns execution-engine behavior

**Evidence:** `HOW.md:435`

**Detail:** The roadmap explicitly assigns `downstroke run` and Planner, Scheduler, Executor, Verifier, Recorder sequencing to Story 9.14.

## Deduced Conclusions

### Deduction 1: Story 9.11 is necessary but over-implementation would duplicate 9.14

**Based on:** Findings 2, 3, and 4.

**Reasoning:** Existing primitives can enforce the safety edges of worker use, but no schema-bound worker declaration or registry exists. Adding the execution engine in 9.11 would overlap the explicit ownership of 9.14.

**Conclusion:** Implement 9.11 as the minimum worker contract, native role registry, validation, preview/apply registration, and audit record surface. Do not add process orchestration or `downstroke run` in 9.11.

## Hypothesized Paths

### Hypothesis 1: Existing execution paths already satisfy Story 9.11

**Status:** Refuted

**Theory:** Recent native workflow and task-context work may already provide the deterministic execution route described by Story 9.11.

**Supporting indicators:** Stories 9.4 through 9.10 introduced native workflow, routing, context compilation, health, and cleanup capabilities.

**Would confirm:** Existing source and tests cover every essential Story 9.11 acceptance criterion without a new runtime abstraction.

**Would refute:** At least one essential acceptance criterion has no executable path or testable equivalent.

**Resolution:** Directed CodeGraph and literal scans found safeguards but no worker declaration, registry, audit, CLI registration path, or tests.

## Missing Evidence

| Gap | Impact | How to Obtain |
| --- | --- | --- |
| None | The necessity decision is supported by source, tests, and roadmap evidence. | N/A |

## Source Code Trace

| Element | Detail |
| --- | --- |
| Error origin | N/A; area exploration |
| Trigger | A contextual task cannot be satisfied by the deterministic single path. |
| Condition | Worker orchestration is proposed and must be schema-bound and permission-scoped. |
| Related files | `packages/core/src/index.ts`, `apps/cli/src/index.ts`, core and CLI tests |

## Conclusion

**Confidence:** High

Story 9.11 is necessary. Existing code provides reusable safety primitives but not the worker contract, registry, registration validation, or audit trail required by BR-005. Its implementation should remain deliberately smaller than an execution engine: `downstroke run` and Planner-to-Recorder sequencing stay in Story 9.14.

## Recommended Next Steps

### Fix direction

Create Story 9.11 with a narrow scope: native worker schema, the seven declared roles, deterministic-path rejection, preview/apply registration, mutation-right validation, claim classification, and append-only audit evidence. Reuse existing workflow, route, context, and experience primitives.

### Diagnostic

One core test should prove deterministic rejection and contract validation; one CLI test should prove preview/apply behavior and persisted audit output.

## Reproduction Plan

Register a valid read-only native worker, reject a malformed or mutation-bypassing worker, and reject worker orchestration for a deterministic task. Verify that claims remain observed or inferred until existing evidence validation promotes them.

## Side Findings

- Native release automation requested after this investigation overlaps Epic 10 release work and should be inserted through sprint change control before Story 9.11 implementation.
