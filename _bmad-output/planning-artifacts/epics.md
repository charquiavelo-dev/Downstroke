---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
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

FR60: Downstroke provides native workflow, communication, simplicity and code-intelligence capabilities under Downstroke-owned contracts and names.

FR61: External construction artifacts are migration sources only; they are detected without execution, imported with provenance and excluded from distributable output.

FR62: Downstroke provides repo-scoped incremental file, symbol, import, impact and bounded-context intelligence for supported stacks.

FR63: Downstroke provides native communication modes, protected-content rules, context budgets and source-linked handoffs.

FR64: Downstroke provides native reuse, dependency, abstraction and broad-rewrite gates with explicit safety exceptions.

FR65: Downstroke provides native briefs, specs, epics, stories, cadence, checkpoints, QA evidence and resume behavior.

FR66: Downstroke can later provide a native worker runtime for explicit, schema-bound orchestration after deterministic functions and single-path execution prove insufficient.

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

FR82: Material conflicts between active project sources require evidence, options, decision ownership and a human checkpoint; Downstroke never chooses a semantic winner silently.

FR83: Downstroke provides a controlled development mode with persisted plan, review, implementation and verification checkpoints and safe resume behavior.

FR84: Downstroke provides an explicit native execution engine that coordinates planner, scheduler, executor, verifier and recorder stages, with deterministic execution attempted before worker orchestration.

FR85: Downstroke separates knowledge, evidence, import and trust lifecycle policies so facts can expire, become stale, be invalidated or lose confidence only through explicit evidence.

FR86: Downstroke provides a native health engine that explains blockers, missing evidence, unresolved conflicts, failed gates and highest-risk workflow items.

FR87: Downstroke provides native schema-bound workers for Planner, Repository Inspector, Risk Auditor, Evidence Validator, Workflow Guardian, Context Compiler and Release Guardian.

FR88: Workflow state supports migration-safe ownership, dependencies, priority, estimates, rollback references, deferred work and evidence links without an external workflow engine.

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

NFR46: Native workers cannot mutate project state unless the execution task declares the capability, the worker manifest permits it and the required workflow approvals exist.

NFR47: Multi-worker orchestration is used only when deterministic or single-path execution is insufficient; simple tasks remain single-path.

NFR48: Worker outputs are claims until evidence policy validates them; no worker can create verified facts, complete checkpoints or grant release approval by assertion alone.

### Additional Requirements

- Keep `core`, `spec`, `agents`, `gates`, `presets` and CLI as existing boundaries; do not create parallel Git, hosting, map or agent frameworks.
- Treat native workers as product capabilities with typed contracts, not personalities, prompts or external agent-framework wrappers.
- Model execution as Planner -> Scheduler -> Executor -> Verifier -> Recorder before adding any worker fan-out.
- Provide the first native worker roles as Planner, Repository Inspector, Risk Auditor, Evidence Validator, Workflow Guardian, Context Compiler and Release Guardian.
- Keep worker manifests explicit about input schema, output schema, allowed tools, mutation rights, budget, stop condition, evidence requirements and audit records.
- Split Operational Experience internals into knowledge, evidence, import and trust/lifecycle responsibilities while preserving one user-facing experience command family.
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
FR60-FR68, FR82-FR88: Epic 9 - Evidence-gated native platform evolution.
FR72-FR81: Epic 10 - Package distribution, sanitized public release and documentation.

### Story Coverage Map

- 1.1: FR1; 1.2: FR1-FR3; 1.3: FR1-FR3.
- 2.1: FR4; 2.2: FR4; 2.3: FR5; 2.4: FR27-FR29; 2.5: FR56-FR59.
- 3.1: FR6-FR9; 3.2: FR10-FR11; 3.3: FR12-FR14; 3.4: FR15-FR16.
- 4.1: FR69-FR71; 4.2: FR26, FR30; 4.3: FR25-FR26; 4.4: FR26, FR31; 4.5: FR17-FR18, FR24; 4.6: FR19-FR20; 4.7: FR51-FR52; 4.8: FR53-FR54; 4.9: FR55.
- 5.1: FR21-FR23; 5.2: FR35; 5.3: FR21, FR35; 5.4: FR22-FR23; 5.5: FR23.
- 6.1: FR32; 6.2: FR33; 6.3: FR34.
- 7.1: FR38-FR40; 7.2: FR36, FR38-FR40; 7.3: FR37-FR40.
- 8.1: FR42, FR45; 8.2: FR41; 8.3: FR46-FR47; 8.4: FR48-FR50; 8.5: FR43-FR44.
- 9.1: FR60-FR61; 9.2: FR60; 9.3: FR61, FR82; 9.4: FR65, FR82-FR83, FR88; 9.5: FR63; 9.6: FR64, FR87; 9.7: FR62; 9.8: FR56-FR59; 9.9: FR63, FR82, FR87; 9.10: FR60-FR61, FR86; 9.11: FR66, FR84, FR87; 9.12: FR67; 9.13: FR68; 9.14: FR84, FR88; 9.15: FR85-FR86.
- 10.1: FR72; 10.2: FR73-FR74; 10.3: FR75; 10.4: FR78; 10.5: FR77, FR79-FR81; 10.6: FR76.

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
Maintainers can graduate proven external workflows into native capabilities, a worker runtime, a remote registry, native execution, health and automatic managed migrations without losing interoperability or rollback.
**FRs covered:** FR60-FR68, FR82-FR88.

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

