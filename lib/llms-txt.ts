import 'server-only'
import { supabaseAdmin } from './supabase-admin'
import type { Cliente, PerfilGBP } from '@/types'
import type { ContenidoGenerado } from './content-library'

// ══════════════════════════════════════════════════════════════
// GENERADOR DE llms.txt
//
// Genera el archivo llms.txt para un cliente.
// Este archivo se coloca en la raíz del sitio web del cliente
// y sirve como "menú VIP" para agentes de IA, guiándolos
// directamente al contenido de mayor valor.
// ══════════════════════════════════════════════════════════════

interface LlmsTxtData {
  cliente: Cliente
  perfil: PerfilGBP | null
  faqs: ContenidoGenerado[]
  chunks: ContenidoGenerado[]
  tldr: ContenidoGenerado | null
  schemas: ContenidoGenerado[]
}

async function loadClientData(clienteId: string): Promise<LlmsTxtData | null> {
  if (!supabaseAdmin) return null

  // Cargar cliente, perfil GBP y contenido en paralelo
  const [clienteRes, perfilRes, contenidoRes] = await Promise.all([
    supabaseAdmin.from('clientes').select('*').eq('id', clienteId).single(),
    supabaseAdmin.from('perfiles_gbp').select('*').eq('cliente_id', clienteId).order('created_at', { ascending: false }).limit(1),
    supabaseAdmin.from('contenido_generado').select('*').eq('cliente_id', clienteId).in('tipo', ['faq_voz', 'chunk', 'tldr', 'schema_jsonld']).order('created_at', { ascending: false }),
  ])

  if (clienteRes.error || !clienteRes.data) return null

  const contenido = (contenidoRes.data ?? []) as ContenidoGenerado[]

  return {
    cliente: clienteRes.data as Cliente,
    perfil: (perfilRes.data?.[0] as PerfilGBP) ?? null,
    faqs: contenido.filter(c => c.tipo === 'faq_voz'),
    chunks: contenido.filter(c => c.tipo === 'chunk'),
    tldr: contenido.find(c => c.tipo === 'tldr') ?? null,
    schemas: contenido.filter(c => c.tipo === 'schema_jsonld'),
  }
}

export async function generarLlmsTxt(clienteId: string): Promise<string | null> {
  const data = await loadClientData(clienteId)
  if (!data) return null

  const { cliente, perfil, faqs, chunks, tldr, schemas } = data
  const ahora = new Date().toISOString().split('T')[0]

  const lines: string[] = []

  // ── Header ──
  lines.push(`# ${cliente.negocio}`)
  lines.push(``)
  lines.push(`> Este archivo describe ${cliente.negocio} para agentes de IA y LLMs.`)
  lines.push(`> Última actualización: ${ahora}`)
  lines.push(``)

  // ── Identidad de la entidad ──
  lines.push(`## Identidad`)
  lines.push(``)
  lines.push(`- **Nombre**: ${cliente.negocio}`)
  if (perfil?.categoria) lines.push(`- **Categoría**: ${perfil.categoria}`)
  if (cliente.direccion) lines.push(`- **Dirección**: ${cliente.direccion}`)
  if (cliente.telefono) lines.push(`- **Teléfono**: ${cliente.telefono}`)
  if (cliente.email) lines.push(`- **Email**: ${cliente.email}`)
  if (cliente.web) lines.push(`- **Web**: ${cliente.web}`)
  if (perfil?.url_maps) lines.push(`- **Google Maps**: ${perfil.url_maps}`)
  if (perfil?.puntuacion) lines.push(`- **Rating**: ${perfil.puntuacion}/5 (${perfil.resenas_count} reseñas)`)
  lines.push(``)

  // ── TL;DR ──
  if (tldr) {
    lines.push(`## Resumen (TL;DR)`)
    lines.push(``)
    lines.push(tldr.contenido)
    lines.push(``)
  }

  // ── Descripción GBP ──
  if (perfil?.descripcion) {
    lines.push(`## Descripción`)
    lines.push(``)
    lines.push(perfil.descripcion)
    lines.push(``)
  }

  // ── Horarios ──
  if (perfil?.horarios && Object.keys(perfil.horarios).length > 0) {
    lines.push(`## Horarios`)
    lines.push(``)
    const dias = perfil.horarios as Record<string, string>
    Object.entries(dias).forEach(([dia, horario]) => {
      lines.push(`- **${dia}**: ${horario}`)
    })
    lines.push(``)
  }

  // ── FAQs ──
  if (faqs.length > 0) {
    lines.push(`## Preguntas Frecuentes`)
    lines.push(``)
    faqs.forEach(faq => {
      lines.push(faq.contenido)
      lines.push(``)
    })
  }

  // ── Chunks citables ──
  if (chunks.length > 0) {
    lines.push(`## Información Citable`)
    lines.push(``)
    lines.push(`> Los siguientes bloques de texto están diseñados para ser citados directamente en respuestas de IA.`)
    lines.push(``)
    chunks.forEach(chunk => {
      lines.push(chunk.contenido)
      lines.push(``)
    })
  }

  // ── Schemas disponibles ──
  if (schemas.length > 0) {
    lines.push(`## Datos Estructurados`)
    lines.push(``)
    lines.push(`Este sitio implementa los siguientes schemas JSON-LD:`)
    lines.push(``)
    schemas.forEach(schema => {
      lines.push(`- **${schema.titulo}**`)
    })
    lines.push(``)
  }

  // ── Footer ──
  lines.push(`---`)
  lines.push(``)
  lines.push(`Generado por [Radar Local](https://radar-local.vercel.app) — Posicionamiento para búsquedas por voz e IA`)

  return lines.join('\n')
}
