'use client'

import { use } from 'react'
import { useAgent } from '@/hooks/use-agent'
import Button from '@/app/components/base/button'

export function AgentHeader({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const { data, saving, save } = useAgent('test_client', agentId)

  const handleSave = async () => {
    try {
      await save()
      // TODO: Toast success
    }
    catch (error) {
      // TODO: Toast error
      console.error('Save failed:', error)
    }
  }

  const handleExport = async () => {
    window.open(
      `/api/agents/${agentId}/export?clientId=test_client&format=yaml`,
      '_blank',
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
          Export YAML
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving || !data}
          loading={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </header>
  )
}
