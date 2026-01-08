import { NextRequest, NextResponse } from 'next/server'
import { getModulePath, pathExists, listModules } from '@/lib/utils/paths'
import { readYamlFile } from '@/lib/yaml/reader'
import path from 'path'

interface RouteParams {
  params: Promise<{
    moduleId: string
  }>
}

/**
 * GET /api/modules/:moduleId/dependencies
 * Récupère les dépendances d'un module et résout récursivement
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

    const dependenciesPath = path.join(modulePath, 'dependencies.yml')
    const dependencies = await readYamlFile<{ required?: string[], optional?: string[] }>(dependenciesPath)

    if (!dependencies) {
      return NextResponse.json({
        moduleId,
        required: [],
        optional: [],
        resolved: [],
      })
    }

    // Résoudre récursivement les dépendances
    const resolved = new Set<string>()
    const toResolve = [...(dependencies.required || []), ...(dependencies.optional || [])]

    async function resolveDeps(moduleIds: string[]) {
      for (const depModuleId of moduleIds) {
        if (resolved.has(depModuleId))
          continue

        resolved.add(depModuleId)

        const depModulePath = getModulePath(depModuleId)
        const depDepsPath = path.join(depModulePath, 'dependencies.yml')
        const depDeps = await readYamlFile<{ required?: string[], optional?: string[] }>(depDepsPath)

        if (depDeps) {
          await resolveDeps([...(depDeps.required || []), ...(depDeps.optional || [])])
        }
      }
    }

    await resolveDeps(toResolve)

    return NextResponse.json({
      moduleId,
      required: dependencies.required || [],
      optional: dependencies.optional || [],
      resolved: Array.from(resolved),
    })
  }
  catch (error) {
    console.error('Error in GET /api/modules/:moduleId/dependencies:', error)
    return NextResponse.json(
      { error: 'Failed to load module dependencies' },
      { status: 500 },
    )
  }
}
