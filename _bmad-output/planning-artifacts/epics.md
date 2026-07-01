---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
inputDocuments:
  - docs/SPEC.md
  - docs/downstroke/source-guides/_bmad-output/architecture-downstroke-mvp.md
  - docs/downstroke/source-guides/_bmad-output/brief-downstroke-framework.md
  - docs/downstroke/source-guides/docs-es/23-multi-repo-workspace.md
  - docs/development-standard.md
  - docs/project-start-guides.md
  - docs/proven-project-rules.md
---

# Downstroke - Epic Breakdown

## Overview

This document organizes Downstroke requirements into implementable epics and stories. Evidence learned from other repositories is used only as anonymized technical knowledge; external repository paths, brands and product names must never appear in Downstroke artifacts.

## Requirements Inventory

### Functional Requirements

FR1: Downstroke can initialize a project with a minimal preset without overwriting user-owned files.

FR2: Downstroke can inspect an existing project and detect its stage, stack, scripts and installed tools.

FR3: `downstroke doctor` provides actionable results and can execute real typecheck, test and build commands when requested.

FR4: Downstroke diagnoses and installs CodeGraph, Caveman, Ponytail and BMAD as the Breakdown Stack without replacing them with native reimplementations.

FR5: Downstroke persists the BMAD review cadence and allows changes without deleting accepted work.

FR6: Downstroke offers GitFlow as the base Git policy using `main`, `develop`, `feature/*`, `release/*` and `hotfix/*`.

FR7: During project initialization, Downstroke requests authorization for branch creation, commits and pushes, explains the scope and persists the decision per project.

FR8: Users can inspect, enable, disable or change the Git policy through the CLI during a project.

FR9: The policy distinguishes local commit authorization from push authorization and never expands granted scope silently.

FR10: Downstroke proposes commits after important work blocks and validates Conventional Commit messages before creating them.

FR11: Generated commits do not mention AI and do not add `Co-Authored-By` trailers.

FR12: Before mutating Git state, Downstroke resolves the target repository root, branch, remote and working-tree status.

FR13: In multi-repository workspaces, Downstroke isolates operational identity, remotes, Git policy, authorization, reports and context per repository.

FR14: Downstroke detects child repositories, worktrees, submodules, declared monorepos and accidental nested repositories without confusing their roots.

FR15: Downstroke detects authentication failures or accounts incompatible with a remote and offers explicit, scoped recovery without deleting unrelated identities or credentials.

FR16: Downstroke never deletes or changes global credentials without showing the exact target and obtaining explicit confirmation.

FR17: Downstroke offers guides and diagnostics for deploying frontends, APIs and PostgreSQL with Railway, Supabase or Vercel according to project needs.

FR18: Hosting guides separate development, preview/staging and production configuration, including public variables and secrets.

FR19: Deployment integrations validate health/readiness, migrations, backups, observability and rollback before declaring production ready.

FR20: Supabase guidance covers Auth, PostgreSQL, Storage, Realtime, RLS and secure session handling when those capabilities are selected.

FR21: Downstroke helps users choose among Google Maps JavaScript API, Google Maps Embed API and open alternatives without assuming rendering, tiles, geocoding and routing share one provider.

FR22: The open-source path recommends MapLibre for modern vector maps and Leaflet for simple raster maps according to actual product needs.

FR23: Map guidance requires attribution, tile policies, limits, privacy, cost controls, restricted keys, fallback behavior and device testing where applicable.

FR24: Downstroke represents Git, hosting and map decisions as living rules and diagnostics rather than mandatory dependencies of the minimal preset.

FR25: Downstroke offers Expo and EAS as the primary React Native path, including initialization, diagnostics, build profiles and per-environment configuration.

FR26: The CLI makes repeatable Git, hosting, database, map and Expo operations accessible through detection, concise questions, previews and verifiable commands.

FR27: When a decision needs product or architecture context, Downstroke can delegate analysis to the LLM and turn the approved answer into reproducible configuration or tasks.

FR28: Before important, costly, destructive or broad decisions, the CLI or LLM asks relevant questions about goals, environment, provider, ownership, risk and rollback.

FR29: Downstroke separates responsibilities among the developer, LLM, CLI, repository, hosting provider and production operator.

FR30: Downstroke offers a preset and diagnostics for React web projects following project frontend rules.

