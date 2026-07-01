# Story 012: Version Compatibility Doctor

## Goal

Como developer, quiero que Downstroke revise versiones, peer deps y conflictos antes de instalar o actualizar para no gastar tiempo arreglando bugs evitables.

## Tasks

- Crear comando `downstroke versions`.
- Detectar package manager y usar sus comandos de outdated/audit.
- Revisar Node, package manager, lockfile y engines.
- Revisar peer dependencies.
- Clasificar updates en patch, minor, major, security, framework-coupled y unknown.
- Crear plan con checks y rollback antes de upgrades riesgosos.
- Guardar reporte en `.downstroke/reports/versions-YYYY-MM-DD.md`.

## Acceptance

- React y React DOM incompatibles generan error claro.
- Major upgrades crean historia BMAD en lugar de aplicarse directo.
- Security fixes se separan de migraciones grandes.
- El reporte cita fuente oficial cuando recomienda cambio importante.
- El comando puede ejecutarse sin modificar archivos.
