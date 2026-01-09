'use client'
import Link from 'next/link'
import { useCallback } from 'react'
import DifyLogo from '@/app/components/base/logo/dify-logo'
import { useGlobalPublicStore } from '@/context/global-public-context'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'
import AppNav from './app-nav'
import EnvNav from './env-nav'
import LicenseNav from './license-env'
import PlanBadge from './plan-badge'
import PluginsNav from './plugins-nav'
import ToolsNav from './tools-nav'

const navClassName = `
  flex items-center relative px-3 h-8 rounded-xl
  font-medium text-sm
  cursor-pointer
`

const Header = () => {
  const media = useBreakpoints()
  const isMobile = media === MediaType.mobile
  const systemFeatures = useGlobalPublicStore(s => s.systemFeatures)
  const isBrandingEnabled = systemFeatures.branding.enabled

  const renderLogo = () => (
    <h1>
      <Link href="/apps" className="flex h-8 shrink-0 items-center justify-center overflow-hidden whitespace-nowrap px-0.5 indent-[-9999px]">
        {isBrandingEnabled && systemFeatures.branding.application_title ? systemFeatures.branding.application_title : 'Dify'}
        {systemFeatures.branding.enabled && systemFeatures.branding.workspace_logo
          ? (
              <img
                src={systemFeatures.branding.workspace_logo}
                className="block h-[22px] w-auto object-contain"
                alt="logo"
              />
            )
          : <DifyLogo />}
      </Link>
    </h1>
  )

  if (isMobile) {
    return (
      <div className="">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center">
            {renderLogo()}
          </div>
          <div className="flex items-center">
            <div className="mr-2">
              <PluginsNav />
            </div>
          </div>
        </div>
        <div className="my-1 flex items-center justify-center space-x-1">
          <AppNav />
          <ToolsNav className={navClassName} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[56px] items-center">
      <div className="flex min-w-0 flex-[1]  items-center pl-3 pr-2 min-[1280px]:pr-3">
        {renderLogo()}
      </div>
      <div className="flex items-center space-x-2">
        <AppNav />
        <ToolsNav className={navClassName} />
      </div>
      <div className="flex min-w-0 flex-[1] items-center justify-end pl-2 pr-3 min-[1280px]:pl-3">
        <EnvNav />
        <div className="mr-2">
          <PluginsNav />
        </div>
      </div>
    </div>
  )
}
export default Header
