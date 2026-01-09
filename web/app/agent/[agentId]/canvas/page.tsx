'use client'

import { use } from 'react'
import { useAgent } from '@/lib/hooks/use-agent'
import { FlowCanvas } from '../components/canvas/flow-canvas'

export default function CanvasPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const { data, loading, updateSubAgents } = useAgent('default', agentId)

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Agent not found</div>
      </div>
    )
  }

  return (
    <div className="relative h-full bg-gray-50">
      <FlowCanvas
        subAgents={data.subAgents}
        modules={data.config.modules}
        onChange={updateSubAgents}
      />
    </div>
  )
}
