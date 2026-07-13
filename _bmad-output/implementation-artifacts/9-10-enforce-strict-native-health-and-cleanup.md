---
baseline_commit: fa24acc04b0f3d6ec900c28eaa9fac4d520900f
---

# Story 9.10: Enforce Strict Native Health and Cleanup

Status: review

## Story

As a developer,
I want strict native health and cleanup checks,
so that old active instructions become visible blockers and release readiness is not confused with advisory warnings.

## Acceptance Criteria

1. Given existing legacy artifacts, when doctor runs, then they are classified as migration sources or conflicts, never healthy dependencies or installation recommendations.
2. Given cleanup, when previewed, then native parity, imported hashes, rewritten active docs, quarantine and archive targets are shown and `--yes` is required.
3. Given strict native mode, when active legacy instructions, missing parity, secret leakage or quarantine leakage remain, then health fails.
4. Given a blocked repository, when `downstroke health` runs, then it explains blockers, missing evidence, unresolved conflicts, failed gates and the next safe action.

## Tasks / Subtasks

- [x] Clarify generated agent onboarding so agents use native workflow state instead of inferred external methods. (AC: 1, 3)
- [x] Teach workflow resume/help to show the exact controlled-checkpoint approval command. (AC: 4)
- [x] Detect `docs/stories/` as non-native workflow state in doctor output. (AC: 1, 3)
- [x] Add `downstroke health` with strict mode that turns warnings and failed checks into blockers. (AC: 3, 4)
- [x] Document stack posture: React/TypeScript/.NET are strongest defaults, not a language gate. (AC: 4)
- [x] Add cleanup preview/apply for known legacy and non-native workflow archive targets. (AC: 2)
- [x] Feed blocked and high-risk workflow items into the health view. (AC: 4)
- [x] Feed unresolved conflicts into the health view. (AC: 4)
- [x] Add focused cleanup preview/apply tests. (AC: 2)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm.cmd test` - passing, 76/76.

### Completion Notes List

- Added native onboarding guardrails to generated `AGENTS.md` and `CLAUDE.md`.
- Added command guidance for controlled workflow checkpoint approval.
- Added doctor warning for non-native Markdown story workflow state.
- Added `downstroke health` and `--strict` gating behavior.
- Added high-risk and blocked workflow item reporting to `downstroke health`.
- Added unresolved workflow conflict reporting to `downstroke health`.
- Added `downstroke cleanup` preview/apply behavior for archiving known legacy sources without deletion.
- Updated README, SPEC, project start guide and project foundation to state that supported stacks are defaults, not hard limits.

### File List

- `AGENTS.md`
- `CLAUDE.md`
- `README.md`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`
- `docs/SPEC.md`
- `docs/downstroke/PROJECT_FOUNDATION.md`
- `docs/project-start-guides.md`
- `packages/agents/templates/AGENTS.md`
- `packages/agents/templates/CLAUDE.md`
- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`
- `packages/gates/templates/downstroke-workflow.md`
- `_bmad-output/implementation-artifacts/9-10-enforce-strict-native-health-and-cleanup.md`

## Change Log

- 2026-07-13: Started strict native health work and documented remaining cleanup scope.
- 2026-07-13: Completed strict health, conflict reporting and conservative cleanup archive flow.
