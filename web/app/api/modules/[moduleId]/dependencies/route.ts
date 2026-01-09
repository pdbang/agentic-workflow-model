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
    const dependencies = await readYamlFile(
      path.join(modulePath, 'dependencies.yml')
    )
    
    return NextResponse.json({
      dependencies: dependencies ?? { required: [], optional: [] },
    })
  } catch (error) {
    console.error('Error in GET /api/modules/[moduleId]/dependencies:', error)
    return NextResponse.json(
      { error: 'Failed to load dependencies' },
      { status: 500 }
    )
  }
}
