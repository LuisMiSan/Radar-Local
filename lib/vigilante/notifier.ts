// Notifier: email Resend + WhatsApp CallMeBot para alertas críticas del Vigilante

import { Resend } from 'resend'
import type { CambioAnalizado } from './analyzer'

const resend = new Resend(process.env.RESEND_API_KEY)

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'luismigsm@gmail.com'
const FROM_EMAIL = process.env.RESEND_FROM ?? 'Radar Local <noreply@radarlocal.es>'

// ── Email ─────────────────────────────────────────────────────

export async function sendVigilanteEmail(
  cambios: CambioAnalizado[],
  fecha: string
): Promise<void> {
  if (!cambios.length) return

  const criticos = cambios.filter((c) => c.impacto_estimado === 'critico')
  const importantes = cambios.filter((c) => c.impacto_estimado === 'importante')
  const info = cambios.filter((c) => c.impacto_estimado === 'info')

  const impactoEmoji = (i: string) =>
    i === 'critico' ? '🔴' : i === 'importante' ? '🟡' : '🟢'

  const renderItems = (items: CambioAnalizado[]) =>
    items
      .map(
        (c) => `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">
            <strong>${impactoEmoji(c.impacto_estimado)} ${c.titulo}</strong><br/>
            <span style="color:#6b7280;font-size:13px;">${c.resumen}</span><br/>
            <span style="color:#3b82f6;font-size:12px;">→ ${c.propuesta}</span>
            ${c.url ? `<br/><a href="${c.url}" style="color:#9ca3af;font-size:11px;">${c.url}</a>` : ''}
          </td>
        </tr>`
      )
      .join('')

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:20px;">
  <div style="max-width:640px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#111827;padding:24px;color:white;">
      <h1 style="margin:0;font-size:20px;">🛡️ Agente Vigilante — ${fecha}</h1>
      <p style="margin:8px 0 0;color:#9ca3af;font-size:14px;">${cambios.length} cambio(s) detectado(s) — ${criticos.length} críticos, ${importantes.length} importantes</p>
    </div>

    <div style="padding:24px;">
      ${
        criticos.length
          ? `<h3 style="color:#dc2626;margin:0 0 8px;">🔴 Críticos (${criticos.length})</h3>
             <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fee2e2;border-radius:8px;margin-bottom:20px;">${renderItems(criticos)}</table>`
          : ''
      }
      ${
        importantes.length
          ? `<h3 style="color:#d97706;margin:0 0 8px;">🟡 Importantes (${importantes.length})</h3>
             <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fef3c7;border-radius:8px;margin-bottom:20px;">${renderItems(importantes)}</table>`
          : ''
      }
      ${
        info.length
          ? `<h3 style="color:#059669;margin:0 0 8px;">🟢 Informativos (${info.length})</h3>
             <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d1fae5;border-radius:8px;margin-bottom:20px;">${renderItems(info)}</table>`
          : ''
      }

      <a href="https://radar-local.vercel.app/admin/vigilante"
         style="display:inline-block;background:#111827;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px;">
        Revisar y aprobar cambios →
      </a>
    </div>

    <div style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">Radar Local · Agente Vigilante · Ejecución automática diaria</p>
    </div>
  </div>
</body>
</html>`

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🛡️ Vigilante ${fecha}: ${criticos.length ? `${criticos.length} crítico(s)` : `${cambios.length} cambio(s)`}`,
      html,
    })
  } catch (err) {
    console.error('[vigilante] Error enviando email:', err)
  }
}

// ── WhatsApp CallMeBot ────────────────────────────────────────
// Solo se envía si hay cambios críticos o importantes

export async function sendWhatsApp(cambios: CambioAnalizado[]): Promise<void> {
  const apiKey = process.env.CALLMEBOT_API_KEY
  const phone = process.env.CALLMEBOT_PHONE // formato: 34XXXXXXXXX

  if (!apiKey || !phone) {
    console.warn('[vigilante] CallMeBot no configurado (CALLMEBOT_API_KEY + CALLMEBOT_PHONE)')
    return
  }

  const criticos = cambios.filter((c) => c.impacto_estimado === 'critico')
  const importantes = cambios.filter((c) => c.impacto_estimado === 'importante')

  if (!criticos.length && !importantes.length) return

  const lineas = [
    `🛡️ *Radar Vigilante*`,
    criticos.length ? `🔴 ${criticos.length} crítico(s): ${criticos.map((c) => c.titulo).join(', ')}` : '',
    importantes.length ? `🟡 ${importantes.length} importante(s): ${importantes.map((c) => c.titulo).join(', ')}` : '',
    `→ radar-local.vercel.app/admin/vigilante`,
  ]
    .filter(Boolean)
    .join('\n')

  const message = encodeURIComponent(lineas)

  try {
    await fetch(
      `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${message}&apikey=${apiKey}`,
      { signal: AbortSignal.timeout(8_000) }
    )
  } catch (err) {
    console.error('[vigilante] Error enviando WhatsApp:', err)
  }
}
