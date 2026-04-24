# SOP-13 — Agente Supervisor

**Categoría:** Sistema | **Versión:** 1.0 | **Fecha:** Abril 2026

---

## 1. Objetivo

El **Supervisor** es el agente orquestador de Radar Local. Su misión es **ejecutar todos los agentes de análisis en la secuencia óptima** para un cliente, generando un análisis 360° completo del estado de su posicionamiento local en un único paso.

En lugar de ejecutar 11 agentes uno a uno (con el coste de tiempo y atención que implica), el Supervisor los encadena automáticamente, pasando los outputs relevantes de cada agente como contexto al siguiente, y finaliza con un reporte ejecutivo consolidado.

El Supervisor no es un agente de análisis en sí mismo: es el director de orquesta que coordina a los demás.

---

## 2. Cuándo ejecutar

### Usar el Supervisor

| Situación | Razón |
|-----------|-------|
| **Cliente nuevo — mes 1** | Análisis completo de punto de partida (baseline) |
| **Auditoría trimestral** | Revisión profunda del estado del posicionamiento |
| **Antes de reunión de revisión** | Tener todos los datos frescos y consolidados |
| **Cambio mayor en el negocio** | Nuevo local, cambio de nombre, nueva categoría, etc. |
| **Después de penalización o caída** | Diagnóstico completo para identificar la causa |

### Usar agentes individuales (NO el Supervisor)

| Situación | Agente a usar |
|-----------|---------------|
| Publicar el post mensual | `redactor_posts_gbp` |
| Responder reseñas nuevas | `gestor_resenas` |
| Actualizar NAP por cambio de datos | `optimizador_nap` |
| Generar el reporte de cierre de mes | `generador_reporte` |
| Revisar presencia en IAs este mes | `monitor_ias` |
| Comprobar algo específico | El agente correspondiente |

**Regla de oro:** El Supervisor es para análisis completos y auditorías. Los agentes individuales son para operaciones de mantenimiento mensual. Usar el Supervisor mensualmente en todos los clientes sería excesivo en coste y tiempo.

---

## 3. Cómo ejecutar (paso a paso)

1. Ir a `/admin/agentes`.
2. Seleccionar el cliente en el panel izquierdo.
3. En el panel derecho, localizar el agente **"Supervisor"**.
4. Verificar que el perfil del cliente tiene todos los datos completos:
   - Nombre del negocio
   - Categoría
   - Dirección completa
   - Teléfono
   - URL del perfil GBP
   - URL de la web (si tiene)
   - Pack contratado (debe ser `autoridad_maps_ia` para el análisis completo)
5. Pulsar **"Ejecutar Supervisor"**.
6. **Esperar** — el proceso tarda entre 3 y 8 minutos. No cerrar la ventana ni navegar a otra sección durante la ejecución.
7. Al finalizar, el resultado aparece en pantalla y queda guardado en `/admin/historial`.

> **Nota:** Si la ejecución se interrumpe a mitad (timeout de red, cierre de ventana), revisar en `/admin/historial` hasta qué agente llegó. Puede ejecutarse el Supervisor de nuevo o completar manualmente los agentes que faltaron.

---

## 4. Orden de ejecución interno

El Supervisor ejecuta los agentes en este orden específico, diseñado para que cada agente tenga el contexto del anterior:

```
1.  auditor_gbp          → Estado del perfil GBP
2.  optimizador_nap      → Coherencia de datos en la web
3.  keywords_locales     → Keywords objetivo identificadas
4.  gestor_resenas       → Análisis de reputación y reseñas
5.  redactor_posts_gbp   → Posts de GBP generados
6.  tldr_entidad         → Definición de la entidad para IAs
7.  generador_schema     → Schema.org generado
8.  creador_faq_geo      → FAQs para motores IA
9.  generador_chunks     → Chunks de contenido para citación
10. monitor_ias          → Estado de presencia en IAs
11. generador_reporte    → Reporte ejecutivo consolidado
```

**Por qué este orden:**
- Los agentes Map Pack van primero porque establecen el contexto base del negocio.
- Los agentes GEO/AEO van después porque algunos usan el output de keywords y el TLDR de entidad.
- El reporte va al final porque consolida todos los análisis anteriores.

---

## 5. Tiempo y coste estimado

