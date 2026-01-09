'use client'

import { use, useState, useEffect } from 'react'
import { useAgent } from '@/lib/hooks/use-agent'
import { ModuleSelector } from '../components/modules/module-selector'
import { ModuleList } from '../components/modules/module-list'
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
      .then(result => setAvailableModules(result.modules || []))
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
    // Note: updateModulesInputs ne supporte pas la suppression, on doit gérer différemment
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Modules</h2>
          <p className="mt-1 text-sm text-gray-500">
            {configuredModules.length} module(s) configured
          </p>
        </div>
        <button
          onClick={() => setShowSelector(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Add Module
        </button>
      </div>

      {configuredModules.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="mb-4 text-gray-500">No modules configured yet</p>
          <button
            onClick={() => setShowSelector(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Add Your First Module
          </button>
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
