# Story 019: Multi-Repo Workspace

## Goal

Como freelancer o developer con varios repos en un mismo folder, quiero que Downstroke detecte y proteja los limites de cada repo para no mezclar git roots, contexto LLM, reglas, reports ni comandos.

## Tasks

- Crear comando `downstroke workspace init`.
- Crear comando `downstroke workspace scan`.
- Crear comando `downstroke workspace status`.
- Crear comando `downstroke workspace focus <repo>`.
- Crear comando `downstroke workspace doctor`.
- Crear comando seguro `downstroke workspace foreach`.
- Guardar estado en `.downstroke-workspace/workspace.json`.
- Detectar `.git` roots hijos, parent `.git`, worktrees, submodules, monorepos reales y multi-repo folders.
- Aislar contexto LLM por repo seleccionado.
- Evitar mutaciones desde el folder padre sin repo objetivo.

## Acceptance

- Downstroke distingue monorepo real de multi-repo workspace.
- Parent `.git` con repos hijos genera warning/fail.
- El LLM activo recibe solo contexto del repo enfocado.
- Reports y reglas se guardan por repo.
- `workspace status` muestra branch, dirty state, stack y doctor status por repo.
- `workspace foreach` pide filtro o confirmacion antes de correr en varios repos.
- Comandos destructivos no corren desde el workspace padre por accidente.
