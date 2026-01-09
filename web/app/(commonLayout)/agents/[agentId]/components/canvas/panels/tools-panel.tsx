'use client'

import type { SubAgentTool } from '@/types/agent'
import Button from '@/app/components/base/button'
import { RiAddLine, RiDeleteBinLine } from '@remixicon/react'

interface ToolsPanelProps {
  tools: Record<string, SubAgentTool>
  modules: string[]
  onChange: (tools: Record<string, SubAgentTool>) => void
}

export function ToolsPanel({ tools, modules, onChange }: ToolsPanelProps) {
  // TODO: Implémenter la sélection de tools depuis les modules (ÉTAPE 6)
  // Pour l'instant, affichage simple

  const handleRemoveTool = (toolName: string) => {
    const { [toolName]: _, ...rest } = tools
    onChange(rest)
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 mb-4">
        <p>Tools configuration will be fully implemented in Step 6.</p>
        <p className="mt-2">Currently configured: {Object.keys(tools).length} tools</p>
      </div>

      {Object.entries(tools).map(([name, tool]) => (
        <div key={name} className="border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-medium text-gray-900">{tool.name}</div>
              <div className="text-xs text-gray-500">{tool.module}/{tool.path}</div>
            </div>
            <Button
              variant="danger"
              size="small"
              onClick={() => handleRemoveTool(name)}
            >
              <RiDeleteBinLine className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      <Button
        variant="secondary"
        onClick={() => {
          // TODO: Open tool selector modal
          alert('Tool selector will be implemented in Step 6')
        }}
        className="w-full flex items-center justify-center gap-2"
      >
        <RiAddLine className="h-4 w-4" />
        Add Tool
      </Button>
    </div>
  )
}
