# ÉTAPE 2: Backend API Core

**Durée estimée**: 4-5 jours  
**Prérequis**: ÉTAPE 1 complétée

---

## 🎯 Objectifs

Développer l'API complète pour :
1. CRUD agents (Create, Read, Update, Delete)
2. Lecture et parsing de modules
3. Génération de formulaires depuis `forms.yml`
4. Gestion des dépendances entre modules
5. Import/Export YAML
6. Système de versioning

---

## 🔨 Tâches Détaillées

### 2.1 Schémas Zod Complets

**Étendre**: `web/types/sub-agent.ts` (nouveau fichier)

```typescript
import { z } from 'zod'

/**
 * Action d'un hook
 */
export const HookActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('tool'),
    target_tool: z.object({
      name: z.string(),
      module: z.string(),
      path: z.string(),
    }),
  }),
  z.object({
    action: z.literal('switch_sub_agent'),
    target_sub_agent: z.string(),
  }),
  z.object({
    action: z.literal('case'),
    cases: z.array(z.object({
      condition: z.string(),
      then: z.lazy(() => HookActionSchema),
    })),
    default: z.lazy(() => HookActionSchema).optional(),
  }),
])

export type HookAction = z.infer<typeof HookActionSchema>

/**
 * Configuration d'un hook
 */
export const HookConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  action: HookActionSchema,
})

export type HookConfig = z.infer<typeof HookConfigSchema>

/**
 * Configuration d'un tool dans un sub-agent
 */
export const SubAgentToolSchema = z.object({
  name: z.string(),
  module: z.string(),
  path: z.string(),
  description: z.string().optional(),
  hooks: z.record(z.string(), HookActionSchema).optional(),
})

export type SubAgentTool = z.infer<typeof SubAgentToolSchema>

/**
 * Configuration d'un prompt
 */
export const SubAgentPromptSchema = z.object({
  module: z.string(),
  path: z.string(),
  params: z.record(z.string(), z.unknown()).optional(),
})

export type SubAgentPrompt = z.infer<typeof SubAgentPromptSchema>

/**
 * Configuration d'un sub-agent
 */
export const SubAgentConfigSchema = z.object({
  sub_agent: z.object({
    name: z.string(),
    description: z.string(),
    prompts: z.array(SubAgentPromptSchema).optional(),
    tools: z.record(z.string(), SubAgentToolSchema).optional(),
  }),
})

export type SubAgentConfig = z.infer<typeof SubAgentConfigSchema>
```

**Créer**: `web/types/tool.ts`

```typescript
import { z } from 'zod'

/**
 * Input/Output d'un tool
 */
export const ToolParameterSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string(),
  required: z.boolean().default(false),
  default: z.unknown().optional(),
})

export type ToolParameter = z.infer<typeof ToolParameterSchema>

/**
 * Métadonnées d'un tool (depuis module)
 */
export const ToolMetadataSchema = z.object({
  name: z.string(),
  path: z.string(),
  description: z.string(),
  module: z.string(),
  inputs: z.array(ToolParameterSchema),
  outputs: z.array(ToolParameterSchema),
  hooks: z.array(z.string()), // Noms des hooks disponibles
})

export type ToolMetadata = z.infer<typeof ToolMetadataSchema>
```

**Créer**: `web/types/hook.ts`

```typescript
import { z } from 'zod'

/**
 * Définition d'un hook disponible sur un tool
 */
export const HookDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  defaultAction: z.enum(['tool', 'switch_sub_agent', 'case']),
})

export type HookDefinition = z.infer<typeof HookDefinitionSchema>
```

✅ **Validation**: Import des types sans erreur

---

### 2.2 Parser de Modules Complet

**Créer**: `web/lib/modules/parser.ts`

```typescript
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
```

✅ **Validation**: Tester avec un module qui a des dépendances

---

### 2.3 Générateur de Formulaires

**Créer**: `web/lib/modules/forms-generator.ts`

