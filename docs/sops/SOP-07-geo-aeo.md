# SOP-07 — Categoría GEO/AEO: Optimización para Motores Generativos y de Respuesta

**Categoría:** GEO/AEO | **Versión:** 1.0 | **Fecha:** Abril 2026

---

## 1. Objetivo

Documentar el propósito, el orden de ejecución y el flujo de trabajo completo de los 5 agentes de la categoría GEO/AEO disponibles en el pack `autoridad_maps_ia`. Esta categoría transforma la presencia digital de un negocio para que sea reconocido, citado y recomendado por los motores de búsqueda generativos (IAs conversacionales) que dominan el descubrimiento de negocios locales en 2026.

---

## 2. Contexto: Por qué GEO y AEO son críticos en 2026

### ¿Qué es GEO (Generative Engine Optimization)?

GEO es la práctica de optimizar el contenido digital de un negocio para que los motores de búsqueda basados en IA generativa (Gemini, ChatGPT, Perplexity, Copilot) lo entiendan, confíen en él y lo citen como fuente de respuesta. A diferencia del SEO tradicional (que optimiza para el ranking en una lista de enlaces), GEO optimiza para ser *la respuesta* directa que la IA genera.

### ¿Qué es AEO (Answer Engine Optimization)?

AEO es la rama de GEO enfocada en búsquedas por voz y preguntas conversacionales. Optimiza el contenido para que asistentes como Siri, Google Assistant, Alexa y el modo de voz de Gemini puedan leer la respuesta en voz alta de forma natural, precisa y citable.

### Por qué esto importa ahora

En 2026, los buscadores tradicionales han dejado de ser el único punto de entrada al descubrimiento local:

- **Gemini** integra respuestas directas en Google Maps y Search usando datos GBP + Schema
- **ChatGPT y Copilot** responden preguntas como "¿qué dentista me recomiendas en Malasaña?" usando su índice + Bing
- **Perplexity** rastrea webs directamente y prioriza fuentes con Schema JSON-LD y contenido estructurado
- **Siri** usa Apple Maps + Gemini como backend para búsquedas locales de voz
- **Google Assistant** ya no es un accesorio: es el motor de búsqueda vocal por defecto en Android

Un negocio que no está optimizado para GEO/AEO es **invisible para la mitad del tráfico de búsqueda local actual**. No aparece en respuestas de voz, no es citado en resúmenes de IA, y pierde visibilidad frente a competidores que sí tienen esta estructura.

---

## 3. Los 5 agentes de la categoría y su orden de ejecución

La categoría GEO/AEO se compone de 5 agentes especializados que trabajan de forma complementaria. **El orden importa**: cada agente usa o amplía el trabajo del anterior.

```
Orden recomendado:
1. tldr_entidad
2. generador_schema
3. creador_faq_geo
4. generador_chunks
5. monitor_ias
```

### Agente 1 — TL;DR Entidad

**Función:** Establece la identidad canónica del negocio en 4 frases precisas. Es el "quién soy" que todos los demás agentes usan como referencia.

**Por qué va primero:** Si la identidad no está clara, el resto del contenido GEO puede ser inconsistente. Este agente define el nombre exacto, la especialidad, la zona geográfica, el diferenciador y la prueba social que deben repetirse en todo el ecosistema GEO.

**SOP detallado:** Ver SOP-11-tldr-entidad.md

---

### Agente 2 — Generador Schema

**Función:** Crea el marcado de datos estructurados JSON-LD (schema.org) que las IAs usan como fuente de datos autoritativa del negocio. Genera LocalBusiness, FAQPage, AggregateRating, OpeningHoursSpecification, GeoCoordinates y Speakable.

**Por qué va segundo:** El Schema amplifica todo el contenido posterior. Una FAQ sin FAQPage schema tiene un 68% menos de probabilidad de aparecer en respuestas de IA. El Schema se implementa en la web *antes* de publicar las FAQs y los chunks.

**SOP detallado:** Ver SOP-08-generador-schema.md

---

### Agente 3 — Creador FAQ GEO

**Función:** Genera preguntas y respuestas conversacionales optimizadas para las 7 intenciones de voz principales (descubrimiento, horarios, servicios, cómo llegar, comparación, precio, confianza). Cada FAQ está diseñada para ser leída en voz alta por Gemini, Siri o Google Assistant.

**Por qué va tercero:** Las FAQs se enriquecen con la identidad del TL;DR (agente 1) y se implementan en la web junto con el FAQPage schema generado por el agente 2. Sin schema, perderían efectividad.

**SOP detallado:** Ver SOP-09-creador-faq-geo.md

---

### Agente 4 — Generador Chunks

**Función:** Crea bloques de texto de 40-80 palabras que las IAs pueden citar textualmente como respuesta de voz. Son los ladrillos del contenido semántico: densos en datos, con anclaje geográfico y entidades concretas.

**Por qué va cuarto:** Los chunks se construyen sobre la identidad (agente 1) y complementan las FAQs (agente 3). Donde las FAQs responden preguntas específicas, los chunks proveen descripciones citables del negocio, sus servicios y su ubicación.

**SOP detallado:** Ver SOP-10-generador-chunks.md

---

### Agente 5 — Monitor IAs

**Función:** Evalúa la preparación global del negocio para ser recomendado por voz en las 4 plataformas principales (Gemini, ChatGPT/Copilot, Perplexity, Siri). Genera un score de voz 0-100 y un plan de acción priorizado.

