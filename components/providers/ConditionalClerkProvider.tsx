'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { ReactNode } from 'react'

interface ConditionalClerkProviderProps {
  children: ReactNode
}

export function ConditionalClerkProvider({ children }: ConditionalClerkProviderProps) {
  // Check if we're in build mode or have invalid keys
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const isBuildTime = typeof window === 'undefined' && process.env.NODE_ENV === 'production'
  const hasValidKey = publishableKey && 
    !publishableKey.includes('your_publishable_key_here') && 
    !publishableKey.includes('mock_key') &&
    !publishableKey.includes('placeholder')

  // During build time with invalid keys, just return children without Clerk
  if (isBuildTime && !hasValidKey) {
    return <>{children}</>
  }

  // Otherwise, wrap with ClerkProvider
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  )
}