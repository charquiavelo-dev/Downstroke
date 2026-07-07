# Downstroke Native Migration Documentation

This ZIP contains the corrected native migration plan for removing BMAD, Caveman, Ponytail and CodeGraph as active dependencies while preserving compatibility with existing projects that already contain their artifacts.

Core decision:

```txt
BMAD, Caveman, Ponytail and CodeGraph are legacy migration sources only. Downstroke must provide native workflow, communication, simplicity and code-intelligence capabilities.
```

Recommended read order:

1. `00-CURRENT-PROJECT-LEGACY-AUDIT.md`
2. `01-LEGACY-COMPATIBILITY-AND-MIGRATION-STRATEGY.md`
3. `02-DOCTOR-REDESIGN-LEGACY-DETECTION.md`
4. `11-ADR-003_NATIVE_MIGRATION_FROM_LEGACY_AGENT_STACK.md`
5. `09-NATIVE_PARITY_MATRIX.md`
6. `10-IMPLEMENTATION_ROADMAP.md`
7. Tool-specific migration docs.
8. Security and research docs.

The most important behavior change is in doctor:

```txt
Old: detect BMAD/CodeGraph/Caveman/Ponytail and call them healthy.
New: detect them as legacy, explain conflict risk, offer safe migration, verify native parity, then require cleanup/quarantine.
```
