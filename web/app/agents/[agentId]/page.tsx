'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Loading from '@/app/components/base/loading'
import Button from '@/app/components/base/button'

interface AgentData {
  config: any
  modulesInputs: Record<string, any>
  subAgents: Record<string, any>
  glossary: any
}

export default function AgentDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const agentId = params.agentId as string
  const clientId = searchParams.get('clientId') || 'default'

  const [data, setData] = useState<AgentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAgent()
  }, [agentId, clientId])

  const loadAgent = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/agents/${agentId}?clientId=${clientId}`)
      if (!response.ok)
        throw new Error('Failed to load agent')

      const result = await response.json()
      setData(result)
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
    finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'json' | 'yaml') => {
    try {
      const response = await fetch(`/api/agents/${agentId}/export?clientId=${clientId}&format=${format}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${agentId}.${format === 'yaml' ? 'yml' : 'json'}`
      a.click()
      window.URL.revokeObjectURL(url)
    }
    catch (err) {
      alert('Export failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error: {error || 'Agent not found'}</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">{agentId}</h1>
            <p className="text-gray-600">Client: {clientId}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleExport('json')}>Export JSON</Button>
            <Button onClick={() => handleExport('yaml')}>Export YAML</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Version:</span>
              {' '}
              {data.config.version}
            </p>
            <p>
              <span className="font-medium">Language:</span>
              {' '}
              {data.config.language}
            </p>
            <p>
              <span className="font-medium">Timezone:</span>
              {' '}
              {data.config.timezone}
            </p>
            <p>
              <span className="font-medium">Modules:</span>
              {' '}
              {data.config.modules.join(', ')}
            </p>
          </div>
        </div>

        {/* Models */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Models</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium">LLM</p>
              <p className="text-gray-600">
                {data.config.models.llm.provider}
                {' '}
                -
                {data.config.models.llm.model}
              </p>
            </div>
            <div>
              <p className="font-medium">STT</p>
              <p className="text-gray-600">
                {data.config.models.stt.provider}
                {' '}
                -
                {data.config.models.stt.model}
              </p>
            </div>
            <div>
              <p className="font-medium">TTS</p>
              <p className="text-gray-600">
                {data.config.models.tts.provider}
                {data.config.models.tts.voice_id && ` - ${data.config.models.tts.voice_id}`}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
          <div className="space-y-2 text-sm">
            {Object.entries(data.config.messages).map(([key, value]: [string, any]) => (
              <div key={key}>
                <p className="font-medium">{key}</p>
                <p className="text-gray-600">
                  {value.text || value.texts?.[data.config.language] || 'No text'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-agents */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Sub-agents</h2>
          <div className="space-y-2 text-sm">
            {Object.keys(data.subAgents).length > 0 ? (
              Object.keys(data.subAgents).map(key => (
                <div key={key} className="border-l-2 border-blue-500 pl-3">
                  {key}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No sub-agents configured</p>
            )}
          </div>
        </div>
      </div>

      {/* Raw Data */}
      <div className="mt-6 border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Raw Configuration</h2>
        <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto max-h-96">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  )
}
