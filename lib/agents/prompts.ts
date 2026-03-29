import type { Agente } from '@/types'
import type { AgentInput } from './types'
import { getAllSkills } from './skills'
import { loadKnowledge } from './knowledge-loader'

// ════════════════════════════════════════════════════════════
// PROMPTS — Compone knowledge + skills + tarea para cada agente
// El system prompt se maneja por separado en runner.ts
// ════════════════════════════════════════════════════════════

// ── Contexto del cliente (compartido) ───────────────────────

function buildClientContext(input: AgentInput): string {
  const { cliente, perfilGbp, googlePlacesData, googlePlacesScore, competidoresData } = input

  let context = `
## Datos del cliente
- Negocio: ${cliente.negocio}
- Nombre de contacto: ${cliente.nombre}
- Dirección: ${cliente.direccion ?? 'No disponible'}
- Web: ${cliente.web ?? 'No disponible'}
- Pack contratado: ${cliente.pack ?? 'Sin pack'}

## Perfil Google Business Profile (datos internos)
- Nombre GBP: ${perfilGbp?.nombre_gbp ?? 'No configurado'}
- Categoría: ${perfilGbp?.categoria ?? 'No disponible'}
- Descripción: ${perfilGbp?.descripcion ?? 'No disponible'}
- Puntuación: ${perfilGbp?.puntuacion ?? 'N/A'}/5
- Reseñas: ${perfilGbp?.resenas_count ?? 0}
- Fotos: ${perfilGbp?.fotos_count ?? 0}
- NAP registrado:
  - Nombre: ${perfilGbp?.nap_nombre ?? 'No disponible'}
  - Dirección: ${perfilGbp?.nap_direccion ?? 'No disponible'}
  - Teléfono: ${perfilGbp?.nap_telefono ?? 'No disponible'}
- URL Google Maps: ${perfilGbp?.url_maps ?? 'No disponible'}`

  // Añadir datos reales verificados de Google Places API
  if (googlePlacesData) {
    context += `

## DATOS REALES DE GOOGLE (verificados via Google Places API)
IMPORTANTE: Estos datos son REALES, extraídos directamente de Google. Usa estos valores como fuente de verdad para tu análisis.
- Nombre en Google: ${googlePlacesData.nombre}
- Dirección en Google: ${googlePlacesData.direccion}
- Rating actual: ${googlePlacesData.rating}/5
- Número de reseñas: ${googlePlacesData.resenas_count}
- Número de fotos: ${googlePlacesData.fotos_count}
- Horarios completos: ${googlePlacesData.horarios_completos ? 'Sí' : 'No'}
- Tiene website vinculado: ${googlePlacesData.tiene_web ? 'Sí' : 'No'}
- Tiene descripción editorial: ${googlePlacesData.tiene_descripcion ? 'Sí' : 'No'}
- Estado del negocio: ${googlePlacesData.business_status}
- URL Google Maps: ${googlePlacesData.google_maps_url}
- **Puntuación Radar Local: ${googlePlacesScore ?? 'N/A'}/100** (fórmula ponderada: rating 25pts + reseñas 25pts + fotos 20pts + horarios 10pts + web 10pts + descripción 10pts)`
  }

  // Añadir datos de competidores reales
  if (competidoresData && competidoresData.length > 0) {
    context += `

## COMPETIDORES REALES (verificados via Google Places API)
Datos reales de los competidores más relevantes en la misma zona y categoría:`

    competidoresData.forEach((comp, i) => {
      context += `

### Competidor ${i + 1}: ${comp.nombre}
- Rating: ${comp.data.rating}/5
- Reseñas: ${comp.data.resenas_count}
- Fotos: ${comp.data.fotos_count}
- Horarios completos: ${comp.data.horarios_completos ? 'Sí' : 'No'}
- Tiene web: ${comp.data.tiene_web ? 'Sí' : 'No'}
- Tiene descripción: ${comp.data.tiene_descripcion ? 'Sí' : 'No'}
- **Puntuación Radar: ${comp.score}/100**`
    })

    const avgScore = Math.round(competidoresData.reduce((s, c) => s + c.score, 0) / competidoresData.length)
    context += `

### Comparativa
- Media competidores: ${avgScore}/100
- Tu puntuación: ${googlePlacesScore ?? 'N/A'}/100
- Diferencia: ${googlePlacesScore ? (googlePlacesScore - avgScore) : 'N/A'} puntos`
  }

  return context.trim()
}

