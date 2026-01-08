# ÉTAPE 4: Frontend - Gestion Modules

**Durée estimée**: 3-4 jours  
**Prérequis**: ÉTAPE 3 complétée

---

## 🎯 Objectifs

Implémenter la gestion des modules :
1. Liste des modules disponibles avec recherche
2. Sélection de modules pour l'agent
3. Génération et affichage de formulaires dynamiques depuis `forms.yml`
4. Gestion des dépendances entre modules
5. Onglets par module configuré
6. Affichage de la mémoire agrégée (read-only)

---

## 📁 Structure Cible

```
web/app/agent/[agentId]/modules/
├── page.tsx                            # Liste et sélection modules
└── [moduleId]/
    └── page.tsx                        # Configuration module

web/app/agent/[agentId]/components/modules/
├── module-selector.tsx                 # Modal sélection modules
├── module-list.tsx                     # Liste modules configurés
├── module-form.tsx                     # Formulaire dynamique
├── module-dependencies.tsx             # Affichage dépendances
└── module-memory.tsx                   # Variables mémoire (read-only)

web/lib/modules/
└── form-renderer.tsx                   # Composants de rendu formulaire
```

---

## 🔨 Tâches Détaillées

### 4.1 Page Modules Principale

**Créer**: `web/app/agent/[agentId]/modules/page.tsx`

```typescript
'use client'

import { use, useState, useEffect } from 'react'
import { useAgent } from '@/lib/hooks/use-agent'
import { ModuleSelector } from '../components/modules/module-selector'
import { ModuleList } from '../components/modules/module-list'
import { Button } from '@/components/ui/button'
import type { ModuleMetadata } from '@/types/module'

export default function ModulesPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const { data, loading, updateConfig, updateModulesInputs } = useAgent('default', agentId)
  const [availableModules, setAvailableModules] = useState<ModuleMetadata[]>([])
  const [showSelector, setShowSelector] = useState(false)

  // Charger les modules disponibles
  useEffect(() => {
    fetch('/api/modules')
      .then(res => res.json())
      .then(result => setAvailableModules(result.modules))
  }, [])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (!data) {
    return <div className="p-6">Agent not found</div>
  }

  const configuredModules = data.config.modules || []

  const handleAddModule = async (moduleId: string) => {
    // Récupérer les dépendances
    const response = await fetch(`/api/modules/${moduleId}/dependencies`)
    const { dependencies } = await response.json()
    
    // Ajouter le module + dépendances requises
    const modulesToAdd = [
      ...new Set([
        ...configuredModules,
        moduleId,
        ...(dependencies.required || [])
      ])
    ]
    
    updateConfig({ modules: modulesToAdd })
    
    // Initialiser les inputs du module avec valeurs par défaut
    const moduleResponse = await fetch(`/api/modules/${moduleId}`)
    const { form } = await moduleResponse.json()
    
    if (form) {
      const defaultInputs = form.fields.reduce((acc: any, field: any) => {
        acc[field.name] = field.default ?? null
        return acc
      }, {})
      
      updateModulesInputs(moduleId, defaultInputs)
    }
    
    setShowSelector(false)
  }

  const handleRemoveModule = (moduleId: string) => {
    // Vérifier si d'autres modules dépendent de celui-ci
    // TODO: Ajouter validation
    
    const updated = configuredModules.filter(m => m !== moduleId)
    updateConfig({ modules: updated })
    
    // Supprimer les inputs
    const { [moduleId]: _, ...rest } = data.modulesInputs
    updateModulesInputs(moduleId, undefined) // Signal de suppression
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Modules</h2>
          <p className="text-sm text-gray-500 mt-1">
            {configuredModules.length} module(s) configured
          </p>
        </div>
        <Button onClick={() => setShowSelector(true)}>
          Add Module
        </Button>
      </div>

      {configuredModules.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">No modules configured yet</p>
          <Button onClick={() => setShowSelector(true)}>
            Add Your First Module
          </Button>
        </div>
      ) : (
        <ModuleList
          modules={configuredModules}
          availableModules={availableModules}
          onRemove={handleRemoveModule}
          agentId={agentId}
        />
      )}

      {showSelector && (
        <ModuleSelector
          availableModules={availableModules}
          configuredModules={configuredModules}
          onSelect={handleAddModule}
          onClose={() => setShowSelector(false)}
        />
      )}
    </div>
  )
}
```

✅ **Validation**: Page affiche liste modules

---

### 4.2 Sélecteur de Modules

**Créer**: `web/app/agent/[agentId]/components/modules/module-selector.tsx`

