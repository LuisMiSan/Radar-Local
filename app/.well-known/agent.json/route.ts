import { NextResponse } from 'next/server'
import type { AgentCard } from '@/lib/a2a/types'

// GET /.well-known/agent.json
// AgentCard del Supervisor de Radar Local — descubierto por agentes externos A2A
//
// Autenticación: Authorization: Bearer rl_<api_key>
// Obtener una API key: contactar con el administrador de Radar Local
//   o POST /api/admin/a2a-keys (requiere sesión de super_admin)

const supervisorCard: AgentCard & { authentication?: unknown } = {
  name: 'Radar Local — Supervisor',
  description:
    'Orquestador central de Radar Local. Ejecuta agentes especializados en GEO/AEO/SEO Local para optimizar Google Business Profile y posicionamiento en IA generativa.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://radarlocal.es',
  version: '1.0.0',
  capabilities: {
    streaming: false,
    pushNotifications: false,
    // Las tareas son async: POST devuelve 202 + taskId.
    // Polling: GET /api/a2a/tasks/{taskId} cada 10s.
    asyncExecution: true,
    pollingEndpoint: '/api/a2a/tasks/{taskId}',
  },
  authentication: {
    schemes: ['bearer'],
    description: 'API key con prefijo rl_. Solicitar a admin de Radar Local o via POST /api/admin/a2a-keys',
  },
  skills: [
    {
      id: 'auditoria_completa',
      name: 'Auditoría Completa GBP',
      description:
        'Ejecuta los 12 agentes (Visibilidad Local + Autoridad Maps + IA) en secuencia óptima para un cliente. Devuelve diagnóstico completo y tareas HITL generadas.',
      inputModes: ['application/json'],
      outputModes: ['application/json'],
      tags: ['seo-local', 'gbp', 'geo', 'aeo', 'auditoría'],
    },
    {
      id: 'pack_visibilidad',
      name: 'Pack Visibilidad Local',
      description:
        'Ejecuta los agentes de diagnóstico base: auditor_gbp, optimizador_nap, prospector_web, keywords_locales, gestor_resenas, redactor_posts_gbp.',
      inputModes: ['application/json'],
      outputModes: ['application/json'],
      tags: ['seo-local', 'gbp', 'map-pack'],
    },
    {
      id: 'pack_autoridad',
      name: 'Pack Autoridad Maps + IA',
      description:
        'Ejecuta agentes GEO/AEO: generador_schema, creador_faq_geo, generador_chunks, tldr_entidad, monitor_ias, generador_reporte.',
      inputModes: ['application/json'],
      outputModes: ['application/json'],
      tags: ['geo', 'aeo', 'schema', 'llm-visibility'],
    },
    {
      id: 'agente_individual',
      name: 'Agente Individual',
      description:
        'Ejecuta un agente específico por nombre. Usar endpoint /api/a2a/agents/{agentId}/tasks.',
      inputModes: ['application/json'],
      outputModes: ['application/json'],
      tags: ['agente', 'individual'],
    },
  ],
}

export function GET() {
  return NextResponse.json(supervisorCard)
}
