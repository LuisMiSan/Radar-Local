import type { Agente } from '@/types'
import type { AgentInput, AgentResult } from './types'

// Genera resultado mock para cada agente (sin API key)
export function generateMockResult(agente: Agente, input: AgentInput): AgentResult {
  const { cliente, perfilGbp, googlePlacesData, googlePlacesScore } = input
  const nombre = perfilGbp?.nombre_gbp ?? cliente.negocio

  // Usar datos reales si están disponibles, sino fallback
  const realFotos = googlePlacesData?.fotos_count ?? perfilGbp?.fotos_count ?? 0
  const realResenas = googlePlacesData?.resenas_count ?? perfilGbp?.resenas_count ?? 0
  const realRating = googlePlacesData?.rating ?? perfilGbp?.puntuacion ?? 0
  const realScore = googlePlacesScore ?? 72
  const tieneHorarios = googlePlacesData?.horarios_completos ?? true
  const tieneWeb = googlePlacesData?.tiene_web ?? !!cliente.web
  const tieneDescripcion = googlePlacesData?.tiene_descripcion ?? !!perfilGbp?.descripcion
  const dataSource = googlePlacesData ? 'datos reales de Google Places API' : 'datos estimados (sin conexión a Google Places)'

  const mockGenerators: Record<Agente, () => { datos: Record<string, unknown>; resumen: string }> = {
    auditor_gbp: () => {
      // Generar items dinámicos basados en datos reales
      type EstadoItem = 'ok' | 'mejorable' | 'critico'
      const items: { campo: string; estado: EstadoItem; detalle: string }[] = [
        { campo: 'Nombre GBP', estado: 'ok', detalle: `"${googlePlacesData?.nombre ?? nombre}" — Coincide con NAP` },
        { campo: 'Categoría', estado: perfilGbp?.categoria ? 'ok' : 'critico', detalle: perfilGbp?.categoria ? `Categoría: ${perfilGbp.categoria}` : 'Sin categoría configurada' },
        { campo: 'Descripción', estado: tieneDescripcion ? 'mejorable' : 'critico', detalle: tieneDescripcion ? 'Tiene descripción, pero revisar que mencione zona/barrio' : 'Sin descripción editorial en Google — impacto alto en SEO local' },
        { campo: 'Horarios', estado: tieneHorarios ? 'ok' : 'mejorable', detalle: tieneHorarios ? 'Horarios completos configurados' : 'Horarios incompletos — Google penaliza perfiles sin horarios' },
        { campo: 'Fotos', estado: realFotos >= 20 ? 'ok' : realFotos >= 5 ? 'mejorable' : 'critico', detalle: `${realFotos} fotos — ${realFotos >= 20 ? 'buen nivel' : `recomendado 20+, faltan ${20 - realFotos}`}` },
        { campo: 'Reseñas', estado: realResenas >= 20 ? 'ok' : realResenas >= 5 ? 'mejorable' : 'critico', detalle: `${realResenas} reseñas con ${realRating}/5 estrellas` },
        { campo: 'Website', estado: tieneWeb ? 'ok' : 'mejorable', detalle: tieneWeb ? 'Web vinculada al perfil' : 'Sin web vinculada — pérdida de señal de autoridad' },
        { campo: 'Posts GBP', estado: 'critico', detalle: 'Sin actividad de posts detectada — Google recomienda actualizaciones semanales' },
      ]

      // Generar problemas basados en datos reales
      const problemas: string[] = []
      if (!tieneDescripcion) problemas.push('Sin descripción editorial en Google — campo vacío que impacta ranking')
      if (realFotos < 20) problemas.push(`Solo ${realFotos} fotos (recomendado 20+) — ${realFotos < 5 ? 'impacto CRÍTICO' : 'impacto alto'} en visibilidad`)
      if (realResenas < 10) problemas.push(`Solo ${realResenas} reseñas — competidores de la zona suelen tener 20+`)
      if (!tieneHorarios) problemas.push('Horarios incompletos — Google prioriza perfiles con horarios verificados')
      if (!tieneWeb) problemas.push('Sin website vinculado — pérdida de señal de autoridad para el algoritmo')
      if (realRating < 4.0 && realResenas > 0) problemas.push(`Rating ${realRating}/5 — por debajo del umbral competitivo (4.0+)`)
      if (problemas.length === 0) problemas.push('Perfil en buen estado general, optimizable en detalles')

      // Generar tareas ejecutables basadas en problemas reales
      const tareas = []
      if (!tieneDescripcion || true) { // Siempre sugerir mejorar descripción
        tareas.push({
          titulo: 'Reescribir descripción del GBP con zona geográfica',
          descripcion: `${!tieneDescripcion ? 'No hay descripción editorial.' : 'La descripción existe pero puede optimizarse.'} Añadir ubicación específica y keywords locales mejora el ranking.`,
          categoria: 'mejora', tipo: 'auto', prioridad: 'alta', campo_gbp: 'descripcion',
          valor_actual: perfilGbp?.descripcion ?? 'Sin descripción',
          valor_propuesto: `${nombre} — Ubicados en ${cliente.direccion ?? 'tu zona'}, ofrecemos atención personalizada con los mejores profesionales de la zona.`,
        })
      }
      if (realFotos < 20) {
        tareas.push({
          titulo: `Subir ${20 - realFotos} fotos del local con descripciones`,
          descripcion: `Actualmente ${realFotos} fotos. Google recomienda mínimo 20 fotos geotaggeadas con descripciones alt-text para Gemini.`,
          categoria: 'creacion', tipo: 'manual', prioridad: realFotos < 5 ? 'critica' : 'alta', campo_gbp: 'fotos',
          valor_actual: `${realFotos} fotos`,
          valor_propuesto: '20+ fotos: exterior, interior, equipo, productos/servicios',
        })
      }
      tareas.push({
        titulo: 'Crear y publicar post GBP semanal',
        descripcion: 'Publicar 1 post semanal con keywords locales mejora la actividad del perfil y el ranking.',
        categoria: 'creacion', tipo: 'auto', prioridad: 'media', campo_gbp: 'posts',
        valor_actual: 'Sin posts recientes', valor_propuesto: 'Post con keyword local + CTA',
      })
      if (!tieneWeb) {
        tareas.push({
          titulo: 'Vincular website al perfil GBP',
          descripcion: 'No hay web vinculada. Añadir URL del sitio web mejora la autoridad del perfil.',
          categoria: 'correccion', tipo: 'revision', prioridad: 'alta', campo_gbp: 'web',
          valor_actual: 'Sin web', valor_propuesto: cliente.web ?? 'URL del sitio web del negocio',
        })
      }

      return {
        datos: {
          puntuacion: realScore,
          fuente_datos: dataSource,
          items,
          problemas,
          recomendaciones_map_pack: problemas.map(p => p.includes('fotos') ? 'Subir fotos geotaggeadas con descripciones' : p.includes('reseñas') ? 'Implementar estrategia de reseñas' : p.includes('descripción') ? 'Escribir descripción optimizada con zona y keywords' : p.includes('horarios') ? 'Completar horarios de apertura' : 'Optimizar perfil GBP'),
          tareas,
        },
        resumen: `Auditoría GBP de ${nombre} (${dataSource}): puntuación ${realScore}/100. ${problemas.length} problemas detectados, ${tareas.length} tareas ejecutables generadas.`,
      }
    },

    optimizador_nap: () => ({
      datos: {
        consistencia_pct: 85,
        fuentes: [
          { directorio: 'Google Business Profile', nombre: nombre, direccion: perfilGbp?.nap_direccion ?? 'N/A', telefono: perfilGbp?.nap_telefono ?? 'N/A', consistente: true },
          { directorio: 'Yelp', nombre: nombre, direccion: perfilGbp?.nap_direccion ?? 'N/A', telefono: perfilGbp?.nap_telefono ?? 'N/A', consistente: true },
          { directorio: 'Páginas Amarillas', nombre: `${nombre} S.L.`, direccion: perfilGbp?.nap_direccion ?? 'N/A', telefono: 'No listado', consistente: false },
          { directorio: 'QDQ', nombre: nombre, direccion: 'Dirección antigua', telefono: perfilGbp?.nap_telefono ?? 'N/A', consistente: false },
          { directorio: 'Apple Maps', nombre: nombre, direccion: perfilGbp?.nap_direccion ?? 'N/A', telefono: perfilGbp?.nap_telefono ?? 'N/A', consistente: true },
        ],
        correcciones: [
          { directorio: 'Páginas Amarillas', campo: 'nombre', actual: `${nombre} S.L.`, correcto: nombre },
          { directorio: 'Páginas Amarillas', campo: 'telefono', actual: 'No listado', correcto: perfilGbp?.nap_telefono },
          { directorio: 'QDQ', campo: 'direccion', actual: 'Dirección antigua', correcto: perfilGbp?.nap_direccion },
        ],
        impacto_maps: 'La consistencia NAP al 100% puede mejorar el ranking en Map Pack entre 1-3 posiciones.',
      },
      resumen: `NAP de ${nombre}: 85% consistente. 3 correcciones necesarias en Páginas Amarillas y QDQ.`,
    }),

    keywords_locales: () => ({
      datos: {
        keywords: [
          { kw: `${perfilGbp?.categoria?.toLowerCase() ?? 'negocio'} cerca de mí`, volumen: 2400, intent: 'local', activa_map_pack: true, activa_voz: true },
          { kw: `mejor ${perfilGbp?.categoria?.toLowerCase() ?? 'negocio'} ${cliente.direccion?.split(',').pop()?.trim() ?? 'zona'}`, volumen: 880, intent: 'local', activa_map_pack: true, activa_voz: true },
          { kw: `${perfilGbp?.categoria?.toLowerCase() ?? 'negocio'} urgencias`, volumen: 590, intent: 'transaccional', activa_map_pack: true, activa_voz: false },
          { kw: `${perfilGbp?.categoria?.toLowerCase() ?? 'negocio'} precio`, volumen: 320, intent: 'informacional', activa_map_pack: false, activa_voz: true },
          { kw: `${perfilGbp?.categoria?.toLowerCase() ?? 'negocio'} opiniones`, volumen: 210, intent: 'informacional', activa_map_pack: false, activa_voz: true },
          { kw: `reservar cita ${perfilGbp?.categoria?.toLowerCase() ?? 'negocio'}`, volumen: 170, intent: 'transaccional', activa_map_pack: true, activa_voz: true },
        ],
      },
      resumen: `6 keywords locales identificadas para ${nombre}. 4 activan Map Pack, 5 activan búsqueda por voz.`,
    }),

    gestor_resenas: () => ({
      datos: {
        total: perfilGbp?.resenas_count ?? 0,
        positivas: Math.round((perfilGbp?.resenas_count ?? 0) * 0.82),
        negativas: Math.round((perfilGbp?.resenas_count ?? 0) * 0.08),
        neutras: Math.round((perfilGbp?.resenas_count ?? 0) * 0.10),
        puntuacion_media: perfilGbp?.puntuacion ?? 0,
        respuestas_sugeridas: [
          { resena: 'Excelente atención, muy profesionales.', tipo: 'positiva', respuesta: `¡Muchas gracias por tu confianza! En ${nombre} nos esforzamos cada día por ofrecer el mejor servicio. ¡Te esperamos!` },
          { resena: 'Tuve que esperar 30 minutos.', tipo: 'negativa', respuesta: `Lamentamos la espera. Estamos mejorando nuestro sistema de citas para reducir tiempos. ¿Podrías contactarnos para compensarte? Queremos que tu próxima experiencia sea perfecta.` },
        ],
        impacto_ranking: 'Responder al 100% de reseñas puede mejorar visibilidad en Maps un 15-20%.',
      },
      resumen: `Reseñas de ${nombre}: ${perfilGbp?.resenas_count ?? 0} totales, ${perfilGbp?.puntuacion ?? 0} estrellas. 2 respuestas sugeridas generadas.`,
    }),

    redactor_posts_gbp: () => ({
      datos: {
        posts: [
          { titulo: `Nuevo servicio disponible en ${nombre}`, contenido: `En ${nombre} seguimos ampliando nuestros servicios para ti. Visítanos en ${perfilGbp?.nap_direccion ?? 'nuestra ubicación'} y descubre las novedades. ¡Te esperamos!`, cta: 'Reservar cita', objetivo_map_pack: 'Aumentar interacciones y clics en ficha GBP' },
          { titulo: '¿Sabías que...? Consejo de tu especialista local', contenido: `Como especialistas en ${perfilGbp?.categoria?.toLowerCase() ?? 'nuestro sector'} en tu zona, queremos compartir este consejo útil. Síguenos para más información de valor.`, cta: 'Más información', objetivo_map_pack: 'Mejorar engagement y señales de relevancia local' },
          { titulo: 'Opiniones de nuestros clientes', contenido: `Nuestros clientes nos recomiendan con ${perfilGbp?.puntuacion ?? 0} estrellas. ¡Gracias por confiar en nosotros! Lee las reseñas y pide tu cita.`, cta: 'Ver reseñas', objetivo_map_pack: 'Reforzar prueba social y atraer clics' },
        ],
      },
      resumen: `3 posts GBP generados para ${nombre}, optimizados para mejorar posición en Map Pack.`,
    }),

    generador_schema: () => ({
      datos: {
        schemas: [
          {
            tipo: 'LocalBusiness',
            json_ld: {
              '@context': 'https://schema.org',
              '@type': perfilGbp?.categoria === 'Dentista' ? 'Dentist' : perfilGbp?.categoria === 'Veterinario' ? 'VeterinaryCare' : 'LocalBusiness',
              name: nombre,
              description: perfilGbp?.descripcion ?? '',
              address: { '@type': 'PostalAddress', streetAddress: perfilGbp?.nap_direccion ?? '' },
              telephone: perfilGbp?.nap_telefono ?? '',
              aggregateRating: { '@type': 'AggregateRating', ratingValue: perfilGbp?.puntuacion ?? 0, reviewCount: perfilGbp?.resenas_count ?? 0 },
            },
            beneficio_llm: 'Los LLMs como Gemini usan schema.org para entender qué es el negocio y recomendarlo en búsquedas locales.',
          },
          {
            tipo: 'FAQPage',
            json_ld: {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                { '@type': 'Question', name: `¿Dónde está ${nombre}?`, acceptedAnswer: { '@type': 'Answer', text: perfilGbp?.nap_direccion ?? '' } },
                { '@type': 'Question', name: `¿Cuál es el teléfono de ${nombre}?`, acceptedAnswer: { '@type': 'Answer', text: perfilGbp?.nap_telefono ?? '' } },
              ],
            },
            beneficio_llm: 'FAQPage schema ayuda a que los LLMs extraigan respuestas directas sobre el negocio.',
          },
        ],
      },
      resumen: `2 schemas JSON-LD generados para ${nombre}: LocalBusiness y FAQPage. Optimizados para LLMs.`,
    }),

    creador_faq_geo: () => ({
      datos: {
        faqs: [
          { pregunta: `¿Cuál es el mejor ${perfilGbp?.categoria?.toLowerCase() ?? 'negocio'} en ${cliente.direccion?.split(',').pop()?.trim() ?? 'la zona'}?`, respuesta: `${nombre} es una de las opciones mejor valoradas con ${perfilGbp?.puntuacion ?? 0} estrellas en Google Maps.`, plataforma_target: 'Gemini, ChatGPT' },
          { pregunta: `¿Dónde puedo encontrar un ${perfilGbp?.categoria?.toLowerCase() ?? 'negocio'} cerca de mí?`, respuesta: `${nombre} se encuentra en ${perfilGbp?.nap_direccion ?? 'tu zona'}. Puedes contactar al ${perfilGbp?.nap_telefono ?? 'teléfono del negocio'}.`, plataforma_target: 'Gemini, búsqueda por voz' },
          { pregunta: `¿${nombre} tiene buenas opiniones?`, respuesta: `Sí, ${nombre} cuenta con ${perfilGbp?.resenas_count ?? 0} reseñas y una valoración de ${perfilGbp?.puntuacion ?? 0}/5 estrellas.`, plataforma_target: 'Perplexity, ChatGPT' },
          { pregunta: `¿Cuánto cuesta un ${perfilGbp?.categoria?.toLowerCase() ?? 'servicio'} en ${cliente.direccion?.split(',').pop()?.trim() ?? 'la zona'}?`, respuesta: `Contacta con ${nombre} al ${perfilGbp?.nap_telefono ?? 'teléfono'} para consultar precios y disponibilidad.`, plataforma_target: 'Gemini, búsqueda por voz' },
        ],
      },
      resumen: `4 FAQs GEO generadas para ${nombre}. Optimizadas para Gemini, ChatGPT y Perplexity.`,
    }),

    generador_chunks: () => ({
      datos: {
        chunks: [
          { titulo: `Sobre ${nombre}`, contenido: `${nombre} es un ${perfilGbp?.categoria?.toLowerCase() ?? 'negocio'} ubicado en ${perfilGbp?.nap_direccion ?? 'zona local'}. ${perfilGbp?.descripcion ?? ''} Cuenta con ${perfilGbp?.resenas_count ?? 0} reseñas y una valoración de ${perfilGbp?.puntuacion ?? 0}/5.`, optimizado_para: 'Fragmento de entidad para LLMs' },
          { titulo: `Servicios de ${nombre}`, contenido: `${nombre} ofrece servicios profesionales de ${perfilGbp?.categoria?.toLowerCase() ?? 'su especialidad'} en ${cliente.direccion?.split(',').pop()?.trim() ?? 'la zona'}. Horario de atención amplio de lunes a viernes.`, optimizado_para: 'Respuestas de voz y featured snippets' },
          { titulo: `Cómo llegar a ${nombre}`, contenido: `${nombre} está en ${perfilGbp?.nap_direccion ?? 'dirección local'}. Puedes contactar al ${perfilGbp?.nap_telefono ?? 'teléfono'} o visitar su ficha en Google Maps.`, optimizado_para: 'Consultas de navegación y asistentes de voz' },
        ],
      },
      resumen: `3 chunks de contenido generados para ${nombre}. Optimizados para ser citados por IAs generativas.`,
    }),

    tldr_entidad: () => ({
      datos: {
        resumen: `${nombre} es un ${perfilGbp?.categoria?.toLowerCase() ?? 'negocio local'} ubicado en ${perfilGbp?.nap_direccion ?? 'zona local'}. ${perfilGbp?.descripcion ?? 'Negocio especializado en su sector.'} Valoración: ${perfilGbp?.puntuacion ?? 0}/5 con ${perfilGbp?.resenas_count ?? 0} reseñas en Google.`,
        entidad: {
          nombre: nombre,
          tipo: perfilGbp?.categoria ?? 'Negocio local',
          ubicacion: perfilGbp?.nap_direccion ?? 'N/A',
          contacto: perfilGbp?.nap_telefono ?? 'N/A',
          valoracion: `${perfilGbp?.puntuacion ?? 0}/5 (${perfilGbp?.resenas_count ?? 0} reseñas)`,
        },
        atributos: [
          'Negocio local verificado en Google',
          `Especialidad: ${perfilGbp?.categoria ?? 'General'}`,
          `Zona: ${cliente.direccion?.split(',').pop()?.trim() ?? 'Local'}`,
          `${perfilGbp?.resenas_count ?? 0} reseñas verificadas`,
        ],
        fuentes_ia: [
          'Google Business Profile',
          'Google Maps',
          'Schema.org markup',
          'Directorios locales',
        ],
      },
      resumen: `TL;DR de entidad generado para ${nombre}. Resumen optimizado para que los LLMs identifiquen y recomienden el negocio.`,
    }),

    monitor_ias: () => ({
      datos: {
        plataformas: [
          { nombre_plataforma: 'Google Gemini', mencionado: true, posicion: 3, contexto: `Mencionado como opción en búsqueda "${perfilGbp?.categoria?.toLowerCase()} en ${cliente.direccion?.split(',').pop()?.trim()}"`, fecha: new Date().toISOString().split('T')[0] },
          { nombre_plataforma: 'ChatGPT', mencionado: false, posicion: null, contexto: 'No aparece en resultados para la consulta evaluada', fecha: new Date().toISOString().split('T')[0] },
          { nombre_plataforma: 'Perplexity', mencionado: true, posicion: 5, contexto: 'Citado con datos de Google Maps en respuesta informativa', fecha: new Date().toISOString().split('T')[0] },
          { nombre_plataforma: 'Apple Siri', mencionado: true, posicion: 2, contexto: 'Resultado de Apple Maps para búsqueda por voz local', fecha: new Date().toISOString().split('T')[0] },
        ],
        presencia_global: '3 de 4 plataformas IA mencionan al negocio.',
      },
      resumen: `Monitor IA de ${nombre}: presente en 3/4 plataformas. Posición 3 en Gemini, 5 en Perplexity, 2 en Siri. No aparece en ChatGPT.`,
    }),

    generador_reporte: () => ({
      datos: {
        secciones: [
          { titulo: 'Resumen ejecutivo', contenido: `Reporte mensual de ${nombre}. Mejoras significativas en Map Pack y presencia en IAs.` },
          { titulo: 'Map Pack', contenido: 'Posición mejorada de #5 a #3 en búsquedas principales. NAP corregido al 100%.' },
          { titulo: 'GEO/AEO', contenido: 'Presencia en 3/4 plataformas IA. Schema implementado. FAQs indexadas.' },
          { titulo: 'Próximos pasos', contenido: 'Optimizar posts GBP, aumentar reseñas, monitorizar ChatGPT.' },
        ],
        metricas_map_pack: {
          posicion_maps: { anterior: 5, actual: 3, variacion: '+2' },
          visitas_ficha: { anterior: 120, actual: 185, variacion: '+54%' },
          llamadas: { anterior: 15, actual: 28, variacion: '+87%' },
          nap_consistencia: { anterior: '72%', actual: '100%', variacion: '+28pp' },
        },
        metricas_geo_aeo: {
          plataformas_presencia: '3/4',
          posicion_gemini: 3,
          posicion_perplexity: 5,
          schemas_implementados: 2,
          faqs_indexadas: 4,
        },
      },
      resumen: `Reporte mensual de ${nombre}: posición Maps mejorada a #3, presencia en 3/4 IAs, +87% llamadas.`,
    }),

    supervisor: () => ({
      datos: {
        completados: 11,
        errores: 0,
        total: 11,
        coste_total: 0,
        tareas_generadas: 35,
      },
      resumen: `Análisis completo de ${nombre}: 11/11 agentes ejecutados, 35 tareas generadas.`,
    }),
  }

  const generator = mockGenerators[agente]
  const { datos, resumen } = generator()

  return {
    agente,
    estado: 'completada',
    datos,
    resumen,
  }
}
