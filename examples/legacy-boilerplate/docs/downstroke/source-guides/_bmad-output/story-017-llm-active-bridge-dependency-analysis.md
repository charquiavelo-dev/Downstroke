# Story 017: LLM Active Bridge And Dependency Analysis

## Goal

Como developer, quiero que Downstroke interactue con el LLM activo para analizar dependencias, conflictos y decisiones tecnicas sin depender de un proveedor unico.

## Tasks

- Crear contrato `LLMActiveBridge`.
- Soportar modos: adapter directo, MCP, prompt handoff y report import.
- Crear comando `downstroke llm doctor`.
- Crear comando `downstroke deps analyze`.
- Leer dependencias desde `package.json`, lockfiles, `.csproj`, `Directory.Packages.props` y configs relevantes.
- Generar prompts de comparativa para dependencias y excepciones.
- Guardar decisiones como reporte o ADR.

## Acceptance

- El CLI no depende de un solo LLM.
- Si no hay adapter directo, genera prompt handoff.
- Todas las dependencias pueden entrar al analisis cuando hay riesgo.
- ESLint sobre Biome requiere decision `EXCEPTION` documentada.
- Husky sobre Lefthook requiere decision documentada.
- Major upgrades pueden crear BMAD story.
