"use client"

import { useSearchParams } from 'next/navigation'
import { SignUp } from '@/components/SignUp'

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const referralCode = searchParams.get('referral')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            {referralCode 
              ? "Sign up with a referral code to earn bonus points!" 
              : "Enter your details below to create your account"}
          </p>
        </div>
        <SignUp defaultReferralCode={referralCode} />
      </div>
    </div>
  )
}

