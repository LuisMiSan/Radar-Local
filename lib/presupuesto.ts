// Lógica de presupuesto + ROI — mock-first (sin Resend/SendGrid real)
import type { AuditResult } from './audit'

export interface MesROI {
  inversion: number
  retorno_estimado: number
  roi: string
  descripcion: string
}

export interface Presupuesto {
  id: string
  audit_id: string
  pack_recomendado: 'visibilidad_local' | 'autoridad_maps_ia'
  precio_mensual: number
  precio_fundador: number
  ahorro_mensual: number
  mejoras_esperadas: string[]
  roi_estimado: {
    mes_1: MesROI
    mes_2: MesROI
    mes_3: MesROI
  }
  incluye: string[]
  created_at: string
}

// Precios por pack
const PRECIOS: Record<string, { mensual: number; fundador: number }> = {
  visibilidad_local: { mensual: 197, fundador: 138 },
  autoridad_maps_ia: { mensual: 397, fundador: 278 },
}

// Mejoras esperadas por pack
const MEJORAS: Record<string, string[]> = {
  visibilidad_local: [
    'Aparecer en el Top 3 de Google Maps en tu zona',
    'Aumento del 40% en llamadas directas desde Maps',
    'Perfil GBP optimizado al 95%',
    'Fotos y posts semanales gestionados por tu agente IA',
    'Respuesta a todas las reseñas en menos de 24h',
  ],
  autoridad_maps_ia: [
    'Posicionamiento en ChatGPT, Gemini y Perplexity',
    'Aparecer en búsquedas por voz de Siri y Alexa',
    'Autoridad como referente local en tu categoría',
    'Schema LocalBusiness + FAQ optimizadas para IA generativa',
    'Monitorización semanal en 5 plataformas IA',
    'Todo lo incluido en Pack Visibilidad Local',
  ],
}

// Servicios incluidos por pack
const INCLUYE: Record<string, string[]> = {
  visibilidad_local: [
    'Auditoría GBP mensual',
    'Optimización NAP en +30 directorios',
    'Gestión de fotos y posts GBP (4 posts/mes)',
    'Respuesta a todas las reseñas',
    'Keywords locales activadas en perfil',
    'Informe de resultados mensual',
  ],
  autoridad_maps_ia: [
    'Todo el Pack Visibilidad Local',
    'Schema markup LocalBusiness avanzado',
    'FAQ estructuradas para LLMs (ChatGPT, Gemini)',
    'Chunks de contenido GEO/AEO optimizados',
    'Resumen de entidad para IA generativa',
    'Monitor mensual de presencia en 5 plataformas IA',
    'Informe GEO/AEO detallado',
  ],
}

// Factores ROI por categoría (x1, x2, x3 meses)
const ROI_MULTIPLIERS: Record<string, [number, number, number]> = {
  'clinica dental': [2, 6, 16],
  fisioterapia: [1.5, 4, 10],
  veterinaria: [2, 5, 12],
  peluqueria: [1.5, 3.5, 8],
  restaurante: [2, 5, 14],
  'clinica estetica': [2.5, 7, 18],
  optica: [1.5, 4, 10],
  gimnasio: [1.5, 4, 9],
  'taller mecanico': [2, 5, 12],
}

export function generatePresupuesto(audit: AuditResult): Presupuesto {
  const pack = audit.recomendacion_pack
  const precios = PRECIOS[pack]
  const categoria = audit.negocio.categoria.toLowerCase()
  const [mult1, mult2, mult3] = ROI_MULTIPLIERS[categoria] ?? [2, 5, 12]

  const inversion = precios.fundador // Precio fundador durante los 3 primeros meses

  return {
    id: `pres_${audit.id}`,
    audit_id: audit.id,
    pack_recomendado: pack,
    precio_mensual: precios.mensual,
    precio_fundador: precios.fundador,
    ahorro_mensual: precios.mensual - precios.fundador,
    mejoras_esperadas: MEJORAS[pack] ?? MEJORAS.visibilidad_local,
    roi_estimado: {
      mes_1: {
        inversion,
        retorno_estimado: Math.round(inversion * mult1),
        roi: `${mult1}x`,
        descripcion: 'Perfil optimizado, primeras mejoras en visibilidad Maps',
      },
      mes_2: {
        inversion,
        retorno_estimado: Math.round(inversion * mult2),
        roi: `${mult2}x`,
        descripcion: 'Entrando en el Top 5 de Maps, incremento de llamadas',
      },
      mes_3: {
        inversion,
        retorno_estimado: Math.round(inversion * mult3),
        roi: `${mult3}x`,
        descripcion: 'Top 3 Maps consolidado, nuevos clientes recurrentes',
      },
    },
    incluye: INCLUYE[pack] ?? INCLUYE.visibilidad_local,
    created_at: new Date().toISOString(),
  }
}

export async function sendPresupuestoEmail(
  email: string,
  presupuesto: Presupuesto,
  negocioNombre: string
): Promise<void> {
  // Mock: simular latencia de envío
  await new Promise((r) => setTimeout(r, 700))
  console.log(
    `[MOCK EMAIL] ──────────────────────────────\n` +
      `  Para: ${email}\n` +
      `  Negocio: ${negocioNombre}\n` +
      `  Pack: ${presupuesto.pack_recomendado}\n` +
      `  Precio fundador: €${presupuesto.precio_fundador}/mes\n` +
      `  ROI mes 3: ${presupuesto.roi_estimado.mes_3.roi}\n` +
      `──────────────────────────────`
  )
}
