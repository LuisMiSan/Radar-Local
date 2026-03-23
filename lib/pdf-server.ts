import 'server-only'
import { jsPDF } from 'jspdf'
import type { AuditResult } from './audit'
import type { Presupuesto } from './presupuesto'

// Colores de marca
const C = {
  primary: [26, 35, 50] as [number, number, number],
  accent: [0, 201, 167] as [number, number, number],
  green: [16, 185, 129] as [number, number, number],
  red: [239, 68, 68] as [number, number, number],
  amber: [245, 158, 11] as [number, number, number],
  gray: [107, 114, 128] as [number, number, number],
  lightGray: [229, 231, 235] as [number, number, number],
  bg: [249, 250, 251] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
}

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 15
const CONTENT_W = PAGE_W - MARGIN * 2

function addHeader(pdf: jsPDF, title: string, subtitle: string) {
  // Fondo oscuro
  pdf.setFillColor(...C.primary)
  pdf.rect(0, 0, PAGE_W, 55, 'F')
  // Linea accent
  pdf.setFillColor(...C.accent)
  pdf.rect(0, 55, PAGE_W, 2, 'F')
  // Logo
  pdf.setTextColor(...C.white)
  pdf.setFontSize(22)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Radar Local', MARGIN, 25)
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(200, 220, 215)
  pdf.text('Posicionamiento Map Pack + GEO/AEO', MARGIN, 32)
  // Titulo
  pdf.setTextColor(...C.white)
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text(title, MARGIN, 44)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(subtitle, MARGIN, 51)
  // Fecha
  pdf.setFontSize(8)
  pdf.setTextColor(200, 220, 215)
  const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
  pdf.text(fecha, PAGE_W - MARGIN, 25, { align: 'right' })
}

function addFooter(pdf: jsPDF) {
  pdf.setFontSize(7)
  pdf.setTextColor(...C.gray)
  pdf.text('Radar Local Agency \u2014 radarlocal.es \u2014 hola@radarlocal.es', PAGE_W / 2, PAGE_H - 8, { align: 'center' })
  pdf.setDrawColor(...C.lightGray)
  pdf.line(MARGIN, PAGE_H - 12, PAGE_W - MARGIN, PAGE_H - 12)
}