FR31: Downstroke offers a preset and diagnostics for .NET and Blazor projects when C# provides a real advantage.

FR32: Downstroke can add and update managed blocks without overwriting user-owned content.

FR33: Downstroke shows diffs, conflicts and recovery plans before migrating managed rules or files.

FR34: Downstroke promotes a project rule into a reusable module only after repeated-use evidence exists.

FR35: Map guidance distinguishes Maps Embed API for simple `place`, `view`, `directions`, `streetview` or `search` iframes from Maps JavaScript API for events, overlays, layers, markers, clustering, routes or custom interaction.

FR36: Downstroke offers a guided path for 2D games and animations with Phaser.

FR37: Downstroke offers a guided path for 3D experiences, games and animations with Babylon.js.

FR38: Every Phaser or Babylon.js deliverable passes through three internal versions: functional implementation, first improvement and final second improvement.

FR39: Each game version is reviewed for requirements, interaction, performance, lifecycle, controls, responsiveness, applicable accessibility and error handling; improvement is not limited to test execution.

FR40: Downstroke delivers the third version with tests and summarized evidence of issues corrected during both improvement passes.

FR41: The CLI can install and configure Google Fonts with simple selection of families, weights, styles, subsets, `font-display` and fallbacks.

FR42: Downstroke can optionally create a design system as the source of truth for humans and LLMs, covering tokens, typography, color, spacing, radii, elevation, motion, components, states, accessibility and responsive rules.

FR43: The design system can generate guidance for Codex, Claude and other LLMs without duplicating or contradicting its neutral source of truth.

FR44: When Claude Design is available, Downstroke can prefer it for design-system exploration and application; otherwise it uses the best active LLM under the same contract and controls.

FR45: Before creating a design system, the CLI or LLM asks about product, users, visual personality, platforms, accessibility, content, existing brand and technical constraints.

FR46: The design system governs the logo, application icons, favicon, splash screen, loading treatment, typography, color, motion and components to preserve one brand identity.

FR47: The CLI generates or validates brand asset variants for web, Expo and other platforms from one source of truth.

FR48: During project initialization, Downstroke asks for required languages, source language, fallback language and supported locales.

FR49: All visible text comes from translation catalogs or a data source; demos, empty states, errors and operational content contain no hardcoded deliverable copy.

FR50: Temporary mockup copy is allowed only when clearly marked, and the delivery gate fails until it is replaced by translation keys or controlled data.

FR51: Before implementing data-dependent frontend work, Downstroke defines and prepares the backend contract, model, validation, permissions and required data.

FR52: Demo and QA data uses identifiable, idempotent, removable seeds isolated from production and is never presented as real operational data.

FR53: When creating an account-based dashboard, Downstroke asks whether 2FA is required and can guide an optional TOTP implementation.

FR54: TOTP enrollment provides a QR code and copyable manual key for same-device setup, verifies a code before activation and creates secure recovery options.

FR55: In mobile applications, Downstroke asks whether optional biometric unlocking is desired and preserves a secure fallback when biometrics are unavailable or fail.

FR56: Downstroke can estimate tokens for a task, backlog subset, sprint or complete plan before execution.

FR57: The CLI provides a `status`-style query showing observed usage, remaining estimate, assumptions, uncertainty range and selected scope.

FR58: LLM integrations can expose an equivalent `/status` command when the surface supports it and a CLI alternative when it does not.

FR59: Token estimates can appear compactly in a console footer or session summary without blocking the primary workflow.

FR60: Downstroke keeps native replacements for CodeGraph, Caveman, Ponytail and BMAD as explicit planned work rather than silently dropping them from the roadmap.

FR61: Native replacement work starts only after the corresponding external tool is installed, working in real projects and measured against documented use cases.

FR62: Downstroke can later provide native structural code intelligence that covers the proven CodeGraph use cases selected by evidence.

FR63: Downstroke can later provide native token-efficient communication controls that cover the proven Caveman use cases selected by evidence.

FR64: Downstroke can later provide native minimal-engineering policy enforcement that covers the proven Ponytail use cases selected by evidence.

FR65: Downstroke can later provide native planning and execution workflows that cover the proven BMAD use cases selected by evidence.

