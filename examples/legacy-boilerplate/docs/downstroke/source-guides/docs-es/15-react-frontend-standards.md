# Estandares React Y Frontend

Downstroke debe tratar React y Frontend como disciplina de mantenibilidad, rendimiento y legibilidad. SOLID ayuda, pero en UI moderna no alcanza solo. El framework debe cuidar colocacion de logica, composicion, estado, tipado, rendimiento, accesibilidad y escalabilidad.

Fuente viva: React mantiene la documentacion actual en `react.dev`; al momento de esta guia, la linea estable documentada es React 19.2. Downstroke debe verificar la documentacion antes de recomendar features nuevas o upgrades.

## Version Objetivo

| Caso | Regla |
| --- | --- |
| Proyecto nuevo | Usar `react@latest` compatible con el framework elegido. |
| Proyecto existente | No subir major/minor sin revisar peer deps, framework y tests. |
| Next/Remix/Astro/Expo | Seguir la version React soportada oficialmente por el framework. |
| Libreria reusable | Definir `peerDependencies` amplias pero probadas. |

## Arquitectura

| Regla | Aplicacion |
| --- | --- |
| Feature-based | Agrupar por dominio: `auth`, `products`, `billing`, `dashboard`. |
| Co-location | Mantener estado, hooks, tests y estilos cerca de quien los usa. |
| Componentes pequenos | Un componente debe hacer una cosa bien. |
| Componentes puros | Evitar efectos secundarios durante render. |
| Composicion | Preferir `children`, slots y composition props antes que prop drilling. |
| Limites claros | Separar UI, server state, client state, servicios y adapters. |

Ejemplo de estructura:

```txt
src/
  features/
    auth/
      components/
      hooks/
      services/
      auth.types.ts
      auth.schema.ts
      auth.test.ts
    dashboard/
      components/
      hooks/
      dashboard.page.tsx
  shared/
    ui/
    lib/
    config/
```

## Estado Y Datos

| Necesidad | Preferencia |
| --- | --- |
| Estado local de UI | `useState`, `useReducer`, cerca del componente. |
| Estado compartido estable | Context, si cambia poco y no causa renders caros. |
| Estado global cliente pesado | Zustand u otra store simple con selectors. |
| Server state | TanStack Query, framework loaders/actions o cache del framework. |
| Formularios complejos | Libreria especializada si reduce errores reales. |

Regla: estado local primero. Estado global solo cuando el problema ya existe.

## Rendimiento

React documenta `lazy` para cargar codigo diferido y `Suspense` para mostrar fallback mientras algo termina de cargar. Tambien documenta `useMemo` como optimizacion para calculos costosos, no como solucion para corregir logica rota.

Downstroke debe validar:

- Lazy loading para pantallas, modales pesados, editores, charts y dashboards.
- Suspense solo donde el framework o la fuente de datos lo soporta correctamente.
- `useMemo` y `useCallback` solo cuando haya calculo caro, listas grandes o renders medibles.
- Listas grandes con virtualizacion si el volumen lo amerita.
- Promesas en paralelo con `Promise.all` cuando no dependen unas de otras.
- Imagenes, fuentes y bundles revisados antes de culpar a React.

## TypeScript

| Regla | Motivo |
| --- | --- |
| `strict: true` | Detecta bugs antes del runtime. |
| Tipos en boundaries | APIs, formularios, adapters y env vars deben validar entradas. |
| Evitar `any` | Si se usa, debe estar justificado y aislado. |
| Schemas | Usar Zod, Valibot u otra opcion cuando entren datos externos. |
| Exportaciones limpias | Evitar barrels gigantes que oculten dependencias. |

## Linters Y Convenciones

Downstroke debe configurar consistencia desde el dia uno:

- Biome-first como regla default para formato y lint.
- ESLint solo si el analisis del proyecto demuestra una necesidad real que Biome no cubre.
- Reglas React hooks.
- Reglas de accesibilidad cuando aplique.
- Formato automatico.
- Typecheck separado de lint.
- Lefthook-first para hooks de git.
- Husky solo si el proyecto ya lo usa y migrarlo no agrega valor.

Regla fuerte: Downstroke no debe recomendar ESLint por costumbre. Si el LLM asistente, sea Claude, Codex, Gemini, MMX u otro, cree que ESLint hace falta, debe producir una justificacion concreta:

| Pregunta | Respuesta requerida |
| --- | --- |
| Que regla falta en Biome? | Nombre o categoria exacta. |
| Que bug evita? | Ejemplo real del proyecto. |
| Cuanto costo agrega? | Configuracion, performance, mantenimiento. |
| Cual es el ownership? | Biome formatea; ESLint solo cubre el gap. |
| Hay alternativa mas simple? | Plugin, test, typecheck o regla Downstroke. |

## Criterios De Aceptacion

- [ ] Los presets React usan feature-based organization.
- [ ] El estado se mantiene cerca de donde se usa.
- [ ] Server state y client state no se mezclan sin razon.
- [ ] TypeScript strict esta activo.
- [ ] Lazy loading aparece donde hay componentes pesados.
- [ ] Memoizacion no se aplica en masa sin evidencia.
- [ ] Las llamadas async independientes pueden correr en paralelo.
- [ ] El CLI advierte cuando React/framework/peer deps no son compatibles.
- [ ] Biome es default y ESLint requiere justificacion real.
