# Timelines Y Proyeccion De Tokens

Downstroke debe ayudar a estimar tiempo real y consumo aproximado de contexto/tokens antes de empezar. Esto no es una promesa matematica perfecta. Es una senal para planificar mejor, evitar trabajo invisible y decidir si conviene dividir historias.

## Comandos

```bash
downstroke timeline
downstroke timeline --from _bmad-output
downstroke tokens
downstroke estimate --sprint
```

## Inputs

| Input | Fuente |
| --- | --- |
| Historias BMAD | `_bmad-output/story-*.md` |
| Specs | `docs/`, `specs/`, `.downstroke/specs/` |
| CodeGraph | Mapa de archivos y dependencias si existe. |
| Riesgo | Valor de cada historia. |
| Incertidumbre | Cuanto falta investigar. |
| Tests requeridos | Unit, integration, e2e, visual, manual. |
| Review cadence | Una a una, bloques, sprint. |

## Modelo De Estimacion

Scoring inicial:

```txt
effortScore =
  base +
  riesgoTecnico +
  incertidumbre +
  integraciones +
  cambiosUI +
  cambiosDatos +
  pesoTests
```

Rangos sugeridos:

| Tipo | Effort score | Tiempo humano | Tokens aproximados |
| --- | ---: | ---: | ---: |
| Trivial | 1-3 | 15-45 min | 5k-15k |
| Pequena | 4-7 | 1-3 h | 15k-40k |
| Media | 8-13 | 0.5-1.5 dias | 40k-100k |
| Grande | 14-21 | 2-5 dias | 100k-250k |
| Epica | 22+ | Dividir | 250k+ |

Los tokens suben cuando hay que leer mucha documentacion, revisar muchas herramientas, hacer debugging amplio o tocar varios dominios.

## Timeline Real

Una linea de tiempo debe separar:

| Bloque | Que mide |
| --- | --- |
| Descubrimiento | Lectura de docs, repo, decisiones existentes. |
| Implementacion | Codigo y configuracion. |
| QA | Typecheck, lint, tests, build, pruebas manuales. |
| Revision humana | Pausas por historia, bloque o sprint. |
| Buffer | Riesgo tecnico, dependencias y cambios de criterio. |

Ejemplo:

```txt
Sprint 1: Downstroke CLI MVP

Dia 1
  - Init CLI
  - Preset lite
  - No overwrite mode

Dia 2
  - Doctor base
  - Tool detector
  - Reporte terminal

Dia 3
  - BMAD backlog flow
  - Review cadence

Dia 4
  - Version doctor
  - React compatibility checks

Dia 5
  - Fixture tests
  - Docs
  - Release dry run
```

## Cuando Dividir Una Historia

Downstroke debe sugerir dividir si:

- Effort score es mayor a 13.
- Toca mas de tres dominios.
- Requiere upgrade de framework.
- Tiene incertidumbre alta.
- Necesita diseno de arquitectura antes de codigo.
- La proyeccion de tokens supera el rango razonable de una sesion.

## Criterios De Aceptacion

- [ ] El CLI estima tiempo y tokens desde historias BMAD.
- [ ] El estimado muestra rango, no numero falso exacto.
- [ ] El timeline separa discovery, implementacion, QA y review.
- [ ] Las historias grandes se recomiendan dividir.
- [ ] El usuario puede ajustar capacidad real y cadencia de revision.
- [ ] El reporte ayuda a planear, no a vender humo.
