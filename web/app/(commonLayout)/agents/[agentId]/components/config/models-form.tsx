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
    value: string | number
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
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Models</h2>

      <div className="space-y-6">
        {/* LLM */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">LLM Model</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeout (seconds)
              </label>
              <input
                type="number"
                value={models.llm.timeout ?? 30}
                onChange={(e) => handleUpdateModel('llm', 'timeout', parseInt(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* STT */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">STT Model</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">TTS Model</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
