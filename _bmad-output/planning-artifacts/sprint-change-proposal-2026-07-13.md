# Sprint Change Proposal: Native Release Automation

## 1. Issue Summary

The maintainer requested Downstroke-native release automation before work resumes at Story 9.11. The capability must cover the complete release lifecycle without adding a third-party release framework as a runtime dependency.

The current plan already governs package preparation, npm publication, provenance, private-history preservation, public sanitization, and post-publish verification through FR73-FR81, NFR39-NFR45, AD-5, AD-9, and Epic 10. What is missing is an explicit deterministic release planner that converts Conventional Commits into a reproducible version, changelog, release notes, channel, tag, and guarded execution plan.

Current platform evidence changes the safest publication path:

- npm trusted publishing uses short-lived OIDC credentials and automatically generates provenance for eligible public packages; it requires npm 11.5.1+ and Node 22.14+ ([npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)).
- npm staged publishing adds mandatory maintainer review and 2FA before a staged package becomes public; it requires npm 11.15+ and cannot stage a package's first release ([npm staged publishing](https://docs.npmjs.com/staged-publishing/)).
- Published registry versions are immutable and cannot be reused; recovery should prefer deprecation, dist-tag correction, or a new patch rather than automatic unpublish ([npm unpublish policy](https://docs.npmjs.com/policies/unpublish/), [npm dist-tags](https://docs.npmjs.com/cli/v11/commands/npm-dist-tag/)).
- Established release automation behavior includes commit analysis, next-version calculation, release-note generation, and guarded publication; Downstroke can implement those deterministic parts directly without a plugin framework.

## 2. Impact Analysis

### Epic impact

- **Epic 9:** No scope change. Story 9.11 remains necessary and narrowly scoped to worker contracts; its implementation resumes after native release planning is complete.
- **Epic 10:** Moderate backlog reorganization. Insert a deterministic release-planning story before package preparation and renumber the remaining unstarted stories.
- **Other epics:** No functional impact.

### Story impact

- Add a new Story 10.2 for native release planning and preparation metadata.
- Renumber current Stories 10.2-10.7 to 10.3-10.8. None has an implementation artifact, so no accepted work is rewritten.
- Strengthen package readiness and publication stories to consume the native plan and cover OIDC, staged publication, provenance, concurrency, idempotency, post-publish verification, and recovery.

### Artifact impact

- **PRD:** FR74, FR75, NFR40, success metrics, coverage maps, and release decisions need additive clarification.
- **Architecture:** AD-9 needs an explicit release-state lifecycle; AD-5 remains the authorization boundary.
- **SPEC:** Add native release-plan and release-state contracts plus current trusted/staged publishing constraints.
- **Sprint status:** Add the new story and renumber untouched Epic 10 backlog entries after approval.
- **UX:** No graphical UX impact. CLI output must retain human-readable and `--json` modes, preview by default, and explicit confirmations.
- **CI/CD:** A later publication story will add a GitHub-hosted OIDC workflow with least-privilege permissions and concurrency protection. The planning story does not publish, push, or create remote releases.

### Technical impact

- Reuse Node standard library, existing Git process helpers, Conventional Commit policy, inspect/plan/apply/verify lifecycle, and repository-local `.downstroke/` state.
- No new package dependency, plugin system, release daemon, or hosted service.
- The native planner reads Git history and package metadata; it writes only an authorized release plan, changelog/version preparation, and append-only release state.
- Registry mutation remains a separate high-risk capability and is not authorized by plan approval.

## 3. Recommended Approach

**Selected path: Direct Adjustment (Option 1).**

Add one deterministic planning story now, then retain separate package, publish, private-history, public-sanitization, documentation, and calibration stories. This is smaller and safer than introducing a release framework or collapsing all release responsibilities into one command.

- **Effort:** Medium.
- **Risk:** Medium for local planning; High for later npm publication and public-history operations.
- **Timeline:** Native planning is pulled ahead of Story 9.11 by explicit maintainer priority. After it reaches review, work resumes at Story 9.11.
- **WIP/capacity:** Existing sprint cadence remains 15 working days, 120 gross hours, WIP 3. Publication and destructive-history work remain individual-review items.
- **Rollback:** Local release-plan preparation is reversible before commit/tag. Published versions are immutable; recovery uses a new patch, deprecation, or dist-tag correction. Downstroke never auto-unpublishes.

## 4. Detailed Change Proposals

### PRD: FR74

**OLD**

> Package readiness validates metadata, license, exports, Node compatibility, tarball contents, clean-install behavior and package provenance before publication.

**NEW**

> Package readiness starts from a deterministic native release plan derived from Conventional Commits and the last valid release tag. The plan declares the next SemVer version, channel, tag, release notes, changelog changes, package/version consistency, required checks and publication authorization. Readiness then validates metadata, license, exports, Node/npm compatibility, allowlisted tarball contents, clean-install behavior and provenance before publication.

### PRD: FR75

**OLD**

> npm publication is an explicit high-risk operation requiring authenticated maintainer confirmation, version selection and post-publish installation verification.

**NEW**

> npm publication is an explicit high-risk operation requiring a verified native release plan, an authenticated maintainer checkpoint, immutable version and tag collision checks, provenance-capable CI, and post-publish installation verification. Eligible existing packages use trusted staged publishing and 2FA approval; first publication uses a separately approved bootstrap path.

### PRD: NFR40

**OLD**

> Release artifacts are reproducible from a tagged commit and the published package version matches repository metadata and changelog state.

**NEW**

> Release analysis is deterministic and idempotent for the same Git tip and prior tag. Artifacts are reproducible from the tagged commit; package metadata, lockfile, changelog, release notes, Git tag, GitHub release, npm version and dist-tag cannot disagree. Concurrent or repeated execution blocks or safely reports the existing release.

### Architecture: AD-9

Add this rule:

> Native releases follow `inspect -> analyze commits -> plan version/channel -> prepare metadata -> verify clean artifact -> authorize -> stage/publish -> verify registry install -> record`. Planning authority cannot publish, publishing authority cannot rewrite history, and no remote tag or release is reported complete before registry verification succeeds.

### New Story 10.2: Automate Native Downstroke Releases

As a maintainer, I want deterministic Downstroke release planning from repository history, so that Downstroke can prepare consistent releases without a third-party release framework.

**Acceptance Criteria**

1. Given the last valid release tag and Conventional Commits, when `downstroke release plan` runs, then it deterministically selects no release, patch, minor, or major; breaking-change footers and `!` trigger major, `feat` triggers minor, `fix` triggers patch, and non-product commits alone trigger no release.
2. Given release-worthy commits, when the plan is rendered, then version, stable/prerelease channel, npm dist-tag, Git tag, grouped release notes, changelog changes, package targets, checks, risks, rollback direction and required approvals are available in human-readable and JSON output.
3. Given malformed history, an invalid/missing baseline tag, dirty release-owned files, version/tag collisions, detached or unauthorized branches, or metadata disagreement, when planning runs, then it blocks with evidence and a next action rather than guessing.
4. Given identical repository state, when planning repeats, then the stable plan hash and output are identical and no file, tag, release, remote or registry is mutated.
5. Given explicit local authorization, when `downstroke release prepare --yes` runs, then only declared package versions, lockfile metadata, changelog and append-only `.downstroke/releases/` state are updated atomically; reruns are idempotent.
6. Given a prepared release, when verification runs, then configured typecheck/test/build, allowlisted package contents, clean-fixture installation, native-only scan and version consistency must pass before the state becomes `ready`.
7. Given publication is requested, when only planning/preparation approval exists, then Downstroke refuses to publish, push, create tags or create a GitHub release.

### Renumber and strengthen remaining Epic 10 stories

- Current 10.2 becomes **10.3 Prepare the npm Package** and must consume a verified native release plan.
- Current 10.3 becomes **10.4 Publish and Verify the npm Release** and adds OIDC trusted publishing, staged publication for eligible existing packages, explicit first-release bootstrap, provenance, concurrency protection, tag/version collision checks, post-publish clean install, and immutable outcome recording.
- Current 10.4 becomes **10.5 Preserve the Private Maintenance Repository**.
- Current 10.5 becomes **10.6 Cut a Sanitized Single-Commit Public Release**.
- Current 10.6 becomes **10.7 Launch the React Documentation and Showcase Site**.
- Current 10.7 becomes **10.8 Calibrate Token Estimates Against Observed Usage**.

Add to Story 10.4:

> Given a failed or defective publication, when recovery is planned, then Downstroke never automatically unpublishes or reuses a version; it proposes evidence-backed deprecation, dist-tag correction, or a new patch and requires fresh high-risk approval for registry mutation.

## 5. Implementation Handoff

**Scope classification:** Moderate — backlog reorganization plus a focused implementation.

### Product Owner / planning responsibility

- Apply the approved PRD, architecture, SPEC, Epic 10 and sprint-status edits.
- Preserve Epic 9 and all reviewed story states.
- Create only the new Story 10.2 implementation artifact now.

### Developer responsibility

- Implement Story 10.2 with Node/TypeScript and existing helpers; add no dependency.
- Use red-green-refactor and the smallest focused core and CLI tests.
- Do not publish, push, tag, or create a remote release.
- After Story 10.2 reaches review, resume Story 9.11 and continue the established roadmap.

### Later release responsibility

- Story 10.3 proves package readiness from the native plan.
- Story 10.4 configures and executes the high-risk npm/GitHub workflow only with fresh approval.
- First npm publication is explicitly separate because staged publishing requires an existing package.

## 6. Success Criteria

- The same Git state always yields the same release decision and plan hash.
- Version, changelog, notes, tag, channel and package metadata cannot drift silently.
- Planning and preparation cannot publish or push.
- Release verification uses the actual tarball and a clean installation.
- Eligible npm publication uses OIDC and provenance; staged approval provides proof of presence.
- Concurrent or repeated release attempts cannot publish the same version twice.
- Recovery never rewrites an immutable published version or auto-unpublishes.
- No third-party release framework, plugin abstraction, daemon, or hidden credentials are added.

## 7. Checklist Results

| Item | Status | Result |
| --- | --- | --- |
| 1.1-1.3 Trigger and evidence | [x] | New maintainer requirement; PRD/architecture and current npm behavior confirm the gap. |
| 2.1-2.5 Epic impact | [x] | Epic 10 changes; Epic 9 resumes afterward; no new epic or invalidated work. |
| 3.1 PRD | [!] | FR74, FR75, NFR40 and coverage maps require additive edits after approval. |
| 3.2 Architecture | [!] | AD-9 requires the native release lifecycle after approval. |
| 3.3 UX | [N/A] | No graphical UX; existing CLI contract applies. |
| 3.4 Other artifacts | [!] | SPEC, epics and sprint status require synchronized edits after approval. |
| 4.1 Direct adjustment | [x] Viable | Medium effort; smallest coherent change. |
| 4.2 Rollback | [x] Not viable | No completed work needs reversal. |
| 4.3 MVP review | [x] Not required | Existing release goals remain achievable. |
| 4.4 Selected path | [x] | Direct adjustment. |
| 5.1-5.5 Proposal and handoff | [x] | Defined above. |
| 6.1-6.2 Final review | [x] | Proposal is internally consistent and actionable. |
| 6.3 User approval | [x] | Approved by the maintainer on 2026-07-13 with Downstroke-native naming required. |
| 6.4 Sprint status | [x] | Approved Epic 10 reorganization is authorized. |
| 6.5 Handoff | [x] | Route Story 10.2 to development, then resume Story 9.11. |

## 8. Approval and Handoff

**Approved:** 2026-07-13.

**Naming condition:** Product code, commands, help, templates, active documentation, and distributable artifacts use `Downstroke Native Releases` and `downstroke release`; no third-party release-product name may appear.

**Route:** Product Owner/Developer applies the backlog edits. Developer implements Story 10.2 without remote publication, push, or tag mutation, then resumes Story 9.11.
