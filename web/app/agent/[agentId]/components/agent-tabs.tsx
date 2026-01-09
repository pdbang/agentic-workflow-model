'use client'

import { use } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/classnames'

const tabs = [
  { name: 'Configuration', href: '/config', icon: '⚙️' },
  { name: 'Glossary', href: '/glossary', icon: '📚' },
  { name: 'Modules', href: '/modules', icon: '📦' },
  { name: 'Canvas', href: '/canvas', icon: '🎨' },
]

export function AgentTabs({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const pathname = usePathname()

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const href = `/agent/${agentId}${tab.href}`
          const isActive = pathname?.startsWith(href)

          return (
            <Link
              key={tab.name}
              href={href}
              className={cn(
                'flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium',
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
              )}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