FR66: Downstroke can later provide an agent runtime for explicit, schema-bound orchestration after normal functions and the external stack prove insufficient.

FR67: Downstroke can later provide a remote module registry with provenance, versions, integrity verification and safe installation.

FR68: Downstroke can later automate managed-block migrations with conflict detection, preview, rollback and preservation of user-owned content.

FR69: For a greenfield project, Downstroke accepts a natural-language or technical product description and recommends supported stack options before initialization.

FR70: Each stack recommendation explains fit, tradeoffs, operational implications and which stated requirements caused it, then persists the user's approved choice.

FR71: When a project requires an unsupported language ecosystem, Downstroke states the limitation and does not invent a preset; additional language support remains deferred.

FR72: Before a documentation site exists, the repository README explains installation, quick start, supported workflows, CLI commands, configuration, safety behavior and troubleshooting well enough to use the framework.

FR73: Once the framework passes its functional and release gates, Downstroke can be packed and distributed as an npm package with a working CLI binary and only required runtime files.

FR74: Package readiness validates metadata, license, exports, Node compatibility, tarball contents, clean-install behavior and package provenance before publication.

FR75: npm publication is an explicit high-risk operation requiring authenticated maintainer confirmation, version selection and post-publish installation verification.

FR76: After README and npm distribution are ready, Downstroke can provide a React documentation and showcase site containing only working, verifiable framework capabilities.

FR77: After functional readiness, Downstroke can produce a sanitized public repository tree that contains the framework and required distributable assets but excludes internal planning, temporary configuration and development-process artifacts.

FR78: Before sanitizing public history, the complete development history is pushed to and verified in a separate private maintenance repository.

FR79: The sanitized public repository can start from one clean initial commit so its history does not expose internal project-construction steps.

FR80: The final public `.gitignore` excludes local agent state, BMAD development output, caches, credentials, build artifacts and maintenance-only files while retaining assets required by installed framework features.

FR81: Replacing public history or force-pushing the single-commit release requires a final preview, secret scan, package/build verification and explicit maintainer confirmation.

### Non-Functional Requirements

NFR1: TypeScript remains strict, Node uses ESM and production code contains no `any`.

NFR2: Mutating operations are idempotent or show a plan and diff before execution.

NFR3: No command overwrites user files, pushes, deletes credentials or applies destructive migrations without the required authorization.

NFR4: Per-repository configuration overrides user or system defaults without contaminating neighboring repositories.

NFR5: Secrets never appear in code, documentation, logs or reports; client-exposed variables are treated as public.

NFR6: Errors identify the repository, command, provider and next action without revealing tokens or private payloads.

NFR7: External providers define timeout, retry, rate-limit, fallback, cost and observability behavior.

NFR8: Database migrations are additive by default; destructive changes require backup and rollback.

NFR9: Deployment health checks are not presented as continuous monitoring.

NFR10: Supabase client-accessible tables require RLS and least-privilege policies.

NFR11: Map integrations allow provider changes without rewriting domain logic only when a second real provider exists.

NFR12: OpenStreetMap community tiles require attribution, identification and compliant caching; no SLA is assumed.

NFR13: Provider-dependent capabilities or prices are verified against current official documentation.

NFR14: Each non-trivial logic block leaves at least one focused automated check.

NFR15: Artifacts derived from external technical evidence remain anonymous.

NFR16: Deterministic CLI operations work without an LLM.

NFR17: Questions are proportional to risk and mandatory for auth, money, permissions, production, credentials, migrations and destructive data.

NFR18: Expo/EAS, hosting, map and database credentials stay in each platform's secure mechanism and are never copied between repositories.

NFR19: Google Maps keys are restricted by API and origin/application; web embeds preserve a compatible `referrerpolicy`.

NFR20: The three-version game gate cannot pass through identical executions; each pass records findings and verifiable changes or a justified no-change result.

NFR21: Interactive experiences define FPS, loading, memory, asset-size and target-device budgets before optimization.

NFR22: Game loops, listeners, engines, scenes, textures and other resources are disposed during teardown.

NFR23: Fonts include fallbacks and a loading strategy and request only used weights and subsets.

NFR24: The design system is provider-neutral, versioned and usable without Claude Design or external services.

NFR25: LLMs cannot change accepted tokens or patterns globally without impact visibility and approval.

