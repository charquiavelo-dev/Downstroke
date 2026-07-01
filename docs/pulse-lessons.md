# Pulse Lessons For Stronger Projects

This file collects useful lessons from Pulse projects and turns them into reusable boilerplate guidance. It is not a dump of every project detail. It is the distilled operating system: the parts that repeatedly prevented bugs, saved tokens, improved QA or made production handoff clearer.

## 1. Documentation Architecture

Projects stay easier to operate when documentation has clear jobs:

- `README.md`: how to run and understand the repo at a glance.
- `AGENTS.md`: mandatory behavior for AI agents and developers.
- `CLAUDE.md`: Claude-specific entrypoint when needed.
- `docs/SPEC.md`: product and technical source of truth.
- `docs/development-standard.md`: engineering and QA rules.
- `docs/production-readiness.md`: release gate.
- `docs/process/bmad-method.md`: planning and delivery flow.
- `docs/handoff.md`: current state, blockers and next actions.
- `docs/operations.md`: production commands, env, deploy and incident notes.
- `_bmad-output/`: generated planning/spec/story/review artifacts.

Rule: permanent knowledge belongs in `docs/`; generated delivery artifacts belong in `_bmad-output/`.

## 2. Agent Token Strategy

Token savings come from better context, not from weaker engineering.

Use this order:

1. Read `AGENTS.md` and the relevant source-of-truth doc.
2. Use CodeGraph for structure.
3. Use native search only for literal strings.
4. Use BMAD only as deep as the risk needs.
5. Use Caveman when the user wants compressed communication.
6. Use Ponytail to avoid unnecessary abstractions.

Good agent behavior:

- Ask CodeGraph for a focused module instead of reading the whole repo.
- Inspect callers before changing shared functions.
- Commit coherent chunks.
- Document skipped checks honestly.
- Keep responses short unless the user requested depth.

Bad agent behavior:

- Grepping for symbols when an AST index exists.
- Reading all docs when one source-of-truth doc answers the task.
- Adding an abstraction because a future project might need it.
- Producing giant BMAD artifacts for a two-line fix.
- Marking production work done from simulator-only checks.

## 3. BMAD That Actually Helps

BMAD should prevent wrong work, not create paperwork.

Use full BMAD for:

- new workflows
- auth/permissions
- database changes
- payments/billing
- destructive actions
- production launch
- cross-module contracts

Use lightweight BMAD for:

- narrow bug fixes
- styling-only tasks
- copy corrections
- test-only changes

Minimum lightweight artifact:

```txt
Brief: who needs what outcome.
Quick spec: route/component/data/permissions/states.
Acceptance: observable behavior + checks.
```

Useful BMAD output names:

- `brief-<feature>.md`
- `spec-<feature>.md`
- `story-<epic>-<number>-<slug>.md`
- `review-<feature>-edge.md`
- `review-<feature>-acceptance.md`

## 4. Monorepo Lessons

For mobile + backend + web fallback projects, the useful shape is:

```txt
app/ or apps/mobile/       Expo app
src/                       mobile shared code if Expo app is root
backend/ or apps/api/      API/realtime server
apps/web/                  public landing/fallback/open-app surface
apps/dashboard/            admin/observability
packages/shared/           contracts that truly need sharing
docs/                      living specs and handoffs
```

Only create `packages/shared` when contracts are actually shared. A package for one consumer is just ceremony.

## 5. Frontend Lessons

### React / Next.js

- Prefer server-state tools over manual `useEffect` fetch state when client fetching exists.
- Keep derived state derived.
- Forms need schemas, pending, success and field-level errors.
- Use native browser features before custom widgets.
- Do not memoize by reflex; isolate or profile expensive work.
- Public websites and dashboards are different products. Do not style an operational tool like a landing page.

### React Native / Expo

- Plan auth redirects, deep links and public web fallback early.
- Use `SecureStore` for sensitive session material on mobile.
- Use AsyncStorage for settings and non-sensitive local cache.
- Device QA is required for camera, maps, push, video, share sheets, deep links and background timers.
- Add stable `testID`s when building screens, not after E2E planning.
- EAS config should be documented before release work.

### UI Quality

- The first screen should answer what needs attention now.
- Every visible control should perform a valuable action.
- Empty states should guide the next valid action.
- Data density should increase with screen size.
- Mobile is not a squeezed desktop table.
- Cards summarize decisions or risks; they are not decoration.
- Theme toggles are hidden unless both themes are complete.
- Status colors must be semantic and consistent.

## 6. Backend Lessons

The cleanest backend pattern:

1. Route receives request.
2. Boundary validation parses input.
3. Service owns workflow logic.
4. Repository/database layer persists.
5. Tests cover the service and risky integration path.

