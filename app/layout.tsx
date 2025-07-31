import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ConditionalClerkProvider } from '@/components/providers/ConditionalClerkProvider'
import { Web3Provider } from '@/components/providers/Web3Provider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ToastProvider } from '@/components/ui/toast'
import { getEnvironmentConfig } from '@/lib/env-validation'
import './globals.css'

// Validate environment variables at application startup
try {
  getEnvironmentConfig()
} catch (error) {
  console.error('❌ Application startup failed due to environment validation errors')
  if (process.env.NODE_ENV === 'development') {
    console.error('Please check your .env.local file and ensure all required variables are set')
  }
  // In production, you might want to handle this differently
  // For now, we'll let the application continue but log the error
}

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Mantle Tip Jar - Gasless Crypto Tipping',
    template: '%s | Mantle Tip Jar'
  },
  description: 'Enable gasless cryptocurrency tipping for your content with Mantle Tip Jar. Zero gas fees for fans, instant withdrawals for creators.',
  keywords: ['crypto', 'tipping', 'mantle', 'gasless', 'web3', 'creator', 'monetization', 'blockchain'],
  authors: [{ name: 'Mantle Tip Jar Team' }],
  creator: 'Mantle Tip Jar',
  publisher: 'Mantle Tip Jar',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://mantle-tip-jar.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Mantle Tip Jar - Gasless Crypto Tipping',
    description: 'Enable gasless cryptocurrency tipping for your content with Mantle Tip Jar. Zero gas fees for fans, instant withdrawals for creators.',
    siteName: 'Mantle Tip Jar',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mantle Tip Jar - Gasless Crypto Tipping',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mantle Tip Jar - Gasless Crypto Tipping',
    description: 'Enable gasless cryptocurrency tipping for your content with Mantle Tip Jar. Zero gas fees for fans, instant withdrawals for creators.',
    images: ['/og-image.png'],
    creator: '@mantletipjar',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ConditionalClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ErrorBoundary>
            <ToastProvider>
              <Web3Provider>
                {children}
              </Web3Provider>
            </ToastProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ConditionalClerkProvider>
  )
}