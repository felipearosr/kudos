import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Web3Provider } from '@/components/providers/Web3Provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mantle Tip Jar',
  description: 'Gasless cryptocurrency tipping on Mantle network',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Web3Provider>
            {children}
          </Web3Provider>
        </body>
      </html>
    </ClerkProvider>
  )
}