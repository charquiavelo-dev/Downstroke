# Downstroke Executive Summary

## Decision

El framework se llamara **Downstroke**.

## Positioning

Downstroke es un **AI delivery framework**: una capa modular para iniciar, gobernar, verificar y evolucionar proyectos asistidos por IA.

No es:

- Otro runtime de agentes.
- Otro LangChain.
- Otro boilerplate copiado a mano.
- Una coleccion de prompts sueltos.

Si es:

- Un sistema modular de reglas, templates, gates, skills, docs y presets.
- Un puente entre herramientas como BMAD, CodeGraph, Caveman y Ponytail.
- Una forma de convertir experiencia real de proyectos en paquetes instalables.
- Una manera de impedir que la IA genere proyectos bonitos pero fragiles.

## Method

El metodo se llama **Downstroke Method**.

El stack obligatorio actual se llama **Breakdown Stack**:

```txt
CodeGraph + Caveman + Ponytail + BMAD
```

Estas piezas no son opcionales al inicio. Son el stack operativo que hace que Downstroke funcione:

- CodeGraph entiende estructura e impacto.
- Caveman comprime contexto y handoffs.
- Ponytail impone simplicidad senior.
- BMAD ordena planning, backlog, historias, tasks y QA.

## Core Promise

```txt
Install only the discipline your project needs.
```

En espanol:

```txt
Instala solo la disciplina que tu proyecto ocupa.
```

## Why Downstroke

Un downstroke en metal y thrash es repeticion controlada, fuerza, precision y resistencia. No es improvisacion floja. Es ritmo con disciplina.

Eso calza con el objetivo:

- SPEC antes de implementar.
- Reglas antes de escalar.
- Gates antes de decir terminado.
- Modulos pequenos antes de un mega-framework.
- Verificacion antes de confianza.

## Product Shape

Downstroke debe organizarse como modulos instalables e independientes:

```txt
@downstroke/core
@downstroke/spec
@downstroke/agents
@downstroke/codegraph
@downstroke/caveman
@downstroke/ponytail
@downstroke/bmad
@downstroke/gates
@downstroke/production
@downstroke/rag-rules
@downstroke/mcp-rules
@downstroke/presets
```

Y una CLI:

```bash
downstroke init
downstroke add spec
downstroke add agents
downstroke doctor
downstroke migrate
```

## First MVP

No construir todo de una vez. El MVP debe probar el valor con la menor superficie:

1. `@downstroke/core`
2. `@downstroke/spec`
3. `@downstroke/agents`
4. `@downstroke/codegraph`
5. `@downstroke/caveman`
6. `@downstroke/ponytail`
7. `@downstroke/bmad`
8. `@downstroke/gates`
9. `@downstroke/presets`
10. CLI con `init`, `add`, `doctor`

## Success Criteria

Downstroke v0.1 funciona si:

- Puede instalar un preset `lite` en un repo vacio.
- Puede agregar un modulo a un repo existente sin pisar cambios.
- Puede detectar salud del proyecto con `downstroke doctor`.
- Puede generar `docs/SPEC.md`, `AGENTS.md` y un gate de QA.
- Puede conservar el boilerplate actual como ejemplo legacy.
- Puede actualizar solo bloques gestionados por Downstroke.

## Non Goal

Downstroke no debe reemplazar BMAD, CodeGraph, Caveman ni Ponytail al inicio. Debe integrarlos, documentarlos, instalarlos y verificarlos como Breakdown Stack obligatorio.

Downstroke tampoco debe sesgarse hacia marketing ni narrativas externas al desarrollo. Su primera responsabilidad es mejorar el flujo de desarrollo real: menos friccion, mejores decisiones, menos bugs tontos, mejor uso de herramientas IA y mayor velocidad sin perder criterio.
