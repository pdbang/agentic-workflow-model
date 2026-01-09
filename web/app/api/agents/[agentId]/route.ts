import { NextRequest, NextResponse } from 'next/server'
import { parseAgentConfig, parseModulesInputs, parseGlossary, parseSubAgents } from '@/lib/agents/parser'
import { writeAgentConfig, writeModulesInputs, writeGlossary, writeSubAgents } from '@/lib/agents/writer'
import fs from 'fs/promises'
import path from 'path'
import { getAgentPath } from '@/lib/utils/paths'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') ?? 'default'
    const version = searchParams.get('version') ?? 'latest'
    
    const [config, modulesInputs, glossary, subAgents] = await Promise.all([
      parseAgentConfig(clientId, agentId, version),
      parseModulesInputs(clientId, agentId, version),
      parseGlossary(clientId, agentId, version),
      parseSubAgents(clientId, agentId, version),
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
      glossary,
      subAgents,
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
    const { config, modulesInputs, glossary, subAgents } = body
    
    if (config) {
      await writeAgentConfig(clientId, agentId, version, config)
    }
    if (modulesInputs) {
      await writeModulesInputs(clientId, agentId, version, modulesInputs)
    }
    if (glossary) {
      await writeGlossary(clientId, agentId, version, glossary)
    }
    if (subAgents) {
      await writeSubAgents(clientId, agentId, version, subAgents)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PUT /api/agents/[agentId]:', error)
    return NextResponse.json(
      { error: 'Failed to save agent' },
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
    
    const agentPath = getAgentPath(clientId, agentId, 'latest')
    
    // Supprimer le dossier de l'agent
    await fs.rm(agentPath, { recursive: true, force: true })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/agents/[agentId]:', error)
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    )
  }
}
