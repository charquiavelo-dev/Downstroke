# BMAD Method Legacy Reference

This file is historical context for projects that still carry BMAD-era planning language. It is not the active Downstroke workflow.

Active workflow state belongs in `.downstroke/workflows/` and is operated through `downstroke workflow add`, `downstroke workflow resume` and `downstroke workflow resolve`. For current projects, follow `docs/process/downstroke-workflow.md`.

Do not create BMAD story files, Markdown backlogs or `docs/stories/` as source-of-truth workflow state unless the user explicitly asks for optional human-readable documentation in addition to native Downstroke workflow records.

## Human Review Cadence

Before generating multiple native workflow items, ask:

```txt
Como queres revisar este trabajo?
1. Una historia/task a la vez
2. En bloques de X historias/tasks
3. Por sprint completo
4. Solo al final como borrador
```

- `una-a-una`: generate one artifact, review it, then continue.
- `bloques`: ask for `X` and stop after each exact block.
- `por-sprint`: ask sprint length, real capacity and WIP; confirm the sprint objective and risks before generation.
- `solo-al-final`: mark everything as draft until explicit acceptance.

Store the current decision in `docs/SPEC.md` and `.downstroke/planning.json`. High-risk auth, money, permissions, destructive data, migrations and production tasks always receive individual review.

## Required For

- New routes/screens/modules.
- Database/API/auth/permission/payment changes.
- Destructive or irreversible actions.
- Cross-module workflows.
- Production launch decisions.

## Brief

- Product outcome.
- User role.
- Business value.
- Problem.
- In scope.
- Out of scope.

## Quick Spec

- Route/entry point.
- Components/folders.
- Data read.
- Data mutated.
- Permissions.
- Async states.
- Acceptance criteria.

## Architecture

- Contracts.
- Database/migrations.
- Services.
- Security.
- Tests.
- Rollback/recovery notes.

## Story

```txt
As <role>,
I need <capability>,
so that <business outcome>.

Acceptance criteria:
- Observable behavior
- Data/API contract
- Auth/security behavior
- State/failure behavior
- QA evidence
```

Every story also records value, risk, effort, uncertainty and dependencies on a `1-5` scale. High risk or uncertainty triggers a short investigation before implementation.

## Semantic Status

Use one state only: `idea`, `brief`, `specified`, `ready`, `in-progress`, `review`, `accepted`, or `released`. An item cannot be `accepted` without observable QA evidence, and cannot be `released` without applicable production gates.

## QA Gate

Run the smallest meaningful checks and document what passed.
