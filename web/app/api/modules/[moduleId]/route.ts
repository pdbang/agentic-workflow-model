import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { parseModuleDependencies, parseModuleForm, parseModuleMemory } from '@/lib/modules/parser'

type RouteParams = {
  params: Promise<{ moduleId: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { moduleId } = await params

    const [form, dependencies, memory] = await Promise.all([
      parseModuleForm(moduleId),
      parseModuleDependencies(moduleId),
      parseModuleMemory(moduleId),
    ])

    if (!form) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      form,
      dependencies,
      memory,
    })
  }
  catch (error) {
    console.error('Error in GET /api/modules/[moduleId]:', error)
    return NextResponse.json(
      { error: 'Failed to load module' },
      { status: 500 },
    )
  }
}
