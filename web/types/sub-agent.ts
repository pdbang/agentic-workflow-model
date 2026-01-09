import { z } from 'zod'

/**
 * Configuration d'un sub-agent
 */
export const SubAgentConfigSchema = z.object({
  sub_agent: z.object({
    name: z.string(),
    description: z.string().optional(),
    prompts: z.array(z.string()).optional(),
    tools: z.record(z.unknown()).optional(),
    hooks: z.record(z.unknown()).optional(),
  }),
})

export type SubAgentConfig = z.infer<typeof SubAgentConfigSchema>

/**
 * Tool dans un sub-agent
 */
export const SubAgentToolSchema = z.object({
  name: z.string(),
  module: z.string(),
  path: z.string(),
  hooks: z.record(z.unknown()).optional(),
})

export type SubAgentTool = z.infer<typeof SubAgentToolSchema>

/**
 * Prompt dans un sub-agent
 */
export const SubAgentPromptSchema = z.object({
  module: z.string(),
  path: z.string(),
})

export type SubAgentPrompt = z.infer<typeof SubAgentPromptSchema>
