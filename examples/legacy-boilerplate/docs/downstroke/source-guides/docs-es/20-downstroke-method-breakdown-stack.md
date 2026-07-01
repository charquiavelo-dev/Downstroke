# Downstroke Method Y Breakdown Stack

Downstroke no es solo un framework de archivos, CLI y presets. Tambien es un metodo de desarrollo asistido por IA.

Nombre recomendado:

```txt
Downstroke Method
```

Implementacion obligatoria actual:

```txt
Breakdown Stack = CodeGraph + Caveman + Ponytail + BMAD
```

El nombre Breakdown Stack funciona porque en desarrollo tambien hay que romper problemas grandes en partes ejecutables, con ritmo, fuerza y control.

## Por Que Es Un Metodo

Si solo fueran herramientas sueltas, cada proyecto terminaria con rituales distintos. Downstroke Method define:

- como se entiende el repo;
- como se comprime contexto;
- como se evita sobrearquitectura;
- como se planea y ejecuta trabajo;
- como se revisan riesgos;
- como se convierten preferencias repetidas en reglas;
- como se gasta menos token en ruido y mas en decisiones importantes.

## Breakdown Stack

| Pieza | Rol obligatorio | Que aporta |
| --- | --- | --- |
| CodeGraph | Mapa estructural | Entender archivos, simbolos, dependencias e impacto sin releer todo. |
| Caveman | Compresion de contexto | Handoffs mas cortos, instrucciones mas densas, menos desperdicio de tokens. |
| Ponytail | Simplicidad senior | Evitar abstracciones prematuras, ceremonia innecesaria y arquitectura inflada. |
| BMAD | Planning y delivery | Briefs, backlog, historias, tasks, sprint planning, QA y ejecucion guiada. |

## Regla Mandatoria

Todo proyecto Downstroke debe tener estas cuatro piezas como parte del flujo:

```txt
CodeGraph para entender.
Caveman para comprimir.
Ponytail para simplificar.
BMAD para planear y ejecutar.
```

Si una pieza no esta instalada todavia, `downstroke doctor` debe marcarlo como `FAIL` o `WARN` segun el modo del proyecto.

## Evolucion Futura

Downstroke puede crear herramientas propias que suplanten parte del Breakdown Stack, pero solo cuando el uso real demuestre que vale la pena.

| Hoy | Futuro posible | Condicion para reemplazar |
| --- | --- | --- |
| CodeGraph | `@downstroke/graph` | Debe igualar o superar analisis estructural e impacto. |
| Caveman | `@downstroke/context` | Debe comprimir mejor handoffs y specs sin perder claridad. |
| Ponytail | `@downstroke/simplicity` | Debe detectar bloat y abstraccion prematura con reglas utiles. |
| BMAD | `@downstroke/planning` | Debe cubrir backlog, historias, sprint y QA con menos friccion. |

Regla: no reemplazar por ego. Reemplazar solo si Downstroke-native reduce friccion real y mantiene o mejora calidad.

## Presets

| Preset | Incluye Breakdown Stack |
| --- | --- |
| `lite` | Si, en modo minimo |
| `frontend-react` | Si |
| `mobile-react-native` | Si |
| `dotnet-blazor` | Si |
| `fullstack-ai` | Si, completo |

## Doctor Checks

`downstroke doctor` debe validar:

- CodeGraph configurado o alternativa aprobada.
- Caveman disponible como skill/regla/context pack.
- Ponytail documentado como regla de simplicidad.
- BMAD disponible para backlog, stories y sprint planning.
- Las cuatro piezas aparecen en `AGENTS.md` o en reglas gestionadas.

## Criterios De Aceptacion

- [ ] La documentacion usa `Downstroke Method` para el metodo.
- [ ] La documentacion usa `Breakdown Stack` para CodeGraph + Caveman + Ponytail + BMAD.
- [ ] El CLI trata esas piezas como mandatorias.
- [ ] Las piezas pueden ser reemplazadas solo por alternativas Downstroke-native validadas.
- [ ] El reemplazo requiere evidencia de uso real, no preferencia estetica.
