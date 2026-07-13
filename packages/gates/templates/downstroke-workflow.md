# Downstroke Workflow

Downstroke uses native, repository-local workflow state for intent, specification, architecture, stories, implementation and QA evidence.

## Native State Only

Workflow state belongs in `.downstroke/workflows/`. Do not create Markdown story files, external-method backlogs or assistant-specific planning folders as the source of truth. Human-readable docs may summarize native state, but they do not replace it.

Agents must read `AGENTS.md`, `docs/SPEC.md` and this file before the first meaningful change. They must not infer process from unrelated folders, old imports, personal memory or another project's conventions.

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

Preview a controlled checkpoint:

```bash
downstroke workflow add --item '{"id":"story.example","type":"story","title":"Example","status":"ready-for-dev"}' --controlled --phase plan
```

Create the pending checkpoint:

```bash
downstroke workflow add --item '{"id":"story.example","type":"story","title":"Example","status":"ready-for-dev"}' --controlled --phase plan --yes
```

Approve it after human approval:

```bash
downstroke workflow add --item '{"id":"story.example","type":"story","title":"Example","status":"ready-for-dev"}' --controlled --phase plan --approved --yes
```

## Delivery States

`idea -> brief -> specified -> ready -> in-progress -> review -> accepted -> released`

An item cannot be accepted without observable QA evidence or released without applicable production gates.
