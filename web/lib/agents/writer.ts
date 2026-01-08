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
  config: AgentConfig,
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
  modulesInputs: Record<string, unknown>,
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
  },
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
  subAgents: Record<string, SubAgentConfig>,
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
  version?: string,
): Promise<void> {
  if (version) {
    const agentPath = getAgentPath(clientId, agentId, version)
    await fs.rm(agentPath, { recursive: true, force: true })
  }
  else {
    const agentPath = path.join(getAgentPath(clientId, agentId, 'latest'), '..')
    await fs.rm(agentPath, { recursive: true, force: true })
  }
}
