---
baseline_commit: 1250988d296fa3cef9a5e5fd6bc69474e53c51f4
---

# Story 10.3: Prepare the npm Package

Status: review

## Story

As a maintainer,
I want one verified npm tarball,
so that users can install the Downstroke CLI without unpublished workspace dependencies.

## Acceptance Criteria

1. The public package is named `downstroke`, exposes the `downstroke` binary and declares Node.js compatibility, Apache-2.0 licensing, repository metadata and an explicit files allowlist.
2. Internal workspaces are non-publishable and bundled into the one public tarball through npm-native package behavior.
3. `npm pack --dry-run` proves only allowlisted runtime, metadata, README, license and bundled internal runtime files are present.
4. A clean fixture installs only the public tarball without registry access for internal workspaces, then help, init and doctor smoke checks pass.
5. Native release verification rejects missing metadata, unbundled internal dependencies, unsafe package contents, version drift and a broken binary.
6. Runtime/package surfaces contain only Downstroke-owned terminology and no secret, planning or maintenance artifacts.

## Tasks

- [x] Finalize one public manifest and Apache-2.0 package files.
- [x] Mark internal workspaces private and bundle them natively.
- [x] Tighten package verification around the single public tarball.
- [x] Add one focused package fixture/check and update source-of-truth docs.
- [x] Run typecheck, tests, build, pack, clean-install, native-only and diff gates.

## Dev Notes

- Reuse the Story 10.2 pack/install verifier; do not add a second release system or build dependency.
- npm `bundleDependencies` snapshots linked workspaces into the tarball. Keep the public package self-contained rather than publishing internal implementation packages.
- Publication, authentication, tags, pushes and registry mutation remain outside this story.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Completion Notes

- Renamed the sole public workspace to `downstroke`, added Apache-2.0, complete npm metadata, Node.js 22 enforcement, binary/export declarations and a strict files allowlist.
- Kept all five implementation workspaces private and staged only their built runtime/templates for npm-native bundled dependencies.
- Tightened existing release planning and verification instead of adding a parallel package workflow; public installs run offline and smoke-test help, init and doctor.
- Verified `downstroke@0.1.0` as one tarball with five bundled runtimes and 32 allowlisted entries.
- Passed typecheck, build and 93/93 tests; publication, tag creation and registry mutation remain excluded.

### File List

- `.gitignore`
- `LICENSE`
- `package.json`
- `package-lock.json`
- `apps/cli/package.json`
- `apps/cli/README.md`
- `apps/cli/test/cli.test.mjs`
- `packages/agents/package.json`
- `packages/core/package.json`
- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`
- `packages/gates/package.json`
- `packages/presets/package.json`
- `packages/spec/package.json`
- `scripts/stage-cli-package.mjs`
- `README.md`
- `docs/SPEC.md`
- `_bmad-output/implementation-artifacts/10-3-prepare-the-npm-package.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-07-13: Prepared and verified the self-contained Apache-2.0 `downstroke` npm tarball; moved story to review.
