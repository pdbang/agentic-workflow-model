import { Suspense } from 'react'
import { AgentDetail } from './components/AgentDetail'

type Props = {
  params: Promise<{ agentId: string }>
  searchParams: Promise<{ clientId?: string, version?: string }>
}

export default async function AgentPage({ params, searchParams }: Props) {
  const { agentId } = await params
  const { clientId = 'default', version = 'latest' } = await searchParams

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading agent...</div>}>
        <AgentDetail agentId={agentId} clientId={clientId} version={version} />
      </Suspense>
    </div>
  )
}
