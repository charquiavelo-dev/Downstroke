---
baseline_commit: 8de25f3
---

# Story 2.4: Govern CLI and LLM Decisions

Status: done

## Story

As a developer,
I want Downstroke to separate deterministic execution from contextual decisions,
so that automation remains reproducible and important choices stay under human control.

## Acceptance Criteria

1. Given a deterministic operation, when governance is inspected, then it can execute locally without an LLM and still requires authorization when it mutates state.
2. Given a contextual product or architecture decision, when governance is inspected, then the contract requires options with rationale, tradeoffs and affected repository-relative artifacts; no option is treated as approved implicitly.
3. Given an important, costly, destructive or broad decision, when required scope, ownership, environment, risk or rollback context is missing, then only the missing relevant questions are returned.
4. Given a proposed operation, when previewed, then responsibility is explicit: user approves, LLM advises, CLI executes, repository records and provider applies infrastructure.
5. Given a contextual proposal and explicit option selection, when it is validated, then only a declared option can become approved; this story does not create a generic mutation executor.
6. Given CLI human or JSON output, then governance output is stable, English, repository-relative and contains no secrets.

## Tasks / Subtasks

- [x] Add a small pure decision-governance contract to `packages/core/src/index.ts` (AC: 1-6)
  - [x] Classify deterministic, contextual and high-risk decisions.
  - [x] Validate contextual options and explicit selection.
  - [x] Return only missing high-risk questions and fixed responsibility ownership.
- [x] Add a read-only `govern` CLI command (AC: 1-6)
  - [x] Support human and JSON inspection without an LLM or filesystem mutation.
  - [x] Accept proposal options through repeatable structured flags and require explicit selection.
- [x] Add focused core and CLI tests and run repository gates (AC: 1-6)

## Dev Notes

- Keep this story pure and read-only. Existing commands already demonstrate deterministic local execution and authorization.
- Do not add an LLM SDK, agent runtime, generic executor, remote registry or provider integration.
- The governance result is a reusable contract for later operations, not a speculative orchestration framework.
- Use the existing Node test runner and no new dependency.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Red: governance exports and `--kind` parsing were absent, producing the expected failures.
- Green: deterministic, contextual and high-risk governance passed the full 20-test suite.
- Gates: full build and strict TypeScript typecheck passed.
- Manual: high-risk JSON output returned only the three missing environment, risk and rollback questions.

### Completion Notes List

- Added a pure, read-only governance contract with explicit responsibility ownership and authorization signals.
- Contextual proposals require two complete repository-relative options and explicit selection of a declared option.
- High-risk governance asks only for missing scope, owner, environment, risk and rollback context.
- Deliberately skipped a generic executor and LLM SDK; existing concrete commands remain the execution boundary.

### File List

- `_bmad-output/implementation-artifacts/2-4-govern-cli-and-llm-decisions.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`
- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`

## Change Log

- 2026-07-02: Added read-only CLI/LLM decision governance and validation.
