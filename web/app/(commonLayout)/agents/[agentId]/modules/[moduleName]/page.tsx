'use client'

import { use } from 'react'
import { useAgent } from '@/lib/hooks/use-agent'
import Loading from '@/app/components/base/loading'
import { AgentHeader } from '../../components/agent-header'
import Button from '@/app/components/base/button'
import { ToastContext } from '@/app/components/base/toast'
import { useContext } from 'use-context-selector'

export default function ModuleConfigPage({ 
  params 
}: { 
  params: Promise<{ agentId: string; moduleName: string }> 
}) {
  const { agentId, moduleName } = use(params)
  const { data, loading, updateModulesInputs, save } = useAgent(agentId)
  const { notify } = useContext(ToastContext)

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Agent not found</h2>
        </div>
      </div>
    )
  }

  const moduleInputs = data.modulesInputs[moduleName] || {}

  // TODO: Load module form schema from module metadata
  // For now, display a simple JSON editor
  const handleSave = async () => {
    try {
      await save()
      notify({ type: 'success', message: 'Module configuration saved' })
    } catch (error) {
      notify({ type: 'error', message: 'Failed to save module configuration' })
    }
  }

  return (
    <div className="h-full flex flex-col">
      <AgentHeader agentId={agentId} data={data} onSave={save} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Module Configuration: {moduleName}
          </h2>
          <p className="text-gray-600 mb-6">
            Configure the inputs for this module. The form will be dynamically generated
            based on the module's form schema (forms.yml).
          </p>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-500">
              Module form configuration will be implemented based on the module's forms.yml file.
              For now, module inputs are managed through the YAML files directly.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Current inputs: {Object.keys(moduleInputs).length} configured
            </p>
          </div>

          <div className="mt-6">
            <Button onClick={handleSave} variant="primary">
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
