"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { SplashScreen } from '@/components/SplashScreen'
import { AuthScreen } from '@/components/AuthScreen'
import { Dashboard } from '@/components/Dashboard'
import { EmailVerification } from '@/components/EmailVerification'

export default function Home() {
  const { user, loading, emailVerified } = useAuth()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    if (!loading) {
      // Simulate initialization process
      setTimeout(() => setIsInitializing(false), 2000)
    }
  }, [loading])

  if (loading || isInitializing) {
    return <SplashScreen />
  }

  if (!user) {
    return <AuthScreen />
  }

  if (!emailVerified) {
    return <EmailVerification />
  }

  return <Dashboard />
}

