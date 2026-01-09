import path from 'path'
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
  
  const files: Record<string, unknown> = {}
  if (glossary.definitions !== undefined) {
    files.definitions = glossary.definitions
  }
  if (glossary.pronunciations !== undefined) {
    files.pronunciations = glossary.pronunciations
  }
  if (glossary.transcriptions !== undefined) {
    files.transcriptions = glossary.transcriptions
  }
  
  await writeYamlDirectory(glossaryPath, files)
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
  
  const files: Record<string, unknown> = {}
  for (const [key, config] of Object.entries(subAgents)) {
    files[key] = config
  }
  
  await writeYamlDirectory(subAgentsPath, files)
}
