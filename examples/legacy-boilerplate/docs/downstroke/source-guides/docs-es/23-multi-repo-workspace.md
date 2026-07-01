# Multi-Repo Workspace

Downstroke debe ayudar a trabajar con varios repositorios dentro de un mismo folder sin mezclar contexto, reglas, comandos ni git roots. Esto es clave para freelancers, consultores y developers que mantienen varios clientes o productos al mismo tiempo.

## Problema

Un folder como `workspace/` puede contener varios repos independientes:

```txt
workspace/
  client-a-dashboard/      git repo
  client-b-api/            git repo
  internal-tools/          git repo
  experiments/             no git
  shared-notes/            no git
```

El riesgo aparece cuando:

- se ejecuta git desde el folder equivocado;
- existe un `.git` accidental en el folder padre;
- repos anidados parecen monorepo pero no lo son;
- reglas de un cliente contaminan otro proyecto;
- el LLM lee contexto del repo incorrecto;
- scripts se corren contra varios proyectos sin querer;
- caches, reports o memoria se mezclan.

## Principio

```txt
Un workspace puede contener muchos repos.
Cada repo mantiene su propia identidad, reglas, memoria, stack y doctor reports.
```

Downstroke debe tratar el folder padre como **workspace**, no como repo, salvo que el usuario confirme que de verdad es un monorepo.

## Comandos

```bash
downstroke workspace init
downstroke workspace scan
downstroke workspace status
downstroke workspace doctor
downstroke workspace focus <repo>
downstroke workspace foreach -- <command>
downstroke workspace map
downstroke workspace protect
```

## Archivo De Workspace

Ubicacion recomendada:

```txt
.downstroke-workspace/workspace.json
```

Ejemplo:

```json
{
  "name": "workspace",
  "mode": "multi-repo",
  "repos": [
    {
      "id": "client-a-dashboard",
      "path": "client-a-dashboard",
      "kind": "react-dashboard",
      "owner": "client-a",
      "active": true
    },
    {
      "id": "client-b-api",
      "path": "client-b-api",
      "kind": "nestjs-api",
      "owner": "client-b",
      "active": false
    }
  ],
  "safety": {
    "denyParentGitMutation": true,
    "requireRepoSelection": true,
    "isolateLlmContext": true
  }
}
```

## Deteccion

`downstroke workspace scan` debe detectar:

| Senal | Accion |
| --- | --- |
| `.git/` dentro de subfolder | Registrar repo independiente. |
| `.git` file | Detectar worktree/submodule y resolver root real. |
| `.git/` en folder padre | Advertir posible repo global accidental. |
| `pnpm-workspace.yaml`, `turbo.json`, `nx.json` | Preguntar si es monorepo real. |
| Varios `package.json` sin workspace config | Tratar como multi-repo probable. |
| `.csproj` / `.sln` | Detectar repo .NET. |
| Remotes diferentes | Marcar como repos independientes. |

## Proteccion Contra Git Root Equivocado

Antes de mutar archivos o correr comandos peligrosos, Downstroke debe resolver:

```bash
git -C <cwd> rev-parse --show-toplevel
```

Reglas:

- Si el comando se ejecuta desde el workspace padre, pedir repo objetivo.
- Si el folder padre tiene `.git` y contiene repos hijos, marcar `WARN` o `FAIL`.
- Si un repo hijo no esta declarado como submodule/worktree, no tratarlo como parte del padre.
- Nunca correr `git add .`, `git commit`, migraciones o installs masivos desde el padre sin confirmacion explicita.
- No mezclar reports de un repo con otro.

## Contexto LLM Aislado

Cada repo debe tener contexto separado:

```txt
repo-a/.downstroke/
repo-b/.downstroke/
.downstroke-workspace/
```

El LLM activo debe recibir:

- repo seleccionado;
- stack de ese repo;
- reglas de ese repo;
- memoria personal aprobada;
- reglas workspace no sensibles;
- exclusion explicita de otros repos.

Prompt base:

```txt
Estas trabajando dentro del repo seleccionado: {repo_id}.
No uses archivos, reglas, dependencias ni decisiones de otros repos del workspace salvo que el usuario lo pida.
Si necesitas contexto de otro repo, pregunta primero.
```

## Vista Global Sin Mezclar

`downstroke workspace status` debe mostrar resumen:

```txt
Downstroke Workspace: workspace

Repo                 Stack            Branch      Dirty  Doctor
client-a-dashboard   React/Tailwind    feature/x   yes    WARN
client-b-api         Nest/Postgres     main        no     OK
internal-tools       .NET/Blazor       dev         no     FAIL

Next:
1. Focus client-a-dashboard to resolve dirty state.
2. Run doctor in internal-tools; Breakdown Stack missing.
3. Avoid parent git commands; parent .git detected.
```

## Comandos Multi-Repo Seguros

`workspace foreach` debe ser seguro por default:

```bash
downstroke workspace foreach --include dirty -- downstroke doctor
downstroke workspace foreach --stack react -- pnpm test
```

Reglas:

- `foreach` requiere filtro o confirmacion si afecta todos los repos.
- Por default no ejecuta comandos destructivos.
- Muestra plan antes de ejecutar.
- Ejecuta repo por repo usando cwd correcto.
- Guarda reporte por repo.

## Monorepo Vs Multi-Repo

| Caso | Tratamiento |
| --- | --- |
| Un solo `.git` root y workspaces declarados | Monorepo. |
| Varios `.git` roots hijos | Multi-repo workspace. |
| Parent `.git` + child `.git` sin submodules | Riesgo, pedir decision. |
| Repos de clientes diferentes | Multi-repo con aislamiento fuerte. |
| Worktrees | Detectar y respetar root real. |

## Criterios De Aceptacion

- [ ] `downstroke workspace scan` detecta repos hijos.
- [ ] Downstroke distingue monorepo real de multi-repo folder.
- [ ] El folder padre puede tener estado workspace sin ser repo.
- [ ] El LLM activo trabaja solo con el repo seleccionado.
- [ ] Git commands peligrosos requieren repo objetivo.
- [ ] Reports, reglas y memoria se aislan por repo.
- [ ] `workspace status` da vista global sin mezclar contexto.
- [ ] `workspace foreach` es seguro por default.
