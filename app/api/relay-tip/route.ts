import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, http, parseEther, recoverTypedDataAddress, Address, createPublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { getEnvironmentConfig } from '@/lib/env-validation';

// Get validated environment configuration
const envConfig = getEnvironmentConfig();

// Mantle Testnet configuration using validated environment variables
const mantleTestnet = {
  id: envConfig.web3.mantleChainId,
  name: 'Mantle Testnet',
  network: 'mantle-testnet',
  nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: {
    default: { http: [envConfig.web3.mantleRpcUrl] },
    public: { http: [envConfig.web3.mantleRpcUrl] }
  }
} as const;

// EIP-712 domain and types for tip signatures
const EIP712_DOMAIN = {
  name: 'MantleTipJar',
  version: '1',
  chainId: envConfig.web3.mantleChainId,
  verifyingContract: envConfig.contract.tipJarAddress as Address
} as const;

const EIP712_TYPES = {
  Tip: [
    { name: 'fan', type: 'address' },
    { name: 'creator', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'nonce', type: 'uint256' }
  ]
} as const;

// TipJar contract ABI (only the functions we need)
const TIP_JAR_ABI = [
  {
    inputs: [
      { name: 'fan', type: 'address' },
      { name: 'creator', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'signature', type: 'bytes' }
    ],
    name: 'tip',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [{ name: 'fan', type: 'address' }],
    name: 'getNonce',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;



interface TipRequest {
  fan: string;
  creator: string;
  amount: string;
  nonce: number;
  signature: string;
}

interface TipMessage {
  fan: Address;
  creator: Address;
  amount: bigint;
  nonce: bigint;
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute per IP
const MAX_REQUESTS_PER_FAN = 5; // 5 requests per minute per fan address

// In-memory rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Request logging
interface RequestLog {
  timestamp: Date;
  ip: string;
  fan: string;
  creator: string;
  amount: string;
  success: boolean;
  error?: string;
}

const requestLogs: RequestLog[] = [];

// Rate limiting helper functions
function getRateLimitKey(type: 'ip' | 'fan', identifier: string): string {
  return `${type}:${identifier}`;
}

function checkRateLimit(key: string, maxRequests: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up old rate limit records periodically
function cleanupRateLimitStore() {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  rateLimitStore.forEach((record, key) => {
    if (now > record.resetTime) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

// Enhanced address validation
function validateAddress(address: string): boolean {
  // Basic format check
  if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
    return false;
  }
  
  // Check for common invalid addresses
  const invalidAddresses = [
    '0x0000000000000000000000000000000000000000', // Zero address
    '0x000000000000000000000000000000000000dead', // Burn address
  ];
  
  return !invalidAddresses.includes(address.toLowerCase());
}

// Enhanced creator address validation
function validateCreatorAddress(address: string): boolean {
  if (!validateAddress(address)) {
    return false;
  }
  
  // Additional creator-specific validation could go here
  // For example, checking against a whitelist or blacklist
  
  return true;
}

// Log request for monitoring and debugging
function logRequest(log: RequestLog) {
  requestLogs.push(log);
  
  // Keep only last 1000 logs to prevent memory issues
  if (requestLogs.length > 1000) {
    requestLogs.shift();
  }
  
  // Log to console for monitoring
  console.log(`[${log.timestamp.toISOString()}] ${log.ip} - ${log.fan} -> ${log.creator} (${log.amount} MNT) - ${log.success ? 'SUCCESS' : 'FAILED'}${log.error ? ` - ${log.error}` : ''}`);
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to a default IP for development
  return '127.0.0.1';
}

// Input validation helper
function validateTipRequest(body: any): TipRequest | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const { fan, creator, amount, nonce, signature } = body;

  // Validate required fields
  if (!fan || !creator || !amount || nonce === undefined || !signature) {
    return null;
  }

  // Validate addresses (basic format check)
  if (typeof fan !== 'string' || !fan.match(/^0x[a-fA-F0-9]{40}$/)) {
    return null;
  }
  if (typeof creator !== 'string' || !creator.match(/^0x[a-fA-F0-9]{40}$/)) {
    return null;
  }

  // Validate amount (should be a positive number string)
  if (typeof amount !== 'string' || isNaN(Number(amount)) || Number(amount) <= 0) {
    return null;
  }

  // Validate nonce (should be a non-negative integer)
  if (typeof nonce !== 'number' || nonce < 0 || !Number.isInteger(nonce)) {
    return null;
  }

  // Validate signature (should be a hex string)
  if (typeof signature !== 'string' || !signature.match(/^0x[a-fA-F0-9]+$/)) {
    return null;
  }

  return { fan, creator, amount, nonce, signature };
}

// Validate tip amount limits
function validateTipAmount(amount: string): boolean {
  const amountNum = Number(amount);
  
  // Minimum tip: 0.001 MNT (to prevent spam)
  const minTip = 0.001;
  
  // Maximum tip: 1000 MNT (reasonable upper limit)
  const maxTip = 1000;
  
  return amountNum >= minTip && amountNum <= maxTip;
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  let tipRequest: TipRequest | null = null;
  
  try {
    // Clean up old rate limit records periodically
    cleanupRateLimitStore();

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      logRequest({
        timestamp: new Date(),
        ip: clientIP,
        fan: 'unknown',
        creator: 'unknown',
        amount: 'unknown',
        success: false,
        error: 'INVALID_JSON'
      });
      
      return NextResponse.json(
        { 
          error: 'INVALID_JSON',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      );
    }

    // Validate input
    tipRequest = validateTipRequest(body);
    if (!tipRequest) {
      logRequest({
        timestamp: new Date(),
        ip: clientIP,
        fan: body?.fan || 'unknown',
        creator: body?.creator || 'unknown',
        amount: body?.amount || 'unknown',
        success: false,
        error: 'INVALID_INPUT'
      });
      
      return NextResponse.json(
        {
          error: 'INVALID_INPUT',
          message: 'Invalid request format. Required fields: fan, creator, amount, nonce, signature'
        },
        { status: 400 }
      );
    }

    // Enhanced address validation
    if (!validateAddress(tipRequest.fan)) {
      logRequest({
        timestamp: new Date(),
        ip: clientIP,
        fan: tipRequest.fan,
        creator: tipRequest.creator,
        amount: tipRequest.amount,
        success: false,
        error: 'INVALID_FAN_ADDRESS'
      });
      
      return NextResponse.json(
        {
          error: 'INVALID_FAN_ADDRESS',
          message: 'Invalid fan address provided'
        },
        { status: 400 }
      );
    }

    if (!validateCreatorAddress(tipRequest.creator)) {
      logRequest({
        timestamp: new Date(),
        ip: clientIP,
        fan: tipRequest.fan,
        creator: tipRequest.creator,
        amount: tipRequest.amount,
        success: false,
        error: 'INVALID_CREATOR_ADDRESS'
      });
      
      return NextResponse.json(
        {
          error: 'INVALID_CREATOR_ADDRESS',
          message: 'Invalid creator address provided'
        },
        { status: 400 }
      );
    }

    // Rate limiting by IP
    const ipRateLimitKey = getRateLimitKey('ip', clientIP);
    if (!checkRateLimit(ipRateLimitKey, MAX_REQUESTS_PER_WINDOW)) {
      logRequest({
        timestamp: new Date(),
        ip: clientIP,
        fan: tipRequest.fan,
        creator: tipRequest.creator,
        amount: tipRequest.amount,
        success: false,
        error: 'RATE_LIMIT_IP'
      });
      
      return NextResponse.json(
        {
          error: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests from this IP. Maximum ${MAX_REQUESTS_PER_WINDOW} requests per minute allowed.`
        },
        { status: 429 }
      );
    }

    // Rate limiting by fan address
    const fanRateLimitKey = getRateLimitKey('fan', tipRequest.fan.toLowerCase());
    if (!checkRateLimit(fanRateLimitKey, MAX_REQUESTS_PER_FAN)) {
      logRequest({
        timestamp: new Date(),
        ip: clientIP,
        fan: tipRequest.fan,
        creator: tipRequest.creator,
        amount: tipRequest.amount,
        success: false,
        error: 'RATE_LIMIT_FAN'
      });
      
      return NextResponse.json(
        {
          error: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests from this fan address. Maximum ${MAX_REQUESTS_PER_FAN} requests per minute allowed.`
        },
        { status: 429 }
      );
    }

    // Validate tip amount
    if (!validateTipAmount(tipRequest.amount)) {
      logRequest({
        timestamp: new Date(),
        ip: clientIP,
        fan: tipRequest.fan,
        creator: tipRequest.creator,
        amount: tipRequest.amount,
        success: false,
        error: 'INVALID_AMOUNT'
      });
      
      return NextResponse.json(
        {
          error: 'INVALID_AMOUNT',
          message: 'Tip amount must be between 0.001 and 1000 MNT'
        },
        { status: 400 }
      );
    }

    // Use validated environment configuration
    const relayerPrivateKey = envConfig.contract.relayerPrivateKey;
    const contractAddress = envConfig.contract.tipJarAddress;

    // Convert amount to wei
    const amountInWei = parseEther(tipRequest.amount);

    // Create the typed data message
    const message: TipMessage = {
      fan: tipRequest.fan as Address,
      creator: tipRequest.creator as Address,
      amount: amountInWei,
      nonce: BigInt(tipRequest.nonce)
    };

    // Verify the EIP-712 signature
    let recoveredAddress: Address;
    try {
      recoveredAddress = await recoverTypedDataAddress({
        domain: EIP712_DOMAIN,
        types: EIP712_TYPES,
        primaryType: 'Tip',
        message,
        signature: tipRequest.signature as `0x${string}`
      });
    } catch (error) {
      console.error('Signature recovery failed:', error);
      logRequest({
        timestamp: new Date(),
        ip: clientIP,
        fan: tipRequest.fan,
        creator: tipRequest.creator,
        amount: tipRequest.amount,
        success: false,
        error: 'INVALID_SIGNATURE'
      });
      
      return NextResponse.json(
        {
          error: 'INVALID_SIGNATURE',
          message: 'Failed to recover signature'
        },
        { status: 400 }
      );
    }

    // Verify that the recovered address matches the fan address
    if (recoveredAddress.toLowerCase() !== tipRequest.fan.toLowerCase()) {
      logRequest({
        timestamp: new Date(),
        ip: clientIP,
        fan: tipRequest.fan,
        creator: tipRequest.creator,
        amount: tipRequest.amount,
        success: false,
        error: 'SIGNATURE_MISMATCH'
      });
      
      return NextResponse.json(
        {
          error: 'SIGNATURE_MISMATCH',
          message: 'Signature does not match fan address'
        },
        { status: 400 }
      );
    }

    // Log successful signature verification
    console.log(`Signature verified for tip: ${tipRequest.fan} -> ${tipRequest.creator}, amount: ${tipRequest.amount} MNT`);

    // Initialize wallet client with relayer private key
    let walletClient;
    try {
      const account = privateKeyToAccount(relayerPrivateKey as `0x${string}`);
      walletClient = createWalletClient({
        account,
        chain: mantleTestnet,
        transport: http()
      });
    } catch (error) {
      console.error('Failed to initialize wallet client:', error);
      return NextResponse.json(
        {
          error: 'WALLET_INITIALIZATION_ERROR',
          message: 'Failed to initialize relayer wallet'
        },
        { status: 500 }
      );
    }

    // Execute tip transaction on smart contract
    let transactionHash: string;
    try {
      const hash = await walletClient.writeContract({
        address: contractAddress as Address,
        abi: TIP_JAR_ABI,
        functionName: 'tip',
        args: [
          tipRequest.fan as Address,
          tipRequest.creator as Address,
          amountInWei,
          BigInt(tipRequest.nonce),
          tipRequest.signature as `0x${string}`
        ],
        value: amountInWei
      });

      transactionHash = hash;
      console.log(`Tip transaction submitted: ${transactionHash}`);
    } catch (error: any) {
      console.error('Smart contract interaction failed:', error);
      
      // Handle specific contract errors with logging
      if (error.message?.includes('Signature already used')) {
        logRequest({
          timestamp: new Date(),
          ip: clientIP,
          fan: tipRequest.fan,
          creator: tipRequest.creator,
          amount: tipRequest.amount,
          success: false,
          error: 'SIGNATURE_ALREADY_USED'
        });
        
        return NextResponse.json(
          {
            error: 'SIGNATURE_ALREADY_USED',
            message: 'This signature has already been processed'
          },
          { status: 400 }
        );
      }
      
      if (error.message?.includes('Invalid nonce')) {
        logRequest({
          timestamp: new Date(),
          ip: clientIP,
          fan: tipRequest.fan,
          creator: tipRequest.creator,
          amount: tipRequest.amount,
          success: false,
          error: 'INVALID_NONCE'
        });
        
        return NextResponse.json(
          {
            error: 'INVALID_NONCE',
            message: 'Invalid nonce for this fan address'
          },
          { status: 400 }
        );
      }
      
      if (error.message?.includes('Unauthorized')) {
        logRequest({
          timestamp: new Date(),
          ip: clientIP,
          fan: tipRequest.fan,
          creator: tipRequest.creator,
          amount: tipRequest.amount,
          success: false,
          error: 'UNAUTHORIZED_RELAYER'
        });
        
        return NextResponse.json(
          {
            error: 'UNAUTHORIZED_RELAYER',
            message: 'Relayer not authorized for this contract'
          },
          { status: 403 }
        );
      }

      // Log generic transaction failure
      logRequest({
        timestamp: new Date(),
        ip: clientIP,
        fan: tipRequest.fan,
        creator: tipRequest.creator,
        amount: tipRequest.amount,
        success: false,
        error: 'TRANSACTION_FAILED'
      });

      return NextResponse.json(
        {
          error: 'TRANSACTION_FAILED',
          message: 'Failed to execute tip transaction',
          details: error.message || 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Wait for transaction confirmation (optional - can be done async)
    let transactionStatus = 'pending';
    try {
      const publicClient = createPublicClient({
        chain: mantleTestnet,
        transport: http()
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: transactionHash as `0x${string}`,
        timeout: 30000 // 30 second timeout
      });

      transactionStatus = receipt.status === 'success' ? 'confirmed' : 'failed';
      console.log(`Transaction ${transactionHash} ${transactionStatus}`);
    } catch (error) {
      console.warn('Failed to wait for transaction confirmation:', error);
      // Don't fail the request if we can't get confirmation
    }

    // Log successful request
    logRequest({
      timestamp: new Date(),
      ip: clientIP,
      fan: tipRequest.fan,
      creator: tipRequest.creator,
      amount: tipRequest.amount,
      success: true
    });

    // Return success response with transaction details
    return NextResponse.json({
      success: true,
      message: 'Tip processed successfully',
      data: {
        fan: tipRequest.fan,
        creator: tipRequest.creator,
        amount: tipRequest.amount,
        nonce: tipRequest.nonce,
        transactionHash,
        status: transactionStatus,
        recoveredAddress
      }
    });

  } catch (error) {
    console.error('Relay service error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    {
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only POST requests are supported'
    },
    { status: 405 }
  );
}