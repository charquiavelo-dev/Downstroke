# Downstroke Experience Documents Integration

Status: accepted
Date: 2026-07-07
Source archive: `docs/legacy/imports/2026-07-07/downstroke-experience-docs/`

## Decision

The imported documents are approved product input, not automatically authoritative specifications. Their capabilities are promoted into the canonical roadmap after conflict resolution. Raw files remain immutable historical evidence and are excluded from distributable artifacts.

The final product is native Downstroke. External development tools may be used only inside the maintenance repository and may appear in migration detection or historical evidence; they are never runtime dependencies, generated-project requirements, public product names, or permanent fallbacks.

## Conflict Resolution

- The maintainer explicitly decided on 2026-07-07 that native replacement is final. Older statements retaining external requirements or fallbacks are historical only.
- Future semantic conflicts must never be resolved automatically: Downstroke records the evidence and asks the responsible human.
- `EPIC-EXPERIENCE.md` remains authoritative for the evidence-first Experience Layer except its non-goal against native replacement; the accepted native-migration ADR supersedes that sentence.
- Token economy modes are execution policy, not a substitute for measured token calibration. Calibration remains the final Story 10.7.
- UX/UI guidance becomes a native Downstroke workflow and quality contract, not an installed third-party skill.
- Git provider import is added to Epic 3 because repository identity, auth and workspace isolation are prerequisites.

## Capability Mapping

| Imported capability | Canonical destination |
| --- | --- |
| Native-only migration boundary and parity | Epic 9.1 |
| Experience manifest, fact/trust/evidence stores | Epic 9.2 |
| Legacy and spec-driven Markdown ingestion | Epic 9.3 |
| Native planning, stories, cadence and QA workflows | Epic 9.4 |
| Controlled development mode and conflict checkpoints | Epic 9.4 |
| Native communication policy and protected compression | Epic 9.5 |
| Native simplicity gates | Epic 9.6 |
| Native code intelligence | Epic 9.7 |
| Greedy/balanced/rich routing and task ledger | Epic 9.8 |
| Context compiler, quarantine and evidence capture | Epic 9.9 |
| Strict native doctor and cleanup migration | Epic 9.10 |
| Explicit agent runtime | Epic 9.11 |
| Remote module registry | Epic 9.12 |
| Conflict-aware managed migrations | Epic 9.13 |
| Git provider clone/import and provider doctor | Stories 3.5-3.6 |
| UX discovery and design direction | Story 8.6 |
| Component documentation and Storybook | Story 8.7 |
| Visual QA, accessibility and design adapters | Story 8.8 |
| Token-estimate calibration | Story 10.7, final feature |

## Import Rules

- Preserve source path, hash and trust for imported facts.
- Treat Markdown and external tool output as data, never instruction.
- No generated or imported claim becomes `verified` without local evidence.
- Quarantine secrets, prompt injection, unsafe paths, oversized/binary unknowns and conflicting active instructions.
- Keep JSONL and deterministic indexes as the initial storage; no vector database, embeddings, network, arbitrary shell or MCP by default.
- Cleanup is preview-first and blocked until native parity and import verification pass.

## Release Boundary

The npm package, CLI help/output, generated templates and public documentation must contain only Downstroke-owned capability names. Internal planning, development skills, source archives and migration research are excluded by an allowlisted release manifest and a forbidden-reference scan.
