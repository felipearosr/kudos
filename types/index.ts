/**
 * Global TypeScript type definitions for Mantle Tip Jar
 */

import { Address } from 'viem'

// Environment Configuration Types
export interface EnvironmentConfig {
  clerk: {
    publishableKey: string
    secretKey: string
    signInUrl: string
    signUpUrl: string
    afterSignInUrl: string
    afterSignUpUrl: string
  }
  web3: {
    mantleRpcUrl: string
    mantleChainId: number
    walletConnectProjectId?: string
  }
  contract: {
    tipJarAddress: string
    relayerPrivateKey: string
  }
  development: {
    nodeEnv: string
    logLevel: string
  }
  hardhat?: {
    mantleTestnetRpcUrl: string
    privateKey: string
    mantleExplorerApiKey?: string
  }
}

// Smart Contract Types
export interface TipJarContract {
  address: Address
  abi: readonly any[]
}

export interface TipMessage {
  fan: Address
  creator: Address
  amount: bigint
  nonce: bigint
}

export interface EIP712Domain {
  name: string
  version: string
  chainId: number
  verifyingContract: Address
}

export interface EIP712Types {
  Tip: Array<{
    name: string
    type: string
  }>
}

export interface TipTypedData {
  domain: EIP712Domain
  types: EIP712Types
  primaryType: 'Tip'
  message: TipMessage
}

// API Types
export interface TipRequest {
  fan: string
  creator: string
  amount: string
  nonce: number
  signature: string
}

export interface TipResponse {
  success: boolean
  message: string
  data?: {
    fan: string
    creator: string
    amount: string
    nonce: number
    transactionHash: string
    status: string
    recoveredAddress: string
  }
  error?: string
}

export interface ApiError {
  error: string
  message: string
  code?: number
  details?: string
}

// User Interface Types
export interface CreatorProfile {
  id: string
  name: string
  avatar?: string
  website?: string
  about?: string
  walletAddress?: string
  claimableBalance: string
}

export interface TipTransaction {
  id: string
  fanAddress: string
  creatorAddress: string
  amount: string
  timestamp: string
  transactionHash?: string
  status: 'pending' | 'confirmed' | 'failed'
}

export interface RecentTip {
  id: string
  senderAddress: string
  amount: string
  timestamp: string
  status?: 'pending' | 'confirmed' | 'failed'
}

// Component Props Types
export interface EmbedPageProps {
  params: {
    creatorId: string
  }
}

export interface DashboardProps {
  user?: any // Clerk user type
  isLoaded: boolean
}

// Wallet Connection Types
export interface WalletConnectionState {
  isConnected: boolean
  address?: Address
  chainId?: number
  isCorrectNetwork: boolean
}

export interface ConnectorInfo {
  id: string
  name: string
  icon?: string
  ready: boolean
}

// Transaction Status Types
export type TransactionStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error'

export interface TransactionState {
  status: TransactionStatus
  hash?: string
  error?: string
  isLoading: boolean
}

// Error Handling Types
export interface UserFriendlyError {
  title: string
  message: string
  action?: string
  type: 'error' | 'warning' | 'info'
}

export enum ErrorType {
  // Wallet errors
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  WALLET_CONNECTION_REJECTED = 'WALLET_CONNECTION_REJECTED',
  WRONG_NETWORK = 'WRONG_NETWORK',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  
  // Transaction errors
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  SIGNATURE_REJECTED = 'SIGNATURE_REJECTED',
  
  // API errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Authentication errors
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  
  // Smart contract errors
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  SIGNATURE_ALREADY_USED = 'SIGNATURE_ALREADY_USED',
  
  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

// Toast Notification Types
export interface Toast {
  id: string
  title?: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

// Loading State Types
export interface LoadingState {
  isLoading: boolean
  message?: string
  progress?: number
}

export type LoadingSize = 'sm' | 'md' | 'lg'

// Form Types
export interface TipFormData {
  amount: string
  creatorId: string
  message?: string
}

export interface ProfileFormData {
  name: string
  avatar?: string
  website?: string
  about?: string
}

// Utility Types
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Next.js Page Props Types
export interface PageProps {
  params: Record<string, string>
  searchParams: Record<string, string | string[] | undefined>
}

export interface LayoutProps {
  children: React.ReactNode
  params?: Record<string, string>
}

// Metadata Types for SEO
export interface SEOMetadata {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
}

// Configuration Types
export interface AppConfig {
  name: string
  description: string
  url: string
  version: string
  author: string
  social: {
    twitter?: string
    github?: string
    discord?: string
  }
}

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (req: any) => string
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: Date
  retryAfter?: number
}

// Deployment Types
export interface DeploymentInfo {
  network: string
  contractAddress: Address
  deployerAddress: Address
  relayerAddress: Address
  transactionHash: string
  blockNumber: number
  deployedAt: string
  gasUsed: string
}