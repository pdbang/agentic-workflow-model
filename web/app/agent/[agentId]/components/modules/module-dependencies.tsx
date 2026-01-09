'use client'

import type { ModuleDependencies } from '@/types/module'

interface ModuleDependenciesProps {
  dependencies: ModuleDependencies
}

export function ModuleDependencies({ dependencies }: ModuleDependenciesProps) {
  const hasRequired = (dependencies.required?.length ?? 0) > 0
  const hasOptional = (dependencies.optional?.length ?? 0) > 0

  if (!hasRequired && !hasOptional) {
    return null
  }

  return (
    <section>
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Dependencies</h3>

      <div className="rounded-lg border border-gray-200 p-4">
        {hasRequired && (
          <div className="mb-3">
            <h4 className="mb-2 text-sm font-medium text-gray-700">Required</h4>
            <div className="flex flex-wrap gap-2">
              {dependencies.required!.map((dep) => (
                <span
                  key={dep}
                  className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-800"
                >
                  {dep}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasOptional && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700">Optional</h4>
            <div className="flex flex-wrap gap-2">
              {dependencies.optional!.map((dep) => (
                <span
                  key={dep}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800"
                >
                  {dep}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
