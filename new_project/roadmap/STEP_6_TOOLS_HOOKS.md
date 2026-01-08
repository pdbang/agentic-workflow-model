# ÉTAPE 6: Frontend - Tools & Hooks Configuration

**Durée estimée**: 3-4 jours  
**Prérequis**: ÉTAPE 5 complétée

---

## 🎯 Objectifs

Finaliser la configuration des tools et hooks :
1. Sélection et ajout de tools depuis les modules
2. Configuration des hooks pour chaque tool
3. Actions de hooks : tool, switch_sub_agent, case
4. Interface pour les conditions (case)
5. Compléter les panels Tools et Prompts
6. Finaliser les triggers (start/end discussion)

---

## 🔨 Tâches Principales

### 6.1 Compléter Tools Panel

**Modifier**: `web/app/agent/[agentId]/components/canvas/panels/tools-panel.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import type { SubAgentTool } from '@/types/sub-agent'
import type { ToolMetadata } from '@/types/tool'
import { Button } from '@/components/ui/button'
import { ToolSelector } from './tool-selector'
import { HookConfigurator } from './hook-configurator'

interface ToolsPanelProps {
  tools: Record<string, SubAgentTool>
  modules: string[]
  onChange: (tools: Record<string, SubAgentTool>) => void
}

export function ToolsPanel({ tools, modules, onChange }: ToolsPanelProps) {
  const [availableTools, setAvailableTools] = useState<ToolMetadata[]>([])
  const [showSelector, setShowSelector] = useState(false)
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  // Charger les tools disponibles depuis les modules
  useEffect(() => {
    Promise.all(
      modules.map(moduleId =>
        fetch(`/api/modules/${moduleId}`)
          .then(res => res.json())
          .then(data => data.tools || [])
      )
    ).then(results => {
      const allTools = results.flat()
      setAvailableTools(allTools)
    })
  }, [modules])

  const handleAddTool = (tool: ToolMetadata) => {
    const toolKey = `${tool.module}_${tool.name.toLowerCase().replace(/\s+/g, '_')}`
    onChange({
      ...tools,
      [toolKey]: {
        name: tool.name,
        module: tool.module,
        path: tool.path,
        description: tool.description,
      },
    })
    setShowSelector(false)
  }

  const handleRemoveTool = (toolKey: string) => {
    const { [toolKey]: _, ...rest } = tools
    onChange(rest)
    if (selectedTool === toolKey) {
      setSelectedTool(null)
    }
  }

  const handleUpdateTool = (toolKey: string, updates: Partial<SubAgentTool>) => {
    onChange({
      ...tools,
      [toolKey]: { ...tools[toolKey], ...updates },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Tools</h4>
        <Button size="sm" onClick={() => setShowSelector(true)}>
          + Add Tool
        </Button>
      </div>

      {Object.keys(tools).length === 0 ? (
        <p className="text-sm text-gray-500">No tools configured</p>
      ) : (
        <div className="space-y-2">
          {Object.entries(tools).map(([key, tool]) => (
            <div
              key={key}
              className={`
                border rounded-lg p-3 cursor-pointer transition-colors
                ${selectedTool === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => setSelectedTool(key)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{tool.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {tool.module} / {tool.path}
                  </div>
                  {tool.hooks && Object.keys(tool.hooks).length > 0 && (
                    <div className="text-xs text-blue-600 mt-1">
                      {Object.keys(tool.hooks).length} hook(s) configured
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveTool(key)
                  }}
                  className="text-gray-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTool && tools[selectedTool] && (
        <HookConfigurator
          tool={tools[selectedTool]}
          onUpdate={(updates) => handleUpdateTool(selectedTool, updates)}
        />
      )}

      {showSelector && (
        <ToolSelector
          availableTools={availableTools}
          onSelect={handleAddTool}
          onClose={() => setShowSelector(false)}
        />
      )}
    </div>
  )
}
```

### 6.2 Tool Selector

**Créer**: `web/app/agent/[agentId]/components/canvas/panels/tool-selector.tsx`

```typescript
'use client'

import { useState } from 'react'
import type { ToolMetadata } from '@/types/tool'
import { Button } from '@/components/ui/button'

interface ToolSelectorProps {
  availableTools: ToolMetadata[]
  onSelect: (tool: ToolMetadata) => void
  onClose: () => void
}

