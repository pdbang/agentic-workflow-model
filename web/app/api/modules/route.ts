import { NextResponse } from 'next/server'
import { listModules, getModulePath } from '@/lib/utils/paths'
import { readYamlFile } from '@/lib/yaml/reader'
import path from 'path'
import type { ModuleMetadata } from '@/types/module'

export async function GET() {
  try {
    const moduleIds = await listModules()
    const modules: ModuleMetadata[] = []

    for (const moduleId of moduleIds) {
      const modulePath = getModulePath(moduleId)

      // Lire les dépendances pour obtenir le nombre
      const dependenciesPath = path.join(modulePath, 'dependencies.yml')
      const dependencies = await readYamlFile<{ required?: string[], optional?: string[] }>(dependenciesPath)

      const requiredCount = dependencies?.required?.length ?? 0
      const optionalCount = dependencies?.optional?.length ?? 0
      const hasDependencies = requiredCount > 0 || optionalCount > 0

      modules.push({
        id: moduleId,
        name: moduleId,
        description: undefined, // TODO: Ajouter description dans module metadata
        version: undefined,
        hasDependencies,
        dependenciesCount: requiredCount + optionalCount,
      })
    }

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
