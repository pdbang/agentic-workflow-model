'use client'

import { useState, useEffect } from 'react'
import Button from '@/app/components/base/button'
import { load as yamlLoad, dump as yamlDump } from 'js-yaml'

interface PronunciationsEditorProps {
  pronunciations?: Record<string, string>
  onChange: (pronunciations: Record<string, string>) => void
}

export function PronunciationsEditor({ pronunciations, onChange }: PronunciationsEditorProps) {
  const [yamlContent, setYamlContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (pronunciations) {
      try {
        setYamlContent(yamlDump(pronunciations, { indent: 2, lineWidth: -1 }))
      } catch {
        setYamlContent(JSON.stringify(pronunciations, null, 2))
      }
    }
  }, [pronunciations])

  const handleSave = () => {
    try {
      const parsed = yamlLoad(yamlContent) as Record<string, string>
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Pronunciations must be an object')
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
          <h2 className="text-lg font-semibold text-gray-900">Pronunciations</h2>
          <p className="text-sm text-gray-500">
            Phonetic mappings to correct TTS pronunciation
          </p>
        </div>
        <Button onClick={handleSave}>Save Pronunciations</Button>
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
        placeholder='Example: Mecaplanning: "Mékaplanning"'
      />
    </section>
  )
}
