'use client'

import { useState, useEffect } from 'react'
import type { SubAgentTool } from '@/types/sub-agent'
import type { ToolMetadata } from '@/types/tool'
import { ToolSelector } from './tool-selector'
import { HookConfigurator } from './hook-configurator'

interface ToolsPanelProps {
  tools: Record<string, unknown>
  modules: string[]
  availableSubAgents?: string[]
  onChange: (tools: Record<string, unknown>) => void
}

export function ToolsPanel({ tools, modules, availableSubAgents = [], onChange }: ToolsPanelProps) {
  const [availableTools, setAvailableTools] = useState<ToolMetadata[]>([])
  const [showSelector, setShowSelector] = useState(false)
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  // Charger les tools disponibles depuis les modules
  useEffect(() => {
    if (modules.length === 0) {
      setAvailableTools([])
      return
    }

    // Pour l'instant, on simule les tools disponibles
    // TODO: Charger depuis l'API quand elle sera disponible
    const mockTools: ToolMetadata[] = modules.flatMap(moduleId => [
      {
        name: 'Initialize Session',
        module: moduleId,
        path: 'tools/initialize_session',
        description: 'Initialize a new session',
        hooks: ['on_success', 'on_failure'],
      },
      {
        name: 'Finalize Session',
        module: moduleId,
        path: 'tools/finalize_session',
        description: 'Finalize the current session',
        hooks: ['on_success'],
      },
    ])
    
    setAvailableTools(mockTools)
  }, [modules])

  const handleAddTool = (tool: ToolMetadata) => {
    const toolKey = `${tool.module}_${tool.name.toLowerCase().replace(/\s+/g, '_')}`
    const newTool: SubAgentTool = {
      name: tool.name,
      module: tool.module,
      path: tool.path,
    }
    
    onChange({
      ...tools,
      [toolKey]: newTool,
    })
    setShowSelector(false)
  }

  const handleRemoveTool = (toolKey: string) => {
    const { [toolKey]: _, ...rest } = tools
    onChange(rest)
    if (selectedTool === toolKey) {
      setSelectedTool(null)
    }
  }

  const handleUpdateTool = (toolKey: string, updates: Partial<SubAgentTool>) => {
    onChange({
      ...tools,
      [toolKey]: { ...tools[toolKey] as SubAgentTool, ...updates },
    })
  }

  const toolsRecord = tools as Record<string, SubAgentTool>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Tools</h4>
        <button
          onClick={() => setShowSelector(true)}
          className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
        >
          + Add Tool
        </button>
      </div>

      {Object.keys(toolsRecord).length === 0 ? (
        <p className="text-sm text-gray-500">No tools configured</p>
      ) : (
        <div className="space-y-2">
          {Object.entries(toolsRecord).map(([key, tool]) => (
            <div
              key={key}
              className={`
                cursor-pointer rounded-lg border p-3 transition-colors
                ${selectedTool === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => setSelectedTool(key)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {tool.module} / {tool.path}
                  </div>
                  {tool.hooks && Object.keys(tool.hooks).length > 0 && (
                    <div className="mt-1 text-xs text-blue-600">
                      {Object.keys(tool.hooks).length} hook(s) configured
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveTool(key)
                  }}
                  className="text-gray-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTool && toolsRecord[selectedTool] && (
        <HookConfigurator
          tool={toolsRecord[selectedTool]}
          onUpdate={(updates) => handleUpdateTool(selectedTool, updates)}
          availableSubAgents={availableSubAgents}
        />
      )}

      {showSelector && (
        <ToolSelector
          availableTools={availableTools}
          onSelect={handleAddTool}
          onClose={() => setShowSelector(false)}
        />
      )}
    </div>
  )
}
