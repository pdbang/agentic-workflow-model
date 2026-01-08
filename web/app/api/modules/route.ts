import { NextResponse } from 'next/server'
import { listModules } from '@/lib/utils/paths'
import { parseModuleDependencies } from '@/lib/modules/parser'

export async function GET() {
  try {
    const moduleIds = await listModules()
    
    const modules = await Promise.all(
      moduleIds.map(async (id) => {
        const deps = await parseModuleDependencies(id)
        return {
          id,
          name: id,
          hasDependencies: (deps.required?.length ?? 0) > 0,
          dependenciesCount: (deps.required?.length ?? 0) + (deps.optional?.length ?? 0),
        }
      })
    )
    
    return NextResponse.json({ modules })
  } catch (error) {
    console.error('Error in GET /api/modules:', error)
    return NextResponse.json(
      { error: 'Failed to load modules' },
      { status: 500 }
    )
  }
}
