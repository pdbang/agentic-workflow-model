import { Suspense } from 'react'
import { AgentsList } from './components/AgentsList'

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agent Configuration</h1>
          <p className="mt-2 text-gray-600">
            Manage your AI agents, modules, and configurations
          </p>
        </div>

        <Suspense fallback={<div>Loading agents...</div>}>
          <AgentsList />
        </Suspense>
      </div>
    </div>
  )
}
