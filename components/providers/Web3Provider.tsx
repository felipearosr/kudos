'use client'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { defineChain } from 'viem'
import { injected, metaMask } from 'wagmi/connectors'
import { getEnvironmentConfig } from '@/lib/env-validation'

// Get validated environment configuration
const envConfig = getEnvironmentConfig()

// Define Mantle Testnet using validated environment variables
const mantleTestnet = defineChain({
  id: envConfig.web3.mantleChainId,
  name: 'Mantle Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: {
      http: [envConfig.web3.mantleRpcUrl],
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

// Configure connectors - using injected and MetaMask for now
// WalletConnect can be added later when needed
const connectors = [injected(), metaMask()]

const config = createConfig({
  chains: [mantleTestnet],
  connectors,
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