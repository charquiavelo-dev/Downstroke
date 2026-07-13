# npm Package Preparation Necessity Investigation

Date: 2026-07-13
Backlog item: Story 10.3, Prepare the npm Package
Decision: Necessary; implemented after the owner selected Apache-2.0.

## Evidence

- `apps/cli/package.json` is named `downstroke-cli`, while the intended public command and product name are `downstroke`.
- The package lacks final description, keywords, author, license, repository, bugs, homepage, engine and publish configuration metadata.
- Its tarball depends on unpublished `@downstroke/core` and `@downstroke/presets` workspaces; a standalone public install cannot rely on those registry packages.
- The remaining internal workspaces are also public by default even though the product currently needs one installable CLI package.
- Native release verification can pack and install several local tarballs together, which does not prove that the single public CLI tarball has no unpublished dependency.
- On 2026-07-13, the npm registry returned `404` for both `downstroke` and `downstroke-cli`; availability must still be rechecked immediately before publication.
- No repository license file or chosen package license exists. Selecting a public software license is an owner/legal decision, not an implementation default.

## Smallest Safe Path

1. Publish one package named `downstroke` with the `downstroke` binary.
2. Keep internal workspaces unpublished and bundle their runtime output into the public tarball using npm's native package mechanism.
3. Add explicit metadata, an allowlisted tarball, a license file and a clean offline-style tarball install/smoke test.
4. Tighten native release verification so one public tarball proves it does not fetch unpublished internal packages.

No registry publication, tag, push or release creation belongs to Story 10.3.

## Owner Decision

The owner selected Apache-2.0 on 2026-07-13. Story 10.3 finalized the manifest and repository license from that decision.
