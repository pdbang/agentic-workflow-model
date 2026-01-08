# ÉTAPE 1: Architecture et Setup Backend

**Durée estimée**: 3-4 jours  
**Prérequis**: Dify cloné, Node.js v22+, pnpm installé

---

## 🎯 Objectifs

Mettre en place l'architecture backend TypeScript/Node avec :
1. Modèles TypeScript + Zod pour tous les types YAML
2. Utilitaires de lecture/écriture de fichiers YAML
3. Structure de base des API Routes Next.js
4. Configuration TypeScript stricte

---

## 📁 Structure Cible

```
web/
├── app/
│   └── api/
│       ├── agents/
│       │   ├── route.ts                    # GET /api/agents (liste)
│       │   └── [agentId]/
│       │       ├── route.ts                # GET/PUT/DELETE /api/agents/:id
│       │       ├── export/
│       │       │   └── route.ts            # GET /api/agents/:id/export
│       │       └── versions/
│       │           └── route.ts            # GET /api/agents/:id/versions
│       ├── modules/
│       │   ├── route.ts                    # GET /api/modules (liste)
│       │   └── [moduleId]/
│       │       ├── route.ts                # GET /api/modules/:id
│       │       └── dependencies/
│       │           └── route.ts            # GET /api/modules/:id/dependencies
│       └── config/
│           └── route.ts                    # GET /api/config (paths, clients)
├── lib/
│   ├── agents/
│   │   ├── schema.ts                       # Schémas Zod agents
│   │   ├── parser.ts                       # Parse YAML → TypeScript
│   │   ├── writer.ts                       # TypeScript → YAML
│   │   ├── validator.ts                    # Validation complète
│   │   └── versioning.ts                   # Gestion versions
│   ├── modules/
│   │   ├── schema.ts                       # Schémas Zod modules
│   │   ├── parser.ts                       # Parse modules YAML
│   │   ├── forms-generator.ts              # Génère formulaires depuis forms.yml
│   │   └── dependencies.ts                 # Résolution dépendances
│   ├── yaml/
│   │   ├── reader.ts                       # Lecture fichiers YAML
│   │   └── writer.ts                       # Écriture fichiers YAML
│   └── utils/
│       ├── paths.ts                        # Chemins configuration
│       └── file-system.ts                  # Utilitaires fs
└── types/
    ├── agent.ts                            # Types agents
    ├── module.ts                           # Types modules
    ├── sub-agent.ts                        # Types sub-agents
    ├── tool.ts                             # Types tools
    └── hook.ts                             # Types hooks
```

---

## 🔨 Tâches Détaillées

### 1.1 Configuration TypeScript

**Fichier**: `web/tsconfig.json` (vérifier/ajuster)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./app/*"],
      "@/lib/*": ["./lib/*"],
      "@/types/*": ["./types/*"]
    }
  }
}
```

✅ **Validation**: `pnpm type-check:tsgo` passe sans erreur

---

### 1.2 Installation Dépendances

**Fichier**: `web/package.json`

```bash
cd web
pnpm add zod js-yaml
pnpm add -D @types/js-yaml
```

**Packages requis**:
- `zod`: Validation TypeScript runtime (équivalent Pydantic)
- `js-yaml`: Parse/stringify YAML
- `@types/js-yaml`: Types TypeScript pour js-yaml

✅ **Validation**: `pnpm install` réussit, packages dans `node_modules/`

---

### 1.3 Configuration des Paths

**Créer**: `web/lib/utils/paths.ts`

```typescript
import path from 'path'
import fs from 'fs/promises'

/**
 * Configuration des chemins pour agents et modules
 */
export const PATHS = {
  // Racine du projet (remonte depuis web/)
  ROOT: path.resolve(process.cwd(), '..'),
  
  // Agents configurations
  AGENTS_BASE: path.resolve(process.cwd(), '..', 'agents', 'configurations', 'v6'),
  
  // Modules configurations exportées
  MODULES_BASE: path.resolve(process.cwd(), '..', 'agents', 'modules_configurations'),
} as const

/**
 * Retourne le chemin complet d'un agent
 */
export function getAgentPath(clientId: string, agentId: string, version: string = 'latest'): string {
  return path.join(PATHS.AGENTS_BASE, clientId, agentId, version)
}

/**
 * Retourne le chemin complet d'un module
 */
export function getModulePath(moduleId: string): string {
  return path.join(PATHS.MODULES_BASE, moduleId)
}

/**
 * Liste tous les clients disponibles
 */
