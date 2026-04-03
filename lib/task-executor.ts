import 'server-only'
import { supabaseAdmin } from './supabase-admin'
import type { TareaEjecucion, NivelAutonomia } from '@/types'
import { getNivelAutonomia } from '@/types'
import { completarTarea, fallarTarea, marcarEjecutando } from './tareas-ejecucion'
import { guardarContenido } from './content-library'

// ══════════════════════════════════════════════════════════════
// TASK EXECUTOR — Motor de ejecución autónoma de tareas
//
// Procesa tareas aprobadas (auto o manualmente) y las ejecuta.
// Cuando la GBP API esté disponible, aquí se conectará.
//
// Niveles de autonomía:
//   🟢 auto_ejecutar → ejecutar sin preguntar
//   🟡 notificar     → ejecutar + crear notificación
//   🔴 aprobar       → solo ejecutar si estado = 'aprobada'
// ══════════════════════════════════════════════════════════════

// ── Ejecutar una lista de tareas aprobadas ───────────────────

export async function ejecutarTareasAprobadas(
  tareas: TareaEjecucion[]
): Promise<ResultadoEjecucionBatch> {
  const resultados: ResultadoEjecucion[] = []

  for (const tarea of tareas) {
    // Solo ejecutar tareas en estado 'aprobada'
    if (tarea.estado !== 'aprobada') continue

    const resultado = await ejecutarTarea(tarea)
    resultados.push(resultado)
  }

  const exitosas = resultados.filter(r => r.exito).length
  const fallidas = resultados.filter(r => !r.exito).length

  console.log(`[task-executor] Batch completado: ${exitosas} exitosas, ${fallidas} fallidas de ${tareas.length} total`)

  return { resultados, exitosas, fallidas, total: tareas.length }
}

// ── Ejecutar una tarea individual ────────────────────────────

