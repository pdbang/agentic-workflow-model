import { NextRequest, NextResponse } from 'next/server'
import { duplicateAgent } from '@/lib/agents/versioning'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sourceClientId, sourceAgentId, targetClientId, targetAgentId } = body
    
    if (!sourceClientId || !sourceAgentId || !targetClientId || !targetAgentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    await duplicateAgent(
      sourceClientId,
      sourceAgentId,
      targetClientId,
      targetAgentId
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/agents/duplicate:', error)
    return NextResponse.json(
      { error: 'Duplication failed' },
      { status: 500 }
    )
  }
}
