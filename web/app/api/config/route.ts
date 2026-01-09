import { NextResponse } from 'next/server'
import { PATHS, listClients, listModules } from '@/lib/utils/paths'

export async function GET() {
  try {
    const [clients, modules] = await Promise.all([
      listClients(),
      listModules(),
    ])
    
    return NextResponse.json({
      paths: PATHS,
      clients,
      modules,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in /api/config:', error)
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    )
  }
}
