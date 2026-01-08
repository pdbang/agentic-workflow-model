import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getAgentVersionsDetails } from '@/lib/agents/versioning'

type RouteParams = {
  params: Promise<{ agentId: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { agentId } = await params
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') ?? 'default'

    const versions = await getAgentVersionsDetails(clientId, agentId)

    return NextResponse.json({ versions })
  }
  catch (error) {
    console.error('Error in GET /api/agents/[agentId]/versions:', error)
    return NextResponse.json(
      { error: 'Failed to load agent versions' },
      { status: 500 },
    )
  }
}
