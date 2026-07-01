# <Project Name> Agents Guide

## Purpose

This file is the operating guide for Codex and human developers. Treat this project as production software: real users, real data, real money, real mistakes and real growth.

## Source Of Truth

- `docs/SPEC.md`: product and technical contract.
- `docs/production-readiness.md`: release gate.
- `docs/development-standard.md`: engineering, FE and QA rules.
- `docs/process/bmad-method.md`: BMAD workflow.
- `docs/legacy/`: old context only, not current truth.

If docs and code disagree, inspect code, document the conflict and avoid behavior changes until the product decision is clear.

## Required Agent Bootstrap

Every new project must start with:

- CodeGraph initialized and healthy.
- BMAD installed for Codex.
- Caveman skill installed project-local.
- Ponytail installed from the canonical project command.

Run:

```powershell
$env:PONYTAIL_INSTALL_COMMAND = '<canonical Ponytail install command>'
.\scripts\bootstrap-agents.ps1
```

Do not begin meaningful implementation while bootstrap validation fails.

## CodeGraph

Use CodeGraph first for structural work:

- `codegraph_status`
- `codegraph_files`
- `codegraph_explore`
- `codegraph_search`
- `codegraph_callers`
- `codegraph_callees`
- `codegraph_impact`

If `.codegraph/` is missing, initialize with:

```bash
npx @colbymchenry/codegraph init -i
```

## BMAD

Use BMAD for meaningful changes:

- New routes, screens, modules or data models.
- Auth, permissions, billing, payments, destructive actions, production data or cross-module changes.
- User-facing workflows that need product, UX, architecture and QA clarity.

Artifacts belong in `_bmad-output/`.

## Caveman

Use caveman mode only when the user asks for compressed communication. It changes communication density, not engineering rigor.

## Ponytail

Ponytail is required for token-efficient agent operation. Installation must use
the canonical command supplied through `PONYTAIL_INSTALL_COMMAND`; never guess a
package with the same name.

## Stack Defaults

- Frontend web: React or Next.js, TypeScript, Tailwind.
- Mobile: React Native, Expo when appropriate, TypeScript, NativeWind.
- Backend: NestJS for production APIs when starting new backend work; Express is acceptable for small existing services.
- Database: PostgreSQL.
- Validation: Zod or framework-native validation pipes.
- Testing: unit, component, integration and E2E based on risk.

## Non-Negotiables

- No `any`.
- No secrets in code or docs.
- No fake operational data in production workflows.
- No destructive migrations without explicit approval and rollback plan.
- No route/API/schema rename without impact audit.
- No styling-only task may change behavior.
- No unfinished route in primary navigation.
- No push without explicit approval.
- Commits use Conventional Commits and do not mention AI.

## QA Gate

Run the smallest meaningful checks:

```bash
npm run type-check
npm run lint
npm test
npm run build
```

Use the commands that actually exist in the project. If a check cannot run, document why and what should run next.
