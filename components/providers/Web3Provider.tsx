'use client'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { defineChain } from 'viem'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// Define Mantle Testnet
const mantleTestnet = defineChain({
  id: 5003,
  name: 'Mantle Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_MANTLE_RPC_URL || 'https://rpc.sepolia.mantle.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mantle Testnet Explorer',
      url: 'https://explorer.sepolia.mantle.xyz',
    },
  },
  testnet: true,
})

// Only include WalletConnect if project ID is properly configured
const getConnectors = () => {
  const connectors = [injected(), metaMask()]
  
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
  if (projectId && projectId !== 'your_project_id_here' && projectId.trim() !== '') {
    connectors.push(walletConnect({ projectId }))
  }
  
  return connectors
}

const config = createConfig({
  chains: [mantleTestnet],
  connectors: getConnectors(),
  transports: {
    [mantleTestnet.id]: http(),
  },
})

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}