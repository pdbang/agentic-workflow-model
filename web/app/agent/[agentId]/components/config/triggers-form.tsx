'use client'

type TriggersFormProps = {
  triggers?: {
    start_discussion?: unknown[]
    end_discussion?: unknown[]
  }
  onChange: (_triggers: TriggersFormProps['triggers']) => void
}

export function TriggersForm({ triggers }: TriggersFormProps) {
  // Trigger configuration will be implemented in Step 6

  return (
    <section className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Triggers</h2>
      <p className="mb-4 text-sm text-gray-500">
        Trigger configuration will be implemented in Step 6 (Tools & Hooks)
      </p>

      <div className="space-y-2">
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
