import type { ReactNode } from 'react'
import { AgentHeader } from '@/app/components/agent/agent-header'
import { AgentTabs } from './components/agent-tabs'

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
      <div className="flex-1 overflow-auto bg-gray-50">
        {children}
      </div>
    </div>
  )
}
