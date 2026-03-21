// ─────────────────────────────────────────────────────────
// GESTOR DE ARCHIVOS — Supabase Storage
// ─────────────────────────────────────────────────────────
// Funciones para subir, listar y eliminar archivos
// por cliente en el bucket "client-media".
//
// Estructura de carpetas:
//   client-media/{clienteId}/fotos/   → imágenes
//   client-media/{clienteId}/videos/  → vídeos
//   client-media/{clienteId}/docs/    → PDFs y documentos
//
// Las subidas SOLO las hace el admin (service_role).
// Las URLs públicas las puede ver cualquiera con el link.

import 'server-only'
import { supabaseAdmin } from './supabase-admin'

const BUCKET = 'client-media'

// Tipos de archivo que aceptamos
export type FileCategory = 'fotos' | 'videos' | 'docs'

export interface StorageFile {
  name: string
  path: string        // Ruta completa en el bucket
  url: string         // URL pública
  size: number        // Bytes
  type: string        // MIME type
  category: FileCategory
  created_at: string
}

// ── Subir archivo ──
export async function uploadFile(
  clienteId: string,
  category: FileCategory,
  fileName: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<{ url: string; path: string } | null> {
  if (!supabaseAdmin) return null

  // Sanitizar nombre de archivo (quitar caracteres problemáticos)
  const safeName = fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/__+/g, '_')

  // Añadir timestamp para evitar colisiones
  const timestamp = Date.now()
  const filePath = `${clienteId}/${category}/${timestamp}_${safeName}`

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filePath, fileBuffer, {
      contentType,
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('[Storage] Error subiendo archivo:', error.message)
    return null
  }

  // Obtener URL pública
  const { data: urlData } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(filePath)

  return {
    url: urlData.publicUrl,
    path: filePath,
  }
}

// ── Listar archivos de un cliente ──
export async function listFiles(
  clienteId: string,
  category?: FileCategory
): Promise<StorageFile[]> {
  if (!supabaseAdmin) return []

  const categories: FileCategory[] = category ? [category] : ['fotos', 'videos', 'docs']
  const allFiles: StorageFile[] = []

  for (const cat of categories) {
    const folderPath = `${clienteId}/${cat}`

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .list(folderPath, {
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      console.error(`[Storage] Error listando ${cat}:`, error.message)
      continue
    }

    if (!data) continue

    for (const file of data) {
      // Ignorar carpetas vacías (.emptyFolderPlaceholder)
      if (file.name.startsWith('.')) continue

      const filePath = `${folderPath}/${file.name}`
      const { data: urlData } = supabaseAdmin.storage
        .from(BUCKET)
        .getPublicUrl(filePath)

      allFiles.push({
        name: file.name.replace(/^\d+_/, ''), // Quitar timestamp del nombre
        path: filePath,
        url: urlData.publicUrl,
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || '',
        category: cat,
        created_at: file.created_at || new Date().toISOString(),
      })
    }
  }

  return allFiles
}

// ── Eliminar archivo ──
export async function deleteFile(filePath: string): Promise<boolean> {
  if (!supabaseAdmin) return false

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .remove([filePath])

  if (error) {
    console.error('[Storage] Error eliminando archivo:', error.message)
    return false
  }
  return true
}

// ── Obtener URL pública de un archivo ──
export function getPublicUrl(filePath: string): string {
  if (!supabaseAdmin) return ''

  const { data } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(filePath)

  return data.publicUrl
}

// ── Helpers ──
export function getFileCategory(mimeType: string): FileCategory {
  if (mimeType.startsWith('image/')) return 'fotos'
  if (mimeType.startsWith('video/')) return 'videos'
  return 'docs'
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
