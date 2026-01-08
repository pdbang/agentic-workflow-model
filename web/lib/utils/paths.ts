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
  }
  catch {
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
  }
  catch {
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
  }
  catch {
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
  }
  catch {
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
  }
  catch {
    return false
  }
}
