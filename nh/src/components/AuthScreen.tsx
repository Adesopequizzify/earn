"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { SignUp } from './SignUp'
import { Login } from './Login'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

export function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false)

  // Create a dummy Promise that resolves to undefined for the referral code
  const dummyReferralCodePromise = Promise.resolve(undefined)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background/95 p-4">
      <Card className="w-full max-w-md bg-background/60 backdrop-blur-sm border-muted/20">
        <CardContent className="pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex justify-center mb-6">
              <div className="relative w-16 h-16">
                <Image
                  src="/assets/logos/main-logo.jpg"
                  alt="NH Logo"
                  width={64}
                  height={64}
                  className="rounded-xl"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-primary">
              Welcome to WheatChain
            </h1>
            {isSignUp ? <SignUp referralCodePromise={dummyReferralCodePromise} /> : <Login />}
            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}
