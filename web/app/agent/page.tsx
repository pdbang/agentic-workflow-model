'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { AgentMetadata } from '@/types/agent'
import Button from '@/app/components/base/button'

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentMetadata[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAgents() {
      try {
        const response = await fetch('/api/agents')
        if (response.ok) {
          const data = await response.json()
          setAgents(data.agents)
        }
      }
      catch (error) {
        console.error('Failed to load agents:', error)
      }
      finally {
        setLoading(false)
      }
    }

    loadAgents()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-600">Loading agents...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agent Configuration</h1>
            <p className="mt-2 text-gray-600">
              Manage and configure your V6 agents
            </p>
          </div>
          <Button variant="primary">
            Create New Agent
          </Button>
        </div>

        {agents.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">No agents found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first agent
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map(agent => (
              <Link
                key={`${agent.clientId}-${agent.id}`}
                href={`/agent/${agent.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-6 transition hover:border-blue-500 hover:shadow-lg"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {agent.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Client:
                      {' '}
                      {agent.clientId}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {agent.version}
                  </span>
                </div>

                {agent.description && (
                  <p className="mb-4 text-sm text-gray-600">
                    {agent.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Updated: {new Date(agent.updatedAt).toLocaleDateString()}</span>
                  <span className="text-blue-600">Configure →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
