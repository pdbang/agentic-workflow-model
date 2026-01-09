import type { ReactNode } from 'react'
import { AgentTabs } from './components/agent-tabs'
import { AgentHeader } from '@/app/components/agent/agent-header'

export default function AgentLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ agentId: string }>
}) {
  return (
    <div className="flex h-screen flex-col">
      <AgentHeader params={params} />
      <AgentTabs params={params} />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
