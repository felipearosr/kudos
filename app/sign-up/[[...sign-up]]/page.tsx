import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignUp 
        forceRedirectUrl="/onboarding/complete-profile"
        fallbackRedirectUrl="/onboarding/complete-profile"
        appearance={{
          elements: {
            formButtonPrimary: 
              "bg-yellow-400 hover:bg-yellow-500 text-black font-semibold",
            card: "shadow-lg",
          }
        }}
      />
    </div>
  )
}