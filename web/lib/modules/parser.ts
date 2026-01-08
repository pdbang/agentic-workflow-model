import path from 'path'
import { readYamlFile } from '@/lib/yaml/reader'
import { getModulePath } from '@/lib/utils/paths'
import type { ModuleForm, ModuleDependencies, MemoryVariable } from '@/types/module'
import type { ToolMetadata } from '@/types/tool'
import { ModuleFormSchema, ModuleDependenciesSchema } from '@/types/module'

/**
 * Parse le forms.yml d'un module
 */
export async function parseModuleForm(moduleId: string): Promise<ModuleForm | null> {
  const modulePath = getModulePath(moduleId)
  const formPath = path.join(modulePath, 'forms.yml')
  
  const data = await readYamlFile(formPath)
  if (!data) return null
  
  const result = ModuleFormSchema.safeParse(data)
  if (!result.success) {
    console.error(`Invalid forms.yml for module ${moduleId}:`, result.error)
    return null
  }
  
  return result.data
}

/**
 * Parse les dependencies.yml d'un module
 */
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

/**
 * Parse le memory.yml d'un module
 */
export async function parseModuleMemory(moduleId: string): Promise<Record<string, MemoryVariable>> {
  const modulePath = getModulePath(moduleId)
  const memoryPath = path.join(modulePath, 'memory.yml')
  
  const data = await readYamlFile<Record<string, MemoryVariable>>(memoryPath)
  return data ?? {}
}

/**
 * Parse les tools d'un module depuis tools/*.yml
 */
export async function parseModuleTools(moduleId: string): Promise<ToolMetadata[]> {
  const modulePath = getModulePath(moduleId)
  const toolsPath = path.join(modulePath, 'tools')
  
  // TODO: Implémenter lecture des tools/*.yml
  // Pour l'instant, retourner un tableau vide
  return []
}

/**
 * Parse les prompts d'un module depuis prompts/*.yml
 */
export async function parseModulePrompts(moduleId: string): Promise<Record<string, unknown>> {
  const modulePath = getModulePath(moduleId)
  const promptsPath = path.join(modulePath, 'prompts')
  
  // TODO: Implémenter lecture des prompts
  return {}
}

/**
 * Résout récursivement les dépendances d'un module
 */
export async function resolveModuleDependencies(
  moduleId: string,
  visited: Set<string> = new Set()
): Promise<string[]> {
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
  
  // Retourner sans doublons, en gardant l'ordre
  return [...new Set(resolved)]
}
