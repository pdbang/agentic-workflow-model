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
