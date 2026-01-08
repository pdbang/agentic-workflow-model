import type { SubAgentConfig } from '@/types/sub-agent'
import fs from 'node:fs/promises'
import path from 'node:path'
import { getAgentPath, listAgentVersions } from '@/lib/utils/paths'
import { parseAgentConfig, parseGlossary, parseModulesInputs, parseSubAgents } from './parser'
import { writeAgentConfig, writeGlossary, writeModulesInputs, writeSubAgents } from './writer'

export async function createAgentVersion(clientId: string, agentId: string, sourceVersion: string = 'latest'): Promise<string> {
  const newVersion = new Date().toISOString().replace(/[:.]/g, '-')
  const sourcePath = getAgentPath(clientId, agentId, sourceVersion)
  const targetPath = getAgentPath(clientId, agentId, newVersion)
  await copyDirectory(sourcePath, targetPath)
  return newVersion
}

export async function getAgentVersionsDetails(clientId: string, agentId: string): Promise<Array<{ version: string, createdAt: string, isLatest: boolean }>> {
  const versions = await listAgentVersions(clientId, agentId)
  return versions.map((version, index) => ({
    version,
    createdAt: parseVersionTimestamp(version),
    isLatest: index === 0 || version === 'latest',
  }))
}

export async function duplicateAgent(sourceClientId: string, sourceAgentId: string, targetClientId: string, targetAgentId: string, sourceVersion: string = 'latest'): Promise<void> {
  const [config, modulesInputs, subAgents, glossary] = await Promise.all([
    parseAgentConfig(sourceClientId, sourceAgentId, sourceVersion),
    parseModulesInputs(sourceClientId, sourceAgentId, sourceVersion),
    parseSubAgents(sourceClientId, sourceAgentId, sourceVersion),
    parseGlossary(sourceClientId, sourceAgentId, sourceVersion),
  ])
  if (!config) {
    throw new Error('Source agent not found')
  }
  const targetVersion = 'latest'
  await Promise.all([
    writeAgentConfig(targetClientId, targetAgentId, targetVersion, config),
    writeModulesInputs(targetClientId, targetAgentId, targetVersion, modulesInputs),
    writeSubAgents(targetClientId, targetAgentId, targetVersion, subAgents as Record<string, SubAgentConfig>),
    writeGlossary(targetClientId, targetAgentId, targetVersion, glossary),
  ])
}

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

function parseVersionTimestamp(version: string): string {
  if (version === 'latest') {
    return new Date().toISOString()
  }
  const timestamp = version.replace(/-/g, (match, offset) => {
    if (offset < 10)
      return match
    if (offset === 10)
      return 'T'
    if (offset < 19)
      return ':'
    return '.'
  })
  return timestamp
}
