'use client'

import { useState } from 'react'
import type { SubAgentTool } from '@/types/sub-agent'
import type { HookAction, HookToolAction, HookSwitchSubAgentAction, HookCaseAction } from '@/types/hook'
import { HookActionEditor } from './hook-action-editor'

interface HookConfiguratorProps {
  tool: SubAgentTool
  onUpdate: (updates: Partial<SubAgentTool>) => void
  availableSubAgents: string[]
}

export function HookConfigurator({ tool, onUpdate, availableSubAgents }: HookConfiguratorProps) {
  const [selectedHook, setSelectedHook] = useState<string | null>(null)

  // Hooks disponibles (devrait venir du metadata du tool)
  const availableHooks = ['on_success', 'on_failure', 'on_transfer_failed', 'on_error']

  const handleAddHook = (hookName: string) => {
    const defaultAction: HookToolAction = {
      action: 'tool',
      target_tool: {
        module: '',
        path: '',
      },
    }

    onUpdate({
      hooks: {
        ...tool.hooks,
        [hookName]: defaultAction,
      },
    })
    setSelectedHook(hookName)
  }

  const handleUpdateHook = (hookName: string, action: HookAction) => {
    onUpdate({
      hooks: {
        ...tool.hooks,
        [hookName]: action,
      },
    })
  }

  const handleRemoveHook = (hookName: string) => {
    const { [hookName]: _, ...rest } = tool.hooks || {}
    onUpdate({ hooks: rest })
    if (selectedHook === hookName) {
      setSelectedHook(null)
    }
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <h4 className="mb-3 font-medium text-gray-900">Hooks</h4>

      {/* Liste des hooks configurés */}
      {tool.hooks && Object.keys(tool.hooks).length > 0 && (
        <div className="mb-3 space-y-2">
          {Object.entries(tool.hooks).map(([hookName, action]) => (
            <div
              key={hookName}
              className="rounded border border-gray-200 p-2 text-sm"
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className="cursor-pointer font-medium hover:text-blue-600"
                  onClick={() => setSelectedHook(selectedHook === hookName ? null : hookName)}
                >
                  {hookName}
                </span>
                <button
                  onClick={() => handleRemoveHook(hookName)}
                  className="text-gray-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
              <div className="text-xs text-gray-500">
                Action: {action.action}
              </div>
              {selectedHook === hookName && (
                <div className="mt-2">
                  <HookActionEditor
                    action={action}
                    onUpdate={(updatedAction) => handleUpdateHook(hookName, updatedAction)}
                    availableSubAgents={availableSubAgents}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ajouter un hook */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Add Hook
        </label>
        <select
          onChange={(e) => e.target.value && handleAddHook(e.target.value)}
          value=""
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Select a hook...</option>
          {availableHooks
            .filter(h => !tool.hooks || !tool.hooks[h])
            .map(hook => (
              <option key={hook} value={hook}>{hook}</option>
            ))
          }
        </select>
      </div>
    </div>
  )
}
