'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function NewAgentForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    clientId: 'default',
    agentId: '',
    language: 'fr-FR',
    timezone: 'Europe/Paris',
    llmProvider: 'openai',
    llmModel: 'gpt-4o-mini',
    llmTemperature: 0.7,
    sttProvider: 'deepgram',
    sttModel: 'nova-3',
    ttsProvider: 'eleven_labs',
    ttsVoiceId: '21m00Tcm4TlvDq8ikWAM',
    ttsModelId: 'eleven_turbo_v2_5',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const config = {
        version: 'v6',
        language: formData.language,
        timezone: formData.timezone,
        modules: [],
        messages: {
          welcome: {
            texts: {
              [formData.language]: 'Bonjour, comment puis-je vous aider ?',
            },
          },
          goodbye: {
            texts: {
              [formData.language]: 'Au revoir !',
            },
          },
        },
        models: {
          llm: {
            provider: formData.llmProvider,
            model: formData.llmModel,
            temperature: formData.llmTemperature,
          },
          stt: {
            provider: formData.sttProvider,
            model: formData.sttModel,
          },
          tts: {
            provider: formData.ttsProvider,
            voice_id: formData.ttsVoiceId,
            model_id: formData.ttsModelId,
          },
        },
      }

      const response = await fetch(
        `/api/agents/${formData.agentId}?clientId=${formData.clientId}&version=latest`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config,
            modulesInputs: {},
            subAgents: {},
            glossary: {},
          }),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to create agent')
      }

      router.push(`/agents/${formData.agentId}?clientId=${formData.clientId}`)
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <Link href="/agents" className="text-sm text-blue-600 hover:underline">
          ← Back to agents
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Create New Agent</h1>
        <p className="mt-2 text-gray-600">
          Configure a new AI agent with models and settings
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Error:
            {' '}
            {error}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
              Client ID
            </label>
            <input
              type="text"
              id="clientId"
              required
              value={formData.clientId}
              onChange={e => setFormData({ ...formData, clientId: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="agentId" className="block text-sm font-medium text-gray-700">
              Agent ID *
            </label>
            <input
              type="text"
              id="agentId"
              required
              pattern="[a-z0-9_-]+"
              value={formData.agentId}
              onChange={e => setFormData({ ...formData, agentId: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="my_agent"
            />
            <p className="mt-1 text-sm text-gray-500">Use lowercase letters, numbers, underscores, and hyphens</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                Language
              </label>
              <select
                id="language"
                value={formData.language}
                onChange={e => setFormData({ ...formData, language: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="fr-FR">French (fr-FR)</option>
                <option value="en-US">English (en-US)</option>
                <option value="es-ES">Spanish (es-ES)</option>
              </select>
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                Timezone
              </label>
              <select
                id="timezone"
                value={formData.timezone}
                onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900">LLM Configuration</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="llmProvider" className="block text-sm font-medium text-gray-700">
                Provider
              </label>
              <select
                id="llmProvider"
                value={formData.llmProvider}
                onChange={e => setFormData({ ...formData, llmProvider: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="mistral">Mistral</option>
              </select>
            </div>

            <div>
              <label htmlFor="llmModel" className="block text-sm font-medium text-gray-700">
                Model
              </label>
              <input
                type="text"
                id="llmModel"
                required
                value={formData.llmModel}
                onChange={e => setFormData({ ...formData, llmModel: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="llmTemperature" className="block text-sm font-medium text-gray-700">
                Temperature
              </label>
              <input
                type="number"
                id="llmTemperature"
                min="0"
                max="2"
                step="0.1"
                value={formData.llmTemperature}
                onChange={e => setFormData({ ...formData, llmTemperature: Number.parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900">Speech-to-Text (STT)</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sttProvider" className="block text-sm font-medium text-gray-700">
                Provider
              </label>
              <select
                id="sttProvider"
                value={formData.sttProvider}
                onChange={e => setFormData({ ...formData, sttProvider: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="deepgram">Deepgram</option>
                <option value="whisper">Whisper</option>
                <option value="google">Google</option>
              </select>
            </div>

            <div>
              <label htmlFor="sttModel" className="block text-sm font-medium text-gray-700">
                Model
              </label>
              <input
                type="text"
                id="sttModel"
                required
                value={formData.sttModel}
                onChange={e => setFormData({ ...formData, sttModel: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900">Text-to-Speech (TTS)</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="ttsProvider" className="block text-sm font-medium text-gray-700">
                Provider
              </label>
              <select
                id="ttsProvider"
                value={formData.ttsProvider}
                onChange={e => setFormData({ ...formData, ttsProvider: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="eleven_labs">Eleven Labs</option>
                <option value="google">Google</option>
                <option value="azure">Azure</option>
              </select>
            </div>

            <div>
              <label htmlFor="ttsVoiceId" className="block text-sm font-medium text-gray-700">
                Voice ID
              </label>
              <input
                type="text"
                id="ttsVoiceId"
                value={formData.ttsVoiceId}
                onChange={e => setFormData({ ...formData, ttsVoiceId: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="ttsModelId" className="block text-sm font-medium text-gray-700">
                Model ID
              </label>
              <input
                type="text"
                id="ttsModelId"
                value={formData.ttsModelId}
                onChange={e => setFormData({ ...formData, ttsModelId: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 border-t pt-6">
          <Link
            href="/agents"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !formData.agentId}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Agent'}
          </button>
        </div>
      </form>
    </div>
  )
}