```typescript
import type { FormField } from '@/types/module'

/**
 * Type de composant UI pour un champ
 */
export type FieldComponent = 
  | 'input'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'select'
  | 'object'
  | 'array'

/**
 * Champ de formulaire React Hook Form
 */
export interface FormFieldDefinition extends FormField {
  component: FieldComponent
  validation: {
    required: boolean
    pattern?: string
    min?: number
    max?: number
  }
}

/**
 * Génère une définition de formulaire depuis forms.yml
 */
export function generateFormDefinition(fields: FormField[]): FormFieldDefinition[] {
  return fields.map(field => {
    const component = getFieldComponent(field.type)
    
    return {
      ...field,
      component,
      validation: {
        required: field.required ?? false,
      },
    }
  })
}

/**
 * Détermine le composant UI approprié pour un type
 */
function getFieldComponent(type: FormField['type']): FieldComponent {
  switch (type) {
    case 'string':
      return 'input'
    case 'number':
      return 'number'
    case 'boolean':
      return 'checkbox'
    case 'array':
      return 'array'
    case 'object':
      return 'object'
    default:
      return 'input'
  }
}

/**
 * Valide les données de formulaire contre le schéma
 */
export function validateFormData(
  data: Record<string, unknown>,
  fields: FormField[]
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  
  for (const field of fields) {
    const value = data[field.name]
    
    // Required validation
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.name] = `${field.label} is required`
      continue
    }
    
    // Type validation
    if (value !== undefined && value !== null) {
      const typeValid = validateFieldType(value, field.type)
      if (!typeValid) {
        errors[field.name] = `${field.label} must be of type ${field.type}`
      }
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Valide le type d'une valeur
 */
function validateFieldType(value: unknown, type: FormField['type']): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string'
    case 'number':
      return typeof value === 'number'
    case 'boolean':
      return typeof value === 'boolean'
    case 'array':
      return Array.isArray(value)
    case 'object':
      return typeof value === 'object' && !Array.isArray(value)
    default:
      return true
  }
}
```

✅ **Validation**: Tests unitaires avec Vitest

---

### 2.4 Writer Agent

**Créer**: `web/lib/agents/writer.ts`

```typescript
import path from 'path'
import fs from 'fs/promises'
import { writeYamlFile, writeYamlDirectory } from '@/lib/yaml/writer'
import { getAgentPath } from '@/lib/utils/paths'
import type { AgentConfig } from '@/types/agent'
import type { SubAgentConfig } from '@/types/sub-agent'

/**
 * Écrit la configuration principale d'un agent
 */
export async function writeAgentConfig(
  clientId: string,
  agentId: string,
  version: string,
  config: AgentConfig
): Promise<void> {
  const agentPath = getAgentPath(clientId, agentId, version)
  const configPath = path.join(agentPath, 'agent_config.yml')
  
  await writeYamlFile(configPath, config)
}

/**
 * Écrit les modules_inputs d'un agent
 */
export async function writeModulesInputs(
  clientId: string,
  agentId: string,
  version: string,
  modulesInputs: Record<string, unknown>
): Promise<void> {
  const agentPath = getAgentPath(clientId, agentId, version)
  const modulesPath = path.join(agentPath, 'modules_inputs')
  
  await writeYamlDirectory(modulesPath, modulesInputs)
}

/**
 * Écrit le glossary d'un agent
 */
export async function writeGlossary(
  clientId: string,
  agentId: string,
  version: string,
  glossary: {
    definitions?: unknown
    pronunciations?: unknown
    transcriptions?: unknown
  }
): Promise<void> {
  const agentPath = getAgentPath(clientId, agentId, version)
  const glossaryPath = path.join(agentPath, 'glossary')
  
  await fs.mkdir(glossaryPath, { recursive: true })
  
  if (glossary.definitions) {
    await writeYamlFile(path.join(glossaryPath, 'definitions.yml'), glossary.definitions)
  }
  if (glossary.pronunciations) {
    await writeYamlFile(path.join(glossaryPath, 'pronunciations.yml'), glossary.pronunciations)
  }
  if (glossary.transcriptions) {
    await writeYamlFile(path.join(glossaryPath, 'transcriptions.yml'), glossary.transcriptions)
  }
}

/**
 * Écrit les sub-agents d'un agent
 */
export async function writeSubAgents(
  clientId: string,
  agentId: string,
  version: string,
  subAgents: Record<string, SubAgentConfig>
): Promise<void> {
  const agentPath = getAgentPath(clientId, agentId, version)
  const subAgentsPath = path.join(agentPath, 'sub_agents')
  
  await writeYamlDirectory(subAgentsPath, subAgents)
}

/**
 * Supprime un agent (toutes versions ou une version spécifique)
 */
export async function deleteAgent(
  clientId: string,
  agentId: string,
  version?: string
): Promise<void> {
  if (version) {
    const agentPath = getAgentPath(clientId, agentId, version)
    await fs.rm(agentPath, { recursive: true, force: true })
  } else {
    const agentPath = path.join(getAgentPath(clientId, agentId, 'latest'), '..')
    await fs.rm(agentPath, { recursive: true, force: true })
  }
}
```

✅ **Validation**: Tester création/modification/suppression

---

