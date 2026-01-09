'use client'

import { useState } from 'react'
import { RiSaveLine, RiDownloadLine } from '@remixicon/react'
import Button from '@/app/components/base/button'
import { ToastContext } from '@/app/components/base/toast'
import { useContext } from 'use-context-selector'
import type { AgentData } from '@/types/agent'

interface AgentHeaderProps {
  agentId: string
  data: AgentData
  onSave: () => Promise<void>
}

export function AgentHeader({ agentId, data, onSave }: AgentHeaderProps) {
  const { notify } = useContext(ToastContext)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    try {
      setSaving(true)
      await onSave()
      notify({ type: 'success', message: 'Agent saved successfully' })
    } catch (error) {
      notify({ type: 'error', message: 'Failed to save agent' })
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    window.open(
      `/api/agents/${agentId}/export?clientId=default&format=yaml`,
      '_blank'
    )
  }

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{agentId}</h1>
        {data && (
          <p className="text-sm text-gray-500">
            Version: {data.config.version} | Language: {data.config.language}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={handleExport}
          disabled={!data}
        >
          <RiDownloadLine className="h-4 w-4" />
          Export YAML
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving || !data}
        >
          <RiSaveLine className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </header>
  )
}
