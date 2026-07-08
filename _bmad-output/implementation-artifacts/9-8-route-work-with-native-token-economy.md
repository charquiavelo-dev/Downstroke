---
baseline_commit: 6c02b3882c13efd9cc7b9fbd16e855a93450bf1b
---

# Story 9.8: Route Work with Native Token Economy

Status: ready-for-dev

## Story

As a developer,
I want greedy, balanced and rich execution policies,
so that each task uses the lowest sufficient reasoning and context while preserving quality.

## Acceptance Criteria

1. Given a task, when routed, then mode, task class, risk, model tier, context budget, cache strategy, escalation trigger and verification gate are recorded.
2. Given deterministic work, when tools can prove the result, then no LLM is required.
3. Given risk, ambiguity or failed verification, when thresholds are crossed, then execution escalates and the task ledger records the outcome.

## Tasks / Subtasks

- [ ] Add native token-economy routing contracts and deterministic policy in `packages/core/src/index.ts` (AC: 1-3)
  - [ ] Define bounded modes, task classes, risks, model tiers, cache strategies, verification states and a serializable route record.
  - [ ] Route tool-proven deterministic work to the no-LLM tier.
  - [ ] Escalate high risk, high ambiguity and failed verification without invoking a provider.
- [ ] Add repository-local task ledger persistence (AC: 1, 3)
  - [ ] Preview the exact route record before mutation.
  - [ ] Append authorized outcomes under `.downstroke/token-economy/` with schema validation and repository-relative state only.
  - [ ] Reject manipulated plans by recomputing policy before writing.
- [ ] Add `downstroke route` CLI preview/apply and JSON output (AC: 1-3)
  - [ ] Accept explicit task ID, task class, mode, risk, ambiguity, deterministic proof and verification outcome.
  - [ ] Keep routing provider-neutral and make escalation reasons visible.
- [ ] Add focused core and CLI tests for normal routing, no-LLM deterministic work, escalation, preview-only behavior and manipulated plans.
- [ ] Run typecheck, tests and native-only distributed-surface scan.

## Dev Notes

### Scope Boundary

- This story defines policy and records routing outcomes. It does not call an LLM, select a vendor model, implement billing, schedule workers or compile task context.
- `modelTier` is a provider-neutral capability tier: `none`, `economy`, `standard` or `advanced`.
- Story 9.9 owns safe context compilation. Story 9.11 owns workers. Story 10.7 owns calibration against observed provider usage.
- The implementation must use Node.js built-ins and existing core/CLI patterns; no dependency is justified.

### Native Policy

- `greedy` uses the smallest non-zero context budget and economy tier for ordinary model-assisted work.
- `balanced` is the safe default for contextual work.
- `rich` uses the largest bounded budget and advanced tier.
- Tool-proven deterministic tasks use tier `none`, context budget `0` and no model cache.
- High risk, high ambiguity or failed verification escalates to `rich`/`advanced` and records the reason.
- Verification is always explicit; high-risk and escalated routes require a blocking verification gate.

### State and Safety

- Store append-only JSON Lines at `.downstroke/token-economy/ledger.jsonl`.
- Every entry must include schema version, task ID, timestamp, selected mode, task class, risk, model tier, context budget, cache strategy, escalation trigger, verification gate and outcome.
- Preview must not create state. Apply requires `--yes` and must recompute the route from the request to reject manipulated plans.
- Do not store prompts, model output, secrets, absolute paths or provider credentials.

### Existing Code to Reuse

- Reuse token estimate terminology and bounded numeric validation from `estimateTokenUsage` and `tokenUsageStatus`.
- Follow preview/apply identity checks used by code intelligence and communication policy.
- Follow current CLI parsing and human/JSON rendering patterns.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story-98-Route-Work-with-Native-Token-Economy`]
- [Source: `_bmad-output/planning-artifacts/prds/prd-Downstroke-2026-07-01/prd.md#Functional-Requirements`]
- [Source: `_bmad-output/implementation-artifacts/2-5-estimate-and-report-llm-token-usage.md`]
- [Source: `_bmad-output/implementation-artifacts/9-7-add-native-code-intelligence.md`]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Pending implementation.

### Completion Notes List

- Created implementation-ready Story 9.8 with a provider-neutral, deterministic routing boundary.

### File List

- `_bmad-output/implementation-artifacts/9-8-route-work-with-native-token-economy.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-07-08: Created implementation-ready Story 9.8 contract.
