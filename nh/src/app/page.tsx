"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { SplashScreen } from '@/components/SplashScreen'
import { Dashboard } from '@/components/Dashboard'

export default function Home() {
  const { user, userData, loading, error } = useAuth()
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

  if (error || !user) {
    // Handle error state, possibly show an error component
    return <div>Error: {error || 'Unable to authenticate'}</div>
  }

  return <Dashboard />
}

