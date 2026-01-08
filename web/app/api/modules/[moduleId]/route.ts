import { NextRequest, NextResponse } from 'next/server'
import { getModulePath, pathExists } from '@/lib/utils/paths'
import { readYamlFile, readYamlDirectory } from '@/lib/yaml/reader'
import path from 'path'

interface RouteParams {
  params: Promise<{
    moduleId: string
  }>
}

/**
 * GET /api/modules/:moduleId
 * Récupère la configuration complète d'un module
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { moduleId } = await params
    const modulePath = getModulePath(moduleId)

    if (!(await pathExists(modulePath))) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 },
      )
    }

    const [forms, dependencies, memory, tools, prompts] = await Promise.all([
      readYamlFile(path.join(modulePath, 'forms.yml')),
      readYamlFile(path.join(modulePath, 'dependencies.yml')),
      readYamlFile(path.join(modulePath, 'memory.yml')),
      readYamlDirectory(path.join(modulePath, 'tools')),
      readYamlDirectory(path.join(modulePath, 'prompts')),
    ])

    return NextResponse.json({
      id: moduleId,
      forms,
      dependencies,
      memory,
      tools,
      prompts,
    })
  }
  catch (error) {
    console.error('Error in GET /api/modules/:moduleId:', error)
    return NextResponse.json(
      { error: 'Failed to load module' },
      { status: 500 },
    )
  }
}
