'use client'

import type { AgentConfig } from '@/types/agent'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type Props = {
  agentId: string
  clientId: string
  version: string
}

type AgentData = {
  config: AgentConfig
  modulesInputs: Record<string, unknown>
  subAgents: Record<string, unknown>
  glossary: Record<string, unknown>
  memory?: unknown
}

export function AgentDetail({ agentId, clientId, version }: Props) {
  const [agent, setAgent] = useState<AgentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'config' | 'modules' | 'subagents' | 'glossary'>('config')

  useEffect(() => {
    async function fetchAgent() {
      try {
        const response = await fetch(`/api/agents/${agentId}?clientId=${clientId}&version=${version}`)
        if (!response.ok) {
          throw new Error('Failed to fetch agent')
        }
        const data = await response.json()
        setAgent(data)
      }
      catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
      finally {
        setLoading(false)
      }
    }

    fetchAgent()
  }, [agentId, clientId, version])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-600">
            Error:
            {error || 'Agent not found'}
          </p>
          <Link href="/agents" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to agents
          </Link>
        </div>
      </div>
    )
  }

  const { config } = agent

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-8">
        <Link href="/agents" className="mb-4 inline-block text-blue-600 hover:underline">
          ← Back to agents
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{agentId}</h1>
        <p className="mt-2 text-gray-600">
          Client:
          {clientId}
          {' '}
          | Version:
          {version}
        </p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'config' as const, label: 'Configuration' },
            { id: 'modules' as const, label: 'Modules' },
            { id: 'subagents' as const, label: 'Sub-Agents' },
            { id: 'glossary' as const, label: 'Glossary' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {activeTab === 'config' && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-semibold">General</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Version</dt>
                  <dd className="mt-1 text-sm text-gray-900">{config.version}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Language</dt>
                  <dd className="mt-1 text-sm text-gray-900">{config.language}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Timezone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{config.timezone}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold">Models</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">LLM</h4>
                  <p className="text-sm text-gray-600">
                    {config.models.llm.provider}
                    {' '}
                    -
                    {config.models.llm.model}
                    {config.models.llm.temperature && ` (temp: ${config.models.llm.temperature})`}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">STT</h4>
                  <p className="text-sm text-gray-600">
                    {config.models.stt.provider}
                    {' '}
                    -
                    {config.models.stt.model}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">TTS</h4>
                  <p className="text-sm text-gray-600">
                    {config.models.tts.provider}
                    {config.models.tts.voice_id && ` - Voice: ${config.models.tts.voice_id}`}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold">Messages</h3>
              <div className="space-y-2">
                {Object.entries(config.messages).map(([key, message]) => (
                  <div key={key} className="rounded border border-gray-200 p-3">
                    <p className="font-medium text-gray-700">{key}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {message.text || (message.texts && Object.values(message.texts)[0])}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'modules' && (
          <div>
            <h3 className="mb-4 text-lg font-semibold">Modules</h3>
            <div className="space-y-2">
              {config.modules.map(module => (
                <div key={module} className="rounded border border-gray-200 p-3">
                  <p className="font-medium text-gray-700">{module}</p>
                </div>
              ))}
            </div>

            <h3 className="mb-4 mt-6 text-lg font-semibold">Module Inputs</h3>
            <div className="space-y-4">
              {Object.entries(agent.modulesInputs).map(([moduleName, inputs]) => (
                <div key={moduleName} className="rounded border border-gray-200 p-4">
                  <h4 className="mb-2 font-medium text-gray-900">{moduleName}</h4>
                  <pre className="overflow-auto rounded bg-gray-50 p-2 text-xs">
                    {JSON.stringify(inputs, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'subagents' && (
          <div>
            <h3 className="mb-4 text-lg font-semibold">Sub-Agents</h3>
            <div className="space-y-4">
              {Object.entries(agent.subAgents).map(([name, config]) => (
                <div key={name} className="rounded border border-gray-200 p-4">
                  <h4 className="mb-2 font-medium text-gray-900">{name}</h4>
                  <pre className="overflow-auto rounded bg-gray-50 p-2 text-xs">
                    {JSON.stringify(config, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'glossary' && (
          <div>
            <h3 className="mb-4 text-lg font-semibold">Glossary</h3>
            {Object.keys(agent.glossary).length > 0
              ? (
                  <pre className="overflow-auto rounded border border-gray-200 bg-gray-50 p-3 text-xs">
                    {JSON.stringify(agent.glossary, null, 2)}
                  </pre>
                )
              : (
                  <p className="text-gray-600">No glossary data available</p>
                )}
          </div>
        )}
      </div>
    </div>
  )
}