```typescript
'use client'

import { useState } from 'react'
import type { ModuleMetadata } from '@/types/module'
import { Button } from '@/components/ui/button'

interface ModuleSelectorProps {
  availableModules: ModuleMetadata[]
  configuredModules: string[]
  onSelect: (moduleId: string) => void
  onClose: () => void
}

export function ModuleSelector({
  availableModules,
  configuredModules,
  onSelect,
  onClose,
}: ModuleSelectorProps) {
  const [search, setSearch] = useState('')
  const [selectedModule, setSelectedModule] = useState<string | null>(null)

  const filteredModules = availableModules.filter(module =>
    !configuredModules.includes(module.id) &&
    (module.name.toLowerCase().includes(search.toLowerCase()) ||
     module.description?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Module</h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules..."
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {filteredModules.map((module) => (
              <div
                key={module.id}
                onClick={() => setSelectedModule(module.id)}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-colors
                  ${selectedModule === module.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{module.name}</h3>
                    {module.description && (
                      <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                    )}
                    {module.hasDependencies && (
                      <p className="text-xs text-gray-400 mt-2">
                        📦 {module.dependenciesCount} dependencies
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => selectedModule && onSelect(selectedModule)}
            disabled={!selectedModule}
          >
            Add Module
          </Button>
        </div>
      </div>
    </div>
  )
}
```

✅ **Validation**: Modal de sélection fonctionne

---

### 4.3 Liste des Modules Configurés

**Créer**: `web/app/agent/[agentId]/components/modules/module-list.tsx`

```typescript
'use client'

import Link from 'next/link'
import type { ModuleMetadata } from '@/types/module'
import { Button } from '@/components/ui/button'

interface ModuleListProps {
  modules: string[]
  availableModules: ModuleMetadata[]
  onRemove: (moduleId: string) => void
  agentId: string
}

export function ModuleList({ modules, availableModules, onRemove, agentId }: ModuleListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {modules.map((moduleId) => {
        const metadata = availableModules.find(m => m.id === moduleId)
        
        return (
          <div
            key={moduleId}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-medium text-gray-900">{metadata?.name || moduleId}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(moduleId)}
                className="text-red-600 hover:text-red-700"
              >
                ×
              </Button>
            </div>

            {metadata?.description && (
              <p className="text-sm text-gray-500 mb-3">{metadata.description}</p>
            )}

            <Link
              href={`/agent/${agentId}/modules/${moduleId}`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Configure →
            </Link>
          </div>
        )
      })}
    </div>
  )
}
```

✅ **Validation**: Liste affiche les modules configurés

---

### 4.4 Page Configuration Module

**Créer**: `web/app/agent/[agentId]/modules/[moduleId]/page.tsx`

```typescript
'use client'

import { use, useState, useEffect } from 'react'
import { useAgent } from '@/lib/hooks/use-agent'
import { ModuleForm } from '../../components/modules/module-form'
import { ModuleDependencies } from '../../components/modules/module-dependencies'
import { ModuleMemory } from '../../components/modules/module-memory'
import type { ModuleForm as ModuleFormType } from '@/types/module'

export default function ModuleConfigPage({
  params,
}: {
  params: Promise<{ agentId: string; moduleId: string }>
}) {
  const { agentId, moduleId } = use(params)
  const { data, loading, updateModulesInputs } = useAgent('default', agentId)
  const [moduleData, setModuleData] = useState<any>(null)

  // Charger les données du module
  useEffect(() => {
    fetch(`/api/modules/${moduleId}`)
      .then(res => res.json())
      .then(setModuleData)
  }, [moduleId])

  if (loading || !moduleData) {
    return <div className="p-6">Loading...</div>
  }

  if (!data) {
    return <div className="p-6">Agent not found</div>
  }

  const currentInputs = data.modulesInputs[moduleId] || {}

  const handleUpdateInputs = (inputs: any) => {
    updateModulesInputs(moduleId, inputs)
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{moduleId}</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure module settings and view memory variables
        </p>
      </div>

      {moduleData.dependencies && (
        <ModuleDependencies dependencies={moduleData.dependencies} />
      )}

      {moduleData.form && (
        <ModuleForm
          form={moduleData.form}
          values={currentInputs}
          onChange={handleUpdateInputs}
        />
      )}

      {moduleData.memory && (
        <ModuleMemory memory={moduleData.memory} />
      )}
    </div>
  )
}
```

✅ **Validation**: Page de configuration module s'affiche

---

### 4.5 Formulaire Dynamique

