import fs from 'node:fs/promises'
import path from 'node:path'

export const PATHS = {
  ROOT: path.resolve(process.cwd(), '..'),
  AGENTS_BASE: path.resolve(process.cwd(), '..', 'agents', 'configurations', 'v6'),
  MODULES_BASE: path.resolve(process.cwd(), '..', 'agents', 'modules_configurations'),
} as const

export function getAgentPath(clientId: string, agentId: string, version: string = 'latest'): string {
  return path.join(PATHS.AGENTS_BASE, clientId, agentId, version)
}

export function getModulePath(moduleId: string): string {
  return path.join(PATHS.MODULES_BASE, moduleId)
}

export async function listClients(): Promise<string[]> {
  try {
    const entries = await fs.readdir(PATHS.AGENTS_BASE, { withFileTypes: true })
    return entries.filter(entry => entry.isDirectory()).map(entry => entry.name)
  }
  catch {
    return []
  }
}

export async function listAgentsByClient(clientId: string): Promise<string[]> {
  try {
    const clientPath = path.join(PATHS.AGENTS_BASE, clientId)
    const entries = await fs.readdir(clientPath, { withFileTypes: true })
    return entries.filter(entry => entry.isDirectory()).map(entry => entry.name)
  }
  catch {
    return []
  }
}

export async function listAgentVersions(clientId: string, agentId: string): Promise<string[]> {
  try {
    const agentPath = path.join(PATHS.AGENTS_BASE, clientId, agentId)
    const entries = await fs.readdir(agentPath, { withFileTypes: true })
    return entries.filter(entry => entry.isDirectory()).map(entry => entry.name).sort((a, b) => b.localeCompare(a))
  }
  catch {
    return []
  }
}

export async function listModules(): Promise<string[]> {
  try {
    const entries = await fs.readdir(PATHS.MODULES_BASE, { withFileTypes: true })
    return entries.filter(entry => entry.isDirectory()).map(entry => entry.name)
  }
  catch {
    return []
  }
}

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  }
  catch {
    return false
  }
}
