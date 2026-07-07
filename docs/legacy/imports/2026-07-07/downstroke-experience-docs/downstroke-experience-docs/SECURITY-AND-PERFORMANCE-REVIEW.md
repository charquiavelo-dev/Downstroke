# Security And Performance Review: Operational Experience Layer

## Status

Research-backed review.

## Review Objective

Re-check the Downstroke Operational Experience Layer from three angles:

1. Security risk.
2. Performance risk.
3. Product/architecture risk.

## Executive Result

The design is solid if it stays conservative.

The safest version is not a generic autonomous memory system. The safest version is a local, evidence-first, policy-gated project memory layer.

Recommended positioning:

```txt
Downstroke does not make the model remember. Downstroke makes the project remember safely.
```

## Verification Pass 1: Security

### Finding 1: Prompt Injection Must Be Treated As Structural Risk

LLM applications remain vulnerable because model context does not provide a hard security boundary between data and instructions.

Design impact:

- Untrusted data must be rendered as data only.
- Prompt delimiters help structure context, but must not be treated as perfect isolation.
- Tool execution must not depend only on model obedience.
- Context compiler must include explicit security rules.

Downstroke control:

```txt
Untrusted data cannot become instructions.
```

### Finding 2: Memory Poisoning Is The Main New Risk

Persistent memory turns a single bad write into a durable control channel.

Design impact:

- Memory writes require a gate.
- LLM summaries cannot upgrade trust.
- All facts need source lineage.
- Quarantine is mandatory.
- TTL and stale detection are mandatory.

Downstroke control:

```txt
Fact + Source + Trust + Evidence + Scope + TTL
```

### Finding 3: RAG And Retrieval Add Poisoning Risk

Retrieval corpora can be poisoned. Vector databases and embeddings are not only performance tools; they are also security surfaces.

Design impact:

- No vector database in `lite`.
- No embeddings by default.
- Hash sources.
- Track provenance.
- Do not retrieve broad memory by default.

Downstroke control:

```txt
JSONL first, indexed and hash-backed.
```

### Finding 4: MCP And Bridges Are High-Risk

MCP and external bridges can introduce tool poisoning, shadow servers, command injection, token exposure, insufficient authorization, and audit gaps.

Design impact:

- Bridges disabled by default.
- Capability declaration required.
- Bridge output external/untrusted by default.
- Descriptor hash required before elevation.
- No write/network/secret capability by default.

Downstroke control:

```txt
No bridge has dangerous capabilities by default.
```

### Finding 5: Supply Chain Controls Matter

Downstroke is developer tooling. If it installs modules, inspects package managers, or supports bridges, package supply chain risk is directly relevant.

Design impact:

- No remote registry initially.
- No postinstall trust assumption.
- Prefer pinned versions when modules are added.
- Inspect lockfiles.
- Record package manager and lockfile hashes.
- Prepare future provenance/SBOM support.

Downstroke control:

```txt
Do not auto-install external bridges or modules in the initial experience layer.
```

## Verification Pass 2: Performance

### Finding 1: Full Memory Dumps Will Hurt Performance

Dumping all history into context increases cost, latency, and risk.

Control:

```txt
Compile task-specific context packs.
```

### Finding 2: Embeddings Are Not Needed For v0.1

Embeddings may help later, but they add infrastructure, latency, dependency, privacy, and integrity concerns.

Control:

```txt
Embeddings disabled in lite.
```

### Finding 3: Incremental Capture Is Mandatory

Repeated full scans will punish medium and large repos.

Control:

```txt
Use git metadata, modified time, file hashes, manifest hashes, and lockfile hashes.
```

### Finding 4: Context Budgets Must Be Enforced

A memory layer without budget will grow until it becomes slow and useless.

Control:

```json
{
  "maxContextTokens": 12000,
  "maxMemoryItemsPerContext": 40
}
```

### Finding 5: JSONL Is Good Enough For Lite

JSONL is portable, inspectable, git-friendly, and easy to debug.

Control:

```txt
Use JSONL + indexes first. Consider SQLite later only after real use.
```

## Verification Pass 3: Product And Architecture

### Finding 1: The Claim Must Stay Conservative

Avoid claims like:

```txt
Downstroke gives LLMs experience.
Downstroke makes agents understand.
Downstroke makes AI secure.
Downstroke prevents prompt injection.
```

Use claims like:

