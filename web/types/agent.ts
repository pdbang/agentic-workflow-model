import { z } from 'zod'

/**
 * Message multilingue
 */
export const MessageSchema = z.object({
  texts: z.record(z.string(), z.string()).optional(),
  text: z.string().optional(),
  audio: z.string().optional(),
})

export type Message = z.infer<typeof MessageSchema>

/**
 * Configuration des modèles (LLM, STT, TTS)
 */
export const ModelConfigSchema = z.object({
  provider: z.string(),
  model: z.string(),
  temperature: z.number().optional(),
  timeout: z.number().optional(),
  voice_id: z.string().optional(),
  model_id: z.string().optional(),
})

export type ModelConfig = z.infer<typeof ModelConfigSchema>

/**
 * Trigger action
 */
export const TriggerActionSchema = z.object({
  module: z.string(),
  tool: z.string(),
})

export type TriggerAction = z.infer<typeof TriggerActionSchema>

/**
 * Configuration agent principale
 */
export const AgentConfigSchema = z.object({
  version: z.literal('v6'),
  language: z.string(),
  alternative_languages: z.array(z.string()).optional(),
  timezone: z.string(),
  messages: z.record(z.string(), MessageSchema),
  models: z.object({
    llm: ModelConfigSchema,
    stt: ModelConfigSchema,
    tts: ModelConfigSchema,
  }),
  triggers: z.object({
    start_discussion: z.array(TriggerActionSchema).optional(),
    end_discussion: z.array(TriggerActionSchema).optional(),
  }).optional(),
})

export type AgentConfig = z.infer<typeof AgentConfigSchema>

/**
 * Métadonnées agent (pour liste)
 */
export const AgentMetadataSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  version: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type AgentMetadata = z.infer<typeof AgentMetadataSchema>
