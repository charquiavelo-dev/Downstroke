# BMAD Method

BMAD is the project workflow for intent -> spec -> architecture -> story -> implementation -> QA evidence.

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

## QA Gate

Run the smallest meaningful checks and document what passed.

