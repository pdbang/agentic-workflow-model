'use client'

import type { AgentConfig } from '@/types/agent'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type AgentData = {
  id: string
  clientId: string
  version: string
  config: AgentConfig
  modulesInputs: Record<string, unknown>
  glossary: {
    definitions?: unknown
    pronunciations?: unknown
    transcriptions?: unknown
  }
  subAgents: Record<string, unknown>
}

export default function AgentDetailsPage({ params }: { params: Promise<{ agentId: string }> }) {
  const searchParams = useSearchParams()
  const [agentId, setAgentId] = useState<string>('')
  const [agent, setAgent] = useState<AgentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'config' | 'modules' | 'glossary' | 'subagents'>('config')

  const clientId = searchParams.get('clientId') || 'test_client'
  const version = searchParams.get('version') || 'latest'

  useEffect(() => {
    params.then((p) => {
      setAgentId(p.agentId)
    })
  }, [params])

  useEffect(() => {
    if (!agentId)
      return

    async function fetchAgent() {
      try {
        setLoading(true)
        const response = await fetch(`/api/agents/${agentId}?clientId=${clientId}&version=${version}`)
        if (!response.ok) {
          throw new Error('Échec du chargement de l\'agent')
        }
        const data = await response.json()
        setAgent(data)
      }
      catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      }
      finally {
        setLoading(false)
      }
    }

    fetchAgent()
  }, [agentId, clientId, version])

  const handleSave = async () => {
    if (!agent)
      return

    try {
      setSaving(true)
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          version,
          config: agent.config,
          modulesInputs: agent.modulesInputs,
          glossary: agent.glossary,
          subAgents: agent.subAgents,
        }),
      })

      if (!response.ok) {
        throw new Error('Échec de la sauvegarde')
      }

      setSaveMessage('Agent sauvegardé avec succès !')
      setTimeout(() => setSaveMessage(null), 3000)
    }
    catch (err) {
      setSaveMessage(err instanceof Error ? err.message : 'Erreur de sauvegarde')
      setTimeout(() => setSaveMessage(null), 3000)
    }
    finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    // eslint-disable-next-line no-alert
    const confirmed = typeof window !== 'undefined' && window.confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')
    if (!confirmed)
      return

    try {
      const response = await fetch(`/api/agents/${agentId}?clientId=${clientId}&version=${version}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Échec de la suppression')
      }

      window.location.href = '/agents'
    }
    catch (err) {
      setSaveMessage(err instanceof Error ? err.message : 'Erreur de suppression')
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const updateConfig = (updates: Partial<AgentConfig>) => {
    if (!agent)
      return
    setAgent({
      ...agent,
      config: {
        ...agent.config,
        ...updates,
      },
    })
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="mb-2 font-semibold text-red-800">Erreur</p>
          <p className="text-red-600">{error || 'Agent non trouvé'}</p>
          <Link href="/agents" className="mt-4 inline-block text-blue-600 hover:underline">
            Retour aux agents
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-8 py-4">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/agents"
            className="mb-2 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            ← Retour aux agents
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{agent.id}</h1>
              <p className="text-sm text-gray-600">
                {clientId}
                {' '}
                •
                {version}
              </p>
            </div>
            <div className="flex gap-3">
              {saveMessage && (
                <div className={`rounded-lg px-4 py-2 ${saveMessage.includes('succès') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {saveMessage}
                </div>
              )}
              <button
                onClick={handleDelete}
                className="rounded-lg border border-red-300 px-4 py-2 font-medium text-red-700 transition hover:bg-red-50"
              >
                Supprimer
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-white px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="flex gap-6">
            {[
              { id: 'config', label: 'Configuration' },
              { id: 'modules', label: 'Modules' },
              { id: 'glossary', label: 'Glossaire' },
              { id: 'subagents', label: 'Sub-Agents' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`border-b-2 px-1 py-4 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {activeTab === 'config' && (
            <ConfigTab agent={agent} updateConfig={updateConfig} />
          )}
          {activeTab === 'modules' && (
            <ModulesTab agent={agent} />
          )}
          {activeTab === 'glossary' && (
            <GlossaryTab agent={agent} />
          )}
          {activeTab === 'subagents' && (
            <SubAgentsTab agent={agent} />
          )}
        </div>
      </div>
    </div>
  )
}

// Configuration Tab Component
function ConfigTab({ agent, updateConfig }: { agent: AgentData, updateConfig: (updates: Partial<AgentConfig>) => void }) {
  return (
    <div className="space-y-8">
      {/* General Settings */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Paramètres généraux</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Langue</label>
            <select
              value={agent.config.language}
              onChange={e => updateConfig({ language: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="fr-FR">Français (France)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español (España)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Fuseau horaire</label>
            <select
              value={agent.config.timezone}
              onChange={e => updateConfig({ timezone: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Messages</h2>
        <div className="space-y-4">
          {Object.entries(agent.config.messages).map(([key, message]) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-medium capitalize text-gray-700">
                {key.replace(/_/g, ' ')}
              </label>
              <textarea
                value={message.texts?.[agent.config.language] || message.text || ''}
                onChange={(e) => {
                  const newMessages = { ...agent.config.messages }
                  if (newMessages[key]) {
                    newMessages[key] = {
                      ...newMessages[key],
                      texts: {
                        ...newMessages[key].texts,
                        [agent.config.language]: e.target.value,
                      },
                    }
                  }
                  updateConfig({ messages: newMessages })
                }}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Models */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Modèles IA</h2>

        {/* LLM */}
        <div className="mb-6">
          <h3 className="mb-3 font-medium text-gray-900">LLM</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Fournisseur</label>
              <input
                type="text"
                value={agent.config.models.llm.provider}
                onChange={e => updateConfig({
                  models: {
                    ...agent.config.models,
                    llm: { ...agent.config.models.llm, provider: e.target.value },
                  },
                })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Modèle</label>
              <input
                type="text"
                value={agent.config.models.llm.model || ''}
                onChange={e => updateConfig({
                  models: {
                    ...agent.config.models,
                    llm: { ...agent.config.models.llm, model: e.target.value },
                  },
                })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Température:
                {' '}
                {agent.config.models.llm.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={agent.config.models.llm.temperature || 0.7}
                onChange={e => updateConfig({
                  models: {
                    ...agent.config.models,
                    llm: { ...agent.config.models.llm, temperature: Number.parseFloat(e.target.value) },
                  },
                })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* STT */}
        <div className="mb-6">
          <h3 className="mb-3 font-medium text-gray-900">STT</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Fournisseur</label>
              <input
                type="text"
                value={agent.config.models.stt.provider}
                onChange={e => updateConfig({
                  models: {
                    ...agent.config.models,
                    stt: { ...agent.config.models.stt, provider: e.target.value },
                  },
                })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Modèle</label>
              <input
                type="text"
                value={agent.config.models.stt.model || ''}
                onChange={e => updateConfig({
                  models: {
                    ...agent.config.models,
                    stt: { ...agent.config.models.stt, model: e.target.value },
                  },
                })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* TTS */}
        <div>
          <h3 className="mb-3 font-medium text-gray-900">TTS</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Fournisseur</label>
              <input
                type="text"
                value={agent.config.models.tts.provider}
                onChange={e => updateConfig({
                  models: {
                    ...agent.config.models,
                    tts: { ...agent.config.models.tts, provider: e.target.value },
                  },
                })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Voice ID</label>
              <input
                type="text"
                value={agent.config.models.tts.voice_id || ''}
                onChange={e => updateConfig({
                  models: {
                    ...agent.config.models,
                    tts: { ...agent.config.models.tts, voice_id: e.target.value },
                  },
                })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modules Tab Component
function ModulesTab({ agent }: { agent: AgentData }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Modules configurés</h2>
      {agent.config.modules.length === 0
        ? (
            <p className="text-gray-600">Aucun module configuré</p>
          )
        : (
            <ul className="space-y-2">
              {agent.config.modules.map(module => (
                <li key={module} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="font-medium">{module}</span>
                  <span className="text-sm text-gray-600">Configuré</span>
                </li>
              ))}
            </ul>
          )}
    </div>
  )
}

// Glossary Tab Component
function GlossaryTab({ agent }: { agent: AgentData }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Glossaire</h2>
      <p className="text-gray-600">Définitions, prononciations et transcriptions personnalisées</p>
      <div className="mt-4 text-sm text-gray-500">
        <pre className="rounded bg-gray-100 p-4">{JSON.stringify(agent.glossary, null, 2)}</pre>
      </div>
    </div>
  )
}

// Sub-Agents Tab Component
function SubAgentsTab({ agent }: { agent: AgentData }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Sub-Agents</h2>
      {Object.keys(agent.subAgents).length === 0
        ? (
            <p className="text-gray-600">Aucun sub-agent configuré</p>
          )
        : (
            <ul className="space-y-2">
              {Object.keys(agent.subAgents).map(subAgent => (
                <li key={subAgent} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="font-medium">{subAgent}</span>
                  <span className="text-sm text-gray-600">Configuré</span>
                </li>
              ))}
            </ul>
          )}
    </div>
  )
}
