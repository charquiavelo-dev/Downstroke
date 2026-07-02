---
title: Downstroke
status: draft
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
- External Breakdown Stack integration and persisted BMAD cadence.

### Planned Expansion

- GitFlow and multi-repository governance.
- Guided supported stacks, providers, maps, design systems and interactive experiences.
- Managed migrations, npm distribution, public documentation and sanitized release workflows.

### Evidence-Gated Future

- Native Breakdown Stack capabilities, agent runtime and remote registry only after external workflows are measured and parity/rollback are proven.

## 4. Feature Groups

1. Safe initialization and project diagnosis — FR1-FR5.
2. Git and workspace governance — FR6-FR16.
3. Supported stack and deployment guidance — FR17-FR35, FR51-FR55, FR69-FR71.
4. Interactive and visual delivery — FR36-FR50.
5. LLM usage visibility — FR56-FR59.
6. Evidence-gated native platform evolution — FR60-FR68.
7. Package distribution and public documentation — FR72-FR81.

## 5. Non-Goals

- Replacing proven external tools before real evidence exists.
- Supporting additional language ecosystems before current stack paths are reliable.
- Becoming a general-purpose agent runtime during the MVP.
- Treating vector indexes, frontend state or generated content as an authority over source data.

## 6. Open Questions

1. Final npm package name and scope.
2. License for public distribution.
3. Private maintenance repository location and public-release remote policy.
4. Quantitative performance budgets for CLI startup, doctor execution and package size.
5. Which visible surface receives the first formal UX contract.

## 7. Draft Completion Work

- Expand FR1-FR81 into capability-level product requirements with testable consequences.
- Promote cross-cutting NFR1-NFR45 into this PRD.
- Define measurable success and counter-metrics.
- Reconcile every approved requirement and finalize reviewer findings.
