# SOP-04 — Keywords Locales

**Categoría:** Map Pack | **Versión:** 1.0 | **Fecha:** Abril 2026

---

## 1. Objetivo

Descubrir las **keywords que activan Map Pack**, las **frases de voz que usa Gemini y Siri** y las **queries de IA que generan citaciones en ChatGPT y Perplexity** para un negocio concreto en su zona geográfica específica.

En 2026, un negocio local compite en **tres superficies de búsqueda diferentes** con lógicas distintas. La mayoría de competidores solo optimizan para una. Este agente mapea las tres para dar ventaja real.

Los resultados de este agente son **input directo para tres agentes downstream**: Redactor Posts GBP, Creador FAQ Geo y Generador de Chunks Semánticos. Sin keywords validadas, esos agentes producen contenido genérico que no posiciona.

---

## 2. Cuándo ejecutar

- **Mes 1 (baseline obligatorio):** Primera ejecución para todo cliente nuevo. Define el universo de keywords del negocio.
- **Trimestral:** Las tendencias de búsqueda local cambian. Un keyword que funcionaba hace 6 meses puede haber evolucionado.
- **Tras lanzamiento de nuevos servicios o productos:** Cada nuevo servicio genera un universo de keywords propio.
- **Tras cambio de zona de cobertura:** Si el cliente amplía o cambia su área de influencia (nuevo barrio, nueva ciudad).
- **Tras cambios en el algoritmo de Google o Gemini:** El equipo de Radar Local comunicará cuándo es necesario.

---

## 3. Cómo ejecutar (paso a paso en el panel de agentes)

### Paso 1 — Preparar datos de entrada

El agente necesita información específica del negocio para generar keywords relevantes (no genéricas). Preparar:

**Datos del negocio:**
- Sector y subsector (ej: "salud > fisioterapia")
- Lista completa de servicios con sus nombres reales (como los llama el cliente y como los busca el público)
- Nombre del barrio principal y barrios adyacentes de influencia
- Ciudad
- Tipo de cliente objetivo (particulares, empresas, familias, jóvenes, mayores...)
- Diferenciadores (urgencias, servicio a domicilio, precios, especialización)

**Contexto competitivo (opcional pero recomendado):**
- 2-3 competidores directos en la zona (sus nombres, para que el agente infiera qué keywords están usando)
- Si hay algún keyword que el cliente ya sabe que funciona (aunque no esté posicionado)

### Paso 2 — Ejecutar el agente

- Acceder a `/admin/agentes`
- Seleccionar el cliente en el panel izquierdo
- Seleccionar agente `keywords_locales` en el panel derecho
- Introducir los datos del paso anterior
- Ejecutar y esperar resultado (2-3 minutos)

### Paso 3 — Revisar y validar el JSON de salida

El agente genera tres bloques de keywords. Revisar cada bloque y:
- Eliminar keywords que no tienen sentido para este negocio concreto
- Anotar las 5 keywords prioritarias de cada bloque para los agentes downstream
- Guardar el JSON completo en el CRM del cliente

---

## 4. Qué genera (salida)

El agente devuelve un JSON con tres bloques diferenciados:

```json
{
  "cliente": "Fisioterapia García - Malasaña, Madrid",
  "fecha_generacion": "Abril 2026",
  "keywords_map_pack": {
    "descripcion": "Keywords de búsqueda escrita que activan el Map Pack en Google",
    "logica": "Modificador de servicio + ubicación. Google las detecta como búsquedas con intención local.",
    "keywords": [
      {
        "keyword": "fisioterapeuta Malasaña",
        "intencion": "transaccional",
        "competencia_estimada": "media",
        "prioridad": "alta"
      },
      {
        "keyword": "fisioterapia cerca Tribunal Madrid",
        "intencion": "transaccional",
        "competencia_estimada": "baja",
        "prioridad": "alta"
      },
      {
        "keyword": "fisio deportivo Conde Duque",
        "intencion": "transaccional",
        "competencia_estimada": "baja",
        "prioridad": "media"
      }
    ]
  },
  "keywords_voz": {
    "descripcion": "Frases de voz que usa Gemini (Android, Google Nest) y Siri (iPhone) para búsquedas locales",
    "logica": "Frases largas, conversacionales, en formato pregunta o petición directa. Gemini extrae entidades de estas frases para decidir qué negocio recomendar.",
    "keywords": [
      {
        "frase": "¿Dónde puedo ir al fisioterapeuta cerca de Malasaña?",
        "asistente": "Gemini / Google",
        "tipo": "pregunta de localización",
        "entidades_clave": ["fisioterapeuta", "Malasaña"]
      },
      {
        "frase": "Busca fisioterapeuta deportivo en Madrid centro abierto hoy",
        "asistente": "Siri / Gemini",
        "tipo": "petición directa con filtros",
        "entidades_clave": ["fisioterapeuta deportivo", "Madrid centro", "abierto hoy"]
      },
      {
        "frase": "¿Cuál es el mejor fisioterapeuta de Malasaña?",
        "asistente": "Gemini (AI Overview)",
        "tipo": "consulta de recomendación",
        "entidades_clave": ["mejor fisioterapeuta", "Malasaña"]
      }
    ]
  },
  "keywords_geo": {
    "descripcion": "Queries de IA que generan citaciones en ChatGPT y Perplexity. Son más largas y de investigación.",
    "logica": "Los modelos de IA citan negocios que aparecen en múltiples fuentes con información consistente. Estas queries activan ese mecanismo.",
    "keywords": [
      {
        "query": "fisioterapeutas recomendados en Malasaña Madrid con buenas reseñas",
        "plataforma": "ChatGPT / Perplexity",
        "tipo": "consulta de investigación",
        "factor_citacion": "volumen de reseñas + consistencia NAP"
      },
      {
        "query": "clínicas de fisioterapia en Madrid centro especializadas en deporte",
        "plataforma": "Perplexity",
        "tipo": "consulta de comparación",
        "factor_citacion": "especialización + autoridad de dominio"
      }
    ]
  },
  "implementacion_recomendada": {
    "descripcion_gbp": ["fisioterapeuta Malasaña", "fisioterapia deportiva Madrid centro"],
    "posts_gbp": ["fisioterapeuta Malasaña", "fisio cerca Tribunal"],
    "respuestas_resenas": ["fisioterapeuta", "Malasaña", "fisioterapia deportiva"],
    "faq_geo": ["¿Dónde puedo ir al fisioterapeuta cerca de Malasaña?", "¿Cuál es el mejor fisioterapeuta de Malasaña?"],
    "chunks_semanticos": ["fisioterapeuta deportivo Conde Duque", "fisioterapia Madrid centro especializada"]
  }
}
```

