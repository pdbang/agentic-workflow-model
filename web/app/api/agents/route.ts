import { NextResponse } from 'next/server'
import { listClients, listAgentsByClient } from '@/lib/utils/paths'
import { getAgentMetadata } from '@/lib/agents/parser'

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
  } catch (error) {
    console.error('Error in /api/agents:', error)
    return NextResponse.json(
      { error: 'Failed to load agents' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clientId, agentId } = body
    
    if (!clientId || !agentId) {
      return NextResponse.json(
        { error: 'Missing clientId or agentId' },
        { status: 400 }
      )
    }
    
    // Créer un agent vide avec configuration par défaut
    const { writeAgentConfig, writeModulesInputs, writeGlossary, writeSubAgents } = await import('@/lib/agents/writer')
    const { getAgentPath } = await import('@/lib/utils/paths')
    const agentPath = getAgentPath(clientId, agentId, 'latest')
    
    const defaultConfig = {
      version: 'v6' as const,
      language: 'fr-FR',
      timezone: 'Europe/Paris',
      modules: [],
      messages: {
        welcome: { text: 'Bonjour, comment puis-je vous aider ?' },
        goodbye: { text: 'Au revoir et bonne journée !' },
      },
      models: {
        llm: { provider: 'openai', model: 'gpt-4' },
        stt: { provider: 'deepgram', model: 'nova-2' },
        tts: { provider: 'eleven_labs', voice_id: '' },
      },
    }
    
    await Promise.all([
      writeAgentConfig(clientId, agentId, 'latest', defaultConfig),
      writeModulesInputs(clientId, agentId, 'latest', {}),
      writeGlossary(clientId, agentId, 'latest', {}),
      writeSubAgents(clientId, agentId, 'latest', {}),
    ])
    
    return NextResponse.json({ success: true, agentId })
  } catch (error) {
    console.error('Error in POST /api/agents:', error)
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    )
  }
}
