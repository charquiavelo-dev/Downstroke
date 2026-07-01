# Compatibilidad Cross-Stack Y Analisis Preproyecto

Downstroke debe funcionar con proyectos modernos de Node.js, React, TypeScript, React Native, Tailwind, NativeWind, .NET, Blazor y bases PostgreSQL. No debe asumir que todo proyecto es Next.js.

## Stacks Compatibles

| Stack | Compatibilidad Downstroke | Uso recomendado |
| --- | --- | --- |
| React + TypeScript | Alta | Dashboards, apps web, herramientas internas, frontends complejos. |
| Tailwind | Alta | UI rapida, sistemas visuales consistentes, prototipos serios. |
| React Native + NativeWind | Alta | Apps mobile con UI consistente entre web/mobile cuando aplica. |
| Node.js + Express | Alta | APIs simples, servicios pequenos, prototipos o backends ligeros. |
| Node.js + NestJS | Alta | Dominios complejos, arquitectura modular, DI, equipos medianos/grandes. |
| .NET | Alta | APIs, servicios robustos, ecosistemas enterprise, integracion con C#. |
| Blazor | Alta | Frontend/fullstack .NET, dashboards internos, equipos C# fuertes. |
| PostgreSQL | Alta | Base relacional principal para productos serios y escalables. |

## Analisis Preproyecto

Antes de proponer stack, Downstroke debe correr:

```bash
downstroke preflight
downstroke preflight --interactive
```

Preguntas minimas:

| Pregunta | Para que sirve |
| --- | --- |
| Que tipo de producto es? | Web, mobile, API, dashboard, fullstack, herramienta interna. |
| Que tan complejo es el dominio? | Decide Express vs NestJS, simple UI vs arquitectura modular. |
| Quien lo mantiene? | Solo dev senior, equipo pequeno, equipo enterprise. |
| Hay stack existente? | Evita migraciones innecesarias. |
| Requiere mobile? | Decide React Native/NativeWind o web responsive. |
| Requiere .NET/Blazor? | Respeta contexto C# y backend enterprise. |
| Que datos maneja? | Decide PostgreSQL, migraciones, ORM, backups, auditoria. |
| Que tan critico es QA? | Define gates, e2e, typecheck, CI, manual QA. |
| Hay IA/MCP/RAG/agentes? | Activa reglas de AI safety, MCP y docs de contexto. |

## Decision Express Vs NestJS

| Criterio | Express | NestJS |
| --- | --- | --- |
| API pequena | Si | Puede ser demasiado |
| Prototipo rapido | Si | Solo si ya hay base Nest |
| Dominio complejo | No ideal | Si |
| DI/modulos | Manual | Nativo |
| Equipo grande | Puede desordenarse | Mejor estructura |
| Microservicios/eventos | Manual | Mejor base |
| Testing estructurado | Manual | Mejor convencion |

Regla: Express para simplicidad real. NestJS para complejidad real. No usar Nest por moda ni Express por pereza.

## Decision .NET / Blazor

| Criterio | .NET API | Blazor |
| --- | --- | --- |
| Backend robusto C# | Si | No necesariamente |
| Equipo fuerte en C# | Si | Si |
| Dashboard interno | Si | Si |
| SPA React requerida | API .NET + React | No |
| Integracion enterprise | Si | Si |
| UI muy custom/animada | API .NET + React puede ser mejor | Depende |

Regla: Downstroke no debe tratar .NET como ciudadano de segunda. Si el proyecto ya vive en C#, debe apoyar esa decision con specs, gates, estructura y doctor checks.

## Decision PostgreSQL

PostgreSQL debe ser la recomendacion default para datos relacionales serios cuando no hay una razon fuerte para otra base.

| Necesidad | Recomendacion |
| --- | --- |
| Producto SaaS | PostgreSQL |
| Dashboard con datos relacionales | PostgreSQL |
| API con auditoria | PostgreSQL |
| Prototipo local pequeno | SQLite puede servir |
| Busqueda full-text simple | PostgreSQL puede cubrir primero |
| Vector/RAG | Vector store o extension segun necesidad, DB sigue siendo autoridad |

## Salida Del Preflight

```txt
Downstroke Preflight

Product       Dashboard fullstack
Frontend      React + TypeScript + Tailwind
Backend       NestJS
Database      PostgreSQL
Mobile        Not now
Hooks         Lefthook
Lint/format   Biome
Method        Downstroke Method
Core stack    Breakdown Stack
AI context    AGENTS + SPEC + CodeGraph + Caveman + Ponytail
Planning      BMAD blocks of 5 stories

Why:
- Domain has roles, auth, reports and workflows.
- NestJS gives structure that Express would need manually.
- PostgreSQL fits relational data and future reporting.
- Biome/Lefthook keep dev workflow fast and light.
```

## Criterios De Aceptacion

- [ ] Downstroke no asume Next.js por default.
- [ ] Preflight compara React, React Native, Node, .NET, Blazor y DB segun contexto.
- [ ] Express/NestJS se decide por complejidad real.
- [ ] PostgreSQL aparece como default relacional fuerte.
- [ ] Biome y Lefthook son defaults de calidad/dev workflow.
- [ ] La recomendacion explica por que y que tradeoffs acepta.
