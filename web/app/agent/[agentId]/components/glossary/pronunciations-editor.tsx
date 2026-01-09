'use client'

import { useState } from 'react'
import Button from '@/app/components/base/button'

interface PronunciationsEditorProps {
  pronunciations: unknown
  onChange: (pronunciations: unknown) => void
}

export function PronunciationsEditor({ pronunciations, onChange }: PronunciationsEditorProps) {
  const [yaml, setYaml] = useState(
    pronunciations ? JSON.stringify(pronunciations, null, 2) : '',
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
          <h2 className="text-lg font-semibold text-gray-900">Pronunciations</h2>
          <p className="text-sm text-gray-500">
            Phonetic mappings to correct TTS pronunciation
          </p>
        </div>
        <Button onClick={handleSave}>Save Pronunciations</Button>
      </div>

      <textarea
        value={yaml}
        onChange={e => setYaml(e.target.value)}
        rows={12}
        className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
        placeholder='Example: {"Mecaplanning": "Mékaplanning"}'
      />
    </section>
  )
}
