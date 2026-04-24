# SOP-15 — Agente Generador de Reporte

**Categoría:** Reporte | **Versión:** 1.0 | **Fecha:** Abril 2026

---

## 1. Objetivo

El **Generador de Reporte** crea el **reporte mensual de posicionamiento** que se entrega al cliente. Su doble función es:

1. **Para el cliente:** Un documento que entienden en 2 minutos, que demuestra el valor de lo que están pagando, con métricas concretas, tendencias visuales y acciones claras para el próximo mes.
2. **Para el operador:** La principal herramienta de **retención de clientes**. Un cliente que ve su progreso mensual documentado es un cliente que renueva. Un cliente que no recibe reporte es un cliente que se pregunta para qué sirve el servicio.

El reporte cubre las **dos dimensiones** del posicionamiento:

- **Map Pack:** Lo que pasa en Google Maps y búsqueda local (posición, visitas, llamadas, rutas, coherencia NAP)
- **GEO/AEO:** Lo que pasa en las IAs generativas (presencia en respuestas, schemas, FAQs, score de voz)

---

## 2. Cuándo ejecutar

### Ejecución principal

**Último día hábil de cada mes**, antes de la reunión o comunicación mensual con el cliente.

### Ejecuciones adicionales

| Situación | Cuándo |
|-----------|--------|
| Reunión de revisión trimestral | El día anterior a la reunión |
| Cliente solicita actualización | En el momento de la solicitud |
| Tras implementación mayor (nueva web, cambio GBP) | 15-30 días después del cambio |
| Mes 1 (primer reporte) | Al finalizar el onboarding |

---

## 3. Cómo ejecutar (paso a paso)

1. Ir a `/admin/agentes`.
2. Seleccionar el cliente en el panel izquierdo.
3. Seleccionar el agente **"Generador Reporte"**.
4. Verificar que los datos del CRM están actualizados para este mes:
   - Posición actual en Maps (si se monitoriza manualmente)
   - Número de reseñas del mes
   - Posts publicados en GBP este mes
   - Cualquier cambio o acción implementada en el mes
5. Si existe un reporte del mes anterior, asegurarse de que está accesible en `/admin/historial` (el agente lo recupera automáticamente para la comparativa).
6. Pulsar **"Ejecutar agente"**.
7. Revisar el reporte generado antes de enviarlo al cliente.

---

## 4. Estructura del reporte

El reporte tiene 5 secciones fijas:

### Sección 1: Resumen ejecutivo (3 líneas)

Tres frases que resumen el mes. El cliente debe poder entender el estado de su posicionamiento con solo leer esto. Ejemplo:

> "Este mes su negocio ha mantenido una posición estable en el Map Pack de Google para las búsquedas principales de su categoría. Hemos publicado 4 posts en su perfil y respondido 3 reseñas nuevas. Su presencia en respuestas de IA ha mejorado: Perplexity ya menciona su negocio en búsquedas de [categoría] en Madrid."

### Sección 2: Map Pack

Métricas de posicionamiento en Google Maps y búsqueda local:

| Métrica | Mes anterior | Este mes | Variación |
|---------|-------------|----------|-----------|
| Posición en Map Pack (keyword principal) | — | — | ↑↓→ |
| Visitas al perfil GBP | — | — | ↑↓→ |
| Llamadas desde GBP | — | — | ↑↓→ |
| Solicitudes de ruta | — | — | ↑↓→ |
| Coherencia NAP (score) | — | — | ↑↓→ |
| Posts publicados en GBP | — | — | — |
| Reseñas respondidas | — | — | — |
| Media de valoración | — | — | ↑↓→ |

**Representación visual:** Las variaciones se muestran con flechas (↑ verde para mejora, ↓ rojo para bajada, → gris para estable).

### Sección 3: GEO/AEO

Métricas de presencia en IAs generativas:

| Métrica | Mes anterior | Este mes | Variación |
|---------|-------------|----------|-----------|
| Menciones en ChatGPT | — | — | ↑↓→ |
| Menciones en Perplexity | — | — | ↑↓→ |
| Menciones en Google AI Overviews | — | — | ↑↓→ |
| Schema.org implementado (sí/no) | — | — | — |
| FAQs indexadas en web | — | — | ↑↓→ |
| Score de entidad definida (0-100) | — | — | ↑↓→ |
| Score de búsqueda por voz (estimado) | — | — | ↑↓→ |

### Sección 4: Highlights del mes (3 logros)

Los 3 logros más importantes del mes, en lenguaje que el cliente entienda. No jerga técnica. Ejemplos:

- "Su negocio aparece ahora en las respuestas de Perplexity cuando alguien busca [categoría] en Madrid."
- "Ha recibido 5 reseñas nuevas con una media de 4.8 estrellas."
- "Hemos corregido 3 inconsistencias en su NAP que afectaban negativamente su posición."

### Sección 5: 3 Acciones para el próximo mes