This story provides preliminary visibility only. Accuracy calibration and available-budget decisions are deferred to Story 10.7, after all product and release workflows are complete and representative observed usage exists.

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

### Story 3.3: Resolve Repository Roots and Workspace Topology

As a developer,
I want Downstroke to identify the exact repository topology before mutations,
So that commands never affect the wrong repository.

**Acceptance Criteria:**

**Given** any working directory
**When** a Git mutation is planned
**Then** Downstroke resolves the actual top-level root and executes with the correct `cwd`.

**Given** multiple child repositories
**When** the parent workspace is scanned
**Then** each repository, remote, branch and dirty state is isolated.

**Given** a parent `.git` plus nested repositories
**When** they are not declared worktrees or submodules
**Then** Downstroke reports a risk and requires target selection.

**Given** workspace markers such as npm workspaces, Nx or Turbo
**When** only one Git root exists
**Then** Downstroke treats it as a monorepo rather than unrelated repositories.

**Given** a workspace-level command
**When** it could affect multiple repositories
**Then** Downstroke previews every target and requires a filter or explicit confirmation.

### Story 3.4: Recover Git Authentication Safely

As a developer,
I want Downstroke to recover from incorrect Git credentials without disturbing unrelated accounts,
So that each repository can authenticate against its intended remote safely.

**Acceptance Criteria:**

**Given** an HTTPS `401` or `403`
**When** Downstroke diagnoses the failure
**Then** it reports the remote and credential target without exposing tokens.

**Given** a cached credential conflict
**When** recovery is proposed
**Then** Downstroke shows the exact credential entry to remove and waits for confirmation.

**Given** approved credential removal
**When** the operation runs
**Then** only that host/account credential is removed
**And** global `user.name`, `user.email`, Azure, Bitbucket and unrelated GitHub credentials remain unchanged.

**Given** a cleared credential
**When** authentication is retried
**Then** the user signs in interactively with the intended account before any push.

**Given** repositories using different accounts
**When** each repository is configured
**Then** credential context remains repository-specific and no token is stored in project files.

### Story 3.5: Import a Hosted Git Repository Safely

As a developer,
I want Downstroke to clone an existing hosted repository into a safe target,
So that onboarding preserves repository identity, credentials and workspace boundaries.

**Acceptance Criteria:**

**Given** a provider shorthand, HTTPS URL or SSH URL **When** import is planned **Then** provider, normalized remote, engine, destination, ref, depth, submodules, LFS and subsequent Downstroke initialization are previewed without network mutation.
**Given** an available authenticated provider CLI **When** it matches the remote **Then** it may be selected; otherwise argument-safe `git clone` is used without embedding credentials in URLs or logs.
**Given** a non-empty destination or unintended parent Git repository **When** import is planned **Then** the operation blocks unless an explicit safe workspace target is selected.
**Given** `--yes` **When** cloning succeeds **Then** preflight runs inside the resolved child repository and initialization occurs unless `--no-install` was selected.
**Given** branch, tag or commit options **When** supplied together **Then** incompatible selections fail before network access.

### Story 3.6: Diagnose Git Provider and Clone Readiness

As a developer,
I want provider and destination readiness diagnosed without changing credentials,
So that private and multi-repository imports fail safely and explain the next action.

**Acceptance Criteria:**

**Given** `downstroke repo doctor` **When** run locally **Then** Git, optional provider CLIs, authentication readiness, protocol, LFS, destination and parent-repository risk are reported without revealing secrets.
**Given** a private or unreachable repository **When** diagnosis fails **Then** scoped provider login, SSH or credential-manager options are explained without reading or mutating global credentials.
**Given** workspace import **When** multiple repositories are proposed **Then** each destination, identity and context namespace is isolated and previewed individually.

## Epic 4: Guided Stack Setup and Deployment

Developers can select, prepare and deploy supported application stacks with backend-first contracts and optional account security.

### Story 4.1: Recommend a Supported Greenfield Stack
As a developer, I want stack recommendations derived from my product description, So that initialization starts from justified technical choices.

**Acceptance Criteria:**
**Given** a natural-language or technical description **When** analysis runs **Then** Downstroke asks only missing product, platform, data, realtime, offline, team and deployment questions.
**Given** sufficient context **When** options are presented **Then** each supported stack includes fit, tradeoffs and requirement evidence.
**Given** an unsupported ecosystem **When** no preset exists **Then** Downstroke states the limitation and does not invent support.
**Given** a selected option **When** the user approves it **Then** the decision and rationale are persisted.

