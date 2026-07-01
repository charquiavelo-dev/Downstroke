# Pulse Boilerplate Agents Guide

## Purpose

This repo is the starting kit for serious Pulse projects. Today it is a boilerplate; later it can become the Pulse framework. Until then, keep it boring, typed, documented and easy to copy.

Use this guide for React, React Native, Next.js, backend and future .NET projects.

## Source Of Truth

- `README.md`: how to use this boilerplate.
- `SPEC.template.md`: project/product contract template.
- `docs/development-standard.md`: engineering rules.
- `docs/production-readiness.md`: release gate.
- `docs/process/bmad-method.md`: BMAD workflow.
- `docs/project-start-guides.md`: startup advice for JS/TS and .NET projects.
- `docs/dotnet-bridge.md`: bridge for Blazor/.NET decisions.

If docs and code disagree, inspect code, document the conflict and avoid behavior changes until the product decision is clear.

## Required Bootstrap

Every new project starts with:

- Local git initialized.
- CodeGraph initialized and healthy.
- BMAD installed for Codex.
- Caveman available project-local.
- Ponytail installed from its canonical source.

Run from the new project root after copying this boilerplate:

```powershell
$env:PONYTAIL_INSTALL_COMMAND = '<canonical Ponytail install command>'
.\scripts\bootstrap-agents.ps1
```

Do not guess a Ponytail package. If the canonical command is missing, stop and ask.

## CodeGraph

Use CodeGraph first for structural work: definitions, callers, impact, architecture and unfamiliar modules. Use native search only for literal text, docs and config strings.

If `.codegraph/` is missing:

```bash
npx @colbymchenry/codegraph init -i
```

## BMAD

Use BMAD for meaningful work:

- New routes, screens, modules, jobs or data models.
- API, auth, permissions, billing, payments, destructive actions or production data.
- Cross-module workflows.
- Product launch decisions.

Artifacts belong in `_bmad-output/`. BMAD config should use Spanish communication and document output.

## Caveman

Caveman is for compressed communication only. It must not lower engineering rigor.

## Ponytail

Ponytail is the default build posture: shortest working diff, stdlib/native first, no speculative abstractions. Mark known shortcuts with a `ponytail:` comment only when there is a real ceiling and a clear upgrade path.

## Stack Defaults

- Web: React or Next.js, TypeScript, Tailwind.
- Mobile: React Native + Expo, TypeScript, NativeWind when appropriate.
- Backend: NestJS for new production APIs; Express is acceptable for small existing services.
- Database: PostgreSQL.
- Validation: Zod, framework-native validation pipes or .NET DataAnnotations/FluentValidation.
- Tests: smallest meaningful check for the risk: unit, integration, Playwright, Jest, Vitest or xUnit.

## Non-Negotiables

- No `any` in TypeScript.
- No secrets in code or docs.
- No fake operational data in production workflows.
- No destructive migration without explicit approval and rollback plan.
- No public route/API/schema rename without impact audit.
- No styling-only task may change behavior.
- No unfinished route in primary navigation.
- No push without explicit approval.
- Commits use Conventional Commits and do not mention AI.

## Delivery Gate

Before done:

```bash
npm run type-check
npm run lint
npm test
npm run build
```

Use commands that actually exist. For .NET, prefer:

```bash
dotnet test
dotnet build
```

If a check cannot run, say why and what should run next.
