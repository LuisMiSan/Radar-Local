// Cliente A2A — llama a agentes externos compatibles con el protocolo Agent2Agent
import type { A2ATask, TaskResult, AgentCard } from './types'

// Registry de agentes A2A externos conocidos
// Cuando un proveedor publique su AgentCard, se añade aquí
const EXTERNAL_AGENTS: Record<string, string> = {
  // Ejemplo futuro: 'perplexity-search': 'https://agents.perplexity.ai'
  // Ejemplo futuro: 'bing-monitor': 'https://agents.bing.com'
}

export class A2AClient {
  // Descubrir el AgentCard de un agente externo
  async discover(baseUrl: string): Promise<AgentCard | null> {
    try {
      const res = await fetch(`${baseUrl}/.well-known/agent.json`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5_000),
      })
      if (!res.ok) return null
      return res.json() as Promise<AgentCard>
    } catch {
      return null
    }
  }

  // Enviar una tarea a un agente externo A2A
  async sendTask(baseUrl: string, task: A2ATask): Promise<TaskResult> {
    const res = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
      signal: AbortSignal.timeout(30_000),
    })

    if (!res.ok) {
      throw new Error(`A2A error ${res.status} en ${baseUrl}`)
    }

    return res.json() as Promise<TaskResult>
  }

  // Resolver URL de un agente por su ID (del registry o env)
  resolveAgent(agentId: string): string | null {
    // Primero buscar en env vars (permite override en producción)
    const envKey = `A2A_AGENT_${agentId.toUpperCase().replace(/-/g, '_')}_URL`
    const envUrl = process.env[envKey]
    if (envUrl) return envUrl

    return EXTERNAL_AGENTS[agentId] ?? null
  }
}

export const a2aClient = new A2AClient()
