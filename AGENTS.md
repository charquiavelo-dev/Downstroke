# Downstroke Agents Guide

## Purpose

This file is the operating guide for Codex, Claude and human developers. Treat this project as production software: real users, real data, real money, real mistakes and real growth.

This project uses a reusable, specification-driven engineering baseline. Repeated rules may later become Downstroke modules, but project-specific behavior stays local to the project.

## Source Of Truth

- `docs/SPEC.md`: product and technical contract.
- `docs/production-readiness.md`: release gate.
- `docs/development-standard.md`: engineering, frontend, backend and QA rules.
- `docs/process/bmad-method.md`: BMAD workflow.
- `docs/project-start-guides.md`: startup guidance for React, Next.js, React Native, backend and .NET.
- `docs/dotnet-bridge.md`: Blazor/.NET bridge when the project is C#/.NET.
- `docs/proven-project-rules.md`: detailed cross-project engineering rules and failure patterns.
- `_bmad-output/`: BMAD planning and implementation artifacts.
- `docs/legacy/`: old context only, not current truth.

If docs and code disagree, inspect code, document the conflict and avoid behavior changes until the product decision is clear.

## Required Agent Bootstrap

Every new project must start with:

- Local git initialized.
- CodeGraph initialized and healthy.
- BMAD installed for Codex with Spanish communication and English output artifacts.
- Caveman installed as a project-local skill.
- Ponytail installed from the canonical project command.

Run from the new project root:

```powershell
$env:PONYTAIL_INSTALL_COMMAND = '<canonical Ponytail install command>'
.\scripts\bootstrap-agents.ps1
```

Do not begin meaningful implementation while bootstrap validation fails. Do not guess an unrelated package named `ponytail`; if the canonical command is missing, ask.

## Mandatory First Planning Question

Before generating multiple BMAD stories or tasks, read `docs/SPEC.md` and ask:

```txt
How do you want to review this work?
1. One story/task at a time
2. In blocks of X stories/tasks
3. By complete sprint
4. Only at the end as a draft
```

If the answer is blocks, ask for `X`. If it is sprint-based, ask for sprint length, real capacity and WIP limit. Record the choice in `docs/SPEC.md`; once Downstroke planning state exists, also persist it in `.downstroke/planning.json`. Never generate a large backlog before this decision. Review high-risk auth, money, permission, destructive data, migration and production tasks individually regardless of cadence.

## CodeGraph

Use CodeGraph first for structural work:

- `codegraph_status`: verify index health.
- `codegraph_files`: inspect indexed project layout.
- `codegraph_explore`: understand an unfamiliar area in one focused call.
- `codegraph_search`: find symbol definitions.
- `codegraph_callers`: see what calls a function/class.
- `codegraph_callees`: see what a function/class calls.
- `codegraph_impact`: inspect blast radius before changing shared code.

Use native search only for literal strings, docs, config values, comments and log messages.

If `.codegraph/` is missing, initialize with:

```bash
npx @colbymchenry/codegraph init -i
```

## BMAD

Use BMAD for meaningful changes:

- New routes, screens, modules, jobs or data models.
- Auth, permissions, billing, payments, destructive actions, production data or cross-module changes.
- User-facing workflows that need product, UX, architecture and QA clarity.
- Deployment, production launch, rollback or data migration decisions.

Artifacts belong in `_bmad-output/`.

Lightweight BMAD is acceptable for small fixes: one brief, one quick spec, one acceptance checklist. Do not create ceremony that does not protect the work.

## Caveman

Caveman is for compressed communication only. It reduces tokens in chat; it does not reduce engineering rigor, QA, security, accessibility or source-of-truth updates.

## Ponytail

Ponytail is the default development posture:

- Use the simplest working solution.
- Reuse existing code before adding code.
- Use stdlib/native platform before dependencies.
- Avoid speculative abstractions.
- Prefer deletion over addition.
- Add one focused check for non-trivial logic.
- Do not add a shared package, global store, abstraction or framework dependency before two real consumers or measured need exist.

Mark deliberate simplifications only when there is a real ceiling:

```ts
// ponytail: linear scan is fine under 500 records; add indexed lookup if import size grows.
```

## Stack Defaults

These are defaults, not a language gate. Downstroke works best here first, but other stacks may still use native workflows, rules, evidence, health checks and project experience. For unsupported stacks, use the project's real commands and avoid forcing React, Node or .NET structure onto it.

### Web

- React or Next.js.
- TypeScript strict.
- Tailwind.
- Zod or server/framework validation at boundaries.
- TanStack Query when client-side server state exists.
- Playwright for high-risk user workflows when needed.

### Mobile

