'use client'

import Button from '@/app/components/base/button'
import { RiAddLine } from '@remixicon/react'

interface CanvasToolbarProps {
  onAddSubAgent: () => void
  modules: string[]
}

export function CanvasToolbar({ onAddSubAgent, modules }: CanvasToolbarProps) {
  return (
    <div className="absolute top-4 left-4 z-10 flex gap-2">
      <Button
        variant="primary"
        onClick={onAddSubAgent}
        className="flex items-center gap-2"
      >
        <RiAddLine className="h-4 w-4" />
        Add Sub-Agent
      </Button>
      {/* TODO: Add buttons for adding tools and hooks based on available modules */}
    </div>
  )
}
