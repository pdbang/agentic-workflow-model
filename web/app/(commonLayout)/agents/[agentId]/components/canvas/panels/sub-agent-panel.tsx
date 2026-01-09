'use client'

import { useState } from 'react'
import type { SubAgentConfig } from '@/types/agent'
import Button from '@/app/components/base/button'
import { RiCloseLine, RiDeleteBinLine } from '@remixicon/react'
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
    <div className="absolute right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl flex flex-col z-20">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sub-Agent</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {['general', 'prompts', 'tools'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`
                px-3 py-1 rounded text-sm font-medium capitalize transition-colors
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={config.sub_agent.description}
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
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="danger"
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2"
        >
          <RiDeleteBinLine className="h-4 w-4" />
          Delete Sub-Agent
        </Button>
      </div>
    </div>
  )
}
