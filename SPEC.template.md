# <Project Name> SPEC

Version: <date>  
Status: source of truth for Codex

## Product

Describe the product in one paragraph:

- Who uses it.
- What job it solves.
- What business outcome it creates.
- What is explicitly out of scope.

## Users And Roles

| Role | Goal | Permissions |
| --- | --- | --- |
| Public user | <goal> | <permissions> |
| Authenticated user | <goal> | <permissions> |
| Admin | <goal> | <permissions> |
| System | <goal> | Background jobs only |

## Architecture

```txt
project/
  app/ or src/          application routes/screens
  components/           reusable UI
  lib/                  clients, helpers, integrations
  server/ or backend/   API
  db/ or prisma/        schema and migrations
  docs/                 source of truth
  _bmad/                BMAD install
  _bmad-output/         BMAD artifacts
  .codegraph/           CodeGraph index/config
  .agents/skills/       Project-local agent skills
  scripts/              Agent bootstrap and project automation
```

## Stack

| Layer | Stack |
| --- | --- |
| Web | React/Next.js, TypeScript, Tailwind |
| Mobile | React Native/Expo, TypeScript, NativeWind |
| Backend | NestJS or Express, TypeScript |
| Database | PostgreSQL |
| Auth | <provider/strategy> |
| Validation | Zod or validation pipes |
| Tests | <Vitest/Jest/Playwright/etc> |

## Domain Model

List the core business entities and invariants.

Example:

- `User`: authenticated account.
- `Organization`: tenant/business boundary.
- `Order`: money-bearing workflow; must be auditable.
- `AuditLog`: append-only record of risky/admin actions.

## API Rules

Every endpoint must define:

- Method and path.
- Auth/role.
- Request schema.
- Response schema.
- Validation errors.
- Empty/error behavior.
- Idempotency or duplicate-submit behavior.
- Test or manual QA evidence.

## Database Rules

- Additive migrations by default.
- PostgreSQL constraints enforce important invariants.
- Tenant-owned records include ownership scope.
- No broad deletes or drops without explicit approval.
- Seed data is idempotent and removable.

## UI Rules

Every async surface must handle:

- Loading.
- Empty.
- Error.
- Success.
- Disabled.
- Permission denied.

Every route/screen must define:

- User role.
- Data read.
- Data mutated.
- Primary action.
- Mobile/tablet/desktop behavior.
- Accessibility notes.

## Acceptance Gate

Before shipping:

- Agent bootstrap passes: CodeGraph, BMAD, Caveman and Ponytail.
- BMAD spec/story exists for meaningful work.
- TypeScript passes.
- Lint passes.
- Tests or manual QA evidence exists.
- No `any`.
- No secrets.
- No fake production data.
- Docs updated.
