'use client'

import { use } from 'react'
import { useAgent } from '@/lib/hooks/use-agent'
import Loading from '@/app/components/base/loading'
import { FlowCanvas } from '../components/canvas/flow-canvas'
import { AgentHeader } from '../components/agent-header'

export default function CanvasPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const { data, loading, updateSubAgents, save } = useAgent(agentId)

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Agent not found</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <AgentHeader agentId={agentId} data={data} onSave={save} />
      <div className="flex-1 relative bg-gray-50">
        <FlowCanvas
          subAgents={data.subAgents}
          modules={data.config.modules || []}
          onChange={updateSubAgents}
        />
      </div>
    </div>
  )
}
