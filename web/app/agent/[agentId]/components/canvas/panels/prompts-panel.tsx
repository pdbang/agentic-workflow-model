'use client'

import type { SubAgentPrompt } from '@/types/sub-agent'

interface PromptsPanelProps {
  prompts: string[]
  modules: string[]
  onChange: (prompts: string[]) => void
}

export function PromptsPanel({ prompts, modules, onChange }: PromptsPanelProps) {
  // TODO: Implémenter dans ÉTAPE 6
  return (
    <div className="text-sm text-gray-500">
      <p>Prompts configuration will be implemented in Step 6.</p>
      <p className="mt-2">Currently configured: {prompts.length} prompts</p>
    </div>
  )
}
