'use client'

import { useState, useEffect } from 'react'

interface PronunciationsEditorProps {
  pronunciations: unknown
  onChange: (pronunciations: unknown) => void
}

export function PronunciationsEditor({ pronunciations, onChange }: PronunciationsEditorProps) {
  const [yaml, setYaml] = useState('')

  useEffect(() => {
    if (pronunciations) {
      setYaml(JSON.stringify(pronunciations, null, 2))
    }
  }, [pronunciations])

  const handleSave = () => {
    try {
      const parsed = JSON.parse(yaml)
      onChange(parsed)
      alert('Pronunciations saved')
    } catch (error) {
      alert('Invalid JSON format')
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Pronunciations</h2>
          <p className="text-sm text-gray-500">
            Phonetic mappings to correct TTS pronunciation
          </p>
        </div>
        <button
          onClick={handleSave}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Save Pronunciations
        </button>
      </div>

      <textarea
        value={yaml}
        onChange={(e) => setYaml(e.target.value)}
        rows={12}
        className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
        placeholder='Example: {"Mecaplanning": "Mékaplanning"}'
      />
    </section>
  )
}
