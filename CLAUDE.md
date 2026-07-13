# Downstroke Claude Guide

## Purpose

This file is the Claude entrypoint. Keep it aligned with `AGENTS.md`; if a rule differs, `AGENTS.md` wins unless this file is intentionally customized for Claude.

Treat this project as production software: real users, real data, real money, real mistakes and real growth.

## First Read Order

1. `AGENTS.md`
2. `docs/SPEC.md`
3. `docs/development-standard.md`
4. `docs/process/bmad-method.md`
5. Relevant BMAD artifact in `_bmad-output/`
6. `docs/proven-project-rules.md` when the task crosses architecture, data, UI, operations or tooling boundaries.

## Source Of Truth

- `docs/SPEC.md`: product and technical contract.
- `docs/production-readiness.md`: release gate.
- `docs/development-standard.md`: engineering, frontend, backend and QA rules.
- `docs/process/bmad-method.md`: BMAD workflow.
- `docs/project-start-guides.md`: startup guidance for React, Next.js, React Native, backend and .NET.
- `docs/dotnet-bridge.md`: Blazor/.NET bridge when the project is C#/.NET.

If docs and code disagree, inspect code, document the conflict and avoid behavior changes until the product decision is clear.

## Required Agent Bootstrap

Every new project must start with:

- Local git initialized.
- CodeGraph initialized and healthy.
- BMAD installed for Codex with Spanish communication and output.
- Caveman installed as a project-local skill.
- Ponytail installed from the canonical project command.

Run:

```powershell
$env:PONYTAIL_INSTALL_COMMAND = '<canonical Ponytail install command>'
.\scripts\bootstrap-agents.ps1
```

Do not guess a Ponytail package. If the canonical command is missing, ask.

## Mandatory BMAD Cadence

Before creating multiple stories or tasks, use the exact review question and rules in `docs/SPEC.md`. Ask whether review is `una-a-una`, in blocks of `X`, by sprint, or only at the end as a draft. Record the choice before generating a large backlog. High-risk tasks are always reviewed individually.

## How Claude Should Work Here

- Use CodeGraph or the codebase index before structural edits.
- Use BMAD before meaningful feature, auth, data, permission, billing, deployment or production work.
- Keep responses concise unless the user asks for detail.
- Prefer small, verified changes.
- Preserve user changes.
- Do not push without explicit approval.
- Do not mention AI in commits.

## CodeGraph

Use CodeGraph for definitions, callers, impact and unfamiliar areas. Use native search only for literal text, docs and config values.

Initialize if missing:

```bash
npx @colbymchenry/codegraph init -i
```

## BMAD

Use BMAD for:

- New pages, modules, routes or workflows.
- Database, API, auth, permissions, billing or destructive actions.
- Cross-module behavior.
- Production readiness and deployment decisions.

Artifacts go in `_bmad-output/`.

## Stack Defaults

These are defaults, not a language gate. Other stacks may still use Downstroke workflows, evidence, health checks and project experience; use their real commands and do not force them into React, Node or .NET structure.

- Web: React or Next.js, TypeScript strict, Tailwind.
- Mobile: React Native + Expo, TypeScript strict, NativeWind when appropriate.
- Backend: NestJS for new production APIs; Express for small existing services.
- Database: PostgreSQL.
- Validation: Zod, validation pipes, DataAnnotations or FluentValidation.
- .NET: follow `docs/dotnet-bridge.md`.

## Non-Negotiables

- No `any` in TypeScript.
- No secrets in code or docs.
- No fake operational data in production workflows.
- No destructive migrations without explicit approval and rollback plan.
- No public route/API/schema rename without impact audit.
- No styling-only task may change behavior.
- No unfinished route in primary navigation.
- No push without explicit approval.
- Commits use Conventional Commits and do not mention AI.
- No `Co-Authored-By` trailers.

## QA Gate

Run the smallest meaningful checks:

```bash
npm run type-check
npm run lint
npm test
npm run build
```

For .NET:

```bash
dotnet test
dotnet build
```

Use commands that actually exist. If checks cannot run, document why and what should run next.
