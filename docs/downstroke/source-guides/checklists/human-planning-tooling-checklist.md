# Downstroke Human Planning And Tooling Checklist

## BMAD Humano

- [ ] Antes de crear muchas historias, el CLI pregunta modo de revision.
- [ ] Soporta revision `una-a-una`.
- [ ] Soporta revision por bloques de `X` historias/tasks.
- [ ] Soporta revision por sprint completo.
- [ ] Guarda preferencias en `.downstroke/planning.json`.
- [ ] El backlog incluye valor, riesgo, esfuerzo, incertidumbre y dependencias.
- [ ] El sprint planning muestra capacidad real y WIP recomendado.

## Tool Doctor

- [ ] Detecta package manager por lockfile.
- [ ] Detecta frameworks principales.
- [ ] Detecta lint/format/typecheck/test tools.
- [ ] Detecta BMAD, CodeGraph, Caveman y Ponytail como Breakdown Stack obligatorio.
- [ ] Marca falta de BMAD, CodeGraph, Caveman o Ponytail como problema real del setup.
- [ ] Clasifica tools como `KEEP`, `INTEGRATE`, `COVERED`, `CONFLICT`, `MISSING` o `UNKNOWN`.
- [ ] Explica conflictos sin borrar configuraciones.
- [ ] Recomienda ownership claro entre tools con solape.
- [ ] Puede pedir analisis al LLM activo para dependencias, conflictos y excepciones.

## CLI / Terminal

- [ ] `downstroke doctor` tiene salida clara y moderna.
- [ ] `downstroke bugs` agrupa errores por causa probable.
- [ ] El CLI muestra siguiente paso concreto.
- [ ] No sobrescribe archivos existentes por default.
- [ ] Cambios riesgosos requieren plan o confirmacion.

## React / Frontend

- [ ] Preset React usa feature-based organization.
- [ ] TypeScript strict esta activo.
- [ ] Estado local se mantiene cerca de donde se usa.
- [ ] Server state y client state estan separados.
- [ ] Lazy loading se aplica a componentes pesados.
- [ ] Memoizacion se recomienda solo con evidencia.
- [ ] Async independiente corre en paralelo cuando aplica.
- [ ] React y React DOM se validan juntos.

## Versiones / Compatibilidad

- [ ] `downstroke versions` detecta outdated packages.
- [ ] Separa patch, minor, major, security y framework-coupled.
- [ ] Consulta documentacion oficial antes de recomendar upgrades grandes.
- [ ] Crea plan de upgrade con checks y rollback.
- [ ] Genera reporte en `.downstroke/reports`.

## Timelines / Tokens

- [ ] Estima tiempo por historia BMAD.
- [ ] Estima tokens como rango aproximado.
- [ ] Divide historias grandes automaticamente como recomendacion.
- [ ] Timeline incluye discovery, implementacion, QA, review y buffer.

## LLM Activo / Project Foundation

- [ ] `downstroke llm doctor` detecta modo de integracion disponible.
- [ ] Soporta adapter directo, MCP, prompt handoff o report import.
- [ ] `downstroke deps analyze` puede revisar dependencias con LLM activo.
- [ ] `downstroke project foundation` crea `docs/downstroke/PROJECT_FOUNDATION.md`.
- [ ] El Project Foundation incluye filosofia, idea inicial, primeros pasos y como profundizar.
- [ ] Las decisiones importantes pueden guardarse como reporte o ADR.

## Multi-Repo Workspace

- [ ] `downstroke workspace scan` detecta repos hijos.
- [ ] Distingue monorepo real de multi-repo workspace.
- [ ] Detecta parent `.git` riesgoso con repos hijos.
- [ ] Aisla contexto LLM por repo enfocado.
- [ ] Guarda estado en `.downstroke-workspace/workspace.json`.
- [ ] `workspace status` muestra vista global sin mezclar contexto.
- [ ] `workspace foreach` es seguro por default.
