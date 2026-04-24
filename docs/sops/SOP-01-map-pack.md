# SOP-01 — Categoría Map Pack

**Categoría:** Map Pack | **Versión:** 1.0 | **Fecha:** Abril 2026

---

## 1. Objetivo

Gestionar la visibilidad del negocio cliente en el **Google Map Pack** (los 3 resultados locales que aparecen en Google antes de los resultados orgánicos). Esta posición captura el **36% del peso del ranking local** según los estudios de Whitespark y BrightLocal y es la fuente de tráfico cualificado más rentable para negocios físicos.

Un negocio en el Map Pack aparece:
- En las búsquedas escritas con intención local ("fisioterapeuta Madrid centro")
- En las respuestas de Google Maps
- En las respuestas de voz de dispositivos Android y Google Nest vía Gemini
- En los resultados de Shopping local para negocios con catálogo

Los 5 agentes de esta categoría trabajan en cadena para construir y mantener las señales de relevancia, proximidad y prominencia que el algoritmo local de Google evalúa.

---

## 2. Cuándo ejecutar

Esta categoría se ejecuta en dos momentos clave:

**Onboarding (mes 1):** Ejecutar los 5 agentes en orden secuencial para establecer el baseline del cliente. Es el diagnóstico completo de punto de partida.

**Mantenimiento recurrente:** Cada agente tiene su propia frecuencia (ver sección 7). En general, la categoría completa se revisa trimestralmente, con ejecuciones puntuales de agentes específicos cuando hay cambios en el negocio o nuevos contenidos.

---

## 3. Cómo ejecutar (paso a paso en el panel de agentes)

### Paso 0 — Verificar datos del cliente en CRM

Antes de ejecutar cualquier agente, confirmar que el cliente tiene estos datos completos en el CRM:
- Nombre exacto del negocio (como aparece en GBP)
- Dirección completa con código postal
- Teléfono con prefijo nacional
- Web oficial
- Categoría principal de negocio
- Servicios/productos que ofrece
- Barrio o zona de influencia
- Pack contratado (`visibilidad_local` o `autoridad_maps_ia`)

### Paso 1 — Auditor GBP

**Agente:** `auditor_gbp`

Ejecutar primero. Audita el estado actual del perfil GBP y produce el score de partida. Todo lo que detecte como problema es input directo para los agentes siguientes.

- Acceder a `/admin/agentes`
- Seleccionar cliente en el panel izquierdo
- Seleccionar agente `auditor_gbp`
- Revisar el JSON de salida: anotar el score y los problemas críticos
- **Tiempo estimado:** 2-3 minutos

### Paso 2 — Optimizador NAP

**Agente:** `optimizador_nap`

Verifica la consistencia del NAP (Nombre, Dirección, Teléfono) en los directorios online. Ejecutar antes de crear contenido para que el contenido nuevo use el formato canónico correcto.

- Seleccionar agente `optimizador_nap`
- El agente necesita: NAP actual según GBP + lista de directorios donde está dado de alta el cliente
- Revisar el JSON de salida: % de consistencia y lista de inconsistencias con pasos de corrección
- **Tiempo estimado:** 2-3 minutos

### Paso 3 — Keywords Locales

**Agente:** `keywords_locales`

Descubre las keywords que activan Map Pack, voz e IA para ese negocio concreto en su zona. Los resultados alimentan directamente los agentes de contenido (Gestor Reseñas y Redactor Posts GBP).

- Seleccionar agente `keywords_locales`
- El agente necesita: sector, servicios, barrios de influencia
- Guardar el JSON de salida: se usará en los pasos 4 y 5
- **Tiempo estimado:** 2-3 minutos

### Paso 4 — Gestor Reseñas

**Agente:** `gestor_resenas`

Analiza las reseñas existentes, genera respuestas optimizadas y crea una estrategia de captación. Usa las keywords del paso 3 para asegurar que las respuestas contienen las entidades correctas.

