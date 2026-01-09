'use client'

import type { SubAgentTool } from '@/types/sub-agent'

interface ToolsPanelProps {
  tools: Record<string, unknown>
  modules: string[]
  onChange: (tools: Record<string, unknown>) => void
}

export function ToolsPanel({ tools, modules, onChange }: ToolsPanelProps) {
  // TODO: Implémenter dans ÉTAPE 6
  return (
    <div className="text-sm text-gray-500">
      <p>Tools configuration will be implemented in Step 6.</p>
      <p className="mt-2">Currently configured: {Object.keys(tools).length} tools</p>
    </div>
  )
}