Tres acciones concretas, priorizadas, que se van a ejecutar el mes siguiente. En lenguaje de operador (para referencia interna) o en lenguaje de cliente (para la reunión). Ejemplos:

- "Publicar 4 posts en GBP orientados a las keywords de temporada."
- "Responder las reseñas pendientes del mes actual."
- "Añadir la FAQ de preguntas frecuentes a la web para mejorar la presencia en IAs."

---

## 5. Regla crítica sobre los datos

> **NUNCA inventar datos del mes anterior. Si no hay datos, decirlo.**

### Primer reporte del cliente

Si es el primer informe y no hay datos comparativos previos:

1. El reporte lo indica explícitamente: *"Este es el primer reporte de [Nombre negocio]. Establecemos aquí la línea base para comparar la evolución en los próximos meses."*
2. Se rellenan únicamente las columnas "Estado actual" sin columna "Mes anterior".
3. El resumen ejecutivo explica que este informe es el punto de partida.

### Reportes sucesivos

Si hay informe del mes anterior disponible en el historial:
- El agente recupera automáticamente esos datos para la comparativa.
- Las variaciones se calculan sobre los datos reales del mes anterior.
- Si un dato del mes anterior falta o es incorrecto, el operador debe corregirlo manualmente antes de ejecutar el agente.

### Si faltan datos del mes actual

Si no se han registrado algunas métricas del mes en curso (ej: posición exacta en Maps no monitorizadas), el agente indica la métrica como "No disponible este mes" en lugar de estimarla o inventarla. El operador puede completar el reporte manualmente si tiene los datos.

---

## 6. Cómo interpretar los resultados

### El reporte como herramienta de retención

- Un reporte con todas las flechas en verde es la mejor herramienta de renovación del contrato.
- Un reporte con algunas flechas en rojo debe ir acompañado de una explicación clara: ¿por qué bajó? ¿qué se va a hacer para corregirlo?
- El objetivo no es que todas las métricas suban siempre (eso no es posible), sino que el cliente vea que hay seguimiento y acción.

### Señales de alerta a detectar en el reporte

| Señal | Significado | Acción |
|-------|-------------|--------|
| Caída de posición Map Pack > 1 puesto | Puede haber competidor nuevo o cambio de algoritmo | Ejecutar `auditor_gbp` y `monitor_ias` |
| Bajada en visitas al perfil GBP > 20% | Cambio en visibilidad o estacionalidad | Revisar si hay penalización |
| 0 reseñas nuevas en 2 meses | El negocio no pide reseñas activamente | Recomendar estrategia de captación de reseñas |
| Sin menciones en IAs después de 3 meses | La entidad no está bien definida | Ejecutar `tldr_entidad` y revisar Schema.org |

---

## 7. Cómo presentarlo al cliente

### Formato de entrega

El reporte se puede presentar de tres formas:

1. **En reunión:** Usar el reporte como guion de la reunión mensual. Ir sección por sección.
2. **Por email:** Exportar el reporte como PDF desde `/admin/historial` y adjuntarlo al email mensual.
3. **Acceso directo:** Si el cliente tiene acceso al panel (en futuras versiones), puede verlo directamente en su área de cliente.

### Cómo explicar las métricas GEO/AEO a clientes no técnicos

Muchos clientes no saben qué es una IA generativa. Usar estas traducciones:

- "Presencia en IAs" → "Que le recomienden cuando alguien le pregunta a la IA de Google o ChatGPT"
- "Schema.org" → "El código que hace que Google entienda perfectamente qué hace su negocio"
- "FAQs GEO" → "Las preguntas frecuentes que los buscadores de IA usan para responder sobre su negocio"
- "Score de voz" → "La probabilidad de que le recomienden cuando alguien hace una búsqueda por voz"

---

## 8. Frecuencia / Programación

| Ejecución | Cuándo |
|-----------|--------|
| Reporte mensual | Último día hábil de cada mes |
| Reporte de onboarding | Al finalizar el mes 1 |
| Reporte bajo demanda | Cuando el cliente lo solicite |

**Tiempo de ejecución:** 1-2 minutos.

**Coste estimado:** ~$0.03-0.08 por reporte (es un agente de síntesis, no de análisis pesado).

---

## 9. Notas y advertencias

- El agente usa los datos disponibles en Supabase. Si los datos del CRM del cliente no se han actualizado con las métricas del mes, el reporte reflejará datos desactualizados. Mantener el CRM al día es responsabilidad del operador.
- Los reportes se guardan en `/admin/historial` con fecha. El agente recupera automáticamente el reporte del mes anterior si existe. No borrar reportes anteriores del historial.
- Si el cliente tiene solo el pack `visibilidad_local`, la sección GEO/AEO del reporte aparecerá con los campos vacíos y una nota indicando que no está incluida en su pack.
- El reporte es una herramienta de comunicación, no solo de análisis. Si el mes fue difícil, es mejor llamar al cliente antes de enviar el reporte que dejar que lo descubra solo.
