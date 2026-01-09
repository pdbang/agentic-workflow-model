'use client'

import { use, useState, useEffect } from 'react'
import { useAgent } from '@/lib/hooks/use-agent'
import { ModuleForm } from '../../components/modules/module-form'
import { ModuleDependencies } from '../../components/modules/module-dependencies'
import { ModuleMemory } from '../../components/modules/module-memory'

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
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{moduleId}</h2>
        <p className="mt-1 text-sm text-gray-500">
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