// ════════════════════════════════════════════
// PDF AUDITORÍA
// ════════════════════════════════════════════
export function generateAuditPDF(audit: AuditResult): Buffer {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  let y = 0

  function checkPage(needed: number) {
    if (y + needed > PAGE_H - 20) {
      addFooter(pdf)
      pdf.addPage()
      y = MARGIN
    }
  }

  // Portada
  addHeader(pdf, 'Auditoría de Google Business Profile', `${audit.negocio.nombre} \u2014 ${audit.negocio.zona}`)
  y = 70

  // Puntuación principal
  const score = audit.negocio.puntuacion
  const scoreColor = score >= 70 ? C.green : score >= 40 ? C.amber : C.red

  pdf.setFillColor(...C.bg)
  pdf.setDrawColor(...C.lightGray)
  pdf.roundedRect(MARGIN, y, CONTENT_W, 30, 4, 4, 'FD')

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.setTextColor(...C.gray)
  pdf.text('Tu puntuación', MARGIN + 8, y + 10)

  pdf.setFontSize(32)
  pdf.setTextColor(...scoreColor)
  pdf.text(`${score}`, MARGIN + 8, y + 24)

  pdf.setFontSize(12)
  pdf.setTextColor(...C.gray)
  pdf.text('/ 100', MARGIN + 28, y + 24)

  // Competidores al lado
  const compX = MARGIN + 70
  pdf.setFontSize(10)
  pdf.setTextColor(...C.gray)
  pdf.setFont('helvetica', 'normal')
  pdf.text('vs Competidores:', compX, y + 10)

  audit.competidores.forEach((comp, i) => {
    const cx = compX + (i * 50)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(18)
    pdf.setTextColor(...C.primary)
    pdf.text(`${comp.puntuacion}`, cx, y + 24)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7)
    pdf.setTextColor(...C.gray)
    pdf.text(comp.nombre.substring(0, 20), cx, y + 28)
  })

  y += 40

  // Gaps detectados
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  pdf.setTextColor(...C.primary)
  pdf.text('Gaps detectados', MARGIN, y)
  y += 8

  for (const gap of audit.gaps) {
    checkPage(18)
    const impColor = gap.impacto === 'critica' ? C.red : gap.impacto === 'alta' ? C.amber : C.green

    // Badge impacto
    pdf.setFillColor(...impColor)
    pdf.roundedRect(MARGIN, y, 18, 5, 1, 1, 'F')
    pdf.setFontSize(6)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...C.white)
    pdf.text(gap.impacto.toUpperCase(), MARGIN + 9, y + 3.5, { align: 'center' })

    // Area
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(...C.primary)
    pdf.text(gap.area, MARGIN + 22, y + 4)
    y += 7

    // Descripción
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7.5)
    pdf.setTextColor(...C.gray)
    const lines = pdf.splitTextToSize(gap.descripcion, CONTENT_W - 5)
    for (const line of lines) {
      pdf.text(line, MARGIN + 2, y)
      y += 3.5
    }

    // Acción recomendada
    pdf.setFont('helvetica', 'italic')
    pdf.setFontSize(7)
    pdf.setTextColor(...C.accent)
    const actionLines = pdf.splitTextToSize(`→ ${gap.accion_recomendada}`, CONTENT_W - 5)
    for (const al of actionLines) {
      pdf.text(al, MARGIN + 2, y)
      y += 3.5
    }
    y += 4
  }

  // Competidores detalle
  checkPage(30)
  y += 5
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  pdf.setTextColor(...C.primary)
  pdf.text('Detalle de competidores', MARGIN, y)
  y += 8

  for (const comp of audit.competidores) {
    checkPage(25)
    pdf.setFillColor(...C.bg)
    pdf.setDrawColor(...C.lightGray)
    pdf.roundedRect(MARGIN, y, CONTENT_W, 4, 2, 2, 'FD')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(...C.primary)
    pdf.text(`${comp.nombre} \u2014 ${comp.puntuacion}/100`, MARGIN + 4, y + 3)
    y += 7

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7)
    pdf.setTextColor(...C.gray)
    for (const v of comp.ventajas) {
      checkPage(5)
      pdf.setTextColor(...C.green)
      pdf.text(`+ ${v}`, MARGIN + 4, y)
      y += 3.5
    }
    for (const d of comp.debilidades) {
      checkPage(5)
      pdf.setTextColor(...C.red)
      pdf.text(`- ${d}`, MARGIN + 4, y)
      y += 3.5
    }
    y += 4
  }

  addFooter(pdf)

  // Convertir a Buffer
  const arrayBuffer = pdf.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}

