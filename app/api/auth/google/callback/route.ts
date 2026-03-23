import { NextResponse } from 'next/server'
import { exchangeCodeForTokens, saveGoogleTokens } from '@/lib/google-auth'

// GET /api/auth/google/callback?code=xxx&state=clienteId
// Google redirige aquí después de que el usuario autorice
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const clienteId = searchParams.get('state') // Pasamos clienteId como state
  const error = searchParams.get('error')

  // Si el usuario canceló
  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/clientes/${clienteId}?gbp_error=cancelled`, request.url)
    )
  }

  if (!code || !clienteId) {
    return NextResponse.redirect(
      new URL('/admin/clientes?gbp_error=missing_params', request.url)
    )
  }

  try {
    // Intercambiar code por tokens
    const tokens = await exchangeCodeForTokens(code)

    // Guardar tokens en Supabase vinculados al cliente
    await saveGoogleTokens(clienteId, tokens)

    console.log(`[google-callback] GBP conectado para cliente ${clienteId}`)

    // Redirigir al detalle del cliente con éxito
    return NextResponse.redirect(
      new URL(`/admin/clientes/${clienteId}?gbp_connected=true`, request.url)
    )
  } catch (err) {
    console.error('[google-callback] Error:', err)
    return NextResponse.redirect(
      new URL(`/admin/clientes/${clienteId}?gbp_error=token_exchange`, request.url)
    )
  }
}
