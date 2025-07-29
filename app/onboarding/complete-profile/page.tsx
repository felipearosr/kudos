import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, User } from "lucide-react"

export default function CompleteProfile() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Let your supporters know who you are</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              This information will be displayed on your tip jar page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src="" alt="Profile picture" />
                <AvatarFallback>
                  <User className="w-12 h-12 text-gray-400" />
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
              </Button>
              <p className="text-sm text-gray-500 text-center">
                Upload a profile picture to help your supporters recognize you
              </p>
            </div>

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Display Name *
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Your display name"
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">
                This is how your name will appear to supporters
              </p>
            </div>

            {/* Website Input */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website or Social Link
              </label>
              <Input
                id="website"
                type="url"
                placeholder="https://your-website.com or https://twitter.com/username"
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">
                Link to your main website, social media, or content platform
              </p>
            </div>

            {/* About Textarea */}
            <div>
              <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-2">
                About You
              </label>
              <Textarea
                id="about"
                placeholder="Tell your supporters about yourself and what you create..."
                className="w-full min-h-[120px]"
              />
              <p className="text-sm text-gray-500 mt-1">
                Share what you do and why supporters should tip you
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button variant="outline" className="flex-1">
                Save as Draft
              </Button>
              <Button asChild className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black">
                <Link href="/onboarding/payout-method">
                  Continue to Payout Setup
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <div className="w-8 h-1 bg-yellow-400"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <div className="w-8 h-1 bg-gray-200"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-semibold">
              3
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">Step 1 of 3: Complete Profile</p>
        </div>
      </div>
    </div>
  )
}