---
name: downstroke-token-economy
description: Use this skill to reduce AI token consumption while preserving quality through Greedy, Balanced, and Rich task execution modes, task classification, model routing, context budgeting, prompt caching, project autodocumentation, token audits, and verification gates. Use when planning or executing AI-assisted tasks, creating task lists, analyzing a repo for token efficiency, assigning low-cost or strong models, or running Downstroke token economy checks.
---

# Downstroke Token Economy

## Purpose

Use this skill to spend intelligence responsibly. The goal is not to make the cheapest possible output. The goal is to route each task to the lowest sufficient model and context budget, then verify with tests, reviews, or explicit quality gates.

Downstroke Token Economy treats tokens as project budget:

- Spend little on deterministic, low-risk, repetitive, or local tasks.
- Spend more on ambiguous, architectural, high-risk, security-sensitive, or cross-system tasks.
- Split large work so cheap subtasks can be handled cheaply and strong reasoning is reserved for the parts that need it.
- Persist project knowledge so it does not need to be rediscovered every session.

## Core Rule

Every AI task must receive a mode, task class, model tier, context budget, escalation rule, and verification gate.

If task risk is unknown, classify before executing.

## Execution Modes

Downstroke Token Economy has three official modes: `greedy`, `balanced`, and `rich`.

| Mode | Intent | Strong Model Use |
| --- | --- | --- |
| `greedy` | Maximum savings with strict quality gates. | Only for deep analysis, architecture, high-risk decisions, failed cheap attempts, and final synthesis when needed. |
| `balanced` | Default professional mode: quality and cost are both protected. | Used for planning, non-trivial implementation, design decisions, debugging, and final review when risk warrants it. |
| `rich` | Highest available quality while still using Downstroke limits. | Strongest available model is preferred, but context pruning, caching, budgets, and task splitting still apply. |

## Workflow

1. Inspect project state and existing Downstroke docs.
2. Classify the task.
3. Choose execution mode.
4. Assign model tier and token budget.
5. Build the smallest sufficient context.
6. Execute subtasks with the lowest sufficient tier.
7. Escalate only when signals justify it.
8. Verify with tests, build, typecheck, review, or artifact inspection.
9. Persist the result in the task ledger and project token economy docs.

## Model Tier Language

Use model tiers instead of hardcoded model names inside durable project rules:

| Tier | Meaning |
| --- | --- |
| `local-deterministic` | No LLM: shell, parser, formatter, typechecker, tests, static analysis. |
| `small` | Low-cost model for extraction, summarization, classification, simple rewrites, and mechanical subtasks. |
| `medium` | General implementation, moderate reasoning, debugging with scoped context. |
| `strong` | Deep reasoning, architecture, security, complex debugging, critical reviews, ambiguous tasks. |
| `strong-plus` | Rich-mode highest available model for maximal quality or unusually difficult work. |

The concrete model registry should live in project configuration and can be updated without rewriting the skill.

## Required Task Record

When creating tasks, add a token economy block:

```markdown
## Token Economy

- Mode: greedy | balanced | rich
- Task class:
- Risk: low | medium | high | critical
- Model tier: local-deterministic | small | medium | strong | strong-plus
- Context budget:
- Cache strategy:
- Escalation trigger:
- Verification gate:
- Persisted notes:
```

## Reference Files

Read only what is needed:

- `references/research-notes.md` for source-backed research findings.
- `references/token-modes.md` for the full Greedy, Balanced, and Rich operating model.
- `references/mode-operating-manual.md` for detailed mode behavior, budgets, routing, escalation, and examples.
- `references/task-routing.md` for task classification and model tier assignment.
- `references/project-autodocs.md` for CLI analysis and persistent project files.
- `references/context-budgeting.md` for token reduction techniques.
- `references/quality-gates.md` for verification and escalation rules.
- `references/task-examples.md` for practical examples of task records and mode selection.
