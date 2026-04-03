import { NextRequest, NextResponse } from 'next/server'
import { getClientById } from '@/lib/clients'
import {
  formatContentForNotebook,
  getPendingSyncContent,
  getSyncStatus,
  recordPushSync,
} from '@/lib/notebooklm-sync'

// GET /api/notebooklm?clienteId=xxx&action=status|preview
export async function GET(request: NextRequest) {
  const clienteId = request.nextUrl.searchParams.get('clienteId')
  const action = request.nextUrl.searchParams.get('action') || 'status'

  if (action === 'status') {
    const status = await getSyncStatus(clienteId || undefined)
    return NextResponse.json(status)
  }

  if (action === 'preview') {
    if (!clienteId) {
      return NextResponse.json({ error: 'clienteId es requerido para preview' }, { status: 400 })
    }

    const cliente = await getClientById(clienteId)
    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const pending = await getPendingSyncContent(clienteId)
    if (pending.length === 0) {
      return NextResponse.json({
        message: 'Todo sincronizado — no hay contenido pendiente',
        pendingCount: 0,
      })
    }

    const formatted = formatContentForNotebook(cliente, pending)
    return NextResponse.json({
      pendingCount: pending.length,
      preview: formatted,
      contentIds: pending.map(c => c.id),
    })
  }

  return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
}

// POST /api/notebooklm — Registrar sync completado
// Body: { clienteId, contentIds, summary, direction }
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { clienteId, contentIds, summary } = body

  if (!clienteId || !contentIds?.length) {
    return NextResponse.json(
      { error: 'clienteId y contentIds son requeridos' },
      { status: 400 }
    )
  }

  const ok = await recordPushSync(clienteId, contentIds, summary || 'Push manual')

  if (!ok) {
    return NextResponse.json({ error: 'Error registrando sync' }, { status: 500 })
  }

  return NextResponse.json({ success: true, synced: contentIds.length })
}
