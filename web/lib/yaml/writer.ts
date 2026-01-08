import fs from 'node:fs/promises'
import path from 'node:path'
import yaml from 'js-yaml'

export type WriteYamlOptions = {
  indent?: number
  lineWidth?: number
  noRefs?: boolean
  sortKeys?: boolean
}

export async function writeYamlFile(filePath: string, data: unknown, options: WriteYamlOptions = {}): Promise<void> {
  try {
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })
    const yamlContent = yaml.dump(data, {
      indent: options.indent ?? 2,
      lineWidth: options.lineWidth ?? 100,
      noRefs: options.noRefs ?? true,
      sortKeys: options.sortKeys ?? false,
    })
    await fs.writeFile(filePath, yamlContent, 'utf-8')
  }
  catch (error) {
    console.error(`Error writing YAML file ${filePath}:`, error)
    throw error
  }
}

export async function writeYamlDirectory(dirPath: string, files: Record<string, unknown>, options: WriteYamlOptions = {}): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true })
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
