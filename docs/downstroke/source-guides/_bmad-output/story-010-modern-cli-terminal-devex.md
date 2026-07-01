# Story 010: Modern CLI Terminal DevEx

## Goal

Como developer, quiero un CLI facil, bonito y moderno para usar Downstroke sin sentir que estoy peleando con scripts improvisados.

## Tasks

- Definir estilo de terminal: estados, tablas, progreso, colores accesibles.
- Implementar comandos base: `init`, `add`, `doctor`, `tools doctor`, `bmad backlog`, `bmad sprint`, `versions`, `bugs`, `timeline`, `tokens`.
- Agregar modo seguro por default.
- Agregar `--dry-run`, `--json` y `--verbose`.
- Mostrar siempre siguiente paso recomendado.
- Evitar sobrescribir archivos sin `--force`.

## Acceptance

- El CLI se entiende en menos de un minuto.
- Cada comando tiene ayuda clara.
- Los errores muestran causa probable y siguiente paso.
- `--dry-run` muestra cambios sin escribir.
- La salida sirve tanto para humanos como para CI usando `--json`.
