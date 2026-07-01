# .NET And Blazor Bridge

This boilerplate is JS/TS-first, but the same Pulse rules apply to Blazor and .NET projects.

## When To Choose .NET

Choose .NET when the project needs:

- Long-lived backend services with strong typing and mature deployment.
- Enterprise integrations, background workers or scheduled jobs.
- Blazor for internal tools where C# end-to-end is useful.
- ASP.NET Core APIs for stable contracts, auth and PostgreSQL workflows.

Choose React/Next/React Native when the project needs:

- Fast public web UI iteration.
- Mobile apps with Expo.
- Existing JS/TS package ecosystem.
- Shared UI patterns across web and mobile.

## Recommended .NET Shape

```txt
project/
  src/
    Web/              Blazor or ASP.NET Core host
    Api/              HTTP API if separated
    Application/      use cases and validation
    Domain/           entities, value objects, invariants
    Infrastructure/   EF Core, external services, auth providers
  tests/
    UnitTests/
    IntegrationTests/
  docs/
  _bmad/
  _bmad-output/
  .codegraph/
```

Keep this shape only if the project is large enough. Small apps can start with one ASP.NET Core project plus tests.

## Stack Defaults

- Runtime: current LTS .NET.
- Web: Blazor Server or Blazor Web App for internal tools; React/Next for highly custom public frontends.
- API: ASP.NET Core minimal APIs for small services; controllers only when they improve clarity.
- Database: PostgreSQL.
- Data access: EF Core first; Dapper only for hot paths or explicit SQL-heavy reporting.
- Validation: DataAnnotations for simple DTOs, FluentValidation for complex workflows.
- Auth: ASP.NET Core Identity, OpenID Connect or a proven hosted provider.
- Tests: xUnit/NUnit plus integration tests for API/database boundaries.

## Rules Carried From Pulse

- Source of truth lives in `docs/`.
- BMAD before meaningful feature/data/auth/permission work.
- CodeGraph before structural edits.
- No secrets in repo.
- Additive migrations by default.
- Database constraints enforce important invariants.
- UI has loading, empty, error, success, disabled and permission states.
- Local commit is fine; push needs approval.

## Blazor Guidance

- Use components for real reuse, not for every div.
- Keep business rules out of `.razor` files when they affect data or permissions.
- Use forms with validation and explicit error states.
- Prefer server-side authorization checks even if the UI hides actions.
- Use JS interop only when the browser API is the actual boundary.

## API Guidance

Every endpoint defines:

- Method and route.
- Auth/role.
- Request model.
- Response model.
- Validation and error behavior.
- Idempotency for retry-prone mutations.
- Test or manual QA evidence.

## Migration Guidance

- Prefer additive EF Core migrations.
- Review generated migrations before applying.
- Never drop/rename production columns without explicit approval, backup and rollback plan.
- Seed data must be idempotent and removable.

## Bridge Rule

Do not force a .NET project to look like a Next.js project. Reuse the Pulse discipline, not the folder names.
