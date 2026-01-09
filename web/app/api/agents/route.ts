// API route for listing and creating agents
import { NextRequest, NextResponse } from 'next/server'
import { listAgents, readAgentData, writeAgentData, agentExists } from '@/lib/agents/file-system'
import type { AgentData } from '@/types/agent'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('clientId') || 'default'
    
    const agents = await listAgents(clientId)
    
    return NextResponse.json({ agents })
  } catch (error) {
    console.error('Error listing agents:', error)
    return NextResponse.json(
      { error: 'Failed to list agents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, clientId = 'default', data } = body
    
    if (!agentId) {
      return NextResponse.json(
        { error: 'agentId is required' },
        { status: 400 }
      )
    }
    
    if (await agentExists(clientId, agentId)) {
      return NextResponse.json(
        { error: 'Agent already exists' },
        { status: 409 }
      )
    }
    
    // Create default agent data if not provided
    const defaultData: AgentData = data || {
      config: {
        version: 'v6',
        language: 'fr-FR',
        timezone: 'Europe/Paris',
        modules: [],
        messages: {
          welcome: { text: 'Bonjour, comment puis-je vous aider ?' },
          goodbye: { text: 'Au revoir et bonne journée !' },
        },
        models: {
          llm: { provider: 'openai', model: 'gpt-4o-mini', temperature: 0.7 },
          stt: { provider: 'deepgram', model: 'nova-3' },
          tts: { provider: 'eleven_labs', voice_id: '' },
        },
      },
      modulesInputs: {},
      subAgents: {},
      glossary: {},
    }
    
    await writeAgentData(clientId, agentId, defaultData)
    
    return NextResponse.json({ success: true, agentId })
  } catch (error) {
    console.error('Error creating agent:', error)
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    )
  }
}
