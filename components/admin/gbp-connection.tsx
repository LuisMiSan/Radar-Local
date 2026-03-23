'use client'

import { useState, useEffect } from 'react'
import { Link2, Unlink, Loader2, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react'

interface GbpConnectionProps {
  clienteId: string
  clienteNombre: string
}

export default function GbpConnection({ clienteId, clienteNombre }: GbpConnectionProps) {
  const [connected, setConnected] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState<{ name: string; accountName: string }[]>([])
  const [locations, setLocations] = useState<{ name: string; title: string }[]>([])
  const [selectedAccount, setSelectedAccount] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Verificar si GBP está conectado
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch(`/api/gbp?cliente_id=${clienteId}&action=status`)
        const data = await res.json()
        setConnected(data.connected ?? false)
      } catch {
        setConnected(false)
      } finally {
        setLoading(false)
      }
    }
    checkStatus()
  }, [clienteId])

  // Cargar cuentas al conectar
  useEffect(() => {
    if (!connected) return
    loadAccounts()
  }, [connected, clienteId])

  async function loadAccounts() {
    setLoadingAccounts(true)
    setError(null)
    try {
      const res = await fetch(`/api/gbp?cliente_id=${clienteId}&action=accounts`)
      const data = await res.json()
      if (data.ok) {
        setAccounts(data.accounts ?? [])
      } else {
        setError(data.error ?? 'Error desconocido al cargar cuentas')
      }
    } catch (err) {
      console.error('Error cargando cuentas:', err)
      setError('Error de conexión al cargar cuentas')
    } finally {
      setLoadingAccounts(false)
    }
  }

  async function loadLocations(accountName: string) {
    setSelectedAccount(accountName)
    setLoadingLocations(true)
    try {
      const res = await fetch(`/api/gbp?cliente_id=${clienteId}&action=locations&account=${encodeURIComponent(accountName)}`)
      const data = await res.json()
      if (data.ok) setLocations(data.locations ?? [])
    } catch (err) {
      console.error('Error cargando ubicaciones:', err)
    } finally {
      setLoadingLocations(false)
    }
  }

  async function loadProfile(locationName: string) {
    setSelectedLocation(locationName)
    setLoadingProfile(true)
    try {
      const res = await fetch(`/api/gbp?cliente_id=${clienteId}&action=profile&location=${encodeURIComponent(locationName)}`)
      const data = await res.json()
      if (data.ok) setProfile(data.profile)
    } catch (err) {
      console.error('Error cargando perfil:', err)
    } finally {
      setLoadingProfile(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
          <span className="text-sm text-neutral-500">Verificando conexion GBP...</span>
        </div>
      </div>
    )
  }

  // No conectado
  if (!connected) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <Unlink className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-sm">Google Business Profile</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Conecta el GBP de {clienteNombre} para que los agentes puedan modificar el perfil directamente.
              </p>
            </div>
          </div>
          <a
            href={`/api/auth/google?cliente_id=${clienteId}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <Link2 className="w-4 h-4" />
            Conectar GBP
          </a>
        </div>
      </div>
    )
  }

  // Conectado
  return (
    <div className="bg-white rounded-xl border border-green-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 text-sm">Google Business Profile conectado</h3>
            <p className="text-xs text-green-600 mt-0.5">
              Los agentes pueden leer y modificar el perfil GBP
            </p>
          </div>
        </div>
      </div>

      {/* Selector de cuenta */}
      {loadingAccounts ? (
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando cuentas de GBP...
        </div>
      ) : accounts.length > 0 && !selectedAccount ? (
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Selecciona la cuenta:</label>
          <div className="space-y-2">
            {accounts.map((acc) => (
              <button
                key={acc.name}
                onClick={() => loadLocations(acc.name)}
                className="w-full text-left p-3 rounded-lg border border-neutral-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
              >
                {acc.accountName || acc.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Selector de ubicacion */}
      {loadingLocations && (
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando ubicaciones...
        </div>
      )}

      {locations.length > 0 && !selectedLocation && (
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Selecciona la ubicacion:</label>
          <div className="space-y-2">
            {locations.map((loc) => (
              <button
                key={loc.name}
                onClick={() => loadProfile(loc.name)}
                className="w-full text-left p-3 rounded-lg border border-neutral-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
              >
                {loc.title || loc.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Perfil cargado */}
      {loadingProfile && (
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Leyendo perfil GBP...
        </div>
      )}

      {profile && (
        <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm text-neutral-900">Datos actuales del GBP:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div><span className="text-neutral-500">Nombre:</span> <span className="font-medium">{String(profile.nombre ?? 'Sin definir')}</span></div>
            <div><span className="text-neutral-500">Categoria:</span> <span className="font-medium">{String(profile.categoria_principal ?? 'Sin definir')}</span></div>
            <div><span className="text-neutral-500">Telefono:</span> <span className="font-medium">{String(profile.telefono ?? 'Sin definir')}</span></div>
            <div><span className="text-neutral-500">Web:</span> <span className="font-medium">{String(profile.web ?? 'Sin definir')}</span></div>
            <div className="sm:col-span-2"><span className="text-neutral-500">Direccion:</span> <span className="font-medium">{String(profile.direccion ?? 'Sin definir')}</span></div>
            <div className="sm:col-span-2"><span className="text-neutral-500">Descripcion:</span> <span className="font-medium">{String(profile.descripcion ?? 'Sin definir')}</span></div>
          </div>
          {typeof profile.url_maps === 'string' && profile.url_maps && (
            <a
              href={profile.url_maps}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2"
            >
              <ExternalLink className="w-3 h-3" />
              Ver en Google Maps
            </a>
          )}
        </div>
      )}

      {accounts.length === 0 && !loadingAccounts && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span className="text-xs text-amber-700">
            {error
              ? `Error de la API: ${error}`
              : 'No se encontraron cuentas de GBP. Verifica que la cuenta de Google tenga acceso a un perfil de negocio.'}
          </span>
        </div>
      )}
    </div>
  )
}
