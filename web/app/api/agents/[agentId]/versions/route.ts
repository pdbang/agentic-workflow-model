import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getAgentVersionsDetails } from '@/service/agents/versioning'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> },
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
      { error: 'Failed to load versions' },
      { status: 500 },
    )
  }
}