### 2.5 Système de Versioning

**Créer**: `web/lib/agents/versioning.ts`

```typescript
import path from 'path'
import fs from 'fs/promises'
import { getAgentPath, listAgentVersions } from '@/lib/utils/paths'
import { parseAgentConfig, parseModulesInputs, parseSubAgents, parseGlossary } from './parser'
import { writeAgentConfig, writeModulesInputs, writeSubAgents, writeGlossary } from './writer'

/**
 * Crée une nouvelle version d'un agent
 */
export async function createAgentVersion(
  clientId: string,
  agentId: string,
  sourceVersion: string = 'latest'
): Promise<string> {
  // Génère le nom de la nouvelle version (timestamp)
  const newVersion = new Date().toISOString().replace(/[:.]/g, '-')
  
  // Copie tous les fichiers de la version source
  const sourcePath = getAgentPath(clientId, agentId, sourceVersion)
  const targetPath = getAgentPath(clientId, agentId, newVersion)
  
  await copyDirectory(sourcePath, targetPath)
  
  return newVersion
}

/**
 * Liste toutes les versions d'un agent avec métadonnées
 */
export async function getAgentVersionsDetails(
  clientId: string,
  agentId: string
): Promise<Array<{
  version: string
  createdAt: string
  isLatest: boolean
}>> {
  const versions = await listAgentVersions(clientId, agentId)
  
  return versions.map((version, index) => ({
    version,
    createdAt: parseVersionTimestamp(version),
    isLatest: index === 0 || version === 'latest',
  }))
}

/**
 * Duplique un agent existant (nouveau agent depuis un autre)
 */
export async function duplicateAgent(
  sourceClientId: string,
  sourceAgentId: string,
  targetClientId: string,
  targetAgentId: string,
  sourceVersion: string = 'latest'
): Promise<void> {
  // Lire la config source
  const [config, modulesInputs, subAgents, glossary] = await Promise.all([
    parseAgentConfig(sourceClientId, sourceAgentId, sourceVersion),
    parseModulesInputs(sourceClientId, sourceAgentId, sourceVersion),
    parseSubAgents(sourceClientId, sourceAgentId, sourceVersion),
    parseGlossary(sourceClientId, sourceAgentId, sourceVersion),
  ])
  
  if (!config) {
    throw new Error('Source agent not found')
  }
  
  // Écrire dans la nouvelle destination
  const targetVersion = 'latest'
  await Promise.all([
    writeAgentConfig(targetClientId, targetAgentId, targetVersion, config),
    writeModulesInputs(targetClientId, targetAgentId, targetVersion, modulesInputs),
    writeSubAgents(targetClientId, targetAgentId, targetVersion, subAgents),
    writeGlossary(targetClientId, targetAgentId, targetVersion, glossary),
  ])
}

/**
 * Copie récursive d'un dossier
 */
async function copyDirectory(source: string, target: string): Promise<void> {
  await fs.mkdir(target, { recursive: true })
  
  const entries = await fs.readdir(source, { withFileTypes: true })
  
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name)
    const targetPath = path.join(target, entry.name)
    
    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath)
    } else {
      await fs.copyFile(sourcePath, targetPath)
    }
  }
}

/**
 * Parse un timestamp depuis un nom de version
 */
function parseVersionTimestamp(version: string): string {
  if (version === 'latest') {
    return new Date().toISOString()
  }
  
  // Format: 2026-01-08T10-30-00-000Z
  const timestamp = version.replace(/-/g, (match, offset) => {
    if (offset < 10) return match // Garde les 2 premiers tirets (date)
    if (offset === 10) return 'T' // Remplace par T
    if (offset < 19) return ':' // Remplace par :
    return '.' // Remplace par .
  })
  
  return timestamp
}
```

✅ **Validation**: Tester création de version et duplication

---

### 2.6 API Routes Complètes

