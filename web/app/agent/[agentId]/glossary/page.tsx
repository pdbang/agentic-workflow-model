'use client'

import { use } from 'react'
import { useAgent } from '@/lib/hooks/use-agent'
import { DefinitionsEditor } from '../components/glossary/definitions-editor'
import { PronunciationsEditor } from '../components/glossary/pronunciations-editor'
import { TranscriptionsEditor } from '../components/glossary/transcriptions-editor'

export default function GlossaryPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const { data, loading, updateGlossary } = useAgent('default', agentId)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-500">Loading glossary...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-red-500">Agent not found</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          The glossary helps improve conversation quality by providing context to the LLM,
          correcting pronunciation, and improving transcription accuracy.
        </p>
      </div>

      <DefinitionsEditor
        definitions={data.glossary.definitions}
        onChange={definitions => updateGlossary({ ...data.glossary, definitions })}
      />

      <PronunciationsEditor
        pronunciations={data.glossary.pronunciations}
        onChange={pronunciations => updateGlossary({ ...data.glossary, pronunciations })}
      />

      <TranscriptionsEditor
        transcriptions={data.glossary.transcriptions}
        onChange={transcriptions => updateGlossary({ ...data.glossary, transcriptions })}
      />
    </div>
  )
}
