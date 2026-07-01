# Story 016: Living Rules And Token Economy

## Goal

Como developer, quiero que Downstroke detecte preferencias repetidas y pregunte si deben convertirse en reglas para ahorrar tokens y mejorar consistencia entre proyectos.

## Tasks

- Crear detector de repeticion de preferencias.
- Proponer reglas personales, de proyecto, de stack o decisiones ADR.
- Pedir confirmacion antes de guardar cualquier regla.
- Guardar reglas en `.downstroke/memory` o `.downstroke/rules`.
- Incluir reglas aprobadas en `AGENTS.md` mediante managed blocks.
- Crear prompts para que el LLM activo compare herramientas cuando haga falta.
- Documentar integraciones Claude, Codex, Gemini, MMX, MCP, CodeGraph, Caveman y BMAD.

## Acceptance

- Ninguna regla se guarda sin confirmacion.
- Las reglas reducen repeticion en sesiones futuras.
- Downstroke separa memoria personal de reglas del proyecto.
- El framework define prompts y gates, no busquedas directas como responsabilidad core.
- Las integraciones IA/MCP quedan documentadas como parte del metodo.
