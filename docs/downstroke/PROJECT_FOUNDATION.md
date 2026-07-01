# Downstroke Project Foundation

## Idea Inicial

Construir un framework modular para iniciar, inspeccionar y fortalecer proyectos asistidos por IA con reglas, contexto, planificación y QA verificables.

## Filosofía

Downstroke debe ser rápido sin ser irresponsable, opinionado donde ahorra trabajo y conservador frente a archivos, datos y decisiones existentes. No reemplaza herramientas maduras hasta demostrar una alternativa mejor en proyectos reales.

## Usuario Objetivo

Developers y equipos que construyen productos React, Next.js, React Native, Node.js, PostgreSQL, .NET o Blazor con asistencia de LLMs.

## Problema

Cada proyecto repite reglas de agentes, setup, specs, gates, análisis de herramientas y planificación. La repetición manual consume tokens, pierde decisiones y produce resultados inconsistentes.

## Alcance Inicial

- CLI `init` y `doctor`.
- Módulos instalables de SPEC, agentes y gates.
- Preset `lite`.
- Inspección de repositorios existentes.
- Breakdown Stack obligatorio y diagnosticable.
- Instalación no destructiva.

## Fuera De Alcance Por Ahora

- Reemplazos nativos de CodeGraph, Caveman, Ponytail o BMAD.
- Runtime de agentes.
- Registry remoto de módulos.
- Migraciones automáticas sin managed blocks y detección de conflictos.

## Primeros Pasos

1. Preservar baseline y fuentes.
2. Entregar monorepo mínimo y checks.
3. Validar `init --preset lite` y `doctor`.
4. Integrar instalación y diagnóstico completo del Breakdown Stack.
5. Probar el framework en dos o tres proyectos antes de estabilizar módulos.

## Riesgos Iniciales

- Convertir reglas específicas de una aplicación en defaults globales.
- Afirmar que un proyecto funciona basándose solo en archivos.
- Sobrescribir personalizaciones durante instalación o migración.
- Añadir tooling y abstracciones antes de que el uso real los justifique.

## Decisiones Pendientes

- Formato final de manifests y managed blocks.
- Estrategia de distribución npm y versionado de módulos.
- Qué comprobaciones de ejecución habilitan el estado `verified`.
- Cómo instalar cada bridge del Breakdown Stack de forma portable.
