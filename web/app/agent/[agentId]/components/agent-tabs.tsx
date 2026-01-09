'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { name: 'Configuration', href: '/config', icon: '⚙️' },
  { name: 'Orchestration', href: '/canvas', icon: '🎨' },
  { name: 'Glossaire', href: '/glossary', icon: '📚' },
  { name: 'Modules', href: '/modules', icon: '📦' },
]

export function AgentTabs({ agentId }: { agentId: string }) {
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
              className={`
                flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium transition-colors
                ${isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }
              `}
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
