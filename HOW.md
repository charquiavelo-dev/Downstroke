# HOW.md — Contexto completo de Downstroke para ChatGPT

Este documento está escrito en español porque su objetivo es servir como contexto directo para otro chat de ChatGPT. El resto de la documentación activa del proyecto se mantiene en inglés por regla del repositorio.

## Resumen corto

Downstroke es un framework nativo para entrega de software asistida por IA. Su propósito es convertir disciplina de ingeniería, planificación, contexto, QA, revisión, seguridad y continuidad de proyecto en capacidades instalables, verificables y versionadas.

La idea central es que un proyecto no dependa de memoria de chat, instrucciones sueltas o herramientas externas permanentes. Downstroke debe poder inicializar o inspeccionar un repositorio, entender su estado, guardar hechos con evidencia, planear trabajo, controlar riesgos, pausar ante contradicciones y reanudar desde estado persistido.

## Estado actual del proyecto

El proyecto está en desarrollo activo, antes de release público en npm. La rama de trabajo es `feature/platform-roadmap`.

Ya existen capacidades funcionales:

- CLI local en `apps/cli`.
- Paquetes npm workspace bajo `packages/*`.
- TypeScript estricto y Node ESM.
- Preset `lite` con instalación copy-if-missing.
- `doctor` para inspección del proyecto.
- `cadence` para configurar modo de revisión.
- `govern` para decisiones determinísticas, contextuales y de alto riesgo.
- `git-policy` para autorización separada de branch, commit y push.
- `estimate` y `status` para estimaciones de tokens.
- `experience` para Operational Experience: hechos, evidencia, importación segura y cuarentena.
- `workflow` para items nativos, checkpoints, decisiones y resume determinístico.

Validación reciente:

- `npm run typecheck`: pasa.
- `npm test`: pasa con 52 tests.
- Build: pasa dentro de `npm test`.
- Native-only scan: pasa.
- `git diff --check`: pasa.

## Propósito del framework

Downstroke existe para resolver un problema práctico: cuando se trabaja con IA en software, se repiten reglas, contexto, planificación, QA y criterios de entrega en cada proyecto. Eso causa pérdida de continuidad, decisiones inconsistentes, exceso de tokens, riesgo de aceptar afirmaciones no verificadas y dificultad para saber qué está probado realmente.

Downstroke intenta convertir esa disciplina en una plataforma local:

- reglas persistidas;
- flujo de trabajo nativo;
- hechos con fuente y evidencia;
- checkpoints;
- revisión proporcional al riesgo;
- importación segura de conocimiento existente;
- diagnósticos que ejecutan checks reales;
- preparación para distribución npm.

## Principios importantes

### 1. Todo capability final debe ser nativo

El usuario confirmó que cualquier feature, skill, agente o capacidad nueva debe terminar como capacidad nativa de Downstroke. Se pueden usar herramientas externas durante desarrollo, investigación o migración, pero no deben quedar como runtime, dependencia pública, plantilla activa ni fallback permanente del producto final.

### 2. Las fuentes históricas son evidencia, no autoridad activa

Documentos importados, artefactos de herramientas previas y archivos legacy se conservan para trazabilidad. No se ejecutan ni se tratan como instrucciones activas.

### 3. Contradicciones semánticas deben pausar

Si dos fuentes activas contradicen comportamiento de producto, seguridad, arquitectura, ownership o alcance, Downstroke debe guardar ambas evidencias, mostrar opciones, consecuencias y dueño de decisión, y pausar. No debe escoger silenciosamente.

### 4. Preview primero, autorización explícita después

Las operaciones mutantes deben mostrar plan o preview cuando sea posible. La mutación se autoriza con `--yes`. Operaciones de alto riesgo requieren confirmación fresca.

### 5. High-risk review siempre individual

Aunque el proyecto use revisión por bloques, sprint o final draft, trabajo de alto riesgo se revisa individualmente.

## Arquitectura

Paradigma: functional core, imperative shell.

- `packages/core`: inspección, planes, estado, validación, filesystem, checks, workflow y experiencia.
- `apps/cli`: parsing de comandos, output humano/JSON, exit codes.
- `packages/presets`: composición de módulos.
- `packages/spec`: assets de SPEC.
- `packages/agents`: templates de instrucciones de proyecto.
- `packages/gates`: gates de desarrollo, producción y workflow.

Reglas arquitectónicas clave:

