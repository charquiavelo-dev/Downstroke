# Pulse Project Boilerplate

Boilerplate para iniciar proyectos serios de Pulse con React, Next.js, React Native, backend, PostgreSQL, BMAD, CodeGraph, Caveman, Ponytail y puente .NET/Blazor.

La idea es simple: esto todavia no es un framework instalado por npm. Es el punto de partida de un framework custom. Primero se consolidan reglas, docs, gates, bootstrap y patrones repetidos. Cuando dos o tres proyectos demuestren que algo se repite de verdad, se convierte en script, paquete o CLI.

## What This Gives You

- `AGENTS.md`: guia operativa lista para copiar en el proyecto nuevo.
- `CLAUDE.md`: guia equivalente para sesiones Claude.
- `AGENTS.template.md`: plantilla editable para generar variantes por proyecto.
- `SPEC.template.md`: contrato de producto, arquitectura, datos, API, UI y acceptance gate.
- `docs/development-standard.md`: reglas de ingenieria, React, backend, PostgreSQL y QA.
- `docs/production-readiness.md`: checklist de produccion.
- `docs/process/bmad-method.md`: flujo BMAD simple: brief, spec, architecture, story, QA.
- `docs/project-start-guides.md`: arranque para React, Next.js, React Native, backend y .NET.
- `docs/dotnet-bridge.md`: puente para Blazor/.NET sin forzar patrones JS.
- `docs/pulse-lessons.md`: reglas extraidas de proyectos Pulse reales.
- `scripts/bootstrap-agents.ps1`: instalacion progresiva de herramientas de agente.
- `skills/caveman/SKILL.md`: skill local para comunicacion ultra comprimida.

## Intended Project Types

Use this boilerplate for:

- React dashboards and SaaS tools.
- Next.js public sites, apps and backend-enabled web products.
- React Native + Expo apps.
- Node/NestJS/Express APIs.
- PostgreSQL-backed products.
- Blazor/.NET projects that should follow Pulse discipline.
- AI-assisted projects where agent token use, context quality and safety matter.

Do not use this as an excuse to install every tool on tiny experiments. Copy the docs, pick the minimum stack and keep the gates proportional to risk.

## Quick Start

From a new project root:

```powershell
Copy-Item -Recurse C:\Users\carlo\Documents\pulse\boilerplate\* .
Copy-Item SPEC.template.md docs\SPEC.md
git init
git add .
git commit -m "chore: initialize project boilerplate"
```

Then configure Ponytail and run the bootstrap:

```powershell
$env:PONYTAIL_INSTALL_COMMAND = '<canonical Ponytail install command>'
.\scripts\bootstrap-agents.ps1
```

The script intentionally fails if `PONYTAIL_INSTALL_COMMAND` is missing. That prevents installing an unrelated package with the same name.

## What The Bootstrap Installs

### 1. CodeGraph

The script initializes or syncs CodeGraph:

```powershell
npx.cmd @colbymchenry/codegraph init -i
```

Use it for structural questions:

- Where is a function/class/type defined?
- What calls this?
- What would break if this changes?
- What files and symbols exist in this area?
- How does a flow move through the codebase?

Use native search for literal text only: docs, strings, env var names, comments, log messages and exact config values.

Why it matters: it saves tokens because the agent can ask the indexed graph for focused source instead of reading half the repo.

### 2. BMAD

The script installs BMAD for Codex:

```powershell
npx.cmd bmad-method install --directory . --modules bmm --tools codex `
  --communication-language Spanish --document-output-language Spanish `
  --set bmm.project_knowledge=docs --set bmm.user_skill_level=expert --yes
```

BMAD is required for meaningful changes:

- routes, screens, modules or workflows
- auth, permissions, billing, payments or destructive actions
- data models, migrations, APIs or production data
- deployment, rollback and production launch decisions

Artifacts go in `_bmad-output/`. Keep permanent project knowledge in `docs/`.

### 3. Caveman

The script copies:

```txt
skills/caveman/SKILL.md -> .agents/skills/caveman/SKILL.md
```

Caveman is for token savings in conversation. It compresses communication. It does not reduce QA, security, accessibility, tests or product thinking.

### 4. Ponytail

The script runs whatever canonical install command you provide:

```powershell
& ([scriptblock]::Create($env:PONYTAIL_INSTALL_COMMAND))
```

Ponytail is the default engineering posture:

- simplest solution that works
- no speculative abstractions
- stdlib/native before dependencies
- one focused check for non-trivial logic
- delete before adding

## Recommended First Hour

1. Copy the boilerplate.
2. Create `docs/SPEC.md` from `SPEC.template.md`.
3. Fill the product paragraph, user roles, architecture and acceptance gate.
4. Run the agent bootstrap.
5. Commit the clean baseline.
6. Create the first BMAD brief/quick spec for the smallest useful slice.
7. Build one verified workflow before adding secondary screens.