// ── Knowledge que usa cada agente ───────────────────────────

type KnowledgeFile = 'map-pack-ranking' | 'geo-aeo-fundamentals' | 'local-seo-spain' | 'gemini-voice-search'

const AGENT_KNOWLEDGE: Record<Agente, KnowledgeFile[]> = {
  auditor_gbp:       ['map-pack-ranking', 'local-seo-spain'],
  optimizador_nap:   ['map-pack-ranking', 'local-seo-spain'],
  keywords_locales:  ['map-pack-ranking', 'gemini-voice-search'],
  gestor_resenas:    ['map-pack-ranking', 'local-seo-spain'],
  redactor_posts_gbp:['map-pack-ranking', 'local-seo-spain'],
  generador_schema:  ['gemini-voice-search', 'geo-aeo-fundamentals'],
  creador_faq_geo:   ['gemini-voice-search', 'geo-aeo-fundamentals'],
  generador_chunks:  ['gemini-voice-search', 'geo-aeo-fundamentals'],
  tldr_entidad:      ['gemini-voice-search', 'geo-aeo-fundamentals'],
  monitor_ias:       ['gemini-voice-search', 'geo-aeo-fundamentals'],
  generador_reporte: ['map-pack-ranking', 'geo-aeo-fundamentals', 'local-seo-spain'],
  supervisor:        [],
}

// ── Tarea específica de cada agente ─────────────────────────

