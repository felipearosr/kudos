/**
 * Environment Variable Validation
 * 
 * This module validates all required environment variables at application startup
 * and provides type-safe access to environment configuration.
 */

interface EnvironmentConfig {
  // Clerk Authentication
  clerk: {
    publishableKey: string;
    secretKey: string;
    signInUrl: string;
    signUpUrl: string;
    afterSignInUrl: string;
    afterSignUpUrl: string;
  };
  
  // Web3 Configuration
  web3: {
    mantleRpcUrl: string;
    mantleChainId: number;
    walletConnectProjectId?: string;
  };
  
  // Smart Contract
  contract: {
    tipJarAddress: string;
    relayerPrivateKey: string;
  };
  
  // Development
  development: {
    nodeEnv: string;
    logLevel: string;
  };
  
  // Hardhat (server-side only)
  hardhat?: {
    mantleTestnetRpcUrl: string;
    privateKey: string;
    mantleExplorerApiKey?: string;
  };
}

/**
 * Validates that a required environment variable exists and is not empty
 */
function requireEnvVar(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

/**
 * Validates that an optional environment variable exists, returns undefined if not set
 */
function optionalEnvVar(value: string | undefined): string | undefined {
  return value && value.trim() !== '' ? value.trim() : undefined;
}

/**
 * Validates environment variables and returns typed configuration
 */
export function validateEnvironment(): EnvironmentConfig {
  const errors: string[] = [];
  
  try {
    // Validate Clerk configuration
    const clerkPublishableKey = requireEnvVar('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
    const clerkSecretKey = requireEnvVar('CLERK_SECRET_KEY', process.env.CLERK_SECRET_KEY);
    
    // Validate Web3 configuration
    const mantleRpcUrl = requireEnvVar('NEXT_PUBLIC_MANTLE_RPC_URL', process.env.NEXT_PUBLIC_MANTLE_RPC_URL);
    const mantleChainIdStr = requireEnvVar('NEXT_PUBLIC_MANTLE_CHAIN_ID', process.env.NEXT_PUBLIC_MANTLE_CHAIN_ID);
    const mantleChainId = parseInt(mantleChainIdStr, 10);
    
    if (isNaN(mantleChainId)) {
      errors.push('NEXT_PUBLIC_MANTLE_CHAIN_ID must be a valid number');
    }
    
    // Validate Smart Contract configuration
    const tipJarAddress = requireEnvVar('NEXT_PUBLIC_TIP_JAR_CONTRACT_ADDRESS', process.env.NEXT_PUBLIC_TIP_JAR_CONTRACT_ADDRESS);
    const relayerPrivateKey = requireEnvVar('RELAYER_PRIVATE_KEY', process.env.RELAYER_PRIVATE_KEY);
    
    // Validate private key format (should start with 0x and be 66 characters long)
    if (!relayerPrivateKey.startsWith('0x') || relayerPrivateKey.length !== 66) {
      errors.push('RELAYER_PRIVATE_KEY must be a valid Ethereum private key (0x followed by 64 hex characters)');
    }
    
    // Validate contract address format (should start with 0x and be 42 characters long)
    if (!tipJarAddress.startsWith('0x') || tipJarAddress.length !== 42) {
      errors.push('NEXT_PUBLIC_TIP_JAR_CONTRACT_ADDRESS must be a valid Ethereum address (0x followed by 40 hex characters)');
    }
    
    // Validate RPC URL format
    if (!mantleRpcUrl.startsWith('http://') && !mantleRpcUrl.startsWith('https://')) {
      errors.push('NEXT_PUBLIC_MANTLE_RPC_URL must be a valid HTTP/HTTPS URL');
    }
    
    if (errors.length > 0) {
      throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
    }
    
    const config: EnvironmentConfig = {
      clerk: {
        publishableKey: clerkPublishableKey,
        secretKey: clerkSecretKey,
        signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
        signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
        afterSignInUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/onboarding/complete-profile',
        afterSignUpUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/onboarding/complete-profile',
      },
      web3: {
        mantleRpcUrl,
        mantleChainId,
        walletConnectProjectId: optionalEnvVar(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID),
      },
      contract: {
        tipJarAddress,
        relayerPrivateKey,
      },
      development: {
        nodeEnv: process.env.NODE_ENV || 'development',
        logLevel: process.env.LOG_LEVEL || 'info',
      },
    };
    
    // Add Hardhat configuration if running on server-side
    if (typeof window === 'undefined') {
      config.hardhat = {
        mantleTestnetRpcUrl: process.env.MANTLE_TESTNET_RPC_URL || mantleRpcUrl,
        privateKey: process.env.PRIVATE_KEY || relayerPrivateKey,
        mantleExplorerApiKey: optionalEnvVar(process.env.MANTLE_EXPLORER_API_KEY),
      };
    }
    
    return config;
    
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Environment validation failed:', error.message);
    } else {
      console.error('❌ Environment validation failed:', error);
    }
    
    // In development, provide helpful guidance
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📋 Environment Setup Guide:');
      console.log('1. Copy .env.example to .env.local');
      console.log('2. Fill in all required environment variables');
      console.log('3. Ensure your Clerk keys are valid');
      console.log('4. Verify your smart contract is deployed');
      console.log('5. Check that your relayer wallet has MNT tokens\n');
    }
    
    throw error;
  }
}

/**
 * Cached environment configuration
 */
let cachedConfig: EnvironmentConfig | null = null;

/**
 * Get validated environment configuration (cached after first call)
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  if (!cachedConfig) {
    cachedConfig = validateEnvironment();
    
    // Log successful validation in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Environment variables validated successfully');
      console.log(`🌐 Connected to Mantle Chain ID: ${cachedConfig.web3.mantleChainId}`);
      console.log(`📄 TipJar Contract: ${cachedConfig.contract.tipJarAddress}`);
    }
  }
  
  return cachedConfig;
}

/**
 * Reset cached configuration (useful for testing)
 */
export function resetEnvironmentCache(): void {
  cachedConfig = null;
}