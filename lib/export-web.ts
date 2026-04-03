import 'server-only'
import { supabaseAdmin } from './supabase-admin'
import type { Cliente } from '@/types'
import type { ContenidoGenerado } from './content-library'

// ══════════════════════════════════════════════════════════════
// EXPORTAR CONTENIDO LISTO PARA WEB
//
// Genera un HTML listo para copiar y pegar en la web del cliente.
// Incluye: schemas JSON-LD, FAQs formateadas y TL;DR.
// ══════════════════════════════════════════════════════════════

interface ExportData {
  cliente: Cliente
  schemas: ContenidoGenerado[]
  faqs: ContenidoGenerado[]
  chunks: ContenidoGenerado[]
  tldr: ContenidoGenerado | null
}

async function loadExportData(clienteId: string): Promise<ExportData | null> {
  if (!supabaseAdmin) return null

  const [clienteRes, contenidoRes] = await Promise.all([
    supabaseAdmin.from('clientes').select('*').eq('id', clienteId).single(),
    supabaseAdmin
      .from('contenido_generado')
      .select('*')
      .eq('cliente_id', clienteId)
      .neq('estado', 'descartado')
      .in('tipo', ['schema_jsonld', 'faq_voz', 'chunk', 'tldr'])
      .order('created_at', { ascending: false }),
  ])

  if (clienteRes.error || !clienteRes.data) return null

  const contenido = (contenidoRes.data ?? []) as ContenidoGenerado[]

  return {
    cliente: clienteRes.data as Cliente,
    schemas: contenido.filter(c => c.tipo === 'schema_jsonld'),
    faqs: contenido.filter(c => c.tipo === 'faq_voz'),
    chunks: contenido.filter(c => c.tipo === 'chunk'),
    tldr: contenido.find(c => c.tipo === 'tldr') ?? null,
  }
}

function parseFaq(contenido: string): { pregunta: string; respuesta: string } | null {
  const match = contenido.match(/^P:\s*([\s\S]+?)\s*R:\s*([\s\S]+)$/)
  if (!match) return null
  return { pregunta: match[1].trim(), respuesta: match[2].trim() }
}