### Story 4.2: Initialize a React Web Project
As a web developer, I want a supported React preset, So that frontend projects start with verified project rules.

**Acceptance Criteria:**
**Given** the React preset **When** initialization is previewed **Then** framework, TypeScript, styling, validation, state and test choices are explicit and overridable.
**Given** approval **When** initialization runs **Then** only missing files are added and existing routes and configuration are preserved.
**Given** completion **When** doctor runs **Then** typecheck, lint, test and build scripts are detected and executable where configured.

### Story 4.3: Initialize an Expo and EAS Project
As a mobile developer, I want an Expo/EAS preset, So that mobile environments and release profiles are reproducible.

**Acceptance Criteria:**
**Given** a mobile project **When** setup runs **Then** Expo Router is recommended when useful and sensitive tokens use SecureStore rather than AsyncStorage.
**Given** EAS is selected **When** configuration is generated **Then** development, preview and production profiles and environment ownership are documented.
**Given** release preparation **When** doctor runs **Then** Expo config, EAS profiles, public variables and required device checks are validated.

### Story 4.4: Initialize a .NET or Blazor Project
As a .NET developer, I want a supported ASP.NET Core preset with optional Blazor, So that C# is used where it provides real value.

**Acceptance Criteria:**
**Given** a .NET project **When** setup runs **Then** ASP.NET Core is the default and Blazor requires an explicit UI rationale.
**Given** persistence needs **When** PostgreSQL is selected **Then** EF Core migrations follow additive and rollback rules.
**Given** completion **When** doctor runs **Then** `dotnet build` and `dotnet test` are verified.

### Story 4.5: Configure a Hosting Provider
As a developer, I want guided Railway, Supabase or Vercel setup, So that environments and responsibilities match the application architecture.

**Acceptance Criteria:**
**Given** application requirements **When** providers are compared **Then** frontend, API, database, auth, storage and realtime ownership are shown separately.
**Given** a provider choice **When** configuration is planned **Then** development, preview and production variables are separated and secrets never enter repository files.
**Given** a deterministic provider CLI operation **When** execution is requested **Then** the exact command and target are previewed and require appropriate authorization.

### Story 4.6: Enforce Production Deployment Gates
As an operator, I want deployment readiness checks, So that successful builds are not confused with production readiness.

**Acceptance Criteria:**
**Given** an API deployment **When** readiness is checked **Then** health endpoint, port binding, migration, backup, rollback, logs and continuous monitoring are evaluated separately.
**Given** Railway pre-deploy migrations **When** a migration fails **Then** deployment does not proceed.
**Given** Supabase client access **When** production is evaluated **Then** RLS, least-privilege policies, redirects, storage and recovery are checked.

### Story 4.7: Establish Backend Contracts Before Frontend Work
As a product developer, I want data contracts prepared before dependent UI, So that frontend work uses real validated behavior.

**Acceptance Criteria:**
**Given** a data-backed workflow **When** implementation is planned **Then** model, schemas, permissions, errors and ownership are defined before frontend tasks.
**Given** QA data needs **When** seeds are created **Then** they are idempotent, removable, non-production and clearly identified.
**Given** genuinely static content **When** backend infrastructure is unnecessary **Then** the exception is recorded and translatable content remains outside components.

### Story 4.8: Add Optional Dashboard TOTP
As an account owner, I want optional TOTP protection, So that dashboard access can require a second factor.

**Acceptance Criteria:**
**Given** an account dashboard **When** auth design begins **Then** the user is asked whether TOTP is required.
**Given** enrollment **When** setup starts **Then** QR and copyable manual key are provided and activation requires a valid code.
**Given** successful activation **When** recovery is prepared **Then** one-time recovery codes are protected and secrets are never logged or redisplayed.
**Given** implementation or rollout **When** work begins **Then** explicit high-risk approval is required.

### Story 4.9: Add Optional Mobile Biometric Unlocking
As a mobile user, I want optional biometric unlocking, So that local access is convenient without weakening server security.

**Acceptance Criteria:**
**Given** a mobile app **When** auth options are selected **Then** biometric unlocking is offered but not enabled silently.
**Given** opt-in **When** credentials are unlocked **Then** platform secure storage and native authentication are used.
**Given** unavailable or failed biometrics **When** access is attempted **Then** a secure account fallback remains available and server revocation still applies.

## Epic 5: Selectable Map Providers

Developers can choose and integrate map capabilities without coupling domain logic to one vendor.

### Story 5.1: Select Map Capabilities and Providers
As a developer, I want a capability-based map decision, So that rendering, tiles, geocoding and routing fit the product.

**Acceptance Criteria:**
**Given** a map feature **When** discovery runs **Then** platform, interaction, routing, geocoding, offline, privacy, budget and scale are requested.
**Given** answers **When** options are compared **Then** Google Maps JavaScript, Embed, MapLibre and Leaflet capabilities and external services are explicit.
**Given** a choice **When** approved **Then** keys, attribution, fallback and provider boundaries are recorded.

