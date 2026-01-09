import { NextResponse } from 'next/server'
import { listModules, getModulePath } from '@/lib/utils/paths'
import { readYamlFile } from '@/lib/yaml/reader'
import { ModuleDependenciesSchema, ModuleFormSchema } from '@/types/module'
import type { ModuleMetadata } from '@/types/module'
import path from 'path'

export async function GET() {
  try {
    const moduleIds = await listModules()
    const modules: ModuleMetadata[] = []
    
    for (const moduleId of moduleIds) {
      const modulePath = getModulePath(moduleId)
      const [dependencies, form] = await Promise.all([
        readYamlFile(path.join(modulePath, 'dependencies.yml')),
        readYamlFile(path.join(modulePath, 'forms.yml')),
      ])
      
      const deps = dependencies ? ModuleDependenciesSchema.parse(dependencies) : null
      const requiredCount = deps?.required?.length ?? 0
      const optionalCount = deps?.optional?.length ?? 0
      
      modules.push({
        id: moduleId,
        name: moduleId,
        description: undefined,
        version: undefined,
        hasDependencies: (requiredCount + optionalCount) > 0,
        dependenciesCount: requiredCount + optionalCount,
      })
    }
    
    return NextResponse.json({ modules })
  } catch (error) {
    console.error('Error in /api/modules:', error)
    return NextResponse.json(
      { error: 'Failed to load modules' },
      { status: 500 }
    )
  }
}
