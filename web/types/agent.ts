// Types for Agent V6 configuration

export interface AgentConfig {
  version: string
  language: string
  alternative_languages?: string[]
  timezone: string
  modules?: string[]
  messages: Record<string, Message>
  models: {
    llm: ModelConfig
    stt: ModelConfig
    tts: ModelConfig
  }
  triggers?: {
    start_discussion?: Hook[]
    end_discussion?: Hook[]
  }
}

export interface Message {
  texts?: Record<string, string>
  text?: string
  audio?: string
}

export interface ModelConfig {
  provider: string
  model?: string
  temperature?: number
  timeout?: number
  voice_id?: string
  model_id?: string
}

export type Hook = 
  | { action: 'tool'; target_tool: { module: string; path: string } }
  | { action: 'switch_sub_agent'; target_sub_agent: string }
  | { action: 'case'; cases: Case[]; default?: Hook }

export interface Case {
  memory_variable: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than'
  value: string | number | boolean
  action: Hook
}

export interface SubAgentConfig {
  sub_agent: {
    name: string
    description: string
    prompts?: SubAgentPrompt[]
    tools?: Record<string, SubAgentTool>
    hooks?: Record<string, Hook>
  }
}

export interface SubAgentPrompt {
  module: string
  path: string
}

export interface SubAgentTool {
  name: string
  module: string
  path: string
  hooks?: Record<string, Hook>
}

export interface Glossary {
  definitions?: Record<string, unknown>
  pronunciations?: Record<string, string>
  transcriptions?: Record<string, string>
}

export interface AgentData {
  config: AgentConfig
  modulesInputs: Record<string, unknown>
  subAgents: Record<string, SubAgentConfig>
  glossary: Glossary
}

export interface AgentVersion {
  id: string
  version: string
  created_at: string
  created_by?: string
  name?: string
  description?: string
}
