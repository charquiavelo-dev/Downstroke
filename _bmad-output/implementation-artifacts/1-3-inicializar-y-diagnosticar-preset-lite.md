# Story 1.3: Inicializar y diagnosticar preset lite

Estado: `review`

## Valor Y Riesgo

- Valor: 5/5
- Riesgo: 4/5
- Esfuerzo: 4/5
- Incertidumbre: 3/5
- Dependencias: 5/5

## Alcance

- Implementar operaciones `copy-if-missing` y previsualización segura.
- Implementar `downstroke init --preset lite`.
- Implementar `downstroke doctor` con salida humana y JSON.
- Detectar etapa, stack, scripts y señales de trabajo asistido en proyectos ya iniciados.
- Probar instalación en directorio vacío y preservación de archivo existente.

## Aceptación

- `init` muestra acciones y no sobrescribe archivos existentes.
- `--dry-run` no muta el filesystem.
- `doctor` comprueba `AGENTS.md`, `CLAUDE.md`, `docs/SPEC.md` y Breakdown Stack.
- Los resultados usan estados `ok`, `warn` o `fail` y pueden serializarse como JSON.
- La inspección distingue repos vacíos, documentados, scaffolded e implementados sin afirmar que funcionan antes de ejecutar checks.
- La posible creación por prompting se presenta como inferencia basada en artefactos, nunca como hecho probado.
- `doctor --run-checks` solo marca `verified` después de ejecutar satisfactoriamente los scripts disponibles de typecheck, test y build.

## Evidencia

- Seis pruebas automatizadas aprobadas.
- Preservación de archivos, dry-run, inspección y fallo de checks cubiertos.
- CodeGraph indexó 26 archivos, 397 nodos y 621 relaciones.
- `doctor --run-checks --json` devolvió `verified` para TypeScript, tests y build.
- Breakdown Stack detectado con estado `ok` en sus cuatro componentes.
- Una prueba automatizada falla si se reintroduce sobrescritura silenciosa.
