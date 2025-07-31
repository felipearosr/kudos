/**
 * Error Handling Utilities
 * 
 * This module provides utilities for handling different types of errors
 * and converting them to user-friendly messages.
 */

export interface UserFriendlyError {
  title: string
  message: string
  action?: string
  type: 'error' | 'warning' | 'info'
}

/**
 * Common error types in the application
 */
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

/**
 * Maps error types to user-friendly messages
 */
const ERROR_MESSAGES: Record<ErrorType, UserFriendlyError> = {
  [ErrorType.WALLET_NOT_CONNECTED]: {
    title: 'Wallet Not Connected',
    message: 'Please connect your wallet to continue.',
    action: 'Connect Wallet',
    type: 'warning'
  },
  
  [ErrorType.WALLET_CONNECTION_REJECTED]: {
    title: 'Connection Rejected',
    message: 'Wallet connection was rejected. Please try again.',
    action: 'Retry Connection',
    type: 'warning'
  },
  
  [ErrorType.WRONG_NETWORK]: {
    title: 'Wrong Network',
    message: 'Please switch to Mantle Testnet to continue.',
    action: 'Switch Network',
    type: 'warning'
  },
  
  [ErrorType.INSUFFICIENT_BALANCE]: {
    title: 'Insufficient Balance',
    message: 'You don\'t have enough MNT tokens for this transaction.',
    action: 'Get MNT Tokens',
    type: 'warning'
  },
  
  [ErrorType.TRANSACTION_REJECTED]: {
    title: 'Transaction Rejected',
    message: 'The transaction was rejected in your wallet. Please try again.',
    action: 'Retry Transaction',
    type: 'warning'
  },
  
  [ErrorType.TRANSACTION_FAILED]: {
    title: 'Transaction Failed',
    message: 'The transaction failed to complete. Please check your wallet and try again.',
    action: 'Try Again',
    type: 'error'
  },
  
  [ErrorType.SIGNATURE_REJECTED]: {
    title: 'Signature Rejected',
    message: 'The signature request was rejected in your wallet.',
    action: 'Try Again',
    type: 'warning'
  },
  
  [ErrorType.NETWORK_ERROR]: {
    title: 'Network Error',
    message: 'Unable to connect to the network. Please check your internet connection.',
    action: 'Retry',
    type: 'error'
  },
  
  [ErrorType.SERVER_ERROR]: {
    title: 'Server Error',
    message: 'Our servers are experiencing issues. Please try again in a moment.',
    action: 'Try Again',
    type: 'error'
  },
  
  [ErrorType.RATE_LIMITED]: {
    title: 'Too Many Requests',
    message: 'You\'re sending requests too quickly. Please wait a moment and try again.',
    action: 'Wait and Retry',
    type: 'warning'
  },
  
  [ErrorType.INVALID_INPUT]: {
    title: 'Invalid Input',
    message: 'Please check your input and try again.',
    action: 'Fix Input',
    type: 'warning'
  },
  
  [ErrorType.AUTHENTICATION_FAILED]: {
    title: 'Authentication Failed',
    message: 'Please sign in to continue.',
    action: 'Sign In',
    type: 'warning'
  },
  
  [ErrorType.UNAUTHORIZED]: {
    title: 'Access Denied',
    message: 'You don\'t have permission to perform this action.',
    action: 'Sign In',
    type: 'warning'
  },
  
  [ErrorType.CONTRACT_ERROR]: {
    title: 'Smart Contract Error',
    message: 'There was an issue with the smart contract. Please try again.',
    action: 'Try Again',
    type: 'error'
  },
  
  [ErrorType.INVALID_SIGNATURE]: {
    title: 'Invalid Signature',
    message: 'The signature is invalid. Please try signing again.',
    action: 'Sign Again',
    type: 'warning'
  },
  
  [ErrorType.SIGNATURE_ALREADY_USED]: {
    title: 'Signature Already Used',
    message: 'This signature has already been processed. Please create a new tip.',
    action: 'Create New Tip',
    type: 'warning'
  },
  
  [ErrorType.VALIDATION_ERROR]: {
    title: 'Validation Error',
    message: 'Please check your input and try again.',
    action: 'Fix Input',
    type: 'warning'
  },
  
  [ErrorType.UNKNOWN_ERROR]: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
    action: 'Try Again',
    type: 'error'
  }
}

/**
 * Converts various error types to user-friendly error messages
 */
