'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewAgentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    clientId: 'test_client',
    agentId: '',
    name: '',
    language: 'fr-FR',
    timezone: 'Europe/Paris',
    llmProvider: 'openai',
    llmModel: 'gpt-4',
    llmTemperature: 0.7,
    sttProvider: 'deepgram',
    sttModel: 'nova-3',
    ttsProvider: 'eleven_labs',
    ttsVoiceId: '',
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
          },
        },
      }

      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: formData.clientId,
          agentId: formData.agentId,
          config,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Échec de la création de l\'agent')
      }

      // Redirect to agent details page
      router.push(`/agents/${formData.agentId}?clientId=${formData.clientId}`)
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/agents"
            className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            ← Retour aux agents
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Créer un nouvel agent</h1>
          <p className="mt-1 text-gray-600">
            Configurez les paramètres de base de votre agent
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-8 shadow">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Basic Info */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Informations de base</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  ID de l'agent *
                </label>
                <input
                  type="text"
                  required
                  value={formData.agentId}
                  onChange={e => setFormData({ ...formData, agentId: e.target.value })}
                  placeholder="ex: agent_001"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Identifiant unique de l'agent (sans espaces)
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Client
                </label>
                <input
                  type="text"
                  value={formData.clientId}
                  onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Langue
                  </label>
                  <select
                    value={formData.language}
                    onChange={e => setFormData({ ...formData, language: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="fr-FR">Français (France)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español (España)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Fuseau horaire
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* LLM Configuration */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Modèle de langage (LLM)</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Fournisseur
                  </label>
                  <select
                    value={formData.llmProvider}
                    onChange={e => setFormData({ ...formData, llmProvider: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="mistral">Mistral</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Modèle
                  </label>
                  <input
                    type="text"
                    value={formData.llmModel}
                    onChange={e => setFormData({ ...formData, llmModel: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Température:
                  {' '}
                  {formData.llmTemperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.llmTemperature}
                  onChange={e => setFormData({ ...formData, llmTemperature: Number.parseFloat(e.target.value) })}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Plus élevé = plus créatif, plus bas = plus déterministe
                </p>
              </div>
            </div>
          </div>

          {/* STT Configuration */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Speech-to-Text (STT)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Fournisseur
                </label>
                <select
                  value={formData.sttProvider}
                  onChange={e => setFormData({ ...formData, sttProvider: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="deepgram">Deepgram</option>
                  <option value="whisper">Whisper</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Modèle
                </label>
                <input
                  type="text"
                  value={formData.sttModel}
                  onChange={e => setFormData({ ...formData, sttModel: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* TTS Configuration */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Text-to-Speech (TTS)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Fournisseur
                </label>
                <select
                  value={formData.ttsProvider}
                  onChange={e => setFormData({ ...formData, ttsProvider: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="eleven_labs">ElevenLabs</option>
                  <option value="google">Google</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Voice ID
                </label>
                <input
                  type="text"
                  value={formData.ttsVoiceId}
                  onChange={e => setFormData({ ...formData, ttsVoiceId: e.target.value })}
                  placeholder="ex: 21m00Tcm4TlvDq8ikWAM"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 border-t pt-6">
            <Link
              href="/agents"
              className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer l\'agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
