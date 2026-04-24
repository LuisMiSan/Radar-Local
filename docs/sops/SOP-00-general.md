# SOP-00 — General del Sistema Radar Local

**Categoría:** Sistema | **Versión:** 1.0 | **Fecha:** Abril 2026

---

## 1. Objetivo

Radar Local es un **SaaS de posicionamiento local con IA** diseñado para negocios físicos en España. Su misión es maximizar la visibilidad del negocio en dos frentes complementarios que hoy determinan cómo los clientes encuentran un negocio:

- **Map Pack (SEO local clásico):** La franja de 3 resultados locales que Google muestra en la parte superior de las búsquedas con intención local. Capta tráfico cualificado de clientes que buscan activamente el servicio.
- **GEO/AEO (Generative Engine Optimization / Answer Engine Optimization):** La presencia del negocio en las respuestas de IAs generativas como ChatGPT, Perplexity, Google AI Overviews, Gemini y búsqueda por voz. Capta visibilidad en el nuevo modelo de búsqueda donde una IA responde directamente en lugar de listar resultados.

Radar Local integra **13 agentes IA** (Claude Sonnet) que analizan, optimizan y monitorizan ambos frentes de forma coordinada desde un único panel de operación.

---

## 2. Los dos pilares

### Pilar 1: Map Pack (SEO local clásico)

Trabaja sobre las señales que el algoritmo local de Google evalúa para decidir qué negocios aparecen en el Map Pack:

- **Relevancia:** ¿Qué tan bien coincide el perfil GBP con lo que busca el usuario?
- **Proximidad:** ¿Qué tan cerca está el negocio del usuario que busca?
- **Prominencia:** ¿Qué tan conocido y valorado es el negocio online?

Los agentes Map Pack trabajan sobre: ficha GBP, coherencia NAP, keywords locales, reseñas, posts y contenido.

### Pilar 2: GEO/AEO (presencia en IAs generativas)

Trabaja sobre las señales que las IAs usan para decidir si citar o recomendar un negocio en sus respuestas:

- **Entidad bien definida:** ¿Están claros el nombre, categoría, ubicación, especialización y contexto del negocio?
- **Datos estructurados:** ¿Tiene Schema.org correcto para que las IAs lo entiendan?
- **Contenido en formato IA:** ¿Tiene FAQs, chunks de contenido y lenguaje natural que las IAs puedan citar?
- **Monitorización activa:** ¿Aparece ya en respuestas de IAs? ¿Qué dice de él?

---

## 3. Los dos packs y sus agentes

### Pack `visibilidad_local` — Posicionamiento en Google Maps

Incluye los **5 agentes Map Pack**. Orientado a negocios que quieren mejorar su posición en el Map Pack de Google.

| Agente | Función |
|--------|---------|
| `auditor_gbp` | Audita el estado completo del perfil Google Business Profile |
| `optimizador_nap` | Verifica y corrige la coherencia NAP (Nombre, Dirección, Teléfono) en la web |
| `keywords_locales` | Genera estrategia de keywords con intención local para el negocio |
| `gestor_resenas` | Analiza reseñas y genera respuestas optimizadas para SEO local |
| `redactor_posts_gbp` | Redacta posts para publicar en Google Business Profile |

### Pack `autoridad_maps_ia` — Posicionamiento completo (Maps + IAs)

Incluye **todos los agentes**: los 5 de Map Pack + los 5 de GEO/AEO + Reporte. El pack completo.

| Agente | Función |
|--------|---------|
| `auditor_gbp` | Audita el perfil GBP |
| `optimizador_nap` | Verifica coherencia NAP |
| `keywords_locales` | Estrategia de keywords locales |
| `gestor_resenas` | Gestión de reseñas |
| `redactor_posts_gbp` | Posts para GBP |
| `tldr_entidad` | Define la entidad del negocio para IAs |
| `generador_schema` | Genera código Schema.org |
| `creador_faq_geo` | Crea FAQs optimizadas para búsqueda en IAs |
| `generador_chunks` | Genera chunks de contenido para citación por IAs |
| `monitor_ias` | Monitoriza menciones del negocio en IAs |
| `generador_reporte` | Genera el reporte mensual ejecutivo |

### Agentes de sistema (disponibles para todos)

| Agente | Función |
|--------|---------|
| `supervisor` | Orquesta la ejecución de todos los agentes en secuencia (ver SOP-13) |
| `prospector_web` | Audita webs de prospectos y genera propuestas de captación (ver SOP-14) |
| `vigilante_mercado` | Monitorización diaria autónoma de cambios externos (ver SOP-16) |

---

