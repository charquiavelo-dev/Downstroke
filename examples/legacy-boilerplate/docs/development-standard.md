# Development Standard

## Philosophy

Build practical, typed, tested and rollback-friendly software. A senior implementation is not the most abstract implementation; it is the one that solves the workflow clearly and survives production pressure.

## SOLID In Practice

- Single responsibility: UI renders, services decide, repositories persist, validators validate.
- Open/closed: add compatible variants instead of breaking callers.
- Liskov: do not make subtype behavior surprise existing contracts.
- Interface segregation: small props and service interfaces beat kitchen-sink objects.
- Dependency inversion: high-level workflows depend on contracts, not concrete infrastructure details.

## Modern React

- Prefer server state tools over manual fetch state when available.
- Keep derived state derived.
- Use forms with schema validation.
- Clean up effects.
- Model async states explicitly.
- Avoid prop drilling by using composition or scoped context, not global state by default.
- Do not memoize by reflex; profile or isolate expensive work.

## Frontend QA

- Test business-critical view state.
- Verify empty, loading, error and permission states.
- Check keyboard access and focus order on web.
- Check small mobile screens and long localized text.
- Do visual QA for dashboard tables, maps, modals, forms and navigation.

## Backend QA

- Validate requests at boundaries.
- Test auth, permissions, tenant scoping and failure paths.
- Keep `GET` read-only.
- Make mutations idempotent where retries are likely.
- Log enough for incident diagnosis without leaking secrets.

## PostgreSQL

- Use constraints for invariants.
- Add indexes for common filters and joins.
- Prefer additive migrations.
- Keep migrations deterministic and safe to rerun when possible.
- Do not rely on frontend filtering for security.

## Release Rule

No known broken build, route, form, API contract, migration or critical workflow ships.

