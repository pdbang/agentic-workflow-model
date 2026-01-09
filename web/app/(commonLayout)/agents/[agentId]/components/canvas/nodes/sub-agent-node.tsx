'use client'

import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import type { SubAgentConfig } from '@/types/agent'
import { cn } from '@/utils/classnames'

interface SubAgentNodeProps {
  data: {
    config: SubAgentConfig
    onSelect: () => void
  }
  selected?: boolean
}

export const SubAgentNode = memo(({ data, selected }: SubAgentNodeProps) => {
  const { config, onSelect } = data
  const toolsCount = Object.keys(config.sub_agent.tools ?? {}).length
  const promptsCount = config.sub_agent.prompts?.length ?? 0

  return (
    <div
      onClick={onSelect}
      className={cn(
        'bg-white border-2 rounded-lg shadow-lg min-w-[240px] cursor-pointer hover:shadow-xl transition-shadow',
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-blue-400'
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-500 !w-3 !h-3" />

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <div className="font-semibold text-gray-900 truncate" title={config.sub_agent.name}>
            {config.sub_agent.name}
          </div>
        </div>
        <div className="text-xs text-gray-500 mb-3 line-clamp-2" title={config.sub_agent.description}>
          {config.sub_agent.description}
        </div>

        <div className="flex gap-3 text-xs text-gray-600">
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

      <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-3 !h-3" />
    </div>
  )
})

SubAgentNode.displayName = 'SubAgentNode'
