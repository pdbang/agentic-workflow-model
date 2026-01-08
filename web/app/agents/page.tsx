'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Button from '@/app/components/base/button'
import Loading from '@/app/components/base/loading'

interface Agent {
  id: string
  clientId: string
  version: string
  name: string
  createdAt: string
  updatedAt: string
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/agents')
      if (!response.ok)
        throw new Error('Failed to load agents')

      const data = await response.json()
      setAgents(data.agents || [])
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
    finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Agents</h1>
        <Button onClick={() => alert('Create new agent - To be implemented')}>
          Create Agent
        </Button>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No agents found. Create your first agent to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <Link
              key={`${agent.clientId}-${agent.id}`}
              href={`/agents/${agent.id}?clientId=${agent.clientId}`}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{agent.name}</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Client: {agent.clientId}</p>
                <p>Version: {agent.version}</p>
                <p>Updated: {new Date(agent.updatedAt).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">API Endpoints Available</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <code className="bg-gray-100 px-2 py-1 rounded">GET /api/agents</code>
            {' '}
            - List all agents
          </li>
          <li>
            <code className="bg-gray-100 px-2 py-1 rounded">GET /api/agents/:id</code>
            {' '}
            - Get agent details
          </li>
          <li>
            <code className="bg-gray-100 px-2 py-1 rounded">GET /api/agents/:id/export</code>
            {' '}
            - Export agent
          </li>
          <li>
            <code className="bg-gray-100 px-2 py-1 rounded">GET /api/modules</code>
            {' '}
            - List all modules
          </li>
        </ul>
      </div>
    </div>
  )
}
