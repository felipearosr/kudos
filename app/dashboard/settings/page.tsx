"use client"

import { useState } from "react"

// Force dynamic rendering to avoid build-time Clerk errors
export const dynamic = 'force-dynamic'
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Copy, Check, Code } from "lucide-react"

export default function Settings() {
  const [copied, setCopied] = useState(false)
  const { user, isLoaded } = useUser()
  
  // Use actual user ID from Clerk authentication
  const creatorId = user?.id || "loading"
  
  // Generate embed code with creator ID
  const embedCode = `<iframe 
  src="${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/embed/${creatorId}" 
  width="300" 
  height="400" 
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
</iframe>`

  const handleCopyCode = async () => {
    if (!isLoaded || !user) return
    
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy embed code:', err)
    }
  }

  // Show loading state while user data is being fetched
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-600">Please sign in to access settings.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Configure your tip jar and get embed code</p>
          </div>
        </div>

        {/* Embed Code Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Embed Code
            </CardTitle>
            <CardDescription>
              Copy this code and paste it into your website, blog, or social media bio to let fans tip you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Code Block */}
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  <code>{embedCode}</code>
                </pre>
                <Button
                  onClick={handleCopyCode}
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                  variant="secondary"
                  size="sm"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Copy Button */}
              <Button 
                onClick={handleCopyCode}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Embed Code
                  </>
                )}
              </Button>
              
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Paste this code into your website&apos;s HTML</li>
                  <li>• Add it to your blog sidebar or footer</li>
                  <li>• Include it in your social media bio links</li>
                  <li>• The widget will display a &quot;Tip Me on Mantle&quot; button</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Widget Preview</CardTitle>
            <CardDescription>
              This is how your tip widget will appear on external sites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-white">
              <div className="max-w-sm mx-auto">
                <iframe 
                  src={`/embed/${creatorId}`}
                  width="300" 
                  height="400" 
                  className="border-0 rounded-lg shadow-lg"
                  title="Tip Widget Preview"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}