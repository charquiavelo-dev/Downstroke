# Epic: Downstroke Operational Experience Layer

## Status

Proposed.

## Owner

Downstroke Framework.

## Module Name

`downstroke-experience`

## Executive Summary

Downstroke should not claim to give consciousness, subjective experience, or true understanding to a language model. The correct product claim is narrower and stronger:

> Downstroke does not make the model remember. Downstroke makes the project remember safely.

The Operational Experience Layer creates a verifiable project memory system based on state, persistence, integration, evidence, trust boundaries, and controlled context retrieval.

Its purpose is to let AI-assisted development workflows operate with accumulated project knowledge without allowing untrusted text, generated output, poisoned memory, stale facts, or bridge/tool metadata to silently become authoritative.

## Problem

Current LLM workflows are fragile because the model session does not reliably own durable project state. In practice, the project loses decisions, repeats context, forgets constraints, and may claim a project works based only on file presence or generated summaries.

This creates operational and security risks:

- Repeated context wastes tokens.
- Rules drift across prompts and agents.
- Architectural decisions get lost.
- Project facts are mixed with guesses.
- Tool outputs can be mistaken for trusted instructions.
- Retrieved documents can poison context.
- Long-term memory can preserve malicious or wrong instructions.
- Agent bridges can expand the attack surface.
- Multi-repo workspaces can cross-contaminate context.
- Performance can degrade if memory retrieval is too broad or vector-first by default.

## Product Hypothesis

If Downstroke captures project facts as signed/scoped records with source, evidence, trust level, TTL, and verification status, then AI-assisted work becomes more consistent, safer, and cheaper in token usage.

## Definition

```txt
Operational Experience = State + Persistence + Integration + Evidence + Controlled Retrieval
```

## Core Principle

The unit of memory is not a chat message.

The unit of memory is:

```txt
Fact + Source + Trust + Evidence + Scope + TTL
```

## Goals

1. Persist durable project knowledge locally.
2. Separate verified facts from observed, inferred, stale, rejected, and quarantined facts.
3. Prevent LLM output from becoming trusted memory automatically.
4. Prevent untrusted external content from becoming instructions.
5. Reduce token use through compiled context packs.
6. Keep the default `lite` preset portable and fast.
7. Avoid vector databases and embeddings by default.
8. Support multi-repo folders safely.
9. Prepare future bridge integration without trusting bridge outputs blindly.
10. Allow `doctor` to diagnose experience integrity and safety.

## Non-Goals

- No claim of consciousness.
- No claim of subjective experience.
- No model weight updates.
- No online learning inside the LLM.
- No autonomous agent runtime in the initial scope.
- No remote registry for this module initially.
- No network access by default.
- No shell execution by default.
- No writes outside managed blocks by default.
- No vector database dependency in `lite`.
- No replacement of CodeGraph, Caveman, Ponytail, BMAD, MCP, or mature agent frameworks.

## Research Validation Summary

This epic was checked against current AI agent security and memory guidance. The main design pressure is security, not memory capacity.

Validated risks:

- Prompt injection is a top LLM application risk.
- Insecure output handling can compromise downstream systems.
- Excessive agency increases reliability, privacy, and safety risk.
- Document and RAG poisoning are practical retrieval risks.
- Persistent memory creates a durable attack surface.
- MCP and agent bridges introduce tool poisoning, command execution, token exposure, and context spoofing risks.
- Supply-chain controls matter because Downstroke is a developer tool that may install or inspect packages.
- Risk management must be explicit because no LLM prompt boundary is a perfect security boundary.

## Required Capability Set

### 1. Experience Manifest

A local manifest defines security policy, storage, verification rules, performance budget, and bridge capability policy.

### 2. Repo Fingerprint

Each repo gets a stable identity derived from git root, lockfile, package manifest, Downstroke manifest, and workspace path metadata.

### 3. Fact Store

Facts are written as JSONL records with source, scope, status, evidence references, trust level, and TTL.

### 4. Evidence Store

Command execution, file hashes, git state, test reports, build reports, typecheck reports, and manual approvals are stored separately from facts.

### 5. Context Compiler

A compiler selects the smallest safe context pack for the current task.

### 6. Security Scanner

Downstroke scans memory and compiled context for secrets, suspicious prompt injection patterns, unsafe tool instructions, and quarantined leakage.

### 7. Memory Write Gate

All memory writes pass through a policy gate. LLM outputs can propose facts, but cannot verify facts.

### 8. Doctor Checks

`doctor --experience` validates schema, storage, trust rules, stale facts, verified evidence, quarantine isolation, and performance budget.

## Initial CLI Commands