NFR26: Brand assets remain traceable to one visual decision and pass dimension, contrast, legibility and platform checks.

NFR27: No deliverable control, message, error, empty state, accessible metadata or demo content depends on scattered visible literals in components.

NFR28: Translations preserve placeholders, pluralization, gender and locale formatting and are reviewed before becoming final copy.

NFR29: Frontends are not authorities for permissions, validation, ownership or data.

NFR30: Backend-first does not require remote infrastructure for genuinely static content, but the exception is explicit and translatable content stays outside components.

NFR31: TOTP secrets, recovery codes, session tokens and QR material are never logged, stored as plaintext or exposed after enrollment.

NFR32: Mobile biometrics protect local access to securely stored credentials and do not replace server authentication, authorization or revocation.

NFR33: Token estimates are reproducible ranges based on known model, context, artifacts and scope, never guaranteed exact values.

NFR34: Provider-specific pricing, context windows and accounting rules are versioned or checked against current sources before estimating monetary cost.

NFR35: No native replacement can become the default until it has a parity matrix, migration path, rollback path and evidence that it improves the proven external workflow.

NFR36: Native capabilities remain interoperable with existing project artifacts and do not lock users into the Downstroke runtime or registry.

NFR37: Remote modules require signed or integrity-verified artifacts, explicit provenance and no install-time arbitrary code execution.

NFR38: Stack recommendations are based on product capabilities, team constraints, deployment, data, realtime, offline and platform needs rather than popularity alone.

NFR39: npm package contents exclude source archives, secrets, local state, test fixtures and unrelated documentation unless explicitly required at runtime.

NFR40: Release artifacts are reproducible from a tagged commit and the published package version matches repository metadata and changelog state.

NFR41: The documentation site is accessible, responsive, internationalizable and never presents unfinished capabilities as available.

NFR42: Sanitization uses an explicit allowlist or release manifest; broad denylist deletion is not sufficient evidence that the public tree is safe.

NFR43: The private maintenance repository must be readable and contain the expected full-history tip before any public history rewrite begins.

NFR44: Public-history rewriting is never automatic, never runs during normal development and has a documented recovery path.

NFR45: npm recovery keys and equivalent account-recovery material are never tracked, read, logged, packaged or copied; `.npm.keys` is ignored explicitly.

### Additional Requirements

- Keep `core`, `spec`, `agents`, `gates`, `presets` and CLI as existing boundaries; do not create parallel Git, hosting, map or agent frameworks.
- Delegate deterministic operations to native Git and provider CLIs.
- Treat authorization as explicit capabilities with scope and lifetime rather than an ambiguous boolean.
- Require repository selection and the correct working directory before multi-repository mutations.
- Use documentation and diagnostics first; automate providers only for repeated, verifiable operations.
- Run Railway migrations during pre-deploy, separate readiness from continuous monitoring and require production backup planning.
- Separate Vercel Production, Preview and Development environments.
- Keep PostgreSQL authoritative; enable Supabase Auth, Storage and Realtime only when needed and protected by reviewed policies.
- Use Expo Router when useful, SecureStore for sensitive mobile tokens and documented EAS profiles.
- Keep CLI execution, LLM proposals, user approval, provider operations and repository state as separate responsibilities.
- Separate map rendering, tiles, geocoding and routing; use Maps Embed for simple web embedding and Maps JavaScript for programmatic control.
- Do not use community tile servers as production infrastructure with an SLA or for bulk offline use.
- Use Phaser for 2D and Babylon.js for 3D; do not ship both engines on one surface without demonstrated need.
- Implement the three-version gate as a workflow with evidence, not permanent duplicated branches or source copies.
- Use Google Fonts CSS API for the simplest web path and local/platform-specific loading when privacy, offline or React Native requires it.
- Store the design system as neutral versioned artifacts; LLM-specific guides are regenerable projections.
- Derive logos, icons, favicons, splash, loading and platform variants from one approved identity and shared tokens.
- Define i18n and content contracts before screens multiply.
- For data-backed surfaces, proceed through contract, model, backend and verification before frontend implementation.
- Use standard TOTP with QR and manual entry; treat mobile biometrics as local unlocking with secure fallback.
- Separate observed token usage from projection and always declare estimation assumptions.
- Treat native Breakdown Stack capabilities as evidence-gated successors: integrate external tools first, measure real use, implement the smallest proven native scope, and preserve rollback.
- Keep greenfield recommendations inside supported stack boundaries and make every recommendation explainable and overridable.
- Treat the README as the first complete user documentation; prepare and verify the npm tarball before publication; build the React documentation site only after package workflows are stable.
- Preserve full history privately before creating a one-commit public release; generate the public tree from a reviewed release manifest and apply the final public `.gitignore` only at release cut.
- Preserve Epic 1 and its Sprint 1 review state before Epic 2 implementation starts.

