# Story 015: Cross-Stack Preflight

## Goal

Como developer, quiero que Downstroke analice el proyecto antes de elegir herramientas para decidir entre React, React Native, .NET, Blazor, Express, NestJS, PostgreSQL y presets relacionados.

## Tasks

- Crear comando `downstroke preflight`.
- Detectar si el repo es Node, React, React Native, NativeWind, .NET, Blazor o mixto.
- Preguntar complejidad del dominio, equipo, mobile, datos, QA e IA/MCP.
- Recomendar Express o NestJS segun complejidad real.
- Recomendar .NET/Blazor cuando el contexto C# lo justifique.
- Recomendar PostgreSQL como default relacional fuerte salvo excepcion real.
- Recomendar Biome y Lefthook como defaults.
- Generar reporte con decision y tradeoffs.

## Acceptance

- Downstroke no asume Next.js por default.
- Preflight produce recomendacion con razones.
- Express/NestJS se decide por complejidad real.
- .NET y Blazor aparecen como first-class compatible stacks.
- PostgreSQL aparece como default relacional cuando aplica.
- El reporte puede alimentar BMAD backlog y SPEC.
