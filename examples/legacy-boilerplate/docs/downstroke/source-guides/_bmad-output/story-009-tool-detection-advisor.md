# Story 009: Tool Detection Advisor

## Goal

Como developer, quiero que Downstroke detecte mis tools instaladas y me diga si conviene mantenerlas, integrarlas, reemplazarlas o revisar conflictos.

## Tasks

- Crear comando `downstroke tools doctor`.
- Detectar package manager por lockfile.
- Detectar frameworks, monorepo tools, linters, formatters, test runners, UI tools, state/data tools y AI/dev workflow tools.
- Clasificar cada tool como `KEEP`, `INTEGRATE`, `COVERED`, `CONFLICT`, `MISSING` o `UNKNOWN`.
- Explicar razon y consejo practico por tool.
- No modificar configuraciones en esta historia.

## Acceptance

- Detecta BMAD, CodeGraph, Caveman y Ponytail como Breakdown Stack obligatorio.
- Reporta piezas faltantes como problemas del setup.
- Detecta conflictos tipo ESLint/Biome/Prettier y recomienda ownership.
- Explica cuando Downstroke cubre una necesidad y cuando no.
- Recomienda tools faltantes solo si agregan valor real al proyecto.
- La salida es clara, corta y accionable.
