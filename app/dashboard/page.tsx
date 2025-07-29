'use client'

import Link from "next/link"
import { useUser } from "@clerk/nextjs"
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
import { Settings, Wallet } from "lucide-react"
import { useState } from "react"

// Force dynamic rendering to avoid build-time Clerk errors
export const dynamic = 'force-dynamic'

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
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  
  // Hardcoded claimable balance
  const claimableBalance = "0.45"

  const handleWithdraw = async () => {
    setIsWithdrawing(true)
    console.log("Withdraw initiated for user:", user?.id)
    console.log("Withdrawing balance:", claimableBalance, "MNT")
    
    // Simulate withdrawal process
    setTimeout(() => {
      console.log("Withdrawal successful!")
      setIsWithdrawing(false)
      // In a real implementation, this would show a success toast
      alert("Withdrawal successful! Funds have been transferred to your wallet.")
    }, 2000)
  }

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
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {claimableBalance} MNT
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  ≈ ${(parseFloat(claimableBalance) * 0.65).toFixed(2)} USD
                </p>
              </div>
              <Button 
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                onClick={handleWithdraw}
                disabled={isWithdrawing}
              >
                {isWithdrawing ? "Processing..." : "Withdraw Funds"}
              </Button>
            </div>
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