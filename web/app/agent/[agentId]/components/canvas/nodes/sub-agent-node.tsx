'use client'

import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import type { SubAgentConfig } from '@/types/sub-agent'

interface SubAgentNodeProps {
  data: {
    config: SubAgentConfig
    onSelect: () => void
  }
}

export const SubAgentNode = memo(({ data }: SubAgentNodeProps) => {
  const { config, onSelect } = data
  const toolsCount = Object.keys(config.sub_agent.tools ?? {}).length
  const promptsCount = config.sub_agent.prompts?.length ?? 0

  return (
    <div
      onClick={onSelect}
      className="min-w-[200px] cursor-pointer rounded-lg border-2 border-blue-500 bg-white p-4 shadow-lg transition-shadow hover:shadow-xl"
    >
      <Handle type="target" position={Position.Top} />

      <div>
        <div className="mb-1 font-semibold text-gray-900">
          {config.sub_agent.name}
        </div>
        <div className="mb-3 text-xs text-gray-500">
          {config.sub_agent.description}
        </div>

        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span>🔧</span>
            <span>{toolsCount} tools</span>
          </div>
          <div className="flex items-center gap-1">
            <span>💬</span>
            <span>{promptsCount} prompts</span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
})

SubAgentNode.displayName = 'SubAgentNode'