async function ejecutarTarea(tarea: TareaEjecucion): Promise<ResultadoEjecucion> {
  const nivel = getNivelAutonomia(tarea.tipo, tarea.campo_gbp, tarea.prioridad)

  console.log(`[task-executor] Ejecutando: "${tarea.titulo}" (${nivel})`)

  // Marcar como ejecutando
  await marcarEjecutando(tarea.id)

  try {
    // ─── EJECUTAR SEGÚN EL CAMPO GBP ───
    // Cuando la GBP API esté disponible, aquí se conectan los ejecutores reales
    const resultado = await ejecutarAccion(tarea)

    // Marcar como completada
    await completarTarea(tarea.id, resultado.mensaje)

    // Si es nivel 'notificar', crear notificación para el admin
    if (nivel === 'notificar') {
      await crearNotificacion(tarea, resultado.mensaje)
    }

    console.log(`[task-executor] ✓ "${tarea.titulo}" completada: ${resultado.mensaje}`)

    return {
      tareaId: tarea.id,
      exito: true,
      mensaje: resultado.mensaje,
      nivel,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
    await fallarTarea(tarea.id, errorMsg)

    console.error(`[task-executor] ✗ "${tarea.titulo}" falló: ${errorMsg}`)

    return {
      tareaId: tarea.id,
      exito: false,
      mensaje: errorMsg,
      nivel,
    }
  }
}

// ── Ejecutar la acción concreta de una tarea ─────────────────
// Aquí se conectarán los ejecutores reales (GBP API, web scraping, etc.)

async function ejecutarAccion(tarea: TareaEjecucion): Promise<{ mensaje: string; datos?: Record<string, unknown> }> {
  const campo = tarea.campo_gbp || 'general'

  // ─── EJECUTORES POR CAMPO ─────────────────────────────────
  // Cada case es un punto de conexión para la API real

  switch (campo) {
    // ── GBP: Contenido (auto-ejecutable cuando API disponible) ──
    case 'descripcion':
      return ejecutarCambioGBP(tarea, 'description', tarea.valor_propuesto)

    case 'posts':
      return ejecutarPublicarPost(tarea)

    case 'respuesta_resena_positiva':
    case 'respuesta_resena_neutra':
      return ejecutarResponderResena(tarea)

    // ── GEO/AEO: Contenido digital ──
    case 'schema_jsonld':
      return ejecutarGenerarSchema(tarea)

    case 'faq':
    case 'chunks_contenido':
    case 'tldr_entidad':
      return ejecutarGenerarContenido(tarea)

    // ── GBP: Datos del perfil (requiere API) ──
    case 'fotos_descripcion':
    case 'atributos_secundarios':
    case 'horarios':
    case 'servicios':
    case 'productos':
    case 'categorias_secundarias':
      return ejecutarCambioGBP(tarea, campo, tarea.valor_propuesto)

    // ── GBP: Datos críticos (siempre requieren aprobación) ──
    case 'nombre':
    case 'direccion':
    case 'telefono':
    case 'categoria_principal':
    case 'web':
      return ejecutarCambioGBPCritico(tarea, campo)

    // ── Reseñas negativas (siempre requieren aprobación) ──
    case 'respuesta_resena_negativa':
      return ejecutarResponderResena(tarea)

    // ── Prospector: Demo web + Email captación ──
    case 'demo_web':
      return ejecutarGuardarDemo(tarea)

    case 'email_captacion':
      return ejecutarEmailCaptacion(tarea)

    default:
      return ejecutarGenerico(tarea)
  }
}

// ════════════════════════════════════════════════════════════════
// EJECUTORES ESPECÍFICOS
// Cuando la GBP API esté disponible, estos usarán la API real.
// Por ahora, simulan la ejecución y registran qué SE HARÍA.
// ════════════════════════════════════════════════════════════════

async function ejecutarCambioGBP(
  tarea: TareaEjecucion,
  field: string,
  nuevoValor: string | null
): Promise<{ mensaje: string }> {
  // TODO: Conectar con GBP API cuando esté disponible
  // const gbpApi = await getGBPClient(tarea.cliente_id)
  // await gbpApi.updateField(field, nuevoValor)

  if (!nuevoValor) {
    return { mensaje: `[Preparado] Campo "${field}" marcado para actualizar. Pendiente de conexión con GBP API.` }
  }

  return {
    mensaje: `[Preparado] Campo "${field}" listo para actualizar → "${nuevoValor.substring(0, 80)}${nuevoValor.length > 80 ? '...' : ''}". Pendiente de conexión con GBP API.`,
  }
}

async function ejecutarPublicarPost(tarea: TareaEjecucion): Promise<{ mensaje: string }> {
  // Guardar el post en la librería + intentar publicar cuando GBP API esté disponible
  return ejecutarPublicarPostContenido(tarea)
}

async function ejecutarResponderResena(tarea: TareaEjecucion): Promise<{ mensaje: string }> {
  const contenido = tarea.valor_propuesto || ''

  await guardarContenido({
    clienteId: tarea.cliente_id,
    agente: tarea.agente,
    tareaId: tarea.id,
    tipo: 'respuesta_resena',
    categoria: 'map_pack',
    titulo: tarea.titulo,
    contenido,
    plataformaTarget: 'google_maps',
    optimizadoPara: 'reputacion',
  })

  return {
    mensaje: `✅ Respuesta a reseña guardada en librería. Pendiente publicar en Google (API no conectada).`,
  }
}

async function ejecutarGenerarSchema(tarea: TareaEjecucion): Promise<{ mensaje: string }> {
  // Guardar schema en la librería de contenido
  const contenido = tarea.valor_propuesto || ''
  let contenidoJson: Record<string, unknown> | undefined

  try {
    contenidoJson = JSON.parse(contenido)
  } catch {
    // No es JSON válido, guardar como texto
  }

  await guardarContenido({
    clienteId: tarea.cliente_id,
    agente: tarea.agente,
    tareaId: tarea.id,
    tipo: 'schema_jsonld',
    categoria: 'geo_aeo',
    titulo: tarea.titulo,
    contenido,
    contenidoJson,
    plataformaTarget: 'google',
    optimizadoPara: 'rich_snippet',
  })

  return {
    mensaje: `✅ Schema JSON-LD guardado en librería de contenido. Listo para inyectar en web.`,
  }
}

async function ejecutarGenerarContenido(tarea: TareaEjecucion): Promise<{ mensaje: string }> {
  const campo = tarea.campo_gbp || 'general'
  const contenido = tarea.valor_propuesto || tarea.descripcion || ''

  // Determinar tipo y categoría según el campo
  const tipoMap: Record<string, { tipo: string; categoria: string; plataforma: string; optimizado: string }> = {
    faq: { tipo: 'faq_voz', categoria: 'voz', plataforma: 'gemini', optimizado: 'busqueda_voz' },
    chunks_contenido: { tipo: 'chunk', categoria: 'geo_aeo', plataforma: 'chatgpt', optimizado: 'citacion_llm' },
    tldr_entidad: { tipo: 'tldr', categoria: 'geo_aeo', plataforma: 'gemini', optimizado: 'citacion_llm' },
  }

  const config = tipoMap[campo] ?? { tipo: campo, categoria: 'geo_aeo', plataforma: 'web', optimizado: 'general' }

  await guardarContenido({
    clienteId: tarea.cliente_id,
    agente: tarea.agente,
    tareaId: tarea.id,
    tipo: config.tipo,
    categoria: config.categoria,
    titulo: tarea.titulo,
    contenido,
    plataformaTarget: config.plataforma,
    optimizadoPara: config.optimizado,
  })

  return {
    mensaje: `✅ Contenido guardado en librería: "${tarea.titulo}" (${config.tipo}/${config.categoria}). Listo para publicar.`,
  }
}

async function ejecutarPublicarPostContenido(tarea: TareaEjecucion): Promise<{ mensaje: string }> {
  const contenido = tarea.valor_propuesto || tarea.descripcion || ''

  await guardarContenido({
    clienteId: tarea.cliente_id,
    agente: tarea.agente,
    tareaId: tarea.id,
    tipo: 'post_gbp',
    categoria: 'map_pack',
    titulo: tarea.titulo,
    contenido,
    plataformaTarget: 'google_maps',
    optimizadoPara: 'map_pack',
  })

  return {
    mensaje: `✅ Post GBP guardado en librería. Pendiente publicar en Google (API no conectada).`,
  }
}

async function ejecutarCambioGBPCritico(
  tarea: TareaEjecucion,
  campo: string
): Promise<{ mensaje: string }> {
  // Cambios críticos — siempre pasan por aprobación antes de llegar aquí
  return {
    mensaje: `[Aprobado] Cambio crítico en "${campo}": "${tarea.valor_actual}" → "${tarea.valor_propuesto}". Pendiente de conexión con GBP API.`,
  }
}

async function ejecutarGenerico(tarea: TareaEjecucion): Promise<{ mensaje: string }> {
  return {
    mensaje: `Tarea completada: "${tarea.titulo}". ${tarea.valor_propuesto ? 'Valor propuesto registrado.' : 'Sin cambios de campo.'}`,
  }
}

// ── Crear notificación para el admin ─────────────────────────

async function crearNotificacion(
  tarea: TareaEjecucion,
  mensaje: string
): Promise<void> {
  if (!supabaseAdmin) return

  // Guardar notificación en tabla (crear si no existe, sino log)
  try {
    await supabaseAdmin.from('notificaciones').insert({
      tipo: 'tarea_auto_ejecutada',
      nivel: 'info',
      titulo: `🟡 Ejecutada: ${tarea.titulo}`,
      mensaje: `El agente ${tarea.agente} ejecutó automáticamente: ${mensaje}`,
      cliente_id: tarea.cliente_id,
      tarea_id: tarea.id,
      leida: false,
    })
  } catch {
    // Si la tabla no existe aún, solo hacer log
    console.log(`[notificacion] 🟡 Auto-ejecutada para ${tarea.cliente_id}: ${tarea.titulo} — ${mensaje}`)
  }
}

// ── Procesar todas las tareas aprobadas pendientes ───────────
// Se puede llamar desde un cron job o manualmente

export async function procesarColaEjecucion(): Promise<ResultadoEjecucionBatch> {
  if (!supabaseAdmin) {
    return { resultados: [], exitosas: 0, fallidas: 0, total: 0 }
  }

  // Obtener todas las tareas aprobadas que no se han ejecutado
  const { data, error } = await supabaseAdmin
    .from('tareas_ejecucion')
    .select('*')
    .eq('estado', 'aprobada')
    .is('ejecutado_en', null)
    .order('prioridad', { ascending: true })  // critica primero
    .order('created_at', { ascending: true }) // FIFO
    .limit(50) // Procesar en lotes de 50

  if (error || !data || data.length === 0) {
    return { resultados: [], exitosas: 0, fallidas: 0, total: 0 }
  }

  console.log(`[task-executor] Cola: ${data.length} tareas aprobadas pendientes de ejecución`)
  return ejecutarTareasAprobadas(data as TareaEjecucion[])
}

// ── Prospector: Guardar demo web ────────────────────────────

async function ejecutarGuardarDemo(tarea: TareaEjecucion): Promise<{ mensaje: string }> {
  const demoHtml = tarea.valor_propuesto || ''

  if (!demoHtml || demoHtml.length < 100) {
    return { mensaje: 'No se generó HTML de demo suficiente.' }
  }

  const result = await guardarContenido({
    clienteId: tarea.cliente_id,
    agente: tarea.agente,
    tareaId: tarea.id,
    tipo: 'demo_web',
    categoria: 'prospector',
    titulo: tarea.titulo,
    contenido: demoHtml,
    plataformaTarget: 'web',
    optimizadoPara: 'captacion',
  })

  const demoUrl = result?.id
    ? `${process.env.NEXT_PUBLIC_BASE_URL || 'https://radar-local.vercel.app'}/demo/${result.id}`
    : null

  return {
    mensaje: `✅ Demo web guardada en librería.${demoUrl ? ` URL: ${demoUrl}` : ''} Lista para enviar al prospecto.`,
  }
}

// ── Prospector: Enviar email de captación ───────────────────

async function ejecutarEmailCaptacion(tarea: TareaEjecucion): Promise<{ mensaje: string }> {
  // El email de captación se guarda como contenido pero NO se envía automáticamente
  // El admin revisa y decide si enviar (requiere aprobación)
  const emailData = tarea.valor_propuesto || ''

  await guardarContenido({
    clienteId: tarea.cliente_id,
    agente: tarea.agente,
    tareaId: tarea.id,
    tipo: 'email_captacion',
    categoria: 'prospector',
    titulo: tarea.titulo,
    contenido: emailData,
    plataformaTarget: 'email',
    optimizadoPara: 'captacion',
  })

  return {
    mensaje: `✅ Email de captación guardado. Pendiente de revisión y envío manual por el admin.`,
  }
}

// ── Tipos ───────────────────────────────────────────────────

export interface ResultadoEjecucion {
  tareaId: string
  exito: boolean
  mensaje: string
  nivel: NivelAutonomia
}

export interface ResultadoEjecucionBatch {
  resultados: ResultadoEjecucion[]
  exitosas: number
  fallidas: number
  total: number
}
