import type { Agente } from '@/types'

// ════════════════════════════════════════════════════════════
// SKILLS — Habilidades reutilizables que se componen por agente
// Cada skill es un bloque de instrucciones que se inyecta en el prompt
// ════════════════════════════════════════════════════════════

// ── SKILLS COMPARTIDAS (disponibles para varios agentes) ────

export const SHARED_SKILLS = {
  /** Analizar consistencia NAP del negocio */
  analizar_nap: `
### Skill: Analizar NAP
Cuando analices el NAP (Nombre, Dirección, Teléfono):
- Compara el formato exacto entre fuentes (C/ vs Calle, Avda. vs Avenida)
- Verifica que el nombre NO incluya keywords spam ni S.L./S.A. extra
- El teléfono debe ser fijo local (91X, 93X...) en GBP, no móvil ni 900
- La dirección debe incluir: calle, número, CP, ciudad, provincia
- Marca como INCONSISTENTE cualquier variación, por mínima que sea
`.trim(),

  /** Evaluar fotos del perfil GBP */
  evaluar_fotos: `
### Skill: Evaluar Fotos GBP
Cuando evalúes las fotos del perfil:
- Mínimo recomendado: 20 fotos (exterior, interior, equipo, productos/servicios)
- Las fotos deben ser REALES, nunca de stock
- Fotos geotaggeadas tienen más peso en Maps
- Frecuencia: subir al menos 2 fotos nuevas cada 2 semanas
- Categorías necesarias: logo, portada, exterior, interior, equipo, productos, ambiente
- Penalizar: fotos borrosas, duplicadas, irrelevantes, de stock
`.trim(),

  /** Calcular puntuación ponderada */
  calcular_puntuacion: `
### Skill: Calcular Puntuación
Usa esta escala ponderada para calcular puntuaciones:
- CRÍTICO (peso x3): categoría, nombre, dirección, teléfono, horarios, verificación
- ALTO (peso x2): descripción, reseñas, fotos (cantidad), respuesta a reseñas, servicios
- MEDIO (peso x1): posts, Q&A, atributos, mensajería, enlace reserva
Fórmula: (suma de items ok × peso) / (total items × peso) × 100
Un campo "ok" = 100%, "mejorable" = 50%, "critico" = 0%
`.trim(),

  /** Generar respuestas a reseñas */
  responder_resenas: `
### Skill: Responder Reseñas
Cuando generes respuestas a reseñas:
- POSITIVAS: Agradecer + mencionar nombre del negocio + invitar a volver
- NEGATIVAS: Disculpar + empatizar + ofrecer solución concreta + dar contacto directo
- NEUTRAS: Agradecer + preguntar cómo mejorar + invitar a contactar
- SIEMPRE: Respuesta personalizada (nunca copiar-pegar), máx 150 palabras
- NUNCA: Ser defensivo, revelar datos del cliente, ofrecer descuentos públicamente
- TONO: Profesional pero cercano. En España: tutear en hostelería, usted en salud/legal
- VELOCIDAD: Responder en menos de 24h mejora ranking un 15-20%
`.trim(),

  /** Keywords con intención local */
  keywords_locales: `
### Skill: Keywords Locales
Cuando investigues keywords:
- Patrones españoles: "[servicio] + [barrio/ciudad]", "[servicio] cerca de mí"
- Modificadores de intención: urgencias, abierto ahora, precio, mejor, opiniones, cita
- Keywords que activan Map Pack: todas las que tienen intención local explícita
- Keywords de voz: preguntas naturales ("¿dónde hay un dentista en Chamberí?")
- Volúmenes: usar datos realistas para España (no USA)
- Priorizar: keywords con intención transaccional local > informacional genérica
`.trim(),

  /** Optimizar contenido para LLMs */
  optimizar_para_llms: `
### Skill: Optimizar para LLMs
Cuando crees contenido para que los LLMs lo citen:
- Chunks de 2-4 frases, auto-contenidos, citables
- Incluir SIEMPRE: nombre del negocio + ubicación + dato verificable
- Formato entidad: "[Nombre] es un [tipo] en [lugar] que [diferenciador]"
- Datos estructurables: horarios, precios, servicios, contacto
- Lenguaje natural, no keyword stuffing
- Responder preguntas específicas que los usuarios hacen a las IAs
- Cada pieza de contenido debe funcionar como respuesta independiente
`.trim(),

  /** Generar Schema JSON-LD */
  generar_schema: `
### Skill: Generar Schema JSON-LD
Cuando generes schemas:
- Usar SIEMPRE @context: "https://schema.org"
- LocalBusiness: usar subtipo más específico (Dentist, VeterinaryCare, Restaurant...)
- Incluir: name, description, address, telephone, geo, openingHours, aggregateRating
- FAQPage: preguntas reales que los usuarios buscan, respuestas con datos del negocio
- Los schemas deben ser válidos según schema.org (verificables en Google Rich Results Test)
- Cada schema debe aportar información que los LLMs puedan parsear
`.trim(),

  /** Formato de salida profesional */
  formato_profesional: `
### Skill: Formato Profesional
En todas tus respuestas:
- Datos específicos y verificables, nunca vaguedades
- Números concretos con contexto (72/100, +15%, 3/4 plataformas)
- Acciones priorizadas por impacto (primero lo que más mejora el ranking)
- Lenguaje profesional pero comprensible (el cliente final no es técnico)
- Todo en español de España (no latinoamericano)
`.trim(),
}

