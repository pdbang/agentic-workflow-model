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
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-500">Loading agent configuration...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-red-500">Agent not found</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">General Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Language
            </label>
            <input
              type="text"
              value={data.config.language}
              onChange={e => updateConfig({ language: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Timezone
            </label>
            <input
              type="text"
              value={data.config.timezone}
              onChange={e => updateConfig({ timezone: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      <MessagesForm
        messages={data.config.messages}
        onChange={messages => updateConfig({ messages })}
      />

      <ModelsForm
        models={data.config.models}
        onChange={models => updateConfig({ models })}
      />

      <TriggersForm
        triggers={data.config.triggers}
        onChange={triggers => updateConfig({ triggers })}
      />
    </div>
  )
}
