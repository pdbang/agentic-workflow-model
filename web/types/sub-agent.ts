import { z } from 'zod'

/**
 * Tool action
 */
const ToolActionSchema = z.object({
  action: z.literal('tool'),
  target_tool: z.object({
    name: z.string(),
    module: z.string(),
    path: z.string(),
  }),
})

/**
 * Switch sub-agent action
 */
const SwitchSubAgentActionSchema = z.object({
  action: z.literal('switch_sub_agent'),
  target_sub_agent: z.string(),
})

/**
 * Case condition
 */
const CaseConditionSchema = z.object({
  memory_variable: z.string().optional(),
  input_variable: z.string().optional(),
  info_variable: z.string().optional(),
  operator: z.string(),
  value: z.unknown(),
})

/**
 * Simplified hook action schema (non-recursive)
 */
export const HookActionSchema = z.union([
  ToolActionSchema,
  SwitchSubAgentActionSchema,
  z.object({
    action: z.literal('case'),
    cases: z.array(z.object({
      memory_variable: z.string().optional(),
      input_variable: z.string().optional(),
      info_variable: z.string().optional(),
      operator: z.string(),
      value: z.unknown(),
      // For simplicity, use unknown for nested action
      action: z.unknown(),
    })),
    default: z.unknown().optional(),
  }),
])

export type HookAction = z.infer<typeof HookActionSchema>

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
