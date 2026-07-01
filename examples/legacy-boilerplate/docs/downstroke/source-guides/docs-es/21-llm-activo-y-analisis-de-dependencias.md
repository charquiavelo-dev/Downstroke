# LLM Activo Y Analisis De Dependencias

Downstroke debe interactuar con el LLM activo del developer. No debe asumir que siempre sera Claude, Codex, Gemini, MMX u otro especifico. La regla es crear un contrato comun para que el framework pueda pedir analisis, comparativas y decisiones tecnicas al asistente disponible.

## Principio

```txt
Downstroke define reglas, prompts, formatos de evidencia y gates.
El LLM activo ejecuta el razonamiento con el contexto disponible.
```

Esto permite que Downstroke sea compatible con los principales LLMs y con futuros modelos sin amarrarse a uno solo.

## LLM Active Bridge

Comandos propuestos:

```bash
downstroke llm doctor
downstroke llm ask
downstroke llm compare
downstroke deps analyze
downstroke deps explain
```

## Modos De Integracion

| Modo | Uso | Ejemplo |
| --- | --- | --- |
| Adapter directo | Cuando existe SDK/CLI/API disponible | Claude, Codex, Gemini, MMX |
| MCP | Cuando el LLM trabaja con herramientas conectadas | Contexto, archivos, docs, DB, repos |
| Prompt handoff | Cuando no hay integracion directa | Downstroke genera prompt listo para pegar |
| Report import | Cuando el LLM responde fuera del CLI | Downstroke importa el MD/JSON resultante |

Regla: si no hay adapter directo, Downstroke no se bloquea. Genera un prompt estructurado para que el developer lo use con el LLM que tenga.

## Analisis De Dependencias

Todas las dependencias pueden entrar al analisis con LLM activo cuando el CLI o el framework detecten riesgo, conflicto, exceso o cambio importante.

Fuentes:

- `package.json`
- lockfiles
- `.csproj`
- `Directory.Packages.props`
- `global.json`
- `requirements.txt` si existiera en proyectos mixtos
- configs de framework
- errores de build/typecheck/test
- reportes de `downstroke doctor`

## Casos Que Deben Disparar Analisis

| Caso | Accion |
| --- | --- |
| Nueva dependencia grande | Preguntar si realmente se necesita. |
| Dependencias duplicadas | Pedir comparativa y sugerir una. |
| ESLint detectado | Justificar excepcion contra Biome. |
| Husky detectado | Justificar mantenerlo contra Lefthook. |
| NestJS vs Express | Comparar contra complejidad real del proyecto. |
| .NET/Blazor vs Node/React | Comparar contra equipo, dominio y mantenimiento. |
| PostgreSQL vs otra DB | Validar datos, escala, queries y operacion. |
| Major upgrade | Crear historia BMAD y plan de migracion. |
| Peer dependency conflict | Pedir explicacion de causa raiz. |

## Prompt De Comparativa

```txt
Actua como reviewer tecnico senior dentro del Downstroke Method.

Contexto:
- Proyecto: {project_summary}
- Stack detectado: {detected_stack}
- Dependencias relevantes: {dependencies}
- Error/conflicto/riesgo: {issue}
- Regla Downstroke aplicable: {rule}

Compara opciones usando:
1. valor real para este proyecto;
2. complejidad agregada;
3. compatibilidad;
4. costo de mantenimiento;
5. impacto en performance/dev workflow;
6. riesgo futuro;
7. alternativa mas simple.

Devuelve:
- decision: KEEP / REMOVE / REPLACE / EXCEPTION / INVESTIGATE
- evidencia;
- tradeoffs;
- siguiente paso;
- si requiere BMAD story.
```

## Formato De Respuesta

```json
{
  "decision": "EXCEPTION",
  "subject": "ESLint",
  "defaultRule": "Biome-first",
  "reason": "El proyecto usa una regla de accesibilidad no cubierta por Biome.",
  "cost": "Config extra y mas tiempo en CI.",
  "ownership": "Biome formatea y hace lint base. ESLint solo ejecuta reglas a11y.",
  "nextStep": "Crear config minima y revisar en 30 dias.",
  "requiresBmadStory": true
}
```

## Criterios De Aceptacion

- [ ] Downstroke puede trabajar con adapter directo, MCP, prompt handoff o report import.
- [ ] El CLI no depende de un solo LLM.
- [ ] Todas las dependencias pueden entrar al analisis cuando hay riesgo o conflicto.
- [ ] Las decisiones se guardan como reporte o ADR.
- [ ] ESLint/Husky/NestJS/.NET/DB/deps grandes requieren justificacion real cuando rompen defaults.
- [ ] El analisis puede crear BMAD stories si la decision implica migracion o riesgo alto.
