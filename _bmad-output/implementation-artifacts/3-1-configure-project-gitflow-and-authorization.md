---
baseline_commit: cb192979f2c293494cfc005286cec63b2d3e1db0
---

# Story 3.1: Configure Project GitFlow and Authorization

Status: done

## Story

As a developer,
I want GitFlow and Git mutation permissions configured per project,
so that agents can create useful local commits without gaining unintended push authority.

## Acceptance Criteria

1. Given a Git repository, when `downstroke git-policy` runs without mutation options, then it reports the current repository-relative policy or the recommended `main`, `develop`, `feature/*`, `release/*` and `hotfix/*` policy without changing Git or files.
2. Given policy setup, when branch, commit and push preferences are proposed, then each operation is represented separately with repository scope and explicit lifetime; push remains execution-time authorization even when enabled as a project preference.
3. Given a valid proposal, when it is previewed, then the CLI reports `.downstroke/git-policy.json`, the resolved repository root, current branch and every branch it would create, and requires `--yes` before mutation.
4. Given authorized setup, when the policy is applied, then missing concrete base branches are created safely from the current HEAD, wildcard branch families remain naming rules only, and versioned project state is written atomically.
5. Given local commits enabled and push disabled, when the policy is inspected, then commit is allowed for Story 3.2 and push is denied; this story does not create commits or contact a remote.
6. Given an existing policy, when it is changed or disabled, then accepted commits, remotes, credentials and global Git configuration remain untouched.
7. Given a future push request, when no fresh execution authorization exists, then the contract requires repository, remote, branch and commits to be previewed and confirmation obtained; this story does not implement push.
8. Given malformed state, a non-Git directory, a dirty conflicting target branch, detached HEAD or failed Git command, then the operation fails actionably without claiming success or expanding authorization.
9. Given human or `--json` output, then results are stable, English, repository-relative where persisted, and contain no credentials, tokens or unrelated Git configuration.

## Tasks / Subtasks

- [x] Add the versioned Git policy contract and validation in `packages/core/src/index.ts` (AC: 1-9)
  - [x] Model GitFlow naming rules and separate `branch`, `commit` and `push` authorization preferences.
  - [x] Keep persisted scope repository-local; support only explicit lifetimes required by the CLI contract.
  - [x] Treat persisted push enablement as preference, never fresh execution authorization.
- [x] Add inspect, plan, apply and verify functions in `packages/core/src/index.ts` (AC: 1-9)
  - [x] Resolve the Git root with an argument-safe Git subprocess; do not invoke a shell.
  - [x] Preview only concrete missing base branches; never create wildcard branch names.
  - [x] Write `.downstroke/git-policy.json` through a same-directory temporary file and atomic replacement after Git operations succeed.
  - [x] Disable by persisting an explicit disabled policy; do not delete history or Git configuration.
- [x] Add `git-policy` handling in `apps/cli/src/index.ts` (AC: 1-9)
  - [x] Query by default, preview mutations by default, and apply only with `--yes` and no blocked conditions.
  - [x] Keep human and JSON rendering deterministic and secret-free.
- [x] Add focused core and CLI tests (AC: 1-9)
  - [x] Cover non-mutation, independent permissions, previewed branch creation, authorized apply, disabled policy and malformed/non-Git failure.
  - [x] Prove push is never executed and existing commits/remotes/global config are unchanged.
- [x] Run `npm run typecheck`, `npm test` and `npm run build`.

### Review Findings

- [x] [Review][Patch] Preserve successfully created branches after a later failure and return a structured result that identifies every partial mutation; never delete refs automatically [packages/core/src/index.ts:285]
- [x] [Review][Patch] Render current/recommended/next policy and separate branch, commit and push permissions in human query and preview output [apps/cli/src/index.ts:205]
- [x] [Review][Patch] Preserve unspecified existing permissions during updates and reject `--disable` combined with allow flags [apps/cli/src/index.ts:188]
- [x] [Review][Patch] Recompute and compare the plan at apply time so revision, current branch, base refs, permissions and required branch creation cannot drift or be manipulated [packages/core/src/index.ts:274]
- [x] [Review][Patch] Normalize parsed policy objects, reject unsafe revisions and prevent extra secret-bearing fields from being persisted [packages/core/src/index.ts:183]
- [x] [Review][Patch] Convert expected Git/filesystem failures into stable structured nonzero results [packages/core/src/index.ts:279]
- [x] [Review][Patch] Treat only `show-ref` exit code 1 as a missing branch; block other inspection failures [packages/core/src/index.ts:264]
- [x] [Review][Patch] Serialize concurrent applies and use exclusive unique same-directory temporary files [packages/core/src/index.ts:280]
- [x] [Review][Patch] Add isolated Git fixtures and coverage for human output, updates, tampering, detached/unborn HEAD, reruns, ref drift, failed commands and preserved repository configuration [packages/core/test/core.test.mjs:12]

