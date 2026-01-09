'use client'

import { useState, useEffect } from 'react'

interface DefinitionsEditorProps {
  definitions: unknown
  onChange: (definitions: unknown) => void
}

export function DefinitionsEditor({ definitions, onChange }: DefinitionsEditorProps) {
  const [yaml, setYaml] = useState('')

  useEffect(() => {
    if (definitions) {
      setYaml(JSON.stringify(definitions, null, 2))
    }
  }, [definitions])

  const handleSave = () => {
    try {
      const parsed = JSON.parse(yaml)
      onChange(parsed)
      alert('Definitions saved')
    } catch (error) {
      alert('Invalid JSON format')
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Definitions</h2>
          <p className="text-sm text-gray-500">
            Business terms and context for the LLM
          </p>
        </div>
        <button
          onClick={handleSave}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Save Definitions
        </button>
      </div>

      <textarea
        value={yaml}
        onChange={(e) => setYaml(e.target.value)}
        rows={12}
        className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
        placeholder="Enter definitions in JSON format..."
      />
    </section>
  )
}
