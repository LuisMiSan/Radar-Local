# SOP-02 — Auditor GBP

**Categoría:** Map Pack | **Versión:** 1.0 | **Fecha:** Abril 2026

---

## 1. Objetivo

Auditar el perfil de Google Business Profile (GBP) del cliente y detectar todos los problemas que impiden aparecer en el **Map Pack** y en las **respuestas de voz de Gemini**. El perfil GBP representa el **36% del peso del ranking local** — es el factor individual más importante de todo el sistema.

Un perfil GBP mal optimizado hace que todo lo demás importe poco: Google no muestra en Map Pack negocios cuyo perfil no transmite confianza y completitud. Gemini, además, extrae entidades del perfil para decidir a qué negocios recomienda en búsquedas de voz y en Google AI Overviews.

La auditoría produce un **score de 0 a 100** y una lista de problemas priorizados por impacto. Es siempre el primer agente a ejecutar para cualquier cliente nuevo.

---

## 2. Cuándo ejecutar

- **Mes 1 (baseline obligatorio):** Primera ejecución para todo cliente nuevo. Establece el punto de partida y define el plan de acción inicial.
- **Tras cualquier cambio en GBP:** Si el cliente modifica horarios, añade fotos, cambia categorías, edita descripción o recibe una sugerencia de usuario aceptada por Google.
- **Mínimo trimestral:** Google puede actualizar el perfil automáticamente con datos de terceros. Auditar para detectar cambios no autorizados.
- **Tras caída de posición en Map Pack:** Si el cliente deja de aparecer o baja posiciones, el Auditor GBP es el primer diagnóstico.

---

## 3. Cómo ejecutar (paso a paso en el panel de agentes)

### Paso 1 — Recopilar datos del perfil GBP

Antes de ejecutar el agente, reunir la siguiente información accediendo al GBP del cliente (business.google.com):

**Datos básicos:**
- Nombre del negocio (exacto, tal como aparece en GBP)
- Categoría principal y categorías secundarias
- Descripción actual (copiar texto completo)
- Dirección completa
- Teléfono
- Web
- Horarios de apertura (incluyendo festivos si están configurados)

**Fotos:**
- Número total de fotos
- Número de fotos del propietario vs. fotos de clientes
- Tienen foto de portada, foto de perfil, fotos del interior, exterior, equipo, productos/servicios
- Si las fotos tienen metadatos de ubicación (geoetiquetadas)

**Reseñas:**
- Puntuación media actual
- Número total de reseñas
- Última reseña (fecha)
- % de reseñas con respuesta del propietario

**Atributos:**
- Lista de atributos marcados (accesibilidad, pago, servicios especiales según sector)
- Servicios/productos añadidos al perfil
- Preguntas y respuestas (Q&A) si existen

### Paso 2 — Ejecutar el agente

- Acceder a `/admin/agentes`
- Seleccionar el cliente en el panel izquierdo
- Seleccionar agente `auditor_gbp` en el panel derecho
- Introducir los datos recopilados en el formulario de input
- Ejecutar y esperar resultado (2-3 minutos)

### Paso 3 — Revisar el JSON de salida

El agente devuelve un JSON estructurado. Revisar en orden:
1. `score_total` — el número clave
2. `problemas_criticos` — lista con prioridad alta, actuar primero
3. `recomendaciones` — lista ordenada por impacto esperado
4. `campos_faltantes` — todo lo que no está rellenado

---

## 4. Qué genera (salida)

El agente devuelve un JSON con esta estructura:

```json
{
  "score_total": 67,
  "desglose": {
    "completitud_campos": 75,
    "categorias": 60,
    "descripcion_entidades": 55,
    "fotos": 70,
    "resenas": 80,
    "horarios": 90,
    "atributos": 40
  },
  "problemas_criticos": [
    {
      "campo": "descripcion",
      "problema": "No incluye entidades geográficas ni keywords de servicio",
      "impacto": "alto",
      "accion": "Reescribir descripción incluyendo barrio, ciudad y servicios principales"
    }
  ],
  "recomendaciones": [
    {
      "prioridad": 1,
      "accion": "Añadir categorías secundarias relevantes",
      "impacto_esperado": "Aumentar visibilidad en búsquedas relacionadas",
      "dificultad": "baja"
    }
  ],
  "campos_faltantes": ["fotos_productos", "atributos_accesibilidad", "descripcion_servicios"],
  "proxima_auditoria": "Julio 2026"
}
```

---

## 5. Cómo interpretar los resultados

### Escala de scoring

