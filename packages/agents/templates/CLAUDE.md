# <Project Name> Claude Guide

## Purpose

This file is the Claude entrypoint. Keep it aligned with `AGENTS.md`; if a rule differs, `AGENTS.md` wins unless this file is intentionally customized for Claude.

Treat this project as production software: real users, real data, real money, real mistakes and real growth.

## First Read Order

1. `AGENTS.md`
2. `docs/SPEC.md`
3. `docs/development-standard.md`
4. `docs/process/downstroke-workflow.md`
5. Relevant native workflow item in `.downstroke/workflows/`
6. `docs/proven-project-rules.md` when the task crosses architecture, data, UI, operations or tooling boundaries.

## Startup Contract

Before the first meaningful change, read the first four files above and inspect `downstroke doctor` output. Native workflow state lives only in `.downstroke/workflows/`; do not create Markdown story files, external-method backlogs or assistant-specific planning folders unless the user explicitly asks for extra human documentation. Do not infer process from unrelated folders, old imports, personal memory or another project's conventions.

## Source Of Truth

- `docs/SPEC.md`: product and technical contract.
- `docs/production-readiness.md`: release gate.
- `docs/development-standard.md`: engineering, frontend, backend and QA rules.
- `docs/process/downstroke-workflow.md`: native Downstroke workflow.
- `docs/project-start-guides.md`: startup guidance for React, Next.js, React Native, backend and .NET.
- `docs/dotnet-bridge.md`: Blazor/.NET bridge when the project is C#/.NET.

If docs and code disagree, inspect code, document the conflict and avoid behavior changes until the product decision is clear.

## Required Project Bootstrap

Every new project must start with:

- Local git initialized.
- Downstroke initialized locally.
- Native workflow governance configured.
- Native communication and simplicity policies available.
- Native code-intelligence state healthy or explicitly exempted.

Run:

```powershell
downstroke init --preset lite --review-mode one-at-a-time --yes
downstroke doctor
```

Do not begin meaningful implementation while native project validation fails.

External workflow methods, code indexes, communication skills and simplicity skills are migration sources only; never install or require them for new work.

## Mandatory Workflow Cadence

Before creating multiple stories or tasks, use the exact review question and rules in `docs/SPEC.md`. Ask whether review is `una-a-una`, in blocks of `X`, by sprint, or only at the end as a draft. Record the choice before generating a large backlog. High-risk tasks are always reviewed individually.

## How Claude Should Work Here

- Use native code intelligence or direct inspection before structural edits.
- Use Downstroke workflows before meaningful feature, auth, data, permission, billing, deployment or production work.
- Keep responses concise unless the user asks for detail.
- Prefer small, verified changes.
- Preserve user changes.
- Do not push without explicit approval.
- Do not mention AI in commits.

## Native Code Intelligence

Use `downstroke code index`, `downstroke code context --path <path>` and `downstroke code impact --path <path>`. External agent indexes are migration evidence only.

## Native Workflows

Use Downstroke workflows for:

- New pages, modules, routes or workflows.
- Database, API, auth, permissions, billing or destructive actions.
- Cross-module behavior.
- Production readiness and deployment decisions.

Workflow state goes in `.downstroke/workflows/`.

Use `downstroke workflow add` for workflow records and `downstroke workflow resume` for the next action. To approve a controlled checkpoint, rerun `workflow add` with the same item payload, `--controlled`, the matching `--phase`, `--approved` and `--yes`.

## Native Communication And Simplicity

Use `downstroke communication` for communication budgets and `downstroke simplicity` for minimal-change gates. Neither requires an external skill.

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
