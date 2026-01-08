import { NextRequest, NextResponse } from 'next/server'
import { resolveModuleDependencies } from '@/lib/modules/parser'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params
    
    const dependencies = await resolveModuleDependencies(moduleId)
    
    return NextResponse.json({ 
      moduleId,
      dependencies: dependencies.filter(id => id !== moduleId), // Exclure le module lui-même
      all: dependencies, // Inclure le module
    })
  } catch (error) {
    console.error('Error in GET /api/modules/[moduleId]/dependencies:', error)
    return NextResponse.json(
      { error: 'Failed to resolve module dependencies' },
      { status: 500 }
    )
  }
}