export async function listClients(): Promise<string[]> {
  try {
    const entries = await fs.readdir(PATHS.AGENTS_BASE, { withFileTypes: true })
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
  } catch (error) {
    return []
  }
}

/**
 * Liste tous les agents d'un client
 */
export async function listAgentsByClient(clientId: string): Promise<string[]> {
  try {
    const clientPath = path.join(PATHS.AGENTS_BASE, clientId)
    const entries = await fs.readdir(clientPath, { withFileTypes: true })
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
  } catch (error) {
    return []
  }
}

/**
 * Liste toutes les versions d'un agent
 */
export async function listAgentVersions(clientId: string, agentId: string): Promise<string[]> {
  try {
    const agentPath = path.join(PATHS.AGENTS_BASE, clientId, agentId)
    const entries = await fs.readdir(agentPath, { withFileTypes: true })
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .sort((a, b) => b.localeCompare(a)) // Plus récent en premier
  } catch (error) {
    return []
  }
}

/**
 * Liste tous les modules disponibles
 */
export async function listModules(): Promise<string[]> {
  try {
    const entries = await fs.readdir(PATHS.MODULES_BASE, { withFileTypes: true })
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
  } catch (error) {
    return []
  }
}

/**
 * Vérifie si un chemin existe
 */
export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}
```

✅ **Validation**: Import sans erreur, types corrects

---

### 1.4 Utilitaires YAML

**Créer**: `web/lib/yaml/reader.ts`

```typescript
import fs from 'fs/promises'
import yaml from 'js-yaml'
import { pathExists } from '@/lib/utils/paths'

/**
 * Lit et parse un fichier YAML
 */
export async function readYamlFile<T = unknown>(filePath: string): Promise<T | null> {
  try {
    if (!(await pathExists(filePath))) {
      return null
    }
    
    const content = await fs.readFile(filePath, 'utf-8')
    const data = yaml.load(content) as T
    return data
  } catch (error) {
    console.error(`Error reading YAML file ${filePath}:`, error)
    return null
  }
}

/**
 * Lit plusieurs fichiers YAML d'un dossier
 */
export async function readYamlDirectory<T = unknown>(
  dirPath: string,
  filePattern?: RegExp
): Promise<Record<string, T>> {
  const result: Record<string, T> = {}
  
  try {
    if (!(await pathExists(dirPath))) {
      return result
    }
    
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const yamlFiles = entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.yml'))
      .filter(entry => !filePattern || filePattern.test(entry.name))
    
    for (const file of yamlFiles) {
      const filePath = `${dirPath}/${file.name}`
      const data = await readYamlFile<T>(filePath)
      if (data) {
        const key = file.name.replace('.yml', '')
        result[key] = data
      }
    }
    
    return result
  } catch (error) {
    console.error(`Error reading YAML directory ${dirPath}:`, error)
    return result
  }
}
```

**Créer**: `web/lib/yaml/writer.ts`

```typescript
import fs from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'

/**
 * Options d'écriture YAML
 */
export interface WriteYamlOptions {
  indent?: number
  lineWidth?: number
  noRefs?: boolean
  sortKeys?: boolean
}

/**
 * Écrit des données dans un fichier YAML
 */
export async function writeYamlFile(
  filePath: string,
  data: unknown,
  options: WriteYamlOptions = {}
): Promise<void> {
  try {
    // Créer le dossier parent si nécessaire
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })
    
    // Convertir en YAML
    const yamlContent = yaml.dump(data, {
      indent: options.indent ?? 2,
      lineWidth: options.lineWidth ?? 100,
      noRefs: options.noRefs ?? true,
      sortKeys: options.sortKeys ?? false,
    })
    
    // Écrire le fichier
    await fs.writeFile(filePath, yamlContent, 'utf-8')
  } catch (error) {
    console.error(`Error writing YAML file ${filePath}:`, error)
    throw error
  }
}

/**
 * Écrit plusieurs fichiers YAML dans un dossier
 */
export async function writeYamlDirectory(
  dirPath: string,
  files: Record<string, unknown>,
  options: WriteYamlOptions = {}
): Promise<void> {
  try {
    // Créer le dossier si nécessaire
    await fs.mkdir(dirPath, { recursive: true })
    
    // Écrire chaque fichier
    for (const [filename, data] of Object.entries(files)) {
      const filePath = path.join(dirPath, `${filename}.yml`)
      await writeYamlFile(filePath, data, options)
    }
  } catch (error) {
    console.error(`Error writing YAML directory ${dirPath}:`, error)
    throw error
  }
}
```

✅ **Validation**: Créer un test simple avec lecture/écriture d'un fichier YAML

---

### 1.5 Schémas Zod de Base

**Créer**: `web/types/agent.ts`

```typescript
import { z } from 'zod'