---

## 5. Cómo interpretar los resultados

### Los tres tipos de búsqueda local en 2026

**Búsqueda escrita (Map Pack)**
El usuario escribe en Google. El algoritmo evalúa: relevancia de categoría GBP, proximidad geográfica, prominencia (reseñas + autoridad + citas). Las keywords de este bloque deben aparecer en la descripción GBP, en los posts y en las respuestas a reseñas.

**Búsqueda por voz (Gemini / Siri)**
El usuario habla con su asistente. El asistente usa sus propias fuentes: Gemini usa GBP + Knowledge Graph + reseñas + posts; Siri usa Apple Maps + Yelp. Las frases de este bloque deben aparecer en la descripción GBP y en las FAQ Geo, escritas en lenguaje natural, no como listas de keywords.

**Búsqueda IA (ChatGPT / Perplexity)**
El usuario consulta un modelo de IA. El modelo cita negocios que aparecen en múltiples fuentes online con datos consistentes (NAP) y contenido especializado. Las queries de este bloque se abordan con chunks semánticos en la web del cliente o en artículos externos.

### Cómo priorizar

1. Primero implementar keywords de **alta prioridad** en el bloque `keywords_map_pack` — impacto inmediato en GBP
2. Luego adaptar el lenguaje de `keywords_voz` en la descripción GBP y FAQ Geo — impacto en voz
3. Finalmente, usar `keywords_geo` para planificar contenido web — impacto en citaciones IA

---

## 6. Acciones post-ejecución

### Alimentar a los agentes downstream

Los resultados de este agente son input directo para:

**Redactor Posts GBP** (`SOP-06`)
Pasar las 3-5 keywords de `implementacion_recomendada.posts_gbp` al agente. Los posts generados incorporarán esas keywords de forma natural.

**Gestor Reseñas** (`SOP-05`)
Las keywords de `implementacion_recomendada.respuestas_resenas` ayudan al agente a generar respuestas que incluyan las entidades correctas.

**Creador FAQ Geo** (pack `autoridad_maps_ia`)
Las frases de `implementacion_recomendada.faq_geo` son preguntas exactas que el agente convertirá en pares pregunta-respuesta optimizados para voz.

**Generador de Chunks Semánticos** (pack `autoridad_maps_ia`)
Las queries de `implementacion_recomendada.chunks_semanticos` guían la generación de bloques de contenido web para SEO local y citaciones IA.

### Actualizar la descripción de GBP

Con las keywords validadas, usar el Auditor GBP para evaluar si la descripción actual las incluye. Si no, reescribir la descripción incluyendo las 2-3 keywords principales de forma natural.

---

## 7. Frecuencia recomendada

| Situación | Frecuencia |
|---|---|
| Mantenimiento estándar | Trimestral |
| Nuevo servicio o producto | Inmediato |
| Nueva zona de cobertura | Inmediato |
| Cambio en tendencias de búsqueda local | Según indicación del equipo Radar Local |

---

## 8. Notas y advertencias

- **Las keywords no son para stuffing.** El objetivo es entender el lenguaje del cliente y del buscador, no repetir keywords artificialmente. El contenido generado debe sonar natural.
- **Gemini y Siri no responden a keywords — responden a entidades.** Las frases de voz son frases completas que el asistente puede entender semánticamente. No son listas de palabras sueltas.
- **ChatGPT y Perplexity no indexan directamente GBP.** La visibilidad en IA generativa viene de tener datos consistentes en múltiples fuentes web (directorios, artículos, menciones). El bloque `keywords_geo` sirve para planificar ese contenido externo.
- **El agente trabaja con los datos que le das.** Si el cliente tiene servicios que no se han listado, el agente no puede generarlos. Actualizar el CRM cada vez que el cliente amplíe su oferta.
- **Guardar siempre el JSON completo** en el CRM del cliente, etiquetado con la fecha. Los trimestres siguientes servirán para comparar evolución.
- **Packs con acceso:** `visibilidad_local` (bloques `keywords_map_pack` y `keywords_voz`) y `autoridad_maps_ia` (los tres bloques completos + sección `implementacion_recomendada` completa).
