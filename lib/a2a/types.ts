// Tipos del protocolo Agent2Agent (A2A) de Google
// Ref: https://google.github.io/A2A

export interface AgentCard {
  name: string
  description: string
  url: string
  version: string
  capabilities: {
    streaming: boolean
    pushNotifications: boolean
  }
  skills: AgentSkill[]
}

export interface AgentSkill {
  id: string
  name: string
  description: string
  inputModes: string[]
  outputModes: string[]
  tags?: string[]
}

export type TaskState = 'submitted' | 'working' | 'completed' | 'failed' | 'canceled'

export interface TaskPart {
  type: 'text' | 'data'
  text?: string
  data?: Record<string, unknown>
}

export interface TaskMessage {
  role: 'user' | 'agent'
  parts: TaskPart[]
}

export interface A2ATask {
  id: string
  sessionId?: string
  message: TaskMessage
}

export interface TaskResult {
  id: string
  sessionId?: string
  status: {
    state: TaskState
    message?: string
    timestamp: string
  }
  artifacts?: TaskArtifact[]
}

export interface TaskArtifact {
  name: string
  parts: TaskPart[]
}
