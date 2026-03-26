import 'server-only'
import { supabaseAdmin } from './supabase-admin'
import type { TareaEjecucion, NivelAutonomia } from '@/types'
import { getNivelAutonomia } from '@/types'
import { completarTarea, fallarTarea, marcarEjecutando } from './tareas-ejecucion'

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
  // TODO: GBP API → accounts.locations.localPosts.create
  return {
    mensaje: `[Preparado] Post "${tarea.titulo}" generado y listo para publicar. Pendiente de conexión con GBP API.`,
  }
}

async function ejecutarResponderResena(tarea: TareaEjecucion): Promise<{ mensaje: string }> {
  // TODO: GBP API → accounts.locations.reviews.updateReply
  const respuesta = tarea.valor_propuesto?.substring(0, 100) || 'respuesta generada'
  return {
    mensaje: `[Preparado] Respuesta a reseña lista: "${respuesta}...". Pendiente de conexión con GBP API.`,
  }
}

async function ejecutarGenerarSchema(tarea: TareaEjecucion): Promise<{ mensaje: string }> {
  // Los schemas se generan directamente — no necesitan GBP API
  // Se pueden inyectar en la web del cliente si hay acceso
  return {
    mensaje: `Schema JSON-LD generado: ${tarea.valor_propuesto?.substring(0, 100) || 'LocalBusiness + FAQ'}. Listo para inyectar en web del cliente.`,
  }
}

async function ejecutarGenerarContenido(tarea: TareaEjecucion): Promise<{ mensaje: string }> {
  // FAQs, chunks, TL;DR — contenido digital generado
  return {
    mensaje: `Contenido GEO/AEO generado: "${tarea.titulo}". Listo para publicar en web/blog del cliente.`,
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
