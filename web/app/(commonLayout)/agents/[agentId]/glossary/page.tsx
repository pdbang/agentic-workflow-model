'use client'

import { use } from 'react'
import { useAgent } from '@/lib/hooks/use-agent'
import Loading from '@/app/components/base/loading'
import { DefinitionsEditor } from '../components/glossary/definitions-editor'
import { PronunciationsEditor } from '../components/glossary/pronunciations-editor'
import { TranscriptionsEditor } from '../components/glossary/transcriptions-editor'
import { AgentHeader } from '../components/agent-header'

export default function GlossaryPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const { data, loading, updateGlossary, save } = useAgent(agentId)

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Agent not found</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <AgentHeader agentId={agentId} data={data} onSave={save} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="prose max-w-none">
            <p className="text-gray-600">
              The glossary helps improve conversation quality by providing context to the LLM,
              correcting pronunciation, and improving transcription accuracy.
            </p>
          </div>

          <DefinitionsEditor
            definitions={data.glossary.definitions}
            onChange={(definitions) => updateGlossary({ ...data.glossary, definitions })}
          />

          <PronunciationsEditor
            pronunciations={data.glossary.pronunciations}
            onChange={(pronunciations) => updateGlossary({ ...data.glossary, pronunciations })}
          />

          <TranscriptionsEditor
            transcriptions={data.glossary.transcriptions}
            onChange={(transcriptions) => updateGlossary({ ...data.glossary, transcriptions })}
          />
        </div>
      </div>
    </div>
  )
}
