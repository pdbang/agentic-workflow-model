'use client'

import { use } from 'react'
import { useAgent } from '@/lib/hooks/use-agent'

export default function CanvasPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const { data, loading } = useAgent('default', agentId)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-500">Loading sub-agents...</div>
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

  const subAgents = Object.entries(data.subAgents || {})

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sub-Agents Canvas</h2>
        <p className="text-sm text-gray-600">
          Sub-agents define conversational states with their own tools and prompts.
        </p>
      </div>

      {subAgents.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No sub-agents configured yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Create sub-agent YAML files in the sub_agents/ directory.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subAgents.map(([name, config]: [string, any]) => (
            <div key={name} className="rounded-lg bg-white p-6 shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
              
              {config.sub_agent?.description && (
                <p className="text-sm text-gray-600 mb-4">{config.sub_agent.description}</p>
              )}
              
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Tools:</span>
                  <p className="text-sm text-gray-900 mt-1">
                    {config.sub_agent?.tools ? Object.keys(config.sub_agent.tools).length : 0} configured
                  </p>
                </div>
                
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Prompts:</span>
                  <p className="text-sm text-gray-900 mt-1">
                    {config.sub_agent?.prompts?.length || 0} configured
                  </p>
                </div>
              </div>
              
              <details className="mt-4">
                <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-700">
                  View Configuration
                </summary>
                <pre className="mt-2 bg-gray-50 rounded p-3 text-xs overflow-auto max-h-60">
                  {JSON.stringify(config, null, 2)}
                </pre>
              </details>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-lg bg-blue-50 p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Visual Canvas (Future Enhancement)</h3>
        <p className="text-sm text-blue-800">
          A visual drag-and-drop canvas with ReactFlow will be added in a future update. 
          For now, you can view and edit sub-agents by modifying the YAML files in the sub_agents/ directory.
        </p>
      </div>
    </div>
  )
}

