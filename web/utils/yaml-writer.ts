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
  options: WriteYamlOptions = {},
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
  }
  catch (error) {
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
  options: WriteYamlOptions = {},
): Promise<void> {
  try {
    // Créer le dossier si nécessaire
    await fs.mkdir(dirPath, { recursive: true })

    // Écrire chaque fichier
    for (const [filename, data] of Object.entries(files)) {
      const filePath = path.join(dirPath, `${filename}.yml`)
      await writeYamlFile(filePath, data, options)
    }
  }
  catch (error) {
    console.error(`Error writing YAML directory ${dirPath}:`, error)
    throw error
  }
}
