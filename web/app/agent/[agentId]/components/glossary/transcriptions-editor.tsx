'use client'

import { useState } from 'react'
import Button from '@/app/components/base/button'

type TranscriptionsEditorProps = {
  transcriptions: unknown
  onChange: (transcriptions: unknown) => void
}

export function TranscriptionsEditor({ transcriptions, onChange }: TranscriptionsEditorProps) {
  const [json, setJson] = useState(
    transcriptions ? JSON.stringify(transcriptions, null, 2) : '',
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
          <h2 className="text-lg font-semibold text-gray-900">Transcriptions</h2>
          <p className="text-sm text-gray-500">
            Hints for STT to correct common transcription errors
          </p>
        </div>
        <Button variant="primary" onClick={handleSave}>
          Save Transcriptions
        </Button>
      </div>

      <textarea
        value={json}
        onChange={e => setJson(e.target.value)}
        rows={12}
        className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder={'Example: {"j\'ai": "G"} for letter G'}
      />
    </section>
  )
}
