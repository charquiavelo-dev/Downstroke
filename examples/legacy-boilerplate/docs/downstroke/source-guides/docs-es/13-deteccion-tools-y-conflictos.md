# Downstroke Tool Doctor

Downstroke debe detectar herramientas instaladas y explicar si conviene conservarlas, integrarlas, reemplazarlas o revisarlas por conflicto. La meta no es borrar el stack del usuario. La meta es evitar que el proyecto pierda dias arreglando friccion entre tools.

## Comando Principal

```bash
downstroke tools doctor
downstroke doctor --tools
```

## Que Debe Detectar

| Area | Senales |
| --- | --- |
| Package manager | `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`, `packageManager` |
| Framework | `next`, `vite`, `expo`, `react-native`, `nestjs`, `express`, `astro`, `remix`, `.NET`, `Blazor` |
| Monorepo | `nx.json`, `turbo.json`, `pnpm-workspace.yaml`, `lerna.json` |
| Calidad | `biome.json`, `eslint.config.*`, `.eslintrc*`, `prettier.config.*`, `tsconfig.json`, `.editorconfig`, `.csproj` |
| Tests | `vitest.config.*`, `jest.config.*`, `playwright.config.*`, `cypress.config.*` |
| UI/dev | `storybook`, `tailwind`, `nativewind`, `shadcn`, `radix`, `lucide`, Blazor components |
| Estado/datos | `zustand`, `redux`, `@tanstack/react-query`, `apollo`, `urql` |
| Agentes/IA | `AGENTS.md`, `.agents`, `CLAUDE.md`, `.bmad`, `.codegraph`, `.caveman` |
| Git hooks | `lefthook.yml`, `.husky`, `lint-staged` |

## Salida Esperada

```txt
Downstroke Tool Doctor

KEEP       TanStack Query    Server state bien separado del estado UI.
KEEP       Zustand           Util para estado global pesado si se usa con criterio.
INTEGRATE  BMAD              Downstroke no lo reemplaza; lo vuelve mas guiado.
INTEGRATE  CodeGraph         Muy util para contexto estructural y analisis de impacto.
CONFLICT   ESLint + Biome    Biome es default; ESLint requiere justificacion real.
COVERED    Custom scripts    Parte se puede mover a downstroke doctor.
MISSING    Playwright        Recomendado si hay flujos criticos de usuario.
```

## Clasificacion

| Estado | Significado | Accion |
| --- | --- | --- |
| `KEEP` | La tool agrega valor real | Mantener y documentar como usarla bien. |
| `INTEGRATE` | Es mejor junto a Downstroke | Crear adapter o comando que la use. |
| `COVERED` | Downstroke cubre la misma necesidad | No borrar automaticamente; sugerir migracion. |
| `CONFLICT` | Hay solape o reglas opuestas | Explicar riesgo y proponer ownership claro. |
| `MISSING` | Falta una tool importante | Recomendar solo si el proyecto la necesita. |
| `UNKNOWN` | No hay suficiente evidencia | Pedir confirmacion o documentacion. |

## Consejos Por Tool

| Tool | Consejo Downstroke |
| --- | --- |
| BMAD | Mandatorio. Downstroke lo usa para planning, backlog, historias, tasks y QA. |
| CodeGraph | Mandatorio. Downstroke lo usa para entender estructura e impacto sin gastar tokens de mas. |
| Caveman | Mandatorio. Downstroke lo usa para comprimir contexto, specs y handoffs. |
| Ponytail | Mandatorio. Downstroke lo usa como regla de simplicidad senior y anti-bloat. |
| Biome | Default para formato/lint en JS/TS por velocidad, simplicidad y menor friccion. |
| ESLint | Excepcion: mantener solo si el analisis demuestra reglas necesarias que Biome no cubre. |
| Prettier | Evitar si Biome ya formatea todo, salvo necesidad especifica del stack. |
| Lefthook | Default para git hooks por compatibilidad y simplicidad. |
| Husky | Mantener solo si ya existe y migrar no vale la pena. |
| Zustand | Util para estado global cliente, no para server state. |
| TanStack Query | Util para server state, cache, invalidacion y sincronizacion. |
| Storybook | Util si hay design system, componentes compartidos o QA visual. |
| Nx/Turbo | Util si el monorepo ya tiene varios paquetes/apps; prematuro para proyectos pequenos. |
| .NET SDK | Mantener si el proyecto usa backend .NET, Blazor, APIs o servicios enterprise. |
| Blazor | Compatible con Downstroke como stack frontend/fullstack .NET. |
| PostgreSQL | Default recomendado para datos relacionales serios salvo razon real para otra DB. |
| Express | Backend Node simple, APIs pequenas, prototipos o servicios con baja ceremonia. |
| NestJS | Backend Node complejo, arquitectura modular, DI, equipos o dominios grandes. |

## Regla De Oro

Downstroke no debe decir "instala mas cosas" por reflejo. Debe responder:

1. Que problema resuelve la tool.
2. Si el proyecto ya tiene una solucion equivalente.
3. Si hay conflicto con otra tool.
4. Si vale la pena mantenerla.
5. Como usarla sin meter ruido al flujo.

## Regla Biome-First

Downstroke debe preferir:

```txt
Biome > ESLint
Lefthook > Husky
```

La excepcion existe, pero debe ganarse. Si el proyecto parece necesitar ESLint, Downstroke debe pedir al LLM activo una comparativa concreta contra Biome usando el contexto real del repo. Downstroke no hace busquedas directas por su cuenta; define la regla, el prompt, el formato de evidencia y el gate de decision.

Formato de decision:

```txt
Decision: Mantener ESLint como excepcion
Porque: regla X no cubierta por Biome y evita bug Y en este repo
Costo: una config extra y tiempo adicional en CI
Ownership: Biome formatea; ESLint solo ejecuta reglas X/Y
Revisar de nuevo: en 30 dias o al cambiar version de Biome
```

## Criterios De Aceptacion

- [ ] Detecta tools desde archivos reales del repo.
- [ ] Explica conflictos sin borrar configuraciones.
- [ ] Recomienda ownership entre tools con solape.
- [ ] Identifica tools utiles que Downstroke debe integrar, no reemplazar.
- [ ] Produce salida clara, accionable y facil de leer en terminal.
- [ ] Biome queda como default y ESLint requiere justificacion documentada.