export function ToolSelector({ availableTools, onSelect, onClose }: ToolSelectorProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ToolMetadata | null>(null)

  const filteredTools = availableTools.filter(tool =>
    tool.name.toLowerCase().includes(search.toLowerCase()) ||
    tool.module.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Tool</h3>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..."
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredTools.map((tool, index) => (
              <div
                key={`${tool.module}-${tool.name}-${index}`}
                onClick={() => setSelected(tool)}
                className={`
                  p-3 border rounded-lg cursor-pointer transition-colors
                  ${selected === tool
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="font-medium text-gray-900">{tool.name}</div>
                <div className="text-xs text-gray-500 mt-1">{tool.description}</div>
                <div className="text-xs text-gray-400 mt-1">
                  Module: {tool.module} | {tool.hooks.length} hooks available
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => selected && onSelect(selected)}
            disabled={!selected}
          >
            Add Tool
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 6.3 Hook Configurator

**Créer**: `web/app/agent/[agentId]/components/canvas/panels/hook-configurator.tsx`

```typescript
'use client'

import { useState } from 'react'
import type { SubAgentTool } from '@/types/sub-agent'
import type { HookAction } from '@/types/sub-agent'
import { Button } from '@/components/ui/button'

interface HookConfiguratorProps {
  tool: SubAgentTool
  onUpdate: (updates: Partial<SubAgentTool>) => void
}

export function HookConfigurator({ tool, onUpdate }: HookConfiguratorProps) {
  const [selectedHook, setSelectedHook] = useState<string | null>(null)

  // TODO: Charger les hooks disponibles depuis le tool metadata
  const availableHooks = ['on_success', 'on_failure', 'on_transfer_failed']

  const handleAddHook = (hookName: string) => {
    const defaultAction: HookAction = {
      action: 'tool',
      target_tool: {
        name: '',
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
      <h4 className="font-medium text-gray-900 mb-3">Hooks</h4>

      {/* Liste des hooks configurés */}
      {tool.hooks && Object.keys(tool.hooks).length > 0 && (
        <div className="space-y-2 mb-3">
          {Object.entries(tool.hooks).map(([hookName, action]) => (
            <div
              key={hookName}
              className="border border-gray-200 rounded p-2 text-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{hookName}</span>
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

      {/* TODO: Éditeur détaillé pour le hook sélectionné */}
      {selectedHook && tool.hooks?.[selectedHook] && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">
            Detailed hook configuration will be implemented here.
          </p>
        </div>
      )}
    </div>
  )
}
```

### 6.4 Compléter Prompts Panel

**Modifier**: `web/app/agent/[agentId]/components/canvas/panels/prompts-panel.tsx`

```typescript
'use client'

import { useState } from 'react'
import type { SubAgentPrompt } from '@/types/sub-agent'
import { Button } from '@/components/ui/button'

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
        <Button size="sm" onClick={() => setShowForm(true)}>
          + Add Prompt
        </Button>
      </div>

      {prompts.length === 0 ? (
        <p className="text-sm text-gray-500">No prompts configured</p>
      ) : (
        <div className="space-y-2">
          {prompts.map((prompt, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {prompt.path}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
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
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <Button onClick={handleAdd} size="sm">Add</Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowForm(false)
                setNewPrompt({ module: '', path: '' })
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 6.5 Finaliser Triggers Form

**Modifier**: `web/app/agent/[agentId]/components/config/triggers-form.tsx`

```typescript
'use client'

interface TriggersFormProps {
  triggers?: {
    start_discussion?: unknown[]
    end_discussion?: unknown[]
  }
  onChange: (triggers: TriggersFormProps['triggers']) => void
}

export function TriggersForm({ triggers, onChange }: TriggersFormProps) {
  // Simplification: édition JSON pour les triggers
  const [startJson, setStartJson] = useState(
    JSON.stringify(triggers?.start_discussion || [], null, 2)
  )
  const [endJson, setEndJson] = useState(
    JSON.stringify(triggers?.end_discussion || [], null, 2)
  )

  const handleSave = (type: 'start' | 'end', json: string) => {
    try {
      const parsed = JSON.parse(json)
      onChange({
        ...triggers,
        [`${type}_discussion`]: parsed,
      })
    } catch (error) {
      alert('Invalid JSON')
    }
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Triggers</h2>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">Start Discussion</h3>
            <Button size="sm" onClick={() => handleSave('start', startJson)}>
              Save
            </Button>
          </div>
          <textarea
            value={startJson}
            onChange={(e) => setStartJson(e.target.value)}
            rows={8}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
            placeholder='[{"action": "tool", "target_tool": {...}}]'
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">End Discussion</h3>
            <Button size="sm" onClick={() => handleSave('end', endJson)}>
              Save
            </Button>
          </div>
          <textarea
            value={endJson}
            onChange={(e) => setEndJson(e.target.value)}
            rows={8}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
            placeholder='[{"action": "tool", "target_tool": {...}}]'
          />
        </div>
      </div>
    </section>
  )
}
```

---

## ✅ Checklist de Validation

- [ ] Tools Panel affiche liste outils
- [ ] Ajout d'un tool depuis modal
- [ ] Suppression d'un tool
- [ ] Hook configurator affiche hooks disponibles
- [ ] Ajout d'un hook sur un tool
- [ ] Configuration basique des hooks
- [ ] Prompts Panel permet d'ajouter/supprimer
- [ ] Triggers Form permet d'éditer (JSON)
- [ ] Tous les composants compilent
- [ ] Pas d'erreur console

---

## ➡️ Prochaine Étape

[ÉTAPE 7: Export/Import & Versioning](./STEP_7_EXPORT_VERSION.md)
