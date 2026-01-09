'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { AgentMetadata } from '@/types/agent'

interface Version extends AgentMetadata {
  isLatest?: boolean
}

export default function VersionsPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const router = useRouter()
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/agents/${agentId}/versions?clientId=default`)
      .then(res => res.json())
      .then(data => {
        setVersions(data.versions || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [agentId])

  const handleCreateVersion = async () => {
    const response = await fetch(
      `/api/agents/${agentId}/versions?clientId=default`,
      { method: 'POST' }
    )
    const result = await response.json()
    
    if (result.version) {
      setVersions([
        { 
          id: agentId,
          clientId: 'default',
          version: result.version, 
          name: agentId,
          createdAt: new Date().toISOString(), 
          updatedAt: new Date().toISOString(),
          isLatest: false 
        },
        ...versions,
      ])
    }
  }

  if (loading) {
    return <div className="p-6">Loading versions...</div>
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Versions</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage agent versions and history
          </p>
        </div>
        <button
          onClick={handleCreateVersion}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Create New Version
        </button>
      </div>

      <div className="space-y-2">
        {versions.map((version) => (
          <div
            key={version.version}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
          >
            <div>
              <div className="font-medium text-gray-900">
                {version.version}
                {version.isLatest && (
                  <span className="ml-2 rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                    Latest
                  </span>
                )}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                Created: {new Date(version.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  router.push(`/agent/${agentId}/config?version=${version.version}`)
                }}
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
