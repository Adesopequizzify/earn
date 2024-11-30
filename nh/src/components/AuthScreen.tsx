"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { SignUp } from './SignUp'
import { Login } from './Login'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

export function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  })

  const handleStepComplete = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(prev => prev + 1)
  }

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
                  src="/placeholder.svg?height=64&width=64"
                  alt="NH Logo"
                  width={64}
                  height={64}
                  className="rounded-xl"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-primary">
              Welcome to NH
            </h1>
            <AnimatePresence mode="wait">
              {isSignUp ? (
                <SignUp 
                  key="signup"
                  step={step}
                  formData={formData}
                  onStepComplete={handleStepComplete}
                />
              ) : (
                <Login key="login" />
              )}
            </AnimatePresence>
            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setStep(1)
                  setFormData({ email: '', password: '', username: '' })
                }}
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

