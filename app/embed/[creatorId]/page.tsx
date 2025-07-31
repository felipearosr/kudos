"use client"

import { useState, useEffect } from "react"
import { useAccount, useConnect, useDisconnect, useSwitchChain, useSignTypedData } from "wagmi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Heart, Wallet, Zap, AlertCircle } from "lucide-react"

interface EmbedPageProps {
  params: {
    creatorId: string
  }
}

export default function EmbedPage({ params }: EmbedPageProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tipAmount, setTipAmount] = useState("")
  const [networkError, setNetworkError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [tipStatus, setTipStatus] = useState<'idle' | 'signing' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState("")
  const [transactionHash, setTransactionHash] = useState("")
  
  // Wagmi hooks for wallet connection and signing
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { signTypedData } = useSignTypedData()
  
  // Mantle Testnet chain ID
  const MANTLE_TESTNET_ID = 5003
  
  // Mock creator data - in real app this would be fetched based on creatorId
  const creatorData = {
    name: "Creator Name",
    avatar: "https://via.placeholder.com/64",
    description: "Supporting amazing content creation"
  }

  const presetAmounts = ["0.01", "0.05", "0.1", "0.25"]

  // Check if user is on the correct network
  const isCorrectNetwork = chain?.id === MANTLE_TESTNET_ID
  
  // Reset network error when network changes
  useEffect(() => {
    if (isConnected && isCorrectNetwork) {
      setNetworkError("")
    } else if (isConnected && !isCorrectNetwork) {
      setNetworkError("Please switch to Mantle Testnet")
    }
  }, [isConnected, isCorrectNetwork])

  const handleConnectWallet = () => {
    // Connect with the first available connector (usually MetaMask/injected)
    const connector = connectors[0]
    if (connector) {
      connect({ connector })
    }
  }

  const handleSwitchNetwork = () => {
    switchChain({ chainId: MANTLE_TESTNET_ID })
  }

  // Get contract address from environment
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TIP_JAR_CONTRACT_ADDRESS as `0x${string}`
  
  // EIP-712 Domain and Types for meta-transaction
  const createTipTypedData = (fanAddress: string, creatorAddress: string, amount: string, nonce: number) => {
    if (!CONTRACT_ADDRESS) {
      throw new Error('Contract address not configured')
    }
    
    return {
      domain: {
        name: 'MantleTipJar',
        version: '1',
        chainId: MANTLE_TESTNET_ID,
        verifyingContract: CONTRACT_ADDRESS
      },
      types: {
        Tip: [
          { name: 'fan', type: 'address' },
          { name: 'creator', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'nonce', type: 'uint256' }
        ]
      },
      primaryType: 'Tip' as const,
      message: {
        fan: fanAddress as `0x${string}`,
        creator: creatorAddress as `0x${string}`,
        amount: BigInt(Math.floor(parseFloat(amount) * 1e18)), // Convert to wei
        nonce: BigInt(nonce)
      }
    }
  }

  const handleTip = async () => {
    if (!address || !canTip) return

    try {
      setIsProcessing(true)
      setTipStatus('signing')
      setErrorMessage("")

      // Validate contract address is configured
      if (!CONTRACT_ADDRESS) {
        throw new Error('Contract address not configured. Please check environment variables.')
      }

      // Generate unique nonce (in real app, this would come from backend)
      const nonce = Date.now()
      
      // Create EIP-712 typed data structure
      const typedData = createTipTypedData(address, params.creatorId, tipAmount, nonce)

      // Request signature from user
      const signature = await signTypedData(typedData)
      
      // Move to submitting state after successful signature
      setTipStatus('submitting')
      
      // Make API call to relay service
      const response = await fetch('/api/relay-tip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fan: address,
          creator: params.creatorId,
          amount: tipAmount,
          nonce: nonce,
          signature: signature
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || `API Error: ${response.status}`)
      }

      // Success - display transaction details
      setTipStatus('success')
      setTransactionHash(result.data.transactionHash)
      console.log('Tip transaction successful:', result.data)
      console.log('Transaction hash:', result.data.transactionHash)
      
      // Auto-close modal after success
      setTimeout(() => {
        setIsOpen(false)
        setTipAmount("")
        setTipStatus('idle')
        setTransactionHash("")
        setIsProcessing(false)
      }, 4000) // Longer to show transaction hash

    } catch (error: any) {
      console.error('Tip failed:', error)
      setTipStatus('error')
      
      // Handle specific error types
      if (error.message?.includes('User rejected')) {
        setErrorMessage('Signature was rejected. Please try again.')
      } else if (error.message?.includes('Contract address not configured')) {
        setErrorMessage('Application not properly configured. Please contact support.')
      } else if (error.message?.includes('network')) {
        setErrorMessage('Network error. Please check your connection and try again.')
      } else if (error.message?.includes('insufficient funds')) {
        setErrorMessage('Insufficient funds in your wallet.')
      } else {
        setErrorMessage(error.message || 'Transaction failed. Please try again.')
      }
      
      setIsProcessing(false)
    }
  }

  const isValidAmount = tipAmount && parseFloat(tipAmount) > 0
  const canTip = isConnected && isCorrectNetwork && isValidAmount

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-xl border-0">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            Support {creatorData.name}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {creatorData.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 text-lg">
                <Zap className="h-5 w-5 mr-2" />
                Tip Me on Mantle
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-yellow-500" />
                  Send a Tip
                </DialogTitle>
                <DialogDescription>
                  Support {creatorData.name} with MNT on the Mantle network
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Amount Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Tip Amount (MNT)
                  </label>
                  
                  {/* Preset Amount Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {presetAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant={tipAmount === amount ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTipAmount(amount)}
                        className="text-xs"
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Custom Amount Input */}
                  <Input
                    type="number"
                    placeholder="Enter custom amount"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    min="0"
                    step="0.001"
                    className="text-center"
                  />
                  
                  {tipAmount && (
                    <p className="text-xs text-gray-500 text-center">
                      ≈ ${(parseFloat(tipAmount) * 0.65).toFixed(2)} USD
                    </p>
                  )}
                </div>

                {/* Wallet Connection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Wallet Connection
                  </label>
                  
                  {!isConnected ? (
                    <Button
                      onClick={handleConnectWallet}
                      disabled={isPending}
                      variant="outline"
                      className="w-full flex items-center gap-2"
                    >
                      <Wallet className="h-4 w-4" />
                      {isPending ? "Connecting..." : "Connect Wallet"}
                    </Button>
                  ) : !isCorrectNetwork ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-700 font-medium">
                          Wrong Network
                        </span>
                      </div>
                      <Button
                        onClick={handleSwitchNetwork}
                        variant="outline"
                        className="w-full text-sm"
                      >
                        Switch to Mantle Testnet
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-700 font-medium">
                          Wallet Connected
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Display */}
                {tipStatus !== 'idle' && (
                  <div className="space-y-3">
                    {tipStatus === 'signing' && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-blue-700 font-medium">
                          Please sign the transaction in your wallet...
                        </span>
                      </div>
                    )}
                    
                    {tipStatus === 'submitting' && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-yellow-700 font-medium">
                          Processing your tip...
                        </span>
                      </div>
                    )}
                    
                    {tipStatus === 'success' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <span className="text-sm text-green-700 font-medium">
                            Tip sent successfully! 🎉
                          </span>
                        </div>
                        {transactionHash && (
                          <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-xs text-gray-600 font-medium mb-1">Transaction Hash:</p>
                            <p className="text-xs text-gray-800 font-mono break-all">
                              {transactionHash}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {tipStatus === 'error' && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-700 font-medium">
                          {errorMessage}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tip Button */}
                <Button
                  onClick={handleTip}
                  disabled={!canTip || isProcessing}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold disabled:opacity-50"
                >
                  {isProcessing
                    ? tipStatus === 'signing'
                      ? "Waiting for Signature..."
                      : tipStatus === 'submitting'
                      ? "Processing Tip..."
                      : "Processing..."
                    : !isConnected 
                    ? "Connect Wallet to Tip" 
                    : !isCorrectNetwork
                    ? "Switch to Mantle Testnet"
                    : !isValidAmount 
                    ? "Enter Amount to Tip"
                    : `Send ${tipAmount} MNT Tip`
                  }
                </Button>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Gasless Tipping:</strong> You only pay the tip amount. 
                    Gas fees are covered by our relay service.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Powered by */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Powered by <span className="font-semibold text-yellow-600">Mantle Tip Jar</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}