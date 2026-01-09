'use client'

import Link from 'next/link'
import type { ModuleMetadata } from '@/types/module'

interface ModuleListProps {
  modules: string[]
  availableModules: ModuleMetadata[]
  onRemove: (moduleId: string) => void
  agentId: string
}

export function ModuleList({ modules, availableModules, onRemove, agentId }: ModuleListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {modules.map((moduleId) => {
        const metadata = availableModules.find(m => m.id === moduleId)
        
        return (
          <div
            key={moduleId}
            className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between">
              <h3 className="font-medium text-gray-900">{metadata?.name || moduleId}</h3>
              <button
                onClick={() => onRemove(moduleId)}
                className="text-red-600 hover:text-red-700"
                title="Remove module"
              >
                ×
              </button>
            </div>

            {metadata?.description && (
              <p className="mb-3 text-sm text-gray-500">{metadata.description}</p>
            )}

            <Link
              href={`/agent/${agentId}/modules/${moduleId}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Configure →
            </Link>
          </div>
        )
      })}
    </div>
  )
}
