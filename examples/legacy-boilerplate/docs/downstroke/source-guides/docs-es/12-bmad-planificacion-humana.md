# Downstroke BMAD: Planificacion Humana

Downstroke no debe convertir BMAD en una fabrica fria de tickets. La meta es que el framework ayude a pensar, revisar y ordenar trabajo con ritmo humano: suficientemente estructurado para producir, pero con pausas reales para criterio senior.

## Principio

Cada vez que Downstroke genere epicas, historias o tasks, debe preguntar como quiere revisar el usuario:

| Modo | Cuando usarlo | Comportamiento |
| --- | --- | --- |
| `una-a-una` | Trabajo critico, arquitectura nueva, alto riesgo | Downstroke genera una historia o task, espera revision y ajusta antes de continuar. |
| `bloques` | Producto claro, riesgo medio | Downstroke pregunta el tamano del bloque y revisa cada `X` historias o tasks. |
| `por-sprint` | Backlog amplio, equipo listo para planificar | Downstroke genera el sprint completo y hace revision al cierre de planning. |
| `solo-al-final` | Exploracion rapida o borrador inicial | Downstroke genera todo y marca riesgos para revision posterior. |

Prompt obligatorio:

```txt
Como queres revisar este trabajo?
1. Una historia/task a la vez
2. En bloques de X historias/tasks
3. Por sprint completo
4. Solo al final como borrador
```

Si el usuario elige `bloques`, Downstroke debe preguntar:

```txt
Cuantas historias o tasks queres revisar por bloque?
```

Si el usuario elige `por-sprint`, debe preguntar:

```txt
Cuantos dias tiene el sprint y cuanta capacidad real hay?
```

## Estado Persistente

El CLI debe guardar las preferencias en `.downstroke/planning.json`:

```json
{
  "reviewMode": "bloques",
  "blockSize": 5,
  "sprintLengthDays": 10,
  "capacityHoursPerDay": 5,
  "wipLimit": 2,
  "lastReviewedStory": "DS-014"
}
```

## Flujo De Backlog

El backlog se crea en capas:

1. Capturar ideas sin juzgarlas.
2. Normalizar cada idea como problema, usuario, valor y riesgo.
3. Deducir duplicados.
4. Agrupar por epica o dominio.
5. Puntuar por valor, riesgo, esfuerzo, dependencias y urgencia.
6. Convertir en historias con criterios de aceptacion.
7. Aplicar la cadencia de revision elegida.

Tabla de scoring inicial:

| Campo | Escala | Significado |
| --- | --- | --- |
| Valor usuario | 1-5 | Cuanto mejora el producto real. |
| Riesgo tecnico | 1-5 | Cuanto puede romper arquitectura, DX o compatibilidad. |
| Esfuerzo | 1-5 | Tamano aproximado de implementacion. |
| Incertidumbre | 1-5 | Cuanto falta investigar. |
| Dependencias | 1-5 | Cuanto bloquea o depende de otras cosas. |

## Sprint Planning Mas Humano

Downstroke debe generar una propuesta, no una orden. En cada planning debe mostrar:

| Bloque | Debe incluir |
| --- | --- |
| Objetivo del sprint | Una frase concreta. |
| Capacidad real | Horas o dias reales, descontando reuniones, soporte y vida real. |
| Riesgos | Cosas que pueden cambiar el orden. |
| WIP recomendado | Maximo de historias abiertas a la vez. |
| Historias sugeridas | Ordenadas por valor y dependencia. |
| Historias a no tocar | Trabajo tentador, pero prematuro. |

Regla fuerte: si una historia tiene riesgo alto o incertidumbre alta, Downstroke debe sugerir investigacion corta antes de implementacion.

## Comandos Propuestos

```bash
downstroke bmad plan
downstroke bmad backlog
downstroke bmad review
downstroke bmad sprint --days 10
downstroke bmad set-review --mode blocks --size 5
```

## Criterios De Aceptacion

- [ ] El CLI pregunta la cadencia de revision antes de generar muchas historias.
- [ ] El usuario puede cambiar la cadencia sin borrar el backlog.
- [ ] El backlog queda trazable desde idea hasta historia.
- [ ] Las historias incluyen valor, riesgo, esfuerzo, incertidumbre y dependencias.
- [ ] El sprint planning recomienda que hacer y que no hacer.
- [ ] El proceso se siente como colaboracion senior, no como generador masivo de tickets.
