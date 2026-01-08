import { NextRequest, NextResponse } from 'next/server'
import yaml from 'js-yaml'
import { parseAgentConfig, parseModulesInputs, parseSubAgents, parseGlossary } from '@/lib/agents/parser'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') ?? 'default'
    const version = searchParams.get('version') ?? 'latest'
    const format = searchParams.get('format') ?? 'json' // json or yaml
    
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
    
    const exportData = {
      agent_config: config,
      modules_inputs: modulesInputs,
      sub_agents: subAgents,
      glossary,
    }
    
    if (format === 'yaml') {
      const yamlContent = yaml.dump(exportData)
      return new NextResponse(yamlContent, {
        headers: {
          'Content-Type': 'application/x-yaml',
          'Content-Disposition': `attachment; filename="${agentId}-${version}.yml"`,
        },
      })
    }
    
    return NextResponse.json(exportData)
  } catch (error) {
    console.error('Error in GET /api/agents/[agentId]/export:', error)
    return NextResponse.json(
      { error: 'Failed to export agent' },
      { status: 500 }
    )
  }
}
