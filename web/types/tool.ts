import { z } from 'zod'

/**
 * Input/Output d'un tool
 */
export const ToolParameterSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string(),
  required: z.boolean().default(false),
  default: z.unknown().optional(),
})

export type ToolParameter = z.infer<typeof ToolParameterSchema>

/**
 * Métadonnées d'un tool (depuis module)
 */
export const ToolMetadataSchema = z.object({
  name: z.string(),
  path: z.string(),
  description: z.string(),
  module: z.string(),
  inputs: z.array(ToolParameterSchema),
  outputs: z.array(ToolParameterSchema),
  hooks: z.array(z.string()), // Noms des hooks disponibles
})

export type ToolMetadata = z.infer<typeof ToolMetadataSchema>