| Rango | Estado | Significado |
|---|---|---|
| 0-40 | Rojo — Crítico | El perfil tiene problemas graves. Google tiene poca confianza en este negocio. Poco probable aparecer en Map Pack. Acción inmediata. |
| 41-70 | Amarillo — Mejorable | El perfil existe y funciona básicamente, pero pierde posiciones frente a competidores mejor optimizados. Hay mejoras rápidas disponibles. |
| 71-100 | Verde — Optimizado | El perfil está bien configurado. El foco aquí es mantener y superar a la competencia directa. |

### Desglose por área

**Completitud de campos (peso: 20%)**
Todo campo vacío es una oportunidad que no se está aprovechando. Google premia los perfiles completos. Priorizar: descripción, servicios, atributos.

**Categorías (peso: 15%)**
La categoría principal define en qué búsquedas puede aparecer el negocio. Las categorías secundarias amplían el alcance. Un error de categoría es el problema más grave posible — puede excluir al negocio de búsquedas enteras.

**Descripción con entidades (peso: 20%)**
Gemini analiza la descripción para extraer entidades (qué ofrece, dónde, para quién). Una descripción sin entidades geográficas ni de servicio es invisible para Gemini. La descripción debe mencionar: nombre del barrio, ciudad, servicios principales, tipo de cliente.

**Fotos reales geoetiquetadas (peso: 15%)**
Google valora las fotos con metadatos de ubicación. Fotos de stock o fotos sin ubicación tienen menos peso. Mínimo recomendado: 10 fotos propias, actualizadas en los últimos 6 meses.

**Reseñas (peso: 15%)**
Puntuación media, volumen total y velocidad de reseñas recientes (review velocity). Un negocio con 200 reseñas de hace 3 años puede puntuar menos que uno con 30 reseñas recientes.

**Horarios (peso: 10%)**
Horarios incompletos o incorrectos generan desconfianza y pueden hacer que Google marque el negocio como "puede estar cerrado permanentemente".

**Atributos binarios (peso: 5%)**
Los atributos (acepta tarjetas, accesible en silla de ruedas, WiFi, etc.) son señales adicionales que ayudan a aparecer en filtros de búsqueda específicos.

---

## 6. Acciones post-ejecución

### Si el score es 0-40 (Crítico)

1. Aplicar TODAS las correcciones de `problemas_criticos` antes de ejecutar cualquier otro agente
2. Prioridad 1: verificar que la categoría principal es la correcta
3. Prioridad 2: completar descripción con entidades geográficas y de servicio
4. Prioridad 3: subir fotos geoetiquetadas (mínimo 5 del interior/exterior real)
5. Re-ejecutar el Auditor en 2-4 semanas para medir progreso
6. Documentar el score inicial en el CRM como baseline

### Si el score es 41-70 (Mejorable)

1. Implementar las `recomendaciones` en orden de prioridad
2. Foco en los 2-3 campos con peor puntuación en el desglose
3. Programar una revisión mensual hasta superar 70
4. Usar Keywords Locales para mejorar la descripción con entidades correctas

### Si el score es 71-100 (Optimizado)

1. Mantenimiento trimestral estándar
2. Revisar que Google no haya modificado datos del perfil sin autorización
3. Añadir fotos nuevas cada 30 días para mantener señal de actividad
4. Foco en aumentar review velocity (ver SOP Gestor Reseñas)

---

## 7. Frecuencia recomendada

| Situación | Frecuencia |
|---|---|
| Mantenimiento estándar | Trimestral |
| Cliente con score < 50 | Mensual hasta superar 70 |
| Tras cambio en GBP | Inmediato (máximo 1 semana) |
| Tras caída de posición | Inmediato |
| Sector muy competitivo | Mensual |

---

## 8. Notas y advertencias

- **El agente no accede a GBP directamente.** Todos los datos se introducen manualmente. La calidad del análisis depende de que el operador introduzca los datos completos y precisos.
- **Google puede modificar el perfil** sin notificación, aceptando sugerencias de usuarios o añadiendo datos de terceros. Por eso es importante auditar aunque el cliente no haya tocado nada.
- **La descripción de GBP tiene máximo 750 caracteres.** El agente generará texto dentro de ese límite.
- **Las fotos de Google Street View no cuentan** como fotos propias. Solo las subidas manualmente por el propietario o los clientes.
- **Atención especial a duplicados de perfil:** Si Google detecta dos perfiles del mismo negocio, puede penalizar ambos. Verificar que no hay duplicados antes de optimizar.
- **Packs con acceso:** `visibilidad_local` y `autoridad_maps_ia`. Ambos packs incluyen este agente.