## 4. Arquitectura del sistema

```
Frontend: Next.js 15 (App Router) + React
Base de datos: Supabase (PostgreSQL)
Deploy: Vercel (frontend + API routes + cron jobs)
IA: Claude API (claude-sonnet) via RADAR_ANTHROPIC_KEY
Email: Resend
Alertas: Telegram Bot (@radarlocalmadrid_bot)
```

**Flujo de datos:**

```
CRM (clientes en Supabase)
  → Panel /admin/agentes (selección de cliente + agente)
    → API Route Next.js (procesa con Claude)
      → Resultado guardado en Supabase (historial)
        → Visible en /admin/historial y /admin/tareas
```

---

## 5. Flujo de trabajo para un cliente nuevo

### Fase 1: Onboarding (día 1)

1. **Alta en CRM** (`/admin/clientes`): nombre del negocio, categoría, dirección, teléfono, web, email, pack contratado.
2. **Datos GBP**: añadir URL del perfil Google Business Profile del cliente.
3. **Revisión inicial**: comprobar que todos los campos obligatorios están completos antes de ejecutar agentes.

### Fase 2: Análisis inicial completo (día 1-2)

4. **Ir a `/admin/agentes`**: panel izquierdo → seleccionar cliente → panel derecho → seleccionar agente `supervisor`.
5. **Ejecutar el Supervisor**: genera el análisis completo de todos los agentes en 3-8 minutos (ver SOP-13).
6. **Revisar resultados** en `/admin/historial`: leer el análisis consolidado y el reporte ejecutivo.

### Fase 3: Implementación (semana 1-2)

7. **Revisar tareas generadas** en `/admin/tareas`: los agentes generan acciones concretas ordenadas por prioridad.
8. **Implementar en GBP**: usar las recomendaciones del `auditor_gbp` para optimizar el perfil.
9. **Actualizar web del cliente**: aplicar correcciones NAP, añadir Schema.org, publicar FAQs y chunks de contenido.
10. **Subir posts a GBP**: publicar los posts generados por `redactor_posts_gbp`.
11. **Responder reseñas**: usar las respuestas generadas por `gestor_resenas`.

### Fase 4: Verificación (fin de semana 2)

12. **Ejecutar `monitor_ias`**: comprobar si el negocio ya aparece en respuestas de IAs.
13. **Documentar el baseline**: el estado inicial del cliente (posición en Maps, score GBP, presencia en IAs) queda registrado para comparar mes a mes.

---

## 6. Flujo mensual recurrente por cliente

Cada mes, para cada cliente activo:

| Semana | Acción | Agente |
|--------|--------|--------|
| 1 | Publicar nuevo post en GBP | `redactor_posts_gbp` |
| 1-2 | Responder reseñas nuevas del mes | `gestor_resenas` |
| 2-3 | Revisar si hay cambios en keywords | `keywords_locales` |
| 3-4 | Monitorizar presencia en IAs | `monitor_ias` |
| Último día | Generar reporte mensual | `generador_reporte` |
| Último día | Reunión/envío de reporte al cliente | — |

**Ciclo de auditoría completa:** Cada 3 meses ejecutar el Supervisor completo para detectar deriva o nuevas oportunidades.

---

## 7. Panel de agentes: cómo navegar y ejecutar

### Acceso
Ir a `/admin/agentes` en el panel de administración.

### Estructura del panel
- **Panel izquierdo:** Lista de clientes activos. Clicar para seleccionar el cliente sobre el que trabajar.
- **Panel derecho:** Lista de agentes disponibles para el cliente seleccionado. Muestra el agente, su descripción y el botón de ejecución.

### Ejecución de un agente
1. Seleccionar cliente en el panel izquierdo.
2. Seleccionar el agente en el panel derecho.
3. Revisar los parámetros si los hay (algunos agentes piden URL, fecha, etc.).
4. Pulsar **"Ejecutar agente"**.
5. Esperar el resultado (aparece en pantalla y se guarda en historial automáticamente).

### Buenas prácticas
- Ejecutar un agente a la vez para no saturar la API.
- Si el resultado es inesperado, revisar que los datos del cliente en CRM estén completos.
- Guardar siempre el resultado antes de ejecutar el mismo agente de nuevo (el historial lo guarda automáticamente).

---

## 8. Dónde van los resultados

### `/admin/historial`
Todos los resultados de ejecuciones de agentes, ordenados por fecha. Filtrable por cliente y por agente. Cada entrada muestra:
- Fecha y hora de ejecución
- Cliente
- Agente ejecutado
- Resultado completo (expandible)
- Acciones generadas

