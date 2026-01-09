'use client'

import { useState } from 'react'
import type { SubAgentPrompt } from '@/types/sub-agent'

interface PromptsPanelProps {
  prompts: SubAgentPrompt[]
  modules: string[]
  onChange: (prompts: SubAgentPrompt[]) => void
}

export function PromptsPanel({ prompts, modules, onChange }: PromptsPanelProps) {
  const [showForm, setShowForm] = useState(false)
  const [newPrompt, setNewPrompt] = useState<SubAgentPrompt>({
    module: '',
    path: '',
  })

  const handleAdd = () => {
    if (newPrompt.module && newPrompt.path) {
      onChange([...prompts, newPrompt])
      setNewPrompt({ module: '', path: '' })
      setShowForm(false)
    }
  }

  const handleRemove = (index: number) => {
    onChange(prompts.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Prompts</h4>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
        >
          + Add Prompt
        </button>
      </div>

      {prompts.length === 0 ? (
        <p className="text-sm text-gray-500">No prompts configured</p>
      ) : (
        <div className="space-y-2">
          {prompts.map((prompt, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {prompt.path}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Module: {prompt.module}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(index)}
                  className="text-gray-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="space-y-3 rounded-lg border border-gray-200 p-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Module
            </label>
            <select
              value={newPrompt.module}
              onChange={(e) => setNewPrompt({ ...newPrompt, module: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select module...</option>
              {modules.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Path
            </label>
            <input
              type="text"
              value={newPrompt.path}
              onChange={(e) => setNewPrompt({ ...newPrompt, path: e.target.value })}
              placeholder="category/name"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowForm(false)
                setNewPrompt({ module: '', path: '' })
              }}
              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
