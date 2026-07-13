# Investigation: Remote Module Registry Necessity

## Hand-off Brief

1. **What happened.** Story 9.12 is planned as a later remote registry, but the repository currently has one static preset and no local module protocol or second consumer.
2. **Where the case stands.** Concluded: implementing network discovery, trust roots or installation now would be speculative and would violate the architecture's explicit deferral.
3. **What's needed next.** Keep 9.12 in backlog until two real local modules share a proven contract and an approved remote source/trust model exists; continue with the next non-speculative story.

## Case Info

| Field | Value |
| --- | --- |
| Ticket | Story 9.12 |
| Date opened | 2026-07-13 |
| Status | Concluded |
| System | Downstroke monorepo, Node.js >=22, TypeScript strict |
| Evidence sources | Architecture, epics, package sources, CodeGraph, Git history |

## Problem Statement

Determine whether Story 9.12 should be implemented now or deferred because the local module model and real remote consumers do not yet exist.

## Evidence Inventory

| Source | Status | Notes |
| --- | --- | --- |
| Architecture spine | Available | Explicitly defers registry protocols until normal functions and local modules are insufficient. |
| Epic 9 / FR67 / NFR37 | Available | Describes a later capability and mandatory integrity/provenance constraints. |
| Package sources | Available | One static `liteFiles` composition; no module registry, versioned module manifest or shared provider interface. |
| Remote registry operator/trust root | Missing | No approved endpoint, owner, signing key policy or compatibility contract exists. |

## Investigation Backlog

| # | Path to Explore | Priority | Status | Notes |
| - | --- | --- | --- | --- |
| 1 | Confirm current preset/module consumers | High | Done | Only one static lite preset exists. |
| 2 | Confirm architectural timing | High | Done | Registry is explicitly deferred. |
| 3 | Identify remote operator and trust root | Medium | Blocked | No product decision or evidence exists. |

## Timeline of Events

| Time | Event | Source | Confidence |
| --- | --- | --- | --- |
| 2026-07-01 | Architecture deferred runtime/registry protocols until local need exists. | Architecture spine | Confirmed |
| 2026-07-13 | Story 9.11 supplied inert worker contracts without a remote module consumer. | Commit `1250988` | Confirmed |
| 2026-07-13 | Current package inventory still exposes one static lite preset. | Package sources | Confirmed |

## Confirmed Findings

### Finding 1: The architecture explicitly blocks premature registry design

**Evidence:** `_bmad-output/planning-artifacts/architecture/architecture-Downstroke-2026-07-01/ARCHITECTURE-SPINE.md:163`

**Detail:** Registry protocols remain deferred until normal functions and local modules prove insufficient.

### Finding 2: There is no local module protocol to distribute remotely

**Evidence:** `packages/presets/src/index.ts:1-5`, `packages/spec/src/index.ts:3`, `packages/agents/src/index.ts:5`, `packages/gates/src/index.ts:5`

**Detail:** The only composition is the static `liteFiles` array assembled directly from three package exports. There is no module manifest, compatibility negotiation, installer contract or second preset.

### Finding 3: The requirement itself is future-conditional and security-heavy

**Evidence:** `_bmad-output/planning-artifacts/epics.md:159`, `_bmad-output/planning-artifacts/epics.md:287`

**Detail:** FR67 says Downstroke can provide the registry later. NFR37 requires explicit provenance, integrity/signature verification and no arbitrary install-time execution.

## Deduced Conclusions

### Deduction 1: A remote registry now would invent both sides of an unused protocol

**Based on:** Findings 1-3.

**Reasoning:** No local contract or second consumer exists, while the remote side requires unresolved ownership and trust decisions. Any implementation would encode speculative API, compatibility and key-management choices.

**Conclusion:** Story 9.12 is not necessary now and should remain backlog.

## Hypothesized Paths

### Hypothesis 1: Worker manifests require a remote registry immediately

**Status:** Refuted

**Theory:** Story 9.11's worker manifests need remote discovery to be useful.

**Supporting indicators:** Both use manifest-style contracts.

**Would confirm:** A current workflow unable to use built-in or repository-local worker manifests.

**Would refute:** Existing local registration covers current use without network discovery.

**Resolution:** Story 9.11 deliberately uses immutable built-ins and inert repository-local registration; no remote consumer exists.

## Missing Evidence

| Gap | Impact | How to Obtain |
| --- | --- | --- |
| Two real local module consumers | Defines the smallest shared module contract | Implement and measure repeated local module use first. |
| Registry operator and availability policy | Defines endpoint ownership and failure behavior | Product/operations decision. |
| Trust root and rotation/revocation model | Required for signed artifacts | Security design after an operator exists. |
| Compatibility and rollback evidence | Prevents unsafe upgrades | Derive from real versioned local modules. |

## Source Code Trace

| Element | Detail |
| --- | --- |
| Entry point | `packages/presets/src/index.ts:5` static `liteFiles` composition |
| Trigger | Project initialization consumes the lite preset directly. |
| Condition | No dynamic discovery or installation path is called. |
| Related files | `packages/spec/src/index.ts`, `packages/agents/src/index.ts`, `packages/gates/src/index.ts` |

## Conclusion

**Confidence:** High

The repository has no demonstrated need for a remote module registry. The architecture explicitly defers it, the current module surface is a single static preset, and the security/operations inputs needed for a safe remote protocol are absent. Story 9.12 should remain backlog without code or story creation.

## Recommended Next Steps

### Fix direction

No implementation. Continue to Story 9.13 and apply the same prerequisite/duplication check before creating work.

### Diagnostic

Reopen 9.12 only when two real versioned local modules share a contract and at least one current workflow needs remote discovery.

## Reproduction Plan

Inspect `packages/presets/src/index.ts`; observe that all installed files come from one static array and no remote path is reachable.

## Side Findings

- The same YAGNI gate should be applied to Story 9.13 because Epic 6 already owns managed-block evolution and both prerequisite stories remain backlog.
