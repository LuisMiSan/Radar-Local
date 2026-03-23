import { NextResponse } from 'next/server'
import { getGoogleTokens } from '@/lib/google-auth'
import { listAccounts, listLocations, readFullProfile, updateDescription, updatePhone, updateWebsite } from '@/lib/google-gbp'

// GET /api/gbp?cliente_id=xxx
// Lee el estado actual del GBP conectado
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clienteId = searchParams.get('cliente_id')
  const action = searchParams.get('action') ?? 'status'

  if (!clienteId) {
    return NextResponse.json({ error: 'Se requiere cliente_id' }, { status: 400 })
  }

  // Verificar que tiene tokens
  const tokens = await getGoogleTokens(clienteId)
  if (!tokens) {
    return NextResponse.json({ connected: false, message: 'GBP no conectado' })
  }

  try {
    if (action === 'status') {
      return NextResponse.json({ connected: true })
    }

    if (action === 'accounts') {
      const accounts = await listAccounts(clienteId)
      return NextResponse.json({ ok: true, accounts })
    }

    if (action === 'locations') {
      const accountName = searchParams.get('account')
      if (!accountName) {
        return NextResponse.json({ error: 'Se requiere account' }, { status: 400 })
      }
      const locations = await listLocations(clienteId, accountName)
      return NextResponse.json({ ok: true, locations })
    }

    if (action === 'profile') {
      const locationName = searchParams.get('location')
      if (!locationName) {
        return NextResponse.json({ error: 'Se requiere location' }, { status: 400 })
      }
      const profile = await readFullProfile(clienteId, locationName)
      return NextResponse.json({ ok: true, profile })
    }

    return NextResponse.json({ error: `Accion "${action}" no reconocida` }, { status: 400 })
  } catch (error) {
    console.error('[API gbp] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

// POST /api/gbp
// Actualizar campos del GBP
// Body: { cliente_id, location, campo, valor }
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cliente_id, location, campo, valor } = body

    if (!cliente_id || !location || !campo || !valor) {
      return NextResponse.json(
        { error: 'Se requieren: cliente_id, location, campo, valor' },
        { status: 400 }
      )
    }

    const tokens = await getGoogleTokens(cliente_id)
    if (!tokens) {
      return NextResponse.json(
        { error: 'GBP no conectado para este cliente' },
        { status: 403 }
      )
    }

    let result

    switch (campo) {
      case 'descripcion':
        result = await updateDescription(cliente_id, location, valor)
        break
      case 'telefono':
        result = await updatePhone(cliente_id, location, valor)
        break
      case 'web':
        result = await updateWebsite(cliente_id, location, valor)
        break
      default:
        return NextResponse.json(
          { error: `Campo "${campo}" no soportado aún. Campos disponibles: descripcion, telefono, web` },
          { status: 400 }
        )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API gbp] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