### Story 5.2: Embed a Simple Google Map
As a web developer, I want a Maps Embed path, So that simple maps avoid unnecessary JavaScript integration.

**Acceptance Criteria:**
**Given** place, view, directions, streetview or search needs **When** Embed is selected **Then** a responsive iframe URL is generated without custom runtime code.
**Given** the iframe **When** validated **Then** API restrictions, minimum dimensions, loading, title and `referrerpolicy` are correct.
**Given** custom events or overlays **When** requested **Then** Downstroke recommends Maps JavaScript instead.

### Story 5.3: Integrate Google Maps JavaScript
As a web developer, I want an interactive Google Maps integration, So that custom markers, layers and routes remain controllable.

**Acceptance Criteria:**
**Given** interactive requirements **When** integration is generated **Then** loading, error, empty, disabled and missing-key states are implemented.
**Given** routes **When** current APIs are used **Then** legacy directions APIs are not introduced where supported replacements exist.
**Given** teardown **When** the surface unmounts **Then** listeners and resources are released and key/billing restrictions are documented.

### Story 5.4: Integrate an Open Map Stack
As a developer, I want a MapLibre or Leaflet option, So that an open renderer can meet appropriate product needs.

**Acceptance Criteria:**
**Given** vector and rich styling needs **When** open mapping is selected **Then** MapLibre is recommended with an explicit tile/style provider.
**Given** simple raster needs **When** selected **Then** Leaflet is recommended without speculative abstraction.
**Given** community OSM tiles **When** considered **Then** attribution, identification, caching, no-SLA and no-bulk-download constraints are enforced.

### Story 5.5: Validate Map Production Readiness
As an operator, I want a map production gate, So that provider failures, costs and device behavior are understood.

**Acceptance Criteria:**
**Given** a map implementation **When** release is checked **Then** key restrictions, quotas, billing alerts, attribution, privacy and fallback are verified.
**Given** Expo or WebView use **When** release is checked **Then** real-device rendering, bridge validation and lifecycle behavior are tested.

## Epic 6: Safe Rule Evolution

Maintainers can update reusable rules without overwriting user-owned content.

### Story 6.1: Manage Versioned Content Blocks
As a maintainer, I want owned blocks with explicit markers, So that framework content can evolve safely.

**Acceptance Criteria:**
**Given** an existing file **When** a managed block is added **Then** surrounding user content remains byte-for-byte unchanged.
**Given** an existing managed block **When** update runs **Then** only matching owned content changes and repeated execution is idempotent.
**Given** malformed or duplicate markers **When** detected **Then** mutation stops for manual review.

### Story 6.2: Preview and Apply Safe Migrations
As a developer, I want migration diffs and recovery plans, So that managed updates are reviewable and reversible.

**Acceptance Criteria:**
**Given** a version change **When** migration is planned **Then** file-level actions, diffs, conflicts and rollback are shown.
**Given** unresolved conflicts **When** apply is requested **Then** conflicted files are not mutated.
**Given** approval **When** migration completes **Then** previous versions and results are recorded without storing secrets.

### Story 6.3: Promote Proven Project Rules
As a maintainer, I want evidence-gated rule promotion, So that reusable modules contain proven behavior rather than speculation.

**Acceptance Criteria:**
**Given** a project rule **When** promotion is proposed **Then** at least two real consumers or measured need and compatibility evidence are required.
**Given** project-specific behavior **When** evidence is insufficient **Then** it remains local.
**Given** promotion **When** accepted **Then** ownership, versioning, tests and migration impact are documented.

## Epic 7: Rigorous Games and Interactive Experiences

Developers can deliver Phaser 2D and Babylon.js 3D work only after three evidence-backed quality passes.

### Story 7.1: Enforce the Three-Pass Interactive Quality Gate
As a developer, I want an automatic three-version workflow, So that interactive work is improved twice before delivery.

**Acceptance Criteria:**
**Given** Phaser or Babylon work **When** execution begins **Then** functional, improvement-one and final-improvement passes are required.
**Given** each pass **When** it completes **Then** findings cover requirements, interaction, lifecycle, controls, responsive behavior, accessibility, errors and measured budgets.
**Given** no justified change **When** a pass completes **Then** evidence explains why; identical blind reruns do not pass.
**Given** delivery **When** the third version passes **Then** only final code plus concise improvement and test evidence is presented.

### Story 7.2: Create a Phaser 2D Experience
As a game developer, I want a Phaser path, So that 2D scenes and animation use a focused engine and quality gate.

**Acceptance Criteria:**
**Given** a 2D brief **When** setup runs **Then** scenes, assets, controls, sizing and performance budgets are defined without speculative systems.
**Given** animation needs **When** implemented **Then** sprites, tweens or frame animation are chosen by actual behavior.
**Given** teardown **When** scenes change **Then** listeners, timers and assets are disposed and the three-pass gate succeeds.

