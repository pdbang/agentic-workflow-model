import { NextRequest, NextResponse } from 'next/server'
import { parseAgentConfig, parseModulesInputs, parseGlossary, parseSubAgents } from '@/lib/agents/parser'
import { writeYamlFile } from '@/lib/yaml/writer'
import { getAgentPath, pathExists } from '@/lib/utils/paths'
import path from 'path'
import fs from 'fs/promises'

interface RouteParams {
  params: Promise<{
    agentId: string
  }>
}

/**
 * GET /api/agents/:agentId
 * Récupère un agent complet avec toutes ses configurations
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { agentId } = await params
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') || 'test_client'
    const version = searchParams.get('version') || 'latest'

    const [config, modulesInputs, glossary, subAgents] = await Promise.all([
      parseAgentConfig(clientId, agentId, version),
      parseModulesInputs(clientId, agentId, version),
      parseGlossary(clientId, agentId, version),
      parseSubAgents(clientId, agentId, version),
    ])

    if (!config) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      id: agentId,
      clientId,
      version,
      config,
      modulesInputs,
      glossary,
      subAgents,
    })
  }
  catch (error) {
    console.error('Error in GET /api/agents/:agentId:', error)
    return NextResponse.json(
      { error: 'Failed to load agent' },
      { status: 500 },
    )
  }
}

/**
 * PUT /api/agents/:agentId
 * Met à jour la configuration d'un agent
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { agentId } = await params
    const body = await request.json()
    const { clientId = 'test_client', version = 'latest', config, modulesInputs, glossary, subAgents } = body

    const agentPath = getAgentPath(clientId, agentId, version)

    // Vérifier que l'agent existe
    if (!(await pathExists(agentPath))) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 },
      )
    }

    // Mettre à jour agent_config.yml si fourni
    if (config) {
      await writeYamlFile(
        path.join(agentPath, 'agent_config.yml'),
        config,
      )
    }

    // Mettre à jour modules_inputs si fourni
    if (modulesInputs) {
      const modulesPath = path.join(agentPath, 'modules_inputs')
      await fs.mkdir(modulesPath, { recursive: true })

      for (const [moduleName, moduleData] of Object.entries(modulesInputs)) {
        await writeYamlFile(
          path.join(modulesPath, `${moduleName}.yml`),
          moduleData,
        )
      }
    }

    // Mettre à jour glossary si fourni
    if (glossary) {
      const glossaryPath = path.join(agentPath, 'glossary')
      await fs.mkdir(glossaryPath, { recursive: true })

      if (glossary.definitions) {
        await writeYamlFile(
          path.join(glossaryPath, 'definitions.yml'),
          glossary.definitions,
        )
      }
      if (glossary.pronunciations) {
        await writeYamlFile(
          path.join(glossaryPath, 'pronunciations.yml'),
          glossary.pronunciations,
        )
      }
      if (glossary.transcriptions) {
        await writeYamlFile(
          path.join(glossaryPath, 'transcriptions.yml'),
          glossary.transcriptions,
        )
      }
    }

    // Mettre à jour sub_agents si fourni
    if (subAgents) {
      const subAgentsPath = path.join(agentPath, 'sub_agents')
      await fs.mkdir(subAgentsPath, { recursive: true })

      for (const [subAgentName, subAgentData] of Object.entries(subAgents)) {
        await writeYamlFile(
          path.join(subAgentsPath, `${subAgentName}.yml`),
          subAgentData,
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Agent updated successfully',
    })
  }
  catch (error) {
    console.error('Error in PUT /api/agents/:agentId:', error)
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/agents/:agentId
 * Supprime un agent
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { agentId } = await params
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') || 'test_client'
    const version = searchParams.get('version') || 'latest'

    const agentPath = getAgentPath(clientId, agentId, version)

    if (!(await pathExists(agentPath))) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 },
      )
    }

    // Supprimer le répertoire de l'agent
    await fs.rm(agentPath, { recursive: true, force: true })

    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully',
    })
  }
  catch (error) {
    console.error('Error in DELETE /api/agents/:agentId:', error)
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 },
    )
  }
}