```txt
Downstroke gives projects operational memory.
Downstroke makes project context auditable.
Downstroke reduces unsafe assumptions.
Downstroke verifies claims with evidence.
Downstroke reduces blast radius through policy.
```

### Finding 2: `verified` Must Be Narrow

`verified` must mean only:

```txt
There is sufficient local evidence for this claim at this time.
```

It must not mean:

```txt
The project works completely.
The code is production-ready.
The agent understood the project.
The system is secure.
```

### Finding 3: Human Approval Is Not Technical Evidence

A human can approve a decision, but cannot make tests pass by approval.

Control:

```txt
manual_approval can verify decisions, not execution claims.
```

### Finding 4: Multi-Repo Support Is A Differentiator

The user's freelancer workflow often has multiple repos in one folder. This creates real risk of global repo confusion.

Control:

```txt
Repo fingerprint + nested repo detection + memory namespace per repo.
```

### Finding 5: Bridge Readiness Should Be Interface-Only First

Do not implement all bridges now.

Control:

```txt
Define bridge interface, capability policy, and doctor checks first.
```

## Required Design Adjustments

### Adjustment 1: Add Origin Binding

Every fact must preserve original source lineage even after summarization.

### Adjustment 2: Add Summary Laundering Protection

LLM summaries cannot upgrade external or untrusted data into project truth.

### Adjustment 3: Add Bridge Descriptor Hashing

Bridge metadata should be hash-pinned before trust elevation.

### Adjustment 4: Add Manual Approval Limits

Manual approval verifies decisions, not execution facts.

### Adjustment 5: Add Quarantine Leakage Test

Context compiler must fail if quarantined content appears in output.

### Adjustment 6: Add Stale Verified Facts

Verified facts must become stale when source, lockfile, git state, or TTL changes.

### Adjustment 7: Add Deterministic Context Output

Same inputs should produce stable context output for cacheability and debugging.

## Hard Security Defaults For Lite

```json
{
  "allowNetwork": false,
  "allowShell": false,
  "allowWriteOutsideManagedBlocks": false,
  "allowMcpBridges": false,
  "allowEmbeddings": false,
  "secretScanning": true,
  "promptInjectionScanning": true,
  "quarantineSuspiciousContext": true,
  "verifiedRequiresExecution": true,
  "bridgeOutputDefaultTrust": "external"
}
```

## Recommended Future Pro Mode

```json
{
  "allowNetwork": "explicit",
  "allowShell": "allowlist",
  "allowWriteOutsideManagedBlocks": false,
  "allowMcpBridges": "explicit",
  "allowEmbeddings": "optional",
  "secretScanning": true,
  "promptInjectionScanning": true,
  "quarantineSuspiciousContext": true,
  "verifiedRequiresExecution": true,
  "auditLogging": true,
  "capabilityPolicies": true,
  "descriptorHashing": true
}
```

## Final Risk Rating

### Security Risk If Implemented Naively

High.

Reasons:

- Persistent memory can preserve malicious instructions.
- External context can poison future behavior.
- Bridge metadata can manipulate tools.
- Agent output can be over-trusted.

### Security Risk With Proposed Controls

Medium to low for local `lite` mode.

Residual risk remains because prompt injection cannot be fully eliminated by prompt formatting alone.

### Performance Risk If Implemented Naively

High.

Reasons:

- Full memory dumps.
- Broad retrieval.
- Embeddings by default.
- Full repo scans.
- Unbounded context growth.

### Performance Risk With Proposed Controls

Low to medium.

Reasons:

- JSONL store.
- Hash cache.
- Incremental snapshots.
- No embeddings by default.
- Token budgets.
- Prune and TTL.

## Final Recommendation

Proceed with the epic.

Do not widen the first implementation.

Build the smallest safe version:

1. Manifest.
2. Repo fingerprint.
3. JSONL facts.
4. Evidence store.
5. Trust transitions.
6. Security scanners.
7. Context compiler.
8. Doctor checks.
9. Multi-repo isolation.
10. Tests and fixtures.

Do not build yet:

- Autonomous runtime.
- Remote registry.
- Vector database.
- Embeddings.
- Automatic bridge installation.
- Shell execution.
- Network access.
- Auto-migrations outside managed blocks.

## Source Basis

This review is based on current guidance and research from OWASP LLM, OWASP RAG, OWASP MCP, official MCP security documentation, NIST AI RMF, NCSC prompt injection analysis, LangGraph persistence design, OpenSSF npm best practices, SLSA, and 2026 research on memory poisoning and secure agent architectures.
