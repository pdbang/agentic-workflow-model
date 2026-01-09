import { z } from 'zod'

/**
 * Action d'un hook
 */
export const HookActionSchema: z.ZodType<HookAction> = z.lazy(() =>
  z.discriminatedUnion('action', [
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
        memory_variable: z.string().optional(),
        input_variable: z.string().optional(),
        info_variable: z.string().optional(),
        operator: z.enum(['equals', 'not_equals', 'in', 'contains', 'exists', 'gt', 'lt']),
        value: z.unknown(),
        action: z.literal('tool').or(z.literal('switch_sub_agent')),
        target_tool: z.object({
          name: z.string(),
          module: z.string(),
          path: z.string(),
        }).optional(),
        target_sub_agent: z.string().optional(),
      })),
      default: z.union([
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
      ]).optional(),
    }),
  ]),
)

export type HookAction =
  | {
    action: 'tool'
    target_tool: {
      name: string
      module: string
      path: string
    }
  }
  | {
    action: 'switch_sub_agent'
    target_sub_agent: string
  }
  | {
    action: 'case'
    cases: Array<{
      memory_variable?: string
      input_variable?: string
      info_variable?: string
      operator: 'equals' | 'not_equals' | 'in' | 'contains' | 'exists' | 'gt' | 'lt'
      value: unknown
      action: 'tool' | 'switch_sub_agent'
      target_tool?: {
        name: string
        module: string
        path: string
      }
      target_sub_agent?: string
    }>
    default?: {
      action: 'tool'
      target_tool: {
        name: string
        module: string
        path: string
      }
    } | {
      action: 'switch_sub_agent'
      target_sub_agent: string
    }
  }

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
    tools: z.array(SubAgentToolSchema).optional(),
  }),
})

export type SubAgentConfig = z.infer<typeof SubAgentConfigSchema>
