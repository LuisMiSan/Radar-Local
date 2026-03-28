import { NextRequest, NextResponse } from 'next/server'
import { loadAgentMemory } from '@/lib/agent-memory'
import type { Agente } from '@/types'

// GET /api/agents/memory?clienteId=xxx&agente=auditor_gbp&limit=10
export async function GET(request: NextRequest) {
  const clienteId = request.nextUrl.searchParams.get('clienteId')
  const agente = request.nextUrl.searchParams.get('agente') as Agente | null
  const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '10')

  if (!clienteId) {
    return NextResponse.json({ error: 'clienteId es requerido' }, { status: 400 })
  }

  if (!agente) {
    return NextResponse.json({ error: 'agente es requerido' }, { status: 400 })
  }

  const memory = await loadAgentMemory(clienteId, agente, limit)
  return NextResponse.json(memory)
}
