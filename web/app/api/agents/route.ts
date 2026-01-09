import { NextResponse } from 'next/server'
import { listClients, listAgentsByClient } from '@/utils/agent-paths'
import { getAgentMetadata } from '@/service/agents/parser'

export async function GET() {
  try {
    const clients = await listClients()
    const allAgents = []

    for (const clientId of clients) {
      const agentIds = await listAgentsByClient(clientId)

      for (const agentId of agentIds) {
        const metadata = await getAgentMetadata(clientId, agentId)
        if (metadata)
          allAgents.push(metadata)
      }
    }

    return NextResponse.json({ agents: allAgents })
  }
  catch (error) {
    console.error('Error in /api/agents:', error)
    return NextResponse.json(
      { error: 'Failed to load agents' },
      { status: 500 },
    )
  }
}
