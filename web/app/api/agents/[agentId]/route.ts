import { NextRequest, NextResponse } from 'next/server'
import { parseAgentConfig, parseModulesInputs, parseSubAgents, parseGlossary } from '@/lib/agents/parser'
import { writeAgentConfig, writeModulesInputs, writeSubAgents, writeGlossary, deleteAgent } from '@/lib/agents/writer'
import { AgentConfigSchema } from '@/types/agent'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') ?? 'default'
    const version = searchParams.get('version') ?? 'latest'
    
    const [config, modulesInputs, subAgents, glossary] = await Promise.all([
      parseAgentConfig(clientId, agentId, version),
      parseModulesInputs(clientId, agentId, version),
      parseSubAgents(clientId, agentId, version),
      parseGlossary(clientId, agentId, version),
    ])
    
    if (!config) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      config,
      modulesInputs,
      subAgents,
      glossary,
    })
  } catch (error) {
    console.error('Error in GET /api/agents/[agentId]:', error)
    return NextResponse.json(
      { error: 'Failed to load agent' },
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
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') ?? 'default'
    const version = searchParams.get('version') ?? 'latest'
    
    const body = await request.json()
    const { config, modulesInputs, subAgents, glossary } = body
    
    // Validation
    const configResult = AgentConfigSchema.safeParse(config)
    if (!configResult.success) {
      return NextResponse.json(
        { error: 'Invalid agent configuration', details: configResult.error },
        { status: 400 }
      )
    }
    
    // Écriture
    await Promise.all([
      writeAgentConfig(clientId, agentId, version, configResult.data),
      modulesInputs && writeModulesInputs(clientId, agentId, version, modulesInputs),
      subAgents && writeSubAgents(clientId, agentId, version, subAgents),
      glossary && writeGlossary(clientId, agentId, version, glossary),
    ])
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PUT /api/agents/[agentId]:', error)
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
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') ?? 'default'
    const version = searchParams.get('version')
    
    await deleteAgent(clientId, agentId, version ?? undefined)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/agents/[agentId]:', error)
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    )
  }
}
