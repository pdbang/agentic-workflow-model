'use client'

import { useAgent } from '@/lib/hooks/use-agent'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AgentHeader({ agentId }: { agentId: string }) {
  const router = useRouter()
  const { data, saving, save } = useAgent('default', agentId)
  const [showExportDialog, setShowExportDialog] = useState(false)

  const handleSave = async () => {
    try {
      await save()
      // TODO: Toast success
      alert('Agent saved successfully')
    } catch (error) {
      // TODO: Toast error
      alert('Failed to save agent')
    }
  }

  const handleExport = async (format: 'yaml' | 'json') => {
    window.open(
      `/api/agents/${agentId}/export?clientId=default&format=${format}`,
      '_blank'
    )
    setShowExportDialog(false)
  }

  const handleVersions = () => {
    router.push(`/agent/${agentId}/versions`)
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
        <button
          onClick={handleVersions}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Versions
        </button>
        <button
          onClick={() => setShowExportDialog(true)}
          disabled={!data}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Export
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !data}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {showExportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Export Agent</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('yaml')}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Export YAML
              </button>
              <button
                onClick={() => handleExport('json')}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Export JSON
              </button>
              <button
                onClick={() => setShowExportDialog(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