### `/admin/tareas`
Las acciones concretas extraídas de los resultados de los agentes. Cada tarea tiene:
- Descripción de la acción
- Prioridad (alta / media / baja)
- Agente que la generó
- Estado (pendiente / en progreso / completada)
- Cliente asociado

---

## 9. Supervisor vs. ejecución manual

| Situación | Recomendación |
|-----------|---------------|
| Cliente nuevo — mes 1 | Supervisor (análisis completo) |
| Auditoría trimestral | Supervisor |
| Antes de reunión con cliente | Supervisor |
| Actualización mensual de posts | `redactor_posts_gbp` individual |
| Responder reseñas nuevas | `gestor_resenas` individual |
| Cambio de dirección o teléfono | `optimizador_nap` individual |
| Comprobar presencia en IAs | `monitor_ias` individual |
| Generar reporte de cierre de mes | `generador_reporte` individual |

Usar el Supervisor cuando se necesita el panorama completo. Usar agentes individuales para actualizaciones puntuales y eficiencia de tokens/coste.

---

## 10. El Agente Vigilante

El **Vigilante de Mercado** es un agente autónomo diferente al resto: no actúa sobre un cliente específico, sino sobre el sistema en su conjunto.

**Qué monitoriza:**
- Cambios en Google GBP (actualizaciones de políticas, nuevas funciones)
- Noticias de Anthropic y Google AI que afecten a los agentes
- Cambios en algoritmos de búsqueda local
- Lanzamientos de Next.js, Supabase u otras dependencias críticas
- Tendencias emergentes en búsqueda por IA
- CVEs de seguridad relevantes

**Cómo funciona:**
Se ejecuta automáticamente cada día a las 7AM UTC (cron de Vercel). Cuando detecta algo relevante, crea una propuesta en `/admin/vigilante` y envía notificación por Telegram si es crítico o importante.

**Flujo de aprobación (HITL):**
Ninguna propuesta del Vigilante se implementa automáticamente. El operador debe revisar, aprobar, posponer o descartar cada propuesta en `/admin/vigilante`.

Ver SOP-16 para el proceso completo.

---

## 11. Tabla resumen de todos los agentes

| ID | Nombre | Categoría | Pack | Frecuencia recomendada |
|----|--------|-----------|------|----------------------|
| 01 | `auditor_gbp` | Map Pack | visibilidad_local / autoridad_maps_ia | Mensual + onboarding |
| 02 | `optimizador_nap` | Map Pack | visibilidad_local / autoridad_maps_ia | Mensual o al cambiar datos |
| 03 | `keywords_locales` | Map Pack | visibilidad_local / autoridad_maps_ia | Trimestral |
| 04 | `gestor_resenas` | Map Pack | visibilidad_local / autoridad_maps_ia | Semanal / quincenal |
| 05 | `redactor_posts_gbp` | Map Pack | visibilidad_local / autoridad_maps_ia | Semanal / mensual |
| 06 | `tldr_entidad` | GEO/AEO | autoridad_maps_ia | Onboarding + cambios relevantes |
| 07 | `generador_schema` | GEO/AEO | autoridad_maps_ia | Onboarding + cambios de web |
| 08 | `creador_faq_geo` | GEO/AEO | autoridad_maps_ia | Trimestral |
| 09 | `generador_chunks` | GEO/AEO | autoridad_maps_ia | Trimestral |
| 10 | `monitor_ias` | GEO/AEO | autoridad_maps_ia | Mensual |
| 11 | `generador_reporte` | Reporte | autoridad_maps_ia | Mensual (último día) |
| 12 | `prospector_web` | Captación | Sistema (no requiere pack) | Por demanda (prospección) |
| 13 | `supervisor` | Sistema | Sistema (requiere pack activo) | Onboarding + trimestral |
| — | `vigilante_mercado` | Sistema | Sistema (autónomo) | Diario (cron automático) |

---

## 12. Notas y advertencias

- **RADAR_ANTHROPIC_KEY** es la variable de entorno correcta para la API de Claude. No usar `ANTHROPIC_API_KEY` (está vacía en el sistema).
- Los agentes de GEO/AEO requieren que el negocio tenga web propia. Sin web, los agentes de Schema, FAQs y chunks no pueden implementarse.
- El coste en tokens de Claude por ejecución individual de un agente oscila entre $0.01 y $0.05. El Supervisor completo cuesta ~$0.15-0.25.
- Los resultados se guardan automáticamente en Supabase. No hay que exportar manualmente nada a menos que se quiera compartir con el cliente.
- Para errores de port 3000 zombie en desarrollo: matar con PowerShell `Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess`.
