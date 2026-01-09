'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AgentConfig } from '@/types/agent'
import type { SubAgentConfig } from '@/types/sub-agent'

interface AgentData {
  config: AgentConfig
  modulesInputs: Record<string, unknown>
  subAgents: Record<string, SubAgentConfig>
  glossary: {
    definitions?: unknown
    pronunciations?: unknown
    transcriptions?: unknown
  }
}

export function useAgent(clientId: string, agentId: string, version: string = 'latest') {
  const [data, setData] = useState<AgentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Charger l'agent
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/agents/${agentId}?clientId=${clientId}&version=${version}`,
      )

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
  }, [clientId, agentId, version])

  // Sauvegarder l'agent
  const save = useCallback(async (updatedData?: Partial<AgentData>) => {
    if (!data)
      return

    setSaving(true)
    setError(null)

    try {
      const dataToSave = updatedData ? { ...data, ...updatedData } : data

      const response = await fetch(
        `/api/agents/${agentId}?clientId=${clientId}&version=${version}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave),
        },
      )

      if (!response.ok)
        throw new Error('Failed to save agent')

      setData(dataToSave)
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
    finally {
      setSaving(false)
    }
  }, [clientId, agentId, version, data])

  // Mettre à jour une partie des données
  const updateConfig = useCallback((updates: Partial<AgentConfig>) => {
    setData(prev => prev ? { ...prev, config: { ...prev.config, ...updates } } : null)
  }, [])

  const updateModulesInputs = useCallback((moduleId: string, inputs: unknown) => {
    setData(prev => prev
      ? {
          ...prev,
          modulesInputs: { ...prev.modulesInputs, [moduleId]: inputs },
        }
      : null)
  }, [])

  const updateSubAgents = useCallback((subAgents: Record<string, SubAgentConfig>) => {
    setData(prev => prev ? { ...prev, subAgents } : null)
  }, [])

  const updateGlossary = useCallback((glossary: AgentData['glossary']) => {
    setData(prev => prev ? { ...prev, glossary } : null)
  }, [])

  // Charger au montage
  useEffect(() => {
    load()
  }, [load])

  return {
    data,
    loading,
    saving,
    error,
    load,
    save,
    updateConfig,
    updateModulesInputs,
    updateSubAgents,
    updateGlossary,
  }
}