// ── SKILLS PROPIAS (exclusivas de un agente) ────────────────

export const AGENT_SKILLS = {
  auditor_gbp: `
### Skill Propia: Auditoría Exhaustiva GBP
- Revisar CADA campo del GBP contra el checklist completo
- Clasificar cada campo: "ok" (cumple), "mejorable" (parcial), "critico" (falta/mal)
- Detectar posibles penalizaciones: keyword stuffing en nombre, dirección virtual, etc.
- Comparar contra las mejores prácticas de la categoría del negocio
- Identificar quick wins (mejoras rápidas de alto impacto)
`.trim(),

  optimizador_nap: `
### Skill Propia: Auditoría NAP Multi-Directorio
- Simular verificación en los 10 directorios principales de España
- Detectar variaciones sutiles (C/ vs Calle, abreviaturas, S.L.)
- Priorizar correcciones por autoridad del directorio
- Calcular impacto estimado en ranking Maps por corrección
`.trim(),

  keywords_locales: `
### Skill Propia: Research de Keywords Hiperlocal
- Generar keywords para CADA patrón de búsqueda español
- Estimar volúmenes realistas para mercado español
- Clasificar por: activa Map Pack sí/no, activa búsqueda por voz sí/no
- Identificar keywords de oportunidad (competencia baja, volumen medio)
- Incluir long-tail locales con nombre de barrio/zona
`.trim(),

  gestor_resenas: `
### Skill Propia: Gestión Estratégica de Reseñas
- Analizar sentiment de las reseñas (positivo/negativo/neutro)
- Generar respuestas personalizadas que incluyan keywords de forma natural
- Identificar patrones en reseñas negativas (problemas recurrentes)
- Sugerir estrategia de solicitud de reseñas (cuándo, cómo, a quién pedir)
- Calcular velocidad de respuesta recomendada
`.trim(),

  redactor_posts_gbp: `
### Skill Propia: Redacción de Posts GBP Optimizados
- Cada post: máximo 300 palabras, 1-2 keywords naturales, CTA claro
- Tipos de post: Novedad, Oferta, Evento, Actualización
- Calendario editorial sugerido (1 post/semana mínimo)
- CTAs que generan métricas Maps: "Llama ahora", "Cómo llegar", "Reservar cita"
- Tono adaptado al sector del negocio
`.trim(),

  generador_schema: `
### Skill Propia: Schema JSON-LD para LLMs
- Generar schemas válidos y verificables
- Priorizar: LocalBusiness subtipo > FAQPage > Service > AggregateRating
- Incluir GeoCoordinates para precisión de ubicación
- Cada schema con explicación de beneficio para LLMs
- Formato listo para copiar-pegar en el HTML del negocio
`.trim(),

  creador_faq_geo: `
### Skill Propia: FAQs para IAs Generativas
- Preguntas que los usuarios REALMENTE hacen a Gemini/ChatGPT/Perplexity
- Respuestas que posicionan al negocio como la mejor opción
- Cada FAQ target a una plataforma específica
- Formato optimizado para schema FAQPage
- Incluir datos verificables (horarios, precios, dirección, teléfono)
`.trim(),

  generador_chunks: `
### Skill Propia: Chunks Citables para LLMs
- Cada chunk: 2-4 frases, auto-contenido, citable sin contexto adicional
- 3 tipos obligatorios: Entidad (qué es), Servicios (qué ofrece), Ubicación (dónde está)
- Incluir datos verificables que los LLMs puedan usar como fuente
- Optimizar para diferentes tipos de consulta (informacional, transaccional, navegación)
`.trim(),

  tldr_entidad: `
### Skill Propia: Definición de Entidad para LLMs
- Crear un perfil de entidad completo que los LLMs usen como "ficha"
- Incluir: nombre, tipo, ubicación, contacto, valoración, diferenciadores
- Listar fuentes donde los LLMs pueden verificar la información
- Formato que facilita el knowledge graph understanding
- Atributos únicos que diferencien al negocio de competidores
`.trim(),

  monitor_ias: `
### Skill Propia: Monitorización de Presencia en IAs
- Simular búsquedas en Gemini, ChatGPT, Perplexity, Siri
- Para cada plataforma: ¿mencionado? ¿posición? ¿contexto? ¿tono?
- Detectar si la información mostrada es correcta o desactualizada
- Sugerir acciones para aparecer en plataformas donde NO está presente
- Comparar con competidores en las mismas búsquedas
`.trim(),

  generador_reporte: `
### Skill Propia: Reportes Ejecutivos Mensuales
- Estructura: Resumen Ejecutivo → Map Pack → GEO/AEO → Próximos Pasos
- Métricas con variación vs mes anterior (flechas ↑↓→)
- Lenguaje para el dueño del negocio (no técnico)
- Highlights: 3 logros principales del mes
- Próximos pasos: 3 acciones priorizadas para el próximo mes
- Incluir métricas concretas con fuente de dato
`.trim(),
}

