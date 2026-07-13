---
baseline_commit: 9b799dd14d3771dfde173902f1bdb1e5d3e95b88
---

# Story 10.2: Automate Native Downstroke Releases

Status: review

## Story

As a maintainer,
I want deterministic Downstroke release planning from repository history,
so that consistent releases can be prepared and verified without a third-party release framework.

## Acceptance Criteria

1. Given one unique reachable baseline tag and Conventional Commits after it, when `downstroke release plan` runs, then the highest required bump wins: breaking change is major, `feat` is minor, `fix` is patch, and non-product commits alone produce `none`.
2. Given release-worthy commits, when the plan renders, then version, channel, npm dist-tag, Git tag, grouped notes, changelog content, package targets, verification gates, risks, rollback direction and required approvals are available in human-readable and JSON output.
3. Given malformed commit history, no unique reachable baseline, dirty release-owned files, detached or unauthorized branch, unsupported package/lockfile topology, inconsistent workspace versions, or local tag/version collision, when planning runs, then it blocks with evidence and a next action rather than guessing.
4. Given identical repository state and inputs, when planning repeats, then its canonical output and SHA-256 plan hash are identical and no file, Git ref, remote, GitHub release or registry is mutated.
5. Given a ready plan and explicit local authorization, when `downstroke release prepare --plan <hash> --yes` runs, then it revalidates the plan and atomically updates only declared package versions, exact internal dependency versions, supported package-lock metadata, `CHANGELOG.md` and append-only `.downstroke/releases/` state; reruns are idempotent and interrupted preparation is recoverable or blocked with evidence.
6. Given a prepared release, when `downstroke release verify --plan <hash>` runs, then version consistency, configured typecheck/test/build, actual packed tarball allowlists, native-only scan and clean-fixture installation must pass before append-only state becomes `ready`; failure records evidence and never reports readiness.
7. Given planning, preparation or verification authority, when publication, push, Git tag creation, GitHub release creation, history rewriting or registry mutation is attempted, then Downstroke refuses because each is outside this story's capability.

## Tasks / Subtasks

- [x] Define and test the deterministic release contract (AC: 1, 2, 3, 4)
  - [x] Add failing core tests for bump precedence, no-release history, malformed commits, canonical SemVer/tag validation, baseline reachability, branch policy, dirty owned files, fixed-version workspace consistency and stable plan hashes.
  - [x] Add typed Downstroke release request, commit, package target, blocker, note group and plan contracts in `packages/core/src/index.ts`; external data enters as `unknown` and is narrowed without `any`.
  - [x] Reuse the existing argument-safe Git subprocess/root helpers and Node `crypto`; parse commit records with non-line delimiters so multiline bodies/footers remain intact.
  - [x] Require an explicit `stable`, `beta` or `rc` channel and verify it against branch policy: `stable` only on `main`, `beta` only on `develop`, and `rc` only on `release/*`. Stable maps to npm `latest`; prereleases map to their channel name and use reachable canonical tags for sequence. `feature/*`, `hotfix/*`, other branches and detached HEAD block.
  - [x] Produce canonical repo-relative, UTF-8/LF data whose hash excludes timestamps, cwd, locale, machine paths and external registry state.
- [x] Implement and test safe local release preparation (AC: 3, 5, 7)
  - [x] Add failing tests for stale plan hashes, changed HEAD/baseline/owned-file hashes, collisions, undeclared packages, dependency-graph gaps, unsupported lockfiles, repeat apply and simulated partial preparation.
  - [x] Revalidate the exact plan immediately before mutation; render every target in memory before writing.
  - [x] Use same-filesystem temporary files, a transaction journal and rollback/recovery evidence so manifests, exact internal dependency specs, lockfile metadata, changelog and release state cannot be reported prepared after a partial write.
  - [x] Keep the private workspace root as metadata only; publish targets are explicit non-private workspaces and use one fixed version. Do not select the six current workspaces automatically when the Release Manifest is unresolved.
  - [x] Append hash-chained `planned` and `prepared` events under `.downstroke/releases/`; identical prepared state succeeds without new writes, while the same version with another plan hash blocks.
- [x] Implement and test local release verification (AC: 2, 6, 7)
  - [x] Add failing tests proving failed checks, package-content leakage, version drift, clean-install failure and native-only violations cannot produce `ready`.
  - [x] Run only declared project scripts with argument-safe subprocesses; this repository uses `npm run typecheck`, `npm test` and `npm run build` and has no lint script.
  - [x] Pack declared targets into a temporary directory, inspect actual tarball names/hashes/allowlists, install the complete local tarball set in a clean fixture and smoke the CLI without registry publication.
  - [x] Append `ready` or `failed` evidence only after verification; prove Git refs/remotes and registry state were not mutated.