**Por qué va último:** Es el "termómetro" que mide el resultado de todo el trabajo anterior. Se ejecuta al inicio para obtener el baseline, y mensualmente para medir progreso.

**SOP detallado:** Ver SOP-12-monitor-ias.md

---

## 4. Flujo de trabajo

### Cliente nuevo (primera ejecución)

```
DÍA 1 — Setup GEO baseline
├── 1. Ejecutar TL;DR Entidad → guardar output en ficha del cliente
├── 2. Ejecutar Monitor IAs → obtener score inicial (baseline)
├── 3. Ejecutar Generador Schema → implementar JSON-LD en la web del cliente
├── 4. Ejecutar Creador FAQ GEO → implementar en página FAQ + GBP
└── 5. Ejecutar Generador Chunks → implementar en about page + landings

DÍA 2-7 — Implementación
├── Pasar outputs al desarrollador / al cliente para implementación en web
├── Verificar schema en Google Rich Results Test
└── Documentar score baseline en CRM del cliente

DÍA 30 — Primera revisión
└── Ejecutar Monitor IAs → comparar con baseline → ajustar
```

### Cliente recurrente (mantenimiento mensual)

```
CADA MES
├── Ejecutar Monitor IAs → score actualizado
├── Revisar si hay cambios en el negocio (horarios, servicios, dirección)
│   ├── Si hay cambios → regenerar Schema + chunks/FAQs afectados
│   └── Sin cambios → solo actualizar el plan de acción del Monitor

CADA TRIMESTRE
├── Ejecutar Creador FAQ GEO → actualizar FAQs
├── Ejecutar Generador Chunks → actualizar bloques de contenido
└── Actualizar Google Business Description con TL;DR revisado
```

---

## 5. Dónde implementar cada tipo de output

| Output | Dónde implementa | Cómo |
|--------|-----------------|------|
| **TL;DR Entidad** | About page, Home hero, GBP Description, Meta description principal | Copiar el texto de `tldr_texto` directamente |
| **Schema JSON-LD** | `<head>` del HTML de la web (todas las páginas relevantes) | Pegar el bloque `<script type="application/ld+json">` en el head |
| **FAQs GEO** | Página FAQ del sitio + sección Q&A del perfil GBP | HTML de la página + copiar manualmente en GBP |
| **Chunks** | About page, landing pages de servicios, entradas de blog, meta descriptions | Integrar en el cuerpo del texto de cada página |
| **Score Monitor IAs** | Informe mensual al cliente | PDF o sección en el dashboard del cliente |

---

## 6. KPIs que mide esta categoría

Los siguientes indicadores permiten evaluar la efectividad del trabajo GEO/AEO a lo largo del tiempo:

| KPI | Cómo se mide | Frecuencia |
|-----|-------------|------------|
| **Score de voz** | Output del agente Monitor IAs (0-100) | Mensual |
| **Schemas indexados** | Google Search Console → Enhancements → Rich Results | Mensual |
| **FAQs activas en Rich Results** | Google Search Console → FAQ | Mensual |
| **Presencia en IAs** | Búsquedas manuales de prueba en Gemini, Perplexity, ChatGPT | Trimestral |
| **Cobertura de intenciones de voz** | Output del agente FAQ GEO (7 intenciones cubiertas) | Trimestral |
| **Infraestructura GEO completa** | Checklist del Monitor IAs (GBP, Bing Places, Schema, llms.txt) | Trimestral |

---

## 7. Cuándo ejecutar

| Situación | Agentes a ejecutar |
|-----------|--------------------|
| Cliente nuevo que contrata pack | Todos los 5 agentes en orden |
| Cambio de horarios del negocio | Generador Schema + Monitor IAs |
| Nuevo servicio o producto principal | TL;DR Entidad + Schema + FAQ GEO + Chunks |
| Cambio de dirección o zona | TL;DR Entidad + Schema + Chunks |
| Revisión mensual de rendimiento | Solo Monitor IAs |
| Revisión trimestral completa | FAQ GEO + Chunks + Monitor IAs |

---

## 8. Pack requerido

**Pack:** `autoridad_maps_ia` — acceso exclusivo

Los 5 agentes de esta categoría solo están disponibles para clientes con el pack `autoridad_maps_ia`. Sin este pack, los agentes GEO/AEO no aparecen en el panel `/admin/agentes`.

---

## 9. Notas y advertencias

- **Los agentes no acceden a internet.** Trabajan exclusivamente con los datos del cliente introducidos en el CRM. La calidad del output depende directamente de la calidad de los datos de entrada: nombre exacto, dirección completa, categorías GBP, servicios actualizados, rating y número de reseñas.
- **Sin implementación no hay efecto.** Los agentes generan el contenido, pero si no se implementa en la web del cliente, no tiene impacto. El operador es responsable de hacer llegar el output al cliente o al desarrollador web.
- **El schema se verifica, no se asume.** Siempre usar Google Rich Results Test (search.google.com/test/rich-results) para confirmar que el JSON-LD implementado es válido antes de reportar al cliente.
- **El Monitor IAs evalúa, no busca.** No hace búsquedas reales en las IAs. Su score es una estimación basada en la infraestructura del cliente. Para verificar presencia real, hacer búsquedas manuales en Gemini y Perplexity.
- **El orden del flujo es una recomendación, no una restricción técnica.** Si el cliente ya tiene TL;DR y Schema de una ejecución anterior, se puede ir directo al Monitor IAs para el seguimiento mensual.