## Dev Notes

### Scope Boundaries

- This story configures policy only. Story 3.2 owns staging and commits, Story 3.3 owns multi-repository topology, and Story 3.4 owns credential recovery.
- Do not add a Git library. Node subprocess and filesystem APIs already cover the required behavior.
- Do not implement push, authentication, credential deletion, GitFlow release automation or a generic Git executor.
- Reuse the existing `inspect -> plan -> authorize -> apply -> verify` pattern used by cadence and Breakdown Stack operations.

### Current State and Required Changes

- `packages/core/src/index.ts` currently owns filesystem/process effects, serializable plans and structured results. Add the smallest Git-policy contract there and preserve all existing commands.
- `apps/cli/src/index.ts` currently centralizes `parseArgs`, preview rendering and `--yes`. Extend that command surface; do not introduce a second parser or prompt framework.
- `packages/core/test/core.test.mjs` and `apps/cli/test/cli.test.mjs` use Node's built-in test runner and temporary fixtures. Use real temporary Git repositories with repository-local identity; never depend on the developer's global Git config.

### Architecture Compliance

- AD-1: core performs Git/filesystem effects; CLI parses and renders.
- AD-2: every mutation follows inspect, plan, authorize, apply and verify.
- AD-4: state is stored only under the resolved Git root in `.downstroke/git-policy.json`.
- AD-5: branch, commit and push are separate capabilities; push always needs fresh execution-time approval.
- AD-11: validate state as `unknown`, require a schema version and replace atomically. A stale loaded plan must not silently overwrite newer state.
- Persist repository-relative POSIX paths only. Absolute paths may appear in immediate human diagnostics but never in persisted state or stable JSON output.

### Git Safety Requirements

- Execute Git with argument arrays and an explicit `cwd`/`-C`; never concatenate user input into a shell command.
- Read before writing: root, HEAD state, current branch, refs and existing policy revision.
- Creating `develop` is allowed only when absent and the plan still matches current HEAD at apply time. Existing `main`/`master` history must not be renamed in this story.
- Treat detached HEAD, unborn repositories and branch/ref drift as blocked unless the plan can prove a safe deterministic result.
- Never read, print or modify credential helpers, tokens, `user.name`, `user.email`, remotes or global/system config.

### Testing Requirements

- Use only Node >=22, TypeScript strict and `node:test`; add no dependency.
- One focused fixture helper is acceptable only if both core and CLI tests consume it; otherwise keep setup local.
- Assert exact persisted JSON, no mutation during query/preview, safe reruns, nonzero blocked exits and stable JSON envelopes.
- Run tests with isolated environment/config so machine Git settings cannot make results pass accidentally.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story-31-Configure-Project-GitFlow-and-Authorization`]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-Downstroke-2026-07-01/ARCHITECTURE-SPINE.md#Invariants-and-Rules`]
- [Source: `docs/downstroke/source-guides/docs-es/23-multi-repo-workspace.md#Proteccion-Contra-Git-Root-Equivocado`]
- [Source: `AGENTS.md#Git-Rules`]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Red: core exports and CLI flags were absent; the new tests failed at the expected boundaries.
- Green: build, strict TypeScript typecheck and all 29 Node tests pass.
- Manual: `git-policy --json` reports repository-relative state, current branch and no mutation.

### Completion Notes List

- Added a versioned repository-local GitFlow policy with independent branch, commit and push preferences.
- Added preview-first `git-policy`; only `--yes` applies changes and push always requires fresh execution authorization.
- Added stale/tampered plan rejection, safe base-branch creation, atomic policy persistence and explicit disable behavior.
- Skipped commits, push execution, credentials and multi-repository topology for Stories 3.2-3.4.

### File List

- `_bmad-output/implementation-artifacts/3-1-configure-project-gitflow-and-authorization.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`
- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`

## Change Log

- 2026-07-06: Added governed repository-local GitFlow policy configuration and verification.
