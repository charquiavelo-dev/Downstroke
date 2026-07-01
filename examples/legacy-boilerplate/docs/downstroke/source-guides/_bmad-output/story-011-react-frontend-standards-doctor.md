# Story 011: React Frontend Standards Doctor

## Goal

Como frontend developer senior, quiero que Downstroke revise practicas React/FE para mantener codigo escalable, legible y performante.

## Tasks

- Crear preset `frontend-react`.
- Validar React y React DOM alineados.
- Detectar version React actual y documentacion relevante antes de recomendar upgrades.
- Revisar `tsconfig` para TypeScript strict.
- Recomendar organizacion feature-based.
- Revisar señales de estado global innecesario.
- Revisar separacion entre server state y client state.
- Recomendar lazy loading para componentes pesados.
- Advertir contra memoizacion excesiva sin evidencia.
- Revisar scripts de typecheck, lint, test y build.

## Acceptance

- El doctor reporta version React y compatibilidad con framework.
- No recomienda React latest si el framework no lo soporta.
- El reporte incluye acciones concretas para arquitectura FE.
- El preset no fuerza Zustand, TanStack Query o Storybook si el proyecto no los necesita.
- La guia del doctor prioriza mantenibilidad, rendimiento y legibilidad.
