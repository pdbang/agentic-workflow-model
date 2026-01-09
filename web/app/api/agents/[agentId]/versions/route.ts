import { NextRequest, NextResponse } from 'next/server'
import { getAgentVersionsDetails, createAgentVersion } from '@/lib/agents/versioning'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') ?? 'default'
    
    const versions = await getAgentVersionsDetails(clientId, agentId)
    
    // Marquer la version latest
    const versionsWithLatest = versions.map(v => ({
      ...v,
      isLatest: v.version === 'latest',
    }))
    
    return NextResponse.json({ versions: versionsWithLatest })
  } catch (error) {
    console.error('Error in GET /api/agents/[agentId]/versions:', error)
    return NextResponse.json(
      { error: 'Failed to load versions' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') ?? 'default'
    const sourceVersion = searchParams.get('sourceVersion') ?? 'latest'
    
    const newVersion = await createAgentVersion(clientId, agentId, sourceVersion)
    
    return NextResponse.json({ version: newVersion })
  } catch (error) {
    console.error('Error in POST /api/agents/[agentId]/versions:', error)
    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 }
    )
  }
}
