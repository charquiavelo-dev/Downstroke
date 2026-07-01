# Story 007: BMAD Human Review Cadence

## Goal

Como developer usando Downstroke, quiero elegir cada cuanto revisar historias y tasks para que el planning se sienta humano, controlado y no como una fabrica de tickets.

## Tasks

- Crear comando `downstroke bmad plan`.
- Preguntar modo de revision: `una-a-una`, `bloques`, `por-sprint`, `solo-al-final`.
- Si elige bloques, preguntar tamano del bloque.
- Si elige sprint, preguntar duracion, capacidad real y WIP.
- Guardar preferencias en `.downstroke/planning.json`.
- Aplicar la cadencia al generar historias y tasks.

## Acceptance

- El CLI no genera backlog grande sin preguntar cadencia.
- El usuario puede cambiar cadencia sin perder trabajo anterior.
- La salida muestra que se revisa ahora y que queda pendiente.
- El modo elegido se respeta al crear historias nuevas.
- La configuracion queda versionable y legible.
