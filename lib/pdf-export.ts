'use client'

import { jsPDF } from 'jspdf'
import type { AgentResult } from './agents/types'

// ════════════════════════════════════════════════════════════
// PDF EXPORT — Genera PDF profesional programáticamente
// Sin html2canvas, sin SVG — todo con primitivas jsPDF
// ════════════════════════════════════════════════════════════

interface ExportData {
  clientName: string
  pack: string
  agentes: AgentResult[]
  reporte: AgentResult
  completados: number
  total: number
}

// Colores de marca
const C = {
  primary: [26, 35, 50] as [number, number, number],
  accent: [0, 201, 167] as [number, number, number],
  green: [16, 185, 129] as [number, number, number],
  red: [239, 68, 68] as [number, number, number],
  amber: [245, 158, 11] as [number, number, number],
  blue: [59, 130, 246] as [number, number, number],
  purple: [139, 92, 246] as [number, number, number],
  gray: [107, 114, 128] as [number, number, number],
  lightGray: [229, 231, 235] as [number, number, number],
  bg: [249, 250, 251] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
}

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 15
const CONTENT_W = PAGE_W - MARGIN * 2

export async function exportToPDF(
  _element: HTMLElement,
  options: { filename: string; title?: string; subtitle?: string },
  data?: ExportData
): Promise<void> {
  if (!data) {
    alert('No hay datos para exportar')
    return
  }

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  let y = 0

  function checkPage(needed: number) {
    if (y + needed > PAGE_H - 20) {
      addFooter()
      pdf.addPage()
      y = MARGIN
    }
  }

  function addFooter() {
    pdf.setFontSize(7)
    pdf.setTextColor(...C.gray)
    pdf.text('Informe generado por Radar Local \u2014 Plataforma de SEO Local con IA \u2014 radarlocal.es', PAGE_W / 2, PAGE_H - 8, { align: 'center' })
    pdf.setDrawColor(...C.lightGray)
    pdf.line(MARGIN, PAGE_H - 12, PAGE_W - MARGIN, PAGE_H - 12)
  }

  function drawProgressBar(x: number, yy: number, w: number, h: number, pct: number, color: [number, number, number]) {
    pdf.setFillColor(...C.lightGray)
    pdf.roundedRect(x, yy, w, h, h / 2, h / 2, 'F')
    if (pct > 0) {
      pdf.setFillColor(...color)
      pdf.roundedRect(x, yy, Math.max(h, w * Math.min(pct, 100) / 100), h, h / 2, h / 2, 'F')
    }
  }

  // ══════════════════════════════════════════════
  // PORTADA
  // ══════════════════════════════════════════════

  // Fondo oscuro superior
  pdf.setFillColor(...C.primary)
  pdf.rect(0, 0, PAGE_W, 80, 'F')

  // Linea accent
  pdf.setFillColor(...C.accent)
  pdf.rect(0, 80, PAGE_W, 3, 'F')

  // Logo
  pdf.setTextColor(...C.white)
  pdf.setFontSize(28)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Radar Local', MARGIN, 35)

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(200, 220, 215)
  pdf.text('Plataforma de SEO Local con IA', MARGIN, 43)

  // Titulo
  pdf.setTextColor(...C.white)
  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Informe SEO Local', MARGIN, 62)
  pdf.setFontSize(16)
  pdf.text(data.clientName, MARGIN, 70)

  // Fecha
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(200, 220, 215)
  const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
  pdf.text(fecha, PAGE_W - MARGIN, 35, { align: 'right' })
  pdf.text('radarlocal.es', PAGE_W - MARGIN, 42, { align: 'right' })

  // Pack badge
  const packLabel = data.pack === 'autoridad_maps_ia' ? 'Autoridad Maps + IA' : 'Visibilidad Local'
  const packColor = data.pack === 'autoridad_maps_ia' ? C.purple : C.blue
  pdf.setFillColor(...packColor)
  pdf.roundedRect(PAGE_W - MARGIN - 45, 55, 45, 8, 2, 2, 'F')
  pdf.setTextColor(...C.white)
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'bold')
  pdf.text(packLabel, PAGE_W - MARGIN - 22.5, 60.5, { align: 'center' })

  // Resumen agentes
  y = 100
  pdf.setTextColor(...C.primary)
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Resumen del analisis', MARGIN, y)
  y += 10

  pdf.setFillColor(...C.bg)
  pdf.setDrawColor(...C.lightGray)
  pdf.roundedRect(MARGIN, y, CONTENT_W, 16, 3, 3, 'FD')
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(...C.gray)
  pdf.text('Agentes ejecutados:', MARGIN + 5, y + 6)
  pdf.text('Completados:', MARGIN + 5, y + 12)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(...C.primary)
  pdf.text(`${data.total}`, MARGIN + 42, y + 6)
  pdf.setTextColor(...C.green)
  pdf.text(`${data.completados} de ${data.total}`, MARGIN + 37, y + 12)
  y += 24

  // Lista de agentes
  const agentLabels: Record<string, string> = {
    auditor_gbp: 'Auditor GBP', optimizador_nap: 'Optimizador NAP',
    keywords_locales: 'Keywords Locales', gestor_resenas: 'Gestor Resenas',
    redactor_posts_gbp: 'Redactor Posts', generador_schema: 'Generador Schema',
    creador_faq_geo: 'FAQ GEO', generador_chunks: 'Chunks IA',
    tldr_entidad: 'TL;DR Entidad', monitor_ias: 'Monitor IAs',
  }

  for (const agent of data.agentes) {
    checkPage(8)
    const label = agentLabels[agent.agente] ?? agent.agente
    const ok = agent.estado === 'completada'

    pdf.setFillColor(...(ok ? C.green : C.red))
    pdf.circle(MARGIN + 3, y + 2.5, 1.5, 'F')

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.setTextColor(...C.primary)
    pdf.text(label, MARGIN + 8, y + 4)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7)
    pdf.setTextColor(...C.gray)
    const resumenText = agent.resumen.length > 80 ? agent.resumen.slice(0, 80) + '...' : agent.resumen
    pdf.text(resumenText, MARGIN + 45, y + 4)

    y += 8
  }

  // ══════════════════════════════════════════════
  // PAGINA 2: INFORME CONSOLIDADO
  // ══════════════════════════════════════════════

  addFooter()
  pdf.addPage()
  y = MARGIN

  // Titulo
  pdf.setFillColor(...C.accent)
  pdf.rect(MARGIN, y, 3, 8, 'F')
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  pdf.setTextColor(...C.primary)
  pdf.text('Informe Consolidado', MARGIN + 7, y + 6)
  y += 14

  const reportData = data.reporte.datos
  const mapPack = reportData.metricas_map_pack as Record<string, { anterior: number | string; actual: number | string; variacion: string }> | undefined
  const geoAeo = reportData.metricas_geo_aeo as Record<string, unknown> | undefined
  const secciones = (reportData.secciones as Array<{ titulo: string; contenido: string }>) ?? []

  // Metricas Map Pack
  if (mapPack) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.setTextColor(...C.primary)
    pdf.text('Metricas Map Pack', MARGIN, y + 5)
    y += 10

    const entries = Object.entries(mapPack)
    const cardW = (CONTENT_W - (entries.length - 1) * 2) / Math.min(entries.length, 4)

    entries.slice(0, 4).forEach(([key, val], i) => {
      const x = MARGIN + i * (cardW + 2)
      const isPositive = String(val.variacion).includes('+') || String(val.variacion).toLowerCase().includes('mejora')

      pdf.setFillColor(...C.bg)
      pdf.setDrawColor(...C.lightGray)
      pdf.roundedRect(x, y, cardW, 22, 2, 2, 'FD')

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(6)
      pdf.setTextColor(...C.gray)
      pdf.text(key.replace(/_/g, ' '), x + 3, y + 5)

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.setTextColor(...C.primary)
      pdf.text(String(val.actual), x + 3, y + 14)

      pdf.setFontSize(5.5)
      pdf.setTextColor(...(isPositive ? C.green : C.red))
      pdf.text(String(val.variacion).slice(0, 35), x + 3, y + 19)
    })

    y += 28
  }

  // Metricas GEO/AEO
  if (geoAeo) {
    checkPage(30)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.setTextColor(...C.primary)
    pdf.text('Metricas GEO / AEO', MARGIN, y + 5)
    y += 10

    const geoEntries = Object.entries(geoAeo).slice(0, 5)
    const geoCardW = (CONTENT_W - (geoEntries.length - 1)) / geoEntries.length

    geoEntries.forEach(([key, val], i) => {
      const x = MARGIN + i * (geoCardW + 1)

      pdf.setFillColor(...C.bg)
      pdf.setDrawColor(...C.lightGray)
      pdf.roundedRect(x, y, geoCardW - 1, 18, 2, 2, 'FD')

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(5)
      pdf.setTextColor(...C.gray)
      pdf.text(key.replace(/_/g, ' ').slice(0, 22), x + 2, y + 5)

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.setTextColor(...C.primary)
      pdf.text(String(val).slice(0, 18), x + 2, y + 13)
    })

    y += 24
  }

  // Barras de salud
  checkPage(40)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.setTextColor(...C.primary)
  pdf.text('Salud del perfil', MARGIN, y + 5)
  y += 10

  const auditor = data.agentes.find(a => a.agente === 'auditor_gbp')
  const napAgent = data.agentes.find(a => a.agente === 'optimizador_nap')
  const gbpScore = (auditor?.datos?.puntuacion as number) ?? 0
  const napScore = (napAgent?.datos?.consistencia_pct as number) ?? 0
  const resenasCount = (data.agentes.find(a => a.agente === 'gestor_resenas')?.datos?.total as number) ?? 0
  const resenasScore = Math.min(100, resenasCount * 1.2)

  const healthBars = [
    { label: 'Perfil GBP', score: gbpScore, color: gbpScore >= 60 ? C.green : gbpScore >= 40 ? C.amber : C.red },
    { label: 'Consistencia NAP', score: napScore, color: napScore >= 60 ? C.green : napScore >= 40 ? C.amber : C.red },
    { label: 'Resenas', score: resenasScore, color: resenasScore >= 60 ? C.green : resenasScore >= 40 ? C.amber : C.red },
  ]

  for (const bar of healthBars) {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(...C.primary)
    pdf.text(bar.label, MARGIN, y + 4)

    pdf.setFont('helvetica', 'bold')
    pdf.text(`${Math.round(bar.score)}%`, MARGIN + 38, y + 4)

    drawProgressBar(MARGIN + 48, y + 1, CONTENT_W - 48, 3.5, bar.score, bar.color)

    y += 9
  }

  y += 5

  // Secciones de texto
  for (const seccion of secciones) {
    checkPage(18)

    pdf.setFillColor(...C.accent)
    pdf.rect(MARGIN, y, 2, 5, 'F')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(...C.primary)
    pdf.text(seccion.titulo, MARGIN + 5, y + 4)
    y += 8

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7.5)
    pdf.setTextColor(...C.gray)

    const lines = pdf.splitTextToSize(seccion.contenido, CONTENT_W - 5)
    for (const line of lines) {
      checkPage(4)
      pdf.text(line, MARGIN + 2, y)
      y += 3.8
    }
    y += 4
  }

  // ══════════════════════════════════════════════
  // PAGINA: DETALLE AUDITORIA GBP
  // ══════════════════════════════════════════════

  if (auditor?.datos && !auditor.datos.respuesta_raw) {
    addFooter()
    pdf.addPage()
    y = MARGIN

    pdf.setFillColor(...C.blue)
    pdf.rect(MARGIN, y, 3, 8, 'F')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.setTextColor(...C.primary)
    pdf.text('Detalle: Auditoria GBP', MARGIN + 7, y + 6)
    y += 14

    // Score
    const score = (auditor.datos.puntuacion as number) ?? 0
    const scoreColor = score >= 60 ? C.green : score >= 40 ? C.amber : C.red
    pdf.setFillColor(...C.bg)
    pdf.setDrawColor(...C.lightGray)
    pdf.roundedRect(MARGIN, y, 35, 18, 3, 3, 'FD')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(20)
    pdf.setTextColor(...scoreColor)
    pdf.text(`${score}`, MARGIN + 8, y + 12)
    pdf.setFontSize(8)
    pdf.setTextColor(...C.gray)
    pdf.text('/ 100', MARGIN + 23, y + 12)
    y += 24

    // Items
    const items = (auditor.datos.items as Array<{ campo: string; estado: string; detalle: string }>) ?? []
    for (const item of items) {
      checkPage(14)
      const statusColor = item.estado === 'ok' ? C.green : item.estado === 'mejorable' ? C.amber : C.red
      const statusLabel = item.estado === 'ok' ? 'OK' : item.estado === 'mejorable' ? 'MEJORABLE' : 'CRITICO'

      pdf.setFillColor(...statusColor)
      pdf.roundedRect(MARGIN, y, 16, 4, 1, 1, 'F')
      pdf.setFontSize(5)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(...C.white)
      pdf.text(statusLabel, MARGIN + 8, y + 3, { align: 'center' })

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(7)
      pdf.setTextColor(...C.primary)
      pdf.text(item.campo, MARGIN + 20, y + 3)
      y += 6

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(6.5)
      pdf.setTextColor(...C.gray)
      const detailLines = pdf.splitTextToSize(item.detalle, CONTENT_W - 5)
      for (const dl of detailLines.slice(0, 3)) {
        checkPage(4)
        pdf.text(dl, MARGIN + 2, y)
        y += 3.5
      }
      y += 2
    }

    // Problemas
    const problemas = (auditor.datos.problemas as string[]) ?? []
    if (problemas.length > 0) {
      checkPage(12)
      y += 3
      pdf.setFillColor(...C.red)
      pdf.rect(MARGIN, y, 2, 5, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.setTextColor(...C.primary)
      pdf.text('Problemas detectados', MARGIN + 5, y + 4)
      y += 8

      for (const prob of problemas) {
        checkPage(8)
        pdf.setFillColor(...C.red)
        pdf.circle(MARGIN + 3, y + 1.5, 1, 'F')
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(7)
        pdf.setTextColor(...C.gray)
        const pLines = pdf.splitTextToSize(prob, CONTENT_W - 10)
        for (const pl of pLines.slice(0, 2)) {
          pdf.text(pl, MARGIN + 7, y + 3)
          y += 3.5
        }
        y += 2
      }
    }

    // Recomendaciones
    const recs = (auditor.datos.recomendaciones_map_pack as string[]) ?? []
    if (recs.length > 0) {
      checkPage(12)
      y += 3
      pdf.setFillColor(...C.green)
      pdf.rect(MARGIN, y, 2, 5, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.setTextColor(...C.primary)
      pdf.text('Recomendaciones Map Pack', MARGIN + 5, y + 4)
      y += 8

      recs.forEach((rec, i) => {
        checkPage(8)
        pdf.setFillColor(...C.green)
        pdf.roundedRect(MARGIN, y, 5, 5, 1, 1, 'F')
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(6)
        pdf.setTextColor(...C.white)
        pdf.text(`${i + 1}`, MARGIN + 2.5, y + 3.5, { align: 'center' })

        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(7)
        pdf.setTextColor(...C.gray)
        const rLines = pdf.splitTextToSize(rec, CONTENT_W - 12)
        for (const rl of rLines.slice(0, 2)) {
          pdf.text(rl, MARGIN + 8, y + 3.5)
          y += 3.5
        }
        y += 2
      })
    }
  }

  addFooter()
  pdf.save(`${options.filename}.pdf`)
}