// ════════════════════════════════════════════
// PDF PRESUPUESTO
// ════════════════════════════════════════════
export function generatePresupuestoPDF(
  audit: AuditResult,
  presupuesto: Presupuesto
): Buffer {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  let y = 0

  function checkPage(needed: number) {
    if (y + needed > PAGE_H - 20) {
      addFooter(pdf)
      pdf.addPage()
      y = MARGIN
    }
  }

  const packLabel = presupuesto.pack_recomendado === 'visibilidad_local'
    ? 'Pack Visibilidad Local'
    : 'Pack Autoridad Maps + IA'

  // Portada
  addHeader(pdf, `Presupuesto: ${packLabel}`, `${audit.negocio.nombre} \u2014 ${audit.negocio.zona}`)
  y = 70

  // Precio
  pdf.setFillColor(5, 150, 105) // verde esmeralda
  pdf.roundedRect(MARGIN, y, CONTENT_W, 35, 4, 4, 'F')
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.setTextColor(...C.white)
  pdf.text('Precio especial fundador', MARGIN + 8, y + 10)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(36)
  pdf.text(`\u20AC${presupuesto.precio_fundador}`, MARGIN + 8, y + 27)
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')
  pdf.text('/mes', MARGIN + 55, y + 27)

  // Precio tachado
  pdf.setFontSize(10)
  pdf.setTextColor(255, 255, 255, 150)
  pdf.text(`Precio normal: \u20AC${presupuesto.precio_mensual}/mes`, MARGIN + 80, y + 10)
  pdf.text('30% descuento \u2014 Solo primeros 10 clientes', MARGIN + 80, y + 17)

  y += 45

  // ROI
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  pdf.setTextColor(...C.primary)
  pdf.text('ROI estimado a 3 meses', MARGIN, y)
  y += 8

  const roiCardW = (CONTENT_W - 8) / 3
  presupuesto.roi_proyecciones.forEach((r, i) => {
    const x = MARGIN + i * (roiCardW + 4)
    pdf.setFillColor(...C.bg)
    pdf.setDrawColor(...C.lightGray)
    pdf.roundedRect(x, y, roiCardW, 25, 3, 3, 'FD')

    pdf.setFontSize(8)
    pdf.setTextColor(...C.gray)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Mes ${r.mes}`, x + roiCardW / 2, y + 6, { align: 'center' })

    pdf.setFontSize(18)
    pdf.setTextColor(...C.green)
    pdf.setFont('helvetica', 'bold')
    pdf.text(r.roi_multiple, x + roiCardW / 2, y + 15, { align: 'center' })

    pdf.setFontSize(8)
    pdf.setTextColor(...C.primary)
    pdf.text(`\u20AC${r.retorno_estimado.toLocaleString('es-ES')}`, x + roiCardW / 2, y + 21, { align: 'center' })
  })
  y += 35

  // Features
  checkPage(20)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  pdf.setTextColor(...C.primary)
  pdf.text('Que incluye el pack', MARGIN, y)
  y += 8

  for (const feat of presupuesto.features_incluidas) {
    checkPage(6)
    pdf.setFillColor(...C.accent)
    pdf.circle(MARGIN + 3, y + 1.5, 1.5, 'F')
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(...C.primary)
    pdf.text(feat, MARGIN + 8, y + 3)
    y += 6
  }

  y += 5

  // Mejoras esperadas
  checkPage(20)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  pdf.setTextColor(...C.primary)
  pdf.text('Mejoras que conseguiras', MARGIN, y)
  y += 8

  for (const mejora of presupuesto.mejoras_esperadas) {
    checkPage(6)
    pdf.setFillColor(...C.green)
    pdf.circle(MARGIN + 3, y + 1.5, 1.5, 'F')
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(...C.primary)
    pdf.text(mejora, MARGIN + 8, y + 3)
    y += 6
  }

  y += 5

  // Próximos pasos
  checkPage(20)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  pdf.setTextColor(...C.primary)
  pdf.text('Proximos pasos', MARGIN, y)
  y += 8

  for (const paso of presupuesto.proximos_pasos) {
    checkPage(6)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(...C.gray)
    pdf.text(paso, MARGIN + 4, y + 3)
    y += 6
  }

  y += 10

  // CTA final
  checkPage(25)
  pdf.setFillColor(...C.primary)
  pdf.roundedRect(MARGIN, y, CONTENT_W, 20, 4, 4, 'F')
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(12)
  pdf.setTextColor(...C.white)
  pdf.text('Listo para empezar? Agenda una llamada gratuita', MARGIN + 10, y + 9)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(...C.accent)
  pdf.text('hola@radarlocal.es  |  wa.me/34XXXXXXXXX', MARGIN + 10, y + 15)

  addFooter(pdf)

  const arrayBuffer = pdf.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}
