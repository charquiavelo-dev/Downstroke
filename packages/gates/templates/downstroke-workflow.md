# Downstroke Workflow

Downstroke uses native, repository-local workflow state for intent, specification, architecture, stories, implementation and QA evidence.

## Human Review Cadence

Before generating multiple workflow items, ask:

```txt
How do you want to review this work?
1. One story/task at a time
2. In blocks of X stories/tasks
3. By complete sprint
4. Only at the end as a draft
```

Persist the choice in `docs/SPEC.md` and `.downstroke/planning.json`. High-risk auth, money, permissions, destructive data, migrations and production work always receive individual review.

## Controlled Mode

Controlled mode persists separate plan, review, implementation and verification checkpoints. When active sources conflict materially, show both sources, options, consequences and decision ownership, then pause for human approval.

## Delivery States

`idea -> brief -> specified -> ready -> in-progress -> review -> accepted -> released`

An item cannot be accepted without observable QA evidence or released without applicable production gates.
