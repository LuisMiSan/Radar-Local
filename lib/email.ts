// ─────────────────────────────────────────────────────────
// EMAIL — Envío de correos con Resend
// ─────────────────────────────────────────────────────────
// Usa Resend (https://resend.com) para enviar emails.
// Free tier: 100 emails/día, 3000/mes.
//
// Configuración necesaria en .env.local:
//   RESEND_API_KEY=re_xxxxxxxxxxxx
//   EMAIL_FROM=Radar Local <info@radarlocal.es>
//
// Si no hay API key, los emails se "simulan" (log en consola).

import 'server-only'
import { Resend } from 'resend'

// ── Configuración ──
const resendApiKey = process.env.RESEND_API_KEY
const emailFrom = process.env.EMAIL_FROM || 'Radar Local <onboarding@resend.dev>'

// Si no hay API key, usamos modo simulación
const resend = resendApiKey ? new Resend(resendApiKey) : null

// ── Función base de envío ──
async function sendEmail(params: {
  to: string
  subject: string
  html: string
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const { to, subject, html } = params

  // Modo simulación (sin API key)
  if (!resend) {
    console.log('\n📧 ═══ EMAIL SIMULADO ═══')
    console.log(`   Para: ${to}`)
    console.log(`   Asunto: ${subject}`)
    console.log(`   Desde: ${emailFrom}`)
    console.log('   (Configura RESEND_API_KEY en .env.local para envío real)')
    console.log('═══════════════════════\n')
    return { success: true, id: 'simulated-' + Date.now() }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
    })

    if (error) {
      console.error('[Email] Error:', error)
      return { success: false, error: error.message }
    }

    console.log('[Email] Enviado:', data?.id, '→', to)
    return { success: true, id: data?.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    console.error('[Email] Error:', msg)
    return { success: false, error: msg }
  }
}

// ─────────────────────────────────────────────────────────
// PLANTILLAS DE EMAIL
// ─────────────────────────────────────────────────────────

// ── Estilos compartidos ──
const STYLES = {
  wrapper: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f8f9fa; padding: 40px 20px;',
  container: 'max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);',
  header: 'background: linear-gradient(135deg, #1a2332 0%, #2a3a4e 100%); padding: 32px; text-align: center;',
  logo: 'color: #2dd4a8; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;',
  body: 'padding: 32px;',
  h1: 'color: #1a2332; font-size: 22px; font-weight: 700; margin: 0 0 16px 0; line-height: 1.3;',
  p: 'color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;',
  button: 'display: inline-block; background: #2dd4a8; color: #1a2332; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 8px; text-decoration: none;',
  footer: 'padding: 24px 32px; text-align: center; border-top: 1px solid #f1f3f5;',
  footerText: 'color: #94a3b8; font-size: 12px; margin: 0;',
  divider: 'border: none; border-top: 1px solid #f1f3f5; margin: 24px 0;',
  card: 'background: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0;',
  metric: 'color: #1a2332; font-size: 28px; font-weight: 700;',
  metricLabel: 'color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;',
}

// ── 1. Email: Enviar link del portal ──
export async function sendPortalEmail(params: {
  to: string
  clientName: string
  businessName: string
  portalUrl: string
}): Promise<{ success: boolean; error?: string }> {
  const { to, clientName, businessName, portalUrl } = params

  const html = `
  <div style="${STYLES.wrapper}">
    <div style="${STYLES.container}">
      <div style="${STYLES.header}">
        <p style="${STYLES.logo}">📍 Radar Local</p>
      </div>
      <div style="${STYLES.body}">
        <h1 style="${STYLES.h1}">Tu panel de cliente está listo</h1>
        <p style="${STYLES.p}">
          Hola ${clientName || 'estimado/a'},
        </p>
        <p style="${STYLES.p}">
          Hemos preparado tu <strong>panel personalizado</strong> donde podrás ver
          en tiempo real las métricas, tareas y progreso de la optimización de
          <strong>${businessName}</strong>.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${portalUrl}" style="${STYLES.button}">
            Ver mi panel →
          </a>
        </div>
        <div style="${STYLES.card}">
          <p style="${STYLES.p}; margin: 0; font-size: 13px;">
            <strong>💡 Consejo:</strong> Guarda este enlace en tus favoritos.
            Es tu acceso directo al panel — no necesitas contraseña.
          </p>
        </div>
        <p style="${STYLES.p}; font-size: 13px; color: #94a3b8;">
          Si tienes alguna pregunta, responde directamente a este email.
        </p>
      </div>
      <div style="${STYLES.footer}">
        <p style="${STYLES.footerText}">
          Radar Local · Optimización local con IA
        </p>
      </div>
    </div>
  </div>`

  return sendEmail({
    to,
    subject: `${businessName} — Tu panel de seguimiento está listo`,
    html,
  })
}

