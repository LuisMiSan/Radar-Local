import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { implementarCambio } from '@/lib/vigilante/implementer'
import type { CambioDetectado, EstadoCambio } from '@/types'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// PATCH /api/vigilante/cambios/:id
// body: { estado: EstadoCambio, notas_admin?: string }
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { estado, notas_admin } = body as { estado: EstadoCambio; notas_admin?: string }

  const supabase = getSupabaseAdmin()

  const updates: Record<string, unknown> = {
    estado,
    notas_admin: notas_admin ?? null,
    fecha_revision: new Date().toISOString(),
  }

  // Si se aprueba → intentar implementar
  if (estado === 'aprobado') {
    const { data: cambio } = await supabase
      .from('cambios_detectados')
      .select('*')
      .eq('id', id)
      .single()

    if (cambio) {
      const resultado = await implementarCambio(cambio as CambioDetectado)
      if (resultado.ok) {
        updates.estado = 'implementado'
        updates.fecha_implementacion = new Date().toISOString()
        updates.notas_admin = resultado.detalle ?? notas_admin ?? null
      } else {
        // Implementación fallida — quedar en aprobado para retry manual
        updates.notas_admin = `⚠️ Error al implementar: ${resultado.mensaje}`
      }
    }
  }

  const { data, error } = await supabase
    .from('cambios_detectados')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
