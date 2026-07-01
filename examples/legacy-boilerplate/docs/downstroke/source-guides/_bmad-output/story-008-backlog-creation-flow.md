# Story 008: Backlog Creation Flow

## Goal

Como developer, quiero convertir ideas sueltas en backlog ordenado para saber que construir primero y que dejar quieto.

## Tasks

- Crear comando `downstroke bmad backlog`.
- Capturar ideas como texto libre, archivo o prompt interactivo.
- Normalizar cada idea en problema, usuario, valor, riesgo y dependencia.
- Detectar duplicados o ideas demasiado parecidas.
- Agrupar en epicas por dominio.
- Convertir epicas en historias con criterios de aceptacion.
- Aplicar review cadence definida por Story 007.

## Acceptance

- Cada backlog item tiene valor, riesgo, esfuerzo, incertidumbre y dependencias.
- Las ideas duplicadas se marcan antes de crear historias repetidas.
- Historias grandes reciben recomendacion de split.
- El backlog puede revisarse por item, bloque o sprint.
- El resultado queda en `_bmad-output/backlog.md` o `.downstroke/backlog.json`.
