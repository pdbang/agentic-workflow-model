import { z } from 'zod'

/**
 * Métadonnées d'un tool
 */
export const ToolMetadataSchema = z.object({
  name: z.string(),
  module: z.string(),
  path: z.string(),
  description: z.string().optional(),
  hooks: z.array(z.string()).optional(),
})

export type ToolMetadata = z.infer<typeof ToolMetadataSchema>