- [x] Expose the Downstroke CLI surface and focused integration tests (AC: 1-7)
  - [x] Add `downstroke release plan`, `downstroke release prepare --plan <hash> --yes` and `downstroke release verify --plan <hash>` to `apps/cli/src/index.ts` with preview-by-default, human output, `--json`, exact blockers and next commands.
  - [x] Add CLI tests using temporary Git/npm fixtures for read-only planning, authorized local preparation, verification and explicit rejection of publish/push/tag/release requests.
  - [x] Update README command/status documentation using only `Downstroke Native Releases` terminology and label actual npm publication as Story 10.4 work.
- [x] Run the full Definition of Done gate (AC: 1-7)
  - [x] Run `npm.cmd run typecheck`, `npm.cmd test` and `npm.cmd run build`.
  - [x] Run the native-only packaged-surface scan and a repository literal scan confirming the prohibited third-party release-product name is absent from active/distributable surfaces.
  - [x] Confirm the real repository correctly blocks because it currently has no baseline tag, is on `feature/platform-roadmap`, has unresolved publish targets and contains active planning changes; do not create a tag, change branch, prepare versions or clean user work to make it pass.

## Dev Notes

### Implementation Boundary

- This story implements local inspect/plan/prepare/verify only. It must never run `git tag`, `git push`, GitHub release commands, `npm publish`, `npm stage`, dist-tag mutation, deprecation, unpublish or history rewriting.
- Story 10.3 owns final package readiness and Release Manifest decisions. Story 10.4 owns authenticated/staged npm publication, provenance, remote tags/releases, post-publish verification and registry recovery.
- The repo has no tags today. Missing baseline is a correct blocker. Do not silently treat `package.json` version `0.1.0` as published. A separately approved first-release baseline decision is required later.
- The current branch is `feature/platform-roadmap`; it is not a release branch. Planning may explain this but cannot grant authorization.

### Technical Requirements

- Conventional parsing: optional scope, optional `!` immediately before `:`, case-insensitive type; `BREAKING CHANGE:` and `BREAKING-CHANGE:` are footer tokens, not arbitrary body text. Unknown valid types yield no bump unless breaking; malformed commits block. Ignore merge topology commits deterministically; do not invent revert cancellation.
- SemVer: accept canonical SemVer 2.0 without leading zeroes or empty/invalid prerelease identifiers. Reject build metadata for release versions/tags and reject numeric components beyond safe deterministic handling. Breaking changes always mean major, including `0.x`.
- Baseline: use one canonical reachable `vX.Y.Z[-channel.N]` tag. Block duplicates, unreachable/divergent candidates, tag/version/SHA disagreement and an existing next tag. Never choose by date.
- Branch/channel policy is explicit rather than inferred: `--channel stable` requires `main`, `--channel beta` requires `develop`, and `--channel rc` requires `release/*`. Hotfixes must merge to `main` before a stable release is planned.
- Fixed-version workspaces: root `private: true` is metadata only. Explicit publishable targets share one version; exact internal Downstroke dependency versions and `package-lock.json` entries move together. Block missing workspace lock entries, multiple package managers or unsupported lockfile versions.
- Stable plan hashing: include HEAD, baseline tag/SHA, policy version, selected targets, package metadata hashes and ordered commit SHAs/messages. Sort keys and set-like arrays; exclude volatile/external data.
- Preparation uses optimistic concurrency and recovery. Do not use default `npm version` behavior because it may create commits/tags and workspace inclusion is subtle.
- Release events are append-only and hash-chained. A worker, generated claim or local preparation cannot mark publication complete.

### Architecture Compliance

- Keep the functional core/imperative shell: core inspects, plans, applies and verifies; CLI parses and renders. [Source: `_bmad-output/planning-artifacts/architecture/architecture-Downstroke-2026-07-01/ARCHITECTURE-SPINE.md#Design-Paradigm`]
- Follow `inspect -> plan -> authorize -> apply -> verify`, scoped authorization, resolved Git root, atomic validated state and release allowlists. [Source: same architecture, AD-2, AD-4, AD-5, AD-9, AD-11]
- Reuse `runGit`, `gitRoot`, existing plan/apply drift checks, `scanNativeOnlySurfaces`, `runProjectChecks` and established JSONL/state patterns. Do not add a package, plugin system, daemon, global configuration or new workspace package.

### Files and Behaviors to Preserve

