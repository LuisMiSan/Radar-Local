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
  const { cliente, perfilGbp } = input
  return `
## Datos del cliente
- Negocio: ${cliente.negocio}
- Nombre de contacto: ${cliente.nombre}
- Dirección: ${cliente.direccion ?? 'No disponible'}
- Web: ${cliente.web ?? 'No disponible'}
- Pack contratado: ${cliente.pack ?? 'Sin pack'}

## Perfil Google Business Profile
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
- URL Google Maps: ${perfilGbp?.url_maps ?? 'No disponible'}
`.trim()
}

// ── Knowledge que usa cada agente ───────────────────────────

type KnowledgeFile = 'map-pack-ranking' | 'geo-aeo-fundamentals' | 'local-seo-spain'

const AGENT_KNOWLEDGE: Record<Agente, KnowledgeFile[]> = {
  auditor_gbp:       ['map-pack-ranking', 'local-seo-spain'],
  optimizador_nap:   ['map-pack-ranking', 'local-seo-spain'],
  keywords_locales:  ['map-pack-ranking', 'local-seo-spain'],
  gestor_resenas:    ['map-pack-ranking', 'local-seo-spain'],
  redactor_posts_gbp:['map-pack-ranking', 'local-seo-spain'],
  generador_schema:  ['geo-aeo-fundamentals', 'local-seo-spain'],
  creador_faq_geo:   ['geo-aeo-fundamentals', 'local-seo-spain'],
  generador_chunks:  ['geo-aeo-fundamentals', 'local-seo-spain'],
  tldr_entidad:      ['geo-aeo-fundamentals', 'local-seo-spain'],
  monitor_ias:       ['geo-aeo-fundamentals', 'local-seo-spain'],
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

IMPORTANTE sobre el tipo de tarea:
- "auto": Cosas que NO tienen consecuencias graves. Ej: crear una descripción para una foto, generar un post, escribir una respuesta a reseña.
- "revision": Cosas que CAMBIAN el perfil público. Ej: modificar nombre del negocio, cambiar categoría, editar descripción principal.
- "manual": Cosas que requieren acción física. Ej: tomar fotos del local, conseguir reseñas, verificar dirección en persona.

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
Investiga keywords relevantes para el negocio con enfoque hiperlocal español:

1. Keywords que activan Map Pack (intención local)
2. Keywords de búsqueda por voz (preguntas naturales en español)
3. Volumen estimado mensual realista para España
4. Intención de búsqueda y potencial

Genera al menos 8-10 keywords variadas.

Responde SOLO en JSON válido:
{
  "keywords": [{"kw": string, "volumen": number, "intent": "local"|"transaccional"|"informacional", "activa_map_pack": boolean, "activa_voz": boolean}]
}`,

  gestor_resenas: `## Tu tarea
Analiza las reseñas del negocio y genera respuestas profesionales:

1. **Estadísticas**: total, positivas, negativas, neutras, puntuación media
2. **Respuestas sugeridas**: para reseñas representativas (positivas y negativas)
3. **Estrategia**: plan para mejorar cantidad y calidad de reseñas
4. **Impacto ranking**: cómo las reseñas afectan la posición en Maps

Responde SOLO en JSON válido:
{
  "total": number, "positivas": number, "negativas": number, "neutras": number, "puntuacion_media": number,
  "respuestas_sugeridas": [{"resena": string, "tipo": "positiva"|"negativa", "respuesta": string}],
  "estrategia": string,
  "impacto_ranking": string
}`,

  redactor_posts_gbp: `## Tu tarea
Genera 3 posts GBP optimizados para mejorar posición en Map Pack:

1. Cada post con keywords locales naturales (NO keyword stuffing)
2. CTA claro que genere métricas Maps (clics, llamadas, rutas)
3. Variedad de tipos: novedad, consejo/valor, prueba social
4. Tono adaptado al sector del negocio

Responde SOLO en JSON válido:
{
  "posts": [{"titulo": string, "contenido": string, "cta": string, "tipo": "novedad"|"consejo"|"prueba_social"|"oferta", "objetivo_map_pack": string}]
}`,

  generador_schema: `## Tu tarea
Genera schemas JSON-LD relevantes para que los LLMs entiendan y recomienden el negocio:

1. **LocalBusiness** (o subtipo específico según la categoría)
2. **FAQPage** con preguntas reales que los usuarios buscan
3. Para cada schema, explica el beneficio concreto para LLMs

Responde SOLO en JSON válido:
{
  "schemas": [{"tipo": string, "json_ld": object, "beneficio_llm": string}]
}`,

  creador_faq_geo: `## Tu tarea
Genera FAQs optimizadas para IAs generativas y asistentes de voz:

1. Preguntas que los usuarios REALMENTE hacen a Gemini/ChatGPT sobre este tipo de negocio
2. Respuestas que posicionen al negocio como la mejor opción local
3. Plataforma target para cada FAQ
4. Al menos 5 FAQs variadas

Responde SOLO en JSON válido:
{
  "faqs": [{"pregunta": string, "respuesta": string, "plataforma_target": string}]
}`,

  generador_chunks: `## Tu tarea
Genera 3 chunks de contenido para el negocio, diseñados para ser citados por LLMs:

1. **Chunk entidad**: Qué es el negocio (definición citable)
2. **Chunk servicios**: Qué ofrece (para consultas transaccionales)
3. **Chunk ubicación**: Dónde está (para consultas de navegación/voz)

Cada chunk debe ser auto-contenido: funciona como respuesta independiente sin necesitar contexto adicional.

Responde SOLO en JSON válido:
{
  "chunks": [{"titulo": string, "contenido": string, "optimizado_para": string}]
}`,

  tldr_entidad: `## Tu tarea
Genera un perfil de entidad completo del negocio para LLMs:

1. **Resumen**: párrafo de 3-4 frases que define la entidad
2. **Entidad**: datos estructurados clave
3. **Atributos**: características distintivas (mínimo 5)
4. **Fuentes IA**: dónde los LLMs pueden verificar la información

Responde SOLO en JSON válido:
{
  "resumen": string,
  "entidad": {"nombre": string, "tipo": string, "ubicacion": string, "contacto": string, "valoracion": string},
  "atributos": [string],
  "fuentes_ia": [string]
}`,

  monitor_ias: `## Tu tarea
Evalúa la presencia estimada del negocio en las principales IAs:

1. Para cada plataforma (Gemini, ChatGPT, Perplexity, Siri): ¿es probable que aparezca? ¿en qué posición estimada? ¿en qué contexto?
2. Resumen de presencia global
3. Acciones para mejorar presencia donde NO aparece

NOTA: Esta es una evaluación estimada basada en la optimización del perfil. Indícalo claramente.

Responde SOLO en JSON válido:
{
  "plataformas": [{"nombre_plataforma": string, "mencionado": boolean, "posicion": number|null, "contexto": string, "accion_mejora": string, "fecha": string}],
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

  // 5. Datos de agentes previos (solo para generador_reporte)
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

${task}${previousData}`
}
