'use client'

import { useState } from 'react'
import type { Message } from '@/types/agent'

interface MessagesFormProps {
  messages: Record<string, Message>
  onChange: (messages: Record<string, Message>) => void
}

export function MessagesForm({ messages, onChange }: MessagesFormProps) {
  const [newMessageKey, setNewMessageKey] = useState('')

  const handleUpdateMessage = (key: string, field: 'text' | 'audio' | 'texts', value: string | Record<string, string>) => {
    onChange({
      ...messages,
      [key]: {
        ...messages[key],
        [field]: value,
      },
    })
  }

  const handleAddMessage = () => {
    if (newMessageKey && !messages[newMessageKey]) {
      onChange({
        ...messages,
        [newMessageKey]: { text: '' },
      })
      setNewMessageKey('')
    }
  }

  const handleRemoveMessage = (key: string) => {
    const { [key]: _, ...rest } = messages
    onChange(rest)
  }

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Messages</h2>

      <div className="space-y-4">
        {Object.entries(messages).map(([key, message]) => (
          <div key={key} className="rounded-lg border border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium text-gray-900">{key}</h3>
              <button
                onClick={() => handleRemoveMessage(key)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Text
                </label>
                <textarea
                  value={message.text ?? ''}
                  onChange={(e) => handleUpdateMessage(key, 'text', e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Audio Path (optional)
                </label>
                <input
                  type="text"
                  value={message.audio ?? ''}
                  onChange={(e) => handleUpdateMessage(key, 'audio', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="audios/welcome.mp3"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <input
            type="text"
            value={newMessageKey}
            onChange={(e) => setNewMessageKey(e.target.value)}
            placeholder="New message key (e.g., welcome)"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2"
            onKeyDown={(e) => e.key === 'Enter' && handleAddMessage()}
          />
          <button
            onClick={handleAddMessage}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Add Message
          </button>
        </div>
      </div>
    </section>
  )
}
