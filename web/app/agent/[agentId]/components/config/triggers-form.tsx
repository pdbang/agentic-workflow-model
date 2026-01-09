'use client'

import { useState, useEffect } from 'react'

interface TriggersFormProps {
  triggers?: {
    start_discussion?: unknown[]
    end_discussion?: unknown[]
  }
  onChange: (triggers: TriggersFormProps['triggers']) => void
}

export function TriggersForm({ triggers, onChange }: TriggersFormProps) {
  const [startJson, setStartJson] = useState('')
  const [endJson, setEndJson] = useState('')

  useEffect(() => {
    setStartJson(JSON.stringify(triggers?.start_discussion || [], null, 2))
    setEndJson(JSON.stringify(triggers?.end_discussion || [], null, 2))
  }, [triggers])

  const handleSave = (type: 'start' | 'end', json: string) => {
    try {
      const parsed = JSON.parse(json)
      onChange({
        ...triggers,
        [`${type}_discussion`]: parsed,
      })
      alert(`${type === 'start' ? 'Start' : 'End'} discussion triggers saved`)
    } catch (error) {
      alert('Invalid JSON format')
    }
  }

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Triggers</h2>

      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Start Discussion</h3>
            <button
              onClick={() => handleSave('start', startJson)}
              className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
          <textarea
            value={startJson}
            onChange={(e) => setStartJson(e.target.value)}
            rows={8}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
            placeholder='[{"action": "tool", "target_tool": {"module": "base_auto", "path": "tools/initialize_session"}}]'
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">End Discussion</h3>
            <button
              onClick={() => handleSave('end', endJson)}
              className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
          <textarea
            value={endJson}
            onChange={(e) => setEndJson(e.target.value)}
            rows={8}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
            placeholder='[{"action": "tool", "target_tool": {"module": "base_auto", "path": "tools/finalize_session"}}]'
          />
        </div>
      </div>
    </section>
  )
}
