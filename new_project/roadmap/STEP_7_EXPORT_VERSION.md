# ÉTAPE 7: Export/Import & Versioning

**Durée estimée**: 2-3 jours  
**Prérequis**: ÉTAPE 6 complétée

---

## 🎯 Objectifs

Finaliser les fonctionnalités de gestion :
1. Export YAML complet et par section
2. Import YAML avec validation
3. Copier le YAML généré dans le presse-papier
4. Système de versioning d'agents
5. Duplication d'agents

---

## 🔨 Tâches Détaillées

### 7.1 Export Amélioré

**Créer**: `web/app/agent/[agentId]/components/export-dialog.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ExportDialogProps {
  agentId: string
  clientId: string
  version: string
  onClose: () => void
}

export function ExportDialog({ agentId, clientId, version, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<'json' | 'yaml'>('yaml')
  const [sections, setSections] = useState({
    config: true,
    modules: true,
    subAgents: true,
    glossary: true,
  })

  const handleExport = async () => {
    const params = new URLSearchParams({
      clientId,
      version,
      format,
    })

    const response = await fetch(`/api/agents/${agentId}/export?${params}`)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${agentId}-${version}.${format === 'yaml' ? 'yml' : 'json'}`
    a.click()
    window.URL.revokeObjectURL(url)

    onClose()
  }

  const handleCopy = async () => {
    const params = new URLSearchParams({
      clientId,
      version,
      format,
    })

    const response = await fetch(`/api/agents/${agentId}/export?${params}`)
    const text = await response.text()

    await navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Agent</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="json"
                  checked={format === 'json'}
                  onChange={(e) => setFormat(e.target.value as 'json')}
                  className="mr-2"
                />
                JSON
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="yaml"
                  checked={format === 'yaml'}
                  onChange={(e) => setFormat(e.target.value as 'yaml')}
                  className="mr-2"
                />
                YAML
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sections
            </label>
            <div className="space-y-2">
              {Object.entries(sections).map(([key, value]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setSections({ ...sections, [key]: e.target.checked })}
                    className="mr-2"
                  />
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleCopy}>
            Copy
          </Button>
          <Button onClick={handleExport}>
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 7.2 Import YAML

**Créer**: `web/app/agent/[agentId]/components/import-dialog.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import yaml from 'js-yaml'

interface ImportDialogProps {
  agentId: string
  clientId: string
  version: string
  onImport: (data: any) => void
  onClose: () => void
}

export function ImportDialog({
  agentId,
  clientId,
  version,
  onImport,
  onClose,
}: ImportDialogProps) {
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    try {
      // Parse YAML ou JSON
      let data
      try {
        data = yaml.load(content)
      } catch {
        data = JSON.parse(content)
      }

      // Valider la structure basique
      if (!data.agent_config || !data.modules_inputs) {
        throw new Error('Invalid agent structure')
      }

      // Envoyer au backend
      const response = await fetch(
        `/api/agents/${agentId}?clientId=${clientId}&version=${version}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: data.agent_config,
            modulesInputs: data.modules_inputs,
            subAgents: data.sub_agents || {},
            glossary: data.glossary || {},
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Import failed')
      }

      onImport(data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid format')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setContent(event.target?.result as string)
      setError(null)
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Import Agent</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File
            </label>
            <input
              type="file"
              accept=".yml,.yaml,.json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Paste Content
            </label>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                setError(null)
              }}
              rows={12}
              className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
              placeholder="Paste YAML or JSON content here..."
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!content}>
            Import
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 7.3 Versioning Interface

**Créer**: `web/app/agent/[agentId]/versions/page.tsx`