- Seleccionar agente `gestor_resenas`
- Input necesario: reseñas existentes (copiar texto de GBP), respuestas del dueño anteriores (para análisis de tono)
- Revisar el JSON: perfil de voz + respuestas generadas + estrategia de captación
- **Tiempo estimado:** 3-5 minutos

### Paso 5 — Redactor Posts GBP

**Agente:** `redactor_posts_gbp`

Genera el calendario de posts GBP del mes usando las keywords del paso 3. Es el último agente porque integra todos los datos anteriores (score del perfil, NAP correcto, keywords validadas, tono del negocio).

- Seleccionar agente `redactor_posts_gbp`
- Input necesario: servicios del mes, promociones activas, eventos locales si los hay
- Revisar el JSON: array de posts con fecha sugerida, tipo y texto listo para publicar
- **Tiempo estimado:** 3-5 minutos

---

## 4. Qué genera (salida)

Cada agente genera su propio JSON. El resultado consolidado de la categoría Map Pack es:

| Agente | Entregable principal |
|---|---|
| Auditor GBP | Score 0-100 + lista de problemas priorizados |
| Optimizador NAP | % consistencia + inconsistencias con pasos de corrección |
| Keywords Locales | 3 bloques de keywords (Map Pack, voz, geo) |
| Gestor Reseñas | Respuestas listas + estrategia de captación |
| Redactor Posts GBP | Calendar mensual de posts listos para publicar |

---

## 5. Cómo interpretar los resultados

### Score general de la categoría

Construir un score compuesto ponderando:
- Score GBP (40% del peso — es el factor más crítico)
- % consistencia NAP (20%)
- Cobertura de keywords (20%)
- Calidad de reseñas (20%)

### Semáforo de estado

| Rango | Estado | Acción |
|---|---|---|
| 0-40 | Rojo — Crítico | Atención inmediata, el negocio tiene problemas graves de visibilidad |
| 41-70 | Amarillo — Mejorable | Trabajo activo, hay ganancias rápidas disponibles |
| 71-100 | Verde — Optimizado | Mantenimiento, foco en superar a la competencia |

---

## 6. Acciones post-ejecución

1. **Implementar correcciones GBP** según prioridades del Auditor (el operador accede a GBP y aplica los cambios)
2. **Corregir NAP** en los directorios marcados como inconsistentes (proceso manual por plataforma)
3. **Publicar posts** generados por el Redactor (copiar en GBP, uno por semana)
4. **Responder reseñas** usando las respuestas generadas por el Gestor (copiar en GBP)
5. **Actualizar CRM** con el score baseline y fecha de ejecución
6. **Programar próxima ejecución** según frecuencia de cada agente

---

## 7. Frecuencia recomendada

| Agente | Frecuencia base | Ejecutar también cuando... |
|---|---|---|
| Auditor GBP | Trimestral | Cambio en GBP, caída de posición |
| Optimizador NAP | Trimestral | Cambio de dirección, teléfono o nombre |
| Keywords Locales | Trimestral | Nuevos servicios, nueva zona de cobertura |
| Gestor Reseñas | Mensual | Reseña negativa recibida |
| Redactor Posts GBP | Mensual | Siempre — genera el calendario del mes |

---

## 8. Notas y advertencias

**Acceso por pack:**
- Pack `visibilidad_local`: acceso completo a los 5 agentes Map Pack
- Pack `autoridad_maps_ia`: acceso completo a todos los agentes (Map Pack + los 6 adicionales de autoridad)

**Importante:**
- Los agentes NO acceden a internet. Toda la información se introduce manualmente desde el CRM o copiando datos de las plataformas externas.
- El orden de ejecución importa: Auditor GBP y Keywords Locales deben ejecutarse antes que los agentes de contenido.
- Si el cliente no tiene GBP verificado, el Auditor GBP no puede funcionar correctamente. Verificar GBP es paso previo obligatorio.
- Los posts generados deben publicarse manualmente en GBP — el agente genera el contenido, el operador publica.
- Para Reseñas: nunca responder de manera genérica. Siempre usar las respuestas generadas por el agente, que ya incorporan el tono del dueño.
