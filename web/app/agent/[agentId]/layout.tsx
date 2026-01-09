import { ReactNode, use } from 'react'
import { AgentTabs } from './components/agent-tabs'
import { AgentHeader } from './components/agent-header'

export default function AgentLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ agentId: string }>
}) {
  const { agentId } = use(params)
  
  return (
    <div className="flex h-screen flex-col">
      <AgentHeader agentId={agentId} />
      <AgentTabs agentId={agentId} />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