- React Native + Expo unless native requirements prove otherwise.
- TypeScript strict.
- Expo Router when file-based routing helps.
- NativeWind when the project wants Tailwind-style styling.
- TanStack Query for remote data.
- SecureStore for sensitive mobile tokens; AsyncStorage only for non-sensitive settings/cache.
- EAS profiles documented before release work.

### Backend

- NestJS for new production APIs.
- Express only for small services or existing code.
- PostgreSQL.
- Prisma, EF Core or direct SQL depending on stack; migrations must be reviewed.
- Zod, validation pipes, DataAnnotations or FluentValidation at request boundaries.
- Health endpoint for deployed services.

### .NET

- Follow `docs/dotnet-bridge.md`.
- ASP.NET Core first.
- Blazor only when C# UI is a real advantage.
- PostgreSQL + EF Core by default.
- `dotnet build` and `dotnet test` are the default checks.

## Product Thinking Gate

Before creating or changing a page, route, component, model, endpoint or visible workflow, answer internally:

1. Which product or domain owns this?
2. Which user role uses it?
3. What operational outcome does it support?
4. What data does it read?
5. What data does it mutate?
6. What permission gates it?
7. What are the loading, empty, error, success, disabled, offline and permission-denied states?
8. What changes on mobile, tablet and desktop?
9. What should be tested now?
10. What is intentionally deferred and why?

If the answer is weak, improve the spec before shipping the visible change.

## UI Rules

- Build the actual usable experience first, not a landing page unless requested.
- Navigation exposes only real, working routes.
- Styling-only requests must not change behavior, data, API, permissions or routes.
- Use established theme tokens; do not casually change palettes, radii, typography or global layout primitives.
- Use Lucide or the project-approved icon library. Do not use emoji as product UI icons.
- Every async surface needs loading, empty, error, success and disabled states where relevant.
- Forms need validation, field-level errors, pending state, success state and safe retry behavior.
- Tables become cards or focused lists on mobile; mobile is not a squeezed desktop table.
- Empty states should tell the next valid action, not filler copy.
- Every visible control needs a real action; unfinished features stay out of primary navigation.
- Keep server state in query/framework data layers and local UI state close to the component.
- Memoize, virtualize and globalize state only after measured need.

## Backend And Data Rules

- Validate requests at boundaries.
- `GET` stays read-only.
- Auth, permission and ownership checks happen on the server.
- PostgreSQL constraints enforce important invariants.
- Prefer additive migrations.
- No destructive migrations without explicit approval, backup and rollback plan.
- Seeds must be idempotent and removable.
- Logs must help incident diagnosis without leaking secrets.
- Retry-prone mutations should be idempotent.
- Do not use frontend filtering as a security boundary.
- Do not log secrets, complete private payloads or combinations that can re-identify a user.
- External integrations define timeout, retry, rate-limit and fallback behavior.

## AI, RAG And MCP Rules

- Normal functions beat agent frameworks until orchestration is actually needed.
- PostgreSQL or the main database remains authoritative; vector stores are rebuildable indexes.
- Do not mix embeddings from different models in one collection without a migration/reindex plan.
- AI output that reaches users must pass schema validation and safety/product validation.
- MCP tools are for explicit, schema-bound capabilities. Read tools may run directly; mutations need confirmation.
- Do not let MCP bypass UI confirmation or ownership rules.

## Non-Negotiables

- All active project Markdown, code, comments, identifiers and configuration must be written in English. Conversation with the user may be in Spanish. Preserved historical source material may retain its original language.
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

## Git Rules

- Check `git status` before edits.
- Preserve user changes.
- Local commits are allowed when useful.
- Push requires explicit approval every time.
- Before every push, update `README.md` with relevant current status, usage or roadmap information included in that push.
- Commit small, coherent chunks.

Commit examples:

```txt
feat: add onboarding spec
fix: validate room invite ownership
docs: expand production gate
chore: initialize project bootstrap
```

## QA Gate

Run the smallest meaningful checks:

```bash
npm run type-check
npm run lint
npm test
npm run build
```

Use commands that actually exist in the project.

For .NET:

```bash
dotnet test
dotnet build
```

For Expo release work, also validate Expo/EAS config. For UI work, inspect the changed screen at the relevant viewport/device size. If a check cannot run, document why and what should run next.

## Delivery Checklist

Before reporting done:

- Source-of-truth docs updated when behavior, routes, data, permissions, architecture or QA changed.
- BMAD artifact exists for meaningful work.
- CodeGraph or direct code inspection was used for structural changes.
- No unrelated refactor was included.
- Loading, empty, error, success, disabled and permission states are covered where relevant.
- Tests or manual QA evidence exist.
- Production risks and deferred items are named clearly.