### UX Design Requirements

No formal UX contract exists. CLI work must retain actionable messages, `--json`, `--dry-run` and confirmations that identify target, scope and effect. Any future visible product surface must use the approved design system and localization contract.

### FR Coverage Map

FR1-FR3: Epic 1 - Safe initialization, inspection and verification.
FR4-FR5, FR27-FR29, FR56-FR59: Epic 2 - Breakdown Stack, governed collaboration and token visibility.
FR6-FR16: Epic 3 - GitFlow and multi-repository delivery.
FR17-FR20, FR24-FR26, FR30-FR31, FR51-FR55, FR69-FR71: Epic 4 - Guided stack selection, setup, backend-first delivery and account security.
FR21-FR23, FR35: Epic 5 - Selectable map providers.
FR32-FR34: Epic 6 - Safe managed-rule evolution.
FR36-FR40: Epic 7 - Three-pass 2D and 3D interactive delivery.
FR41-FR50: Epic 8 - Design system, brand and internationalization.
FR60-FR68: Epic 9 - Evidence-gated native platform evolution.
FR72-FR81: Epic 10 - Package distribution, sanitized public release and documentation.

## Epic List

### Epic 1: Installable and Verifiable MVP
Developers can initialize, inspect and verify a project without overwriting existing work.
**FRs covered:** FR1-FR3.

### Epic 2: Breakdown Stack and Governed Collaboration
Developers can install the agent stack, define review cadence and collaborate with CLI/LLM under clear responsibilities and visibility.
**FRs covered:** FR4, FR5, FR27-FR29, FR56-FR59.

### Epic 3: Safe Git and Multi-Repository Delivery
Developers can use GitFlow, semantic commits, scoped authorization and correct credentials across isolated repositories.
**FRs covered:** FR6-FR16.

### Epic 4: Guided Stack Setup and Deployment
Developers can prepare and deploy React, Expo or .NET applications with backend-first contracts and safe Railway, Supabase and Vercel guidance.
**FRs covered:** FR17-FR20, FR24-FR26, FR30, FR31, FR51-FR55, FR69-FR71.

### Epic 5: Selectable Map Providers
Developers can choose and integrate Google Maps JavaScript, Google Maps Embed, MapLibre or Leaflet according to actual product capabilities.
**FRs covered:** FR21-FR23, FR35.

### Epic 6: Safe Rule Evolution
Maintainers can update, migrate and promote reusable rules through managed blocks, diffs and safe recovery.
**FRs covered:** FR32-FR34.

### Epic 7: Rigorous Games and Interactive Experiences
Developers can create Phaser 2D or Babylon.js 3D experiences that pass three internal implementation and improvement versions before delivery.
**FRs covered:** FR36-FR40.

### Epic 8: Design System, Brand and Internationalization
Developers can create a consistent identity, install typography, generate neutral LLM guidance and deliver all copy through an internationalized content system.
**FRs covered:** FR41-FR50.

### Epic 9: Evidence-Gated Native Platform Evolution
Maintainers can graduate proven external workflows into native capabilities, an agent runtime, a remote registry and automatic managed migrations without losing interoperability or rollback.
**FRs covered:** FR60-FR68.

### Epic 10: Package Distribution and Public Documentation
Developers can understand Downstroke from the README, install a verified npm package, inspect a sanitized one-commit public repository and later use an accurate React documentation and showcase site.
**FRs covered:** FR72-FR81.

## Epic 1: Installable and Verifiable MVP

Developers can initialize, inspect and verify a project without overwriting existing work.

### Story 1.1: Preserve the Baseline and Import Sources

As a maintainer,
I want to preserve the historical baseline and source guides,
So that modules can be extracted without losing knowledge or confusing history with active rules.

**Acceptance Criteria:**

