# Story 1.2: Crear fundación del monorepo

Estado: `review`

## Valor Y Riesgo

- Valor: 5/5
- Riesgo: 3/5
- Esfuerzo: 3/5
- Incertidumbre: 2/5
- Dependencias: 4/5

## Alcance

- Crear workspaces para `apps/cli`, `packages/core`, `packages/spec`, `packages/agents`, `packages/gates` y `packages/presets`.
- Usar TypeScript estricto y Node ESM.
- Mantener scripts raíz pequeños para typecheck y tests.

## Aceptación

- La instalación de dependencias resuelve todos los workspaces.
- TypeScript compila sin emitir errores.
- Cada paquete tiene responsabilidad explícita y no contiene lógica de aplicación.
- No se añade Nx, Turbo ni un framework de CLI sin necesidad demostrada.

## Evidencia

- npm workspaces resuelve seis paquetes/apps.
- `npm run typecheck` aprobado.
- `npm test` compila todos los workspaces antes de ejecutar pruebas.
