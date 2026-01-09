import fs from 'fs/promises'
import path from 'path'
import { getAgentPath, listAgentVersions } from '@/lib/utils/paths'
import { parseAgentConfig, parseModulesInputs, parseGlossary, parseSubAgents } from './parser'
import { writeAgentConfig, writeModulesInputs, writeGlossary, writeSubAgents } from './writer'
import type { AgentMetadata } from '@/types/agent'

/**
 * Crée une nouvelle version d'un agent à partir d'une version source
 */
export async function createAgentVersion(
  clientId: string,
  agentId: string,
  sourceVersion: string = 'latest'
): Promise<string> {
  const versions = await listAgentVersions(clientId, agentId)
  const timestamp = Date.now()
  const newVersion = `v${timestamp}`
  
  // Charger les données de la version source
  const [config, modulesInputs, glossary, subAgents] = await Promise.all([
    parseAgentConfig(clientId, agentId, sourceVersion),
    parseModulesInputs(clientId, agentId, sourceVersion),
    parseGlossary(clientId, agentId, sourceVersion),
    parseSubAgents(clientId, agentId, sourceVersion),
  ])
  
  if (!config) {
    throw new Error('Source version not found')
  }
  
  // Écrire la nouvelle version
  await Promise.all([
    writeAgentConfig(clientId, agentId, newVersion, config),
    writeModulesInputs(clientId, agentId, newVersion, modulesInputs),
    writeGlossary(clientId, agentId, newVersion, glossary),
    writeSubAgents(clientId, agentId, newVersion, subAgents),
  ])
  
  return newVersion
}

/**
 * Récupère les détails de toutes les versions d'un agent
 */
export async function getAgentVersionsDetails(
  clientId: string,
  agentId: string
): Promise<AgentMetadata[]> {
  const versions = await listAgentVersions(clientId, agentId)
  
  const details = await Promise.all(
    versions.map(version => 
      import('./parser').then(m => m.getAgentMetadata(clientId, agentId, version))
    )
  )
  
  return details.filter((d): d is AgentMetadata => d !== null)
}

/**
 * Duplique un agent vers un nouvel agent
 */
export async function duplicateAgent(
  sourceClientId: string,
  sourceAgentId: string,
  targetClientId: string,
  targetAgentId: string,
  sourceVersion: string = 'latest'
): Promise<void> {
  // Charger les données de l'agent source
  const [config, modulesInputs, glossary, subAgents] = await Promise.all([
    parseAgentConfig(sourceClientId, sourceAgentId, sourceVersion),
    parseModulesInputs(sourceClientId, sourceAgentId, sourceVersion),
    parseGlossary(sourceClientId, sourceAgentId, sourceVersion),
    parseSubAgents(sourceClientId, sourceAgentId, sourceVersion),
  ])
  
  if (!config) {
    throw new Error('Source agent not found')
  }
  
  // Écrire dans le nouvel agent (version latest)
  await Promise.all([
    writeAgentConfig(targetClientId, targetAgentId, 'latest', config),
    writeModulesInputs(targetClientId, targetAgentId, 'latest', modulesInputs),
    writeGlossary(targetClientId, targetAgentId, 'latest', glossary),
    writeSubAgents(targetClientId, targetAgentId, 'latest', subAgents),
  ])
}
