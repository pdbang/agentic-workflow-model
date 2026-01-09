'use client'

import type { ModelConfig } from '@/types/agent'

interface ModelsFormProps {
  models: {
    llm: ModelConfig
    stt: ModelConfig
    tts: ModelConfig
  }
  onChange: (models: ModelsFormProps['models']) => void
}

export function ModelsForm({ models, onChange }: ModelsFormProps) {
  const handleUpdateModel = (
    type: 'llm' | 'stt' | 'tts',
    field: keyof ModelConfig,
    value: string | number | undefined
  ) => {
    onChange({
      ...models,
      [type]: {
        ...models[type],
        [field]: value,
      },
    })
  }

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Models</h2>

      <div className="space-y-6">
        {/* LLM */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-3 font-medium text-gray-900">LLM Model</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Provider
              </label>
              <input
                type="text"
                value={models.llm.provider}
                onChange={(e) => handleUpdateModel('llm', 'provider', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Model
              </label>
              <input
                type="text"
                value={models.llm.model ?? ''}
                onChange={(e) => handleUpdateModel('llm', 'model', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Temperature
              </label>
              <input
                type="number"
                step="0.1"
                value={models.llm.temperature ?? 0.7}
                onChange={(e) => handleUpdateModel('llm', 'temperature', parseFloat(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* STT */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-3 font-medium text-gray-900">STT Model</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Provider
              </label>
              <input
                type="text"
                value={models.stt.provider}
                onChange={(e) => handleUpdateModel('stt', 'provider', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Model
              </label>
              <input
                type="text"
                value={models.stt.model ?? ''}
                onChange={(e) => handleUpdateModel('stt', 'model', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* TTS */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-3 font-medium text-gray-900">TTS Model</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Provider
              </label>
              <input
                type="text"
                value={models.tts.provider}
                onChange={(e) => handleUpdateModel('tts', 'provider', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Voice ID
              </label>
              <input
                type="text"
                value={models.tts.voice_id ?? ''}
                onChange={(e) => handleUpdateModel('tts', 'voice_id', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Model ID
              </label>
              <input
                type="text"
                value={models.tts.model_id ?? ''}
                onChange={(e) => handleUpdateModel('tts', 'model_id', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
