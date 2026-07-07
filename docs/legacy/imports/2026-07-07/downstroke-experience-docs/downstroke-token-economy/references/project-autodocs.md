# Project Autodocumentation

## Purpose

Downstroke should not rediscover the same project facts every session. Token economy depends on persistent, compact, accurate project memory.

## Files

Create or update:

```txt
.downstroke/token-economy/
  project-map.md
  context-index.json
  model-routing.json
  task-ledger.jsonl
  token-budget.md
  cache-strategy.md
  reanalysis-report.md
```

## `project-map.md`

Human-readable summary:

- Project purpose.
- Main packages/apps.
- Important commands.
- Architecture boundaries.
- Test strategy.
- Known high-risk areas.
- Current Downstroke modules.
- Important project rules.

Keep concise. Link to source files instead of copying large content.

## `context-index.json`

Machine-readable map:

```json
{
  "version": 1,
  "generatedAt": "YYYY-MM-DDTHH:mm:ssZ",
  "files": [
    {
      "path": "src/orders/service.ts",
      "kind": "domain-service",
      "summary": "Order lifecycle transitions and validation.",
      "risk": "high",
      "tags": ["orders", "business-rules"]
    }
  ]
}
```

## `model-routing.json`

Project-specific routing configuration:

```json
{
  "version": 1,
  "defaultMode": "balanced",
  "tiers": {
    "small": ["provider-small-model"],
    "medium": ["provider-medium-model"],
    "strong": ["provider-strong-model"],
    "strong-plus": ["provider-strongest-model"]
  },
  "routingRules": [
    {
      "match": "security|auth|payment|migration",
      "minimumTier": "strong",
      "verification": ["tests", "review"]
    }
  ]
}
```

Do not hardcode global model names in the skill. Let each project define available models.

## `task-ledger.jsonl`

Append one JSON object per AI-assisted task:

```json
{"id":"TE-001","mode":"greedy","taskClass":"summarization","risk":"low","tier":"small","inputTokens":1200,"outputTokens":220,"cachedTokens":900,"verification":"manual-review","result":"accepted"}
```

Use it to learn which task classes are expensive, which routes fail, and when escalation is common.

## CLI Commands

Recommended commands:

```bash
downstroke tokens analyze
downstroke tokens reanalyze
downstroke tokens doctor
downstroke tokens report
downstroke tokens set-mode greedy
downstroke tokens set-mode balanced
downstroke tokens set-mode rich
downstroke tokens route "Implement password reset email copy"
```

## Analyze

`downstroke tokens analyze` should:

- detect project type and workspace shape;
- identify important docs and rules;
- map commands and package scripts;
- summarize architecture boundaries;
- identify high-risk directories;
- create token economy files;
- propose default routing rules.

## Reanalyze

`downstroke tokens reanalyze` should run when:

- new packages/apps are added;
- major dependencies change;
- project rules change;
- routes/modules are added;
- test commands change;
- token ledger shows repeated expensive failures.

## Doctor

`downstroke tokens doctor` should check:

- project map exists and is fresh;
- routing config exists;
- task ledger is valid JSONL;
- cache strategy is documented;
- high-risk directories have strong-tier routing;
- token budget is not stale;
- context index does not copy large source files verbatim.
