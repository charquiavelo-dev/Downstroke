---
baseline_commit: f2e7051
---

# Story 2.5: Estimate and Report LLM Token Usage

Status: done

## Story

As a developer, I want token estimates and usage status by planning scope, so that I can evaluate backlog and sprint cost before execution.

## Acceptance Criteria

1. `downstroke estimate --scope <task|backlog|sprint> --path <file>` reports a token range, model assumption, included repository-relative context and uncertainty.
2. Estimation is deterministic, local and clearly approximate; it never invents monetary cost.
3. `downstroke status` separates observed consumed tokens, when recorded, from projected remaining tokens; absent observations are reported as unavailable rather than zero.
4. JSON output is stable and contains no file contents, secrets or absolute paths.
5. A small CLI-source-of-truth status payload can be reused by future LLM adapters and console summaries; this story does not implement an agent runtime or persistent footer.
6. Missing, outside-root, non-file and oversized context inputs fail safely and actionably.

## Tasks / Subtasks

- [x] Add bounded local token estimation and status calculation to core (AC: 1-6)
- [x] Add `estimate` and `status` CLI commands with human and JSON output (AC: 1-6)
- [x] Add focused tests and run repository gates (AC: 1-6)

## Dev Notes

- Use byte/character counts and an explicit range; do not tokenize with a new dependency.
- Read only explicitly selected repository-local files and cap total input size.
- Monetary pricing and custom LLM command adapters are deferred until a concrete provider/runtime exists.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Red: token estimation exports and CLI commands were absent.
- Green: bounded estimation, outside-root rejection and observed/unavailable usage passed the 22-test suite.
- Manual: this story estimated at 349-581 tokens with high uncertainty and repository-relative context only.

### Completion Notes List

- Added deterministic 3-5 characters-per-token ranges with a one-million-character context cap.
- Added `estimate` and `status`; observed usage remains unavailable unless explicitly supplied.
- Skipped currency pricing, persistent footers and LLM adapters until concrete providers/runtimes exist.

### File List

- `_bmad-output/implementation-artifacts/2-5-estimate-and-report-llm-token-usage.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`
- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`

## Change Log

- 2026-07-02: Added bounded local token estimation and usage status reporting.
- 2026-07-06: Approved the preliminary estimator; deferred evidence-based calibration and available-budget decisions to Story 10.7.
