'use client'

import { useState } from 'react'
import type { SubAgentConfig } from '@/types/sub-agent'
import { ToolsPanel } from './tools-panel'
import { PromptsPanel } from './prompts-panel'

interface SubAgentPanelProps {
  nodeId: string
  config: SubAgentConfig
  modules: string[]
  onUpdate: (config: SubAgentConfig) => void
  onDelete: () => void
  onClose: () => void
}

export function SubAgentPanel({
  nodeId,
  config,
  modules,
  onUpdate,
  onDelete,
  onClose,
}: SubAgentPanelProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'prompts' | 'tools'>('general')

  const handleUpdate = (field: string, value: any) => {
    onUpdate({
      ...config,
      sub_agent: {
        ...config.sub_agent,
        [field]: value,
      },
    })
  }

  return (
    <div className="absolute right-0 top-0 flex h-full w-96 flex-col border-l border-gray-200 bg-white shadow-xl">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Sub-Agent</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {['general', 'prompts', 'tools'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`
                rounded px-3 py-1 text-sm font-medium capitalize transition-colors
                ${activeTab === tab
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={config.sub_agent.name}
                onChange={(e) => handleUpdate('name', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={config.sub_agent.description || ''}
                onChange={(e) => handleUpdate('description', e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        )}

        {activeTab === 'prompts' && (
          <PromptsPanel
            prompts={config.sub_agent.prompts ?? []}
            modules={modules}
            onChange={(prompts) => handleUpdate('prompts', prompts)}
          />
        )}

        {activeTab === 'tools' && (
          <ToolsPanel
            tools={config.sub_agent.tools ?? {}}
            modules={modules}
            onChange={(tools) => handleUpdate('tools', tools)}
          />
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={onDelete}
          className="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Delete Sub-Agent
        </button>
      </div>
    </div>
  )
}