export async function generarExportWeb(clienteId: string): Promise<string | null> {
  const data = await loadExportData(clienteId)
  if (!data) return null

  const { cliente, schemas, faqs, chunks, tldr } = data
  const ahora = new Date().toISOString().split('T')[0]

  const lines: string[] = []

  lines.push(`<!DOCTYPE html>`)
  lines.push(`<!--`)
  lines.push(`  Contenido generado por Radar Local para: ${cliente.negocio}`)
  lines.push(`  Fecha: ${ahora}`)
  lines.push(`  `)
  lines.push(`  INSTRUCCIONES:`)
  lines.push(`  1. Copia la sección de SCHEMAS JSON-LD dentro del <head> de tu web`)
  lines.push(`  2. Copia la sección de FAQs donde quieras mostrarlas (normalmente al final de la página principal)`)
  lines.push(`  3. Usa el TL;DR como meta description o texto de presentación`)
  lines.push(`  4. Los chunks citables van en las páginas indicadas en cada título`)
  lines.push(`-->`)
  lines.push(``)

  // ── SCHEMAS JSON-LD ──
  if (schemas.length > 0) {
    lines.push(`<!-- ═══════════════════════════════════════════════════════ -->`)
    lines.push(`<!-- SCHEMAS JSON-LD — Pegar dentro del <head> de la web   -->`)
    lines.push(`<!-- ═══════════════════════════════════════════════════════ -->`)
    lines.push(``)

    schemas.forEach((schema, i) => {
      lines.push(`<!-- Schema ${i + 1}: ${schema.titulo} -->`)

      // Intentar formatear el JSON bonito
      let jsonStr = schema.contenido
      try {
        const parsed = JSON.parse(schema.contenido)
        jsonStr = JSON.stringify(parsed, null, 2)
      } catch {
        // Si falla el parse, usar tal cual
      }

      lines.push(`<script type="application/ld+json">`)
      lines.push(jsonStr)
      lines.push(`</script>`)
      lines.push(``)
    })
  }

  // ── TL;DR ──
  if (tldr) {
    lines.push(`<!-- ═══════════════════════════════════════════════════════ -->`)
    lines.push(`<!-- TL;DR — Usar como meta description o párrafo hero     -->`)
    lines.push(`<!-- ═══════════════════════════════════════════════════════ -->`)
    lines.push(``)
    lines.push(`<!-- Meta description sugerida: -->`)

    // Truncar a 160 chars para meta description
    const metaDesc = tldr.contenido.length > 160
      ? tldr.contenido.substring(0, 157) + '...'
      : tldr.contenido
    lines.push(`<meta name="description" content="${metaDesc.replace(/"/g, '&quot;')}">`)
    lines.push(``)
    lines.push(`<!-- Párrafo completo para hero o about: -->`)
    lines.push(`<p class="tldr-entidad">`)
    lines.push(`  ${tldr.contenido}`)
    lines.push(`</p>`)
    lines.push(``)
  }

  // ── FAQs ──
  if (faqs.length > 0) {
    lines.push(`<!-- ═══════════════════════════════════════════════════════ -->`)
    lines.push(`<!-- FAQs — Pegar en la sección de preguntas frecuentes    -->`)
    lines.push(`<!-- ═══════════════════════════════════════════════════════ -->`)
    lines.push(``)
    lines.push(`<section class="faqs-radar-local" aria-label="Preguntas frecuentes">`)
    lines.push(`  <h2>Preguntas Frecuentes</h2>`)
    lines.push(``)

    faqs.forEach(faq => {
      const parsed = parseFaq(faq.contenido)
      if (parsed) {
        lines.push(`  <details>`)
        lines.push(`    <summary>${parsed.pregunta}</summary>`)
        lines.push(`    <p>${parsed.respuesta}</p>`)
        lines.push(`  </details>`)
        lines.push(``)
      }
    })

    lines.push(`</section>`)
    lines.push(``)

    // CSS mínimo para las FAQs
    lines.push(`<!-- CSS mínimo para las FAQs (opcional, personalizar según tu diseño): -->`)
    lines.push(`<style>`)
    lines.push(`.faqs-radar-local details {`)
    lines.push(`  border-bottom: 1px solid #e5e7eb;`)
    lines.push(`  padding: 1rem 0;`)
    lines.push(`}`)
    lines.push(`.faqs-radar-local summary {`)
    lines.push(`  cursor: pointer;`)
    lines.push(`  font-weight: 600;`)
    lines.push(`  font-size: 1.05rem;`)
    lines.push(`  color: #1a1a1a;`)
    lines.push(`}`)
    lines.push(`.faqs-radar-local details p {`)
    lines.push(`  margin-top: 0.75rem;`)
    lines.push(`  color: #4b5563;`)
    lines.push(`  line-height: 1.6;`)
    lines.push(`}`)
    lines.push(`</style>`)
    lines.push(``)
  }

  // ── CHUNKS CITABLES ──
  if (chunks.length > 0) {
    lines.push(`<!-- ═══════════════════════════════════════════════════════ -->`)
    lines.push(`<!-- CHUNKS CITABLES — Párrafos optimizados para IA        -->`)
    lines.push(`<!-- Colocar en las páginas indicadas en cada título        -->`)
    lines.push(`<!-- ═══════════════════════════════════════════════════════ -->`)
    lines.push(``)

    chunks.forEach(chunk => {
      lines.push(`<!-- ${chunk.titulo} -->`)
      lines.push(`<p class="chunk-citable" data-optimizado-para="${chunk.optimizado_para ?? 'ia'}">`)
      lines.push(`  ${chunk.contenido}`)
      lines.push(`</p>`)
      lines.push(``)
    })
  }

  // ── FOOTER ──
  lines.push(`<!-- ═══════════════════════════════════════════════════════ -->`)
  lines.push(`<!-- Generado por Radar Local — ${ahora}                    -->`)
  lines.push(`<!-- https://radar-local.vercel.app                         -->`)
  lines.push(`<!-- ═══════════════════════════════════════════════════════ -->`)

  return lines.join('\n')
}
