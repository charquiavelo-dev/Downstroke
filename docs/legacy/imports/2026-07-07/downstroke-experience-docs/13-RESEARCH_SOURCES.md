# Research Sources

## Purpose

This document records the external sources reviewed for the native migration strategy. These sources informed the capability extraction, security hardening and performance decisions. Downstroke must not copy protected implementation code or proprietary text from these tools. The goal is functional recreation adapted to Downstroke's architecture.


## External Research Sources Reviewed

- BMAD Method public repository and documentation: https://github.com/bmad-code-org/BMAD-METHOD and https://docs.bmad-method.org/
- BMAD getting-started guide: https://github.com/bmad-code-org/BMAD-METHOD/blob/main/docs/tutorials/getting-started.md
- Caveman repository and skill: https://github.com/JuliusBrussee/caveman and https://github.com/JuliusBrussee/caveman/blob/main/skills/caveman/SKILL.md
- Caveman compression notes: https://github.com/JuliusBrussee/caveman/blob/main/caveman-compress/README.md
- Ponytail repository and skill: https://github.com/DietrichGebert/ponytail and https://github.com/DietrichGebert/ponytail/blob/main/skills/ponytail/SKILL.md
- Ponytail portability notes: https://github.com/DietrichGebert/ponytail/blob/main/docs/agent-portability.md
- CodeGraph repository and docs: https://github.com/colbymchenry/codegraph
- CodeGraph implementation plan: https://github.com/colbymchenry/codegraph/blob/main/IMPLEMENTATION_PLAN.md
- CodeGraph VS Code marketplace description: https://marketplace.visualstudio.com/items?itemName=aStudioPlus.codegraph
- OWASP Top 10 for LLM Applications: https://owasp.org/www-project-top-10-for-large-language-model-applications/
- OWASP RAG Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/RAG_Security_Cheat_Sheet.html
- OWASP MCP Top 10: https://owasp.org/www-project-mcp-top-10/
- Memory poisoning research: https://arxiv.org/abs/2606.04329, https://arxiv.org/abs/2605.15338, https://arxiv.org/abs/2512.16962
- Codebase graph memory research: https://arxiv.org/abs/2603.27277
- Compression research: https://arxiv.org/abs/2606.24083

## Findings Applied To Downstroke

### BMAD

BMAD validates the value of structured AI-assisted development workflows: guided planning, specialized roles, epics, stories, implementation readiness, QA and documentation. Downstroke should recreate this as native workflow state, not as BMAD dependency.

### Caveman

Caveman validates the value of compact output and token discipline. Research suggests output compression can reduce realized cost, while input/source compression can harm accuracy and increase cost. Downstroke should compress responses and handoffs, not canonical source docs or evidence.

### Ponytail

Ponytail validates the value of minimal engineering posture: reuse, deletion, stdlib/platform first, fewer dependencies and fewer abstractions. Downstroke should enforce this as native gates with explicit exceptions for security, data integrity, accessibility, reliability and measured performance.

### CodeGraph

CodeGraph validates the value of pre-indexed code intelligence. Research and public docs support AST/tree-sitter-style structural indexing to reduce repeated code exploration. Downstroke should start with native JS/TS file/symbol/import indexing and grow toward deeper graph analysis.

### OWASP LLM / RAG / MCP Security

The key risks for Downstroke are prompt injection, insecure output handling, supply chain vulnerabilities, excessive agency, data poisoning, MCP tool poisoning, insecure memory references, context spoofing and secret exposure. This supports the decision to keep native migration local, read-only by default, source-attributed and strict about trust boundaries.

### Memory Poisoning Research

Persistent memory is powerful but dangerous. Downstroke's Experience Layer must not aggressively write untrusted context into memory. Legacy imports must start as observed/inferred facts, not verified facts. Quarantine and evidence are mandatory.
