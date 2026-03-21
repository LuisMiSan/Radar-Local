'use client'

// ─────────────────────────────────────────────────────────
// GESTOR DE ARCHIVOS — Subir y gestionar fotos/vídeos/docs
// ─────────────────────────────────────────────────────────
// Permite al admin subir archivos para cada cliente.
// Los archivos se guardan en Supabase Storage.
// El cliente puede verlos desde su portal.

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Upload,
  Image,
  Video,
  FileText,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  Eye,
  FolderOpen,
  X,
} from 'lucide-react'

interface FileItem {
  name: string
  path: string
  url: string
  size: number
  type: string
  category: 'fotos' | 'videos' | 'docs'
  created_at: string
}

type FilterCategory = 'todos' | 'fotos' | 'videos' | 'docs'

const CATEGORY_ICONS = {
  fotos: Image,
  videos: Video,
  docs: FileText,
}

const CATEGORY_LABELS = {
  todos: 'Todos',
  fotos: 'Fotos',
  videos: 'Vídeos',
  docs: 'Documentos',
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function FileManagerPage() {
  const params = useParams()
  const clienteId = params.id as string

  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterCategory>('todos')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [preview, setPreview] = useState<FileItem | null>(null)
  const [clientName, setClientName] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Cargar archivos ──
  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${clienteId}/files?t=${Date.now()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setFiles(data.files || [])
    } catch {
      setError('Error cargando archivos')
    } finally {
      setLoading(false)
    }
  }, [clienteId])

  // ── Cargar nombre del cliente ──
  useEffect(() => {
    async function fetchClient() {
      try {
        const res = await fetch(`/api/clients?t=${Date.now()}`, { cache: 'no-store' })
        if (res.ok) {
          const clients = await res.json()
          const client = clients.find((c: { id: string }) => c.id === clienteId)
          if (client) setClientName(client.negocio || client.nombre)
        }
      } catch { /* ignore */ }
    }
    fetchClient()
    fetchFiles()
  }, [clienteId, fetchFiles])

  // ── Subir archivo ──
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return

    setUploading(true)
    setError(null)
    setSuccess(null)

    let uploaded = 0
    const total = fileList.length

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      setUploadProgress(`Subiendo ${i + 1} de ${total}: ${file.name}`)

      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch(`/api/clients/${clienteId}/files`, {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          setError(data.error || `Error subiendo ${file.name}`)
        } else {
          uploaded++
        }
      } catch {
        setError(`Error de red subiendo ${file.name}`)
      }
    }

    setUploading(false)
    setUploadProgress(null)

    if (uploaded > 0) {
      setSuccess(`${uploaded} archivo${uploaded > 1 ? 's' : ''} subido${uploaded > 1 ? 's' : ''} correctamente`)
      fetchFiles()
    }

    // Limpiar el input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Eliminar archivo ──
  async function handleDelete(file: FileItem) {
    if (!confirm(`¿Eliminar "${file.name}"?`)) return

    setDeleting(file.path)
    try {
      const res = await fetch(`/api/clients/${clienteId}/files`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: file.path }),
      })

      if (res.ok) {
        setFiles(prev => prev.filter(f => f.path !== file.path))
        setSuccess('Archivo eliminado')
      } else {
        const data = await res.json()
        setError(data.error || 'Error eliminando')
      }
    } catch {
      setError('Error de red')
    } finally {
      setDeleting(null)
    }
  }

  // ── Filtrar archivos ──
  const filteredFiles = filter === 'todos' ? files : files.filter(f => f.category === filter)

  // ── Contar por categoría ──
  const counts = {
    todos: files.length,
    fotos: files.filter(f => f.category === 'fotos').length,
    videos: files.filter(f => f.category === 'videos').length,
    docs: files.filter(f => f.category === 'docs').length,
  }

  // Auto-hide messages
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 4000)
      return () => clearTimeout(t)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 6000)
      return () => clearTimeout(t)
    }
  }, [error])

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* ── Header ── */}
      <div className="mb-6">
        <Link
          href={`/admin/clientes/${clienteId}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al cliente
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800 flex items-center gap-3">
              <FolderOpen className="w-7 h-7 text-primary" />
              Archivos
            </h1>
            {clientName && (
              <p className="text-sm text-neutral-400 mt-1">{clientName}</p>
            )}
          </div>

          {/* Botón subir */}
          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg cursor-pointer transition-colors text-sm font-medium shadow-sm">
            <Upload className="w-4 h-4" />
            {uploading ? 'Subiendo...' : 'Subir archivos'}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,application/pdf"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* ── Mensajes ── */}
      {success && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {uploadProgress && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          {uploadProgress}
        </div>
      )}

      {/* ── Filtros ── */}
      <div className="flex gap-2 mb-6">
        {(['todos', 'fotos', 'videos', 'docs'] as FilterCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === cat
                ? 'bg-primary text-white'
                : 'bg-white text-neutral-500 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            {CATEGORY_LABELS[cat]}
            {counts[cat] > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                filter === cat ? 'bg-white/20' : 'bg-neutral-100'
              }`}>
                {counts[cat]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Contenido ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-neutral-100">
          <FolderOpen className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm">No hay archivos {filter !== 'todos' ? `en ${CATEGORY_LABELS[filter].toLowerCase()}` : ''}</p>
          <p className="text-neutral-300 text-xs mt-1">
            Arrastra o haz clic en &quot;Subir archivos&quot; para empezar
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map(file => {
            const Icon = CATEGORY_ICONS[file.category]
            const isImage = file.category === 'fotos'
            const isVideo = file.category === 'videos'
            const isDeleting = deleting === file.path

            return (
              <div
                key={file.path}
                className="bg-white rounded-xl border border-neutral-100 overflow-hidden group hover:shadow-md transition-shadow"
              >
                {/* Preview area */}
                <div
                  className="aspect-square bg-neutral-50 flex items-center justify-center relative cursor-pointer overflow-hidden"
                  onClick={() => setPreview(file)}
                >
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : isVideo ? (
                    <div className="text-center">
                      <Video className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                      <span className="text-xs text-neutral-400">Vídeo</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FileText className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                      <span className="text-xs text-neutral-400">PDF</span>
                    </div>
                  )}

                  {/* Overlay con acciones */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreview(file) }}
                      className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white"
                      title="Ver"
                    >
                      <Eye className="w-4 h-4 text-neutral-700" />
                    </button>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white"
                      title="Descargar"
                    >
                      <Download className="w-4 h-4 text-neutral-700" />
                    </a>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(file) }}
                      disabled={isDeleting}
                      className="w-9 h-9 rounded-full bg-red-500/90 flex items-center justify-center hover:bg-red-500"
                      title="Eliminar"
                    >
                      {isDeleting
                        ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                        : <Trash2 className="w-4 h-4 text-white" />
                      }
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="px-3 py-2.5">
                  <p className="text-xs font-medium text-neutral-700 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Icon className="w-3 h-3 text-neutral-300" />
                    <span className="text-[11px] text-neutral-400">
                      {formatSize(file.size)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal de preview ── */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="max-w-4xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = CATEGORY_ICONS[preview.category]
                  return <Icon className="w-4 h-4 text-neutral-400" />
                })()}
                <span className="text-sm font-medium text-neutral-700 truncate max-w-md">
                  {preview.name}
                </span>
                <span className="text-xs text-neutral-400">
                  {formatSize(preview.size)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                  title="Abrir en nueva pestaña"
                >
                  <Download className="w-4 h-4 text-neutral-500" />
                </a>
                <button
                  onClick={() => setPreview(null)}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-4 h-4 text-neutral-500" />
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-4 flex items-center justify-center max-h-[80vh] overflow-auto">
              {preview.category === 'fotos' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="max-w-full max-h-[70vh] object-contain rounded"
                />
              ) : preview.category === 'videos' ? (
                <video
                  src={preview.url}
                  controls
                  className="max-w-full max-h-[70vh] rounded"
                >
                  Tu navegador no soporta vídeo
                </video>
              ) : (
                <iframe
                  src={preview.url}
                  className="w-full h-[70vh] rounded"
                  title={preview.name}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
