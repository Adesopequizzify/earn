"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { sendVerificationEmail } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export function EmailVerification() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isResending, setIsResending] = useState(false)

  const handleResendVerification = async () => {
    if (!user) return

    setIsResending(true)
    try {
      await sendVerificationEmail(user)
      toast({
        title: "Verification email sent",
        description: "Please check your inbox.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleManualVerification = () => {
    // In a real application, you would implement a server-side check here
    // For now, we'll just simulate a successful verification
    window.location.reload()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-primary mb-4">Verify Your Email</h1>
        <p className="text-muted-foreground mb-6">
          We've sent a verification email to your inbox. Please verify your email to continue.
        </p>
        <div className="space-y-4">
          <Button onClick={handleResendVerification} disabled={isResending}>
            {isResending ? "Resending..." : "Resend Verification Email"}
          </Button>
          <Button onClick={handleManualVerification} variant="outline">
            I've Verified My Email
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