- `packages/core/src/index.ts`: shared strict types, Git subprocesses, repository confinement, plan/apply revalidation, workflow/token/context state and native-only scanning remain backward compatible.
- `apps/cli/src/index.ts`: retain strict `parseArgs`, preview-by-default behavior, JSON/human parity and all existing command exit codes.
- `packages/core/test/core.test.mjs` and `apps/cli/test/cli.test.mjs`: continue using Node's test runner and temporary isolated Git fixtures; assert non-mutation explicitly.
- Existing user work and the current planning/investigation artifacts are unrelated dirty changes and must be preserved.

### Project Structure Notes

- Expected implementation files: `packages/core/src/index.ts`, `packages/core/test/core.test.mjs`, `apps/cli/src/index.ts`, `apps/cli/test/cli.test.mjs`, `README.md`, this story and sprint status.
- Runtime output belongs under the target Git root at `.downstroke/releases/`; store only repository-relative paths and sanitized evidence.
- `CHANGELOG.md`, package manifests and lockfiles are target-repository release-owned outputs only after explicit preparation authorization.

### Testing Requirements

- Minimum focused coverage: one core planning matrix, one core prepare/recovery test, one core verification test and one CLI end-to-end fixture. Add cases within these tests rather than creating a large suite.
- Verify stable JSON and human output, unchanged filesystem after plan, no Git refs/remotes after all commands, exact changed-file allowlist after prepare and append-only evidence after verify.
- Full regression commands: `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run build`.

### Previous Story and Git Intelligence

- Story 10.1 has no implementation artifact, so there are no Epic 10 implementation learnings to import.
- Stories 9.8-9.10 established deterministic plans, stable hashes, preview/apply authorization, native-only scans, strict health blockers and concise next actions. Reuse those patterns rather than creating a parallel release framework.
- Recent commits use Conventional Commits (`feat:`, `fix:`, `docs:`), providing realistic parser fixtures.

### Current Platform Constraints

- Trusted and staged npm publication, OIDC, provenance, 2FA approval and registry recovery are explicitly deferred to Story 10.4. Story 10.2 records these as required future gates but does not authenticate or contact the registry.
- Staged publication cannot bootstrap a brand-new npm package; Story 10.4 must retain a separate first-publication approval path.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story-102-Automate-Native-Downstroke-Releases`]
- [Source: `docs/SPEC.md#Business-Rules-And-Invariants`]
- [Source: `docs/SPEC.md#API-And-Integrations`]
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-07-13.md`]
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
- [Semantic Versioning 2.0.0](https://semver.org/)
- [npm version](https://docs.npmjs.com/cli/v11/commands/npm-version/)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- RED: focused core and CLI fixtures initially failed because the release APIs and CLI surface did not exist.
- GREEN: Windows command execution was routed through `cmd.exe`; npm verification uses a temporary writable cache.
- HARDENING: added topology, drift, interruption, failed-check, allowlist, clean-install and native-only blocker coverage.

### Implementation Plan

- Add deterministic core planning first, then guarded preparation and local verification using existing Git/state/process helpers.
- Expose the three CLI actions without remote mutation and protect them with focused core/CLI fixtures.
- Keep all release naming Downstroke-native and reuse Node/npm/Git rather than adding dependencies.

### Completion Notes List

- Implemented deterministic fixed-version release plans from canonical reachable tags and Conventional Commits with stable SHA-256 plan hashes.
- Implemented guarded local preparation with exact target/dependency/lockfile updates, transaction evidence, rollback and hash-chained release events.
- Implemented local verification using declared checks, npm pack allowlists and hashes, clean temporary installation, CLI smoke support and native-only enforcement.
- Added human/JSON CLI commands and explicit rejection of publication or Git mutation.
- Documented Downstroke Native Releases and retained authenticated publication as separately reviewed Story 10.4 scope.
- Real-repository planning correctly blocks without mutation on the unauthorized feature branch, absent baseline and absent explicit package targets.
- Validation: `npm.cmd run typecheck`, `npm.cmd test` (80/80), `npm.cmd run build`, native-only scan and prohibited-name scan pass.

### File List

- `README.md`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`
- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`
- `docs/SPEC.md`
- `_bmad-output/planning-artifacts/architecture/architecture-Downstroke-2026-07-01/ARCHITECTURE-SPINE.md`
- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/prds/prd-Downstroke-2026-07-01/prd.md`
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-07-13.md`
- `_bmad-output/implementation-artifacts/10-2-automate-native-downstroke-releases.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-07-13: Added deterministic Downstroke Native Releases planning, guarded local preparation, local artifact verification, CLI integration, documentation and release evidence.
