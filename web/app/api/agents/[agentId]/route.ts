// API route for getting, updating, and deleting a specific agent
import { NextRequest, NextResponse } from 'next/server'
import { readAgentData, writeAgentData, deleteAgent, agentExists } from '@/lib/agents/file-system'
import type { AgentData } from '@/types/agent'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('clientId') || 'default'
    const version = searchParams.get('version') || 'latest'
    
    // For now, we only support 'latest' version
    if (version !== 'latest') {
      return NextResponse.json(
        { error: 'Only latest version is supported for now' },
        { status: 400 }
      )
    }
    
    if (!await agentExists(clientId, agentId)) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    const data = await readAgentData(clientId, agentId)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error reading agent:', error)
    return NextResponse.json(
      { error: 'Failed to read agent' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('clientId') || 'default'
    const version = searchParams.get('version') || 'latest'
    
    if (version !== 'latest') {
      return NextResponse.json(
        { error: 'Only latest version is supported for now' },
        { status: 400 }
      )
    }
    
    if (!await agentExists(clientId, agentId)) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    const body = await request.json()
    const data = body as AgentData
    
    await writeAgentData(clientId, agentId, data)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating agent:', error)
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('clientId') || 'default'
    
    if (!await agentExists(clientId, agentId)) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    await deleteAgent(clientId, agentId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting agent:', error)
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    )
  }
}
