import { z } from 'zod'

/**
 * Action d'un hook
 */
export type HookAction = {
  action: 'tool'
  target_tool: {
    name: string
    module: string
    path: string
  }
} | {
  action: 'switch_sub_agent'
  target_sub_agent: string
} | {
  action: 'case'
  cases: Array<{
    condition: string
    then: HookAction
  }>
  default?: HookAction
}

export const HookActionSchema: z.ZodType<HookAction> = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('tool'),
    target_tool: z.object({
      name: z.string(),
      module: z.string(),
      path: z.string(),
    }),
  }),
  z.object({
    action: z.literal('switch_sub_agent'),
    target_sub_agent: z.string(),
  }),
  z.object({
    action: z.literal('case'),
    cases: z.array(z.object({
      condition: z.string(),
      then: z.lazy(() => HookActionSchema),
    })),
    default: z.lazy(() => HookActionSchema).optional(),
  }),
])

/**
 * Configuration d'un hook
 */
export const HookConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  action: HookActionSchema,
})

export type HookConfig = z.infer<typeof HookConfigSchema>

/**
 * Configuration d'un tool dans un sub-agent
 */
export const SubAgentToolSchema = z.object({
  name: z.string(),
  module: z.string(),
  path: z.string(),
  description: z.string().optional(),
  hooks: z.record(z.string(), HookActionSchema).optional(),
})

export type SubAgentTool = z.infer<typeof SubAgentToolSchema>

/**
 * Configuration d'un prompt
 */
export const SubAgentPromptSchema = z.object({
  module: z.string(),
  path: z.string(),
  params: z.record(z.string(), z.unknown()).optional(),
})

export type SubAgentPrompt = z.infer<typeof SubAgentPromptSchema>

/**
 * Configuration d'un sub-agent
 */
export const SubAgentConfigSchema = z.object({
  sub_agent: z.object({
    name: z.string(),
    description: z.string(),
    prompts: z.array(SubAgentPromptSchema).optional(),
    tools: z.record(z.string(), SubAgentToolSchema).optional(),
  }),
})

export type SubAgentConfig = z.infer<typeof SubAgentConfigSchema>