| Parámetro | Valor estimado |
|-----------|---------------|
| Tiempo total | 3 — 8 minutos |
| Llamadas a Claude | 11 (una por agente) |
| Coste en tokens | ~$0.15 — $0.25 por ejecución |
| Coste mensual (1 vez/cliente) | ~$1.50 — $2.50 por 10 clientes |

El coste varía según la cantidad de datos del cliente (más datos en CRM = prompts más ricos = más tokens) y la longitud de los outputs de cada agente.

---

## 6. Qué genera (salida)

El Supervisor genera un **análisis consolidado** con dos partes:

### 6.1 Resultados por agente

Cada agente deja su output en el análisis. Para un análisis completo, el resultado incluye:

- Diagnóstico del perfil GBP (completitud, errores, oportunidades)
- Informe de coherencia NAP
- Lista de keywords locales prioritarias
- Análisis de reseñas + respuestas generadas
- Posts de GBP listos para publicar
- TLDR de entidad (texto para web y GBP)
- Código Schema.org listo para implementar
- FAQs en formato JSON para la web
- Chunks de contenido para publicar
- Reporte de presencia en IAs (si aparece, qué dice, cómo mejorar)

### 6.2 Reporte ejecutivo final

Al terminar, `generador_reporte` compila un reporte ejecutivo que incluye:

- Resumen en 3 líneas del estado actual
- Score de posicionamiento Map Pack (0-100)
- Score de presencia GEO/AEO (0-100)
- Los 3 problemas más urgentes
- Las 3 acciones prioritarias del próximo mes
- Comparativa con el baseline anterior (si existe)

---

## 7. Cómo interpretar y usar los resultados

### Inmediatamente tras la ejecución

1. **Leer el reporte ejecutivo final** — Es el resumen ejecutivo. Da una visión clara del estado general en 2 minutos.
2. **Revisar los 3 problemas más urgentes** — Son la prioridad de implementación inmediata.
3. **Ir a `/admin/tareas`** — El Supervisor genera las tareas concretas ordenadas por prioridad.

### En los días siguientes

4. **Implementar acciones Map Pack** (semana 1):
   - Actualizar perfil GBP según recomendaciones del `auditor_gbp`
   - Corregir NAP en web según `optimizador_nap`
   - Responder reseñas pendientes con los textos de `gestor_resenas`
   - Publicar los posts en GBP

5. **Implementar acciones GEO/AEO** (semana 2):
   - Añadir Schema.org a la web del cliente
   - Publicar FAQs en la web
   - Publicar chunks de contenido
   - Actualizar el TLDR de entidad en GBP y web

6. **Seguimiento** (mes siguiente):
   - Ejecutar `monitor_ias` para ver si la presencia en IAs ha mejorado
   - Ejecutar `generador_reporte` al final del mes para comparar con el baseline

---

## 8. Frecuencia / Programación

| Tipo de ejecución | Frecuencia |
|-------------------|-----------|
| Cliente nuevo (onboarding) | Una vez en el mes 1 |
| Auditoría regular | Cada 3 meses |
| Antes de reunión de revisión | Según necesidad |
| Incidencia / caída de posición | Inmediatamente al detectar |

No hay cron automático para el Supervisor. Siempre se ejecuta manualmente desde `/admin/agentes`.

---

## 9. Notas y advertencias

- El Supervisor requiere que el cliente tenga el pack `autoridad_maps_ia` activo. Con el pack `visibilidad_local` solo se ejecutarán los 5 agentes Map Pack.
- Si el cliente no tiene web propia, los agentes `generador_schema`, `creador_faq_geo` y `generador_chunks` generarán el contenido igualmente, pero el operador deberá indicar dónde implementarlo (pueden ir en un microsite o directamente en GBP).
- Si un agente individual falla dentro del flujo del Supervisor, el proceso continúa con los siguientes. El agente fallido aparecerá marcado en el resultado con el error. Se puede re-ejecutar ese agente de forma individual.
- Los posts y FAQs generados son borradores que deben revisarse antes de publicar. El Supervisor genera, el operador aprueba e implementa.
- Nunca ejecutar el Supervisor dos veces seguidas para el mismo cliente sin revisar el primero: duplica costes y genera resultados redundantes.
