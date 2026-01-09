import { NextRequest, NextResponse } from 'next/server'
import { parseAgentConfig, parseModulesInputs, parseGlossary, parseSubAgents } from '@/lib/agents/parser'
import yaml from 'js-yaml'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') ?? 'default'
    const version = searchParams.get('version') ?? 'latest'
    const format = searchParams.get('format') ?? 'yaml'
    
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
    
    const exportData = {
      agent_config: config,
      modules_inputs: modulesInputs,
      glossary,
      sub_agents: subAgents,
    }
    
    if (format === 'json') {
      return NextResponse.json(exportData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${agentId}-${version}.json"`,
        },
      })
    } else {
      const yamlContent = yaml.dump(exportData, {
        indent: 2,
        lineWidth: 100,
      })
      
      return new NextResponse(yamlContent, {
        headers: {
          'Content-Type': 'text/yaml',
          'Content-Disposition': `attachment; filename="${agentId}-${version}.yml"`,
        },
      })
    }
  } catch (error) {
    console.error('Error in GET /api/agents/[agentId]/export:', error)
    return NextResponse.json(
      { error: 'Failed to export agent' },
      { status: 500 }
    )
  }
}
