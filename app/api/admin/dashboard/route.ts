import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'No database' }, { status: 500 })
  }

  // Parallel queries
  const [
    clientesRes,
    tareasRes,
    contenidoRes,
    gastosRes,
    contenidoTimelineRes,
    syncRes,
  ] = await Promise.all([
    // Clients
    supabaseAdmin.from('clientes').select('id, estado, pack'),
    // Tasks
    supabaseAdmin.from('tareas').select('estado, agente, created_at').order('created_at', { ascending: false }).limit(500),
    // Content
    supabaseAdmin.from('contenido_generado').select('tipo, categoria, estado, plataforma_target, agente, created_at'),
    // API costs (last 30 days)
    supabaseAdmin.from('uso_api').select('fecha, coste_total, agente').order('fecha', { ascending: false }).limit(500),
    // Content timeline (for chart)
    supabaseAdmin.from('contenido_generado').select('tipo, created_at').order('created_at', { ascending: true }),
    // NotebookLM sync
    supabaseAdmin.from('notebooklm_sync').select('direction, status, synced_at').order('synced_at', { ascending: false }).limit(5),
  ])

  const clientes = clientesRes.data ?? []
  const tareas = tareasRes.data ?? []
  const contenido = contenidoRes.data ?? []
  const gastos = gastosRes.data ?? []
  const contenidoTimeline = contenidoTimelineRes.data ?? []
  const syncs = syncRes.data ?? []

  // === CLIENT STATS ===
  const clienteStats = {
    total: clientes.length,
    activos: clientes.filter(c => c.estado === 'activo').length,
    leads: clientes.filter(c => !c.pack).length,
    porPack: {
      autoridad_maps_ia: clientes.filter(c => c.pack === 'autoridad_maps_ia').length,
      visibilidad_local: clientes.filter(c => c.pack === 'visibilidad_local').length,
    },
  }

  // === TASK STATS ===
  const tareaStats = {
    completadas: tareas.filter(t => t.estado === 'completada').length,
    pendientes: tareas.filter(t => t.estado === 'pendiente' || t.estado === 'en_progreso').length,
    errores: tareas.filter(t => t.estado === 'error').length,
  }

  // === CONTENT STATS ===
  const porTipo: Record<string, number> = {}
  const porPlataforma: Record<string, number> = {}
  const porEstado: Record<string, number> = {}
  let vozTotal = 0

  contenido.forEach(c => {
    porTipo[c.tipo] = (porTipo[c.tipo] ?? 0) + 1
    if (c.plataforma_target) porPlataforma[c.plataforma_target] = (porPlataforma[c.plataforma_target] ?? 0) + 1
    porEstado[c.estado] = (porEstado[c.estado] ?? 0) + 1
    if (c.categoria === 'voz' || c.plataforma_target === 'gemini' || c.plataforma_target === 'siri') {
      vozTotal++
    }
  })

  const contenidoStats = {
    total: contenido.length,
    generados: porEstado['generado'] ?? 0,
    publicados: porEstado['publicado'] ?? 0,
    descartados: porEstado['descartado'] ?? 0,
    vozTotal,
    porTipo,
    porPlataforma,
  }

  // === COST STATS ===
  const costeMes = gastos.reduce((sum, g) => sum + Number(g.coste_total ?? 0), 0)
  const llamadasMes = gastos.length

  // Cost per day (for mini chart)
  const costePorDia: Record<string, number> = {}
  gastos.forEach(g => {
    costePorDia[g.fecha] = (costePorDia[g.fecha] ?? 0) + Number(g.coste_total ?? 0)
  })
  const costeDiario = Object.entries(costePorDia)
    .map(([fecha, coste]) => ({ fecha, coste: Math.round(coste * 10000) / 10000 }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(-14) // last 14 days

  // === CONTENT TIMELINE (for chart) ===
  const porDia: Record<string, Record<string, number>> = {}
  contenidoTimeline.forEach(c => {
    const dia = c.created_at?.split('T')[0]
    if (!dia) return
    if (!porDia[dia]) porDia[dia] = {}
    porDia[dia][c.tipo] = (porDia[dia][c.tipo] ?? 0) + 1
  })
  const timeline = Object.entries(porDia)
    .map(([fecha, tipos]) => ({
      fecha,
      faq_voz: tipos['faq_voz'] ?? 0,
      chunk: tipos['chunk'] ?? 0,
      schema_jsonld: tipos['schema_jsonld'] ?? 0,
      tldr: tipos['tldr'] ?? 0,
      total: Object.values(tipos).reduce((s, v) => s + v, 0),
    }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  // === RECENT ACTIVITY ===
  const recentTasks = tareas.slice(0, 8).map(t => ({
    agente: t.agente,
    estado: t.estado,
    fecha: t.created_at,
  }))

  // === SYNC STATUS ===
  const lastPush = syncs.find(s => s.direction === 'push' && s.status === 'synced')
  const lastPull = syncs.find(s => s.direction === 'pull' && s.status === 'synced')

  return NextResponse.json({
    clientes: clienteStats,
    tareas: tareaStats,
    contenido: contenidoStats,
    costes: { total: Math.round(costeMes * 10000) / 10000, llamadas: llamadasMes, diario: costeDiario },
    timeline,
    recentTasks,
    sync: {
      lastPush: lastPush?.synced_at ?? null,
      lastPull: lastPull?.synced_at ?? null,
    },
  })
}
