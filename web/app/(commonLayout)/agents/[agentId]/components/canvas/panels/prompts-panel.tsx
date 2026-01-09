'use client'

import type { SubAgentPrompt } from '@/types/agent'
import Button from '@/app/components/base/button'
import { RiAddLine, RiDeleteBinLine } from '@remixicon/react'

interface PromptsPanelProps {
  prompts: SubAgentPrompt[]
  modules: string[]
  onChange: (prompts: SubAgentPrompt[]) => void
}

export function PromptsPanel({ prompts, modules, onChange }: PromptsPanelProps) {
  // TODO: Implémenter la sélection de prompts depuis les modules (ÉTAPE 6)
  // Pour l'instant, affichage simple

  const handleRemovePrompt = (index: number) => {
    onChange(prompts.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 mb-4">
        <p>Prompts configuration will be fully implemented in Step 6.</p>
        <p className="mt-2">Currently configured: {prompts.length} prompts</p>
      </div>

      {prompts.map((prompt, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-medium text-gray-900">{prompt.module}</div>
              <div className="text-xs text-gray-500">{prompt.path}</div>
            </div>
            <Button
              variant="danger"
              size="small"
              onClick={() => handleRemovePrompt(index)}
            >
              <RiDeleteBinLine className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      <Button
        variant="secondary"
        onClick={() => {
          // TODO: Open prompt selector modal
          alert('Prompt selector will be implemented in Step 6')
        }}
        className="w-full flex items-center justify-center gap-2"
      >
        <RiAddLine className="h-4 w-4" />
        Add Prompt
      </Button>
    </div>
  )
}
