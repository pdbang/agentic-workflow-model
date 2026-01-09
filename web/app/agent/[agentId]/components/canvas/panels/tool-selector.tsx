'use client'

import { useState } from 'react'
import type { ToolMetadata } from '@/types/tool'

interface ToolSelectorProps {
  availableTools: ToolMetadata[]
  onSelect: (tool: ToolMetadata) => void
  onClose: () => void
}

export function ToolSelector({ availableTools, onSelect, onClose }: ToolSelectorProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ToolMetadata | null>(null)

  const filteredTools = availableTools.filter(tool =>
    tool.name.toLowerCase().includes(search.toLowerCase()) ||
    tool.module.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
        <div className="border-b border-gray-200 p-4">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Select Tool</h3>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..."
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredTools.map((tool, index) => (
              <div
                key={`${tool.module}-${tool.name}-${index}`}
                onClick={() => setSelected(tool)}
                className={`
                  cursor-pointer rounded-lg border p-3 transition-colors
                  ${selected === tool
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="font-medium text-gray-900">{tool.name}</div>
                {tool.description && (
                  <div className="mt-1 text-xs text-gray-500">{tool.description}</div>
                )}
                <div className="mt-1 text-xs text-gray-400">
                  Module: {tool.module} | Path: {tool.path}
                  {tool.hooks && tool.hooks.length > 0 && (
                    <span> | {tool.hooks.length} hooks available</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => selected && onSelect(selected)}
            disabled={!selected}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Add Tool
          </button>
        </div>
      </div>
    </div>
  )
}
