import { NextRequest, NextResponse } from 'next/server'
import { parseModuleForm, parseModuleDependencies, parseModuleMemory, parseModuleTools } from '@/lib/modules/parser'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params
    
    const [form, dependencies, memory, tools] = await Promise.all([
      parseModuleForm(moduleId),
      parseModuleDependencies(moduleId),
      parseModuleMemory(moduleId),
      parseModuleTools(moduleId),
    ])
    
    if (!form) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      form,
      dependencies,
      memory,
      tools,
    })
  } catch (error) {
    console.error('Error in GET /api/modules/[moduleId]:', error)
    return NextResponse.json(
      { error: 'Failed to load module' },
      { status: 500 }
    )
  }
}
