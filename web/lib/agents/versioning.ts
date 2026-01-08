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
  sourceVersion: string = 'latest',
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
  agentId: string,
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
  sourceVersion: string = 'latest',
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
    }
    else {
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
    if (offset < 10)
      return match // Garde les 2 premiers tirets (date)
    if (offset === 10)
      return 'T' // Remplace par T
    if (offset < 19)
      return ':' // Remplace par :
    return '.' // Remplace par .
  })

  return timestamp
}
