'use client'

import { useState } from 'react'
import Button from '@/app/components/base/button'

type DefinitionsEditorProps = {
  definitions: unknown
  onChange: (definitions: unknown) => void
}

export function DefinitionsEditor({ definitions, onChange }: DefinitionsEditorProps) {
  // Simplification: édition JSON brute
  const [json, setJson] = useState(
    definitions ? JSON.stringify(definitions, null, 2) : '',
  )

  const handleSave = () => {
    try {
      const parsed = JSON.parse(json)
      onChange(parsed)
    }
    catch {
      console.error('Invalid JSON format')
    }
  }

  return (
    <section className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Definitions</h2>
          <p className="text-sm text-gray-500">
            Business terms and context for the LLM
          </p>
        </div>
        <Button variant="primary" onClick={handleSave}>
          Save Definitions
        </Button>
      </div>

      <textarea
        value={json}
        onChange={e => setJson(e.target.value)}
        rows={12}
        className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="Enter definitions in JSON format..."
      />
    </section>
  )
}
