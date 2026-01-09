import { z } from 'zod'

/**
 * Action de hook : tool
 */
export const HookToolActionSchema = z.object({
  action: z.literal('tool'),
  target_tool: z.object({
    name: z.string().optional(),
    module: z.string(),
    path: z.string(),
  }),
})

/**
 * Action de hook : switch_sub_agent
 */
export const HookSwitchSubAgentActionSchema = z.object({
  action: z.literal('switch_sub_agent'),
  target_sub_agent: z.string(),
})

/**
 * Case dans un hook case
 */
export const HookCaseSchema = z.object({
  memory_variable: z.string(),
  operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']),
  value: z.unknown(),
  action: z.union([
    HookToolActionSchema,
    HookSwitchSubAgentActionSchema,
  ]),
})

/**
 * Action de hook : case (conditions)
 */
export const HookCaseActionSchema = z.object({
  action: z.literal('case'),
  cases: z.array(HookCaseSchema),
  default: z.union([
    HookToolActionSchema,
    HookSwitchSubAgentActionSchema,
  ]).optional(),
})

/**
 * Action de hook (union de tous les types)
 */
export const HookActionSchema = z.union([
  HookToolActionSchema,
  HookSwitchSubAgentActionSchema,
  HookCaseActionSchema,
])

export type HookAction = z.infer<typeof HookActionSchema>
export type HookToolAction = z.infer<typeof HookToolActionSchema>
export type HookSwitchSubAgentAction = z.infer<typeof HookSwitchSubAgentActionSchema>
export type HookCaseAction = z.infer<typeof HookCaseActionSchema>
export type HookCase = z.infer<typeof HookCaseSchema>
