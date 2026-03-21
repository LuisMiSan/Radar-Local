import { NextRequest, NextResponse } from 'next/server'
import { getResumenDiario, getResumenPorAgente, getDetalleDia, getGastoMesActual } from '@/lib/gastos'

// GET /api/gastos — Consultar gastos
// ?tipo=all (default) — devuelve diario + agente + mes en una sola llamada
// ?tipo=detalle&fecha=2026-03-16 — detalle de un día
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get('tipo') ?? 'all'

  if (tipo === 'detalle') {
    const fecha = searchParams.get('fecha')
    if (!fecha) {
      return NextResponse.json({ error: 'fecha es requerido para tipo=detalle' }, { status: 400 })
    }
    const data = await getDetalleDia(fecha)
    return NextResponse.json({ tipo: 'detalle', fecha, data })
  }

  // tipo=all — una sola petición para todo el dashboard
  const [diario, agente, mes] = await Promise.all([
    getResumenDiario(30),
    getResumenPorAgente(),
    getGastoMesActual(),
  ])

  const response = NextResponse.json({ diario, agente, mes })
  // Cache por 30 segundos — no necesita ser tiempo real
  response.headers.set('Cache-Control', 'private, max-age=30')
  return response
}