**Given** the existing baseline
**When** it is preserved under `examples/legacy-boilerplate/`
**Then** `.git`, indexes and runtime artifacts are excluded
**And** no original file is removed or changed.

**Given** the source guides
**When** they are versioned under `docs/downstroke/source-guides/`
**Then** they remain complete and clearly separate from active sources of truth.

**Given** that `AGENTS.zip` does not exist and has no product value
**When** the baseline is validated
**Then** its absence produces no error, warning or pending requirement.

### Story 1.2: Create the Monorepo Foundation

As a maintainer,
I want a minimal workspace structure with clear boundaries,
So that the CLI, core and modules can evolve without unnecessary dependencies.

**Acceptance Criteria:**

**Given** a clean checkout
**When** dependencies are installed
**Then** npm resolves `apps/cli`, `packages/core`, `spec`, `agents`, `gates` and `presets`.

**Given** the monorepo source
**When** typecheck runs
**Then** it compiles with strict TypeScript and Node ESM without errors.

**Given** any package
**When** its contents are reviewed
**Then** its responsibility is explicit and contains no unrelated application logic.

**Given** npm workspaces meet current needs
**When** the architecture is validated
**Then** Nx, Turbo and additional CLI frameworks are not added.

### Story 1.3: Initialize and Diagnose the Lite Preset

As a developer,
I want to initialize the lite preset and inspect actual project health,
So that I can adopt Downstroke without losing files or confusing detection with verification.

**Acceptance Criteria:**

**Given** an empty or existing project
**When** I run `downstroke init --preset lite`
**Then** planned actions are shown and only missing files are copied.

**Given** `--dry-run`
**When** initialization runs
**Then** the filesystem is not changed.

**Given** an inspected project
**When** I run `downstroke doctor`
**Then** stage, stack, scripts and Breakdown Stack are reported as `ok`, `warn` or `fail`
**And** human-readable and JSON output are available.

**Given** possible prompting signals
**When** they are reported
**Then** they are labeled as inferences rather than proven facts.

**Given** `doctor --run-checks`
**When** compatible scripts exist
**Then** `verified` is reported only after typecheck, tests and build execute successfully.

**Given** an existing file
**When** initialization applies the preset
**Then** the file remains unchanged and an automated test protects this guarantee.

## Epic 2: Breakdown Stack and Governed Collaboration

Developers can install the agent stack, define review cadence and collaborate with CLI/LLM under clear responsibilities and visibility.

### Story 2.1: Diagnose the Breakdown Stack

As a developer,
I want to know the actual state of every Breakdown Stack tool,
So that I can correct incomplete installations before planning or implementation.

**Acceptance Criteria:**

**Given** an existing project
**When** I run `downstroke doctor`
**Then** CodeGraph, Caveman, Ponytail and BMAD each report their detectable status and version.

**Given** a missing or damaged tool
**When** diagnosis completes
**Then** it reports `warn` or `fail`, concrete evidence and the next safe command.

**Given** CodeGraph configuration
**When** the tool is diagnosed
**Then** index health is validated rather than only checking file presence.

**Given** `--json` output
**When** the stack is diagnosed
**Then** it follows a stable schema and includes no secrets or paths outside the repository.

### Story 2.2: Install the Breakdown Stack

As a developer,
I want to install missing Breakdown Stack tools through one guided command,
So that the project reaches a validated baseline without unsafe replacements.

**Acceptance Criteria:**

**Given** a diagnostic report
**When** I request installation
**Then** the CLI shows the exact tools, commands, files and mutations before execution.

**Given** explicit approval
**When** installation runs
**Then** it uses canonical installers for CodeGraph, Caveman, Ponytail and BMAD
**And** does not guess similarly named packages.

**Given** an existing configuration
**When** a tool is installed
**Then** user-owned content is preserved and conflicts require manual review.

**Given** installation completion
**When** validation runs
**Then** CodeGraph is healthy, BMAD reports the expected version, and all four tools pass `doctor`.

### Story 2.3: Persist the BMAD Review Cadence

As a project maintainer,
I want the agreed review cadence stored in project state,
So that backlog generation and execution stop at the correct human checkpoints.

**Acceptance Criteria:**

**Given** a project without cadence configuration
**When** planning begins
**Then** the CLI asks for one-at-a-time, block, complete-sprint or final-draft review.

