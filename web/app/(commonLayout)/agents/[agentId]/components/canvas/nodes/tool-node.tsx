'use client'

import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { cn } from '@/utils/classnames'

interface ToolNodeProps {
  data: {
    name: string
    module: string
    path: string
    onSelect?: () => void
  }
  selected?: boolean
}

export const ToolNode = memo(({ data, selected }: ToolNodeProps) => {
  const { name, module, path, onSelect } = data

  return (
    <div
      onClick={onSelect}
      className={cn(
        'bg-white border-2 rounded-lg shadow-lg min-w-[200px] cursor-pointer hover:shadow-xl transition-shadow',
        selected
          ? 'border-green-500 bg-green-50'
          : 'border-gray-300 hover:border-green-400'
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-green-500 !w-3 !h-3" />

      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <div className="font-semibold text-gray-900 text-sm truncate" title={name}>
            {name}
          </div>
        </div>
        <div className="text-xs text-gray-500 truncate" title={`${module}/${path}`}>
          {module}/{path}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-green-500 !w-3 !h-3" />
    </div>
  )
})

ToolNode.displayName = 'ToolNode'