### Story 7.3: Create a Babylon.js 3D Experience
As a 3D developer, I want a Babylon.js path, So that scenes, assets and render loops are production-conscious.

**Acceptance Criteria:**
**Given** a 3D brief **When** setup runs **Then** camera, lighting, assets, controls and device budgets are defined.
**Given** animation **When** implemented **Then** keyframes, animation groups or render-loop updates match the use case.
**Given** teardown **When** the surface closes **Then** engine, scene, observers and resources are disposed and the three-pass gate succeeds.

## Epic 8: Design System, Brand and Internationalization

Developers can create one brand identity and localized product system usable by humans and LLMs.

### Story 8.1: Create the Neutral Design System
As a product team, I want a versioned design source of truth, So that every surface follows consistent decisions.

**Acceptance Criteria:**
**Given** design-system creation **When** discovery starts **Then** product, users, brand, platforms, accessibility, content and constraints are requested.
**Given** approval **When** artifacts are generated **Then** tokens, typography, spacing, radii, elevation, motion, components, states and responsive rules are neutral and versioned.
**Given** a global change **When** proposed **Then** impact and approval are required.

### Story 8.2: Install Project Typography
As a developer, I want simple Google Fonts setup, So that typography is consistent without unnecessary payload.

**Acceptance Criteria:**
**Given** selected fonts **When** setup runs **Then** only required families, weights, styles and subsets plus fallbacks and `font-display` are configured.
**Given** privacy, offline or native needs **When** remote CSS is unsuitable **Then** a local/platform path is offered.
**Given** completion **When** doctor runs **Then** missing files, invalid weights and inconsistent tokens are reported.

### Story 8.3: Generate Consistent Brand Assets
As a product owner, I want all launch assets derived from one identity, So that the product never presents fragmented branding.

**Acceptance Criteria:**
**Given** an approved identity **When** assets are generated **Then** logo, favicon, app icon, splash and loading use shared tokens and visual rules.
**Given** platform variants **When** validated **Then** dimensions, safe areas, contrast and legibility pass without independent redesigns.

### Story 8.4: Initialize Internationalized Content
As a product team, I want localization defined before screens multiply, So that deliverables contain no hardcoded visible copy.

**Acceptance Criteria:**
**Given** project setup **When** content planning begins **Then** source, supported and fallback locales are requested.
**Given** visible copy **When** implemented **Then** controls, errors, empty states, accessibility labels and demos use catalogs or data sources.
**Given** temporary mockup copy **When** delivery runs **Then** the gate fails until it is replaced.
**Given** generated translations **When** reviewed **Then** placeholders, plurals and locale formats are preserved.

### Story 8.5: Generate LLM Design Guidance
As a developer, I want design guidance for the active LLM, So that generated UI follows the same source of truth.

**Acceptance Criteria:**
**Given** a design system **When** an adapter is generated **Then** Claude, Codex or another LLM receives a regenerable projection rather than a duplicate authority.
**Given** Claude Design availability **When** selected **Then** it is preferred for visual exploration under approved tokens.
**Given** unavailable Claude Design **When** work continues **Then** the active LLM follows the same contract and review gates.

### Story 8.6: Create Native UX Direction Workflows
As a product team, I want Downstroke to turn incomplete UI requests into an intentional design direction, So that generated interfaces fit the product instead of repeating generic AI layouts.

**Acceptance Criteria:**
**Given** an incomplete visual brief **When** UX planning starts **Then** only design-shaping questions about scope, mood, geometry, density, typography, icons, styling, motion, theme and source are asked.
**Given** sufficient answers or explicit speed preference **When** direction is produced **Then** assumptions, semantic tokens, layout rules, state model, accessibility and responsive behavior are documented.
**Given** a user-facing first viewport **When** reviewed **Then** it exposes the real product workflow and avoids decorative template patterns without product purpose.

### Story 8.7: Document Components and Storybook States
As a frontend team, I want reusable components documented with their complete states, So that design intent and implementation remain inspectable across products.

**Acceptance Criteria:**
**Given** repeated UI or a component system **When** components are planned **Then** ownership, purpose, variants, composition, behavior, accessibility and misuse guidance are required.
**Given** Storybook is justified **When** stories are generated **Then** default, variants, loading, disabled, error, empty, long-content, narrow-layout and theme states are covered where relevant.
**Given** a one-off static surface **When** Storybook adds no current value **Then** it remains optional rather than mandatory ceremony.

### Story 8.8: Enforce Visual QA and Design Adapters
As a product team, I want observable visual and accessibility evidence, So that UI quality is verified beyond compilation.

**Acceptance Criteria:**
**Given** user-facing UI **When** delivery runs **Then** relevant desktop, tablet and mobile screenshots, interaction states, accessibility and reduced-motion behavior are checked.
**Given** Figma or another design source **When** available **Then** structured variables, components and annotations are preferred while paid or beta capabilities remain optional and explicit.
**Given** an external design/prototype adapter **When** used **Then** production code still lands in the repository and passes normal Downstroke QA.

