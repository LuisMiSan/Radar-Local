// Budget/Presupuesto logic - mock-first implementation
import type { Pack } from '@/types'
import type { AuditResult } from './audit'

// Presupuesto types
export interface ROIProyection {
  mes: number
  inversion: number
  retorno_estimado: number
  roi_multiple: string // "2x", "6x", "16x", etc
}

export interface Presupuesto {
  audit_id: string
  pack_recomendado: Pack
  precio_mensual: number
  precio_fundador: number
  es_fundador: boolean
  descuento_pct: number
  roi_proyecciones: ROIProyection[]
  mejoras_esperadas: string[]
  features_incluidas: string[]
  duracion_implementacion: string // "2 semanas", "1 mes", etc
  proximos_pasos: string[]
  generado_en: string
}

// Pricing configuration
const PRICING = {
  visibilidad_local: { base: 197, fundador: 138 },
  autoridad_maps_ia: { base: 397, fundador: 278 },
}

// Features por pack
const FEATURES = {
  visibilidad_local: [
    'Auditoría completa del perfil GBP',
    'Optimización NAP (Nombre, Dirección, Teléfono)',
    'Estrategia de keywords locales',
    'Gestión y respuesta de reseñas',
    'Creación de posts GBP optimizados',
    'Reportes mensuales de evolución',
    'Soporte por email',
  ],
  autoridad_maps_ia: [
    'Todo lo del Pack Visibilidad Local +',
    'Generación de Schema JSON-LD',
    'FAQ optimizado para Gemini/ChatGPT/Perplexity',
    'Generación de chunks de contenido para LLMs',
    'Monitorización en motores generativos',
    'Reportes avanzados con métricas GEO/AEO',
    'Soporte prioritario por teléfono',
  ],
}

// Expected improvements per pack
const MEJORAS_ESPERADAS = {
  visibilidad_local: [
    'Aparecer en top 3 de Google Maps para tu zona',
    'Aumento 40% en llamadas desde Maps',
    'Perfil GBP optimizado al 95%',
    'Mejor puntuación y más reseñas',
  ],
  autoridad_maps_ia: [
    'Aparecer en top 3 de Google Maps para tu zona',
    'Recomendación en búsquedas por voz (Gemini)',
    'Menciones en ChatGPT y Perplexity',
    'Tráfico cualificado desde LLMs',
    'Posicionamiento como experto en tu categoría',
  ],
}

/**
 * Calcula ROI proyectado a 3 meses
 * Variación realista según sector
 */
function calcularROI(pack: Pack, puntuacion: number): ROIProyection[] {
  // ROI base según pack y puntuacion actual
  // Cliente con puntuacion baja = más potencial = mayor ROI
  const potencial = Math.max(1, (100 - puntuacion) / 20)

  if (pack === 'visibilidad_local') {
    // Map Pack: retorno más conservador pero rápido
    const mes1_retorno = Math.round(400 * potencial)
    const mes2_retorno = Math.round(1200 * potencial)
    const mes3_retorno = Math.round(3200 * potencial)

    return [
      {
        mes: 1,
        inversion: 197,
        retorno_estimado: mes1_retorno,
        roi_multiple: `${Math.round(mes1_retorno / 197)}x`,
      },
      {
        mes: 2,
        inversion: 197,
        retorno_estimado: mes2_retorno,
        roi_multiple: `${Math.round(mes2_retorno / 197)}x`,
      },
      {
        mes: 3,
        inversion: 197,
        retorno_estimado: mes3_retorno,
        roi_multiple: `${Math.round(mes3_retorno / 197)}x`,
      },
    ]
  } else {
    // Autoridad Maps + IA: retorno mayor (LLMs + Maps)
    const mes1_retorno = Math.round(800 * potencial)
    const mes2_retorno = Math.round(2500 * potencial)
    const mes3_retorno = Math.round(6800 * potencial)

    return [
      {
        mes: 1,
        inversion: 397,
        retorno_estimado: mes1_retorno,
        roi_multiple: `${Math.round(mes1_retorno / 397)}x`,
      },
      {
        mes: 2,
        inversion: 397,
        retorno_estimado: mes2_retorno,
        roi_multiple: `${Math.round(mes2_retorno / 397)}x`,
      },
      {
        mes: 3,
        inversion: 397,
        retorno_estimado: mes3_retorno,
        roi_multiple: `${Math.round(mes3_retorno / 397)}x`,
      },
    ]
  }
}