// ── 2. Email: Nuevo reporte mensual ──
export async function sendReportEmail(params: {
  to: string
  clientName: string
  businessName: string
  month: string
  score: number
  portalUrl: string
  highlights: string[]
}): Promise<{ success: boolean; error?: string }> {
  const { to, clientName, businessName, month, score, portalUrl, highlights } = params

  const highlightsHtml = highlights
    .map(h => `<li style="color: #64748b; font-size: 14px; margin-bottom: 6px;">✅ ${h}</li>`)
    .join('')

  const html = `
  <div style="${STYLES.wrapper}">
    <div style="${STYLES.container}">
      <div style="${STYLES.header}">
        <p style="${STYLES.logo}">📍 Radar Local</p>
        <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin: 8px 0 0 0;">Informe mensual</p>
      </div>
      <div style="${STYLES.body}">
        <h1 style="${STYLES.h1}">Informe de ${month}</h1>
        <p style="${STYLES.p}">
          Hola ${clientName || 'estimado/a'}, aquí tienes el resumen de lo que hemos
          logrado con <strong>${businessName}</strong> este mes.
        </p>

        <div style="${STYLES.card}; text-align: center;">
          <p style="${STYLES.metricLabel}">Puntuación GBP</p>
          <p style="${STYLES.metric}">${score}<span style="font-size: 16px; color: #94a3b8;">/100</span></p>
        </div>

        ${highlights.length > 0 ? `
        <h2 style="color: #1a2332; font-size: 16px; font-weight: 600; margin: 24px 0 12px 0;">
          Logros del mes
        </h2>
        <ul style="padding-left: 0; list-style: none; margin: 0;">
          ${highlightsHtml}
        </ul>
        ` : ''}

        <hr style="${STYLES.divider}" />

        <div style="text-align: center; margin: 24px 0;">
          <a href="${portalUrl}" style="${STYLES.button}">
            Ver informe completo →
          </a>
        </div>
      </div>
      <div style="${STYLES.footer}">
        <p style="${STYLES.footerText}">
          Radar Local · Optimización local con IA
        </p>
      </div>
    </div>
  </div>`

  return sendEmail({
    to,
    subject: `📊 Informe ${month} — ${businessName}`,
    html,
  })
}

// ── 3. Email: Bienvenida lead (auto, tras pedir presupuesto) ──
export async function sendWelcomeLeadEmail(params: {
  to: string
  businessName: string
  auditUrl: string
  score: number
}): Promise<{ success: boolean; error?: string }> {
  const { to, businessName, auditUrl, score } = params

  const html = `
  <div style="${STYLES.wrapper}">
    <div style="${STYLES.container}">
      <div style="${STYLES.header}">
        <p style="${STYLES.logo}">📍 Radar Local</p>
      </div>
      <div style="${STYLES.body}">
        <h1 style="${STYLES.h1}">Tu auditoría de ${businessName} está lista</h1>
        <p style="${STYLES.p}">
          Hemos analizado el posicionamiento local de tu negocio.
          Aquí tienes los resultados:
        </p>

        <div style="${STYLES.card}; text-align: center;">
          <p style="${STYLES.metricLabel}">Tu puntuación actual</p>
          <p style="${STYLES.metric}; color: ${score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'};">
            ${score}<span style="font-size: 16px; color: #94a3b8;">/100</span>
          </p>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${auditUrl}" style="${STYLES.button}">
            Ver auditoría completa →
          </a>
        </div>

        <p style="${STYLES.p}">
          Un especialista de nuestro equipo se pondrá en contacto contigo
          para explicarte cómo podemos mejorar tu visibilidad local.
        </p>

        <p style="${STYLES.p}; font-size: 13px; color: #94a3b8;">
          ¿Tienes prisa? Responde a este email y te atendemos.
        </p>
      </div>
      <div style="${STYLES.footer}">
        <p style="${STYLES.footerText}">
          Radar Local · Optimización local con IA
        </p>
      </div>
    </div>
  </div>`

  return sendEmail({
    to,
    subject: `🔍 Auditoría de ${businessName} — Puntuación: ${score}/100`,
    html,
  })
}

// ── 4. Email: Genérico (personalizable) ──
export async function sendCustomEmail(params: {
  to: string
  subject: string
  title: string
  body: string
  ctaText?: string
  ctaUrl?: string
}): Promise<{ success: boolean; error?: string }> {
  const { to, subject, title, body: bodyText, ctaText, ctaUrl } = params

  const bodyParagraphs = bodyText.split('\n').filter(Boolean)
    .map(p => `<p style="${STYLES.p}">${p}</p>`)
    .join('')

  const html = `
  <div style="${STYLES.wrapper}">
    <div style="${STYLES.container}">
      <div style="${STYLES.header}">
        <p style="${STYLES.logo}">📍 Radar Local</p>
      </div>
      <div style="${STYLES.body}">
        <h1 style="${STYLES.h1}">${title}</h1>
        ${bodyParagraphs}
        ${ctaText && ctaUrl ? `
        <div style="text-align: center; margin: 28px 0;">
          <a href="${ctaUrl}" style="${STYLES.button}">
            ${ctaText} →
          </a>
        </div>
        ` : ''}
      </div>
      <div style="${STYLES.footer}">
        <p style="${STYLES.footerText}">
          Radar Local · Optimización local con IA
        </p>
      </div>
    </div>
  </div>`

  return sendEmail({ to, subject, html })
}
