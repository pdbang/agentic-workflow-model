'use client'

import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { cn } from '@/utils/classnames'

interface HookNodeProps {
  data: {
    name: string
    action: string
    onSelect?: () => void
  }
  selected?: boolean
}

export const HookNode = memo(({ data, selected }: HookNodeProps) => {
  const { name, action, onSelect } = data

  return (
    <div
      onClick={onSelect}
      className={cn(
        'bg-white border-2 rounded-lg shadow-lg min-w-[180px] cursor-pointer hover:shadow-xl transition-shadow',
        selected
          ? 'border-purple-500 bg-purple-50'
          : 'border-gray-300 hover:border-purple-400'
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-purple-500 !w-3 !h-3" />

      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <div className="font-semibold text-gray-900 text-sm truncate" title={name}>
            {name}
          </div>
        </div>
        <div className="text-xs text-gray-500 truncate" title={action}>
          {action}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-purple-500 !w-3 !h-3" />
    </div>
  )
})

HookNode.displayName = 'HookNode'
