# ÉTAPE 3: Frontend - Configuration Agent

**Durée estimée**: 3-4 jours  
**Prérequis**: ÉTAPE 2 complétée

---

## 🎯 Objectifs

Créer l'interface de configuration générale d'un agent :
1. Page principale d'édition agent
2. Onglet Configuration (messages, models, triggers)
3. Onglet Glossaire (definitions, pronunciations, transcriptions)
4. Navigation entre onglets
5. Sauvegarde automatique

---

## 📁 Structure Cible

```
web/app/agent/
├── page.tsx                            # Liste des agents
├── new/
│   └── page.tsx                        # Création nouvel agent
└── [agentId]/
    ├── layout.tsx                      # Layout avec navigation
    ├── page.tsx                        # Redirect vers /config
    ├── config/
    │   └── page.tsx                    # Onglet Configuration
    ├── glossary/
    │   └── page.tsx                    # Onglet Glossaire
    ├── modules/
    │   └── page.tsx                    # Onglet Modules (ÉTAPE 4)
    ├── canvas/
    │   └── page.tsx                    # Onglet Canvas (ÉTAPE 5)
    └── components/
        ├── agent-tabs.tsx              # Navigation onglets
        ├── config/
        │   ├── messages-form.tsx
        │   ├── models-form.tsx
        │   └── triggers-form.tsx
        └── glossary/
            ├── definitions-editor.tsx
            ├── pronunciations-editor.tsx
            └── transcriptions-editor.tsx

web/lib/hooks/
└── use-agent.ts                        # Hook pour charger/sauver agent

web/components/agent/
└── agent-header.tsx                    # Header avec actions (save, export, etc.)
```

---

## 🔨 Tâches Détaillées

### 3.1 Hook de Gestion d'Agent

**Créer**: `web/lib/hooks/use-agent.ts`

