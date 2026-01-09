'use client'

import { useState } from 'react'
import Button from '@/app/components/base/button'

interface DefinitionsEditorProps {
  definitions: unknown
  onChange: (definitions: unknown) => void
}

export function DefinitionsEditor({ definitions, onChange }: DefinitionsEditorProps) {
  // Simplification: édition YAML brute
  const [yaml, setYaml] = useState(
    definitions ? JSON.stringify(definitions, null, 2) : '',
  )

  const handleSave = () => {
    try {
      const parsed = JSON.parse(yaml)
      onChange(parsed)
    }
    catch (error) {
      alert('Invalid YAML/JSON')
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
        <Button onClick={handleSave}>Save Definitions</Button>
      </div>

      <textarea
        value={yaml}
        onChange={e => setYaml(e.target.value)}
        rows={12}
        className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
        placeholder="Enter definitions in JSON format..."
      />
    </section>
  )
}
