# Story 1.1: Preservar baseline e importar fuentes

Estado: `review`

## Valor Y Riesgo

- Valor: 5/5
- Riesgo: 2/5
- Esfuerzo: 2/5
- Incertidumbre: 1/5
- Dependencias: 1/5

## Alcance

- Copiar el baseline actual a `examples/legacy-boilerplate/` sin incluir `.git`, índices ni artefactos de ejecución.
- Copiar la guía suministrada a `docs/downstroke/source-guides/` sin reescribirla.
- Documentar qué material es fuente histórica y qué archivos gobiernan el framework activo.

## Aceptación

- El baseline contiene `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/`, `scripts/`, `skills/` y `AGENTS.zip` cuando existe.
- La guía fuente queda completa dentro del repositorio.
- Ningún archivo fuente original es eliminado o modificado por la copia.
- Git puede mostrar claramente los archivos añadidos.

## Evidencia

- Baseline copiado a `examples/legacy-boilerplate/`.
- Guía versionada en `docs/downstroke/source-guides/`.
- Referencias de workspace neutralizadas según regla de naming del proyecto.
