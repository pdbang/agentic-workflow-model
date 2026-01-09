'use client'

import { use } from 'react'
import { useAgent } from '@/hooks/use-agent'
import { DefinitionsEditor } from '../components/glossary/definitions-editor'
import { PronunciationsEditor } from '../components/glossary/pronunciations-editor'
import { TranscriptionsEditor } from '../components/glossary/transcriptions-editor'

export default function GlossaryPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const { data, loading, updateGlossary } = useAgent('test_client', agentId)

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (!data) {
    return <div className="p-6">Agent not found</div>
  }

  return (
    <div className="space-y-8 p-6">
      <div className="prose max-w-none">
        <p className="text-gray-600">
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
