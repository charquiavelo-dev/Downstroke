# Reglas Vivas, Ahorro De Tokens E Integraciones IA

Downstroke debe ayudar a gastar tokens donde importan: specs, decisiones, docs de desarrollo, analisis de impacto, bugs dificiles y QA. No debe gastar contexto repitiendo instrucciones que pueden convertirse en reglas permanentes.

## Token Economy

Objetivo:

```txt
Menos tokens en repetir preferencias.
Mas tokens en entender el proyecto y tomar mejores decisiones.
```

Downstroke debe:

- Guardar reglas aprobadas por el usuario.
- Detectar patrones repetidos.
- Preguntar antes de convertir una repeticion en regla.
- Separar reglas personales, reglas del proyecto y reglas del stack.
- Usar Caveman o formatos comprimidos para handoffs largos.
- Priorizar docs fuente: SPEC, architecture, decisions, AGENTS, BMAD.
- Usar el LLM activo para analisis de dependencias, comparativas y decisiones con evidencia.

## Regla Viva

Si el framework detecta una preferencia repetida, debe preguntar:

```txt
He visto esta preferencia repetirse varias veces:
"Usar Biome antes que ESLint"

Queres convertirla en regla?
1. Si, global para mis proyectos
2. Si, solo para este proyecto
3. No, solo fue para este caso
4. Preguntame despues
```

## Tipos De Regla

| Tipo | Archivo sugerido | Ejemplo |
| --- | --- | --- |
| Personal | `.downstroke/memory/personal-rules.md` | "Prefiero Biome y Lefthook." |
| Proyecto | `.downstroke/rules/project-rules.md` | "Este repo usa NestJS por dominio complejo." |
| Stack | `.downstroke/rules/stack-react.md` | "React usa feature-based organization." |
| Decision | `.downstroke/decisions/ADR-0001.md` | "Se eligio PostgreSQL por datos relacionales." |
| Agente | `AGENTS.md` managed block | "Antes de editar, leer SPEC y doctor report." |

## No Busquedas Directas Por Downstroke

Downstroke no necesita hacer busquedas web directas como responsabilidad principal. Debe definir reglas, prompts, formatos de evidencia y gates para que el LLM activo investigue cuando haga falta.

Ejemplo:

```txt
Necesitamos decidir si ESLint se justifica sobre Biome en este repo.
Usa el contexto del proyecto y, si tenes herramienta de busqueda/documentacion disponible, compara:
- cobertura de reglas;
- compatibilidad con React hooks/a11y/framework;
- costo en config;
- performance;
- mantenimiento;
- riesgo de conflicto.

Devuelve decision KEEP/REMOVE/EXCEPTION con evidencia.
```

## Integraciones IA Y MCP

Downstroke debe ayudar a integrar:

| Integracion | Uso |
| --- | --- |
| Claude/Codex/Gemini/MMX | Adaptadores de instrucciones, prompts, reglas de repo y analisis tecnico. |
| MCP | Reglas de herramientas, permisos, lectura/escritura, safety y auditoria. |
| Gemini chats | Handoffs, investigacion comparativa, brainstorming tecnico. |
| CodeGraph | Contexto estructural para ahorrar tokens y reducir lectura repetida. |
| Caveman | Compresion de contexto y comunicacion rapida entre sesiones/agentes. |
| Ponytail | Simplicidad senior, anti-bloat y control de abstracciones. |
| BMAD | Planning, backlog, historias, QA y sprint humano. |
| Dependency analysis | Comparativas de dependencias con el LLM activo y decisiones guardadas como reporte/ADR. |
| Project Foundation | MD inicial dentro de `docs/downstroke/` con filosofia, idea, pasos y riesgos. |

## Memory Gate

Ninguna regla repetida se guarda sin confirmacion.

Formato de propuesta:

```txt
Nueva regla sugerida

Regla: Usar PostgreSQL como default relacional salvo razon real para otra DB.
Origen: repetido en 4 proyectos.
Alcance recomendado: personal.
Riesgo: bajo.
Quieres guardarla?
```

## Criterios De Aceptacion

- [ ] Downstroke detecta preferencias repetidas.
- [ ] Pregunta antes de guardar una regla.
- [ ] Separa reglas personales, de proyecto, de stack y decisiones.
- [ ] Usa reglas para ahorrar tokens en futuras sesiones.
- [ ] Define prompts de comparativa para LLMs sin hacer busqueda directa como responsabilidad core.
- [ ] Incluye integraciones para Claude, Codex, Gemini, MMX, MCP, CodeGraph, Caveman, Ponytail y BMAD.
- [ ] Incluye analisis de dependencias con el LLM activo.
- [ ] Incluye Project Foundation como documento inicial dentro de `docs/downstroke/`.
