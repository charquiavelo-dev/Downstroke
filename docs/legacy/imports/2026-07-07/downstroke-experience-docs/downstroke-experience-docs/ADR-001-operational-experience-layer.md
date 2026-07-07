# ADR-001: Operational Experience Layer

## Status

Accepted for initial design.

## Context

Downstroke is a modular framework for starting, inspecting, and strengthening AI-assisted projects with rules, context, planning, and QA gates.

The framework needs a durable way to preserve project knowledge across prompts, agents, sessions, and tools. However, naive memory is unsafe. A memory layer can improve continuity, but it can also preserve hallucinations, stale facts, malicious instructions, poisoned external content, leaked secrets, and bridge/tool metadata that should never become trusted.

The current LLM architecture should be treated as stateless at the project level. Any durable project continuity must be supplied by Downstroke, not assumed from the model.

## Decision

Downstroke will implement an Operational Experience Layer.

The layer will persist project knowledge as structured records with source, trust, evidence, scope, TTL, and status.

Downstroke will not describe this as consciousness, subjective experience, true understanding, or model self-improvement. It is operational memory for the project.

## Decision Statement

```txt
Downstroke does not make the model remember. Downstroke makes the project remember safely.
```

## Core Data Unit

```txt
Fact + Source + Trust + Evidence + Scope + TTL
```

## Rationale

A normal chat transcript is not a safe project memory format because it mixes instructions, data, speculation, tool output, generated text, and user intent.

The safer design is to persist small claims about the project, each with metadata that allows Downstroke to decide whether the claim can be reused.

This gives the system:

- Auditability.
- Traceability.
- Better context compression.
- Safer retrieval.
- Explicit trust boundaries.
- Better multi-repo isolation.
- Clearer verification rules.
- Cleaner integration with `doctor`.

## Security Rationale

Prompt injection, document poisoning, memory poisoning, insecure output handling, excessive agency, insecure plugin design, and MCP tool poisoning are current practical risks for LLM systems.

The architecture therefore assumes:

1. Any external text may contain malicious instructions.
2. Any LLM output may be wrong.
3. Any long-term memory write may become a future attack vector.
4. Any bridge or tool can expand the attack surface.
5. Any claim marked `verified` must have evidence outside the LLM.
6. No prompt-level delimiter creates a perfect security boundary.

## Performance Rationale

The initial implementation must avoid heavy infrastructure.

The default storage must be:

```txt
JSONL + indexes + file hashes + compact context packs
```

Vector search and embeddings are useful later, but they add:

- Cost.
- Latency.
- Privacy concerns.
- Index integrity concerns.
- Dependency complexity.
- Poisoning attack surface.

Therefore, embeddings are not included in `lite`.

## Consequences

### Positive

- Stronger continuity across AI-assisted work.
- Less repeated context.
- Clearer distinction between facts and guesses.
- Safer context compilation.
- Better doctor diagnostics.
- Better multi-repo support.
- Future bridge readiness.

### Negative

- More schemas to maintain.
- More CLI commands.
- More test fixtures.
- More policy decisions.
- More initial implementation work.

### Neutral

- The system does not eliminate prompt injection.
- The system does not eliminate memory poisoning.
- The system reduces blast radius through policy, evidence, provenance, quarantine, and least privilege.

## Alternatives Considered

### Alternative 1: Store Full Chat History

Rejected.

Reasons:

- Unsafe.
- Token-heavy.
- Poor retrieval quality.
- Hard to audit.
- Mixes data and instructions.
- High memory poisoning risk.

### Alternative 2: Vector Database First

Rejected for initial scope.

Reasons:

- Too heavy for `lite`.
- Adds operational complexity.
- Adds index integrity risk.
- Adds dependency/security surface.
- Not required for first useful implementation.

### Alternative 3: Trust LLM Summaries As Memory

Rejected.

Reasons:

- Generated summaries may hallucinate.
- Summaries can launder untrusted origin.
- Summaries may omit evidence.
- Summaries can preserve malicious instructions.

### Alternative 4: Use Existing Agent Framework Memory Directly

Rejected as default.

Reasons:

- Downstroke should stay framework-agnostic.
- Existing memory stores do not automatically match Downstroke trust/evidence rules.
- Bridges can be added later behind capability policies.

## Accepted Rules

### Rule 1

LLM output cannot create `verified` memory.

### Rule 2

External content starts as `untrusted`.

### Rule 3

Untrusted content cannot become instructions.

### Rule 4

Verified claims require evidence.

### Rule 5

Context packs must be compiled, not dumped.

### Rule 6

Quarantined content cannot be included in active agent context.

### Rule 7

No bridge has dangerous capabilities by default.

### Rule 8

`lite` must run without network, shell, embeddings, or vector database.

## Architecture Overview

```txt
User Task
  -> Experience Capture
  -> Fact Store
  -> Evidence Store
  -> Trust Evaluation
  -> Security Scan
  -> Context Compiler
  -> Agent Context Pack
  -> Gates
  -> New Evidence
  -> Updated Experience
```

## Verification Model

A fact can move across statuses only through explicit transitions.

```txt
inferred -> observed -> verified
observed -> stale
verified -> stale
any -> conflicted
any -> quarantined
quarantined -> rejected
quarantined -> observed only after explicit review
```

## Bridge Policy

Every bridge must declare:

```ts
type DownstrokeBridge = {
  id: string;
  name: string;
  version: string;
  capabilities: {
    readRepo?: boolean;
    writeRepo?: boolean;
    runCommands?: boolean;
    accessNetwork?: boolean;
    accessSecrets?: boolean;
  };
  trust: {
    defaultOutputTrust: "trusted" | "project" | "generated" | "external" | "untrusted";
    requiresSandbox: boolean;
    requiresUserApprovalForWrites: boolean;
  };
};
```

## Open Questions

1. Should manual approval be enough for `verified`, or only for `accepted`?
2. Should bridge descriptors be hash-pinned in the first implementation?
3. Should Downstroke use a local SQLite store after JSONL proves useful?
4. Should memory records support cryptographic signatures in v0.2?
5. Should context packs support separate render modes for Claude, Codex, Gemini, and other agents?

## Final Decision

Build the Operational Experience Layer as local, conservative, evidence-first infrastructure.

Avoid broad claims.

Prioritize safety and performance over autonomous behavior.
