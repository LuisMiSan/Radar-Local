'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MapPin, Building2, MapPinned } from 'lucide-react'

export default function AuditoriaFormPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    nombre_negocio: '',
    categoria: '',
    direccion: '',
    zona: '',
    email: '',
    nombre_contacto: '',
    telefono: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Error al procesar la auditoría')
      }

      const data = await response.json()
      router.push(`/auditoria/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Auditoría Gratuita de Google Business Profile
          </h1>
          <p className="text-neutral-600 text-lg">
            Descubre cómo está tu presencia local comparada con tus competidores
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
          {/* Nombre del negocio */}
          <div className="mb-6">
            <label htmlFor="nombre_negocio" className="block text-sm font-semibold text-neutral-900 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Nombre de tu negocio</span>
              </div>
            </label>
            <input
              type="text"
              id="nombre_negocio"
              name="nombre_negocio"
              value={formData.nombre_negocio}
              onChange={handleChange}
              placeholder="Ej: Clínica Dental Sonrisa"
              required
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Dirección */}
          <div className="mb-6">
            <label htmlFor="direccion" className="block text-sm font-semibold text-neutral-900 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Dirección completa</span>
              </div>
            </label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Ej: Calle Principal 123, Madrid"
              required
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Zona */}
          <div className="mb-6">
            <label htmlFor="zona" className="block text-sm font-semibold text-neutral-900 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <MapPinned className="w-4 h-4 text-blue-600" />
                <span>Zona o barrio</span>
              </div>
            </label>
            <input
              type="text"
              id="zona"
              name="zona"
              value={formData.zona}
              onChange={handleChange}
              placeholder="Ej: Centro, Chamberí, Las Tablas"
              required
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Esto nos ayuda a identificar tus competidores directos
            </p>
          </div>

          {/* Categoría */}
          <div className="mb-6">
            <label htmlFor="categoria" className="block text-sm font-semibold text-neutral-900 mb-2">
              Categoría de negocio
            </label>
            <input
              type="text"
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              placeholder="Ej: Clínica dental, Restaurante, Peluquería"
              required
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Email */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-semibold text-neutral-900 mb-2">
              Tu correo electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@negocio.com"
              required
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Te enviaremos los resultados y el presupuesto aquí
            </p>
          </div>

          {/* Nombre contacto (opcional) */}
          <div className="mb-6">
            <label htmlFor="nombre_contacto" className="block text-sm font-semibold text-neutral-900 mb-2">
              Tu nombre (opcional)
            </label>
            <input
              type="text"
              id="nombre_contacto"
              name="nombre_contacto"
              value={formData.nombre_contacto}
              onChange={handleChange}
              placeholder="Tu nombre"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Teléfono (opcional) */}
          <div className="mb-8">
            <label htmlFor="telefono" className="block text-sm font-semibold text-neutral-900 mb-2">
              Tu teléfono (opcional)
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Tu teléfono"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analizando tu negocio...
              </>
            ) : (
              <>
                <span>Generar auditoría gratuita</span>
              </>
            )}
          </button>

          {/* Info text */}
          <p className="text-center text-xs text-neutral-500 mt-4">
            Esto no afectará tu perfil de Google Business. Solo realizaremos un análisis público.
          </p>
        </form>

        {/* Benefits section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-3">
              1
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Análisis completo</h3>
            <p className="text-sm text-neutral-600">
              Revisamos tu perfil GBP vs 2 competidores principales
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border border-green-100">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mb-3">
              2
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Puntuación visual</h3>
            <p className="text-sm text-neutral-600">
              Recibirás una puntuación clara y gaps específicos por mejorar
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mb-3">
              3
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Sin compromisos</h3>
            <p className="text-sm text-neutral-600">
              Totalmente gratuito. Sin datos de pago requeridos
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
