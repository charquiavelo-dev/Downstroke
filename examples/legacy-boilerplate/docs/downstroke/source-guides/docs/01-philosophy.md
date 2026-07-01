# Downstroke Philosophy

## Operating Belief

AI no elimina la ingenieria. AI aumenta la velocidad a la que puedes cometer errores si no existe disciplina.

Downstroke existe para meter disciplina reusable en proyectos con IA sin convertir cada proyecto en una ceremonia pesada.

## The Downstroke Rule

```txt
Strong rhythm. Small modules. Verified output.
```

## Principles

### 1. Modularity Before Machinery

Cada pieza debe poder instalarse sola:

```bash
downstroke add spec
downstroke add caveman
downstroke add gates
```

Si un proyecto pequeno solo ocupa flujo ligero, no debe cargar RAG, MCP, production o BMAD completo. Pero si debe tener Breakdown Stack en modo minimo: CodeGraph, Caveman, Ponytail y BMAD proporcional.

### 2. Docs Are Runtime Context

Para proyectos asistidos por IA, los docs no son decoracion. Son parte del runtime mental del agente.

Archivos como `AGENTS.md`, `docs/SPEC.md` y gates de QA reducen ambiguedad, tokens y bugs.

### 3. Gates Scale With Risk

Un cambio de copy no ocupa BMAD completo, pero si debe pasar por la disciplina minima del metodo. Una migracion con datos de produccion si ocupa BMAD completo.

Downstroke debe imponer gates proporcionales:

| Riesgo | Gate |
| --- | --- |
| Bajo | checklist corto |
| Medio | SPEC quick + QA |
| Alto | BMAD story + architecture + acceptance |
| Critico | production gate + rollback + audit |

### 4. Normal Code First

Normal functions beat agent frameworks until orchestration is actually needed.

Downstroke debe permitir usar LangChain, LlamaIndex, CrewAI, Mastra o Microsoft Agent Framework, pero no debe forzarlos.

### 5. The Boilerplate Is The Lab

El boilerplate actual no se pierde. Es la fuente viva de patrones probados.

Proceso:

1. Usar boilerplate en proyectos reales.
2. Detectar repeticion.
3. Convertir repeticion en modulo.
4. Versionar el modulo.
5. Probar en 2 o 3 proyectos.
6. Promover a preset.

### 6. No Silent Magic

Downstroke no debe ejecutar cambios peligrosos en `postinstall`.

Todo cambio debe pasar por comandos explicitos:

```bash
downstroke init
downstroke add bmad
downstroke migrate
```

### 7. Managed Blocks, Not File Ownership

Downstroke no debe aduenarse de todo un archivo si el usuario lo edita.

Debe actualizar bloques marcados:

```md
<!-- downstroke-managed:start agents.qa-gate v0.1.0 -->
...
<!-- downstroke-managed:end -->
```

Si no puede actualizar con seguridad, genera un archivo `.downstroke-new.md`.

### 8. Strong Defaults, Clear Escape Hatches

El framework debe tener opinion, pero no debe ser carcel.

Ejemplo:

- Default: TypeScript strict.
- Escape: proyecto `.NET` usa `dotnet build` y reglas equivalentes.
- Default: PostgreSQL para datos reales.
- Escape: SQLite/localStorage para prototipos cuando el SPEC lo declara.

## Tone

Downstroke debe sentirse:

- Fuerte.
- Tecnico.
- Seco cuando toca.
- Cero infantil.
- Rock/metal en branding.
- Profesional en docs y CLI.