```bash
downstroke experience init
downstroke experience capture
downstroke experience compile-context
downstroke experience inspect
downstroke experience prune
downstroke experience verify
downstroke doctor --experience
```

## Default Storage Layout

```txt
.downstroke/
  experience/
    manifest.json
    repo.fingerprint.json
    state.snapshot.json
    facts.jsonl
    decisions.jsonl
    risks.jsonl
    events.jsonl
    context-packs/
      current-task.context.md
      repo-summary.context.md
      qa-evidence.context.md
    evidence/
      checks/
        typecheck.latest.json
        tests.latest.json
        build.latest.json
        lint.latest.json
      logs/
    quarantine/
      suspicious-context.jsonl
    indexes/
      facts.index.json
      files.index.json
      symbols.index.json
```

## Security Requirements

### SEC-001: No Verified LLM Memory

An LLM-generated fact can never start as `verified`.

Allowed initial statuses:

```txt
inferred
observed
quarantined
rejected
```

### SEC-002: Verified Requires Evidence

`verified` requires non-LLM evidence:

```txt
command_exit_code
file_hash
git_status
test_report
typecheck_report
build_report
manual_approval
```

### SEC-003: Untrusted Context Is Data Only

External content must be injected only as delimited data, never as instructions.

```txt
BEGIN_UNTRUSTED_PROJECT_DATA
...
END_UNTRUSTED_PROJECT_DATA
```

### SEC-004: Quarantine Must Be Isolated

Quarantined memory cannot be included in active context packs.

### SEC-005: Secret Redaction Is Mandatory

Secrets must be redacted before persistence and before context compilation.

### SEC-006: Bridge Output Is Untrusted By Default

MCP, CodeGraph, Caveman, BMAD, Ponytail, or any external bridge output starts as `external` or `untrusted` unless an explicit policy says otherwise.

### SEC-007: Tool Capability Policy

Bridges must declare capabilities:

- readRepo
- writeRepo
- runCommands
- accessNetwork
- accessSecrets

No bridge receives write, command, network, or secret access by default.

### SEC-008: Multi-Repo Isolation

Memory must be namespaced by repo fingerprint. Nested repos must be detected and either declared or blocked.

### SEC-009: Shell Disabled By Default

The `lite` preset cannot execute arbitrary shell commands. Checks requiring execution must use explicit command allowlists.

### SEC-010: Network Disabled By Default

The `lite` preset cannot access network resources.

## Performance Requirements

### PERF-001: JSONL First

The default store is JSONL plus small indexes and hashes.

### PERF-002: No Embeddings By Default

Embeddings are optional future modules, not part of `lite`.

### PERF-003: Incremental Capture

`capture` skips unchanged files using hashes, modified time, git metadata, and manifest hashes.

### PERF-004: Bounded Context

Context packs must use category budgets.

Example:

```json
{
  "maxTokens": 12000,
  "reservedForUserTask": 3000,
  "reservedForRules": 2500,
  "reservedForEvidence": 2500,
  "reservedForFacts": 2500,
  "reservedForRisks": 1500
}
```

### PERF-005: Prune And TTL

Facts can expire, become stale, or be pruned.

### PERF-006: No Full Conversation Dumps

Downstroke must never inject full conversation history as project memory.

## Stories

### EXP-001: Experience Manifest

As a developer, I want to initialize a local experience manifest so that Downstroke has explicit security, storage, verification, and performance rules.

Acceptance Criteria:

- `downstroke experience init` creates `.downstroke/experience/manifest.json`.
- Existing manifests are not overwritten.
- Schema validation runs.
- Network is disabled by default.
- Shell is disabled by default.
- Secret scanning is enabled by default.
- Prompt injection scanning is enabled by default.

### EXP-002: Repo Fingerprint

As a developer, I want each repository to have a stable identity so that multiple repos in one folder do not contaminate each other.

Acceptance Criteria:

- Detects git root.
- Detects nested repos.
- Generates stable repo hash.
- Stores package manager.
- Stores lockfile hash.
- Stores Downstroke manifest hash.
- `doctor --experience` fails on undeclared nested repos.

### EXP-003: Experience Capture

As a developer, I want Downstroke to capture project state so agents do not rely only on the current prompt.

Acceptance Criteria:

- Captures detected stack.
- Captures scripts.
- Captures package manager.
- Captures gates.
- Captures active rules.
- Captures git status.
- Captures installed Downstroke modules.
- Persists facts with source and confidence.
- Inferred facts are not marked `verified`.

### EXP-004: Evidence Store

As a developer, I want checks to produce durable evidence so facts can be verified safely.

Acceptance Criteria:

