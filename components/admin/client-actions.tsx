'use client'

// ─────────────────────────────────────────────────────────
// ACCIONES DEL CLIENTE — Botones interactivos
// ─────────────────────────────────────────────────────────
// Botones para: gestionar archivos, ver portal, enviar emails.
// Es un Client Component porque necesita manejar estado y fetch.

import { useState } from 'react'
import Link from 'next/link'
import {
  FolderOpen,
  ExternalLink,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react'

interface ClientActionsProps {
  clientId: string
  clientName: string
  businessName: string
  email: string | null
  portalToken: string
}

export default function ClientActions({
  clientId,
  clientName,
  businessName,
  email,
  portalToken,
}: ClientActionsProps) {
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailResult, setEmailResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const portalPath = `/portal/${portalToken}`

  // ── Enviar email con el link del portal ──
  async function handleSendPortalEmail() {
    if (!email) {
      setEmailResult({ type: 'error', message: 'Este cliente no tiene email registrado' })
      return
    }

    setSendingEmail(true)
    setEmailResult(null)

    try {
      const portalUrl = `${window.location.origin}${portalPath}`
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'portal',
          to: email,
          clientName,
          businessName,
          portalUrl,
        }),
      })

      if (res.ok) {
        setEmailResult({ type: 'success', message: `Email enviado a ${email}` })
      } else {
        const data = await res.json()
        setEmailResult({ type: 'error', message: data.error || 'Error enviando email' })
      }
    } catch {
      setEmailResult({ type: 'error', message: 'Error de conexión' })
    } finally {
      setSendingEmail(false)
    }
  }

  // ── Copiar link del portal ──
  function handleCopyLink() {
    const portalUrl = `${window.location.origin}${portalPath}`
    navigator.clipboard.writeText(portalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      {/* Botones principales */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/admin/clientes/${clientId}/archivos`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:border-primary hover:text-primary transition-colors"
        >
          <FolderOpen className="w-4 h-4" />
          Gestionar archivos
        </Link>

        <Link
          href={portalPath}
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:border-accent hover:text-accent transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Ver portal
        </Link>

        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado' : 'Copiar link portal'}
        </button>

        <button
          onClick={handleSendPortalEmail}
          disabled={sendingEmail || !email}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sendingEmail
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Mail className="w-4 h-4" />
          }
          {sendingEmail ? 'Enviando...' : 'Enviar portal por email'}
        </button>
      </div>

      {/* Resultado del envío */}
      {emailResult && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          emailResult.type === 'success'
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {emailResult.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0" />
          }
          {emailResult.message}
        </div>
      )}
    </div>
  )
}