```typescript
import { useState, useEffect, useCallback } from 'react'
import type { AgentConfig } from '@/types/agent'
import type { SubAgentConfig } from '@/types/sub-agent'

interface AgentData {
  config: AgentConfig
  modulesInputs: Record<string, unknown>
  subAgents: Record<string, SubAgentConfig>
  glossary: {
    definitions?: unknown
    pronunciations?: unknown
    transcriptions?: unknown
  }
}

export function useAgent(clientId: string, agentId: string, version: string = 'latest') {
  const [data, setData] = useState<AgentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Charger l'agent
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/agents/${agentId}?clientId=${clientId}&version=${version}`
      )

      if (!response.ok) {
        throw new Error('Failed to load agent')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [clientId, agentId, version])

  // Sauvegarder l'agent
  const save = useCallback(async (updatedData?: Partial<AgentData>) => {
    if (!data) return

    setSaving(true)
    setError(null)

    try {
      const dataToSave = updatedData ? { ...data, ...updatedData } : data

      const response = await fetch(
        `/api/agents/${agentId}?clientId=${clientId}&version=${version}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to save agent')
      }

      setData(dataToSave)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setSaving(false)
    }
  }, [clientId, agentId, version, data])

  // Mettre à jour une partie des données
  const updateConfig = useCallback((updates: Partial<AgentConfig>) => {
    setData(prev => prev ? { ...prev, config: { ...prev.config, ...updates } } : null)
  }, [])

  const updateModulesInputs = useCallback((moduleId: string, inputs: unknown) => {
    setData(prev => prev ? {
      ...prev,
      modulesInputs: { ...prev.modulesInputs, [moduleId]: inputs }
    } : null)
  }, [])

  const updateSubAgents = useCallback((subAgents: Record<string, SubAgentConfig>) => {
    setData(prev => prev ? { ...prev, subAgents } : null)
  }, [])

  const updateGlossary = useCallback((glossary: AgentData['glossary']) => {
    setData(prev => prev ? { ...prev, glossary } : null)
  }, [])

  // Charger au montage
  useEffect(() => {
    load()
  }, [load])

  return {
    data,
    loading,
    saving,
    error,
    load,
    save,
    updateConfig,
    updateModulesInputs,
    updateSubAgents,
    updateGlossary,
  }
}
```

✅ **Validation**: Hook compile sans erreur

---

### 3.2 Layout avec Navigation

**Créer**: `web/app/agent/[agentId]/layout.tsx`

```typescript
import { ReactNode } from 'react'
import { AgentTabs } from './components/agent-tabs'
import { AgentHeader } from '@/components/agent/agent-header'

export default function AgentLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ agentId: string }>
}) {
  return (
    <div className="flex h-screen flex-col">
      <AgentHeader params={params} />
      <AgentTabs params={params} />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
```

**Créer**: `web/app/agent/[agentId]/components/agent-tabs.tsx`

```typescript
'use client'

import { use } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { name: 'Configuration', href: '/config', icon: '⚙️' },
  { name: 'Modules', href: '/modules', icon: '📦' },
  { name: 'Canvas', href: '/canvas', icon: '🎨' },
  { name: 'Glossary', href: '/glossary', icon: '📚' },
]

export function AgentTabs({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const pathname = usePathname()

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const href = `/agent/${agentId}${tab.href}`
          const isActive = pathname?.startsWith(href)

          return (
            <Link
              key={tab.name}
              href={href}
              className={cn(
                'flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium',
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
```

**Créer**: `web/components/agent/agent-header.tsx`

```typescript
'use client'

import { use } from 'react'
import { useAgent } from '@/lib/hooks/use-agent'
import { Button } from '@/components/ui/button'

export function AgentHeader({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const { data, saving, save } = useAgent('default', agentId)

  const handleSave = async () => {
    try {
      await save()
      // TODO: Toast success
    } catch (error) {
      // TODO: Toast error
    }
  }

  const handleExport = async () => {
    window.open(
      `/api/agents/${agentId}/export?clientId=default&format=yaml`,
      '_blank'
    )
  }

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{agentId}</h1>
        {data && (
          <p className="text-sm text-gray-500">
            Version: {data.config.version} | Language: {data.config.language}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={!data}
        >
          Export YAML
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !data}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </header>
  )
}
```

✅ **Validation**: Layout s'affiche avec navigation

---

### 3.3 Onglet Configuration

**Créer**: `web/app/agent/[agentId]/config/page.tsx`

```typescript
'use client'

import { use } from 'react'
import { useAgent } from '@/lib/hooks/use-agent'
import { MessagesForm } from '../components/config/messages-form'
import { ModelsForm } from '../components/config/models-form'
import { TriggersForm } from '../components/config/triggers-form'

export default function ConfigPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const { data, loading, updateConfig } = useAgent('default', agentId)

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (!data) {
    return <div className="p-6">Agent not found</div>
  }

  return (
    <div className="space-y-8 p-6">
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <input
              type="text"
              value={data.config.language}
              onChange={(e) => updateConfig({ language: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <input
              type="text"
              value={data.config.timezone}
              onChange={(e) => updateConfig({ timezone: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      </section>

      <MessagesForm
        messages={data.config.messages}
        onChange={(messages) => updateConfig({ messages })}
      />

      <ModelsForm
        models={data.config.models}
        onChange={(models) => updateConfig({ models })}
      />

      <TriggersForm
        triggers={data.config.triggers}
        onChange={(triggers) => updateConfig({ triggers })}
      />
    </div>
  )
}
```

**Créer**: `web/app/agent/[agentId]/components/config/messages-form.tsx`

```typescript
'use client'

import { useState } from 'react'
import type { Message } from '@/types/agent'
import { Button } from '@/components/ui/button'

interface MessagesFormProps {
  messages: Record<string, Message>
  onChange: (messages: Record<string, Message>) => void
}

export function MessagesForm({ messages, onChange }: MessagesFormProps) {
  const [newMessageKey, setNewMessageKey] = useState('')

  const handleUpdateMessage = (key: string, field: 'text' | 'audio', value: string) => {
    onChange({
      ...messages,
      [key]: {
        ...messages[key],
        [field]: value,
      },
    })
  }

  const handleAddMessage = () => {
    if (newMessageKey && !messages[newMessageKey]) {
      onChange({
        ...messages,
        [newMessageKey]: { text: '' },
      })
      setNewMessageKey('')
    }
  }

  const handleRemoveMessage = (key: string) => {
    const { [key]: _, ...rest } = messages
    onChange(rest)
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages</h2>

      <div className="space-y-4">
        {Object.entries(messages).map(([key, message]) => (
          <div key={key} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">{key}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveMessage(key)}
              >
                Remove
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text
                </label>
                <textarea
                  value={message.text ?? ''}
                  onChange={(e) => handleUpdateMessage(key, 'text', e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Audio Path (optional)
                </label>
                <input
                  type="text"
                  value={message.audio ?? ''}
                  onChange={(e) => handleUpdateMessage(key, 'audio', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="audios/welcome.mp3"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <input
            type="text"
            value={newMessageKey}
            onChange={(e) => setNewMessageKey(e.target.value)}
            placeholder="New message key (e.g., welcome)"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2"
          />
          <Button onClick={handleAddMessage}>Add Message</Button>
        </div>
      </div>
    </section>
  )
}
```

**Créer**: `web/app/agent/[agentId]/components/config/models-form.tsx`

```typescript
'use client'

import type { ModelConfig } from '@/types/agent'

interface ModelsFormProps {
  models: {
    llm: ModelConfig
    stt: ModelConfig
    tts: ModelConfig
  }
  onChange: (models: ModelsFormProps['models']) => void
}

export function ModelsForm({ models, onChange }: ModelsFormProps) {
  const handleUpdateModel = (
    type: 'llm' | 'stt' | 'tts',
    field: keyof ModelConfig,
    value: string | number
  ) => {
    onChange({
      ...models,
      [type]: {
        ...models[type],
        [field]: value,
      },
    })
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Models</h2>

      <div className="space-y-6">
        {/* LLM */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">LLM Model</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider
              </label>
              <input
                type="text"
                value={models.llm.provider}
                onChange={(e) => handleUpdateModel('llm', 'provider', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                value={models.llm.model}
                onChange={(e) => handleUpdateModel('llm', 'model', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature
              </label>
              <input
                type="number"
                step="0.1"
                value={models.llm.temperature ?? 0.7}
                onChange={(e) => handleUpdateModel('llm', 'temperature', parseFloat(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* STT */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">STT Model</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider
              </label>
              <input
                type="text"
                value={models.stt.provider}
                onChange={(e) => handleUpdateModel('stt', 'provider', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                value={models.stt.model}
                onChange={(e) => handleUpdateModel('stt', 'model', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* TTS */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">TTS Model</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider
              </label>
              <input
                type="text"
                value={models.tts.provider}
                onChange={(e) => handleUpdateModel('tts', 'provider', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voice ID
              </label>
              <input
                type="text"
                value={models.tts.voice_id ?? ''}
                onChange={(e) => handleUpdateModel('tts', 'voice_id', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

**Créer**: `web/app/agent/[agentId]/components/config/triggers-form.tsx`

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
  // TODO: Implémenter l'édition des triggers (ÉTAPE 6)
  // Pour l'instant, affichage simple

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Triggers</h2>
      <p className="text-sm text-gray-500">
        Trigger configuration will be implemented in Step 6 (Tools & Hooks)
      </p>

      <div className="mt-4 space-y-2">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900">Start Discussion</h3>
          <p className="text-sm text-gray-500 mt-1">
            {triggers?.start_discussion?.length ?? 0} hook(s) configured
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900">End Discussion</h3>
          <p className="text-sm text-gray-500 mt-1">
            {triggers?.end_discussion?.length ?? 0} hook(s) configured
          </p>
        </div>
      </div>
    </section>
  )
}
```

✅ **Validation**: Onglet Configuration affiche et permet d'éditer

---

### 3.4 Onglet Glossaire

**Créer**: `web/app/agent/[agentId]/glossary/page.tsx`

```typescript
'use client'

import { use } from 'react'
import { useAgent } from '@/lib/hooks/use-agent'
import { DefinitionsEditor } from '../components/glossary/definitions-editor'
import { PronunciationsEditor } from '../components/glossary/pronunciations-editor'
import { TranscriptionsEditor } from '../components/glossary/transcriptions-editor'

export default function GlossaryPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const { data, loading, updateGlossary } = useAgent('default', agentId)

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (!data) {
    return <div className="p-6">Agent not found</div>
  }

  return (
    <div className="space-y-8 p-6">
      <div className="prose max-w-none">
        <p className="text-gray-600">
          The glossary helps improve conversation quality by providing context to the LLM,
          correcting pronunciation, and improving transcription accuracy.
        </p>
      </div>

      <DefinitionsEditor
        definitions={data.glossary.definitions}
        onChange={(definitions) => updateGlossary({ ...data.glossary, definitions })}
      />

      <PronunciationsEditor
        pronunciations={data.glossary.pronunciations}
        onChange={(pronunciations) => updateGlossary({ ...data.glossary, pronunciations })}
      />

      <TranscriptionsEditor
        transcriptions={data.glossary.transcriptions}
        onChange={(transcriptions) => updateGlossary({ ...data.glossary, transcriptions })}
      />
    </div>
  )
}
```

**Créer**: `web/app/agent/[agentId]/components/glossary/definitions-editor.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface DefinitionsEditorProps {
  definitions: unknown
  onChange: (definitions: unknown) => void
}

export function DefinitionsEditor({ definitions, onChange }: DefinitionsEditorProps) {
  // Simplification: édition YAML brute
  const [yaml, setYaml] = useState(
    definitions ? JSON.stringify(definitions, null, 2) : ''
  )

  const handleSave = () => {
    try {
      const parsed = JSON.parse(yaml)
      onChange(parsed)
    } catch (error) {
      alert('Invalid YAML/JSON')
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Definitions</h2>
          <p className="text-sm text-gray-500">
            Business terms and context for the LLM
          </p>
        </div>
        <Button onClick={handleSave}>Save Definitions</Button>
      </div>

      <textarea
        value={yaml}
        onChange={(e) => setYaml(e.target.value)}
        rows={12}
        className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
        placeholder="Enter definitions in JSON format..."
      />
    </section>
  )
}
```

**Créer**: `web/app/agent/[agentId]/components/glossary/pronunciations-editor.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface PronunciationsEditorProps {
  pronunciations: unknown
  onChange: (pronunciations: unknown) => void
}

export function PronunciationsEditor({ pronunciations, onChange }: PronunciationsEditorProps) {
  const [yaml, setYaml] = useState(
    pronunciations ? JSON.stringify(pronunciations, null, 2) : ''
  )

  const handleSave = () => {
    try {
      const parsed = JSON.parse(yaml)
      onChange(parsed)
    } catch (error) {
      alert('Invalid YAML/JSON')
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Pronunciations</h2>
          <p className="text-sm text-gray-500">
            Phonetic mappings to correct TTS pronunciation
          </p>
        </div>
        <Button onClick={handleSave}>Save Pronunciations</Button>
      </div>

      <textarea
        value={yaml}
        onChange={(e) => setYaml(e.target.value)}
        rows={12}
        className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
        placeholder='Example: {"Mecaplanning": "Mékaplanning"}'
      />
    </section>
  )
}
```

**Créer**: `web/app/agent/[agentId]/components/glossary/transcriptions-editor.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface TranscriptionsEditorProps {
  transcriptions: unknown
  onChange: (transcriptions: unknown) => void
}

export function TranscriptionsEditor({ transcriptions, onChange }: TranscriptionsEditorProps) {
  const [yaml, setYaml] = useState(
    transcriptions ? JSON.stringify(transcriptions, null, 2) : ''
  )

  const handleSave = () => {
    try {
      const parsed = JSON.parse(yaml)
      onChange(parsed)
    } catch (error) {
      alert('Invalid YAML/JSON')
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Transcriptions</h2>
          <p className="text-sm text-gray-500">
            Hints for STT to correct common transcription errors
          </p>
        </div>
        <Button onClick={handleSave}>Save Transcriptions</Button>
      </div>

      <textarea
        value={yaml}
        onChange={(e) => setYaml(e.target.value)}
        rows={12}
        className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
        placeholder='Example: {"j\'ai": "G"} for letter G'
      />
    </section>
  )
}
```

✅ **Validation**: Onglet Glossaire affiche et permet d'éditer

---

## ✅ Checklist de Validation

- [ ] Hook `use-agent` compile et fonctionne
- [ ] Layout avec navigation onglets
- [ ] Header avec boutons Save et Export
- [ ] Onglet Configuration affiche et édite:
  - [ ] General settings (language, timezone)
  - [ ] Messages (add, edit, remove)
  - [ ] Models (LLM, STT, TTS)
  - [ ] Triggers (placeholder)
- [ ] Onglet Glossaire affiche et édite:
  - [ ] Definitions
  - [ ] Pronunciations
  - [ ] Transcriptions
- [ ] Sauvegarde fonctionne (bouton Save)
- [ ] Export YAML fonctionne
- [ ] Navigation entre onglets sans perte de données
- [ ] Pas d'erreur TypeScript
- [ ] Pas d'erreur console

---

## ➡️ Prochaine Étape

[ÉTAPE 4: Frontend - Gestion Modules](./STEP_4_FRONTEND_MODULES.md)