## Epic 9: Native Platform and Operational Experience

Downstroke ships self-contained project intelligence, workflow, communication and engineering controls while safely importing existing project knowledge as untrusted, source-attributed data.

### Story 9.1: Enforce the Native-Only Product Boundary
As a maintainer, I want external construction tools isolated from distributable output, So that installed Downstroke has no runtime dependency or public branding tied to them.

**Acceptance Criteria:**
**Given** a new project **When** initialization or doctor runs **Then** no external agent stack installation is required or recommended.
**Given** package, CLI, templates or public docs **When** release scanning runs **Then** external product names, installers, dependencies and active instructions fail the gate.
**Given** internal maintenance artifacts **When** packaged **Then** allowlists exclude planning, development skills, historical imports and local tool configuration.

### Story 9.2: Create the Operational Experience Foundation
As a developer, I want project facts stored with provenance and evidence, So that project continuity is durable without trusting chat history or generated claims.

**Acceptance Criteria:**
**Given** `experience init` **When** no manifest exists **Then** local JSONL storage, security defaults, evidence, quarantine and indexes are created without overwrite.
**Given** a fact write **When** evaluated **Then** source, trust, scope, status, TTL and evidence rules are validated; generated output cannot become verified directly.
**Given** lite mode **When** initialized **Then** network, arbitrary shell, embeddings and dangerous bridge capabilities are disabled.

### Story 9.3: Import Legacy and SPEC-Driven Project Knowledge
As a developer, I want existing project documents safely classified and imported, So that migration preserves useful work without activating untrusted instructions.

**Acceptance Criteria:**
**Given** Markdown, YAML, JSON or legacy project artifacts **When** scan runs **Then** repo-relative path, SHA-256, size, classification, trust and active-instruction risk are recorded without executing content.
**Given** secrets, injection patterns, unsafe paths, binaries or conflicts **When** detected **Then** derived content is redacted or quarantined and excluded from active context.
**Given** import authorization **When** records are written **Then** requirements, decisions, workflow items and QA claims remain observed until evidence verifies them.

### Story 9.4: Add Native Planning and Delivery Workflows
As a developer, I want native briefs, specs, epics, stories, cadence, QA and review checkpoints, So that Downstroke owns its delivery workflow end to end.

**Acceptance Criteria:**
**Given** imported or new work **When** workflows run **Then** items, acceptance criteria, tasks, status, evidence, deferred work and review cadence use native versioned state.
**Given** a checkpoint **When** work resumes **Then** deterministic state identifies the next valid action without depending on an external workflow engine.
**Given** high-risk work **When** planned **Then** individual review remains mandatory.
**Given** controlled mode **When** work advances **Then** plan, review, implementation and verification are separate persisted checkpoints with explicit approval and resume behavior.
**Given** materially conflicting active sources **When** encountered **Then** source evidence, options, consequences and decision owner are shown and execution pauses instead of choosing silently.

### Story 9.5: Add Native Communication Policy
As a developer, I want concise communication modes with protected content, So that token savings never remove security, commands, schemas, evidence or acceptance criteria.

**Acceptance Criteria:**
**Given** normal, compact, technical, audit or handoff mode **When** output is produced **Then** the configured budget and style apply without rewriting canonical sources.
**Given** protected content **When** compression is requested **Then** code, commands, diffs, schemas, security, permissions, QA and rollback remain complete.
**Given** imported communication preferences **When** mapped **Then** roleplay or safety-reducing instructions remain inactive.

### Story 9.6: Add Native Simplicity Gates
As a developer, I want reuse, dependency, abstraction and rewrite gates, So that minimal engineering remains auditable without permitting under-engineering.

**Acceptance Criteria:**
**Given** proposed work **When** evaluated **Then** deletion, reuse, configuration, platform, existing dependency and small local code are considered before new dependencies or abstractions.
**Given** a dependency, shared package, abstraction or broad rewrite **When** proposed **Then** evidence, consumers, impact, owner, tests and removal/rollback are required as applicable.
**Given** code changes or dependency changes **When** native risk audit runs **Then** dangerous code smells such as unsafe execution, secret leakage, path traversal, injection, ReDoS, dependency supply-chain risk and risky generated artifacts are reported with severity, evidence and the next safe action.
**Given** security, data integrity, accessibility or production reliability **When** simplicity conflicts **Then** the safety requirement wins and the exception is recorded.

### Story 9.7: Add Native Code Intelligence
As a developer, I want a repo-scoped incremental code index, So that structural context is available without a daemon, external server or runtime dependency.

**Acceptance Criteria:**
**Given** a TypeScript/JavaScript repository **When** indexed **Then** safe files, hashes, package ownership, imports, exports and top-level symbols are stored incrementally.
**Given** changed files **When** impact or task context is requested **Then** bounded relevant files are returned and stale indexes are explicit.
**Given** ignored, generated, secret or external-root files **When** scanning **Then** they are excluded without executing builds or arbitrary scripts.