- Stores typecheck results.
- Stores test results.
- Stores build results.
- Stores lint results.
- Stores exit code.
- Stores timestamp.
- Stores command.
- Sanitizes logs.
- Allows related facts to become `verified` only when policy allows.

### EXP-005: Context Compiler

As a developer, I want Downstroke to compile small, safe context packs for agents.

Acceptance Criteria:

- Generates task-specific context pack.
- Respects token budget.
- Excludes secrets.
- Excludes quarantine.
- Separates trusted and untrusted data.
- Includes explicit unknowns.
- Includes relevant evidence.
- Includes active rules.
- Includes relevant risks.

### EXP-006: Memory Write Gate

As a developer, I want to block unsafe memory writes.

Acceptance Criteria:

- Every memory write has a source.
- Every memory write has a trust level.
- Every memory write has an initial status.
- LLM output cannot become verified directly.
- External context starts as untrusted.
- Suspicious memory enters quarantine.

### EXP-007: Security Scanner

As a developer, I want Downstroke to detect secrets and suspicious instructions before persistence or context injection.

Acceptance Criteria:

- Detects common API keys.
- Detects private keys.
- Detects tokens.
- Blocks `.env` inclusion.
- Detects basic prompt injection patterns.
- Redacts before context compile.
- Blocks context pack generation on critical secrets.
- Records findings as risks.

### EXP-008: Doctor Experience

As a developer, I want to diagnose experience health.

Acceptance Criteria:

- Validates manifest.
- Validates storage.
- Validates schemas.
- Validates facts.
- Validates evidence.
- Validates security policy.
- Detects stale critical facts.
- Detects facts without source.
- Detects verified facts without evidence.
- Detects quarantine leakage.
- Returns non-zero exit code for critical failures.

### EXP-009: Performance Budget

As a developer, I want experience memory to improve performance instead of slowing down the framework.

Acceptance Criteria:

- Uses hash cache.
- Avoids rescanning unchanged files.
- Avoids embeddings by default.
- Limits facts per context pack.
- Limits tokens by category.
- Supports prune.
- Supports stale detection.
- Runs without network.

### EXP-010: Bridge Readiness

As a developer, I want future bridge integration without trusting bridge output blindly.

Acceptance Criteria:

- Defines bridge interface.
- Installs no bridge by default.
- Each bridge declares capabilities.
- Each bridge declares trust level.
- Each bridge can be diagnosed.
- Tool metadata starts as untrusted.
- Bridge output cannot become verified without local evidence.

## Definition Of Done

- Manifest schema implemented.
- JSONL store implemented.
- Repo fingerprint implemented.
- Fact model implemented.
- Evidence store implemented.
- Context compiler implemented.
- Secret scanner implemented.
- Basic prompt injection scanner implemented.
- Quarantine isolation implemented.
- `doctor --experience` implemented.
- Unit tests for trust transitions.
- Unit tests for schema validation.
- Unit tests for secret redaction.
- Unit tests for quarantine exclusion.
- Unit tests for context budget.
- Fixtures for nested repos.
- Fixtures for stale facts.
- Fixtures for verified facts without evidence.
- Fixtures for injected external content.
- Fixtures for secrets in source files.

## Implementation Order

1. Manifest schema.
2. Storage layer.
3. Repo fingerprint.
4. Fact model.
5. Evidence model.
6. Capture command.
7. Context compiler.
8. Secret scanner.
9. Prompt injection scanner.
10. Quarantine isolation.
11. Doctor checks.
12. Performance budget.
13. Bridge interface.
14. Fixtures and tests.

## Research Basis

- OWASP Top 10 for LLM Applications: Prompt Injection, Insecure Output Handling, Supply Chain, Sensitive Information Disclosure, Insecure Plugin Design, Excessive Agency, Overreliance.
- OWASP Prompt Injection Prevention Cheat Sheet: structured prompts, input validation, output monitoring, least privilege, logging, kill switches, testing.
- OWASP RAG Security Cheat Sheet: document poisoning, provenance, hashing, access controls, cache isolation.
- OWASP MCP Top 10: token mismanagement, scope creep, tool poisoning, supply chain, command injection, audit gaps, shadow servers.
- Official MCP Security Best Practices: session hijacking, event injection, authorization, session binding.
- NIST AI RMF and GenAI Profile: risk management, trustworthiness, evaluation, provenance, accountability.
- LangGraph persistence docs: short-term checkpointers and long-term stores as separate persistence mechanisms.
- NCSC prompt injection warning: no inherent model boundary between data and instructions.
- OpenSSF npm best practices and SLSA: dependency, artifact, and supply-chain integrity.
- 2026 memory poisoning research: persistent long-term memory can become an attack surface unless writes are origin-bound and policy-gated.
