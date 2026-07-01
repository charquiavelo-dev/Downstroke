# Pulse Boilerplate Claude Guide

Use `AGENTS.md` as the canonical operating guide. This file exists so Claude-based sessions start with the same rules.

## Startup

1. Read `AGENTS.md`.
2. Read `SPEC.template.md` or the project `docs/SPEC.md`.
3. Check git status before edits.
4. Use CodeGraph for structural questions.
5. Use BMAD before meaningful feature, data, auth, permission, billing or production work.
6. Keep Ponytail active: simplest working solution, no speculative framework code.

## Commit Rules

- Local commits are allowed.
- Push requires explicit approval.
- Use Conventional Commits.
- No `Co-Authored-By`.
- No AI/model/agent mention in commit messages.

## Working Standard

- Typed code, validated inputs, clear async states.
- React/Next/React Native projects use the existing local patterns first.
- .NET/Blazor projects follow `docs/dotnet-bridge.md`.
- Docs update when behavior, architecture, QA, routes, permissions or data contracts change.

## Quick Checks

JS/TS:

```bash
npm run type-check
npm run lint
npm test
npm run build
```

.NET:

```bash
dotnet test
dotnet build
```

Run the smallest meaningful set. Do not pretend skipped checks passed.
