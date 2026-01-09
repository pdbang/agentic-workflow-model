'use client'

interface CanvasToolbarProps {
  onAddSubAgent: () => void
}

export function CanvasToolbar({ onAddSubAgent }: CanvasToolbarProps) {
  return (
    <div className="absolute left-4 top-4 z-10 flex gap-2">
      <button
        onClick={onAddSubAgent}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        + Add Sub-Agent
      </button>
    </div>
  )
}
