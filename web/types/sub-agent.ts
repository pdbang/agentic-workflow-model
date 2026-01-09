import { z } from 'zod'
import { HookActionSchema } from './hook'

/**
 * Tool dans un sub-agent
 */
export const SubAgentToolSchema = z.object({
  name: z.string(),
  module: z.string(),
  path: z.string(),
  hooks: z.record(HookActionSchema).optional(),
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

/**
 * Configuration d'un sub-agent
 */
export const SubAgentConfigSchema = z.object({
  sub_agent: z.object({
    name: z.string(),
    description: z.string().optional(),
    prompts: z.array(SubAgentPromptSchema).optional(),
    tools: z.record(SubAgentToolSchema).optional(),
  }),
})

export type SubAgentConfig = z.infer<typeof SubAgentConfigSchema>
