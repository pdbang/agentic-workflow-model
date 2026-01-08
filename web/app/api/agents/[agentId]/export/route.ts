import { NextRequest, NextResponse } from 'next/server'
import { parseAgentConfig, parseModulesInputs, parseGlossary, parseSubAgents } from '@/lib/agents/parser'
import { getAgentPath, pathExists } from '@/lib/utils/paths'

interface RouteParams {
  params: Promise<{
    agentId: string
  }>
}

/**
 * GET /api/agents/:agentId/export
 * Exporte un agent complet en YAML (zip ou json)
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
    const format = searchParams.get('format') || 'json' // 'json' or 'zip'

    const agentPath = getAgentPath(clientId, agentId, version)

    if (!(await pathExists(agentPath))) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 },
      )
    }

    const [config, modulesInputs, glossary, subAgents] = await Promise.all([
      parseAgentConfig(clientId, agentId, version),
      parseModulesInputs(clientId, agentId, version),
      parseGlossary(clientId, agentId, version),
      parseSubAgents(clientId, agentId, version),
    ])

    if (!config) {
      return NextResponse.json(
        { error: 'Invalid agent configuration' },
        { status: 500 },
      )
    }

    if (format === 'json') {
      // Export en JSON avec tous les fichiers YAML convertis
      return NextResponse.json({
        agentId,
        clientId,
        version,
        exported_at: new Date().toISOString(),
        config,
        modulesInputs,
        glossary,
        subAgents,
      })
    }
    else {
      // Export en ZIP avec structure de fichiers
      // TODO: Implémenter l'export ZIP avec archiver
      return NextResponse.json(
        { error: 'ZIP export not yet implemented' },
        { status: 501 },
      )
    }
  }
  catch (error) {
    console.error('Error in GET /api/agents/:agentId/export:', error)
    return NextResponse.json(
      { error: 'Failed to export agent' },
      { status: 500 },
    )
  }
}
