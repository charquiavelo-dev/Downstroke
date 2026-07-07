# Sprint Change Proposal: Native-Only Downstroke Product

Status: accepted
Date: 2026-07-07

## 1. Issue Summary

Downstroke was intended to use external development tools while being built, then ship only native Downstroke capabilities. The current plan partially records native successors in Epic 9, but also defines the external toolchain as a permanent product requirement, keeps external product names in distributable templates and documentation, and preserves external fallbacks after native delivery. That contradicts the intended dependency-free product boundary.

The issue was confirmed during Story 3.1 review. Concrete conflicts exist in `README.md`, `packages/core/src/index.ts`, `packages/agents/templates/`, `packages/gates/templates/`, `packages/spec/templates/`, `docs/SPEC.md`, the PRD, architecture AD-6, and Epic 9 acceptance criteria.

## 2. Impact Analysis

### Checklist Summary

- [x] Trigger identified: Story 3.1 review exposed a roadmap/product-boundary mismatch.
- [x] Problem classified: misunderstanding of the original product requirement.
- [x] Evidence collected: runtime diagnosis, templates, README, PRD, architecture and roadmap expose external brands or dependencies.
- [x] Current epics remain viable, but Epic 2 must be classified as development-only transitional infrastructure.
- [x] Epic 9 remains necessary but must become a mandatory native capability epic, not optional successors with external fallback.
- [x] Epic 10 must block packaging/public release until the distributable surface contains no external tool dependency or branding.
- [x] PRD, architecture, epics, SPEC, templates, runtime diagnostics and public documentation require correction.
- [N/A] No UI/UX assets are affected.
- [x] Direct adjustment is viable; rollback of completed development evidence is unnecessary.

### Epic Impact

- **Epic 2:** Preserve completed work as internal development evidence. Its external bootstrap and diagnostics must not remain in the final package, generated projects or public docs.
- **Epics 3-8:** Functional scope remains valid. Generated artifacts must use neutral Downstroke terminology.
- **Epic 9:** Change from evidence-gated optional successors to mandatory native product capabilities. External tools may inform parity during development but are not runtime fallbacks or user-facing options.
- **Epic 10:** Add a release gate that scans the package, generated templates, CLI help and public documentation for external product names and dependencies.

### Artifact Conflicts

- **PRD:** FR4-FR5 and FR60-FR65 currently make external integration part of the product and permit permanent fallbacks.
- **Architecture:** AD-6 requires retaining the external path; this must become a development-provenance boundary with native-only release output.
- **SPEC:** Scope and governance headings expose external implementation names.
- **Runtime:** `packages/core/src/index.ts` diagnoses external installations and versions.
- **Templates:** generated AGENTS, CLAUDE, SPEC and gate documents instruct users to install and use external tools.
- **README/public docs:** market the external stack as mandatory.
- **Historical sources:** `docs/downstroke/source-guides/`, `.agents/`, `_bmad/` and `_bmad-output/` may retain names as internal development provenance, but must be excluded from distributable/public outputs.

## 3. Recommended Approach

Use a direct adjustment with a release-boundary migration:

1. Define four native Downstroke capabilities using product-owned names:
   - structural code intelligence;
   - concise communication controls;
   - simplicity and anti-bloat policy;
   - planning, stories, sprint and QA workflows.
2. Keep external tools only in internal development directories and historical source evidence.
3. Remove external detection, installation and fallback behavior from the final CLI/package.
4. Rewrite distributable templates and public documentation in Downstroke terminology.
5. Make Epic 9 mandatory before Epic 10 packaging and public release.
6. Add an automated release scan preventing external names, commands, package dependencies or generated instructions from entering distributable artifacts.

This is a **major planning correction** with medium implementation risk. It does not require reverting completed commits; it requires reclassifying transitional work and enforcing a clean product boundary before release.

## 4. Detailed Change Proposals

### PRD

**Old direction:** integrate and retain named external tools until optional successors prove parity.

**New direction:** external tools are internal construction aids only. Downstroke ships native product-owned capabilities and never requires, installs, diagnoses, invokes or advertises those external tools in runtime, generated projects or public documentation.

Replace FR4-FR5 and FR60-FR65 with brand-neutral native capability requirements. Replace NFR35 with a release invariant: native capabilities require focused verification, while no external fallback may cross the distribution boundary.

### Architecture

Replace AD-6 with:

> Development provenance does not become a product dependency. External tools may be used inside the maintenance repository, but release manifests exclude their configuration, commands, names and runtime assumptions. Native Downstroke capabilities own the shipped contracts.

Add a distribution boundary covering CLI output, package files, templates, generated docs and public documentation.

### Epic 9

Rename and rewrite Stories 9.1-9.5 around native Downstroke capabilities. Acceptance must verify native behavior directly and must not retain an external fallback. Story 9.1 becomes the native capability contract and release-boundary inventory rather than an optional investment gate.

### Epic 10

Add release acceptance criteria that fail if distributable files contain external product names, installers, commands, dependencies or instructions. Internal planning, historical source guides and agent-development configuration remain excluded by the release allowlist.

### Current Runtime and Templates

Create migration tasks to:

- retire external stack diagnosis/installation from the final CLI;
- rename planning governance to Downstroke Planning Governance;
- replace externally branded templates with native Downstroke instructions;
- update README and active project docs;
- preserve only internal/historical evidence outside the package allowlist.

## 5. Implementation Handoff

### Classification

Major: PM/architecture contract correction followed by backlog and implementation updates.

### Responsibilities

- **Product/architecture:** update PRD, architecture spine, SPEC and Epic 9/10 contracts.
- **Developer:** implement native capabilities and remove transitional runtime/template dependencies.
- **Release owner:** enforce the allowlist and external-reference scan before npm/public release.

### Success Criteria

- The installed package works without any external development tool installed.
- Generated projects contain only Downstroke-owned terminology and capabilities.
- CLI help, diagnostics and output contain no external product names or installation guidance.
- Public README/docs contain no external stack branding.
- Internal development tooling remains usable but cannot enter release artifacts.
- Epic 10 cannot start publication until the native-only release gate passes.

## 6. Imported Experience Documentation Addendum

The 42 imported documents and archive bundles were reviewed and preserved under `docs/legacy/imports/2026-07-07/`. Their accepted capabilities are mapped into Epics 3, 8, 9 and 10 in `experience-docs-integration-2026-07-07.md`. Conflicting older statements are retained only as historical evidence and do not override the native-only decision.
