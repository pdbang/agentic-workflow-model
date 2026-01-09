'use client'

import { useState } from 'react'
import Button from '@/app/components/base/button'

interface TranscriptionsEditorProps {
  transcriptions: unknown
  onChange: (transcriptions: unknown) => void
}

export function TranscriptionsEditor({ transcriptions, onChange }: TranscriptionsEditorProps) {
  const [yaml, setYaml] = useState(
    transcriptions ? JSON.stringify(transcriptions, null, 2) : '',
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
          <h2 className="text-lg font-semibold text-gray-900">Transcriptions</h2>
          <p className="text-sm text-gray-500">
            Hints for STT to correct common transcription errors
          </p>
        </div>
        <Button onClick={handleSave}>Save Transcriptions</Button>
      </div>

      <textarea
        value={yaml}
        onChange={e => setYaml(e.target.value)}
        rows={12}
        className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
        placeholder='Example: {"j\'ai": "G"} for letter G'
      />
    </section>
  )
}
