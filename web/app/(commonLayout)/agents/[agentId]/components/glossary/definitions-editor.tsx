'use client'

import { useState, useEffect } from 'react'
import Button from '@/app/components/base/button'
import { load as yamlLoad, dump as yamlDump } from 'js-yaml'

interface DefinitionsEditorProps {
  definitions?: Record<string, unknown>
  onChange: (definitions: Record<string, unknown>) => void
}

export function DefinitionsEditor({ definitions, onChange }: DefinitionsEditorProps) {
  const [yamlContent, setYamlContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (definitions) {
      try {
        setYamlContent(yamlDump(definitions, { indent: 2, lineWidth: -1 }))
      } catch {
        setYamlContent(JSON.stringify(definitions, null, 2))
      }
    }
  }, [definitions])

  const handleSave = () => {
    try {
      const parsed = yamlLoad(yamlContent) as Record<string, unknown>
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Definitions must be an object')
      }
      onChange(parsed)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid YAML')
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Definitions</h2>
          <p className="text-sm text-gray-500">
            Business terms and context for the LLM
          </p>
        </div>
        <Button onClick={handleSave}>Save Definitions</Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <textarea
        value={yamlContent}
        onChange={(e) => setYamlContent(e.target.value)}
        rows={12}
        className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
        placeholder="Enter definitions in YAML format..."
      />
    </section>
  )
}
