import { NextResponse } from 'next/server'
import { getGoogleAuthUrl } from '@/lib/google-auth'

// GET /api/auth/google?cliente_id=xxx
// Redirige al usuario a Google para autorizar acceso al GBP
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clienteId = searchParams.get('cliente_id')

  if (!clienteId) {
    return NextResponse.json(
      { error: 'Se requiere cliente_id' },
      { status: 400 }
    )
  }

  const authUrl = getGoogleAuthUrl(clienteId)
  return NextResponse.redirect(authUrl)
}