### Story 9.8: Route Work with Native Token Economy
As a developer, I want greedy, balanced and rich execution policies, So that each task uses the lowest sufficient reasoning and context while preserving quality.

**Acceptance Criteria:**
**Given** a task **When** routed **Then** mode, task class, risk, model tier, context budget, cache strategy, escalation trigger and verification gate are recorded.
**Given** deterministic work **When** tools can prove the result **Then** no LLM is required.
**Given** risk, ambiguity or failed verification **When** thresholds are crossed **Then** execution escalates and the task ledger records the outcome.

### Story 9.9: Compile Safe Task Context
As a developer, I want deterministic task-specific context packs, So that agents receive relevant project truth without full-history dumps or poisoned memory.

**Acceptance Criteria:**
**Given** experience records and a task **When** context compiles **Then** identity, active rules, relevant facts, evidence, risks, unknowns and blocked assumptions fit configured category budgets.
**Given** quarantine, secrets, conflicted or stale authority **When** encountered **Then** compilation excludes or labels it and fails on critical leakage.
**Given** identical inputs **When** compiled repeatedly **Then** output is stable apart from explicitly volatile metadata.

### Story 9.10: Enforce Strict Native Health and Cleanup
As a developer, I want native health and migration cleanup verified, So that old active instructions become inert only after useful project knowledge is preserved.

**Acceptance Criteria:**
**Given** existing legacy artifacts **When** doctor runs **Then** they are classified as migration sources or conflicts, never healthy dependencies or installation recommendations.
**Given** cleanup **When** previewed **Then** native parity, imported hashes, rewritten active docs, quarantine and archive targets are shown and `--yes` is required.
**Given** strict native mode **When** active legacy instructions, missing parity, secret leakage or quarantine leakage remain **Then** doctor fails.
**Given** a blocked repository **When** `downstroke health` runs **Then** it explains blockers, missing evidence, unresolved conflicts, failed gates and highest-risk workflow items with the next safe action.

### Story 9.11: Add an Explicit Native Worker Runtime
As a maintainer, I want schema-bound native worker orchestration, So that multi-step work can run only where deterministic functions or a single execution path are insufficient.

**Acceptance Criteria:**
**Given** an orchestration use case **When** runtime use is proposed **Then** Planner, Scheduler, Executor, Verifier and Recorder responsibilities are explicit.
**Given** a simple deterministic task **When** worker orchestration is requested **Then** Downstroke rejects it and runs the simpler path.
**Given** a native worker **When** registered **Then** its role, input schema, output schema, allowed tools, mutation rights, budget, stop condition, evidence requirements and audit records are declared.
**Given** the initial worker set **When** listed **Then** Planner, Repository Inspector, Risk Auditor, Evidence Validator, Workflow Guardian, Context Compiler and Release Guardian exist as Downstroke-native roles.
**Given** mutations **When** workers request them **Then** preview, workflow checkpoints, ownership confirmation and high-risk review cannot be bypassed.
**Given** a worker output **When** it contains a claim **Then** the claim remains observed or inferred until evidence validation promotes it.

### Story 9.12: Add a Remote Module Registry
As a developer, I want trusted remote modules, So that reusable capabilities can be discovered and installed safely.

**Acceptance Criteria:**
**Given** a registry module **When** inspected **Then** provenance, version, compatibility, integrity and requested mutations are visible.
**Given** installation **When** approved **Then** no arbitrary postinstall code runs and rollback metadata is retained.

### Story 9.13: Automate Conflict-Aware Managed Migrations
As a developer, I want safe automatic managed migrations, So that routine upgrades require less manual editing.

**Acceptance Criteria:**
**Given** valid managed blocks **When** migration is previewed **Then** ownership, diff, conflicts and rollback are computed.
**Given** user-owned edits or ambiguous markers **When** detected **Then** automation stops for review.
**Given** successful apply **When** rerun **Then** the result is idempotent.

### Story 9.14: Add Native Execution Engine
As a developer, I want explicit execution tasks, So that Downstroke can plan, run, verify and record work without hidden chat memory or external orchestration.

**Acceptance Criteria:**
**Given** a requested operation **When** `downstroke run` previews it **Then** the execution task shows objective, owner, dependencies, priority, estimate, risk, rollback reference, selected mode and required approvals.
**Given** a task can run deterministically **When** execution starts **Then** Planner, Scheduler, Executor, Verifier and Recorder run without invoking worker fan-out.
**Given** worker fan-out is needed **When** execution starts **Then** the selected worker manifest, budgets, stop conditions and evidence requirements are recorded before any worker runs.
**Given** verification fails **When** the recorder writes state **Then** the task remains blocked or failed with evidence and the next safe action, never silently completed.

