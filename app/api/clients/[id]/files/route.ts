// ─────────────────────────────────────────────────────────
// API: Gestor de Archivos por cliente
// ─────────────────────────────────────────────────────────
// GET  /api/clients/[id]/files          → Listar archivos
// GET  /api/clients/[id]/files?cat=fotos → Filtrar por categoría
// POST /api/clients/[id]/files          → Subir archivo(s)
// DELETE /api/clients/[id]/files        → Eliminar archivo

import { NextRequest, NextResponse } from 'next/server'
import { uploadFile, listFiles, deleteFile, getFileCategory } from '@/lib/storage'
import type { FileCategory } from '@/lib/storage'

export const dynamic = 'force-dynamic'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Tipos MIME permitidos
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp',
  'video/mp4', 'video/quicktime',
  'application/pdf',
]

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

// ── GET: Listar archivos ──
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const category = request.nextUrl.searchParams.get('cat') as FileCategory | null
  const files = await listFiles(id, category || undefined)

  return NextResponse.json({ files, total: files.length })
}

// ── POST: Subir archivo ──
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 })
    }

    // Validar tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipo no permitido: ${file.type}. Permitidos: JPG, PNG, WebP, MP4, PDF` },
        { status: 400 }
      )
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Archivo demasiado grande (máx. 50MB)` },
        { status: 400 }
      )
    }

    // Determinar categoría por tipo MIME
    const category = getFileCategory(file.type)

    // Convertir a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Subir
    const result = await uploadFile(id, category, file.name, buffer, file.type)

    if (!result) {
      return NextResponse.json({ error: 'Error subiendo el archivo' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Archivo subido correctamente',
      url: result.url,
      path: result.path,
      category,
      name: file.name,
      size: file.size,
    })
  } catch (err) {
    console.error('[Files API] Error:', err)
    return NextResponse.json({ error: 'Error procesando el archivo' }, { status: 500 })
  }
}

// ── DELETE: Eliminar archivo ──
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  let body: { path?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  const { path } = body
  if (!path || !path.startsWith(id)) {
    return NextResponse.json(
      { error: 'Ruta de archivo inválida o no pertenece a este cliente' },
      { status: 400 }
    )
  }

  const success = await deleteFile(path)
  if (!success) {
    return NextResponse.json({ error: 'Error eliminando el archivo' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Archivo eliminado' })
}