/**
 * Genera presupuesto basado en audit result
 */
export function generatePresupuesto(
  auditId: string,
  auditResult: AuditResult,
  esContactoFundador: boolean = false
): Presupuesto {
  const pack = auditResult.recomendacion_pack
  const pricing = PRICING[pack]
  const descuento = esContactoFundador ? 30 : 0

  const proximos_pasos =
    pack === 'visibilidad_local'
      ? [
          '1. Crear proyecto en tu Google Business Profile',
          '2. Verificar acceso con tu email de propietario',
          '3. Autorizar cambios en el perfil (enlace de seguridad)',
          '4. Comenzamos optimizaciones inmediatas',
        ]
      : [
          '1. Auditoría completa de tu perfil GBP y web',
          '2. Setup inicial: Schema JSON-LD + FAQ',
          '3. Monitorización en Gemini, ChatGPT y Perplexity',
          '4. Reportes semanales de apariciones en LLMs',
        ]

  return {
    audit_id: auditId,
    pack_recomendado: pack,
    precio_mensual: pricing.base,
    precio_fundador: pricing.fundador,
    es_fundador: esContactoFundador,
    descuento_pct: descuento,
    roi_proyecciones: calcularROI(pack, auditResult.negocio.puntuacion),
    mejoras_esperadas: MEJORAS_ESPERADAS[pack],
    features_incluidas: FEATURES[pack],
    duracion_implementacion:
      pack === 'visibilidad_local'
        ? '2-3 semanas para primeros resultados'
        : '4-6 semanas para setup completo',
    proximos_pasos,
    generado_en: new Date().toISOString(),
  }
}

/**
 * Mock email sending - en producción usaría Resend
 */
export async function sendPresupuestoEmail(
  presupuesto: Presupuesto,
  destinatario: {
    nombre: string
    email: string
    negocio: string
  }
): Promise<{ success: boolean; mensaje: string }> {
  // Mock email - en desarrollo solo loguea
  const emailContent = `
════════════════════════════════════════════════════════════
📧 [MOCK EMAIL] Presupuesto de Radar Local

TO: ${destinatario.email}
SUBJECT: Tu Presupuesto - ${destinatario.negocio}
════════════════════════════════════════════════════════════

Hola ${destinatario.nombre},

¡Gracias por solicitar el presupuesto! Aquí va el detalle:

📦 PACK: ${presupuesto.pack_recomendado === 'visibilidad_local' ? 'Visibilidad Local' : 'Autoridad Maps + IA'}

💰 INVERSIÓN:
   • Precio base: €${presupuesto.precio_mensual}/mes
   ${presupuesto.es_fundador ? `• Tu precio (fundador): €${presupuesto.precio_fundador}/mes (30% descuento)` : ''}

📊 ROI PROYECTADO A 3 MESES:
${presupuesto.roi_proyecciones.map((r) => `   Mes ${r.mes}: €${r.retorno_estimado} retorno estimado (${r.roi_multiple})`).join('\n')}

✨ MEJORAS ESPERADAS:
${presupuesto.mejoras_esperadas.map((m) => `   • ${m}`).join('\n')}

🔧 FEATURES INCLUIDAS:
${presupuesto.features_incluidas.map((f) => `   • ${f}`).join('\n')}

⏱️ DURACIÓN: ${presupuesto.duracion_implementacion}

👉 PRÓXIMOS PASOS:
${presupuesto.proximos_pasos.map((p) => `   ${p}`).join('\n')}

¿Preguntas? Respondé este email y nos contactamos en 24h.

Un abrazo,
Radar Local Team
════════════════════════════════════════════════════════════
  `

  console.log(emailContent)

  return {
    success: true,
    mensaje: `Presupuesto mock enviado a ${destinatario.email}`,
  }
}

// In-memory presupuesto store
const PRESUPUESTO_STORE = new Map<string, Presupuesto>()

export function savePresupuesto(presupuesto: Presupuesto): void {
  PRESUPUESTO_STORE.set(presupuesto.audit_id, presupuesto)
}

export function getPresupuestoByAuditId(
  auditId: string
): Presupuesto | undefined {
  return PRESUPUESTO_STORE.get(auditId)
}