### Story 9.15: Add Native Knowledge Lifecycle and Health Engine
As a developer, I want project knowledge to age, conflict and recover safely, So that operational experience stays useful instead of becoming stale memory.

**Acceptance Criteria:**
**Given** a fact with TTL or lifecycle policy **When** it expires or its source changes **Then** its status becomes stale until refreshed or invalidated with evidence.
**Given** conflicting evidence **When** trust is evaluated **Then** both candidates remain visible and verified truth is withheld until human decision or stronger evidence policy resolves it.
**Given** imported content **When** lifecycle rules run **Then** import provenance, quarantine state, evidence hash and trust transition are preserved.
**Given** health analysis **When** repo readiness is requested **Then** Downstroke reports evidence gaps, stale facts, unresolved conflicts, lifecycle failures and release blockers in one native health view.

## Epic 10: Package Distribution and Public Documentation

Developers can install a verified package and understand the framework from clean public artifacts.

### Story 10.1: Deliver a Complete Repository README
As a new user, I want one reliable README, So that I can install and use Downstroke before the documentation site exists.

**Acceptance Criteria:**
**Given** the repository **When** the README is reviewed **Then** requirements, installation, quick start, commands, configuration, safety, examples and troubleshooting are complete.
**Given** unfinished features **When** documented **Then** they are labeled planned rather than available.

### Story 10.2: Prepare the npm Package
As a maintainer, I want a verified npm tarball, So that the CLI installs cleanly with only required runtime files.

**Acceptance Criteria:**
**Given** functional readiness **When** `npm pack --dry-run` runs **Then** metadata, license, exports, binary, Node compatibility and allowlisted contents pass.
**Given** a packed artifact **When** installed in a clean fixture **Then** init, doctor and CLI help run successfully.
**Given** package contents **When** scanned **Then** secrets, planning output, source archives and maintenance-only files are absent.
**Given** package, CLI help and generated templates **When** release scanning runs **Then** external construction-tool names, installers, dependencies and active instructions are absent.

### Story 10.3: Publish and Verify the npm Release
As a maintainer, I want an authenticated npm release, So that users can install the approved version.

**Acceptance Criteria:**
**Given** release readiness **When** publication is proposed **Then** `npm whoami` must equal `charquiavelo` and version, tag, provenance and tarball are shown.
**Given** explicit high-risk approval **When** publish runs **Then** the package is released once and credentials or recovery keys are never read.
**Given** publication **When** verification runs **Then** a clean install resolves the published version and executes the smoke checks.

### Story 10.4: Preserve the Private Maintenance Repository
As a maintainer, I want full history preserved privately, So that public sanitization never destroys development evidence.

**Acceptance Criteria:**
**Given** a private remote **When** backup is proposed **Then** target, branches, tags and commit tip are previewed and push requires confirmation.
**Given** completion **When** verified **Then** the expected full-history tip is readable from the private remote before sanitization can continue.

### Story 10.5: Cut a Sanitized Single-Commit Public Release
As a maintainer, I want a clean public repository, So that users see the framework rather than internal construction history.

**Acceptance Criteria:**
**Given** verified private history **When** public release is built **Then** an allowlisted tree excludes planning, temporary configuration, credentials and maintenance artifacts while retaining distributable integrations.
**Given** the release tree **When** validated **Then** final `.gitignore`, secret scan, package smoke checks, build and README pass.
**Given** a one-commit branch **When** history replacement is proposed **Then** the exact remote and destructive effect are shown and explicit confirmation is required before force-push.

### Story 10.6: Launch the React Documentation and Showcase Site
As a prospective user, I want accurate searchable documentation and examples, So that I can evaluate and adopt Downstroke.

**Acceptance Criteria:**
**Given** stable README and npm workflows **When** the site is built **Then** installation, CLI reference, guides and working showcases match the released version.
**Given** visible content **When** rendered **Then** it uses the design system, localization catalogs, accessibility and responsive rules.
**Given** planned capabilities **When** displayed **Then** they are not represented as available or interactive.
**Given** public documentation **When** scanned **Then** it describes only Downstroke-owned capabilities and contains no maintenance-tool branding or setup instructions.

### Story 10.7: Calibrate Token Estimates Against Observed Usage
As a developer, I want estimates compared with observed provider usage and the currently available token budget, So that I can judge whether planned work fits before execution.

**Acceptance Criteria:**
**Given** representative completed Downstroke workflows **When** provider-reported token usage is recorded **Then** the system compares observed usage with the original estimate without treating either value as monetary cost.
**Given** repeated observations by scope and model **When** calibration is evaluated **Then** accuracy, sample size and uncertainty are reported and estimation assumptions are adjusted only from sufficient evidence.
**Given** an estimate and a current available-token budget **When** feasibility is requested **Then** the result is `fits`, `does-not-fit` or `uncertain` based on the calibrated range.
**Given** missing or incompatible provider observations **When** comparison is requested **Then** the result remains unavailable rather than claiming accuracy.
