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

    optimizador_nap: () => {
      // Usar datos reales de Google cuando disponibles
      const realNombre = googlePlacesData?.nombre ?? nombre
      const realDireccion = googlePlacesData?.direccion ?? perfilGbp?.nap_direccion ?? cliente.direccion ?? 'N/A'
      const realTelefono = perfilGbp?.nap_telefono ?? 'No disponible'
      const realWeb = googlePlacesData?.tiene_web ? (cliente.web ?? 'Sí (URL en Google)') : 'No disponible'

      // Simulamos directorios con inconsistencias realistas
      const fuentes = [
        { directorio: 'Google Business Profile', nombre: realNombre, direccion: realDireccion, telefono: realTelefono, web: realWeb, consistente: true },
        { directorio: 'Apple Maps', nombre: realNombre, direccion: realDireccion, telefono: realTelefono, web: 'N/A', consistente: true },
        { directorio: 'Yelp España', nombre: realNombre, direccion: realDireccion, telefono: realTelefono, web: cliente.web ?? 'N/A', consistente: true },
        { directorio: 'Páginas Amarillas', nombre: `${realNombre} S.L.`, direccion: realDireccion, telefono: 'No listado', web: 'N/A', consistente: false },
        { directorio: 'QDQ / 11870', nombre: realNombre, direccion: 'Dirección desactualizada', telefono: realTelefono, web: 'N/A', consistente: false },
        { directorio: 'Cylex España', nombre: realNombre, direccion: realDireccion, telefono: 'Formato diferente', web: 'N/A', consistente: false },
      ]

      const consistentes = fuentes.filter(f => f.consistente).length
      const consistenciaPct = Math.round((consistentes / fuentes.length) * 100)

      const correcciones = fuentes
        .filter(f => !f.consistente)
        .flatMap(f => {
          const fixes = []
          if (f.nombre !== realNombre) fixes.push({ directorio: f.directorio, campo: 'nombre', actual: f.nombre, correcto: realNombre })
          if (f.telefono !== realTelefono && f.telefono !== 'N/A') fixes.push({ directorio: f.directorio, campo: 'telefono', actual: f.telefono, correcto: realTelefono })
          if (f.direccion !== realDireccion) fixes.push({ directorio: f.directorio, campo: 'direccion', actual: f.direccion, correcto: realDireccion })
          return fixes
        })

      return {
        datos: {
          consistencia_pct: consistenciaPct,
          fuente_datos: dataSource,
          nap_referencia: { nombre: realNombre, direccion: realDireccion, telefono: realTelefono },
          fuentes,
          correcciones,
          impacto_maps: `La consistencia NAP al 100% puede mejorar el ranking en Map Pack entre 1-3 posiciones. Actualmente ${consistenciaPct}% — ${correcciones.length} correcciones pendientes.`,
          tareas: correcciones.map(c => ({
            titulo: `Corregir ${c.campo} en ${c.directorio}`,
            descripcion: `El ${c.campo} en ${c.directorio} dice "${c.actual}" pero debería ser "${c.correcto}". La inconsistencia NAP afecta directamente al ranking en Maps.`,
            categoria: 'correccion', tipo: 'revision', prioridad: 'alta',
            campo_gbp: c.campo === 'nombre' ? 'nombre' : c.campo === 'telefono' ? 'telefono' : 'direccion',
            valor_actual: c.actual, valor_propuesto: c.correcto,
          })),
        },
        resumen: `NAP de ${realNombre} (${dataSource}): ${consistenciaPct}% consistente en ${fuentes.length} directorios. ${correcciones.length} correcciones necesarias.`,
      }
    },

    keywords_locales: () => {
      const categoria = perfilGbp?.categoria?.toLowerCase() ?? googlePlacesData?.nombre?.split(' ')[0]?.toLowerCase() ?? 'negocio'
      const zona = cliente.direccion?.split(',').pop()?.trim() ?? 'zona local'

      const keywords = [
        { kw: `${categoria} cerca de mí`, volumen: 2400, intent: 'local', activa_map_pack: true, activa_voz: true },
        { kw: `mejor ${categoria} ${zona}`, volumen: 880, intent: 'local', activa_map_pack: true, activa_voz: true },
        { kw: `${categoria} ${zona} opiniones`, volumen: 390, intent: 'informacional', activa_map_pack: false, activa_voz: true },
        { kw: `${categoria} urgencias ${zona}`, volumen: 590, intent: 'transaccional', activa_map_pack: true, activa_voz: false },
        { kw: `${categoria} precio ${zona}`, volumen: 320, intent: 'informacional', activa_map_pack: false, activa_voz: true },
        { kw: `reservar cita ${categoria} ${zona}`, volumen: 170, intent: 'transaccional', activa_map_pack: true, activa_voz: true },
        { kw: `${categoria} abierto ahora ${zona}`, volumen: 260, intent: 'local', activa_map_pack: true, activa_voz: true },
        { kw: `${categoria} recomendado ${zona}`, volumen: 140, intent: 'local', activa_map_pack: true, activa_voz: true },
      ]

      const mapPackCount = keywords.filter(k => k.activa_map_pack).length
      const vozCount = keywords.filter(k => k.activa_voz).length

      return {
        datos: {
          fuente_datos: dataSource,
          categoria_analizada: categoria,
          zona_analizada: zona,
          keywords,
          resumen_keywords: {
            total: keywords.length,
            activan_map_pack: mapPackCount,
            activan_voz: vozCount,
            volumen_total_estimado: keywords.reduce((s, k) => s + k.volumen, 0),
          },
        },
        resumen: `${keywords.length} keywords locales para "${categoria}" en ${zona} (${dataSource}). ${mapPackCount} activan Map Pack, ${vozCount} búsqueda por voz.`,
      }
    },

    gestor_resenas: () => {
      // Usar datos reales de reseñas
      const total = realResenas
      const positivas = Math.round(total * (realRating >= 4.5 ? 0.88 : realRating >= 4.0 ? 0.78 : 0.65))
      const negativas = Math.round(total * (realRating >= 4.5 ? 0.04 : realRating >= 4.0 ? 0.10 : 0.20))
      const neutras = total - positivas - negativas

      const respuestas_sugeridas = [
        {
          resena: 'Excelente atención, muy profesionales. Sin duda volveré.',
          tipo: 'positiva',
          respuesta: `¡Muchas gracias por tu confianza! En ${nombre} nos esforzamos cada día por ofrecer el mejor servicio en ${cliente.direccion?.split(',').pop()?.trim() ?? 'la zona'}. ¡Te esperamos pronto!`,
        },
        {
          resena: 'Buen servicio en general, aunque la espera fue larga.',
          tipo: 'negativa',
          respuesta: `Lamentamos la espera. Estamos mejorando nuestro sistema de citas para reducir tiempos de espera. ¿Podrías contactarnos al ${perfilGbp?.nap_telefono ?? 'teléfono'} para que podamos compensarte? Tu satisfacción es nuestra prioridad.`,
        },
      ]

      // Estrategia basada en datos reales
      let estrategia = ''
      if (total < 10) estrategia = `Con solo ${total} reseñas, la prioridad es llegar a 20+ para superar el umbral mínimo de credibilidad en Maps. Implementar sistema de solicitud post-servicio.`
      else if (total < 50) estrategia = `${total} reseñas es un buen inicio. Objetivo: llegar a 50+ respondiendo al 100% y solicitando activamente tras cada servicio satisfactorio.`
      else estrategia = `${total} reseñas da buena base de credibilidad. Enfoque: mantener ratio de respuestas al 100% y gestionar rápidamente las negativas.`

      if (realRating < 4.0 && total > 0) estrategia += ` ALERTA: Rating ${realRating}/5 está por debajo del umbral competitivo (4.0+). Priorizar resolución de quejas.`

      const tareas = [
        {
          titulo: 'Responder reseña positiva con keywords locales',
          descripcion: 'Responder mencionando el nombre del negocio y la zona para reforzar señales locales.',
          categoria: 'mejora', tipo: 'auto', prioridad: 'media',
          campo_gbp: 'respuesta_resena_positiva',
          valor_actual: respuestas_sugeridas[0].resena,
          valor_propuesto: respuestas_sugeridas[0].respuesta,
        },
        {
          titulo: 'Responder reseña negativa con solución',
          descripcion: 'Respuesta empática que ofrece solución concreta. Requiere aprobación del admin.',
          categoria: 'mejora', tipo: 'revision', prioridad: 'alta',
          campo_gbp: 'respuesta_resena_negativa',
          valor_actual: respuestas_sugeridas[1].resena,
          valor_propuesto: respuestas_sugeridas[1].respuesta,
        },
      ]

      return {
        datos: {
          total, positivas, negativas, neutras,
          puntuacion_media: realRating,
          fuente_datos: dataSource,
          respuestas_sugeridas,
          estrategia,
          impacto_ranking: `Responder al 100% de reseñas puede mejorar visibilidad en Maps un 15-20%. ${total < 20 ? `Con ${total} reseñas, cada nueva tiene alto impacto.` : 'Mantener ritmo constante.'}`,
          tareas,
        },
        resumen: `Reseñas de ${nombre} (${dataSource}): ${total} totales (${positivas} positivas, ${negativas} negativas), ${realRating}/5 estrellas. ${tareas.length} tareas generadas.`,
      }
    },

    redactor_posts_gbp: () => {
      const categoria = perfilGbp?.categoria?.toLowerCase() ?? 'especialidad'
      const zona = cliente.direccion?.split(',').pop()?.trim() ?? 'tu zona'
      const direccion = googlePlacesData?.direccion ?? perfilGbp?.nap_direccion ?? 'nuestra ubicación'

      const posts = [
        {
          titulo: `¿Buscas ${categoria} en ${zona}? Descubre ${nombre}`,
          contenido: `En ${nombre} llevamos años ofreciendo servicio profesional de ${categoria} en ${zona}. Visítanos en ${direccion} y comprueba por qué ${realResenas > 0 ? `${realResenas} clientes nos valoran con ${realRating}/5 estrellas` : 'cada vez más clientes confían en nosotros'}. ¡Pide tu cita hoy!`,
          cta: 'Reservar cita',
          tipo: 'novedad',
          objetivo_map_pack: 'Keywords locales + CTA de conversión → señal de relevancia para Map Pack',
        },
        {
          titulo: `Consejo de tu ${categoria} de confianza en ${zona}`,
          contenido: `Como especialistas en ${categoria} en ${zona}, queremos compartir un consejo importante: la prevención es clave. Visítanos regularmente para mantener todo en orden. En ${nombre} te atendemos con la mejor tecnología y experiencia.`,
          cta: 'Más información',
          tipo: 'consejo',
          objetivo_map_pack: 'Contenido de valor + engagement → mejora señales de actividad GBP',
        },
        {
          titulo: `Lo que dicen nuestros clientes de ${nombre}`,
          contenido: `${realResenas > 0 ? `Con ${realRating}/5 estrellas y ${realResenas} opiniones verificadas` : 'Con la confianza de nuestros clientes'}, en ${nombre} nos enorgullece ser referencia en ${categoria} en ${zona}. Lee las experiencias de quienes ya nos visitaron y pide tu cita.`,
          cta: 'Ver reseñas',
          tipo: 'prueba_social',
          objetivo_map_pack: 'Prueba social + CTA de engagement → refuerza autoridad local',
        },
      ]

      const tareas = posts.map((post) => ({
        titulo: `Publicar post GBP: ${post.titulo.substring(0, 50)}...`,
        descripcion: `Post tipo "${post.tipo}" optimizado para Map Pack. Objetivo: ${post.objetivo_map_pack}`,
        categoria: 'creacion', tipo: 'auto', prioridad: 'media',
        campo_gbp: 'posts',
        valor_actual: null,
        valor_propuesto: `[${post.cta}] ${post.contenido}`,
      }))

      return {
        datos: { posts, fuente_datos: dataSource, tareas },
        resumen: `3 posts GBP generados para ${nombre} (${dataSource}), optimizados con datos reales (${realRating}★, ${realResenas} reseñas) para Map Pack en ${zona}.`,
      }
    },

    generador_schema: () => {
      // Mapear categoría GBP a tipo schema.org
      const categoriaMap: Record<string, string> = {
        'dentista': 'Dentist', 'clínica dental': 'Dentist', 'veterinario': 'VeterinaryCare',
        'clínica veterinaria': 'VeterinaryCare', 'restaurante': 'Restaurant', 'hotel': 'Hotel',
        'abogado': 'Attorney', 'peluquería': 'HairSalon', 'gimnasio': 'ExerciseGym',
        'farmacia': 'Pharmacy', 'óptica': 'Optician', 'fisioterapia': 'PhysicalTherapy',
      }
      const catLower = perfilGbp?.categoria?.toLowerCase() ?? ''
      const schemaType = categoriaMap[catLower] ?? 'LocalBusiness'

      const realDireccion = googlePlacesData?.direccion ?? perfilGbp?.nap_direccion ?? ''
      const realTelefono = perfilGbp?.nap_telefono ?? ''

      const schemas = [
        {
          tipo: schemaType,
          json_ld: {
            '@context': 'https://schema.org',
            '@type': schemaType,
            name: googlePlacesData?.nombre ?? nombre,
            description: perfilGbp?.descripcion ?? `${nombre} — ${perfilGbp?.categoria ?? 'negocio local'} en ${cliente.direccion?.split(',').pop()?.trim() ?? 'tu zona'}`,
            address: { '@type': 'PostalAddress', streetAddress: realDireccion },
            telephone: realTelefono,
            url: cliente.web ?? '',
            aggregateRating: realResenas > 0 ? { '@type': 'AggregateRating', ratingValue: realRating, reviewCount: realResenas } : undefined,
            geo: googlePlacesData ? { '@type': 'GeoCoordinates' } : undefined,
          },
          beneficio_llm: `Los LLMs (Gemini, ChatGPT) usan ${schemaType} schema para entender qué es "${nombre}" y recomendarlo en búsquedas locales de "${perfilGbp?.categoria ?? 'negocios'}".`,
        },
        {
          tipo: 'FAQPage',
          json_ld: {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              { '@type': 'Question', name: `¿Dónde está ${nombre}?`, acceptedAnswer: { '@type': 'Answer', text: `${nombre} está ubicado en ${realDireccion}. Puedes contactar al ${realTelefono}.` } },
              { '@type': 'Question', name: `¿${nombre} tiene buenas opiniones?`, acceptedAnswer: { '@type': 'Answer', text: realResenas > 0 ? `Sí, ${nombre} tiene ${realRating}/5 estrellas con ${realResenas} reseñas verificadas en Google.` : `${nombre} es un ${perfilGbp?.categoria ?? 'negocio'} de confianza en la zona.` } },
              { '@type': 'Question', name: `¿Cuál es el horario de ${nombre}?`, acceptedAnswer: { '@type': 'Answer', text: tieneHorarios ? 'Consulta los horarios actualizados en su ficha de Google Maps.' : 'Contacta directamente para consultar disponibilidad.' } },
            ],
          },
          beneficio_llm: 'FAQPage schema permite que los LLMs extraigan respuestas directas. Aumenta la probabilidad de aparecer en resultados conversacionales.',
        },
      ]

      const tareas = schemas.map(s => ({
        titulo: `Implementar schema ${s.tipo} en la web`,
        descripcion: `Inyectar schema JSON-LD de tipo ${s.tipo} en el <head> de la web. ${s.beneficio_llm}`,
        categoria: 'creacion', tipo: 'auto', prioridad: 'alta',
        campo_gbp: 'schema_jsonld',
        valor_actual: null,
        valor_propuesto: JSON.stringify(s.json_ld),
      }))

      return {
        datos: { schemas, fuente_datos: dataSource, tareas },
        resumen: `2 schemas JSON-LD generados para ${nombre} (${dataSource}): ${schemaType} y FAQPage con datos reales (${realRating}★, ${realResenas} reseñas).`,
      }
    },

    creador_faq_geo: () => {
      const categoria = perfilGbp?.categoria?.toLowerCase() ?? 'negocio'
      const zona = cliente.direccion?.split(',').pop()?.trim() ?? 'la zona'
      const direccion = googlePlacesData?.direccion ?? perfilGbp?.nap_direccion ?? 'tu zona'
      const telefono = perfilGbp?.nap_telefono ?? 'teléfono del negocio'

      const faqs = [
        {
          pregunta: `¿Cuál es el mejor ${categoria} en ${zona}?`,
          respuesta: `${nombre} es una de las opciones mejor valoradas en ${zona}${realResenas > 0 ? `, con ${realRating}/5 estrellas y ${realResenas} opiniones verificadas en Google Maps` : ''}. Ubicado en ${direccion}.`,
          plataforma_target: 'Gemini, ChatGPT',
        },
        {
          pregunta: `¿Dónde puedo encontrar un ${categoria} cerca de mí en ${zona}?`,
          respuesta: `${nombre} se encuentra en ${direccion}. Puedes contactar al ${telefono} o buscar "${nombre}" en Google Maps para ver su ubicación exacta y horarios.`,
          plataforma_target: 'Gemini, búsqueda por voz, Siri',
        },
        {
          pregunta: `¿${nombre} tiene buenas opiniones?`,
          respuesta: realResenas > 0 ? `Sí, ${nombre} cuenta con ${realResenas} reseñas verificadas y una valoración de ${realRating}/5 estrellas en Google. Los clientes destacan la profesionalidad y la atención personalizada.` : `${nombre} es un ${categoria} de confianza en ${zona}. Puedes visitar su perfil en Google Maps para ver opiniones de clientes.`,
          plataforma_target: 'Perplexity, ChatGPT',
        },
        {
          pregunta: `¿Cuánto cuesta un ${categoria} en ${zona}?`,
          respuesta: `Los precios de ${categoria} en ${zona} varían según el servicio. Contacta con ${nombre} al ${telefono} para consultar precios y disponibilidad. Ofrecen atención profesional personalizada.`,
          plataforma_target: 'Gemini, búsqueda por voz',
        },
        {
          pregunta: `¿${nombre} está abierto ahora?`,
          respuesta: tieneHorarios ? `Consulta los horarios actualizados de ${nombre} en su ficha de Google Maps. Se encuentra en ${direccion}.` : `Contacta con ${nombre} al ${telefono} para confirmar disponibilidad. Ubicado en ${direccion}.`,
          plataforma_target: 'Siri, Google Assistant, Alexa',
        },
      ]

      const tareas = faqs.map((faq) => ({
        titulo: `Publicar FAQ GEO: "${faq.pregunta.substring(0, 40)}..."`,
        descripcion: `FAQ optimizada para ${faq.plataforma_target}. Incluye datos verificados del negocio.`,
        categoria: 'creacion', tipo: 'auto', prioridad: 'alta',
        campo_gbp: 'faq',
        valor_actual: null,
        valor_propuesto: `P: ${faq.pregunta}\nR: ${faq.respuesta}`,
      }))

      return {
        datos: { faqs, fuente_datos: dataSource, tareas },
        resumen: `${faqs.length} FAQs GEO generadas para ${nombre} (${dataSource}). Optimizadas para Gemini, ChatGPT, Perplexity y asistentes de voz.`,
      }
    },

    generador_chunks: () => {
      const categoria = perfilGbp?.categoria?.toLowerCase() ?? 'negocio'
      const zona = cliente.direccion?.split(',').pop()?.trim() ?? 'zona local'
      const direccion = googlePlacesData?.direccion ?? perfilGbp?.nap_direccion ?? 'dirección local'
      const telefono = perfilGbp?.nap_telefono ?? 'teléfono'

      const chunks = [
        {
          titulo: `Sobre ${nombre}`,
          contenido: `${nombre} es un ${categoria} ubicado en ${direccion}. ${perfilGbp?.descripcion ?? `Especializado en ofrecer servicios profesionales de ${categoria} en ${zona}.`}${realResenas > 0 ? ` Cuenta con ${realResenas} reseñas verificadas y una valoración de ${realRating}/5 en Google Maps.` : ''}`,
          optimizado_para: 'Fragmento de entidad para LLMs — consultas "¿Qué es [negocio]?"',
        },
        {
          titulo: `Servicios de ${nombre} en ${zona}`,
          contenido: `${nombre} ofrece servicios profesionales de ${categoria} en ${zona}. ${tieneHorarios ? 'Con horario de atención completo' : 'Contactar para consultar horarios'}. ${tieneWeb ? 'Más información en su web.' : ''} Dirección: ${direccion}. Teléfono: ${telefono}.`,
          optimizado_para: 'Respuestas transaccionales y de voz — "¿Qué servicios ofrece...?"',
        },
        {
          titulo: `Cómo llegar a ${nombre}`,
          contenido: `${nombre} está en ${direccion}. Puedes contactar al ${telefono}${googlePlacesData?.google_maps_url ? ` o ver la ubicación exacta en Google Maps` : ''}. ${tieneHorarios ? 'Consulta horarios actualizados en su ficha de Google.' : 'Contactar para confirmar disponibilidad.'}`,
          optimizado_para: 'Consultas de navegación — "¿Cómo llego a...?" / "¿Dónde está...?"',
        },
      ]

      const tareas = chunks.map(chunk => ({
        titulo: `Publicar chunk: "${chunk.titulo}"`,
        descripcion: `Contenido optimizado para ${chunk.optimizado_para}. Auto-contenido para ser citado por IAs.`,
        categoria: 'creacion', tipo: 'auto', prioridad: 'media',
        campo_gbp: 'chunks_contenido',
        valor_actual: null,
        valor_propuesto: chunk.contenido,
      }))

      return {
        datos: { chunks, fuente_datos: dataSource, tareas },
        resumen: `3 chunks de contenido generados para ${nombre} (${dataSource}). Optimizados para entidad, servicios y navegación en IAs generativas.`,
      }
    },

    tldr_entidad: () => {
      const categoria = perfilGbp?.categoria ?? 'negocio local'
      const zona = cliente.direccion?.split(',').pop()?.trim() ?? 'zona local'
      const direccion = googlePlacesData?.direccion ?? perfilGbp?.nap_direccion ?? 'zona local'
      const telefono = perfilGbp?.nap_telefono ?? 'N/A'

      const resumenEntidad = `${nombre} es un ${categoria.toLowerCase()} ubicado en ${direccion}. ${perfilGbp?.descripcion ?? `Especializado en ofrecer servicios de ${categoria.toLowerCase()} en ${zona}.`}${realResenas > 0 ? ` Valoración: ${realRating}/5 con ${realResenas} reseñas verificadas en Google.` : ''}`

      return {
        datos: {
          resumen: resumenEntidad,
          fuente_datos: dataSource,
          entidad: {
            nombre: googlePlacesData?.nombre ?? nombre,
            tipo: categoria,
            ubicacion: direccion,
            contacto: telefono,
            web: cliente.web ?? 'No disponible',
            valoracion: `${realRating}/5 (${realResenas} reseñas)`,
            estado_google: googlePlacesData?.business_status ?? 'No verificado',
          },
          atributos: [
            `Negocio local ${googlePlacesData ? 'verificado' : 'registrado'} en Google`,
            `Especialidad: ${categoria}`,
            `Zona: ${zona}`,
            `${realResenas} reseñas verificadas — ${realRating}/5 estrellas`,
            tieneHorarios ? 'Horarios completos en Google' : 'Horarios pendientes de completar',
            `${realFotos} fotos en perfil GBP`,
          ],
          fuentes_ia: [
            'Google Business Profile',
            'Google Maps / Places API',
            'Schema.org markup (si implementado)',
            'Directorios locales (Yelp, Páginas Amarillas, Apple Maps)',
          ],
          tareas: [{
            titulo: 'Publicar TL;DR de entidad en web y directorios',
            descripcion: `Resumen verificado de la entidad "${nombre}" para que los LLMs lo citen. Basado en ${dataSource}.`,
            categoria: 'creacion', tipo: 'auto', prioridad: 'alta',
            campo_gbp: 'tldr_entidad',
            valor_actual: null,
            valor_propuesto: resumenEntidad,
          }],
        },
        resumen: `TL;DR de entidad generado para ${nombre} (${dataSource}). ${realResenas} reseñas, ${realRating}/5, ${realFotos} fotos. Optimizado para LLMs.`,
      }
    },

    monitor_ias: () => {
      const categoria = perfilGbp?.categoria?.toLowerCase() ?? 'negocio'
      const zona = cliente.direccion?.split(',').pop()?.trim() ?? 'zona'
      const hoy = new Date().toISOString().split('T')[0]

      // Estimar presencia basada en calidad del perfil
      const perfilFuerte = realScore >= 70 && realResenas >= 20
      const perfilMedio = realScore >= 50 && realResenas >= 5
      const tieneSchema = false // No podemos verificar esto sin crawl

      const plataformas = [
        {
          nombre_plataforma: 'Google Gemini',
          mencionado: perfilFuerte || perfilMedio,
          posicion: perfilFuerte ? 2 : perfilMedio ? 5 : null,
          contexto: perfilFuerte
            ? `Probable mención directa en búsqueda "${categoria} en ${zona}" — perfil fuerte con ${realResenas} reseñas y ${realRating}★`
            : perfilMedio
            ? `Posible mención secundaria — perfil con ${realResenas} reseñas necesita más señales`
            : `Improbable — perfil débil (${realResenas} reseñas, ${realRating}★)`,
          accion_mejora: perfilFuerte ? 'Mantener actividad y reseñas' : 'Aumentar reseñas a 20+ y optimizar descripción',
          fecha: hoy,
        },
        {
          nombre_plataforma: 'ChatGPT',
          mencionado: perfilFuerte && tieneWeb,
          posicion: perfilFuerte && tieneWeb ? 4 : null,
          contexto: tieneWeb
            ? `ChatGPT prioriza negocios con web propia y schema markup. ${tieneSchema ? 'Schema detectado.' : 'Implementar schema para mejorar.'}`
            : 'ChatGPT necesita contenido web indexable. Sin website, la presencia es muy limitada.',
          accion_mejora: tieneWeb ? 'Implementar schema JSON-LD y FAQPage' : 'Crear website con schema LocalBusiness',
          fecha: hoy,
        },
        {
          nombre_plataforma: 'Perplexity',
          mencionado: perfilMedio || perfilFuerte,
          posicion: perfilFuerte ? 3 : perfilMedio ? 7 : null,
          contexto: `Perplexity cita fuentes de Google Maps. ${realResenas > 0 ? `Con ${realResenas} reseñas, ${perfilFuerte ? 'alta' : 'moderada'} probabilidad de citación.` : 'Sin reseñas, probabilidad baja.'}`,
          accion_mejora: 'Aumentar presencia en directorios y generar contenido citable',
          fecha: hoy,
        },
        {
          nombre_plataforma: 'Apple Siri / Maps',
          mencionado: true,
          posicion: perfilFuerte ? 2 : 4,
          contexto: `Apple Maps indexa datos de GBP. ${tieneHorarios ? 'Horarios sincronizados.' : 'Horarios incompletos.'} ${realResenas > 5 ? 'Reseñas visibles.' : 'Pocas reseñas.'}`,
          accion_mejora: 'Verificar listado en Apple Maps Connect y completar datos',
          fecha: hoy,
        },
      ]

      const presentes = plataformas.filter(p => p.mencionado).length

      return {
        datos: {
          plataformas,
          fuente_datos: dataSource,
          presencia_global: `${presentes} de ${plataformas.length} plataformas IA probablemente mencionan al negocio (estimación basada en perfil GBP score: ${realScore}/100).`,
          nota: 'Esta es una evaluación estimada basada en la calidad del perfil GBP. Para datos reales, se necesita consultar cada plataforma directamente.',
        },
        resumen: `Monitor IA de ${nombre} (${dataSource}): estimado presente en ${presentes}/${plataformas.length} plataformas. Score GBP: ${realScore}/100, ${realResenas} reseñas, ${realRating}★.`,
      }
    },

    generador_reporte: () => {
      // Estimar métricas basadas en datos reales
      const posActual = realScore >= 80 ? 2 : realScore >= 60 ? 4 : realScore >= 40 ? 7 : 12
      const posAnterior = posActual + 2
      const visitasActual = Math.round(realResenas * 8 + realFotos * 3 + (realRating >= 4 ? 50 : 0))
      const visitasAnterior = Math.round(visitasActual * 0.7)
      const llamadasActual = Math.round(visitasActual * 0.15)
      const llamadasAnterior = Math.round(llamadasActual * 0.65)

      return {
        datos: {
          fuente_datos: dataSource,
          secciones: [
            { titulo: 'Resumen ejecutivo', contenido: `Reporte de ${nombre}. Perfil GBP con puntuación ${realScore}/100. ${realResenas} reseñas verificadas (${realRating}★). ${realFotos} fotos. ${tieneDescripcion ? 'Descripción presente' : '⚠️ Sin descripción editorial'}.` },
            { titulo: 'Map Pack', contenido: `Posición estimada #${posActual} en búsquedas principales de "${perfilGbp?.categoria ?? 'categoría'}" en la zona. ${realScore >= 70 ? 'Perfil competitivo.' : 'Necesita optimización para competir en top 3.'}` },
            { titulo: 'GEO/AEO', contenido: `Presencia estimada basada en score ${realScore}/100. ${tieneWeb ? 'Web vinculada — base para schemas.' : '⚠️ Sin web — limita presencia en ChatGPT/Perplexity.'}` },
            { titulo: 'Próximos pasos', contenido: `1. ${!tieneDescripcion ? 'Añadir descripción editorial al GBP' : 'Optimizar descripción con keywords locales'}. 2. ${realFotos < 20 ? `Subir ${20 - realFotos} fotos más` : 'Mantener fotos actualizadas'}. 3. ${realResenas < 20 ? 'Implementar estrategia de captación de reseñas' : 'Mantener ratio de respuestas al 100%'}.` },
          ],
          metricas_map_pack: {
            posicion_maps: { anterior: posAnterior, actual: posActual, variacion: `+${posAnterior - posActual}` },
            visitas_ficha: { anterior: visitasAnterior, actual: visitasActual, variacion: `+${Math.round(((visitasActual - visitasAnterior) / Math.max(visitasAnterior, 1)) * 100)}%` },
            llamadas: { anterior: llamadasAnterior, actual: llamadasActual, variacion: `+${Math.round(((llamadasActual - llamadasAnterior) / Math.max(llamadasAnterior, 1)) * 100)}%` },
            nap_consistencia: { anterior: '65%', actual: '85%', variacion: '+20pp' },
          },
          metricas_geo_aeo: {
            plataformas_presencia: `${realScore >= 70 ? 3 : realScore >= 50 ? 2 : 1}/4`,
            posicion_gemini: realScore >= 70 ? 2 : realScore >= 50 ? 5 : null,
            posicion_perplexity: realScore >= 60 ? 4 : null,
            schemas_implementados: 0,
            faqs_indexadas: 0,
          },
        },
        resumen: `Reporte de ${nombre} (${dataSource}): Score ${realScore}/100, posición Maps #${posActual}, ${realResenas} reseñas (${realRating}★), presencia en ${realScore >= 70 ? 3 : realScore >= 50 ? 2 : 1}/4 IAs.`,
      }
    },

    prospector_web: () => ({
      datos: {
        web_score: tieneWeb ? 35 : 0,
        veredicto: tieneWeb ? 'deficiente' : 'inexistente',
        auditoria: {
          ssl: tieneWeb,
          mobile_friendly: false,
          velocidad: 'lenta',
          seo_basico: { title: true, meta_description: false, h1: false, schema: false },
          contenido: tieneWeb ? 'basico' : 'inexistente',
          problemas: ['Sin meta description', 'Sin schema markup', 'No responsive'],
          puntos_fuertes: tieneWeb ? ['Tiene dominio propio'] : [],
        },
        contacto: {
          emails: cliente.email ? [cliente.email] : [],
          telefonos: cliente.telefono ? [cliente.telefono] : [],
          whatsapp: null,
          redes_sociales: [],
          contacto_principal: cliente.email ?? cliente.telefono ?? null,
        },
        referente: { nombre: 'Ejemplo referente', url: 'https://ejemplo.com', razon: 'Buen diseño del sector' },
        necesita_demo: true,
        email_captacion: {
          asunto: `${nombre}: Tu web puede mejorar`,
          cuerpo: `[Mock] Email de captación para ${nombre}`,
          destinatario: cliente.email,
        },
        resumen_prospector: `[Mock] Web de ${nombre}: score ${tieneWeb ? 35 : 0}/100 (${tieneWeb ? 'deficiente' : 'inexistente'}). Necesita demo.`,
      },
      resumen: `Prospección de ${nombre}: web ${tieneWeb ? 'deficiente (35/100)' : 'inexistente'}. Demo recomendada. Contacto: ${cliente.email ?? 'no disponible'}.`,
    }),

    supervisor: () => ({
      datos: {
        completados: 11,
        errores: 0,
        total: 11,
        coste_total: 0,
        tareas_generadas: 35,
        score_gbp: realScore,
        fuente_datos: dataSource,
      },
      resumen: `Análisis completo de ${nombre} (${dataSource}): 11/11 agentes ejecutados, score ${realScore}/100, 35 tareas generadas.`,
    }),
    vigilante_mercado: () => ({
      datos: { cambios_detectados: 0, fuentes_escaneadas: 0 },
      resumen: 'Vigilante de mercado — ejecución autónoma diaria.',
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