**Given** complete-sprint review
**When** it is selected
**Then** sprint length, real capacity and WIP limit are required and persisted.

**Given** an existing cadence
**When** the user changes it through the CLI
**Then** future planning uses the new cadence without deleting or rewriting accepted work.

**Given** auth, money, permissions, destructive data, migrations or production work
**When** stories are generated
**Then** each high-risk story still requires individual review regardless of cadence.

**Given** project state and `docs/SPEC.md`
**When** cadence changes
**Then** both remain consistent and `doctor` reports drift.

### Story 2.4: Govern CLI and LLM Decisions

As a developer,
I want Downstroke to separate deterministic execution from contextual decisions,
So that automation remains reproducible and important choices stay under human control.

**Acceptance Criteria:**

**Given** a deterministic operation
**When** the CLI can complete it locally
**Then** it works without an LLM.

**Given** a product or architecture decision
**When** context is required
**Then** the LLM proposes options with rationale, tradeoffs and affected artifacts
**And** the CLI applies only the approved option.

**Given** an important, costly, destructive or broad decision
**When** work reaches that boundary
**Then** Downstroke asks only the relevant questions about scope, ownership, environment, risk and rollback.

**Given** any proposed operation
**When** it is previewed
**Then** responsibility is explicit: user approves, LLM advises, CLI executes, repository records and provider applies infrastructure.

### Story 2.5: Estimate and Report LLM Token Usage

As a developer,
I want token estimates and usage status by planning scope,
So that I can evaluate backlog and sprint cost before execution.

**Acceptance Criteria:**

**Given** a task, backlog subset or sprint
**When** I request an estimate
**Then** the CLI reports a token range, model assumptions, included context and uncertainty.

**Given** observed session usage
**When** I run `downstroke status`
**Then** it separates consumed tokens from projected remaining tokens.

**Given** an LLM surface supporting custom commands
**When** its adapter is installed
**Then** an equivalent `/status` capability is available without replacing the CLI source of truth.

**Given** a console session
**When** compact status display is enabled
**Then** a non-blocking footer or closing summary shows the estimate.

**Given** unknown provider pricing or accounting rules
**When** monetary cost cannot be verified
**Then** Downstroke reports tokens without inventing a currency estimate.

## Epic 3: Safe Git and Multi-Repository Delivery

Developers can use GitFlow, semantic commits, scoped authorization and correct credentials across isolated repositories.

### Story 3.1: Configure Project GitFlow and Authorization

As a developer,
I want GitFlow and Git mutation permissions configured per project,
So that agents can create useful local commits without gaining unintended push authority.

**Acceptance Criteria:**

**Given** a new or existing repository
**When** Git policy setup begins
**Then** the CLI recommends `main`, `develop`, `feature/*`, `release/*` and `hotfix/*`
**And** previews any branches it would create.

**Given** project authorization setup
**When** the user selects allowed operations
**Then** local branch, commit and push permissions are stored separately with scope and lifetime.

**Given** local commits are authorized but push is not
**When** a work block completes
**Then** Downstroke may create an approved local commit but cannot authenticate or push.

**Given** an existing policy
**When** the user runs the policy command
**Then** it can be inspected, changed or disabled without modifying accepted commits.

**Given** a push operation
**When** no current explicit authorization exists
**Then** Downstroke shows repository, remote, branch and commits and waits for confirmation.

### Story 3.2: Commit Important Work Blocks Safely

As a developer,
I want Downstroke to create focused local commits after important work blocks,
So that repository history remains reviewable and recoverable.

**Acceptance Criteria:**

**Given** a completed work block
**When** commit preparation begins
**Then** Downstroke shows the exact changed and staged files and excludes unrelated user changes.

**Given** the selected changes
**When** a commit message is proposed
**Then** it follows Conventional Commits and describes the delivered outcome.

**Given** generated commit metadata
**When** the commit is created
**Then** it contains no AI mention and no `Co-Authored-By` trailer.

**Given** mixed or ambiguous changes
**When** a coherent commit cannot be isolated safely
**Then** Downstroke stops and requests scope selection instead of using `git add .`.

**Given** a successful local commit
**When** push is not authorized
**Then** the commit remains local and Downstroke reports the branch and commit hash.