- Los efectos pertenecen a core.
- CLI no debe contener lógica de negocio compleja.
- Estado de repo vive bajo `.downstroke/`.
- Estado de workspace vive bajo `.downstroke-workspace/` cuando aplique.
- Estado persistido debe tener schema/version y validación.
- Outputs públicos se controlan con allowlist y scans.

## Capacidades actuales

### Init

Comando:

```bash
downstroke init --preset lite
```

Inicializa documentos base sin sobrescribir archivos existentes. El comportamiento copy-if-missing es importante: Downstroke no debe destruir trabajo del usuario.

### Doctor

Comandos:

```bash
downstroke doctor
downstroke doctor --json
downstroke doctor --run-checks
```

Detecta etapa del proyecto, stacks, scripts, artefactos legacy y estado de planificación. Con `--run-checks` ejecuta checks reales disponibles.

### Cadence

Comandos:

```bash
downstroke cadence
downstroke cadence --review-mode one-at-a-time --yes
downstroke cadence --review-mode blocks --block-size 3 --yes
downstroke cadence --review-mode sprint --sprint-days 10 --capacity-hours 80 --wip-limit 3 --yes
```

Guarda cómo se revisa el trabajo. Los modos actuales son:

- one-at-a-time;
- blocks;
- sprint;
- final-draft.

### Govern

Comando para evaluar decisiones:

```bash
downstroke govern --kind deterministic
downstroke govern --kind contextual
downstroke govern --kind high-risk
```

Ayuda a separar responsabilidades:

- usuario aprueba;
- LLM aconseja;
- CLI ejecuta;
- repositorio registra;
- provider aplica infraestructura.

### Git policy

Comandos:

```bash
downstroke git-policy
downstroke git-policy --allow-branch --allow-commit --yes
downstroke git-policy --allow-push --yes
```

Branch, commit y push son permisos separados. Push no se asume por haber permitido commits.

### Token estimate/status

Comandos:

```bash
downstroke estimate --scope task --path docs/SPEC.md
downstroke status --scope sprint --path _bmad-output/planning-artifacts/epics.md --consumed-tokens 12000
```

Las estimaciones son rangos. La calibración real contra uso observado queda para Story 10.7, al final.

### Operational Experience

Comandos:

```bash
downstroke experience init
downstroke experience add --fact '<json>' --yes
downstroke experience import --path docs/SPEC.md --yes
```

Operational Experience guarda hechos durables con:

- id;
- tipo;
- scope;
- status;
- source;
- confidence;
- timestamps;
- evidence;
- trust level;
- secret/injection scan status.

Estados posibles incluyen:

- observed;
- inferred;
- verified;
- stale;
- conflicted;
- quarantined;
- rejected.

Importante: output generado por LLM no puede crear verdad verificada directamente.

### Safe import

`experience import` puede leer Markdown, YAML y JSON. Calcula SHA-256, tamaño, formato, clasificación, trust, importability e instruction risk.

Rechaza o cuarentena:

- paths inseguros;
- symlinks;
- binarios;
- archivos demasiado grandes;
- secretos;
- prompt injection;
- contenido desconocido de alto impacto;
- conflictos materiales.

También soporta claims explícitos:

```txt
claim: storage=local
```

Si otro archivo dice:

```txt
claim: storage=remote
```

Downstroke retiene ambos candidatos y pausa.

### Native workflow

Comandos:

```bash
downstroke workflow add --item '{"id":"story.1","type":"story","title":"First story","status":"ready-for-dev"}' --yes
downstroke workflow resume --item-id story.1
```

Estado bajo `.downstroke/workflows/`:

- `manifest.json`;
- `items.jsonl`;
- `evidence.jsonl`;
- `decisions.jsonl`;
- `checkpoints.jsonl`.

Soporta:

- briefs/specs/epics/stories/tasks;
- acceptance criteria;
- tasks;
- status;
- risk;
- high-risk individual review;
- controlled checkpoints;
- material conflict pause;
- resume determinístico.

Controlled mode usa fases:

1. plan;
2. review;
3. implementation;
4. verification.

## Roadmap relevante

Epic 9 es la plataforma nativa:

- 9.1 Native-only boundary: done.
- 9.2 Operational Experience foundation: done.
- 9.3 Safe project knowledge import: done.
- 9.4 Native planning and delivery workflows: done.
- 9.5 Native communication policy: backlog.
- 9.6 Native simplicity gates: backlog.
- 9.7 Native code intelligence: backlog.
- 9.8 Native token economy: backlog.
- 9.9 Safe task context compiler: backlog.
- 9.10 Strict native health and cleanup: backlog.
- 9.11 Native worker runtime: backlog.
- 9.12 Remote module registry: backlog.
- 9.13 Conflict-aware managed migrations: backlog.
- 9.14 Native execution engine: backlog.
- 9.15 Native knowledge lifecycle and health engine: backlog.

