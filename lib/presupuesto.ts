// Generación de presupuesto personalizado — mock-first
import type { AuditResult } from './audit'

export interface ROIMes {
  inversion: number
  retorno_estimado: number
  roi: string
  descripcion: string
}

export interface Presupuesto {
  pack_recomendado: 'visibilidad_local' | 'autoridad_maps_ia'
  precio_mensual: number
  precio_fundador: number
  ahorro_mensual: number
  incluye: string[]
  mejoras_esperadas: string[]
  roi_estimado: {
    mes_1: ROIMes
    mes_2: ROIMes
    mes_3: ROIMes
  }
}

const PRECIOS: Record<string, { mensual: number; fundador: number }> = {
  visibilidad_local: { mensual: 197, fundador: 138 },
  autoridad_maps_ia: { mensual: 397, fundador: 278 },
}

const INCLUYE: Record<string, string[]> = {
  visibilidad_local: [
    'Auditoría completa de tu perfil de Google Business',
    'Optimización NAP en directorios principales',
    'Investigación de keywords locales para tu zona',
    'Gestión y respuesta de reseñas (templates + estrategia)',
    'Creación de 4 posts GBP mensuales',
    'Informe mensual de rendimiento Maps',
  ],
  autoridad_maps_ia: [
    'Todo lo incluido en Visibilidad Local',
    'Generación de schema markup LocalBusiness + FAQ',
    'Creación de contenido optimizado para LLMs (GEO/AEO)',
    'Chunks semánticos para bases de conocimiento IA',
    'Ficha TL;DR de entidad para ChatGPT y Gemini',
    'Monitorización mensual de presencia en IAs',
    'Reporte ejecutivo Map Pack + GEO/AEO',
    'Informe mensual con métricas de ambos canales',
  ],
}

const MEJORAS: Record<string, string[]> = {
  visibilidad_local: [
    'Posicionamiento para aparecer en el Top 3 de Maps en tu zona',
    'Aumento estimado del 40% en llamadas desde Maps',
    'Perfil GBP optimizado al 95%+',
    'Coherencia NAP en los 10 directorios principales',
    'Estrategia de reseñas para superar a competidores',
  ],
  autoridad_maps_ia: [
    'Posicionamiento para inserción en Top 3 Maps + visibilidad en ChatGPT y Gemini',
    'Aumento estimado del 60% en contactos totales (Maps + IA)',
    'Optimización para que IAs recomienden tu negocio en tu categoría y zona',
    'Schema markup que mejora rich snippets en Google',
    'Contenido optimizado para búsquedas por voz',
    'Monitorización continua de tu presencia en LLMs',
  ],
}

export function generatePresupuesto(audit: AuditResult): Presupuesto {
  const pack = audit.recomendacion_pack
  const { mensual, fundador } = PRECIOS[pack]
  const multiplicadores =
    pack === 'autoridad_maps_ia'
      ? { m1: 2, m2: 8, m3: 20 }
      : { m1: 2, m2: 6, m3: 16 }

  return {
    pack_recomendado: pack,
    precio_mensual: mensual,
    precio_fundador: fundador,
    ahorro_mensual: mensual - fundador,
    incluye: INCLUYE[pack],
    mejoras_esperadas: MEJORAS[pack],
    roi_estimado: {
      mes_1: {
        inversion: fundador,
        retorno_estimado: fundador * multiplicadores.m1,
        roi: `${multiplicadores.m1}x`,
        descripcion: 'Optimización inicial + primeros resultados Maps',
      },
      mes_2: {
        inversion: fundador,
        retorno_estimado: fundador * multiplicadores.m2,
        roi: `${multiplicadores.m2}x`,
        descripcion: 'Posicionamiento consolidado + reseñas activas',
      },
      mes_3: {
        inversion: fundador,
        retorno_estimado: fundador * multiplicadores.m3,
        roi: `${multiplicadores.m3}x`,
        descripcion: 'Posición consolidada + captación recurrente',
      },
    },
  }
}

export function sendEmail(email: string, presupuesto: Presupuesto): void {
  console.log(`[MOCK EMAIL] Presupuesto enviado a: ${email}`)
  console.log(`  Pack: ${presupuesto.pack_recomendado}`)
  console.log(`  Precio fundador: €${presupuesto.precio_fundador}/mes`)
  console.log(`  ROI 3 meses: ${presupuesto.roi_estimado.mes_3.roi}`)
}
