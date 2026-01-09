'use client'

import type { MemoryVariable } from '@/types/module'

interface ModuleMemoryProps {
  memory: Record<string, MemoryVariable>
}

export function ModuleMemory({ memory }: ModuleMemoryProps) {
  const variables = Object.entries(memory)

  if (variables.length === 0) {
    return null
  }

  return (
    <section>
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Memory Variables</h3>
      <p className="mb-4 text-sm text-gray-500">
        These variables are managed by this module and persisted according to their scopes.
      </p>

      <div className="space-y-2">
        {variables.map(([key, variable]) => (
          <div
            key={key}
            className="rounded-lg border border-gray-200 p-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{variable.title}</h4>
                <p className="mt-1 text-sm text-gray-500">{variable.description}</p>
                <div className="mt-2 flex gap-2">
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                    {variable.type}
                  </span>
                  {variable.scopes.session && (
                    <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                      session
                    </span>
                  )}
                  {variable.scopes.user && (
                    <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                      user
                    </span>
                  )}
                  {variable.scopes.shared && (
                    <span className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-700">
                      shared
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
