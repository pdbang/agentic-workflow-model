'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { AgentMetadata } from '@/types/agent'

export default function AgentsPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<AgentMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [newAgentId, setNewAgentId] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => {
        setAgents(data.agents || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleCreateAgent = async () => {
    if (!newAgentId.trim()) {
      alert('Please enter an agent ID')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: 'default',
          agentId: newAgentId.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create agent')
      }

      router.push(`/agent/${newAgentId.trim()}/config`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create agent')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteAgent = async (agentId: string, clientId: string) => {
    if (!confirm(`Are you sure you want to delete agent "${agentId}"?`)) {
      return
    }

    try {
      const response = await fetch(
        `/api/agents/${agentId}?clientId=${clientId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Failed to delete agent')
      }

      setAgents(agents.filter(a => !(a.id === agentId && a.clientId === clientId)))
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete agent')
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Loading agents...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your AI agents configuration
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newAgentId}
            onChange={(e) => setNewAgentId(e.target.value)}
            placeholder="New agent ID"
            className="rounded-md border border-gray-300 px-3 py-2"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateAgent()}
          />
          <button
            onClick={handleCreateAgent}
            disabled={creating || !newAgentId.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Agent'}
          </button>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="mb-4 text-gray-500">No agents configured yet</p>
          <p className="text-sm text-gray-400">
            Create your first agent to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div
              key={`${agent.clientId}-${agent.id}`}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link
                    href={`/agent/${agent.id}/config`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {agent.id}
                  </Link>
                  <p className="mt-1 text-sm text-gray-500">
                    Client: {agent.clientId} | Version: {agent.version}
                  </p>
                  {agent.description && (
                    <p className="mt-2 text-sm text-gray-600">{agent.description}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    Updated: {new Date(agent.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteAgent(agent.id, agent.clientId)}
                  className="ml-2 text-red-600 hover:text-red-700"
                  title="Delete agent"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