const AGENT_TASKS: Record<Agente, string> = {
  auditor_gbp: `## Tu tarea
Realiza una auditoría completa del perfil GBP del cliente. Evalúa cada campo contra el checklist de mejores prácticas y genera:

1. **Puntuación global** (0-100) usando la fórmula de puntuación ponderada
2. **Items revisados**: cada campo con estado (ok, mejorable, critico) y detalle
3. **Problemas detectados**: issues que afectan al ranking en Map Pack
4. **Recomendaciones Map Pack**: acciones concretas ordenadas por impacto
5. **TAREAS EJECUTABLES**: Para CADA problema, genera una tarea concreta que un agente pueda ejecutar para solucionarlo

Cada tarea debe especificar:
- titulo: acción concreta ("Reescribir descripción del GBP", "Añadir 8 fotos geotaggeadas")
- descripcion: por qué es importante y qué hacer exactamente
- categoria: "correccion" (algo está mal) | "mejora" (se puede mejorar) | "creacion" (falta algo) | "verificacion" (comprobar algo)
- tipo: "auto" (se puede hacer sin aprobación, ej: crear texto) | "revision" (necesita aprobación del admin, ej: cambiar nombre/categoría) | "manual" (necesita intervención humana, ej: tomar fotos)
- prioridad: "critica" (nombre, categoría, verificación) | "alta" (descripción, fotos, horarios) | "media" (posts, atributos) | "baja" (extras)
- campo_gbp: qué campo afecta (nombre, descripcion, categoria, fotos, horarios, resenas, etc.)
- valor_actual: valor actual del campo (si aplica)
- valor_propuesto: el valor corregido/mejorado que propones (si aplica, especialmente para tipo "auto")

IMPORTANTE sobre el tipo de tarea y campo_gbp:

Tipos (determinan el nivel de autonomía):
- "auto": Se ejecuta sin aprobación. Ej: generar posts, crear schemas, escribir descripciones, responder reseñas positivas.
- "revision": Se ejecuta pero se notifica al admin. Ej: cambiar horarios, categorías secundarias, responder reseñas neutras.
- "manual": Requiere acción humana. Ej: tomar fotos, conseguir reseñas, verificar dirección.

Campos GBP válidos (USAR EXACTAMENTE estos valores):
- 🟢 Auto-ejecutar: "descripcion", "posts", "fotos_descripcion", "schema_jsonld", "faq", "chunks_contenido", "tldr_entidad", "atributos_secundarios", "respuesta_resena_positiva"
- 🟡 Notificar: "respuesta_resena_neutra", "categorias_secundarias", "horarios", "servicios", "productos"
- 🔴 Requiere aprobación: "nombre", "direccion", "telefono", "categoria_principal", "respuesta_resena_negativa", "eliminacion", "web", "verificacion"

Responde SOLO en JSON válido:
{
  "puntuacion": number,
  "items": [{"campo": string, "estado": "ok"|"mejorable"|"critico", "detalle": string}],
  "problemas": [string],
  "recomendaciones_map_pack": [string],
  "tareas": [{"titulo": string, "descripcion": string, "categoria": "correccion"|"mejora"|"creacion"|"verificacion", "tipo": "auto"|"revision"|"manual", "prioridad": "critica"|"alta"|"media"|"baja", "campo_gbp": string, "valor_actual": string|null, "valor_propuesto": string|null}]
}`,

  optimizador_nap: `## Tu tarea
Analiza la consistencia NAP del negocio en los principales directorios españoles:

1. **Consistencia** (%): porcentaje de directorios con NAP idéntico
2. **Fuentes**: lista de directorios con NAP encontrado y estado de consistencia
3. **Correcciones**: cambios necesarios por directorio, ordenados por importancia
4. **Impacto Maps**: estimación de mejora en ranking al corregir

Responde SOLO en JSON válido:
{
  "consistencia_pct": number,
  "fuentes": [{"directorio": string, "nombre": string, "direccion": string, "telefono": string, "consistente": boolean}],
  "correcciones": [{"directorio": string, "campo": string, "actual": string, "correcto": string}],
  "impacto_maps": string
}`,

  keywords_locales: `## Tu tarea
Investiga keywords con DOBLE ENFOQUE: Map Pack + Búsqueda por Voz en Gemini.

CONTEXTO: Gemini procesa consultas conversacionales complejas por voz. No solo "dentista Madrid" sino "¿Dónde hay un dentista bueno cerca que atienda urgencias?". Necesitamos AMBOS tipos.

GENERA 3 BLOQUES DE KEYWORDS:

1. **Keywords Map Pack** (5 mínimo): Las clásicas que activan el mapa local
   - Formato: [categoría] + [zona/barrio]
   - Ejemplo: "clínica dental Chamberí", "dentista urgencias Madrid"

2. **Keywords de Voz / Gemini** (5 mínimo): Preguntas naturales que la gente dice EN VOZ ALTA
   - Formato: Pregunta completa como la diría alguien hablando
   - Ejemplo: "¿Dónde hay un dentista bueno cerca de mí?", "¿Cuál es el mejor dentista de Madrid?"
   - IMPORTANTE: En español de España, lenguaje coloquial

3. **Keywords Long-tail GEO** (3 mínimo): Consultas que activan respuestas de IA
   - Formato: Consultas complejas que alguien haría a ChatGPT/Gemini
   - Ejemplo: "dentista en Madrid que use tecnología 3D y tenga buenas reseñas"

Para cada keyword indica: volumen estimado, intención, si activa Map Pack, si es consulta de voz.

Responde SOLO en JSON válido:
{
  "keywords_map_pack": [{"kw": string, "volumen": number, "intent": "local"|"transaccional", "zona": string}],
  "keywords_voz": [{"kw": string, "volumen": number, "intent": "local"|"informacional", "plataforma": "gemini"|"siri"|"alexa"|"google_assistant"}],
  "keywords_geo": [{"kw": string, "volumen": number, "intent": "informacional"|"transaccional", "llm_target": "gemini"|"chatgpt"|"perplexity"}]
}`,

  gestor_resenas: `## Tu tarea
Analiza las reseñas del negocio y genera respuestas profesionales:

1. **Estadísticas**: total, positivas, negativas, neutras, puntuación media
2. **Respuestas sugeridas**: para reseñas representativas (positivas y negativas)
3. **Estrategia**: plan para mejorar cantidad y calidad de reseñas
4. **Impacto ranking**: cómo las reseñas afectan la posición en Maps
5. **TAREAS EJECUTABLES**: Una tarea por cada respuesta sugerida

Para cada respuesta, genera una tarea con:
- campo_gbp: "respuesta_resena_positiva" (para positivas/neutras) o "respuesta_resena_negativa" (para negativas)
- tipo: "auto" (positivas) o "revision" (negativas — necesitan aprobación)
- valor_propuesto: la respuesta completa lista para publicar

Responde SOLO en JSON válido:
{
  "total": number, "positivas": number, "negativas": number, "neutras": number, "puntuacion_media": number,
  "respuestas_sugeridas": [{"resena": string, "tipo": "positiva"|"negativa", "respuesta": string}],
  "estrategia": string,
  "impacto_ranking": string,
  "tareas": [{"titulo": string, "descripcion": string, "categoria": "mejora", "tipo": "auto"|"revision", "prioridad": "alta"|"media", "campo_gbp": "respuesta_resena_positiva"|"respuesta_resena_negativa", "valor_actual": string, "valor_propuesto": string}]
}`,

  redactor_posts_gbp: `## Tu tarea
Genera 3 posts GBP optimizados para mejorar posición en Map Pack:

1. Cada post con keywords locales naturales (NO keyword stuffing)
2. CTA claro que genere métricas Maps (clics, llamadas, rutas)
3. Variedad de tipos: novedad, consejo/valor, prueba social
4. Tono adaptado al sector del negocio
5. **TAREAS EJECUTABLES**: Una tarea "auto" por cada post generado

Cada tarea debe tener:
- campo_gbp: "posts"
- tipo: "auto" (los posts se publican automáticamente sin aprobación)
- valor_propuesto: el contenido completo del post

Responde SOLO en JSON válido:
{
  "posts": [{"titulo": string, "contenido": string, "cta": string, "tipo": "novedad"|"consejo"|"prueba_social"|"oferta", "objetivo_map_pack": string}],
  "tareas": [{"titulo": string, "descripcion": string, "categoria": "creacion", "tipo": "auto", "prioridad": "media", "campo_gbp": "posts", "valor_actual": null, "valor_propuesto": string}]
}`,

  generador_schema: `## Tu tarea
Genera schemas JSON-LD relevantes para que los LLMs entiendan y recomienden el negocio:

1. **LocalBusiness** (o subtipo específico según la categoría)
2. **FAQPage** con preguntas reales que los usuarios buscan
3. Para cada schema, explica el beneficio concreto para LLMs
4. **TAREAS EJECUTABLES**: Una tarea "auto" por cada schema generado

Cada tarea debe tener:
- campo_gbp: "schema_jsonld"
- tipo: "auto" (schemas se inyectan automáticamente en la web)
- valor_propuesto: el JSON-LD completo como string

Responde SOLO en JSON válido:
{
  "schemas": [{"tipo": string, "json_ld": object, "beneficio_llm": string}],
  "tareas": [{"titulo": string, "descripcion": string, "categoria": "creacion", "tipo": "auto", "prioridad": "alta", "campo_gbp": "schema_jsonld", "valor_actual": null, "valor_propuesto": string}]
}`,

  creador_faq_geo: `## Tu tarea
Genera FAQs optimizadas para BÚSQUEDA POR VOZ en Gemini, Google Assistant, Siri y Alexa.

CONTEXTO CLAVE: Gemini en Google Maps procesa consultas conversacionales complejas. Los usuarios preguntan cosas como "¿Dónde hay un buen [categoría] cerca que esté abierto ahora?" o "¿Me pueden atender sin cita?". Tu trabajo es crear FAQs que Gemini pueda usar como respuesta directa.

REGLAS PARA FAQs DE VOZ:
- Preguntas en LENGUAJE CONVERSACIONAL (como habla la gente, NO formal)
- Preguntas en primera persona: "¿Tienen parking?", "¿Puedo ir sin cita?"
- Respuestas CORTAS: 40-60 palabras máximo (lo que cabe en una respuesta hablada)
- Incluir nombre del negocio + zona + dato concreto en cada respuesta
- Cada FAQ AUTOCONTENIDA (funciona sin contexto adicional)
- Cubrir las 5 intenciones de voz: encontrar, comparar, horarios, precios, cómo llegar

GENERA EXACTAMENTE 7 FAQs:
1. FAQ de descubrimiento: "¿Dónde hay un [categoría] bueno en [zona]?"
2. FAQ de horarios: "¿Está abierto ahora / los sábados / por la tarde?"
3. FAQ de servicios: "¿Hacen [servicio específico]?"
4. FAQ de acceso: "¿Tienen parking / es accesible / cómo llego?"
5. FAQ de comparación: "¿Cuál es el mejor [categoría] en [zona]?"
6. FAQ de precio/presupuesto: "¿Cuánto cuesta [servicio]?"
7. FAQ de confianza: "¿Es bueno [negocio]? ¿Qué opinan los clientes?"

Cada FAQ debe ser una TAREA EJECUTABLE tipo "auto" con campo_gbp: "faq".

Responde SOLO en JSON válido:
{
  "faqs": [{"pregunta": string, "respuesta": string, "plataforma_target": "gemini_voz"|"siri"|"alexa"|"google_assistant", "intencion_voz": "descubrimiento"|"horarios"|"servicios"|"acceso"|"comparacion"|"precio"|"confianza"}],
  "tareas": [{"titulo": string, "descripcion": string, "categoria": "creacion", "tipo": "auto", "prioridad": "alta", "campo_gbp": "faq", "valor_actual": null, "valor_propuesto": string}]
}`,

  generador_chunks: `## Tu tarea
Genera 5 chunks de contenido para que Gemini y otros LLMs citen al negocio en respuestas de VOZ.

CONTEXTO: Cuando alguien pregunta a Gemini "¿Dónde hay un buen [categoría] en [zona]?", Gemini necesita un bloque de texto que pueda LEER EN VOZ ALTA como respuesta. Ese bloque es un chunk.

REGLAS PARA CHUNKS CITABLES:
- Cada chunk = 1 respuesta completa a 1 tipo de pregunta de voz
- Incluir: nombre + categoría + ubicación + diferenciador + dato verificable
- Lenguaje NATURAL (que suene bien leído en voz alta por un asistente)
- NO jerga técnica — lenguaje de cliente real
- 2-4 frases por chunk (40-80 palabras)
- Formato: "[Negocio] es un [tipo] ubicado en [lugar] que [diferenciador]. Con [dato social], destaca por [valor único]."

GENERA EXACTAMENTE 5 CHUNKS:
1. **Chunk descubrimiento**: Responde "¿Qué es [negocio]?" — Definición citable
2. **Chunk servicios**: Responde "¿Qué ofrece [negocio]?" — Servicios principales
3. **Chunk ubicación**: Responde "¿Dónde está [negocio]?" — Dirección + cómo llegar + zona
4. **Chunk reputación**: Responde "¿Es bueno [negocio]?" — Rating + reseñas + diferenciador
5. **Chunk comparativo**: Responde "¿Por qué [negocio] y no otro?" — Propuesta de valor única

Cada chunk es una TAREA EJECUTABLE tipo "auto" con campo_gbp: "chunks_contenido".

Responde SOLO en JSON válido:
{
  "chunks": [{"titulo": string, "contenido": string, "optimizado_para": "descubrimiento"|"servicios"|"ubicacion"|"reputacion"|"comparativo", "consulta_voz_ejemplo": string}],
  "tareas": [{"titulo": string, "descripcion": string, "categoria": "creacion", "tipo": "auto", "prioridad": "alta", "campo_gbp": "chunks_contenido", "valor_actual": null, "valor_propuesto": string}]
}`,

  tldr_entidad: `## Tu tarea
Genera el perfil de entidad del negocio optimizado para que Gemini lo use como RESPUESTA DE VOZ.

CONTEXTO: Cuando alguien pregunta a Gemini "¿Qué es [negocio]?" o "Háblame de [negocio]", necesita un resumen que pueda leer en voz alta. Esto es el TL;DR de entidad — la "ficha de identidad" del negocio para las IAs.

FORMATO DEL RESUMEN (máximo 4 frases):
"[Nombre] es [categoría] en [zona/ciudad]. [Qué lo hace especial/diferente]. Con [rating]/5 en Google Maps y [N] reseñas, [dato de confianza]. Ubicado en [dirección], [horario resumido o contacto]."

GENERA:
1. **Resumen de voz**: 4 frases que Gemini puede leer literalmente como respuesta hablada
2. **Entidad estructurada**: nombre, tipo, ubicación, contacto, valoración
3. **Atributos distintivos**: 5-7 características que diferencian al negocio (verificables)
4. **Fuentes IA**: dónde los LLMs pueden verificar cada dato (Google Maps, web, directorios)
5. **Variantes de consulta**: 3 formas en que alguien preguntaría por este negocio por voz

TAREA EJECUTABLE tipo "auto" con campo_gbp: "tldr_entidad".

Responde SOLO en JSON válido:
{
  "resumen": string,
  "entidad": {"nombre": string, "tipo": string, "ubicacion": string, "contacto": string, "valoracion": string},
  "atributos": [string],
  "fuentes_ia": [string],
  "consultas_voz_ejemplo": [string],
  "tareas": [{"titulo": "Publicar TL;DR de entidad", "descripcion": string, "categoria": "creacion", "tipo": "auto", "prioridad": "alta", "campo_gbp": "tldr_entidad", "valor_actual": null, "valor_propuesto": string}]
}`,

  monitor_ias: `## Tu tarea
Evalúa la presencia del negocio en búsquedas por VOZ y en IAs generativas.

CONTEXTO: Gemini en Google Maps usa datos de 300M+ lugares y 500M+ contribuyentes para recomendar negocios. El usuario pregunta por voz cosas como "¿Dónde hay un buen [categoría] cerca?" y Gemini decide a quién recomendar.

EVALÚA PARA CADA PLATAFORMA:
1. **Gemini en Maps (VOZ)**: ¿El perfil GBP tiene suficiente calidad para ser recomendado por voz? Evalúa: rating, reseñas, completitud, fotos, horarios, descripción.
2. **Google Assistant**: ¿Hay contenido tipo featured snippet que pueda leer como respuesta?
3. **Siri/Apple**: ¿El negocio está en Apple Business Connect?
4. **ChatGPT/Copilot (Bing)**: ¿Tiene perfil en Bing Places for Business? ¿La web está indexada en Bing? ¿Tiene IndexNow implementado? ChatGPT usa el índice de Bing como fuente primaria — sin Bing Places el negocio NO existe para ChatGPT.
5. **Perplexity**: ¿Hay fuentes citables actualizadas? ¿Schema JSON-LD implementado?

VERIFICA INFRAESTRUCTURA TÉCNICA:
- ¿Bing Places for Business configurado y verificado? (CRÍTICO para ChatGPT)
- ¿Bing Webmaster Tools con sitemap enviado?
- ¿IndexNow implementado? (indexación instantánea en Bing, Yandex, Naver)
- ¿Google Search Console con sitemap?
- ¿Schema JSON-LD LocalBusiness + FAQPage en la web?
- ¿llms.txt en la raíz del sitio?

PARA CADA PLATAFORMA genera:
- Probabilidad de aparición (alta/media/baja/nula) con justificación basada en datos reales
- Consultas de voz específicas donde debería aparecer (3 por plataforma)
- Acción concreta y priorizada para mejorar presencia

GENERA TAMBIÉN:
- **Score de preparación para voz** (0-100): ¿Qué tan preparado está el negocio para ser la respuesta de voz?
- **Brecha principal**: El factor nº1 que le impide ser recomendado
- **Quick win**: La acción de mayor impacto con menor esfuerzo

Responde SOLO en JSON válido:
{
  "score_voz": number,
  "brecha_principal": string,
  "quick_win": string,
  "plataformas": [{"nombre_plataforma": string, "mencionado": boolean, "probabilidad": "alta"|"media"|"baja"|"nula", "posicion": number|null, "contexto": string, "consultas_voz": [string], "accion_mejora": string}],
  "presencia_global": string
}`,

  generador_reporte: `## Tu tarea
Genera un reporte mensual consolidado profesional:

1. **Secciones**: Resumen ejecutivo, Map Pack, GEO/AEO, Próximos pasos
2. **Métricas Map Pack**: posición Maps, visitas ficha, llamadas, NAP consistencia — cada una con variación estimada
3. **Métricas GEO/AEO**: plataformas presencia, posiciones, schemas, FAQs
4. **Highlights**: 3 logros principales
5. **Próximos pasos**: 3 acciones priorizadas

NOTA: Genera métricas estimadas realistas basadas en el estado actual del perfil.

Responde SOLO en JSON válido:
{
  "secciones": [{"titulo": string, "contenido": string}],
  "metricas_map_pack": {"posicion_maps": {"anterior": number, "actual": number, "variacion": string}, "visitas_ficha": {"anterior": number, "actual": number, "variacion": string}, "llamadas": {"anterior": number, "actual": number, "variacion": string}, "nap_consistencia": {"anterior": string, "actual": string, "variacion": string}},
  "metricas_geo_aeo": {"plataformas_presencia": string, "posicion_gemini": number, "posicion_perplexity": number, "schemas_implementados": number, "faqs_indexadas": number}
}`,

  supervisor: `El supervisor no genera prompts directamente — orquesta los demás agentes.`,
}

