# Story 013: Timeline And Token Estimator

## Goal

Como developer, quiero estimar tiempo y consumo aproximado de tokens por historias BMAD para planificar mejor y dividir trabajo antes de que se vuelva inmanejable.

## Tasks

- Crear comando `downstroke estimate`.
- Leer historias desde `_bmad-output/story-*.md`.
- Calcular effort score usando riesgo, incertidumbre, integraciones, UI, datos y tests.
- Estimar tiempo humano como rango.
- Estimar tokens como rango aproximado.
- Recomendar split cuando una historia es grande.
- Generar timeline con discovery, implementacion, QA, revision y buffer.

## Acceptance

- El reporte evita numeros falsamente exactos.
- El estimado cambia segun review cadence y capacidad real.
- Historias grandes se marcan para dividir.
- El output sirve para sprint planning.
- El reporte explica los supuestos usados.
