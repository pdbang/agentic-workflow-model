'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type Agent = {
  id: string
  clientId: string
  version: string
  name: string
  description?: string
}

export function AgentsList() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAgents() {
      try {
        const response = await fetch('/api/agents')
        if (!response.ok) {
          throw new Error('Failed to fetch agents')
        }
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

    fetchAgents()
  }, [])

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
        <p className="mt-4 text-gray-600">Loading agents...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-600">
          Error:
          {error}
        </p>
      </div>
    )
  }

  if (agents.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900">No agents found</h3>
        <p className="mt-2 text-gray-600">
          Get started by creating your first agent configuration
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map(agent => (
        <Link
          key={`${agent.clientId}-${agent.id}`}
          href={`/agents/${agent.id}?clientId=${agent.clientId}`}
          className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{agent.name}</h3>
              <p className="mt-1 text-sm text-gray-500">
                Client:
                {' '}
                {agent.clientId}
              </p>
            </div>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
              {agent.version}
            </span>
          </div>
          {agent.description && (
            <p className="mt-3 text-sm text-gray-600">{agent.description}</p>
          )}
        </Link>
      ))}
    </div>
  )
}