// ── COMPOSICIÓN: qué skills usa cada agente ─────────────────

type SkillKey = keyof typeof SHARED_SKILLS

const AGENT_SKILL_MAP: Record<Agente, SkillKey[]> = {
  auditor_gbp: ['analizar_nap', 'evaluar_fotos', 'calcular_puntuacion', 'formato_profesional'],
  optimizador_nap: ['analizar_nap', 'formato_profesional'],
  keywords_locales: ['keywords_locales', 'formato_profesional'],
  gestor_resenas: ['responder_resenas', 'formato_profesional'],
  redactor_posts_gbp: ['keywords_locales', 'formato_profesional'],
  generador_schema: ['generar_schema', 'optimizar_para_llms', 'formato_profesional'],
  creador_faq_geo: ['optimizar_para_llms', 'generar_schema', 'formato_profesional'],
  generador_chunks: ['optimizar_para_llms', 'formato_profesional'],
  tldr_entidad: ['optimizar_para_llms', 'formato_profesional'],
  monitor_ias: ['optimizar_para_llms', 'formato_profesional'],
  generador_reporte: ['calcular_puntuacion', 'formato_profesional'],
}

/** Obtiene los skills compartidos asignados a un agente */
export function getSharedSkills(agente: Agente): string {
  const skillKeys = AGENT_SKILL_MAP[agente] ?? []
  return skillKeys.map((key) => SHARED_SKILLS[key]).join('\n\n')
}

/** Obtiene el skill propio de un agente */
export function getAgentSkill(agente: Agente): string {
  return AGENT_SKILLS[agente] ?? ''
}

/** Obtiene TODOS los skills (compartidos + propio) de un agente */
export function getAllSkills(agente: Agente): string {
  const shared = getSharedSkills(agente)
  const own = getAgentSkill(agente)
  return `## Tus habilidades (Skills)\n\n${shared}\n\n${own}`
}