## Recommended Folder Shapes

### Next.js / React Web

```txt
project/
  app/ or src/
  components/
  lib/
  server/ or api/
  db/ or prisma/
  docs/
  _bmad/
  _bmad-output/
  .codegraph/
  .agents/skills/
```

Use this for SaaS dashboards, admin tools, public sites with real app behavior and web products.

### React Native / Expo

```txt
project/
  app/
  src/
    components/
    hooks/
    lib/
    store/
    theme/
    translations/
    types/
  backend/ or apps/api/
  apps/web/
  apps/dashboard/
  docs/
```

Pulse projects taught that mobile apps should not become the only source of truth. Trust, auth, room state, social state, counters, moderation and permissions need backend services and tests.

### Backend

```txt
project/
  apps/api/
  packages/domain/
  packages/contracts/
  packages/database/
  docs/
```

Use NestJS for new production APIs. Express is fine for small existing services, prototypes or realtime bridges when it is already there.

### .NET / Blazor

```txt
project/
  src/
    Web/
    Api/
    Application/
    Domain/
    Infrastructure/
  tests/
  docs/
```

Small apps can start with one ASP.NET Core project plus tests. Split only when boundaries are real.

## Development Rules Brought From Pulse

### Source Of Truth

Every serious project needs stable docs:

- `docs/SPEC.md`: product and technical contract.
- `docs/development-standard.md`: engineering rules.
- `docs/production-readiness.md`: release gate.
- `docs/process/bmad-method.md`: delivery workflow.
- `_bmad-output/`: generated/planning artifacts.

If docs and code disagree, inspect code, document the conflict and avoid behavior changes until the decision is clear.

### UI

- Build the real usable experience first.
- No unfinished routes in primary navigation.
- Styling-only means styling-only.
- Every async surface needs loading, empty, error, success and disabled states.
- Forms need validation, pending, success, error and safe retry behavior.
- Operational dashboards should be dense and scannable, not landing pages.
- Mobile tables become cards or focused lists.
- Use project-approved icons, not emoji.
- Theme tokens must exist early; hardcoded surfaces are expensive later.

### Backend And Data

- `GET` endpoints are read-only.
- Validate requests at boundaries.
- Auth, permission and ownership checks happen server-side.
- PostgreSQL is the default source of truth.
- Vector stores and caches are rebuildable indexes, not authority.
- Additive migrations by default.
- Destructive migrations require approval, backup and rollback plan.
- Seeds are idempotent and removable.
- Logs help incidents without leaking secrets.

### AI / RAG / MCP

Pulse projects have shown a useful rule: normal functions first, agent framework later.

- Keep AI output behind schemas and safety validation.
- Keep database truth separate from vector retrieval.
- Do not mix embedding models in one collection without reindex plan.
- MCP tools should expose explicit capabilities with schemas.
- Read MCP tools can run directly; mutation tools require confirmation.
- MCP must not bypass UI confirmation, auth or ownership.

### QA

QA is part of implementation, not a final decoration.

Use the smallest meaningful check:

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

For Expo/EAS:

- validate Expo dependency versions
- validate EAS config
- test real-device flows for camera, maps, push, deep links and share sheets

For production:

- migrations apply
- health endpoint works
- env vars are documented
- secrets are not committed
- rollback or recovery path exists

## How To Use The Docs

### `AGENTS.md`

Copy this into the new project root. Replace `<Project Name>` and customize only project-specific stack decisions. Do not delete the bootstrap, Git, QA and non-negotiable rules unless the project intentionally changes them.

### `CLAUDE.md`

Copy this into projects where Claude will operate. It is shorter than `AGENTS.md` but points to the same rules.

### `SPEC.template.md`

Turn it into `docs/SPEC.md` and fill it before the first meaningful feature. The sections force useful decisions:

- users and roles
- architecture
- stack
- domain model
- API rules
- database rules
- UI rules
- acceptance gate

### `docs/project-start-guides.md`

Use it to choose the first stack shape. It contains separate starts for React/Next, Expo, backend and .NET.

### `docs/dotnet-bridge.md`

Use it when starting Blazor or ASP.NET Core. It keeps the Pulse discipline without forcing JavaScript folder names.

### `docs/pulse-lessons.md`

Use it when you want the deeper "why" from previous Pulse projects: monorepo lessons, UI quality, realtime rooms, production reset, MCP, AI/RAG and deployment gates.

## Framework Direction

This boilerplate becomes a framework progressively:

1. Shared docs and agent rules.
2. Shared bootstrap scripts.
3. Shared specs and QA gates.
4. Repeated folder conventions.
5. Shared packages for contracts, UI primitives and project automation.
6. A generator or CLI only after the patterns are proven.

Do not build framework machinery before repeated projects prove the same need. The framework should be extracted from real delivery, not imagined up front.

## Current Git Baseline

This boilerplate is intended to live in local git first. Add a remote only when you are ready to publish or share it.
