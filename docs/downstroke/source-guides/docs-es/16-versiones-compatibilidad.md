# Versiones, Compatibilidad Y Upgrades

Downstroke debe ahorrar tiempo evitando upgrades impulsivos y bugs de compatibilidad. La meta no es estar siempre en lo mas nuevo por ansiedad. La meta es saber cuando conviene actualizar, cuando esperar y cuando separar una migracion en pasos.

## Fuentes De Verdad

Downstroke debe revisar fuentes oficiales antes de recomendar cambios:

| Area | Fuente |
| --- | --- |
| React | `react.dev/versions` y changelog oficial. |
| npm | Docs de `npm outdated`, `npm update`, `npm audit`. |
| Package manager usado | Docs oficiales de pnpm, npm, yarn o bun. |
| Framework | Docs oficiales de Next, Vite, Expo, Remix, Astro, Nest, etc. |
| Seguridad | Audit del package manager y advisories relevantes. |

## Comandos

```bash
downstroke versions
downstroke versions --plan
downstroke versions --security
downstroke versions --compat
downstroke versions --apply-safe
```

## Revision Que Debe Hacer

| Revision | Detalle |
| --- | --- |
| Package manager | Detectar `npm`, `pnpm`, `yarn` o `bun` por lockfile. |
| Node | Revisar `engines`, `.nvmrc`, `.node-version` y version local. |
| React pair | `react` y `react-dom` deben estar alineados. |
| Peer deps | Detectar warnings de peer dependencies. |
| Framework coupling | Next/Expo/React Native pueden controlar version React soportada. |
| TS/lint/test | Revisar si upgrades rompen toolchain. |
| Seguridad | Separar fixes seguros de cambios mayores. |

## Clasificacion De Upgrades

| Tipo | Accion |
| --- | --- |
| Patch seguro | Sugerir aplicar con tests. |
| Minor compatible | Crear plan corto y correr checks. |
| Major | Crear historia BMAD de migracion. |
| Security critical | Priorizar, pero validar impacto. |
| Framework-coupled | Revisar guia oficial del framework antes. |
| Unknown | No aplicar; investigar primero. |

## Salida Esperada

```txt
downstroke versions --plan

SAFE PATCH
  zod 3.25.1 -> 3.25.3

MINOR WITH CHECKS
  react 19.1.x -> 19.2.x
  Needs: react-dom aligned, framework support, test run

MAJOR MIGRATION
  next 15 -> 16
  Needs: migration guide, compatibility matrix, BMAD story

SECURITY
  package-x vulnerable
  Suggested: update transitive override, run tests
```

## Compatibilidad Primero

Antes de instalar o actualizar:

1. Confirmar version soportada por framework.
2. Confirmar peer dependencies.
3. Confirmar Node version.
4. Confirmar package manager y lockfile.
5. Revisar changelog/migration guide si es minor grande o major.
6. Correr typecheck, lint, tests y build.
7. Guardar reporte en `.downstroke/reports/versions-YYYY-MM-DD.md`.

## Criterios De Aceptacion

- [ ] Downstroke detecta package manager por lockfile.
- [ ] No recomienda major upgrades como fix rapido.
- [ ] Distingue security fix de migration work.
- [ ] Avisa cuando React y React DOM no coinciden.
- [ ] Consulta documentacion oficial para nuevas versiones.
- [ ] Produce un plan de upgrade con checks y rollback.
