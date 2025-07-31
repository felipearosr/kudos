'use client'

import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { formatEther } from "viem"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Settings, Wallet, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

// Force dynamic rendering to avoid build-time Clerk errors
export const dynamic = 'force-dynamic'

// TipJar contract configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TIP_JAR_CONTRACT_ADDRESS as `0x${string}`

// TipJar contract ABI (only the functions we need)
const TIP_JAR_ABI = [
  {
    inputs: [{ name: 'creator', type: 'address' }],
    name: 'getClaimableBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const

// Hardcoded data for recent tips (replacing mock data)
const recentTips = [
  {
    id: "1",
    senderAddress: "0x1234...5678",
    amount: "0.05",
    timestamp: "2024-01-15 14:30",
  },
  {
    id: "2", 
    senderAddress: "0x9876...4321",
    amount: "0.1",
    timestamp: "2024-01-15 12:15",
  },
  {
    id: "3",
    senderAddress: "0x5555...9999",
    amount: "0.025",
    timestamp: "2024-01-14 18:45",
  },
  {
    id: "4",
    senderAddress: "0x7777...3333",
    amount: "0.075",
    timestamp: "2024-01-14 16:20",
  },
  {
    id: "5",
    senderAddress: "0x2222...8888",
    amount: "0.2",
    timestamp: "2024-01-13 20:10",
  },
]

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const { address, isConnected } = useAccount()
  const [withdrawStatus, setWithdrawStatus] = useState<'idle' | 'pending' | 'confirming' | 'success' | 'error'>('idle')
  const [withdrawError, setWithdrawError] = useState("")
  
  // Read claimable balance from smart contract
  const { 
    data: balanceData, 
    isError: balanceError, 
    isLoading: balanceLoading,
    refetch: refetchBalance 
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: TIP_JAR_ABI,
    functionName: 'getClaimableBalance',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!CONTRACT_ADDRESS && isConnected
    }
  })

  // Write contract hook for withdraw function
  const { 
    data: withdrawHash, 
    writeContract: withdraw,
    isPending: isWritePending,
    error: writeError 
  } = useWriteContract()

  // Wait for transaction confirmation
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: confirmError 
  } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  })

  // Format balance for display
  const claimableBalance = balanceData ? formatEther(balanceData) : "0"

  const handleWithdraw = async () => {
    if (!address || !CONTRACT_ADDRESS) return

    try {
      setWithdrawStatus('pending')
      setWithdrawError("")

      // Call the withdraw function on the smart contract
      withdraw({
        address: CONTRACT_ADDRESS,
        abi: TIP_JAR_ABI,
        functionName: 'withdraw',
      })

    } catch (error: any) {
      console.error('Withdraw failed:', error)
      setWithdrawStatus('error')
      setWithdrawError(error.message || 'Withdrawal failed')
    }
  }

  // Handle transaction status changes
  useEffect(() => {
    if (isWritePending) {
      setWithdrawStatus('pending')
    } else if (withdrawHash && isConfirming) {
      setWithdrawStatus('confirming')
    } else if (isConfirmed) {
      setWithdrawStatus('success')
      // Refetch balance after successful withdrawal
      refetchBalance()
      
      // Reset status after showing success
      setTimeout(() => {
        setWithdrawStatus('idle')
      }, 3000)
    } else if (writeError || confirmError) {
      setWithdrawStatus('error')
      setWithdrawError(writeError?.message || confirmError?.message || 'Transaction failed')
    }
  }, [isWritePending, withdrawHash, isConfirming, isConfirmed, writeError, confirmError, refetchBalance])

  const isWithdrawing = withdrawStatus !== 'idle'

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to access your dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your tip jar and earnings</p>
          </div>
          <Link href="/dashboard/settings">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>

        {/* Balance Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Claimable Balance
            </CardTitle>
            <CardDescription>
              Your current earnings available for withdrawal
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Connect your wallet to view your balance
                </span>
              </div>
            ) : balanceError ? (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">
                  Error loading balance. Please try again.
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-600">
                      {balanceLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                          <span className="text-lg">Loading...</span>
                        </div>
                      ) : (
                        `${claimableBalance} MNT`
                      )}
                    </div>
                    {!balanceLoading && (
                      <p className="text-sm text-gray-500 mt-1">
                        ≈ ${(parseFloat(claimableBalance) * 0.65).toFixed(2)} USD
                      </p>
                    )}
                  </div>
                  <Button 
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || balanceLoading || !isConnected || parseFloat(claimableBalance) === 0}
                  >
                    {withdrawStatus === 'pending' ? "Confirm in Wallet..." : 
                     withdrawStatus === 'confirming' ? "Confirming..." : 
                     withdrawStatus === 'success' ? "Success!" : 
                     "Withdraw Funds"}
                  </Button>
                </div>

                {/* Transaction Status Display */}
                {withdrawStatus !== 'idle' && (
                  <div className="space-y-2">
                    {withdrawStatus === 'pending' && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-blue-700 font-medium">
                          Please confirm the withdrawal in your wallet...
                        </span>
                      </div>
                    )}
                    
                    {withdrawStatus === 'confirming' && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-yellow-700 font-medium">
                          Transaction submitted. Waiting for confirmation...
                        </span>
                      </div>
                    )}
                    
                    {withdrawStatus === 'success' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <span className="text-sm text-green-700 font-medium">
                            Withdrawal successful! Funds transferred to your wallet. 🎉
                          </span>
                        </div>
                        {withdrawHash && (
                          <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-xs text-gray-600 font-medium mb-1">Transaction Hash:</p>
                            <p className="text-xs text-gray-800 font-mono break-all">
                              {withdrawHash}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {withdrawStatus === 'error' && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-700 font-medium">
                          {withdrawError || 'Withdrawal failed. Please try again.'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tips Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tips</CardTitle>
            <CardDescription>
              Latest tips received from your supporters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sender</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTips.map((tip) => (
                  <TableRow key={tip.id}>
                    <TableCell className="font-mono text-sm">
                      {tip.senderAddress}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {tip.amount} MNT
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {tip.timestamp}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Confirmed
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {recentTips.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No tips received yet</p>
                <p className="text-sm mt-1">Share your embed code to start receiving tips!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}