import type { MemoryVariable, ModuleDependencies, ModuleForm } from '@/types/module'
import path from 'node:path'
import { getModulePath } from '@/lib/utils/paths'
import { readYamlFile } from '@/lib/yaml/reader'
import { ModuleDependenciesSchema, ModuleFormSchema } from '@/types/module'

export async function parseModuleForm(moduleId: string): Promise<ModuleForm | null> {
  const modulePath = getModulePath(moduleId)
  const formPath = path.join(modulePath, 'forms.yml')
  const data = await readYamlFile(formPath)
  if (!data)
    return null
  const result = ModuleFormSchema.safeParse(data)
  if (!result.success) {
    console.error(`Invalid forms.yml for module ${moduleId}:`, result.error)
    return null
  }
  return result.data
}

export async function parseModuleDependencies(moduleId: string): Promise<ModuleDependencies> {
  const modulePath = getModulePath(moduleId)
  const depsPath = path.join(modulePath, 'dependencies.yml')
  const data = await readYamlFile(depsPath)
  if (!data) {
    return { required: [], optional: [] }
  }
  const result = ModuleDependenciesSchema.safeParse(data)
  if (!result.success) {
    console.error(`Invalid dependencies.yml for module ${moduleId}:`, result.error)
    return { required: [], optional: [] }
  }
  return result.data
}

export async function parseModuleMemory(moduleId: string): Promise<Record<string, MemoryVariable>> {
  const modulePath = getModulePath(moduleId)
  const memoryPath = path.join(modulePath, 'memory.yml')
  const data = await readYamlFile<Record<string, MemoryVariable>>(memoryPath)
  return data ?? {}
}

export async function resolveModuleDependencies(moduleId: string, visited: Set<string> = new Set()): Promise<string[]> {
  if (visited.has(moduleId)) {
    return []
  }
  visited.add(moduleId)
  const deps = await parseModuleDependencies(moduleId)
  const allDeps = [...(deps.required ?? []), ...(deps.optional ?? [])]
  const resolved = [moduleId]
  for (const depId of allDeps) {
    const subDeps = await resolveModuleDependencies(depId, visited)
    resolved.push(...subDeps)
  }
  return [...new Set(resolved)]
}
