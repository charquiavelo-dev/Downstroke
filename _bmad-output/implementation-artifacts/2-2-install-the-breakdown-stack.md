---
baseline_commit: 0e5c3f8
---

# Story 2.2: Install the Breakdown Stack

Status: done

## Story

As a developer,
I want to install missing Breakdown Stack tools through one guided command,
so that the project reaches a validated baseline without unsafe replacements.

## Acceptance Criteria

1. Given the current diagnostic report, when `downstroke setup-agents` runs without authorization, then it prints the affected tools, reviewed command, relevant files and planned mutations without changing the project.
2. Given explicit `--yes` authorization, when installation runs, then it invokes the repository bootstrap using canonical CodeGraph and BMAD commands, the local Caveman source and the configured canonical Ponytail command; it never guesses a package.
3. Given an existing valid tool or user-owned configuration, when installation runs, then it is preserved; malformed or conflicting evidence stops for manual review instead of being overwritten.
4. Given a missing Ponytail skill without `PONYTAIL_INSTALL_COMMAND`, when planning or applying runs, then the command fails safely with actionable guidance before any mutation.
5. Given successful application, when verification runs, then all four Breakdown Stack diagnostics are `ok`; otherwise the command returns nonzero and does not claim success.
6. Given `--json`, when planning completes, then a stable repository-relative plan is emitted without secrets or the value of the Ponytail command.

## Tasks / Subtasks

- [x] Add a repository-local installation plan and executor to `packages/core/src/index.ts` (AC: 1-6)
  - [x] Derive missing tools and conflicts from `diagnoseBreakdownStack`.
  - [x] Keep plan evidence repository-relative and redact the Ponytail command value.
  - [x] Execute only the reviewed bootstrap command and verify all four tools afterward.
- [x] Make `scripts/bootstrap-agents.ps1` preserve healthy existing installations (AC: 2-5)
  - [x] Install or repair only missing evidence; stop on malformed/conflicting evidence.
  - [x] Copy Caveman only when absent and require the canonical Ponytail command only when Ponytail is absent.
  - [x] Keep BMAD project output language English.
- [x] Add `setup-agents` to the CLI (AC: 1-6)
  - [x] Plan by default; require `--yes` for apply and retain `--dry-run` compatibility.
  - [x] Support human and JSON output with deterministic exit codes.
- [x] Add focused core and CLI tests and run repository gates (AC: 1-6)

## Dev Notes

### Current Code

- `diagnoseBreakdownStack` is the canonical repository-local health report and must remain the single source for tool state.
- `apps/cli/src/index.ts` owns argument parsing and rendering; process and filesystem effects belong in `packages/core`.
- `scripts/bootstrap-agents.ps1` already contains reviewed canonical commands. Reuse it rather than introducing another installer or dependency.

### Architecture Compliance

- Follow the mutation lifecycle `inspect -> plan -> authorize -> apply -> verify`; absence of `--yes` ends after plan.
- Preserve user-owned files. Existing malformed tool evidence is a conflict, not permission to overwrite.
- Resolve all paths from the selected repository root and never inspect credentials or `.npm.keys`.
- External tools remain external. This story does not build native replacements.

### Testing Requirements

- Use the existing Node test runner and no new dependency.
- Test planning, missing Ponytail configuration, authorization, redaction and failed verification without running real network installers.
- Run `npm run typecheck`, `npm test` and `npm run build`.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Red: the new tests failed because installation planning, application and `setup-agents` did not exist.
- Green: 13 Node tests passed after the minimal core, CLI and bootstrap changes.
- Gates: TypeScript typecheck, full build, PowerShell parse validation and the full test suite passed.
- Manual: `setup-agents --json` reported `noop` for the healthy repository without exposing environment values.

### Completion Notes List

- Added an inspect-plan-authorize-apply-verify flow with plan-only behavior by default and `--yes` authorization.
- Preserved healthy tool files, blocked malformed evidence and pinned BMAD validation/installation to 6.9.0.
- Kept the canonical Ponytail command outside output and required it only when Ponytail is missing.

### File List

- `_bmad-output/implementation-artifacts/2-2-install-the-breakdown-stack.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`
- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`
- `scripts/bootstrap-agents.ps1`

## Change Log

- 2026-07-01: Added guided, authorized Breakdown Stack installation with conflict protection and verification.
