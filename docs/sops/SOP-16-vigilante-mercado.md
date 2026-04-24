# SOP-16 — Agente Vigilante de Mercado

**Categoría:** Sistema — Monitorización Autónoma | **Versión:** 1.0 | **Fecha:** Abril 2026

---

## 1. Objetivo

El **Vigilante de Mercado** es el agente de inteligencia estratégica de Radar Local. Su misión es **monitorizar diariamente el entorno externo** — cambios en Google, actualizaciones de IAs, novedades en algoritmos de búsqueda, parches de seguridad — y **proponer adaptaciones al sistema** con aprobación humana obligatoria antes de implementar nada.

El Vigilante existe porque el ecosistema de búsqueda local y búsqueda en IA cambia con mucha frecuencia. Sin monitorización activa, Radar Local puede quedarse desactualizado en semanas. Con el Vigilante, el operador recibe alertas concretas y accionables cada vez que algo relevante ocurre.

**Principio fundamental:** El Vigilante propone, el humano decide. Ninguna propuesta del Vigilante se implementa automáticamente, sin excepción.

---

## 2. Cuándo se activa

### Ejecución automática (modo normal)

El Vigilante se ejecuta **cada día a las 7:00 AM UTC** (9:00 AM en España, horario de verano) mediante un cron job de Vercel. No requiere intervención del operador.

### Ejecución manual (modo bajo demanda)

El operador puede lanzar una ejecución inmediata desde `/admin/vigilante` pulsando el botón **"Ejecutar ahora"**. Usar en estos casos:

- Cuando se ha publicado una noticia importante y se quiere una evaluación inmediata
- Tras un incidente (caída de posiciones, cambio en el comportamiento de un agente)
- Para probar que el sistema funciona correctamente tras una actualización

---

## 3. Arquitectura del sistema

```
Cron Vercel (7AM UTC diario)
  → API Route: /api/cron/vigilante
    → Brave Search API (búsqueda de noticias y cambios)
      → Claude Sonnet (análisis e interpretación)
        → Supabase (almacenamiento de alertas y propuestas)
          → UI /admin/vigilante (revisión por el operador)
            → Notificación Telegram (si impacto Crítico o Importante)
```

El cron está protegido por `CRON_SECRET`. Solo Vercel puede invocarlo directamente. El botón "Ejecutar ahora" de la UI usa el mismo endpoint con autenticación de sesión de administrador.

---

## 4. Fuentes monitorizadas

El Vigilante busca información en estas fuentes a diario:

| Fuente | Tipo | Por qué es relevante |
|--------|------|---------------------|
| Google Business Profile Blog | Oficial | Cambios en políticas GBP, nuevas funciones |
| Google Search Central Blog | Oficial | Actualizaciones de algoritmo, Core Updates |
| Anthropic News y Blog | Oficial | Cambios en modelos Claude que afecten a los agentes |
| Google AI Blog | Oficial | Cambios en AI Overviews, Gemini |
| Search Engine Journal | Especializado | Análisis rápido de cambios en SEO |
| Search Engine Land | Especializado | Noticias de búsqueda local |
| Next.js Releases | Técnico | Nuevas versiones que requieran actualización |
| Supabase Changelog | Técnico | Cambios en la base de datos y APIs |
| GitHub Security Advisories | Seguridad | CVEs que afecten a las dependencias del proyecto |
| AI search trends (Perplexity, ChatGPT) | Tendencias | Cambios en comportamiento de búsqueda en IAs |

---

## 5. Sistema de impacto

Cada alerta tiene asignado un nivel de impacto:

### 🔴 Crítico

**Definición:** Cambio que puede afectar negativamente al sistema o a los clientes de forma inmediata o en los próximos días.

**Ejemplos:**
- Google actualiza las políticas de GBP y puede suspender perfiles que no cumplan
- CVE de seguridad crítica en una dependencia del proyecto (Next.js, Supabase)
- Cambio en la API de Claude que rompe los prompts de los agentes
- Google Core Update que puede afectar las posiciones de los clientes

