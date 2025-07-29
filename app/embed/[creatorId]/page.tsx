"use client"

import { useState } from "react"
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
import { Heart, Wallet, Zap } from "lucide-react"

interface EmbedPageProps {
  params: {
    creatorId: string
  }
}

export default function EmbedPage({ params }: EmbedPageProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tipAmount, setTipAmount] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  
  // Mock creator data - in real app this would be fetched based on creatorId
  const creatorData = {
    name: "Creator Name",
    avatar: "https://via.placeholder.com/64",
    description: "Supporting amazing content creation"
  }

  const presetAmounts = ["0.01", "0.05", "0.1", "0.25"]

  const handleConnectWallet = () => {
    // Mock wallet connection - in real app this would use Wagmi
    setIsConnected(true)
  }

  const handleTip = () => {
    // Mock tip submission - in real app this would handle the actual transaction
    console.log(`Tipping ${tipAmount} MNT to creator ${params.creatorId}`)
    setIsOpen(false)
    setTipAmount("")
  }

  const isValidAmount = tipAmount && parseFloat(tipAmount) > 0

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
                      variant="outline"
                      className="w-full flex items-center gap-2"
                    >
                      <Wallet className="h-4 w-4" />
                      Connect Wallet
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700 font-medium">
                        Wallet Connected
                      </span>
                    </div>
                  )}
                </div>

                {/* Tip Button */}
                <Button
                  onClick={handleTip}
                  disabled={!isValidAmount || !isConnected}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold disabled:opacity-50"
                >
                  {!isConnected 
                    ? "Connect Wallet to Tip" 
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