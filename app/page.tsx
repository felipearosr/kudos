import { SignUp } from "@clerk/nextjs"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, Zap, Globe, Shield } from "lucide-react"

// Force dynamic rendering to avoid build-time Clerk errors
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div className="min-h-screen flex">
      {/* Left Section - Yellow Branding */}
      <div className="flex-1 bg-yellow-400 p-8 flex flex-col justify-center items-center text-black">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <Coins className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">Mantle Tip Jar</h1>
            <p className="text-xl opacity-90">Gasless crypto tipping for creators</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Zap className="w-6 h-6" />
              <span className="text-lg">Zero gas fees for your fans</span>
            </div>
            <div className="flex items-center space-x-3">
              <Globe className="w-6 h-6" />
              <span className="text-lg">Embed anywhere on the web</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6" />
              <span className="text-lg">Secure on Mantle network</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - White Sign-up Form */}
      <div className="flex-1 bg-white p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Get Started</h2>
            <p className="text-gray-600">Create your tip jar and start earning</p>
          </div>

          <div className="flex justify-center">
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: 
                    "bg-yellow-400 hover:bg-yellow-500 text-black font-semibold",
                  card: "shadow-none border-0",
                }
              }}
            />
          </div>

          {/* Feature Highlight Cards */}
          <div className="mt-12 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Easy Setup</CardTitle>
                <CardDescription>
                  Get your tip jar ready in under 2 minutes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Instant Withdrawals</CardTitle>
                <CardDescription>
                  Access your earnings immediately on Mantle network
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Fan-Friendly</CardTitle>
                <CardDescription>
                  Your supporters tip without paying any gas fees
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}