**Créer**: `web/app/api/agents/[agentId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { parseAgentConfig, parseModulesInputs, parseSubAgents, parseGlossary } from '@/lib/agents/parser'
import { writeAgentConfig, writeModulesInputs, writeSubAgents, writeGlossary, deleteAgent } from '@/lib/agents/writer'
import { AgentConfigSchema } from '@/types/agent'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') ?? 'default'
    const version = searchParams.get('version') ?? 'latest'
    
    const [config, modulesInputs, subAgents, glossary] = await Promise.all([
      parseAgentConfig(clientId, agentId, version),
      parseModulesInputs(clientId, agentId, version),
      parseSubAgents(clientId, agentId, version),
      parseGlossary(clientId, agentId, version),
    ])
    
    if (!config) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      config,
      modulesInputs,
      subAgents,
      glossary,
    })
  } catch (error) {
    console.error('Error in GET /api/agents/[agentId]:', error)
    return NextResponse.json(
      { error: 'Failed to load agent' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') ?? 'default'
    const version = searchParams.get('version') ?? 'latest'
    
    const body = await request.json()
    const { config, modulesInputs, subAgents, glossary } = body
    
    // Validation
    const configResult = AgentConfigSchema.safeParse(config)
    if (!configResult.success) {
      return NextResponse.json(
        { error: 'Invalid agent configuration', details: configResult.error },
        { status: 400 }
      )
    }
    
    // Écriture
    await Promise.all([
      writeAgentConfig(clientId, agentId, version, configResult.data),
      modulesInputs && writeModulesInputs(clientId, agentId, version, modulesInputs),
      subAgents && writeSubAgents(clientId, agentId, version, subAgents),
      glossary && writeGlossary(clientId, agentId, version, glossary),
    ])
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PUT /api/agents/[agentId]:', error)
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') ?? 'default'
    const version = searchParams.get('version')
    
    await deleteAgent(clientId, agentId, version ?? undefined)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/agents/[agentId]:', error)
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    )
  }
}
```

**Créer**: `web/app/api/agents/[agentId]/export/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import yaml from 'js-yaml'
import { parseAgentConfig, parseModulesInputs, parseSubAgents, parseGlossary } from '@/lib/agents/parser'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') ?? 'default'
    const version = searchParams.get('version') ?? 'latest'
    const format = searchParams.get('format') ?? 'json' // json or yaml
    
    const [config, modulesInputs, subAgents, glossary] = await Promise.all([
      parseAgentConfig(clientId, agentId, version),
      parseModulesInputs(clientId, agentId, version),
      parseSubAgents(clientId, agentId, version),
      parseGlossary(clientId, agentId, version),
    ])
    
    if (!config) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    const exportData = {
      agent_config: config,
      modules_inputs: modulesInputs,
      sub_agents: subAgents,
      glossary,
    }
    
    if (format === 'yaml') {
      const yamlContent = yaml.dump(exportData)
      return new NextResponse(yamlContent, {
        headers: {
          'Content-Type': 'application/x-yaml',
          'Content-Disposition': `attachment; filename="${agentId}-${version}.yml"`,
        },
      })
    }
    
    return NextResponse.json(exportData)
  } catch (error) {
    console.error('Error in GET /api/agents/[agentId]/export:', error)
    return NextResponse.json(
      { error: 'Failed to export agent' },
      { status: 500 }
    )
  }
}
```

**Créer**: `web/app/api/modules/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { listModules } from '@/lib/utils/paths'
import { parseModuleDependencies } from '@/lib/modules/parser'

export async function GET() {
  try {
    const moduleIds = await listModules()
    
    const modules = await Promise.all(
      moduleIds.map(async (id) => {
        const deps = await parseModuleDependencies(id)
        return {
          id,
          name: id,
          hasDependencies: (deps.required?.length ?? 0) > 0,
          dependenciesCount: (deps.required?.length ?? 0) + (deps.optional?.length ?? 0),
        }
      })
    )
    
    return NextResponse.json({ modules })
  } catch (error) {
    console.error('Error in GET /api/modules:', error)
    return NextResponse.json(
      { error: 'Failed to load modules' },
      { status: 500 }
    )
  }
}
```

**Créer**: `web/app/api/modules/[moduleId]/route.ts`

```typescript
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
```

✅ **Validation**: Tester toutes les routes avec curl ou Postman

---

## ✅ Checklist de Validation

- [ ] Schémas Zod complets pour sub-agents, tools, hooks
- [ ] Parser modules avec forms.yml, dependencies.yml, memory.yml
- [ ] Générateur de formulaires fonctionnel
- [ ] Writer agent pour toutes les sections
- [ ] Système de versioning (création version, duplication)
- [ ] API Route GET /api/agents/:id fonctionne
- [ ] API Route PUT /api/agents/:id fonctionne
- [ ] API Route DELETE /api/agents/:id fonctionne
- [ ] API Route GET /api/agents/:id/export (JSON + YAML)
- [ ] API Route GET /api/modules fonctionne
- [ ] API Route GET /api/modules/:id fonctionne
- [ ] Tests avec `new_project/example_agent/`
- [ ] Pas d'erreur TypeScript

---

## ➡️ Prochaine Étape

[ÉTAPE 3: Frontend - Configuration Agent](./STEP_3_FRONTEND_CONFIG.md)
