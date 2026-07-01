# Project Foundation MD

Downstroke debe permitir que el cliente o developer describa una pequena parte de lo que quiere construir. Con eso, el framework genera un documento inicial dentro del software, no en la raiz, para establecer filosofia, intencion, primeros pasos y como profundizar.

Ubicacion recomendada:

```txt
docs/downstroke/PROJECT_FOUNDATION.md
```

No debe crearse como archivo suelto en la raiz.

## Comando

```bash
downstroke project foundation
downstroke project foundation --interactive
downstroke project foundation --from "Quiero crear un dashboard para..."
```

## Preguntas Iniciales

Downstroke debe pedir poco al inicio:

| Pregunta | Motivo |
| --- | --- |
| Que queres construir? | Captura la idea base. |
| Para quien es? | Define usuario y prioridad. |
| Que problema resuelve? | Evita construir features sin norte. |
| Que stack preferis o ya existe? | Respeta decisiones reales. |
| Que tan rapido queres moverte? | Ajusta nivel de BMAD, QA y preflight. |

## Contenido Del MD

`PROJECT_FOUNDATION.md` debe incluir:

1. Idea inicial.
2. Filosofia del proyecto.
3. Usuario objetivo.
4. Problema principal.
5. Alcance inicial.
6. Lo que no se va a hacer todavia.
7. Stack detectado o recomendado.
8. Breakdown Stack activo.
9. Primeros pasos de desarrollo.
10. Como profundizar despues.
11. Riesgos iniciales.
12. Decisiones pendientes.

## Template

```md
# Project Foundation

## Idea Inicial

{short_project_description}

## Filosofia Del Proyecto

Este proyecto debe construirse con foco en velocidad real, claridad, mantenibilidad y decisiones tecnicas justificadas.

## Usuario Objetivo

{target_user}

## Problema Que Resuelve

{problem}

## Alcance Inicial

{initial_scope}

## Fuera De Alcance Por Ahora

{not_now}

## Stack Inicial

{stack_recommendation}

## Downstroke Method

Este proyecto usa Downstroke Method con Breakdown Stack:

- CodeGraph para entender estructura e impacto.
- Caveman para comprimir contexto.
- Ponytail para mantener simplicidad senior.
- BMAD para backlog, historias, planning y QA.

## Primeros Pasos

1. Ejecutar `downstroke preflight`.
2. Crear SPEC inicial.
3. Crear backlog BMAD ligero.
4. Validar dependencias con LLM activo.
5. Definir primer sprint o bloque de tasks.

## Como Profundizar

Cuando la idea este clara, profundizar en:

- arquitectura;
- datos;
- flujos de usuario;
- riesgos tecnicos;
- QA;
- timelines;
- estimacion de tokens;
- integraciones IA/MCP.

## Riesgos Iniciales

{initial_risks}

## Decisiones Pendientes

{pending_decisions}
```

## Caracter Del Framework

Downstroke debe sentirse como una herramienta bien empaquetada para developers reales:

- rapido sin ser irresponsable;
- fuerte sin ser pesado;
- documentado sin ser burocratico;
- opinionado donde ahorra tiempo;
- flexible donde el proyecto necesita criterio;
- compatible con juniors, pero valioso para seniors;
- construido sobre bases robustas, verificables y mantenibles.

## Para Seniors Y Juniors

| Developer | Valor |
| --- | --- |
| Senior | Acelera decisiones repetitivas, reduce ruido, formaliza criterio y evita perder tiempo en setup. |
| Mid | Da estructura, comparativas y gates sin imponer ceremonia excesiva. |
| Junior | Guia pasos, explica tradeoffs y evita malas decisiones comunes sin esconder el razonamiento. |

## Criterios De Aceptacion

- [ ] El MD se crea dentro de `docs/downstroke/`.
- [ ] El MD no se crea en la raiz del repo.
- [ ] El usuario puede dar una descripcion corta.
- [ ] El LLM activo puede ayudar a generar filosofia y primeros pasos.
- [ ] El documento explica que esperar en el desarrollo inicial.
- [ ] El documento indica como profundizar despues.
- [ ] El tono comunica una herramienta robusta para developers reales.
