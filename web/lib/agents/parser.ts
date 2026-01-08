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