Rules:

- Keep routes thin.
- `GET` stays read-only.
- Mutations validate auth, permission and ownership.
- Database constraints protect invariants.
- Idempotency matters for retry-prone actions.
- Health endpoints should check real dependencies when production needs them.
- Logs need request IDs and enough context for incidents, without secrets.

## 7. PostgreSQL And Migrations

Useful migration habits:

- Number migrations.
- Review generated migrations.
- Prefer additive changes.
- Use explicit constraint names.
- Use `CREATE INDEX IF NOT EXISTS` where supported.
- Keep seeds idempotent.
- Document production data resets separately from code completion.

When adding enum-like values, update all layers together:

- domain type
- database constraint
- validator/schema
- API payload type
- frontend type
- tests
- docs/TODO/handoff

## 8. Auth, Permissions And Ownership

Security rules that keep repeating:

- UI hiding is not security.
- Server checks own the real permission decision.
- Tenant/organization/user scope must be present in queries.
- Admin/destructive actions need confirmation and audit trail.
- Public client env vars are not secrets; private keys never go to client code.
- Auth callback URLs, deep link schemes and production origins should be documented early.

## 9. Realtime, Rooms And Invites

For realtime apps:

- WebSocket is for live events.
- Database is for room state, invites, members, completions and debugging.
- In-memory state alone is not enough for production.
- Public share links should have web fallback.
- Authenticated room resolution beats "whoever has the code".
- Connection/request-to-enter models are safer than open room codes when privacy matters.

## 10. AI Features

AI features need boundaries:

- AI generation and session intervention are separate jobs.
- Put AI behind flags, budgets, validators, fallback decks and logs.
- Never show model output directly without schema and product validation.
- Keep curated fallback behavior so rate limits or unsafe output do not break the workflow.
- Track observability for AI decisions, but do not leak private prompt/context.

## 11. RAG And Vector Stores

RAG works better when the source-of-truth boundary is strict:

- PostgreSQL/main database owns structured truth.
- Chroma/vector DB owns semantic lookup and can be rebuilt.
- Metadata should preserve traceability back to authoritative records.
- Do not mix embeddings from different models without reindex plan.
- Measure retrieval quality before adding rerankers, agents or complex orchestration.

## 12. MCP Lessons

MCP is useful when the assistant needs structured app capabilities:

- read current app/server/db status
- query account-scoped data
- prepare actions for human confirmation
- expose research memory through stable schemas

MCP should not:

- bypass UI confirmation
- execute destructive changes silently
- own the database
- own vector ingestion if another service owns it
- scrape the UI to guess state

Use read tools directly. Require confirmation for create/edit/delete/activate/deactivate.

## 13. QA Strategy

Test where business rules live:

- Unit: pure functions, validators, formatters, permission helpers.
- Component: forms, modals, tables, drawers, empty states.
- Integration: API + database + ownership.
- E2E: primary product flows.
- Manual/visual: responsive, dark mode, maps, media, complex dashboards.

Each non-trivial feature needs at least one focused check or a documented reason why testing was not feasible.

## 14. Production Readiness

Track production readiness separately from code completion.

Important gates:

- env vars documented
- secrets absent from repo
- migrations apply
- backups exist before risky production data changes
- health endpoint works
- deployment target documented
- rollback/recovery path exists
- real device checks done for native/mobile capabilities
- production seed/mock reset plan exists
- smoke tests rerun after reset

Do not mark production work done if credentials, domains, storage, push providers or real-device QA are still pending.

## 15. Deployment Lessons

Railway/API:

- migrations should run before traffic when possible
- failed migration should block the deploy
- health should report database availability when API depends on it
- env examples should separate public values from secrets

Expo/EAS:

- run Expo version checks before builds
- EAS config lives in the app root
- preview builds should produce internal APKs when Android testing is needed
- production builds should not fallback to localhost
- API URLs for builds must be explicit

## 16. Copy And Product Language

Good copy reduces confusion, risk or execution time.

Avoid:

- generic "manage easily" text
- decorative headings that do not help decisions
- buttons without a real action
- direct English-to-Spanish translation tone

Prefer:

- current state
- next valid action
- risk or consequence
- role-specific wording

## 17. Framework Extraction Rule

This boilerplate becomes a framework only through repetition:

1. Reuse docs manually.
2. Turn repeated commands into scripts.
3. Turn repeated contracts into templates.
4. Turn repeated UI/data primitives into packages.
5. Turn repeated setup into a generator.
6. Only then publish/install as a framework.

If only one project needs it, keep it local. If three projects need it, extract it.
