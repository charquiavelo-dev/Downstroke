---
title: Downstroke
status: final
created: 2026-07-01
updated: 2026-07-01
sourceRequirements: ../../epics.md
---

# PRD: Downstroke

## 0. Document Purpose

This PRD is the canonical product contract for Downstroke. It defines user outcomes and capabilities for maintainers, project developers and downstream planning workflows. Implementation mechanisms belong in the architecture or addendum. The approved FR1-FR81 and NFR1-NFR45 inventory in `../../epics.md` is the reconciliation source while this draft is completed.

## 1. Vision

Downstroke is a modular framework for safe AI-assisted software delivery. It turns proven project discipline into installable, diagnosable and versioned capabilities without silently overwriting user work or forcing one agent runtime.

The product helps developers move from a human product description to an appropriate supported stack, governed planning, verified implementation and production-ready delivery. Deterministic operations remain available through the CLI; LLMs advise where context is required; users retain authority over important or irreversible decisions.

## 2. Target Users

- Framework maintainers who convert proven practices into reusable modules.
- Project developers starting or strengthening supported web, mobile, backend and .NET projects.
- Technical leads who need consistent planning, Git, QA, security and release gates.

### Jobs To Be Done

- Initialize project discipline without losing existing work.
- Diagnose project and agent-tool health using real checks.
- Plan work with explicit review cadence, capacity and risk gates.
- Choose and configure supported application, hosting, map and design capabilities.
- Estimate LLM work, preserve repository isolation and produce reviewable releases.

## 3. Product Boundaries

### MVP

- Installable lite preset and safe file operations.
- Project inspection and verified doctor checks.
- Native workflow governance, communication, simplicity and code-intelligence foundations.

### Planned Expansion

- GitFlow and multi-repository governance.
- Guided supported stacks, providers, maps, design systems and interactive experiences.
- Managed migrations, npm distribution, public documentation and sanitized release workflows.

### Native Platform Expansion

- Operational Experience, native workflows, communication policy, simplicity gates and code intelligence before public release.
- Explicit agent runtime and remote registry only after normal functions and local modules prove insufficient.

## 4. Glossary

- **Module:** Versioned Downstroke content or behavior with declared files, checks, dependencies and conflicts.
- **Preset:** A reviewed selection of Modules applied together for a project type or delivery posture.
- **Project State:** Repository-local configuration, decisions, authorization and diagnostic results.
- **Managed Block:** Downstroke-owned content delimited inside a user-owned file and safe to update independently.
- **Doctor Check:** A deterministic inspection reporting `ok`, `warn` or `fail` with evidence and remediation.
- **Native Platform:** Downstroke-owned workflow, communication, simplicity, code-intelligence and operational-experience capabilities.
- **Workspace:** A parent directory containing independent repositories whose state and context remain isolated.
- **Release Manifest:** The allowlist defining package and sanitized public-repository contents.

## 5. Key User Journeys

- **UJ-1 — Start safely:** A developer describes a product, reviews stack recommendations, approves a Preset, previews changes and receives verified Doctor Checks without losing existing work.
- **UJ-2 — Govern delivery:** A maintainer selects review cadence and Git authorization, receives focused local commits and explicitly approves authentication and push later.
- **UJ-3 — Release publicly:** A maintainer verifies npm packaging and private full-history backup, reviews the Release Manifest, then separately approves publication and public-history replacement.

## 6. Feature Groups and Release Gates

1. Safe initialization and project diagnosis — FR1-FR5.
2. Git and workspace governance — FR6-FR16.
3. Supported stack and deployment guidance — FR17-FR35, FR51-FR55, FR69-FR71.
4. Interactive and visual delivery — FR36-FR50.
5. LLM usage visibility — FR56-FR59.
6. Native platform and safe project-knowledge migration — FR60-FR68.
7. Package distribution and public documentation — FR72-FR81.

## 7. Non-Goals

- Shipping external construction tools as product dependencies or public framework concepts.
- Supporting additional language ecosystems before current stack paths are reliable.
- Becoming a general-purpose agent runtime during the MVP.
- Treating vector indexes, frontend state or generated content as an authority over source data.

## 8. Open Questions

1. Final npm package name and scope.
2. License for public distribution.
3. Private maintenance repository location and public-release remote policy.
4. Quantitative performance budgets for CLI startup, doctor execution and package size.
5. Which visible surface receives the first formal UX contract.

## 9. Requirement Acceptance Contract

- Every CLI capability provides deterministic human-readable behavior and structured output where automation consumes it.
- Every mutation identifies target and scope, supports preview where feasible, preserves user-owned content and leaves a focused automated check.
- Every optional provider reports unavailable, misconfigured and permission-denied states without exposing secrets.
- Every high-risk operation requires fresh confirmation at execution time regardless of planning approval.
- Every visible surface follows the selected design system, localization contract, accessibility baseline and complete async states.
- Every release capability verifies the produced artifact from a clean environment.

These consequences apply to every FR below. Story acceptance criteria may strengthen but cannot weaken them.

## 10. Functional Requirements

FR1: Downstroke can initialize a project with a minimal preset without overwriting user-owned files.

FR2: Downstroke can inspect an existing project and detect its stage, stack, scripts and installed tools.

FR3: `downstroke doctor` provides actionable results and can execute real typecheck, test and build commands when requested.

FR4: Downstroke initializes and diagnoses native workflow, communication, simplicity and code-intelligence capabilities without requiring external agent tooling.

FR5: Downstroke persists its native review cadence and allows changes without deleting accepted work.

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

FR66: Downstroke can later provide an agent runtime for explicit, schema-bound orchestration after normal functions prove insufficient.

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

FR82: When active project sources conflict on product behavior, scope, safety, ownership or architecture, Downstroke records the conflicting evidence, presents options and pauses for the responsible human rather than resolving the contradiction silently.

FR83: Downstroke provides a controlled development mode with persisted plan, review, implementation and verification checkpoints, explicit decision ownership and safe resume behavior.

## 11. Cross-Cutting Non-Functional Requirements

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

NFR35: Public releases contain no external agent-tool dependency, installer, active instruction or product branding; native capabilities require focused parity evidence and safe migration of existing project artifacts.

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

## 12. Success Metrics

- **SM-1:** Empty and existing project fixtures complete `init` without overwriting user-owned files. Validates FR1.
- **SM-2:** `doctor --run-checks` reports verified only after real checks pass. Validates FR2-FR4.
- **SM-3:** Every mutating operation exposes target, scope and authorization before execution. Validates FR6-FR19.
- **SM-4:** Published packages install and pass smoke checks from a clean fixture. Validates FR72-FR75.
- **SM-C1:** Minimize framework-owned files; feature count and generated-code volume are not success metrics.

## 13. Decisions and Deferred Release Inputs

- The npm publisher is `charquiavelo`; the working package name is `downstroke`. Final scope is selected during package-readiness work.
- The current `origin` is the intended public GitHub repository. Public-history replacement still requires explicit release-time confirmation.
- License selection is owned by the maintainer and must be resolved before `npm publish`; it does not block current framework implementation.
- The private maintenance remote is created and verified before public sanitization; it does not block current framework implementation.
- Quantitative CLI startup, doctor runtime and package-size targets are set from measurements before the release gate.
- UX contracts are created before each visible product surface.
