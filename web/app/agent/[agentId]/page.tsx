import { redirect } from 'next/navigation'
import { use } from 'react'

export default function AgentPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  redirect(`/agent/${agentId}/config`)
}
