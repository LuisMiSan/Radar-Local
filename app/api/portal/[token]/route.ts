// ─────────────────────────────────────────────────────────
// API: Portal del Cliente — Datos de solo lectura
// ─────────────────────────────────────────────────────────
// GET /api/portal/[token]
// Devuelve datos del cliente, tareas, métricas y reportes.
// El token es un string aleatorio que identifica al cliente.
// No requiere autenticación — el token ES la autenticación.

import { NextRequest, NextResponse } from 'next/server'
import {
  getClientByPortalToken,
  getClientTasks,
  getClientMetrics,
  getClientReports,
} from '@/lib/portal'
import { getContenido, getContenidoStats } from '@/lib/content-library'

export const dynamic = 'force-dynamic'

// Validar que el token tiene formato seguro (base64url, 20-50 chars)
const TOKEN_REGEX = /^[A-Za-z0-9_-]{20,50}$/

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  // Validar formato del token
  if (!TOKEN_REGEX.test(token)) {
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 400 }
    )
  }

  // Buscar cliente por token
  const cliente = await getClientByPortalToken(token)
  if (!cliente) {
    return NextResponse.json(
      { error: 'Portal no encontrado' },
      { status: 404 }
    )
  }

  // Obtener datos en paralelo (más rápido)
  const [tareas, metricas, reportes, contenidoStats, contenidos] = await Promise.all([
    getClientTasks(cliente.id),
    getClientMetrics(cliente.id),
    getClientReports(cliente.id),
    getContenidoStats(cliente.id),
    getContenido(cliente.id, { estado: 'generado' }),
  ])

  // Devolver datos SIN información sensible
  // (no enviamos el token, ni notas internas, ni el ID real)
  return NextResponse.json({
    negocio: cliente.negocio,
    pack: cliente.pack,
    estado: cliente.estado,
    miembro_desde: cliente.created_at,
    tareas: tareas.map(t => ({
      agente: t.agente,
      tipo: t.tipo,
      estado: t.estado,
      resultado: t.resultado,
      fecha: t.created_at,
      completada: t.completed_at,
    })),
    metricas: metricas.map(m => ({
      tipo: m.tipo,
      valor: m.valor,
      fecha: m.fecha,
    })),
    reportes: reportes.map(r => ({
      mes: r.mes,
      contenido: r.contenido,
      fecha: r.created_at,
    })),
    contenidoStats: {
      total: contenidoStats.total,
      porTipo: contenidoStats.por_tipo,
      porEstado: contenidoStats.por_estado,
      vozTotal: contenidoStats.voz_total,
    },
    contenidos: contenidos.slice(0, 50).map(c => ({
      tipo: c.tipo,
      titulo: c.titulo,
      contenido: c.tipo === 'schema_jsonld' ? '[Schema JSON-LD]' : c.contenido,
      plataforma: c.plataforma_target,
      estado: c.estado,
      fecha: c.created_at,
    })),
  })
}
