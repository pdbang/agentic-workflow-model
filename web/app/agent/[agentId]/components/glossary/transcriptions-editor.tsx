'use client'

import { useState, useEffect } from 'react'

interface TranscriptionsEditorProps {
  transcriptions: unknown
  onChange: (transcriptions: unknown) => void
}

export function TranscriptionsEditor({ transcriptions, onChange }: TranscriptionsEditorProps) {
  const [yaml, setYaml] = useState('')

  useEffect(() => {
    if (transcriptions) {
      setYaml(JSON.stringify(transcriptions, null, 2))
    }
  }, [transcriptions])

  const handleSave = () => {
    try {
      const parsed = JSON.parse(yaml)
      onChange(parsed)
      alert('Transcriptions saved')
    } catch (error) {
      alert('Invalid JSON format')
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
        <button
          onClick={handleSave}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Save Transcriptions
        </button>
      </div>

      <textarea
        value={yaml}
        onChange={(e) => setYaml(e.target.value)}
        rows={12}
        className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
        placeholder='Example: {"j\'ai": "G"} for letter G'
      />
    </section>
  )
}