/**
 * Message multilingue
 */
export const MessageSchema = z.object({
  texts: z.record(z.string(), z.string()).optional(),
  text: z.string().optional(),
  audio: z.string().optional(),
})

export type Message = z.infer<typeof MessageSchema>

/**
 * Configuration des modèles (LLM, STT, TTS)
 */
export const ModelConfigSchema = z.object({
  provider: z.string(),
  model: z.string(),
  temperature: z.number().optional(),
  timeout: z.number().optional(),
  voice_id: z.string().optional(),
  model_id: z.string().optional(),
})

export type ModelConfig = z.infer<typeof ModelConfigSchema>

/**
 * Configuration agent principale
 */
export const AgentConfigSchema = z.object({
  version: z.literal('v6'),
  language: z.string(),
  alternative_languages: z.array(z.string()).optional(),
  timezone: z.string(),
  modules: z.array(z.string()),
  messages: z.record(z.string(), MessageSchema),
  models: z.object({
    llm: ModelConfigSchema,
    stt: ModelConfigSchema,
    tts: ModelConfigSchema,
  }),
  triggers: z.object({
    start_discussion: z.array(z.unknown()).optional(),
    end_discussion: z.array(z.unknown()).optional(),
  }).optional(),
})

export type AgentConfig = z.infer<typeof AgentConfigSchema>

/**
 * Métadonnées agent (pour liste)
 */
export const AgentMetadataSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  version: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type AgentMetadata = z.infer<typeof AgentMetadataSchema>
```

**Créer**: `web/types/module.ts`

```typescript
import { z } from 'zod'

/**
 * Champ de formulaire module
 */
export const FormFieldSchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(false),
  default: z.unknown().optional(),
  options: z.array(z.string()).optional(), // Pour select/enum
  fields: z.lazy(() => z.array(FormFieldSchema)).optional(), // Pour object nested
})

export type FormField = z.infer<typeof FormFieldSchema>

/**
 * Définition formulaire module (forms.yml)
 */
export const ModuleFormSchema = z.object({
  fields: z.array(FormFieldSchema),
})

export type ModuleForm = z.infer<typeof ModuleFormSchema>

/**
 * Dépendance module (dependencies.yml)
 */
export const ModuleDependenciesSchema = z.object({
  required: z.array(z.string()).optional(),
  optional: z.array(z.string()).optional(),
})

export type ModuleDependencies = z.infer<typeof ModuleDependenciesSchema>

/**
 * Variable mémoire module (memory.yml)
 */
export const MemoryVariableSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.string(),
  default: z.unknown(),
  scopes: z.object({
    session: z.boolean(),
    user: z.boolean(),
    shared: z.boolean(),
  }),
  module: z.string(),
})

export type MemoryVariable = z.infer<typeof MemoryVariableSchema>

/**
 * Métadonnées module (pour liste)
 */
export const ModuleMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string().optional(),
  hasDependencies: z.boolean(),
  dependenciesCount: z.number(),
})

export type ModuleMetadata = z.infer<typeof ModuleMetadataSchema>
```

✅ **Validation**: Import des schémas sans erreur, types inférés correctement

---

### 1.6 Parser Agent de Base

**Créer**: `web/lib/agents/parser.ts`

```typescript
import path from 'path'
import { readYamlFile, readYamlDirectory } from '@/lib/yaml/reader'
import { AgentConfigSchema } from '@/types/agent'
import type { AgentConfig, AgentMetadata } from '@/types/agent'
import { getAgentPath } from '@/lib/utils/paths'

/**
 * Parse la configuration principale d'un agent
 */
export async function parseAgentConfig(
  clientId: string,
  agentId: string,
  version: string = 'latest'
): Promise<AgentConfig | null> {
  const agentPath = getAgentPath(clientId, agentId, version)
  const configPath = path.join(agentPath, 'agent_config.yml')
  
  const data = await readYamlFile(configPath)
  if (!data) return null
  
  // Validation avec Zod
  const result = AgentConfigSchema.safeParse(data)
  if (!result.success) {
    console.error('Invalid agent config:', result.error)
    return null
  }
  
  return result.data
}

/**
 * Parse les modules_inputs d'un agent
 */
