import { NextRequest, NextResponse } from 'next/server'
import { listClients, listAgentsByClient, getAgentPath, pathExists } from '@/lib/utils/paths'
import { getAgentMetadata } from '@/lib/agents/parser'
import { writeYamlFile } from '@/lib/yaml/writer'
import path from 'path'
import fs from 'fs/promises'

export async function GET() {
  try {
    const clients = await listClients()
    const allAgents = []
    
    for (const clientId of clients) {
      const agentIds = await listAgentsByClient(clientId)
      
      for (const agentId of agentIds) {
        const metadata = await getAgentMetadata(clientId, agentId)
        if (metadata) {
          allAgents.push(metadata)
        }
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

/**
 * POST /api/agents
 * Crée un nouvel agent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId = 'test_client', agentId, config } = body

    if (!agentId) {
      return NextResponse.json(
        { error: 'agentId is required' },
        { status: 400 },
      )
    }

    if (!config) {
      return NextResponse.json(
        { error: 'config is required' },
        { status: 400 },
      )
    }

    const version = 'latest'
    const agentPath = getAgentPath(clientId, agentId, version)

    // Vérifier que l'agent n'existe pas déjà
    if (await pathExists(agentPath)) {
      return NextResponse.json(
        { error: 'Agent already exists' },
        { status: 409 },
      )
    }

    // Créer la structure de répertoires
    await fs.mkdir(agentPath, { recursive: true })
    await fs.mkdir(path.join(agentPath, 'modules_inputs'), { recursive: true })
    await fs.mkdir(path.join(agentPath, 'glossary'), { recursive: true })
    await fs.mkdir(path.join(agentPath, 'sub_agents'), { recursive: true })

    // Créer le fichier agent_config.yml
    await writeYamlFile(
      path.join(agentPath, 'agent_config.yml'),
      config,
    )

    return NextResponse.json({
      success: true,
      message: 'Agent created successfully',
      agentId,
      clientId,
      version,
    }, { status: 201 })
  }
  catch (error) {
    console.error('Error in POST /api/agents:', error)
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 },
    )
  }
}