```typescript
'use client'

import { use, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface Version {
  version: string
  createdAt: string
  isLatest: boolean
}

export default function VersionsPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/agents/${agentId}/versions?clientId=default`)
      .then(res => res.json())
      .then(data => {
        setVersions(data.versions || [])
        setLoading(false)
      })
  }, [agentId])

  const handleCreateVersion = async () => {
    const response = await fetch(
      `/api/agents/${agentId}/versions?clientId=default`,
      { method: 'POST' }
    )
    const result = await response.json()
    
    if (result.version) {
      setVersions([
        { version: result.version, createdAt: new Date().toISOString(), isLatest: false },
        ...versions,
      ])
    }
  }

  if (loading) {
    return <div className="p-6">Loading versions...</div>
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Versions</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage agent versions and history
          </p>
        </div>
        <Button onClick={handleCreateVersion}>
          Create New Version
        </Button>
      </div>

      <div className="space-y-2">
        {versions.map((version) => (
          <div
            key={version.version}
            className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <div className="font-medium text-gray-900">
                {version.version}
                {version.isLatest && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    Latest
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Created: {new Date(version.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.href = `/agent/${agentId}/config?version=${version.version}`
                }}
              >
                View
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 7.4 API Routes Versioning

**Créer**: `web/app/api/agents/[agentId]/versions/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { listAgentVersions, createAgentVersion } from '@/lib/agents/versioning'
import { getAgentVersionsDetails } from '@/lib/agents/versioning'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') ?? 'default'

    const versions = await getAgentVersionsDetails(clientId, agentId)

    return NextResponse.json({ versions })
  } catch (error) {
    console.error('Error in GET /api/agents/[agentId]/versions:', error)
    return NextResponse.json(
      { error: 'Failed to load versions' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') ?? 'default'
    const sourceVersion = searchParams.get('sourceVersion') ?? 'latest'

    const newVersion = await createAgentVersion(clientId, agentId, sourceVersion)

    return NextResponse.json({ version: newVersion })
  } catch (error) {
    console.error('Error in POST /api/agents/[agentId]/versions:', error)
    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 }
    )
  }
}
```

### 7.5 Duplication d'Agent

**Créer**: `web/app/agent/duplicate/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function DuplicateAgentPage() {
  const router = useRouter()
  const [sourceAgentId, setSourceAgentId] = useState('')
  const [targetAgentId, setTargetAgentId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDuplicate = async () => {
    if (!sourceAgentId || !targetAgentId) {
      alert('Please fill all fields')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/agents/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceClientId: 'default',
          sourceAgentId,
          targetClientId: 'default',
          targetAgentId,
        }),
      })

      if (!response.ok) {
        throw new Error('Duplication failed')
      }

      router.push(`/agent/${targetAgentId}/config`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Duplication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Duplicate Agent</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source Agent ID
          </label>
          <input
            type="text"
            value={sourceAgentId}
            onChange={(e) => setSourceAgentId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="existing_agent_id"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Agent ID
          </label>
          <input
            type="text"
            value={targetAgentId}
            onChange={(e) => setTargetAgentId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="new_agent_id"
          />
        </div>

        <Button
          onClick={handleDuplicate}
          disabled={loading || !sourceAgentId || !targetAgentId}
          className="w-full"
        >
          {loading ? 'Duplicating...' : 'Duplicate Agent'}
        </Button>
      </div>
    </div>
  )
}
```

**Créer**: `web/app/api/agents/duplicate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { duplicateAgent } from '@/lib/agents/versioning'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sourceClientId, sourceAgentId, targetClientId, targetAgentId } = body

    if (!sourceClientId || !sourceAgentId || !targetClientId || !targetAgentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await duplicateAgent(
      sourceClientId,
      sourceAgentId,
      targetClientId,
      targetAgentId
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/agents/duplicate:', error)
    return NextResponse.json(
      { error: 'Duplication failed' },
      { status: 500 }
    )
  }
}
```

---

## ✅ Checklist de Validation

- [ ] Export Dialog affiche options
- [ ] Export télécharge fichier YAML/JSON
- [ ] Copie YAML dans presse-papier fonctionne
- [ ] Import Dialog permet upload fichier
- [ ] Import depuis paste fonctionne
- [ ] Validation import détecte erreurs
- [ ] Page Versions liste versions
- [ ] Création nouvelle version fonctionne
- [ ] Duplication d'agent fonctionne
- [ ] API Routes versioning fonctionnent
- [ ] Pas d'erreur TypeScript

---

## ➡️ Prochaine Étape

[ÉTAPE 8: Polish & Testing](./STEP_8_POLISH.md)