Epic 10 prepara release:

- README completo.
- npm package.
- publicación npm.
- repo público sanitizado.
- documentación/showcase.
- calibración final de tokens.

## Execution Engine y workers nativos

El feedback externo sugirió que Downstroke necesita una pieza explícita que dirija el trabajo. Se aceptó esa mejora, pero con una restricción importante: no se agregará un framework externo de agentes al runtime final.

La pieza se llama Native Execution Engine y se modela así:

1. Planner;
2. Scheduler;
3. Executor;
4. Verifier;
5. Recorder.

La regla de diseño es simple: si una función determinística puede resolver el trabajo, Downstroke usa esa ruta. Los workers solo entran cuando el trabajo realmente requiere separación de responsabilidades, revisión especializada o fan-out controlado.

Los workers iniciales planeados son:

- Planner: transforma un objetivo en una tarea ejecutable con riesgos, dependencias y evidencia esperada.
- Repository Inspector: lee estructura, scripts, configuración, workspace y evidencia del repo.
- Risk Auditor: detecta code smells peligrosos, secretos, ejecución insegura, injection, path traversal, dependencias riesgosas y peligros de release.
- Evidence Validator: clasifica claims como verified, observed, inferred, stale, invalidated o conflicted.
- Workflow Guardian: vigila checkpoints, cadencia, bloqueos, conflictos y approvals faltantes.
- Context Compiler: produce el contexto mínimo seguro para una tarea.
- Release Guardian: bloquea release si fallan package contents, native-only scan, tests, tarball, exports o publicación.

Estos workers no son personalidades ni prompts sueltos. Son roles nativos con:

- input schema;
- output schema;
- herramientas permitidas;
- permisos de mutación;
- presupuesto;
- stop condition;
- requisitos de evidencia;
- audit trail.

Ningún worker puede mutar archivos, completar checkpoints, aprobar release ni promover hechos a verdad verificada solo por afirmarlo. Todo debe pasar por preview, workflow state, evidencia y aprobación cuando aplique.

Esto no impide probar Downstroke hoy. Las features actuales siguen funcionando por la ruta single-path. Lo que cambia es el milestone final: para declarar el framework completamente usable y nativo ahora también deben existir 9.14 y 9.15.

## Simplicity gates

Simplicity gates son checkpoints nativos para bloquear o exigir evidencia cuando una solución mete complejidad innecesaria.

Ejemplos:

- dependencia nueva sin necesidad;
- abstracción con un solo consumidor;
- shared package prematuro;
- broad rewrite cuando bastaba cambio local;
- configuración innecesaria;
- patrón complejo sin evidencia;
- cambio de seguridad simplificado de forma peligrosa.

No significan “hacerlo barato”. Si seguridad, accesibilidad, integridad de datos o producción requieren más trabajo, la excepción se registra y seguridad gana.

El usuario pidió además una capacidad nativa de code smell/risk audit. Eso se integró en Story 9.6 como parte de simplicity gates.

Detectores deseados:

- ejecución peligrosa;
- secret leakage;
- path traversal;
- injection;
- ReDoS;
- dependency supply-chain risk;
- artifacts generados riesgosos;
- abstracciones prematuras;
- rewrites amplios;
- cambios de permisos/auth sin revisión.

Fuentes de investigación recomendadas para diseño, no runtime:

- OWASP Top 10;
- GitHub CodeQL;
- Semgrep rules;
- npm audit/provenance;
- Sonar clean-code concepts.

## Milestone de “framework usable”

El usuario quiere una celebración explícita cuando el framework sea completamente usable y nativo para probarlo localmente antes de subirlo a npm.

El milestone actual en `docs/SPEC.md` dice que se alcanza solo cuando:

- Epics 1-9 estén implementados, revisados y verificados, incluyendo 9.11-9.15.
- Story 10.1 README, Story 10.2 npm package preparation y Story 10.7 token calibration estén completas.
- Runtime, templates, generated projects, CLI help y docs públicas sean nativas.
- Un tarball local limpio pase init, doctor, help, build, typecheck, tests y native-only scan sin dependencias workspace no publicadas.
- No queden historias del scope en backlog, ready-for-dev, in-progress o review.
- No haya findings release high/medium sin resolver.

