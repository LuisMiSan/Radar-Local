'use client'

import { useState } from 'react'
import type { AgentConfig } from '@/lib/agents/types'
import type { Cliente } from '@/types'
import AgentGrid from './agent-grid'
import AgentModal from './agent-modal'

interface AgentesPanelProps {
  clients: Cliente[]
}

export default function AgentesPanel({ clients }: AgentesPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null)
  const [showModal, setShowModal] = useState(false)

  function handleSelectAgent(agent: AgentConfig) {
    setSelectedAgent(agent)
    setShowModal(true)
  }

  function handleCloseModal() {
    setShowModal(false)
    setSelectedAgent(null)
  }

  return (
    <>
      <AgentGrid
        selectedAgent={selectedAgent}
        onSelectAgent={handleSelectAgent}
      />

      {showModal && selectedAgent && (
        <AgentModal
          agent={selectedAgent}
          clients={clients}
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}