**Créer**: `web/app/agent/[agentId]/components/modules/module-form.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import type { ModuleForm as ModuleFormType, FormField } from '@/types/module'
import { Button } from '@/components/ui/button'

interface ModuleFormProps {
  form: ModuleFormType
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
}

export function ModuleForm({ form, values, onChange }: ModuleFormProps) {
  const [localValues, setLocalValues] = useState(values)

  useEffect(() => {
    setLocalValues(values)
  }, [values])

  const handleFieldChange = (fieldName: string, value: any) => {
    const updated = { ...localValues, [fieldName]: value }
    setLocalValues(updated)
  }

  const handleSave = () => {
    onChange(localValues)
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
        <Button onClick={handleSave}>Save Configuration</Button>
      </div>

      <div className="space-y-4">
        {form.fields.map((field) => (
          <FormFieldRenderer
            key={field.name}
            field={field}
            value={localValues[field.name]}
            onChange={(value) => handleFieldChange(field.name, value)}
          />
        ))}
      </div>
    </section>
  )
}

interface FormFieldRendererProps {
  field: FormField
  value: any
  onChange: (value: any) => void
}

function FormFieldRenderer({ field, value, onChange }: FormFieldRendererProps) {
  const renderInput = () => {
    switch (field.type) {
      case 'string':
        if (field.options) {
          return (
            <select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              required={field.required}
            >
              <option value="">Select...</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )
        }
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            required={field.required}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            required={field.required}
          />
        )

      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded border-gray-300"
          />
        )

      case 'array':
        // Simplification: édition JSON
        return (
          <textarea
            value={JSON.stringify(value || [], null, 2)}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value))
              } catch {}
            }}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
            required={field.required}
          />
        )

      case 'object':
        // Simplification: édition JSON
        return (
          <textarea
            value={JSON.stringify(value || {}, null, 2)}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value))
              } catch {}
            }}
            rows={6}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
            required={field.required}
          />
        )

      default:
        return null
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {field.description && (
        <p className="text-xs text-gray-500 mb-2">{field.description}</p>
      )}
      {renderInput()}
    </div>
  )
}
```

✅ **Validation**: Formulaire s'affiche et permet la modification

---

### 4.6 Affichage Dépendances et Mémoire

**Créer**: `web/app/agent/[agentId]/components/modules/module-dependencies.tsx`

```typescript
'use client'

import type { ModuleDependencies } from '@/types/module'

interface ModuleDependenciesProps {
  dependencies: ModuleDependencies
}

export function ModuleDependencies({ dependencies }: ModuleDependenciesProps) {
  const hasRequired = (dependencies.required?.length ?? 0) > 0
  const hasOptional = (dependencies.optional?.length ?? 0) > 0

  if (!hasRequired && !hasOptional) {
    return null
  }

  return (
    <section>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Dependencies</h3>

      <div className="border border-gray-200 rounded-lg p-4">
        {hasRequired && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Required</h4>
            <div className="flex flex-wrap gap-2">
              {dependencies.required!.map((dep) => (
                <span
                  key={dep}
                  className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                >
                  {dep}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasOptional && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Optional</h4>
            <div className="flex flex-wrap gap-2">
              {dependencies.optional!.map((dep) => (
                <span
                  key={dep}
                  className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                >
                  {dep}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
```

**Créer**: `web/app/agent/[agentId]/components/modules/module-memory.tsx`

```typescript
'use client'

import type { MemoryVariable } from '@/types/module'

interface ModuleMemoryProps {
  memory: Record<string, MemoryVariable>
}

export function ModuleMemory({ memory }: ModuleMemoryProps) {
  const variables = Object.entries(memory)

  if (variables.length === 0) {
    return null
  }

  return (
    <section>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Memory Variables</h3>
      <p className="text-sm text-gray-500 mb-4">
        These variables are managed by this module and persisted according to their scopes.
      </p>

      <div className="space-y-2">
        {variables.map(([key, variable]) => (
          <div
            key={key}
            className="border border-gray-200 rounded-lg p-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{variable.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{variable.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {variable.type}
                  </span>
                  {variable.scopes.session && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      session
                    </span>
                  )}
                  {variable.scopes.user && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      user
                    </span>
                  )}
                  {variable.scopes.shared && (
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      shared
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

✅ **Validation**: Dépendances et mémoire s'affichent correctement

---

## ✅ Checklist de Validation

- [ ] Page modules principale affiche la liste
- [ ] Modal de sélection module fonctionne
- [ ] Ajout de module (+ dépendances automatiques)
- [ ] Suppression de module
- [ ] Page de configuration module affiche:
  - [ ] Formulaire dynamique depuis forms.yml
  - [ ] Dépendances (required/optional)
  - [ ] Variables mémoire (read-only)
- [ ] Composants de formulaire pour tous les types:
  - [ ] string (input/select)
  - [ ] number
  - [ ] boolean
  - [ ] array (JSON)
  - [ ] object (JSON)
- [ ] Sauvegarde des configurations modules
- [ ] Navigation entre modules
- [ ] Pas d'erreur TypeScript

---

## ➡️ Prochaine Étape

[ÉTAPE 5: Frontend - Canvas Sub-Agents](./STEP_5_FRONTEND_CANVAS.md)
