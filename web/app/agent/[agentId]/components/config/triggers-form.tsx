'use client'

interface TriggersFormProps {
  triggers?: {
    start_discussion?: unknown[]
    end_discussion?: unknown[]
  }
  onChange: (triggers: TriggersFormProps['triggers']) => void
}

export function TriggersForm({ triggers }: TriggersFormProps) {
  // TODO: Implémenter l'édition des triggers (ÉTAPE 6)
  // Pour l'instant, affichage simple

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Triggers</h2>
      <p className="text-sm text-gray-500">
        Trigger configuration will be implemented in Step 6 (Tools & Hooks)
      </p>

      <div className="mt-4 space-y-2">
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900">Start Discussion</h3>
          <p className="mt-1 text-sm text-gray-500">
            {triggers?.start_discussion?.length ?? 0}
            {' '}
            hook(s) configured
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900">End Discussion</h3>
          <p className="mt-1 text-sm text-gray-500">
            {triggers?.end_discussion?.length ?? 0}
            {' '}
            hook(s) configured
          </p>
        </div>
      </div>
    </section>
  )
}