**Respuesta esperada:** Revisión y decisión en menos de 24 horas. Notificación Telegram inmediata.

### 🟡 Importante

**Definición:** Cambio relevante que requiere planificación y acción en los próximos 5-15 días.

**Ejemplos:**
- Nueva función en GBP que deberíamos implementar para los clientes
- Actualización de modelo Claude con mejoras que podrían beneficiar a los agentes
- Tendencia emergente en búsqueda por IA que debería incorporarse a los agentes GEO/AEO
- Lanzamiento de nueva versión de Next.js con mejoras de rendimiento

**Respuesta esperada:** Revisión en 2-3 días, planificación de implementación.

### 🟢 Info

**Definición:** Cambio o noticia sin impacto inmediato. Solo registro para contexto y tendencias.

**Ejemplos:**
- Artículo de análisis sobre tendencias de búsqueda local
- Anuncio de funciones futuras de Google aún no disponibles
- Actualización menor de dependencias sin cambios breaking

**Respuesta esperada:** Solo registrar. Revisar en el ciclo semanal de lectura de alertas.

---

## 6. Tipos de propuesta que puede generar

El Vigilante no solo alerta: cuando detecta algo relevante, genera una **propuesta concreta de adaptación**. Hay cinco tipos:

| Tipo | Qué es | Ejemplo |
|------|--------|---------|
| `knowledge` | Actualizar el conocimiento base de los agentes | "Google ha cambiado el peso de las keywords en la descripción GBP — actualizar el prompt de `auditor_gbp`" |
| `prompt` | Modificar las instrucciones de un agente específico | "Añadir instrucción a `creador_faq_geo` para usar el nuevo formato de preguntas que prefiere Google AI Overviews" |
| `code` | Cambio en el código del proyecto | "Actualizar Next.js de 15.1 a 15.2 para corregir vulnerabilidad XSS" |
| `config` | Cambio en configuración o variables de entorno | "Brave Search API ha cambiado el endpoint de búsqueda de noticias" |
| `manual` | Acción que requiere intervención humana fuera del código | "Revisar que todos los perfiles GBP de clientes tienen activada la nueva función de reservas" |

---

## 7. Flujo HITL (Human in the Loop)

Todas las propuestas del Vigilante siguen este flujo de estados:

```
pending → analysed → [aprobado | descartado | pospuesto] → implementado
```

| Estado | Significado |
|--------|-------------|
| `pending` | El Vigilante detectó algo. Pendiente de análisis por el operador |
| `analysed` | El operador ha revisado la alerta y la propuesta |
| `aprobado` | El operador aprueba la propuesta. Se puede implementar |
| `descartado` | El operador considera que no es relevante o que no aplica |
| `pospuesto` | Relevante pero se implementará más adelante. Queda en cola |
| `implementado` | La propuesta ha sido ejecutada y el cambio está activo |

**Regla absoluta:** Ninguna propuesta pasa a `implementado` sin pasar por `aprobado`. El sistema nunca implementa nada de forma autónoma.

---

## 8. Cómo revisar en `/admin/vigilante`

### Estructura del panel

- **Filtros:** Por estado (pending / aprobado / etc.), por nivel de impacto (🔴/🟡/🟢), por tipo de propuesta, por fecha.
- **Tarjetas de alerta:** Cada alerta tiene su tarjeta expandible con:
  - Nivel de impacto (color e icono)
  - Fuente de la noticia
  - Resumen del cambio detectado
  - Propuesta concreta (qué hacer)
  - Tipo de propuesta (`knowledge`, `prompt`, `code`, etc.)
  - Diff o detalle de los cambios propuestos (expandible)
  - Botones de acción

### Botones de acción

| Botón | Acción | Cuándo usarlo |
|-------|--------|---------------|
| **Aprobar** | Marca como `aprobado`. Confirma que hay que implementar | Cuando la propuesta es correcta y hay que actuar |
| **Posponer** | Marca como `pospuesto` con fecha opcional | Cuando es relevante pero no urgente |
| **Descartar** | Marca como `descartado` con motivo opcional | Cuando no aplica, es un falso positivo, o ya está implementado |

