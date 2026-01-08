import { NextRequest, NextResponse } from 'next/server'
import { getAgentPath, pathExists } from '@/lib/utils/paths'
import { writeYamlFile } from '@/lib/yaml/writer'
import { AgentConfigSchema } from '@/types/agent'
import path from 'path'
import fs from 'fs/promises'

/**
 * POST /api/agents/import
 * Importe un agent depuis une configuration JSON
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, clientId = 'test_client', version = 'latest', config, modulesInputs, glossary, subAgents, overwrite = false } = body

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

    // Valider la configuration avec Zod
    const validationResult = AgentConfigSchema.safeParse(config)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid agent configuration',
          details: validationResult.error.issues,
        },
        { status: 400 },
      )
    }

    const agentPath = getAgentPath(clientId, agentId, version)

    // Vérifier si l'agent existe déjà
    if (await pathExists(agentPath)) {
      if (!overwrite) {
        return NextResponse.json(
          { error: 'Agent already exists. Set overwrite=true to replace it.' },
          { status: 409 },
        )
      }

      // Supprimer l'ancien agent si overwrite est true
      await fs.rm(agentPath, { recursive: true, force: true })
    }

    // Créer la structure de répertoires
    await fs.mkdir(agentPath, { recursive: true })
    await fs.mkdir(path.join(agentPath, 'modules_inputs'), { recursive: true })
    await fs.mkdir(path.join(agentPath, 'glossary'), { recursive: true })
    await fs.mkdir(path.join(agentPath, 'sub_agents'), { recursive: true })

    // Écrire agent_config.yml
    await writeYamlFile(
      path.join(agentPath, 'agent_config.yml'),
      config,
    )

    // Écrire modules_inputs
    if (modulesInputs) {
      const modulesPath = path.join(agentPath, 'modules_inputs')
      for (const [moduleName, moduleData] of Object.entries(modulesInputs)) {
        await writeYamlFile(
          path.join(modulesPath, `${moduleName}.yml`),
          moduleData,
        )
      }
    }

    // Écrire glossary
    if (glossary) {
      const glossaryPath = path.join(agentPath, 'glossary')
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

    // Écrire sub_agents
    if (subAgents) {
      const subAgentsPath = path.join(agentPath, 'sub_agents')
      for (const [subAgentName, subAgentData] of Object.entries(subAgents)) {
        await writeYamlFile(
          path.join(subAgentsPath, `${subAgentName}.yml`),
          subAgentData,
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Agent imported successfully',
      agentId,
      clientId,
      version,
    }, { status: 201 })
  }
  catch (error) {
    console.error('Error in POST /api/agents/import:', error)
    return NextResponse.json(
      { error: 'Failed to import agent' },
      { status: 500 },
    )
  }
}
