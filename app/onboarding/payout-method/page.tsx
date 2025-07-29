import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Shield, Zap, ArrowRight } from "lucide-react"

// Force dynamic rendering to avoid build-time Clerk errors
export const dynamic = 'force-dynamic'

export default function PayoutMethod() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Connect Your Wallet</h1>
          <p className="text-gray-600">Set up your payout method to receive tips</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-xl">Connect Your Mantle Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to receive tips directly on the Mantle network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Secure & Non-Custodial</h3>
                  <p className="text-sm text-gray-600">Your funds go directly to your wallet</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Low Gas Fees</h3>
                  <p className="text-sm text-gray-600">Mantle network offers minimal transaction costs</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <ArrowRight className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Instant Access</h3>
                  <p className="text-sm text-gray-600">Withdraw your earnings anytime</p>
                </div>
              </div>
            </div>

            {/* Wallet Connection Button */}
            <div className="pt-4">
              <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 text-lg">
                <Wallet className="w-5 h-5 mr-2" />
                Connect Your Mantle Wallet
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Supports MetaMask, WalletConnect, and other Web3 wallets
              </p>
            </div>

            {/* Network Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Mantle Network Setup</h4>
              <p className="text-sm text-blue-700 mb-3">
                Make sure your wallet is connected to the Mantle Testnet. We&apos;ll help you add it if needed.
              </p>
              <div className="text-xs text-blue-600 space-y-1">
                <div><strong>Network:</strong> Mantle Testnet</div>
                <div><strong>Chain ID:</strong> 5003</div>
                <div><strong>Currency:</strong> MNT</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/dashboard">
                  Skip for Now
                </Link>
              </Button>
              <Button asChild className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black">
                <Link href="/dashboard">
                  Continue to Dashboard
                </Link>
              </Button>
            </div>

            <p className="text-sm text-gray-500 text-center">
              You can always connect your wallet later from your dashboard settings
            </p>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-semibold">
              ✓
            </div>
            <div className="w-8 h-1 bg-yellow-400"></div>
            <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <div className="w-8 h-1 bg-yellow-400"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-semibold">
              3
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">Step 2 of 3: Connect Wallet</p>
        </div>
      </div>
    </div>
  )
}