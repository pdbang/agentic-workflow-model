'use client'

import { useState } from 'react'
import type { ModuleMetadata } from '@/types/module'

interface ModuleSelectorProps {
  availableModules: ModuleMetadata[]
  configuredModules: string[]
  onSelect: (moduleId: string) => void
  onClose: () => void
}

export function ModuleSelector({
  availableModules,
  configuredModules,
  onSelect,
  onClose,
}: ModuleSelectorProps) {
  const [search, setSearch] = useState('')
  const [selectedModule, setSelectedModule] = useState<string | null>(null)

  const filteredModules = availableModules.filter(module =>
    !configuredModules.includes(module.id) &&
    (module.name.toLowerCase().includes(search.toLowerCase()) ||
     module.description?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
        <div className="border-b border-gray-200 p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Add Module</h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules..."
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {filteredModules.map((module) => (
              <div
                key={module.id}
                onClick={() => setSelectedModule(module.id)}
                className={`
                  cursor-pointer rounded-lg border p-4 transition-colors
                  ${selectedModule === module.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{module.name}</h3>
                    {module.description && (
                      <p className="mt-1 text-sm text-gray-500">{module.description}</p>
                    )}
                    {module.hasDependencies && (
                      <p className="mt-2 text-xs text-gray-400">
                        📦 {module.dependenciesCount} dependencies
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedModule && onSelect(selectedModule)}
            disabled={!selectedModule}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Add Module
          </button>
        </div>
      </div>
    </div>
  )
}
