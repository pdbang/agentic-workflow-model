'use client'

import type { Hook } from '@/types/agent'

interface TriggersFormProps {
  triggers?: {
    start_discussion?: Hook[]
    end_discussion?: Hook[]
  }
  onChange: (triggers: TriggersFormProps['triggers']) => void
}

export function TriggersForm({ triggers, onChange }: TriggersFormProps) {
  // TODO: Implémenter l'édition complète des triggers (ÉTAPE 6)
  // Pour l'instant, affichage simple

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Triggers</h2>
      <p className="text-sm text-gray-500 mb-4">
        Trigger configuration will be fully implemented in Step 6 (Tools & Hooks).
        For now, triggers are configured in the Orchestration canvas.
      </p>

      <div className="space-y-2">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900">Start Discussion</h3>
          <p className="text-sm text-gray-500 mt-1">
            {triggers?.start_discussion?.length ?? 0} hook(s) configured
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900">End Discussion</h3>
          <p className="text-sm text-gray-500 mt-1">
            {triggers?.end_discussion?.length ?? 0} hook(s) configured
          </p>
        </div>
      </div>
    </section>
  )
}
