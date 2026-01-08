'use client'

import type { AgentMetadata } from '@/types/agent'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState<string>('all')
  const [clients, setClients] = useState<string[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch agents
        const agentsResponse = await fetch('/api/agents')
        if (!agentsResponse.ok) {
          throw new Error('Failed to fetch agents')
        }
        const agentsData = await agentsResponse.json()
        setAgents(agentsData.agents || [])

        // Fetch clients
        const configResponse = await fetch('/api/config')
        if (!configResponse.ok) {
          throw new Error('Failed to fetch config')
        }
        const configData = await configResponse.json()
        setClients(configData.clients || [])
      }
      catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
      finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase())
      || agent.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClient = selectedClient === 'all' || agent.clientId === selectedClient
    return matchesSearch && matchesClient
  })

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="text-gray-600">Chargement des agents...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="mb-2 font-semibold text-red-800">Erreur</p>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agents IA</h1>
            <p className="mt-1 text-gray-600">
              Gérez vos agents conversationnels
            </p>
          </div>
          <Link
            href="/agents/new"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            + Nouvel Agent
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher un agent..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <select
            value={selectedClient}
            onChange={e => setSelectedClient(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tous les clients</option>
            {clients.map(client => (
              <option key={client} value={client}>
                {client}
              </option>
            ))}
          </select>
        </div>

        {/* Agent Grid */}
        {filteredAgents.length === 0
          ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <p className="text-gray-500">
                  {searchQuery || selectedClient !== 'all'
                    ? 'Aucun agent trouvé avec ces filtres'
                    : 'Aucun agent disponible. Créez votre premier agent !'}
                </p>
              </div>
            )
          : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAgents.map(agent => (
                  <Link
                    key={`${agent.clientId}-${agent.id}`}
                    href={`/agents/${agent.id}?clientId=${agent.clientId}`}
                    className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-500 hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                          {agent.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {agent.clientId}
                          {' '}
                          •
                          {agent.version}
                        </p>
                      </div>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        Actif
                      </span>
                    </div>

                    {agent.description && (
                      <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                        {agent.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Modifié
                        {' '}
                        {new Date(agent.updatedAt).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="text-blue-600 group-hover:underline">
                        Configurer →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
      </div>
    </div>
  )
}
