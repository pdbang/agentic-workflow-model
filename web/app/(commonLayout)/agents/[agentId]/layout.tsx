'use client'

import { ReactNode, use } from 'react'
import { AgentSidebar } from './components/agent-sidebar'

export default function AgentLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ agentId: string }>
}) {
  const { agentId } = use(params)

  return (
    <div className="flex h-screen overflow-hidden">
      <AgentSidebar agentId={agentId} />
      <div className="flex-1 overflow-auto bg-background-body">
        {children}
      </div>
    </div>
  )
}
