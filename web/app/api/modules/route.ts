import { NextResponse } from 'next/server'
import { listModules } from '@/lib/utils/paths'

export async function GET() {
  try {
    const moduleIds = await listModules()

    const modules = moduleIds.map(id => ({
      id,
      name: id,
      hasDependencies: false,
      dependenciesCount: 0,
    }))

    return NextResponse.json({ modules })
  }
  catch (error) {
    console.error('Error in /api/modules:', error)
    return NextResponse.json(
      { error: 'Failed to load modules' },
      { status: 500 },
    )
  }
}
