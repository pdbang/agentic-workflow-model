'use client'

import { use } from 'react'
import { useAgent } from '@/lib/hooks/use-agent'

export default function ModulesPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const { data, loading } = useAgent('default', agentId)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-500">Loading modules...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-red-500">Agent not found</div>
      </div>
    )
  }

  const configuredModules = data.config.modules || []

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configured Modules</h2>
        <p className="text-sm text-gray-600">
          Modules currently configured for this agent. Each module provides specific functionality.
        </p>
      </div>

      {configuredModules.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No modules configured yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Add modules in the agent_config.yml file to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {configuredModules.map((moduleId) => (
            <div key={moduleId} className="rounded-lg bg-white p-6 shadow border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{moduleId}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Module configuration
                  </p>
                  
                  {data.modulesInputs[moduleId] && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Current Configuration:</h4>
                      <pre className="bg-gray-50 rounded p-3 text-xs overflow-auto max-h-40">
                        {JSON.stringify(data.modulesInputs[moduleId], null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-lg bg-blue-50 p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Module Management</h3>
        <p className="text-sm text-blue-800">
          To add or remove modules, edit the <code className="bg-blue-100 px-1 rounded">modules</code> array 
          in the Configuration tab under General Settings, or modify the agent_config.yml file directly.
        </p>
      </div>
    </div>
  )
}

