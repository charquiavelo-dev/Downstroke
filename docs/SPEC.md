# Project Specification

This is the canonical product and engineering contract. Replace every `<...>` value before implementation. Keep decisions here stable; use `_bmad-output/` for generated planning artifacts.

## Metadata

- Project: `Downstroke`
- Owner: `Framework maintainer`
- Status: `active`
- Last reviewed: `2026-07-01`
- Product/domain in focus: `modular AI-assisted software delivery`
- Project artifact language: `English`; user communication may be Spanish.
- Intended npm publisher account: `charquiavelo`; package name and scope remain release decisions.

## Product

### Problem

Developers using AI-assisted workflows repeatedly rebuild agent rules, planning, context, QA and stack setup. This wastes tokens and creates inconsistent delivery risk across projects.

### Outcome

A developer can safely initialize or inspect an existing project, install only the required discipline modules and receive actionable health results without silent file replacement.

### Users And Roles

| Role | Goal | Allowed actions | Forbidden actions |
| --- | --- | --- | --- |
| Framework maintainer | Evolve proven rules into modules | Author modules, presets, migrations and releases | Cannot promote unproven project-specific behavior |
| Project developer | Start or strengthen a project | Initialize, inspect, diagnose and add modules | Cannot silently overwrite user-owned files |

### Scope

- In: `lite preset initialization, project inspection, health diagnosis, safe copy-if-missing operations and guided greenfield stack selection within supported ecosystems`
- Required before public release: `native workflows, communication policy, simplicity gates, code intelligence, operational experience and safe import of existing project knowledge` (Epic 9).
- External construction tools are maintenance-only inputs. They are not runtime dependencies, generated-project requirements, public product concepts or permanent fallbacks.
- Deferred: `additional language ecosystems beyond the supported web, mobile, backend and .NET paths`.
- Planned after the framework is functionally validated: `npm distribution followed by a React documentation and showcase site` (Epic 10).
- Token-estimate calibration is the final planned feature: compare estimates with observed provider usage and report whether remaining work fits the available token budget only after the product and release workflows are complete.
- The public release is cut from a sanitized allowlisted tree with one initial commit only after the complete development history is verified in a private maintenance repository.
- Success signal: `init and doctor pass against empty and existing fixtures while preserving user files`

### Milestone: Native Framework Ready for Local Acceptance

This milestone is reached only when:

- Every planned product capability through Epics 1-9 is implemented, reviewed and verified, including Stories 9.11-9.13.
- README completion (Story 10.1), local npm package preparation (Story 10.2) and token calibration (Story 10.7) are done.
- All runtime, templates, generated projects, CLI help and active public documentation are Downstroke-native; maintenance tools remain excluded from release output.
- A clean local tarball installation passes init, doctor, help, build, typecheck, tests and native-only scans without unpublished workspace dependencies.
- No story remains in backlog, ready-for-dev, in-progress or review within the milestone scope, and no unresolved high/medium release finding remains.

When these gates pass, announce the milestone explicitly and ask the owner to perform local acceptance. npm publication (Story 10.3), public-history work and the documentation site begin only after that local acceptance.

## Business Rules And Invariants

Number every rule so code, tests and Downstroke workflow items can reference it.

| ID | Rule | Enforcement | Evidence |
| --- | --- | --- | --- |
| `BR-001` | Shipped Downstroke uses native Downstroke capabilities and terminology; maintenance tooling never becomes a runtime dependency or public product contract. | Release manifest and forbidden-reference scan | Clean package and generated-project fixture |
| `BR-002` | When active sources conflict on product behavior, scope, safety, ownership or architecture, Downstroke presents the conflicting evidence and pauses for the responsible human; it never silently chooses a winner. | Workflow decision gate | Conflict fixture and approval record |
| `BR-003` | Controlled development mode separates plan, review, implementation and verification, with explicit checkpoints before product-owned or high-risk decisions. | Native workflow state machine | Resume/checkpoint tests and workflow evidence |
| `BR-004` | Durable project facts retain source, trust, scope, status, TTL and evidence; generated output cannot directly become verified truth. | Experience runtime validation and authorized JSONL writes | Experience trust/evidence tests |

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

- Stack: `TypeScript strict, Node.js ESM, npm workspaces`
- Runtime/deployment: `Node.js >=22, local CLI first`
- Package manager: `npm`
- System boundaries: `CLI, core file operations, content modules and presets`
- Source of truth: `module manifests and versioned templates in this repository`
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
| Experience fact | Repository | Valid provenance/trust; verified requires sanitized matching evidence; conflicting IDs fail | Local append-only JSONL plus deterministic ID index |
| Workflow item | Repository | Versioned native item with status, ACs, tasks, risk, review mode, source and evidence references; high-risk review is always individual | Local `.downstroke/workflows/` JSON/JSONL records |
| Workflow checkpoint | Repository | Controlled mode advances only through plan, review, implementation and verification checkpoints with explicit approval or pause | Local append-only checkpoint and decision records |

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
| `downstroke experience init` | Project developer | Repository-local v0.1 lite manifest and stores | Never overwrites; malformed/weakened manifest fails | Core and CLI initialization tests |
| `downstroke experience add` | Project developer | Valid fact JSON; preview then `--yes` | Secret-free summary; duplicate conflict blocks | Core and CLI fact-write tests |
| `downstroke experience import` | Project developer | Repeated repository-relative Markdown, YAML or JSON paths; optional explicit `claim: key=value` lines; preview then `--yes` | Bounded metadata-only classification; unsafe content is rejected/quarantined; contradictory claim values are retained as conflicted candidates and pause | Core and CLI import tests |
| `downstroke workflow add` | Project developer | Valid native workflow item JSON; optional controlled checkpoint or material conflict JSON; preview then `--yes` | Payload-minimized summary; malformed state blocks; conflicts persist as pending decisions and pause | Core and CLI workflow tests |
| `downstroke workflow resume` | Project developer | Optional workflow item ID | Computes next action only from persisted workflow records; invalid/conflicted state blocks instead of guessing | Core and CLI workflow resume tests |

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
How do you want to review this work?
1. One story/task at a time
2. In blocks of X stories/tasks
3. By complete sprint
4. Only at the end as a draft
```

Record the answer here:

- Review mode: `sprint`
- Block size when applicable: `not-applicable`
- Sprint length: `15 working days, Monday through Friday`
- Gross capacity: `8 hours/day, 40 hours/week, 120 hours/sprint`
- WIP limit: `3`
- High-risk review: `individual`
- Last reviewed artifact: `9-2-create-the-operational-experience-foundation`

Rules:

- `one-at-a-time`: stop after each story/task for review.
- `blocks`: stop after exactly `X` new artifacts.
- `sprint`: confirm objective, real capacity, risks and WIP before generation; review at planning close.
- `final-draft`: generated work remains a draft until explicit review.
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