export function parseError(error: unknown): UserFriendlyError {
  // Handle string errors
  if (typeof error === 'string') {
    return parseStringError(error)
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    return parseErrorObject(error)
  }
  
  // Handle API response errors
  if (typeof error === 'object' && error !== null && 'error' in error) {
    return parseApiError(error as any)
  }
  
  // Default to unknown error
  return ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR]
}

/**
 * Parse string errors (often from API responses)
 */
function parseStringError(error: string): UserFriendlyError {
  const upperError = error.toUpperCase()
  
  // Check for known error patterns
  if (upperError.includes('USER REJECTED') || upperError.includes('USER DENIED')) {
    return ERROR_MESSAGES[ErrorType.TRANSACTION_REJECTED]
  }
  
  if (upperError.includes('INSUFFICIENT FUNDS') || upperError.includes('INSUFFICIENT BALANCE')) {
    return ERROR_MESSAGES[ErrorType.INSUFFICIENT_BALANCE]
  }
  
  if (upperError.includes('WRONG NETWORK') || upperError.includes('UNSUPPORTED CHAIN')) {
    return ERROR_MESSAGES[ErrorType.WRONG_NETWORK]
  }
  
  if (upperError.includes('RATE LIMIT')) {
    return ERROR_MESSAGES[ErrorType.RATE_LIMITED]
  }
  
  if (upperError.includes('NETWORK ERROR') || upperError.includes('FETCH FAILED')) {
    return ERROR_MESSAGES[ErrorType.NETWORK_ERROR]
  }
  
  // Default to unknown error with the original message
  return {
    title: 'Error',
    message: error,
    type: 'error'
  }
}

/**
 * Parse Error objects
 */
function parseErrorObject(error: Error): UserFriendlyError {
  const message = error.message.toLowerCase()
  
  // Wallet connection errors
  if (message.includes('user rejected') || message.includes('user denied')) {
    return ERROR_MESSAGES[ErrorType.WALLET_CONNECTION_REJECTED]
  }
  
  if (message.includes('no ethereum provider') || message.includes('no injected provider')) {
    return {
      title: 'Wallet Not Found',
      message: 'Please install MetaMask or another Web3 wallet to continue.',
      action: 'Install Wallet',
      type: 'warning'
    }
  }
  
  // Transaction errors
  if (message.includes('insufficient funds')) {
    return ERROR_MESSAGES[ErrorType.INSUFFICIENT_BALANCE]
  }
  
  if (message.includes('transaction failed') || message.includes('execution reverted')) {
    return ERROR_MESSAGES[ErrorType.TRANSACTION_FAILED]
  }
  
  // Network errors
  if (message.includes('network error') || message.includes('fetch failed')) {
    return ERROR_MESSAGES[ErrorType.NETWORK_ERROR]
  }
  
  // Default to unknown error
  return {
    title: 'Error',
    message: error.message,
    type: 'error'
  }
}

/**
 * Parse API response errors
 */
function parseApiError(error: { error?: string; message?: string; code?: number }): UserFriendlyError {
  const errorCode = error.error?.toUpperCase()
  
  // Map known API error codes
  if (errorCode && errorCode in ErrorType) {
    const errorType = errorCode as ErrorType
    return ERROR_MESSAGES[errorType]
  }
  
  // Handle HTTP status codes
  if (error.code) {
    switch (error.code) {
      case 400:
        return ERROR_MESSAGES[ErrorType.INVALID_INPUT]
      case 401:
        return ERROR_MESSAGES[ErrorType.AUTHENTICATION_FAILED]
      case 403:
        return ERROR_MESSAGES[ErrorType.UNAUTHORIZED]
      case 429:
        return ERROR_MESSAGES[ErrorType.RATE_LIMITED]
      case 500:
      case 502:
      case 503:
        return ERROR_MESSAGES[ErrorType.SERVER_ERROR]
      default:
        return ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR]
    }
  }
  
  // Use the provided message if available
  if (error.message) {
    return {
      title: 'Error',
      message: error.message,
      type: 'error'
    }
  }
  
  return ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR]
}

/**
 * Logs errors for debugging and monitoring
 */
export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString()
  const contextStr = context ? ` [${context}]` : ''
  
  console.error(`${timestamp}${contextStr}:`, error)
  
  // In production, you might want to send errors to a monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: sendToErrorService(error, context)
  }
}

/**
 * Creates a standardized error handler for async operations
 */
export function createErrorHandler(context: string) {
  return (error: unknown) => {
    logError(error, context)
    return parseError(error)
  }
}