export async function parseModulesInputs(
  clientId: string,
  agentId: string,
  version: string = 'latest'
): Promise<Record<string, unknown>> {
  const agentPath = getAgentPath(clientId, agentId, version)
  const modulesPath = path.join(agentPath, 'modules_inputs')
  
  return await readYamlDirectory(modulesPath)
}

/**
 * Parse le glossary d'un agent
 */
export async function parseGlossary(
  clientId: string,
  agentId: string,
  version: string = 'latest'
): Promise<{
  definitions?: unknown
  pronunciations?: unknown
  transcriptions?: unknown
}> {
  const agentPath = getAgentPath(clientId, agentId, version)
  const glossaryPath = path.join(agentPath, 'glossary')
  
  const [definitions, pronunciations, transcriptions] = await Promise.all([
    readYamlFile(path.join(glossaryPath, 'definitions.yml')),
    readYamlFile(path.join(glossaryPath, 'pronunciations.yml')),
    readYamlFile(path.join(glossaryPath, 'transcriptions.yml')),
  ])
  
  return {
    definitions: definitions ?? undefined,
    pronunciations: pronunciations ?? undefined,
    transcriptions: transcriptions ?? undefined,
  }
}

/**
 * Parse les sub-agents d'un agent
 */
export async function parseSubAgents(
  clientId: string,
  agentId: string,
  version: string = 'latest'
): Promise<Record<string, unknown>> {
  const agentPath = getAgentPath(clientId, agentId, version)
  const subAgentsPath = path.join(agentPath, 'sub_agents')
  
  return await readYamlDirectory(subAgentsPath)
}

/**
 * Récupère les métadonnées d'un agent
 */
export async function getAgentMetadata(
  clientId: string,
  agentId: string,
  version: string = 'latest'
): Promise<AgentMetadata | null> {
  const config = await parseAgentConfig(clientId, agentId, version)
  if (!config) return null
  
  // TODO: Lire les timestamps réels des fichiers
  const agentPath = getAgentPath(clientId, agentId, version)
  
  return {
    id: agentId,
    clientId,
    version,
    name: agentId, // TODO: Ajouter name dans agent_config.yml ?
    description: undefined,
    createdAt: new Date().toISOString(), // TODO: Implémenter
    updatedAt: new Date().toISOString(), // TODO: Implémenter
  }
}
```

✅ **Validation**: Tester avec `new_project/example_agent/`

---

### 1.7 API Route Test

**Créer**: `web/app/api/config/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { PATHS, listClients, listModules } from '@/lib/utils/paths'

export async function GET() {
  try {
    const [clients, modules] = await Promise.all([
      listClients(),
      listModules(),
    ])
    
    return NextResponse.json({
      paths: PATHS,
      clients,
      modules,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in /api/config:', error)
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    )
  }
}
```

**Créer**: `web/app/api/agents/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { listClients, listAgentsByClient } from '@/lib/utils/paths'
import { getAgentMetadata } from '@/lib/agents/parser'

export async function GET() {
  try {
    const clients = await listClients()
    const allAgents = []
    
    for (const clientId of clients) {
      const agentIds = await listAgentsByClient(clientId)
      
      for (const agentId of agentIds) {
        const metadata = await getAgentMetadata(clientId, agentId)
        if (metadata) {
          allAgents.push(metadata)
        }
      }
    }
    
    return NextResponse.json({ agents: allAgents })
  } catch (error) {
    console.error('Error in /api/agents:', error)
    return NextResponse.json(
      { error: 'Failed to load agents' },
      { status: 500 }
    )
  }
}
```

✅ **Validation**: 
```bash
cd web
pnpm dev
# Tester: curl http://localhost:3000/api/config
# Tester: curl http://localhost:3000/api/agents
```

---

## ✅ Checklist de Validation

- [ ] TypeScript strict mode activé
- [ ] Packages Zod et js-yaml installés
- [ ] Fichier `paths.ts` créé et testé
- [ ] Utilitaires YAML `reader.ts` et `writer.ts` créés
- [ ] Schémas Zod de base dans `types/` créés
- [ ] Parser agent de base fonctionnel
- [ ] API Routes `/api/config` et `/api/agents` répondent
- [ ] Lecture de `new_project/example_agent/` réussie
- [ ] Pas d'erreur TypeScript avec `pnpm type-check:tsgo`

---

## 📚 Ressources

- [Zod Documentation](https://zod.dev/)
- [js-yaml Documentation](https://github.com/nodeca/js-yaml)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## ➡️ Prochaine Étape

[ÉTAPE 2: Backend API Core](./STEP_2_BACKEND_API.md)
