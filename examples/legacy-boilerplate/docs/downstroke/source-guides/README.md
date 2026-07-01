# Downstroke Framework Guides

Este paquete es informacion adicional para transformar el boilerplate actual en un framework modular llamado **Downstroke**.

No reemplaza el boilerplate. No modifica `AGENTS.zip`. El boilerplate sigue siendo el sistema operativo actual para proyectos reales hasta que Downstroke este listo.

## Que Es Downstroke

Downstroke es un framework modular para delivery de software asistido por IA. Su proposito no es competir directamente contra LangChain, CrewAI, LlamaIndex o Mastra como runtime de agentes. Downstroke gobierna el trabajo alrededor del codigo:

- SPEC driven development.
- Reglas para agentes y humanos.
- BMAD proporcional al riesgo.
- CodeGraph para contexto estructural.
- Caveman para comunicacion comprimida.
- Ponytail para simplicidad senior.
- QA gates.
- Production readiness.
- Presets por stack.
- Modulos instalables por separado.
- Interaccion activa con el LLM actual.
- Analisis de dependencias con evidencia.
- Project Foundation dentro de `docs/downstroke/`.
- Workspace multi-repo para freelancers y developers con varios repos.

La idea musical es intencional: un downstroke es precision, disciplina, repeticion fuerte y controlada. Eso es exactamente lo que este framework debe imponer en proyectos con IA.

El metodo se llama **Downstroke Method**. El stack obligatorio actual se llama **Breakdown Stack**:

```txt
CodeGraph + Caveman + Ponytail + BMAD
```

Estas piezas son mandatorias para que el flujo funcione. Mas adelante Downstroke puede crear herramientas propias que suplanten parte de ese funcionamiento, pero solo con evidencia real de uso.

## Orden De Lectura

1. `docs/00-executive-summary.md`
2. `docs/01-philosophy.md`
3. `docs/02-research-notes.md`
4. `docs/03-framework-architecture.md`
5. `docs/04-module-system.md`
6. `docs/05-cli-installer.md`
7. `docs/06-migration-from-boilerplate.md`
8. `docs/07-versioning-release.md`
9. `docs/08-security-supply-chain.md`
10. `docs/09-branding.md`
11. `docs/10-roadmap.md`
12. `docs/11-competitive-evidence-and-real-value.md`
13. `docs-es/12-bmad-planificacion-humana.md`
14. `docs-es/13-deteccion-tools-y-conflictos.md`
15. `docs-es/14-cli-terminal-devex.md`
16. `docs-es/15-react-frontend-standards.md`
17. `docs-es/16-versiones-compatibilidad.md`
18. `docs-es/17-timelines-y-proyeccion-tokens.md`
19. `docs-es/18-stack-compatibilidad-y-preproyecto.md`
20. `docs-es/19-reglas-vivas-token-economy-integraciones.md`
21. `docs-es/20-downstroke-method-breakdown-stack.md`
22. `docs-es/21-llm-activo-y-analisis-de-dependencias.md`
23. `docs-es/22-project-foundation-md.md`
24. `docs-es/23-multi-repo-workspace.md`
25. `_bmad-output/*`

## Resultado Esperado

Primero se debe construir un MVP pequeno:

```txt
@downstroke/core
@downstroke/spec
@downstroke/agents
@downstroke/codegraph
@downstroke/caveman
@downstroke/ponytail
@downstroke/bmad
@downstroke/gates
@downstroke/presets
downstroke CLI
```

Comandos iniciales:

```bash
downstroke init --preset lite
downstroke doctor --breakdown-stack
downstroke project foundation
downstroke deps analyze
downstroke workspace scan
downstroke doctor
```

Cuando esto funcione en 2 o 3 proyectos reales, se agregan production gates avanzados, adapters por stack y reemplazos Downstroke-native solo si el uso real los justifica.

## Nota De Enfoque

Downstroke se define por su utilidad real: acelerar proyectos asistidos por IA para developers fuertes, con reglas, contexto, versionado, compatibilidad, QA y decisiones tecnicas mas claras.
