# Story 014: Downstroke Method And Breakdown Stack

## Goal

Como autor de Downstroke, quiero formalizar el Downstroke Method y su Breakdown Stack obligatorio para que CodeGraph, Caveman, Ponytail y BMAD no se traten como herramientas opcionales.

## Tasks

- Documentar `Downstroke Method` como nombre del metodo.
- Documentar `Breakdown Stack` como CodeGraph + Caveman + Ponytail + BMAD.
- Actualizar `downstroke doctor` para validar las cuatro piezas.
- Actualizar presets para incluir Breakdown Stack por default.
- Definir reglas para reemplazos Downstroke-native futuros.
- Crear reporte cuando una pieza falte o este diferida.

## Acceptance

- `downstroke doctor --breakdown-stack` reporta estado de las cuatro piezas.
- Ningun preset principal omite Breakdown Stack.
- La documentacion explica el rol de cada pieza.
- Reemplazar una pieza requiere evidencia de uso real y alternativa validada.
- El framework no presenta BMAD/CodeGraph/Caveman/Ponytail como opcionales.
