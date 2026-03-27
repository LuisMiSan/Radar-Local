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
import { generateAuditPDF, generatePresupuestoPDF } from './pdf-server'
import type { AuditResult } from './audit'
import type { Presupuesto } from './presupuesto'

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
  attachments?: { filename: string; content: Buffer }[]
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const { to, subject, html, attachments } = params

  // Modo simulación (sin API key)
  if (!resend) {
    console.log('\n📧 ═══ EMAIL SIMULADO ═══')
    console.log(`   Para: ${to}`)
    console.log(`   Asunto: ${subject}`)
    console.log(`   Desde: ${emailFrom}`)
    if (attachments?.length) {
      console.log(`   Adjuntos: ${attachments.map(a => a.filename).join(', ')}`)
    }
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
      attachments: attachments?.map(a => ({
        filename: a.filename,
        content: a.content,
      })),
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

// ── Helper: limpiar nombre que sea URL ──
function cleanName(nombre: string): string {
  if (nombre.includes('google.com/maps') || nombre.startsWith('http')) {
    const placeMatch = nombre.match(/\/place\/([^/]+)/)
    if (placeMatch) return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
    return 'Competidor'
  }
  return nombre
}

// ── 4. Email: Presupuesto completo (auditoría + presupuesto + CTA) ──
export async function sendPresupuestoCompleteEmail(params: {
  to: string
  contactName: string
  businessName: string
  zona: string
  score: number
  competidores: { nombre: string; puntuacion: number; google_maps_url?: string }[]
  gaps: { area: string; impacto: string }[]
  pack: string
  precioMensual: number
  precioFundador: number
  roi: { mes: number; retorno_estimado: number; roi_multiple: string }[]
  features: string[]
  mejoras: string[]
  auditUrl: string
  auditResult: AuditResult
  presupuesto: Presupuesto
}): Promise<{ success: boolean; error?: string }> {
  const {
    to, contactName, businessName, zona, score,
    competidores, gaps, pack, precioMensual, precioFundador,
    roi, features, mejoras, auditResult, presupuesto,
  } = params

  const packLabel = pack === 'visibilidad_local' ? 'Visibilidad Local' : 'Autoridad Maps + IA'
  const scoreColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'

  // Limpiar nombres de competidores (por si vienen como URLs de auditorías antiguas)
  const comps = competidores.map(c => ({
    nombre: cleanName(c.nombre),
    puntuacion: c.puntuacion,
    color: c.puntuacion >= 70 ? '#22c55e' : c.puntuacion >= 40 ? '#f59e0b' : '#ef4444',
    mapsUrl: c.google_maps_url || `https://www.google.com/maps/search/${encodeURIComponent(cleanName(c.nombre) + ' ' + zona)}`,
  }))

  // ── Secciones HTML ──
  const scoreCircle = (value: number, color: string, size: number) => {
    const circleSize = size
    return `<td style="text-align: center; vertical-align: top; padding: 0 8px;">
      <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
        <tr><td style="width: ${circleSize}px; height: ${circleSize}px; border-radius: 50%; border: 4px solid ${color}; text-align: center; vertical-align: middle;">
          <span style="font-size: ${size === 80 ? 28 : 20}px; font-weight: 700; color: ${color}; line-height: ${circleSize}px;">${value}</span>
        </td></tr>
      </table>`
  }

  const gapsHtml = gaps.map(g => {
    const impactoColors: Record<string, { bg: string; text: string }> = {
      critica: { bg: '#fef2f2', text: '#dc2626' },
      alta: { bg: '#fff7ed', text: '#ea580c' },
      media: { bg: '#fffbeb', text: '#d97706' },
      baja: { bg: '#eff6ff', text: '#2563eb' },
    }
    const ic = impactoColors[g.impacto] || impactoColors.media
    return `<tr>
      <td style="padding: 10px 14px; font-size: 14px; color: #1e293b; border-bottom: 1px solid #f1f5f9; font-weight: 500;">${g.area}</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; text-align: right;">
        <span style="background: ${ic.bg}; color: ${ic.text}; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${g.impacto}</span>
      </td>
    </tr>`
  }).join('')

  const roiHtml = roi.map(r =>
    `<td style="text-align: center; padding: 16px 8px; width: 33%;">
      <p style="font-size: 11px; color: #94a3b8; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">Mes ${r.mes}</p>
      <p style="font-size: 28px; font-weight: 700; color: #059669; margin: 0; line-height: 1;">${r.roi_multiple}</p>
      <p style="font-size: 13px; color: #1e293b; margin: 6px 0 0 0; font-weight: 500;">&euro;${r.retorno_estimado.toLocaleString('es-ES')}</p>
      <p style="font-size: 11px; color: #94a3b8; margin: 2px 0 0 0;">Inversi&oacute;n: &euro;${precioFundador}</p>
    </td>`
  ).join('')

  const featuresHtml = features.map(f =>
    `<tr><td style="padding: 5px 0; font-size: 14px; color: #334155; line-height: 1.5;">
      <span style="color: #10b981; margin-right: 8px;">&#10003;</span>${f}
    </td></tr>`
  ).join('')

  const mejorasHtml = mejoras.map(m =>
    `<tr><td style="padding: 5px 0; font-size: 14px; color: #334155; line-height: 1.5;">
      <span style="color: #059669; margin-right: 8px;">&#9678;</span>${m}
    </td></tr>`
  ).join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f1f5f9;">
    <tr><td align="center" style="padding: 32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">

        <!-- ═══ HEADER ═══ -->
        <tr><td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 32px; text-align: center;">
          <p style="margin: 0; font-size: 22px; font-weight: 700; color: #2dd4a8; letter-spacing: -0.5px;">&#x1F4CD; Radar Local</p>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.5);">Auditor&iacute;a + Presupuesto personalizado</p>
        </td></tr>

        <!-- ═══ BODY ═══ -->
        <tr><td style="padding: 32px;">

          <!-- Saludo -->
          <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
            &iexcl;Gracias por confiar en nosotros, ${contactName || 'estimado/a'}!
          </h1>
          <p style="margin: 0 0 24px 0; font-size: 15px; color: #64748b; line-height: 1.6;">
            Hemos analizado el posicionamiento de <strong style="color: #0f172a;">${businessName}</strong> en ${zona}. Aqu&iacute; tienes la auditor&iacute;a completa y el presupuesto personalizado.
          </p>

          <!-- ═══ PUNTUACIÓN ═══ -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 12px; margin-bottom: 24px;">
            <tr><td style="padding: 28px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1.5px;">Tu puntuaci&oacute;n actual</p>
              <p style="margin: 0; font-size: 56px; font-weight: 800; color: ${scoreColor}; line-height: 1;">${score}<span style="font-size: 20px; color: rgba(255,255,255,0.3);">/100</span></p>
            </td></tr>
          </table>

          <!-- ═══ COMPARATIVA ═══ -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #f8fafc; border-radius: 12px; margin-bottom: 24px;">
            <tr><td style="padding: 20px 16px 8px 16px;">
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #0f172a; text-align: center;">Tu posici&oacute;n vs competidores</p>
            </td></tr>
            <tr><td style="padding: 12px 0 20px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  ${comps[0] ? `${scoreCircle(comps[0].puntuacion, comps[0].color, 60)}
                    <p style="margin: 8px 0 2px 0; font-size: 12px; font-weight: 600; color: #334155; text-align: center;">${comps[0].nombre}</p>
                    <p style="margin: 0; text-align: center;"><a href="${comps[0].mapsUrl}" style="font-size: 10px; color: #2dd4a8; text-decoration: none;">&#x1F4CD; Ver en Maps</a></p>
                  </td>` : ''}

                  ${scoreCircle(score, scoreColor, 80)}
                    <p style="margin: 8px 0 2px 0; font-size: 13px; font-weight: 700; color: #0f172a; text-align: center;">${businessName}</p>
                    <p style="margin: 0; font-size: 10px; color: #94a3b8; text-align: center;">Tu negocio</p>
                  </td>

                  ${comps[1] ? `${scoreCircle(comps[1].puntuacion, comps[1].color, 60)}
                    <p style="margin: 8px 0 2px 0; font-size: 12px; font-weight: 600; color: #334155; text-align: center;">${comps[1].nombre}</p>
                    <p style="margin: 0; text-align: center;"><a href="${comps[1].mapsUrl}" style="font-size: 10px; color: #2dd4a8; text-decoration: none;">&#x1F4CD; Ver en Maps</a></p>
                  </td>` : ''}
                </tr>
              </table>
            </td></tr>
          </table>

          <!-- Alerta si puntúa bajo -->
          ${score < 60 ? `
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #fef2f2; border-radius: 8px; margin-bottom: 24px;">
            <tr><td style="padding: 12px 16px;">
              <p style="margin: 0; font-size: 13px; color: #991b1b;">
                <strong>&#x26A0; Est&aacute;s ${Math.round((comps.reduce((s, c) => s + c.puntuacion, 0) / comps.length) - score)} puntos por debajo</strong> de la media de tus competidores. Est&aacute;s perdiendo clientes en Google Maps.
              </p>
            </td></tr>
          </table>` : ''}

          <!-- ═══ GAPS ═══ -->
          <h2 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0f172a;">
            &#x26A0;&#xFE0F; Gaps detectados
          </h2>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #f8fafc; border-radius: 10px; overflow: hidden; margin-bottom: 28px;">
            <tr style="background: #e2e8f0;">
              <th style="padding: 10px 14px; text-align: left; font-size: 11px; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">&Aacute;rea</th>
              <th style="padding: 10px 14px; text-align: right; font-size: 11px; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Impacto</th>
            </tr>
            ${gapsHtml}
          </table>

          <!-- ═══ SEPARADOR ═══ -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr><td style="padding: 4px 0;"><hr style="border: none; border-top: 2px solid #e2e8f0; margin: 0;"></td></tr>
          </table>

          <!-- ═══ PRESUPUESTO ═══ -->
          <h2 style="margin: 24px 0 4px 0; font-size: 18px; font-weight: 700; color: #0f172a;">
            &#x1F4B0; Tu presupuesto: ${packLabel}
          </h2>
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #64748b; line-height: 1.5;">
            ${pack === 'visibilidad_local'
              ? 'Posicionamiento en el Top 3 de Google Maps y Apple Maps.'
              : 'Map Pack + Presencia en ChatGPT, Gemini y b&uacute;squedas por voz.'}
          </p>

          <!-- Precio -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #059669, #10b981); border-radius: 12px; margin-bottom: 24px;">
            <tr><td style="padding: 24px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1.5px;">Precio especial fundador</p>
              <p style="margin: 0; font-size: 48px; font-weight: 800; color: #ffffff; line-height: 1.1;">
                &euro;${precioFundador}<span style="font-size: 16px; font-weight: 400; opacity: 0.7;">/mes</span>
              </p>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.8);">
                <s style="opacity: 0.6;">&euro;${precioMensual}/mes</s> &middot; 30% descuento &middot; Solo primeros 10 clientes
              </p>
            </td></tr>
          </table>

          <!-- ROI -->
          <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #0f172a;">
            &#x1F4CA; ROI estimado a 3 meses
          </h3>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #f0fdf4; border-radius: 10px; overflow: hidden; margin-bottom: 4px;">
            <tr>${roiHtml}</tr>
          </table>
          <p style="font-size: 10px; color: #94a3b8; margin: 4px 0 24px 0; text-align: center;">* Estimaciones basadas en resultados medios en tu categor&iacute;a</p>

          <!-- Features -->
          <h3 style="margin: 0 0 10px 0; font-size: 15px; font-weight: 700; color: #0f172a;">
            &iquest;Qu&eacute; incluye el pack?
          </h3>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
            ${featuresHtml}
          </table>

          <!-- Mejoras -->
          <h3 style="margin: 0 0 10px 0; font-size: 15px; font-weight: 700; color: #0f172a;">
            Mejoras que conseguir&aacute;s
          </h3>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;">
            ${mejorasHtml}
          </table>

          <!-- ═══ SEPARADOR ═══ -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr><td style="padding: 4px 0;"><hr style="border: none; border-top: 2px solid #e2e8f0; margin: 0;"></td></tr>
          </table>

          <!-- ═══ CTA ═══ -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 24px;">
            <tr><td style="text-align: center;">
              <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a;">
                &iquest;Listo para superar a tu competencia?
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                <tr><td style="background: #25D366; border-radius: 10px;">
                  <a href="https://wa.me/34641407318?text=${encodeURIComponent(`Hola! Soy ${contactName || 'cliente'} de ${businessName}. He recibido la auditoría y me gustaría agendar una llamada para hablar del presupuesto.`)}" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">
                    &#x1F4AC; Agendar por WhatsApp
                  </a>
                </td></tr>
              </table>
              <p style="margin: 12px 0 0 0; font-size: 13px; color: #94a3b8;">
                15 minutos &middot; Sin compromiso &middot; Te explicamos el plan paso a paso
              </p>
              <p style="margin: 8px 0 0 0;">
                <a href="mailto:hola@radarlocal.es?subject=Quiero%20empezar%20-%20${encodeURIComponent(businessName)}" style="font-size: 13px; color: #2dd4a8; text-decoration: underline;">
                  O escr&iacute;benos por email &rarr;
                </a>
              </p>
            </td></tr>
          </table>

        </td></tr>

        <!-- ═══ FOOTER ═══ -->
        <tr><td style="padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; background: #f8fafc;">
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">
            Radar Local Agency &middot; Posicionamiento Map Pack + GEO/AEO para negocios locales
          </p>
          <p style="margin: 6px 0 0 0; font-size: 12px; color: #94a3b8;">
            &iquest;Preguntas? Responde a este email o escr&iacute;benos a
            <a href="mailto:hola@radarlocal.es" style="color: #2dd4a8; text-decoration: none;">hola@radarlocal.es</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  // Generar PDFs adjuntos
  const auditPDF = generateAuditPDF(auditResult)
  const presupuestoPDF = generatePresupuestoPDF(auditResult, presupuesto)

  return sendEmail({
    to,
    subject: `Auditor\u00eda + Presupuesto \u2014 ${businessName} (${score}/100)`,
    html,
    attachments: [
      { filename: `Auditoria-${businessName.replace(/\s+/g, '-')}.pdf`, content: auditPDF },
      { filename: `Presupuesto-${businessName.replace(/\s+/g, '-')}.pdf`, content: presupuestoPDF },
    ],
  })
}

// ── 5. Email: Genérico (personalizable) ──
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
