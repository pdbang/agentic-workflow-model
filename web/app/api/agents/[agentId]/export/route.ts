// API route for exporting agent as YAML
import { NextRequest, NextResponse } from 'next/server'
import { readAgentData } from '@/lib/agents/file-system'
import { writeAgentYAML } from '@/lib/agents/writer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('clientId') || 'default'
    const format = searchParams.get('format') || 'yaml'
    
    if (format !== 'yaml') {
      return NextResponse.json(
        { error: 'Only YAML format is supported' },
        { status: 400 }
      )
    }
    
    const data = await readAgentData(clientId, agentId)
    const yamlContent = writeAgentYAML(data)
    
    return new NextResponse(yamlContent, {
      headers: {
        'Content-Type': 'application/x-yaml',
        'Content-Disposition': `attachment; filename="${agentId}.yml"`,
      },
    })
  } catch (error) {
    console.error('Error exporting agent:', error)
    return NextResponse.json(
      { error: 'Failed to export agent' },
      { status: 500 }
    )
  }
}
