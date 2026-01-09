import { NextRequest, NextResponse } from 'next/server'
import { getModulePath } from '@/lib/utils/paths'
import { readYamlFile } from '@/lib/yaml/reader'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params
    const modulePath = getModulePath(moduleId)
    
    const [form, dependencies, memory] = await Promise.all([
      readYamlFile(path.join(modulePath, 'forms.yml')),
      readYamlFile(path.join(modulePath, 'dependencies.yml')),
      readYamlFile(path.join(modulePath, 'memory.yml')),
    ])
    
    return NextResponse.json({
      form: form ?? null,
      dependencies: dependencies ?? null,
      memory: memory ?? null,
    })
  } catch (error) {
    console.error('Error in GET /api/modules/[moduleId]:', error)
    return NextResponse.json(
      { error: 'Failed to load module' },
      { status: 500 }
    )
  }
}
