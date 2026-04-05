// ─────────────────────────────────────────────────────────
// ONBOARDING AUTOMÁTICO — Se ejecuta al pasar a "activo"
// ─────────────────────────────────────────────────────────
// Cuando un cliente pasa a estado "activo", este módulo:
//   1. Crea su perfil GBP inicial
//   2. Ejecuta el supervisor (11 agentes, primera ronda)
//   3. Genera el portal del cliente
//   4. Envía email de bienvenida con link al portal

import { getClientById } from './clients'
import { createProfile, getProfileByClient } from './profiles'
import { runSupervisor } from './agents/supervisor'
import { generatePortalToken } from './portal'
import { sendPortalEmail } from './email'

export interface OnboardingResult {
  clienteId: string
  steps: {
    perfil_gbp: { ok: boolean; error?: string }
    supervisor: { ok: boolean; agentes_ok?: number; agentes_error?: number; error?: string }
    portal: { ok: boolean; url?: string; error?: string }
    email: { ok: boolean; error?: string }
  }
  completado: boolean
  timestamp: string
}

export async function runOnboarding(clienteId: string): Promise<OnboardingResult> {
  const result: OnboardingResult = {
    clienteId,
    steps: {
      perfil_gbp: { ok: false },
      supervisor: { ok: false },
      portal: { ok: false },
      email: { ok: false },
    },
    completado: false,
    timestamp: new Date().toISOString(),
  }

  console.log(`[Onboarding] ▶ Iniciando onboarding para cliente ${clienteId}`)

  // ── Obtener datos del cliente ──
  const cliente = await getClientById(clienteId)
  if (!cliente) {
    console.error('[Onboarding] ✗ Cliente no encontrado:', clienteId)
    return result
  }

  console.log(`[Onboarding] Cliente: ${cliente.nombre} (${cliente.negocio})`)

  // ── Paso 1: Crear perfil GBP ──
  try {
    const existingProfile = await getProfileByClient(clienteId)
    if (existingProfile) {
      console.log('[Onboarding] ✓ Perfil GBP ya existe, saltando creación')
      result.steps.perfil_gbp = { ok: true }
    } else {
      const profile = await createProfile(clienteId, {
        nombre_gbp: cliente.negocio,
        nap_nombre: cliente.negocio,
        nap_direccion: cliente.direccion || undefined,
        nap_telefono: cliente.telefono || undefined,
      })
      result.steps.perfil_gbp = { ok: !!profile }
      console.log(profile
        ? '[Onboarding] ✓ Perfil GBP creado'
        : '[Onboarding] ✗ Error creando perfil GBP')
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    result.steps.perfil_gbp = { ok: false, error: msg }
    console.error('[Onboarding] ✗ Error en perfil GBP:', msg)
  }

  // ── Paso 2: Primera ejecución del supervisor ──
  try {
    console.log('[Onboarding] ▶ Ejecutando supervisor (primera ronda)...')
    const supervisorResult = await runSupervisor(clienteId, cliente.pack)
    const agentesOk = supervisorResult.resultados.filter(r => r.estado === 'completada').length
    const agentesError = supervisorResult.resultados.filter(r => r.estado === 'error').length
    result.steps.supervisor = { ok: true, agentes_ok: agentesOk, agentes_error: agentesError }
    console.log(`[Onboarding] ✓ Supervisor completado: ${agentesOk} OK, ${agentesError} errores`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    result.steps.supervisor = { ok: false, error: msg }
    console.error('[Onboarding] ✗ Error en supervisor:', msg)
  }

  // ── Paso 3: Generar portal ──
  try {
    const token = generatePortalToken(clienteId)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const portalUrl = `${baseUrl}/portal/${token}`
    result.steps.portal = { ok: true, url: portalUrl }
    console.log('[Onboarding] ✓ Portal generado:', portalUrl)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    result.steps.portal = { ok: false, error: msg }
    console.error('[Onboarding] ✗ Error generando portal:', msg)
  }

  // ── Paso 4: Enviar email de bienvenida ──
  if (cliente.email && result.steps.portal.url) {
    try {
      const emailResult = await sendPortalEmail({
        to: cliente.email,
        clientName: cliente.nombre,
        businessName: cliente.negocio,
        portalUrl: result.steps.portal.url,
      })
      result.steps.email = { ok: emailResult.success, error: emailResult.error }
      console.log(emailResult.success
        ? `[Onboarding] ✓ Email enviado a ${cliente.email}`
        : `[Onboarding] ✗ Error enviando email: ${emailResult.error}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      result.steps.email = { ok: false, error: msg }
      console.error('[Onboarding] ✗ Error enviando email:', msg)
    }
  } else {
    const reason = !cliente.email ? 'sin email' : 'sin URL de portal'
    result.steps.email = { ok: false, error: `Saltado: ${reason}` }
    console.log(`[Onboarding] ⚠ Email saltado: ${reason}`)
  }

  // ── Resultado final ──
  result.completado = Object.values(result.steps).every(s => s.ok)
  console.log(`[Onboarding] ${result.completado ? '✓ Onboarding completo' : '⚠ Onboarding parcial'}`)
  console.log('[Onboarding] Resultado:', JSON.stringify(result.steps, null, 2))

  return result
}
