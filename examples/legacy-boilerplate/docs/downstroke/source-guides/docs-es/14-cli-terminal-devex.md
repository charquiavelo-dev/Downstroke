# CLI Y Terminal Developer Friendly

Downstroke debe sentirse como una herramienta de trabajo seria, rapida y bonita. No debe ser un CLI lleno de ruido. Debe guiar, diagnosticar y ayudar a avanzar con confianza.

## Personalidad Del CLI

| Cualidad | Como se ve |
| --- | --- |
| Claro | Mensajes cortos, accionables y con siguiente paso. |
| Moderno | Tablas limpias, estados, colores accesibles y progreso real. |
| Humano | Pregunta cuando hay criterio de producto o arquitectura. |
| Senior | No auto-aplica cambios riesgosos sin explicar impacto. |
| Rapido | Usa cache local y comandos incrementales. |

## Comandos Base

```bash
downstroke init --preset lite
downstroke add spec
downstroke add caveman
downstroke doctor
downstroke tools doctor
downstroke bmad backlog
downstroke bmad sprint
downstroke versions
downstroke bugs
downstroke timeline
downstroke tokens
```

## Terminal Bonita Pero Util

Salida ideal:

```txt
Downstroke Doctor

Project       Next.js app
React         19.2.7
Package mgr   pnpm
Preset        frontend-react

PASS  TypeScript strict mode enabled
WARN  ESLint and Biome both format imports
WARN  3 packages have newer minor versions
FAIL  react and react-dom versions do not match

Next move:
1. Align react/react-dom versions
2. Decide ESLint/Biome ownership
3. Run downstroke versions --plan
```

## Bug Finder

`downstroke bugs` no debe ser magia falsa. Debe ordenar evidencia:

1. Ejecutar o leer resultados de `typecheck`, `lint`, `test`, `build`.
2. Agrupar errores repetidos por causa probable.
3. Separar error raiz de errores secundarios.
4. Mostrar archivos afectados y comando que fallo.
5. Sugerir orden de arreglo.
6. Crear una task BMAD si el bug requiere investigacion.

Ejemplo:

```txt
downstroke bugs

ROOT CAUSE  src/features/auth/session.ts
Signal      Type mismatch introduced by auth adapter upgrade
Impact      14 errors depend on this type
Fix order   1. session.ts  2. auth hooks  3. tests
```

## Modo Seguro

Por defecto, el CLI debe trabajar en modo seguro:

| Accion | Default |
| --- | --- |
| Escribir archivos nuevos | Permitido si no pisa archivos existentes. |
| Sobrescribir archivos | No, usar `--force` o generar `.downstroke-new`. |
| Instalar paquetes | Pedir confirmacion o usar `--yes`. |
| Cambios grandes de version | Crear plan, no ejecutar directo. |
| Fix automatico | Solo para cambios mecanicos y reversibles. |

## Criterios De Aceptacion

- [ ] El CLI tiene comandos simples y recordables.
- [ ] La salida se puede entender en menos de un minuto.
- [ ] Los errores se agrupan por causa probable.
- [ ] El CLI muestra siguiente paso concreto.
- [ ] Modo seguro evita pisar trabajo existente.
- [ ] La experiencia se siente profesional, no como script improvisado.
