# Project Specification

This is the canonical product and engineering contract. Replace every `<...>` value before implementation. Keep decisions here stable; use `.downstroke/workflows/` for native planning artifacts.

## Metadata

- Project: `<name>`
- Owner: `<owner>`
- Status: `<discovery | active | maintenance>`
- Last reviewed: `<YYYY-MM-DD>`
- Product/domain in focus: `<domain>`

## Product

### Problem

`<Who has what problem, in what context, and why it matters now?>`

### Outcome

`<Observable user or business result.>`

### Users And Roles

| Role | Goal | Allowed actions | Forbidden actions |
| --- | --- | --- | --- |
| `<role>` | `<goal>` | `<actions>` | `<restrictions>` |

### Scope

- In: `<smallest useful workflow>`
- Out for now: `<explicit deferrals>`
- Success signal: `<metric or observable evidence>`

## Business Rules And Invariants

Number every rule so code, tests and Downstroke workflow items can reference it.

| ID | Rule | Enforcement | Evidence |
| --- | --- | --- | --- |
| `BR-001` | `<business invariant>` | `<database | server | UI>` | `<test or audit>` |

## User Flows

For every primary flow define:

1. Entry point and eligible role.
2. Data read and data mutated.
3. Happy path and observable result.
4. Loading, empty, error, success, disabled, offline and permission-denied states.
5. Duplicate-submit, retry and recovery behavior.
6. Mobile, tablet and desktop behavior.
7. Accessibility and keyboard behavior.

## Architecture

- Stack: `<frameworks and versions>`
- Runtime/deployment: `<targets>`
- Package manager: `<npm | pnpm | yarn | bun | NuGet>`
- System boundaries: `<web, mobile, API, worker, database, external services>`
- Source of truth: `<authoritative store per data class>`
- Heavy or irreversible decisions: `<links to ADRs>`

```txt
<repository tree showing real ownership boundaries>
```

Keep product domains isolated. Shared packages contain only contracts or primitives with at least two real consumers.

## Code Semantics

- Names express domain intent, not implementation accidents.
- UI renders, services own workflows, repositories persist and validators guard boundaries.
- Keep derived state derived; do not duplicate server state in client stores.
- `GET` operations are read-only. Mutations use explicit commands/endpoints.
- Public contracts change additively unless a migration and impact audit approve a break.
- Unknown external data enters as `unknown` and is narrowed or schema-validated.
- Background and retry-prone operations are idempotent.

## Data

| Entity | Owner/scope | Key invariants | Retention/audit |
| --- | --- | --- | --- |
| `<entity>` | `<user | tenant | system>` | `<constraints>` | `<policy>` |

- PostgreSQL constraints enforce important invariants.
- Tenant-owned queries include tenant ownership server-side.
- Migrations are additive by default, reviewed before apply and paired with rollback/recovery notes.
- Seeds are idempotent, clearly non-production and removable.
- Caches and vector stores are rebuildable indexes, never silent authorities.

## API And Integrations

For each endpoint/event/tool define method or event name, auth/role, request schema, response schema, errors, ownership scope, idempotency and evidence.

| Contract | Auth/role | Input/output | Failure behavior | Evidence |
| --- | --- | --- | --- | --- |
| `<contract>` | `<role>` | `<schemas>` | `<errors/retry>` | `<test>` |

External integrations must define timeout, retry, rate-limit, fallback, secret ownership and observability behavior.

## Security And Privacy

- Trust boundaries: `<boundaries>`
- Sensitive data: `<classification and storage>`
- Authorization: `<server-side policy>`
- Destructive actions: `<confirmation, audit and recovery>`
- Logs: `<allowed context; prohibited secrets/private content>`
- Abuse/rate limits: `<policy>`

UI hiding is not authorization. Destructive or financial actions require explicit confirmation and auditable outcomes.

## UI And Styling Contract

- Design tokens: `<source file/system>`
- Approved icon library: `<library>`; no emoji as product icons.
- Navigation exposes only complete, permitted workflows.
- Every visible control performs a useful, verifiable action.
- Every async surface models loading, empty, error, success, disabled and permission states where relevant.
- Styling-only work cannot alter data, routes, permissions, APIs or behavior.
- Responsive behavior is defined per workflow; mobile is not a compressed desktop table.
- Long localized text, overflow, focus, contrast, hit targets and reduced motion are verified.
- Theme toggles remain hidden until every surface supports each offered theme.

## Performance And Reliability

- Budgets: `<latency, bundle, memory, query or startup targets>`
- Expected scale: `<users, rows, events, files>`
- Expensive paths: `<known paths and measurements>`
- Failure isolation: `<timeouts, circuit/fallback behavior>`

Profile before memoizing or virtualizing. Parallelize independent I/O. Lazy-load genuinely heavy routes, editors, maps, charts and media.

## Observability And Operations

- Health/readiness: `<checks>`
- Structured logs and correlation IDs: `<policy>`
- Metrics/alerts: `<signals and owners>`
- Backup/restore: `<RPO/RTO or practical target>`
- Deployment and rollback: `<commands/runbook links>`
- Environment ownership: `<development, staging, production>`

## Downstroke Workflow Governance

Before generating multiple stories or tasks, ask exactly:

```txt
Como queres revisar este trabajo?
1. Una historia/task a la vez
2. En bloques de X historias/tasks
3. Por sprint completo
4. Solo al final como borrador
```

Record the answer here:

- Review mode: `por-sprint`
- Block size when applicable: `<X>`
- Sprint length: `15 working days, Monday through Friday`
- Gross capacity: `8 hours/day, 40 hours/week, 120 hours/sprint`
- WIP limit: `3 concurrent tasks`
- Last reviewed artifact: `<Downstroke workflow ID>`

Rules:

- `una-a-una`: stop after each story/task for review.
- `bloques`: stop after exactly `X` new artifacts.
- `por-sprint`: confirm objective, real capacity, risks and WIP before generation; review at planning close.
- `solo-al-final`: generated work remains a draft until explicit review.
- High-risk auth, money, permissions, destructive data, migration and production work is reviewed individually regardless of cadence.
- Changing cadence never deletes or silently rewrites accepted work.

## Delivery States

`idea -> brief -> specified -> ready -> in-progress -> review -> accepted -> released`

### Definition Of Ready

- Outcome, role, scope and business rules are clear.
- Dependencies and risk are classified.
- Data, permissions, states and acceptance criteria are defined.
- Review cadence permits the item to start.

### Definition Of Done

- Observable acceptance criteria pass.
- Typecheck/lint/build and focused tests pass where available.
- Security, accessibility, responsive and failure states were checked for the changed scope.
- Docs and Downstroke workflow status match implementation.
- Deployment, migration and rollback evidence exists when relevant.
- No known broken workflow or undeclared production blocker remains.

## Risks, Decisions And Deferred Work

| ID | Type | Description | Owner | Trigger/review date |
| --- | --- | --- | --- | --- |
| `R-001` | `<risk | decision | deferred>` | `<detail>` | `<owner>` | `<trigger>` |

Repeated rules become framework candidates only after they prove useful in multiple real projects. Project-specific behavior stays in the project.
