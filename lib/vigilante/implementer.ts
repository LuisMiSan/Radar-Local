// Implementer: aplica cambios aprobados por el admin
// Los cambios de knowledge/prompt se guardan en Supabase (configuracion table)
// y los agentes los leen en runtime. Los cambios de código muestran diff para apply manual.

import { createClient } from '@supabase/supabase-js'
import type { CambioDetectado } from '@/types'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface ResultadoImplementacion {
  ok: boolean
  mensaje: string
  detalle?: string
}

// Key de configuración donde se guardan los overrides de knowledge
function knowledgeOverrideKey(area: string): string {
  return `vigilante_knowledge_${area}`
}

// Key de configuración donde se guardan los overrides de prompts
function promptOverrideKey(agente: string): string {
  return `vigilante_prompt_${agente}`
}

export async function implementarCambio(
  cambio: CambioDetectado
): Promise<ResultadoImplementacion> {
  const supabase = getSupabaseAdmin()

  switch (cambio.tipo_cambio) {
    case 'knowledge': {
      // Guardar override en la tabla configuracion (clave/valor JSON)
      // Los agentes lo leerán en runtime via getKnowledgeOverride()
      const key = knowledgeOverrideKey(cambio.area_afectada)
      const { error } = await supabase.from('configuracion').upsert(
        { clave: key, valor: { contenido: cambio.propuesta, actualizado: new Date().toISOString() } },
        { onConflict: 'clave' }
      )
      if (error) return { ok: false, mensaje: 'Error guardando knowledge override', detalle: error.message }
      return {
        ok: true,
        mensaje: `Knowledge override guardado para área "${cambio.area_afectada}"`,
        detalle: 'Los agentes incorporarán este conocimiento en la próxima ejecución.',
      }
    }

    case 'prompt': {
      // Guardar override de prompt — el runner lo inyectará al system prompt
      // El campo diff_propuesto.file indica qué agente (ej: "auditor_gbp")
      const agente = cambio.diff_propuesto?.file ?? cambio.area_afectada
      const key = promptOverrideKey(agente)
      const { error } = await supabase.from('configuracion').upsert(
        {
          clave: key,
          valor: {
            instrucciones_extra: cambio.propuesta,
            diff: cambio.diff_propuesto,
            actualizado: new Date().toISOString(),
          },
        },
        { onConflict: 'clave' }
      )
      if (error) return { ok: false, mensaje: 'Error guardando prompt override', detalle: error.message }
      return {
        ok: true,
        mensaje: `Instrucciones extra guardadas para agente "${agente}"`,
        detalle: 'Se añadirán al system prompt en la próxima ejecución del agente.',
      }
    }

    case 'code': {
      // Para cambios de código: se marcan como implementados pero requieren apply manual
      // El diff ya está visible en la UI — el admin lo aplica via Claude Code
      return {
        ok: true,
        mensaje: 'Cambio de código marcado como aprobado',
        detalle:
          'Aplica el diff mostrado en la UI usando Claude Code o manualmente en el archivo indicado. ' +
          'Una vez aplicado, el cambio estará activo tras el próximo deploy.',
      }
    }

    case 'config': {
      // Configuraciones generales — guardar en tabla configuracion
      const key = `vigilante_config_${Date.now()}`
      const { error } = await supabase.from('configuracion').upsert(
        { clave: key, valor: { propuesta: cambio.propuesta, fuente: cambio.fuente, actualizado: new Date().toISOString() } },
        { onConflict: 'clave' }
      )
      if (error) return { ok: false, mensaje: 'Error guardando config', detalle: error.message }
      return {
        ok: true,
        mensaje: 'Configuración guardada',
        detalle: cambio.propuesta ?? 'Revisa la tabla configuracion en Supabase.',
      }
    }

    case 'manual':
    default: {
      // Acción manual — solo registrar que fue aprobada
      return {
        ok: true,
        mensaje: 'Tarea manual aprobada',
        detalle: cambio.propuesta ?? 'Realiza la acción descrita manualmente.',
      }
    }
  }
}

// Lee los knowledge overrides para un área (usado por el runner de agentes)
export async function getKnowledgeOverride(area: string): Promise<string | null> {
  const supabase = getSupabaseAdmin()
  const key = knowledgeOverrideKey(area)
  const { data } = await supabase
    .from('configuracion')
    .select('valor')
    .eq('clave', key)
    .maybeSingle()

  if (!data?.valor) return null
  return (data.valor as { contenido?: string }).contenido ?? null
}

// Lee los prompt overrides para un agente (usado por el runner de agentes)
export async function getPromptOverride(agente: string): Promise<string | null> {
  const supabase = getSupabaseAdmin()
  const key = promptOverrideKey(agente)
  const { data } = await supabase
    .from('configuracion')
    .select('valor')
    .eq('clave', key)
    .maybeSingle()

  if (!data?.valor) return null
  return (data.valor as { instrucciones_extra?: string }).instrucciones_extra ?? null
}