### Flujo de revisión recomendado

**Revisión diaria (5-10 minutos):**
1. Abrir `/admin/vigilante`.
2. Filtrar por `pending` + nivel `🔴 Crítico`.
3. Atender cualquier alerta crítica de inmediato.
4. Filtrar por `pending` + nivel `🟡 Importante`.
5. Revisar las alertas importantes, aprobar o posponer según urgencia.
6. Las alertas `🟢 Info` pueden revisarse semanalmente.

---

## 9. Notificaciones Telegram

El Vigilante envía notificaciones automáticas por Telegram **solo para alertas de nivel Crítico e Importante**.

**Bot:** @radarlocalmadrid_bot

**Formato del mensaje Telegram:**

```
🔴 [CRÍTICO] Radar Local — Vigilante de Mercado

Fuente: Google Search Central Blog
Resumen: Google ha publicado un Core Update que puede afectar las posiciones de búsqueda local.

Propuesta: Ejecutar `auditor_gbp` en todos los clientes activos en los próximos 3 días para detectar caídas.

Tipo: manual

→ Revisar en /admin/vigilante
```

Las alertas `🟢 Info` **no generan notificación Telegram** para no saturar el canal con información no urgente.

---

## 10. Configuración y variables de entorno requeridas

El Vigilante necesita estas variables de entorno correctamente configuradas en Vercel y en `.env.local`:

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `BRAVE_SEARCH_API_KEY` | API key de Brave Search para las búsquedas de noticias | brave.com/search/api |
| `CRON_SECRET` | Secret para autenticar el cron de Vercel | Generarla aleatoriamente, añadir en Vercel Settings |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram | @BotFather en Telegram |
| `TELEGRAM_CHAT_ID` | ID del chat o canal donde llegan las alertas | Obtener con @userinfobot |
| `RADAR_ANTHROPIC_KEY` | API key de Claude (ya configurada en el sistema) | Anthropic Console |

**Cómo verificar que el cron está activo en Vercel:**
1. Vercel Dashboard → proyecto → Settings → Cron Jobs.
2. Debe aparecer el job `/api/cron/vigilante` con horario `0 7 * * *` (7AM UTC diario).
3. Si no aparece, revisar `vercel.json` en el repositorio.

---

## 11. Frecuencia / Programación

| Ejecución | Cuándo | Quién la dispara |
|-----------|--------|-----------------|
| Automática diaria | 7:00 AM UTC (9:00 AM España verano) | Cron Vercel |
| Manual bajo demanda | Cuando el operador lo necesite | Botón "Ejecutar ahora" en `/admin/vigilante` |

**Duración de cada ejecución:** 1-3 minutos (búsquedas en Brave Search + análisis con Claude).

**Coste estimado por ejecución:** ~$0.02-0.05 (búsqueda + análisis Claude). Coste mensual del cron automático: ~$0.60-1.50.

---

## 12. Notas y advertencias

- El Vigilante monitoriza el entorno externo, no el rendimiento de los clientes. Para eso están los agentes de análisis habituales.
- Si el cron no ejecuta en varios días (visible en el log de Vercel), verificar que `CRON_SECRET` y `BRAVE_SEARCH_API_KEY` son válidas.
- Las alertas `pending` acumuladas más de 7 días sin revisión indican que el operador no está monitorizando el Vigilante. Conviene hacer una revisión semanal mínima.
- El Vigilante puede generar falsos positivos, especialmente con fuentes de noticias generalistas. Si una alerta no es relevante, descartarla con motivo. Esto ayuda a ajustar el sistema a largo plazo.
- Las propuestas de tipo `code` son las únicas que requieren intervención técnica en el repositorio. Las de tipo `knowledge` y `prompt` se aplican desde el panel de Radar Local sin tocar código.
- Si el bot de Telegram deja de enviar mensajes, verificar que `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` son correctos y que el bot no ha sido bloqueado o eliminado del canal.
