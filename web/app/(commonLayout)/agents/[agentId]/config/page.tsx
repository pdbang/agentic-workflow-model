'use client'

import { use } from 'react'
import { useAgent } from '@/lib/hooks/use-agent'
import Loading from '@/app/components/base/loading'
import { MessagesForm } from '../components/config/messages-form'
import { ModelsForm } from '../components/config/models-form'
import { TriggersForm } from '../components/config/triggers-form'
import { AgentHeader } from '../components/agent-header'

export default function ConfigPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const { data, loading, updateConfig, save } = useAgent(agentId)

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
          <p className="mt-2 text-sm text-gray-500">The agent you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <AgentHeader agentId={agentId} data={data} onSave={save} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-8 max-w-4xl mx-auto">
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
      </div>
    </div>
  )
}
