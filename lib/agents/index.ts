import type { Agente } from '@/types'
import { getClientById } from '@/lib/clients'
import { getProfileByClient } from '@/lib/profiles'
import { createTask, updateTask } from '@/lib/tasks'
import { registrarGastoAgente } from '@/lib/gastos'
import { guardarTareasGeneradas } from '@/lib/tareas-ejecucion'
import { searchPlace, searchCompetitors, normalizePlaceData, calculateGBPScore } from '@/lib/google-places'
import { loadAgentMemory, saveAgentMemory, formatMemoryForPrompt } from '@/lib/agent-memory'
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

        // Auto-actualizar url_maps del perfil si tenemos la URL real de Google
        if (googlePlacesData.google_maps_url && perfilGbp?.id) {
          const { supabaseAdmin: sAdmin } = await import('@/lib/supabase-admin')
          if (sAdmin) {
            void sAdmin.from('perfiles_gbp')
              .update({ url_maps: googlePlacesData.google_maps_url })
              .eq('id', perfilGbp.id)
            console.log(`[${agente}] url_maps actualizado desde Google Places`)
          }
        }
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

  // 6a. Datos reales de presencia en IAs externas (para monitor_ias) — vía A2A o API directa
  let datosMonitorExterno: import('@/lib/a2a/external-monitor').DatosMonitorExterno | null = null
  if (agente === 'monitor_ias' && cliente.negocio) {
    try {
      const { fetchDatosMonitorExterno } = await import('@/lib/a2a/external-monitor')
      const localidad = cliente.direccion?.split(',').pop()?.trim() ?? ''
      datosMonitorExterno = await fetchDatosMonitorExterno(cliente.negocio, localidad)
      console.log(`[${agente}] Monitor externo: ${datosMonitorExterno.menciones.filter(m => m.fuente !== 'inferencia').length} fuentes reales`)
    } catch (e) {
      console.error(`[${agente}] Error monitor externo (continuando sin datos reales):`, e)
    }
  }

  // 6b. Scrapear web del negocio (para prospector_web)
  let webScrapedData: { url: string; html: string; status: number; redirectUrl?: string } | null = null
  if (agente === 'prospector_web' && cliente.web) {
    try {
      const { scrapeWebsite } = await import('@/lib/web-scraper')
      const scraped = await scrapeWebsite(cliente.web)
      webScrapedData = {
        url: scraped.url,
        html: scraped.html,
        status: scraped.status,
        redirectUrl: scraped.finalUrl !== scraped.url ? scraped.finalUrl : undefined,
      }
      console.log(`[${agente}] Web scrapeada: ${scraped.status} — ${scraped.title || 'sin título'} (${scraped.loadTimeMs}ms)`)
    } catch (e) {
      console.error(`[${agente}] Error scrapeando web:`, e)
    }
  }

  // 6b. Cargar informe anterior (para comparativa en generador_reporte)
  let informeAnterior: Record<string, unknown> | null = null
  if (agente === 'generador_reporte') {
    try {
      const { supabaseAdmin: sAdmin } = await import('@/lib/supabase-admin')
      if (sAdmin) {
        const { data: prevReport } = await sAdmin
          .from('informes')
          .select('reporte, puntuacion_gbp, consistencia_nap, total_resenas, media_resenas, posicion_maps, presencia_ias, created_at')
          .eq('cliente_id', clienteId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (prevReport?.reporte) {
          informeAnterior = {
            ...prevReport,
            reporte: typeof prevReport.reporte === 'string' ? JSON.parse(prevReport.reporte) : prevReport.reporte,
          }
          console.log(`[${agente}] Informe anterior cargado (${prevReport.created_at})`)
        }
      }
    } catch (e) {
      console.error(`[${agente}] Error cargando informe anterior (continuando sin él):`, e)
    }
  }

  // 6. Cargar memoria del agente (historial de ejecuciones previas)
  let memoryContext: string | undefined
  try {
    const memory = await loadAgentMemory(clienteId, agente)
    memoryContext = formatMemoryForPrompt(memory)
    if (memory.ejecuciones_previas.length > 0) {
      console.log(`[${agente}] Memoria cargada: ${memory.ejecuciones_previas.length} ejecuciones previas, ${memory.tareas_pendientes_count} tareas pendientes`)
    }
  } catch (e) {
    console.error(`[${agente}] Error cargando memoria (continuando sin ella):`, e)
  }

  // 7. Registrar tarea como en_progreso
  const tarea = await createTask({
    cliente_id: clienteId,
    agente,
    tipo: agente,
    estado: 'en_progreso',
    resultado: null,
  })

  // 8. Ejecutar el agente con datos reales + memoria
  const result = await runAgentExecution(agente, {
    cliente,
    perfilGbp,
    previousResults,
    googlePlacesData,
    googlePlacesScore,
    competidoresData: competidoresData.length > 0 ? competidoresData : undefined,
    memoryContext,
    informeAnterior,
    webScrapedData,
    datosMonitorExterno,
  })

  // 9. Guardar memoria de esta ejecución (no bloquea)
  saveAgentMemory(clienteId, agente, result, {
    scoreGbp: googlePlacesScore,
    rating: googlePlacesData?.rating,
    resenas: googlePlacesData?.resenas_count,
    fotos: googlePlacesData?.fotos_count,
  }).catch(e => console.error(`[${agente}] Error guardando memoria:`, e))

  // 10. Registrar consumo de API (no bloquea)
  registrarGastoAgente(
    agente,
    result.usage,
    clienteId,
    cliente.negocio ?? cliente.nombre ?? undefined,
    previousResults ? 'analisis_completo' : 'individual'
  ).catch((e) => console.error('[gastos] Error registrando:', e))

  // 11. Actualizar tarea con resultado
  await updateTask(tarea.id, {
    estado: result.estado,
    resultado: result.datos,
    completed_at: result.estado === 'completada' ? new Date().toISOString() : null,
  })

  // 12. Si el agente generó tareas ejecutables, guardarlas con autonomía inteligente
  if (result.tareas && result.tareas.length > 0) {
    try {
      const { guardadas, resumenAutonomia } = await guardarTareasGeneradas(
        clienteId,
        agente,
        result.tareas,
        tarea.id  // ID del informe/tarea que originó estas tareas
      )
      console.log(`[${agente}] ${guardadas.length} tareas guardadas — 🟢${resumenAutonomia.auto_ejecutar} auto | 🟡${resumenAutonomia.notificar} notificar | 🔴${resumenAutonomia.aprobar} aprobar`)

      // 13. Ejecutar automáticamente las tareas auto-aprobadas
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
