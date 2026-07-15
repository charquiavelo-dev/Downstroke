# Sprint Change Proposal: IFND Reliability, CMS and Dashboard Scope

## Trigger

The owner supplied `IFND.md`, a research and design handoff covering AI-delivery reliability, security hardening, an optional headless CMS and an operations dashboard. The requested outcome is backlog integration only; implementation is not authorized in this change.

## Decision

- Add Epic 13 for native reliability, security and evidence hardening.
- Add Epic 14 for an optional headless content engine.
- Add Epic 15 for an optional operations dashboard.
- Keep Story 12.5 as the final npm publication action and make it depend on all required Epic 13-15 gates or explicit deferral of optional modules.
- Reuse Epic 11 pattern registry and design-system projections for dashboard UI instead of creating a universal pre-built component library.

## Preserved IFND Intent

- Durable execution, stuck detection and duplicate-effect prevention.
- Evidence-backed completion, security/CWE findings, secret quarantine and dependency verification.
- Independent cross-provider review, context handoffs and delivery-effectiveness evidence.
- Optional content schemas, authentication/RBAC, content detection, conflict-aware synchronization, editing, media, APIs and API-to-UI impact.
- An isolated operational UI for native Downstroke workflows, health, security, releases, collaboration, documentation and analytics.

## Corrections Applied

- Component names and static strings are inference candidates, never automatic authority to migrate content or rewrite application code.
- CMS data edits do not modify component source.
- GraphQL, analytics providers, rich-text editors, ORMs and dashboard packages remain opt-in decisions; no dependency is selected by research alone.
- Authentication is mandatory on every non-loopback host. Local bypass never weakens server-side production policy.
- A dashboard mutation uses the same preview, plan hash, authorization, audit and rollback contracts as the CLI.
- “Build every component” is replaced by registry reuse and the two-real-consumer rule.
- SQLite/PostgreSQL dual support is not assumed. The real project stack and operational requirements decide storage during Story 14.1.

## Duplicates Consolidated

- IFND cross-harness and dual-AI health tasks became Story 13.5.
- Security scanning and package hallucination tasks became Stories 13.3-13.4.
- Existing stack, code, workflow, knowledge, health and release capabilities are dashboard projections in Stories 15.2-15.4 rather than new engines.
- Documentation dashboard work complements, but does not replace, the public documentation site in Story 12.3.
- IFND component-library scope is governed by Epic 11 and Story 15.7.

## Risk and Review

Stories 13.1-13.5, 14.1-14.4, 14.6-14.8 and any authentication, permission, migration, secret, deployment or publication work require individual high-risk review regardless of sprint cadence. Epics 14-15 remain optional until the owner approves their capability plans.

## Publication Order

No npm publication occurs while a required hardening story is incomplete or an optional Epic 14-15 decision is unrecorded. Story 12.5 remains the final planned product action.
