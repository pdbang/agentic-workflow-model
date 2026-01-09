'use client'

import { usePathname } from 'next/navigation'
import {
  RiSettings3Line,
  RiSettings3Fill,
  RiFlowChartLine,
  RiFlowChartFill,
  RiBookOpenLine,
  RiBookOpenFill,
  RiAddBoxLine,
  RiAddBoxFill,
  RiFolderLine,
  RiFolderFill,
} from '@remixicon/react'
import { useAgent } from '@/lib/hooks/use-agent'
import NavLink from '@/app/components/app-sidebar/navLink'

interface AgentSidebarProps {
  agentId: string
}

const baseTabs = [
  {
    name: 'Configuration',
    href: '/config',
    icon: RiSettings3Line,
    selectedIcon: RiSettings3Fill,
  },
  {
    name: 'Orchestration',
    href: '/canvas',
    icon: RiFlowChartLine,
    selectedIcon: RiFlowChartFill,
  },
  {
    name: 'Glossaire',
    href: '/glossary',
    icon: RiBookOpenLine,
    selectedIcon: RiBookOpenFill,
  },
  {
    name: 'Ajouter un module',
    href: '/modules/add',
    icon: RiAddBoxLine,
    selectedIcon: RiAddBoxFill,
  },
]

export function AgentSidebar({ agentId }: AgentSidebarProps) {
  const pathname = usePathname()
  const { data } = useAgent(agentId, { autoLoad: true })

  // Generate dynamic module tabs
  const moduleTabs = (data?.config.modules || []).map((moduleName) => ({
    name: moduleName,
    href: `/modules/${moduleName}`,
    icon: RiFolderLine,
    selectedIcon: RiFolderFill,
  }))

  const allTabs = [...baseTabs, ...moduleTabs]

  return (
    <div className="flex w-64 shrink-0 flex-col border-r border-divider-burn bg-background-default-subtle">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 truncate" title={agentId}>
          {agentId}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <nav className="flex flex-col gap-y-0.5">
          {allTabs.map((tab) => {
            const href = `/agents/${agentId}${tab.href}`
            const isActive = pathname?.startsWith(href)

            return (
              <NavLink
                key={tab.name}
                name={tab.name}
                href={href}
                iconMap={{
                  selected: tab.selectedIcon,
                  normal: tab.icon,
                }}
                mode="expand"
              />
            )
          })}
        </nav>
      </div>
    </div>
  )
}
