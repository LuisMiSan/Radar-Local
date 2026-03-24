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

// ── 4. Email: Presupuesto completo (auditoría + presupuesto + CTA) ──
export async function sendPresupuestoCompleteEmail(params: {
  to: string
  contactName: string
  businessName: string
  zona: string
  score: number
  competidores: { nombre: string; puntuacion: number }[]
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

  const gapsHtml = gaps.map(g => {
    const color = g.impacto === 'critica' ? '#ef4444' : g.impacto === 'alta' ? '#f97316' : g.impacto === 'media' ? '#f59e0b' : '#3b82f6'
    return `<tr>
      <td style="padding: 8px 12px; font-size: 14px; color: #334155; border-bottom: 1px solid #f1f5f9;">${g.area}</td>
      <td style="padding: 8px 12px; font-size: 12px; border-bottom: 1px solid #f1f5f9;"><span style="background: ${color}15; color: ${color}; padding: 2px 8px; border-radius: 4px; font-weight: 600;">${g.impacto}</span></td>
    </tr>`
  }).join('')

  const compHtml = competidores.map(c =>
    `<div style="text-align: center; flex: 1;">
      <p style="font-size: 28px; font-weight: 700; color: #1a2332; margin: 0;">${c.puntuacion}</p>
      <p style="font-size: 12px; color: #94a3b8; margin: 4px 0 0 0;">${c.nombre}</p>
    </div>`
  ).join('')

  const roiHtml = roi.map(r =>
    `<td style="text-align: center; padding: 12px;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0 0 4px 0;">Mes ${r.mes}</p>
      <p style="font-size: 24px; font-weight: 700; color: #22c55e; margin: 0;">${r.roi_multiple}</p>
      <p style="font-size: 13px; color: #334155; margin: 4px 0 0 0;">€${r.retorno_estimado.toLocaleString('es-ES')}</p>
    </td>`
  ).join('')

  const featuresHtml = features.map(f =>
    `<li style="color: #475569; font-size: 14px; margin-bottom: 6px; padding-left: 4px;">✅ ${f}</li>`
  ).join('')

  const mejorasHtml = mejoras.map(m =>
    `<li style="color: #475569; font-size: 14px; margin-bottom: 6px; padding-left: 4px;">🎯 ${m}</li>`
  ).join('')

  const html = `
  <div style="${STYLES.wrapper}">
    <div style="${STYLES.container}">
      <!-- Header -->
      <div style="${STYLES.header}">
        <p style="${STYLES.logo}">📍 Radar Local</p>
        <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin: 8px 0 0 0;">Auditoría + Presupuesto personalizado</p>
      </div>

      <div style="${STYLES.body}">
        <!-- Agradecimiento -->
        <h1 style="${STYLES.h1}">¡Gracias por confiar en nosotros, ${contactName || 'estimado/a'}!</h1>
        <p style="${STYLES.p}">
          Hemos analizado el posicionamiento de <strong>${businessName}</strong> en ${zona}.
          Aquí tienes tu auditoría completa y el presupuesto personalizado.
        </p>

        <!-- ═══ SECCIÓN 1: AUDITORÍA ═══ -->
        <div style="background: linear-gradient(135deg, #1a2332, #2a3a4e); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
          <p style="color: rgba(255,255,255,0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Tu puntuación actual</p>
          <p style="font-size: 48px; font-weight: 700; color: ${scoreColor}; margin: 0;">${score}<span style="font-size: 20px; color: rgba(255,255,255,0.4);">/100</span></p>
        </div>

        <!-- Comparativa competidores -->
        <div style="${STYLES.card}">
          <p style="font-size: 13px; font-weight: 600; color: #1a2332; margin: 0 0 12px 0;">Tu posición vs competidores</p>
          <div style="display: flex; justify-content: space-around;">
            <div style="text-align: center;">
              <p style="font-size: 32px; font-weight: 700; color: ${scoreColor}; margin: 0;">${score}</p>
              <p style="font-size: 12px; color: #94a3b8; margin: 4px 0 0 0;">${businessName}</p>
            </div>
            ${compHtml}
          </div>
        </div>

        <!-- Gaps detectados -->
        <h2 style="color: #1a2332; font-size: 16px; font-weight: 600; margin: 24px 0 12px 0;">⚠️ Gaps detectados</h2>
        <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 8px; overflow: hidden;">
          <tr style="background: #f1f5f9;">
            <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #64748b; font-weight: 600;">Área</th>
            <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #64748b; font-weight: 600;">Impacto</th>
          </tr>
          ${gapsHtml}
        </table>

        <hr style="${STYLES.divider}" />

        <!-- ═══ SECCIÓN 2: PRESUPUESTO ═══ -->
        <h2 style="color: #1a2332; font-size: 18px; font-weight: 700; margin: 0 0 4px 0;">💰 Tu presupuesto: ${packLabel}</h2>
        <p style="${STYLES.p}; margin-top: 4px;">
          ${pack === 'visibilidad_local'
            ? 'Posicionamiento en el Top 3 de Google Maps y Apple Maps.'
            : 'Map Pack + Presencia en ChatGPT, Gemini y búsquedas por voz.'}
        </p>

        <!-- Precio -->
        <div style="background: linear-gradient(135deg, #059669, #10b981); border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center; color: white;">
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0; opacity: 0.7;">Precio especial fundador</p>
          <p style="font-size: 42px; font-weight: 700; margin: 0;">€${precioFundador}<span style="font-size: 16px; opacity: 0.7;">/mes</span></p>
          <p style="font-size: 14px; margin: 4px 0 0 0; opacity: 0.8;"><s>€${precioMensual}/mes</s> · 30% descuento · Solo primeros 10 clientes</p>
        </div>

        <!-- ROI -->
        <h3 style="color: #1a2332; font-size: 15px; font-weight: 600; margin: 20px 0 8px 0;">📊 ROI estimado a 3 meses</h3>
        <table style="width: 100%; background: #f0fdf4; border-radius: 8px; overflow: hidden;">
          <tr>${roiHtml}</tr>
        </table>
        <p style="font-size: 11px; color: #94a3b8; margin: 4px 0 0 0; text-align: center;">* Basado en resultados medios en tu categoría</p>

        <!-- Features -->
        <h3 style="color: #1a2332; font-size: 15px; font-weight: 600; margin: 20px 0 8px 0;">¿Qué incluye?</h3>
        <ul style="padding-left: 0; list-style: none; margin: 0;">${featuresHtml}</ul>

        <!-- Mejoras -->
        <h3 style="color: #1a2332; font-size: 15px; font-weight: 600; margin: 20px 0 8px 0;">Mejoras que conseguirás</h3>
        <ul style="padding-left: 0; list-style: none; margin: 0;">${mejorasHtml}</ul>

        <hr style="${STYLES.divider}" />

        <!-- CTA -->
        <div style="text-align: center; margin: 28px 0;">
          <p style="${STYLES.p}; font-weight: 600; color: #1a2332;">
            ¿Listo para superar a tu competencia?
          </p>
          <a href="https://wa.me/34641407318?text=${encodeURIComponent(`Hola! Soy ${contactName || 'cliente'} de ${businessName}. He recibido la auditoría y me gustaría agendar una llamada para hablar del presupuesto.`)}" style="${STYLES.button}; font-size: 16px; padding: 14px 32px; background: #25D366; color: white;">
            💬 Agendar por WhatsApp →
          </a>
          <p style="font-size: 13px; color: #94a3b8; margin: 12px 0 0 0;">
            15 minutos · Sin compromiso · Te explicamos el plan paso a paso
          </p>
          <p style="margin: 12px 0 0 0;">
            <a href="mailto:hola@radarlocal.es?subject=Quiero%20empezar%20-%20${encodeURIComponent(businessName)}" style="font-size: 13px; color: #2dd4a8; text-decoration: underline;">
              O escríbenos por email →
            </a>
          </p>
        </div>

        <!-- Link auditoría eliminado: ya se adjunta PDF -->
      </div>

      <div style="${STYLES.footer}">
        <p style="${STYLES.footerText}">
          Radar Local Agency · Posicionamiento Map Pack + GEO/AEO para negocios locales
        </p>
        <p style="${STYLES.footerText}; margin-top: 8px;">
          ¿Preguntas? Responde a este email o escríbenos a hola@radarlocal.es
        </p>
      </div>
    </div>
  </div>`

  // Generar PDFs adjuntos
  const auditPDF = generateAuditPDF(auditResult)
  const presupuestoPDF = generatePresupuestoPDF(auditResult, presupuesto)

  return sendEmail({
    to,
    subject: `🔍 Auditoría + Presupuesto — ${businessName} (${score}/100)`,
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