Hasta ese momento no debe anunciarse que está listo para npm.

## Puntos de mejora que otro ChatGPT debería revisar

1. Claridad del modelo de workflow:
   - ¿El esquema actual de `.downstroke/workflows/` es suficiente o conviene separar más claramente item, checkpoint, decision y evidence?
   - ¿Cómo se debería representar deferred work sin crear complejidad prematura?

2. CLI UX:
   - La pantalla inicial ya existe, pero podría mejorar visualmente sin perder seriedad.
   - Falta documentación de ejemplos completos por flujo.
   - Falta decidir si habrá comandos tipo `downstroke start`, `downstroke project`, `downstroke ready`.

3. README:
   - Ya contiene más detalle, pero puede crecer con ejemplos reales cuando las features nativas estén completas.
   - Debe evitar prometer capacidades aún en backlog como si estuvieran disponibles.

4. NPM readiness:
   - El root package aún está marcado como private.
   - Se debe validar bin, exports, files, package contents, provenance y clean install.
   - Hay que evitar empaquetar `_bmad-output`, docs legacy, skills internas o archivos de mantenimiento.

5. Native code intelligence:
   - Story 9.7 debe decidir cuánto indexar sin daemon ni servidor externo.
   - Debe excluir generated, ignored, secret y external-root files.

6. Simplicity/code smell audit:
   - Debe ser útil y de bajo ruido.
   - Debe diferenciar warning de blocker.
   - No debe convertirse en un linter gigante ni depender de reglas externas en runtime.

7. Native worker runtime:
   - Story 9.11 debe evitar construir una plataforma de agentes prematura.
   - Solo debe existir para orquestación schema-bound donde funciones normales no basten.
   - Los workers deben ser procesos especializados con contratos, no personajes.
   - La ruta single-path debe seguir siendo la opción por defecto.

8. Execution engine:
   - Story 9.14 debe definir `downstroke run` y la secuencia Planner, Scheduler, Executor, Verifier, Recorder.
   - Debe registrar owner, dependencias, prioridad, estimación, riesgo, rollback y approvals.
   - Si verification falla, el recorder debe dejar el task bloqueado/fallido con evidencia.

9. Knowledge lifecycle y health:
   - Story 9.15 debe definir cuándo un hecho expira, queda stale, se invalida o pierde confianza.
   - `downstroke health` debe poder explicar por qué el repo está bloqueado, qué evidencia falta y qué historia tiene mayor riesgo.

10. Public release:
   - La sanitización de repo público debe ser allowlist-first.
   - La historia privada completa debe verificarse antes de cualquier clean public history.
   - Publicación npm debe requerir confirmación explícita.

## Cómo probar localmente hoy

Desde el repo:

```bash
npm install
npm run build
node apps/cli/dist/index.js
node apps/cli/dist/index.js init --preset lite --dry-run
node apps/cli/dist/index.js doctor --json
node apps/cli/dist/index.js experience init
node apps/cli/dist/index.js workflow resume
```

Para link global durante desarrollo:

```bash
npm run build
npm link -w downstroke-cli
downstroke
```

Esto no equivale a publicación npm final. Es solo uso local de desarrollo.

## Qué NO debe hacer Downstroke

- No debe depender de herramientas externas como runtime final.
- No debe vender capacidades en README que aún no están implementadas.
- No debe borrar artefactos legacy antes de completar importación/paridad.
- No debe resolver contradicciones semánticas en silencio.
- No debe publicar npm sin clean install y tarball verification.
- No debe push/publish/force-push sin aprobación explícita.

## Archivos clave

- `docs/SPEC.md`: contrato canónico.
- `README.md`: documentación pública inicial.
- `HOW.md`: este contexto para ChatGPT.
- `packages/core/src/index.ts`: lógica principal.
- `apps/cli/src/index.ts`: comandos CLI.
- `_bmad-output/planning-artifacts/epics.md`: roadmap.
- `_bmad-output/implementation-artifacts/sprint-status.yaml`: estado de historias.
- `_bmad-output/implementation-artifacts/9-4-add-native-planning-and-delivery-workflows.md`: historia 9.4.

## Recomendación para el siguiente análisis

Pedirle al otro ChatGPT que revise:

1. si el README comunica bien sin sobreprometer;
2. si HOW.md da suficiente contexto para entender el proyecto;
3. si la CLI debería tener otro nombre de comando para la experiencia inicial;
4. si el milestone “usable local acceptance” está demasiado estricto o correctamente protegido;
5. qué riesgos ve antes de npm package preparation.
