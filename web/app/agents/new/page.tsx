import { Suspense } from 'react'
import { NewAgentForm } from './components/NewAgentForm'

export default function NewAgentPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <Suspense fallback={<div>Loading...</div>}>
          <NewAgentForm />
        </Suspense>
      </div>
    </div>
  )
}
