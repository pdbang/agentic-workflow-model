'use client'

import { use } from 'react'
import { useAgent } from '@/lib/hooks/use-agent'
import Loading from '@/app/components/base/loading'
import { AgentHeader } from '../../components/agent-header'
import Button from '@/app/components/base/button'
import { ToastContext } from '@/app/components/base/toast'
import { useContext } from 'use-context-selector'

export default function AddModulePage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const { data, loading, updateConfig, save } = useAgent(agentId)
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

  const handleAddModule = (moduleName: string) => {
    const currentModules = data.config.modules || []
    if (currentModules.includes(moduleName)) {
      notify({ type: 'error', message: 'Module already added' })
      return
    }

    updateConfig({
      modules: [...currentModules, moduleName],
    })
    notify({ type: 'success', message: 'Module added successfully' })
  }

  // TODO: Load available modules from API
  const availableModules = [
    'base_auto',
    'crm',
    'support',
    // Add more modules as needed
  ]

  return (
    <div className="h-full flex flex-col">
      <AgentHeader agentId={agentId} data={data} onSave={save} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Add Module</h2>
          <p className="text-gray-600 mb-6">
            Select a module to add to your agent. Modules provide tools, prompts, and functionality.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableModules.map((moduleName) => {
              const isAdded = data.config.modules?.includes(moduleName) || false
              
              return (
                <div
                  key={moduleName}
                  className={`border rounded-lg p-4 ${
                    isAdded
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-medium text-gray-900 mb-2">{moduleName}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Module description will be loaded from module metadata
                  </p>
                  <Button
                    variant={isAdded ? 'secondary' : 'primary'}
                    onClick={() => handleAddModule(moduleName)}
                    disabled={isAdded}
                    className="w-full"
                  >
                    {isAdded ? 'Added' : 'Add Module'}
                  </Button>
                </div>
              )
            })}
          </div>

          {data.config.modules && data.config.modules.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Added Modules</h3>
              <div className="space-y-2">
                {data.config.modules.map((moduleName) => (
                  <div
                    key={moduleName}
                    className="flex items-center justify-between border border-gray-200 rounded-lg p-3"
                  >
                    <span className="font-medium text-gray-900">{moduleName}</span>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => {
                        const updatedModules = data.config.modules?.filter(m => m !== moduleName) || []
                        updateConfig({ modules: updatedModules })
                        notify({ type: 'success', message: 'Module removed' })
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