// ── Función pública: construir el USER prompt completo ──────

export function buildPrompt(agente: Agente, input: AgentInput): string {
  // 1. Knowledge (documentos de referencia)
  const knowledgeFiles = AGENT_KNOWLEDGE[agente] ?? []
  const knowledge = knowledgeFiles.map((f) => loadKnowledge(f)).join('\n\n---\n\n')

  // 2. Skills (habilidades asignadas)
  const skills = getAllSkills(agente)

  // 3. Contexto del cliente
  const context = buildClientContext(input)

  // 4. Tarea específica
  const task = AGENT_TASKS[agente]

  // 5. Memoria del agente (historial de ejecuciones previas)
  const memorySection = input.memoryContext ?? ''

  // 6. Datos de agentes previos (solo para generador_reporte)
  let previousData = ''
  if (agente === 'generador_reporte' && input.previousResults?.length) {
    previousData = `\n\n---\n\n## Resultados de los agentes ejecutados\nUsa estos datos reales para construir el reporte consolidado:\n\n`
    for (const r of input.previousResults) {
      if (r.estado === 'completada') {
        previousData += `### ${r.agente}\n${r.resumen}\n${JSON.stringify(r.datos)}\n\n`
      }
    }
  }

  // Componer el prompt del usuario
  return `## Conocimiento de referencia
${knowledge}

---

${skills}

---

${context}

---

${memorySection}

---

${task}${previousData}`
}
