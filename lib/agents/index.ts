import type { Agente } from '@/types'
import { getClientById } from '@/lib/clients'
import { getProfileByClient } from '@/lib/profiles'
import { createTask, updateTask } from '@/lib/tasks'
import { registrarGastoAgente } from '@/lib/gastos'
import { guardarTareasGeneradas } from '@/lib/tareas-ejecucion'
import { searchPlace, searchCompetitors, normalizePlaceData, calculateGBPScore } from '@/lib/google-places'
import { getAgentConfig } from './config'
import { runAgentExecution } from './runner'
import type { AgentResult } from './types'

// Orquestador principal: ejecuta un agente para un cliente
// previousResults: resultados de agentes previos (para el generador_reporte)
export async function runAgent(
  agente: Agente,
  clienteId: string,
  previousResults?: AgentResult[]
): Promise<AgentResult> {
  // 1. Validar que el agente existe
  const config = getAgentConfig(agente)
  if (!config) {
    return {
      agente,
      estado: 'error',
      datos: { error: `Agente "${agente}" no encontrado` },
      resumen: `Error: agente "${agente}" no encontrado en la configuración.`,
    }
  }

  // 2. Obtener datos del cliente
  const cliente = await getClientById(clienteId)
  if (!cliente) {
    return {
      agente,
      estado: 'error',
      datos: { error: `Cliente "${clienteId}" no encontrado` },
      resumen: `Error: cliente "${clienteId}" no encontrado.`,
    }
  }

  // 3. Validar que el cliente tiene un pack compatible
  if (cliente.pack && !config.packs.includes(cliente.pack)) {
    return {
      agente,
      estado: 'error',
      datos: { error: `El pack "${cliente.pack}" no incluye el agente "${agente}"` },
      resumen: `Error: el pack del cliente no incluye el agente "${config.nombre}".`,
    }
  }

  // 4. Obtener perfil GBP (puede ser null)
  const perfilGbp = await getProfileByClient(clienteId)

  // 5. Buscar datos reales de Google Places (para agentes que los necesitan)
  const agentesConPlaces: Agente[] = ['auditor_gbp', 'optimizador_nap', 'gestor_resenas', 'keywords_locales', 'generador_reporte']
  let googlePlacesData = null
  let googlePlacesScore = null
  let competidoresData: { nombre: string; data: import('@/lib/google-places').PlaceData; score: number }[] = []

  if (agentesConPlaces.includes(agente) && cliente.negocio) {
    try {
      const zona = cliente.direccion?.split(',').pop()?.trim() || ''
      const mainPlace = await searchPlace(cliente.negocio, zona)
      if (mainPlace) {
        googlePlacesData = normalizePlaceData(mainPlace)
        googlePlacesScore = calculateGBPScore(googlePlacesData)
        console.log(`[${agente}] Google Places: ${googlePlacesData.nombre} — ${googlePlacesScore}/100`)
      }

      // Para auditor_gbp, buscar competidores también
      if (agente === 'auditor_gbp' && perfilGbp?.categoria) {
        const comps = await searchCompetitors(perfilGbp.categoria, zona, cliente.negocio, 3)
        competidoresData = comps.map(p => {
          const d = normalizePlaceData(p)
          return { nombre: d.nombre, data: d, score: calculateGBPScore(d) }
        })
        console.log(`[${agente}] ${competidoresData.length} competidores encontrados`)
      }
    } catch (e) {
      console.error(`[${agente}] Error buscando Google Places:`, e)
    }
  }

  // 6. Registrar tarea como en_progreso
  const tarea = await createTask({
    cliente_id: clienteId,
    agente,
    tipo: agente,
    estado: 'en_progreso',
    resultado: null,
  })

  // 7. Ejecutar el agente con datos reales
  const result = await runAgentExecution(agente, {
    cliente,
    perfilGbp,
    previousResults,
    googlePlacesData,
    googlePlacesScore,
    competidoresData: competidoresData.length > 0 ? competidoresData : undefined,
  })

  // 7. Registrar consumo de API (no bloquea)
  registrarGastoAgente(
    agente,
    result.usage,
    clienteId,
    cliente.negocio ?? cliente.nombre ?? undefined,
    previousResults ? 'analisis_completo' : 'individual'
  ).catch((e) => console.error('[gastos] Error registrando:', e))

  // 8. Actualizar tarea con resultado
  await updateTask(tarea.id, {
    estado: result.estado,
    resultado: result.datos,
    completed_at: result.estado === 'completada' ? new Date().toISOString() : null,
  })

  // 9. Si el agente generó tareas ejecutables, guardarlas con autonomía inteligente
  if (result.tareas && result.tareas.length > 0) {
    try {
      const { guardadas, resumenAutonomia } = await guardarTareasGeneradas(
        clienteId,
        agente,
        result.tareas,
        tarea.id  // ID del informe/tarea que originó estas tareas
      )
      console.log(`[${agente}] ${guardadas.length} tareas guardadas — 🟢${resumenAutonomia.auto_ejecutar} auto | 🟡${resumenAutonomia.notificar} notificar | 🔴${resumenAutonomia.aprobar} aprobar`)

      // 10. Ejecutar automáticamente las tareas auto-aprobadas
      const tareasAutoAprobadas = guardadas.filter(t => t.estado === 'aprobada')
      if (tareasAutoAprobadas.length > 0) {
        // Importar dinámicamente para evitar dependencia circular
        const { ejecutarTareasAprobadas } = await import('@/lib/task-executor')
        ejecutarTareasAprobadas(tareasAutoAprobadas).catch(e =>
          console.error(`[${agente}] Error en auto-ejecución:`, e)
        )
      }
    } catch (e) {
      console.error(`[${agente}] Error guardando tareas de ejecución:`, e)
      // No fallamos la ejecución por esto — las tareas están en result.tareas
    }
  }

  return result
}

// Re-exportar tipos y config para conveniencia
export { AGENT_CONFIGS, getAgentConfig, getAgentsByCategory } from './config'
export type { AgentConfig, AgentResult, AgentCategory } from './types'
