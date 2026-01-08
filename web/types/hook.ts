import { z } from 'zod'

/**
 * Définition d'un hook disponible sur un tool
 */
export const HookDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  defaultAction: z.enum(['tool', 'switch_sub_agent', 'case']),
})

export type HookDefinition = z.infer<typeof HookDefinitionSchema>
