'use client'
import type { FC, PropsWithChildren } from 'react'
import * as React from 'react'

const Splash: FC<PropsWithChildren> = () => {
  // No authentication check needed for local storage mode
  return null
}
export default React.memo(Splash)
