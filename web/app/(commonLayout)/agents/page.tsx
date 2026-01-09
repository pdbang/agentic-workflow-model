'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RiAddLine, RiDeleteBinLine, RiSettings3Line } from '@remixicon/react'
import Button from '@/app/components/base/button'
import Loading from '@/app/components/base/loading'
import { ToastContext } from '@/app/components/base/toast'
import { useContext } from 'use-context-selector'

interface Agent {
  id: string
  name: string
}

export default function AgentsPage() {
  const router = useRouter()
  const { notify } = useContext(ToastContext)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/agents?clientId=default')
      if (!response.ok) throw new Error('Failed to load agents')
      const data = await response.json()
      setAgents(data.agents.map((id: string) => ({ id, name: id })))
    } catch (error) {
      notify({ type: 'error', message: 'Failed to load agents' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    const agentId = prompt('Enter agent ID:')
    if (!agentId) return

    createAgent(agentId)
  }

  const createAgent = async (agentId: string) => {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, clientId: 'default' }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create agent')
      }

      notify({ type: 'success', message: 'Agent created successfully' })
      router.push(`/agents/${agentId}/config`)
    } catch (error) {
      notify({ type: 'error', message: error instanceof Error ? error.message : 'Failed to create agent' })
    }
  }

  const handleDelete = async (agentId: string) => {
    if (!confirm(`Are you sure you want to delete agent "${agentId}"?`)) return

    try {
      setDeleting(agentId)
      const response = await fetch(`/api/agents/${agentId}?clientId=default`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete agent')

      notify({ type: 'success', message: 'Agent deleted successfully' })
      loadAgents()
    } catch (error) {
      notify({ type: 'error', message: 'Failed to delete agent' })
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto bg-background-body">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Agents</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your AI agents configuration
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="flex items-center gap-2"
          >
            <RiAddLine className="h-4 w-4" />
            Create Agent
          </Button>
        </div>

        {agents.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <RiSettings3Line className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No agents</h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating a new agent
            </p>
            <div className="mt-6">
              <Button onClick={handleCreate}>
                Create Agent
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{agent.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">Agent ID: {agent.id}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => router.push(`/agents/${agent.id}/config`)}
                  >
                    <RiSettings3Line className="h-4 w-4" />
                    Configure
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleDelete(agent.id)}
                    disabled={deleting === agent.id}
                  >
                    <RiDeleteBinLine className="h-4 w-4" />
                    {deleting === agent.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
