"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { SplashScreen } from '@/components/SplashScreen'
import { Dashboard } from '@/components/Dashboard'
import { isTelegramWebApp, showTelegramAlert } from '@/lib/telegram'

export default function Home() {
  const { user, userData, loading, error } = useAuth()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    if (!loading) {
      setTimeout(() => setIsInitializing(false), 2000)
    }
  }, [loading])

  if (loading || isInitializing) {
    return <SplashScreen />
  }

  if (!isTelegramWebApp() && process.env.NODE_ENV === 'production') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-primary">Invalid Environment</h1>
          <p className="text-muted-foreground">
            This app can only be accessed through Telegram.
          </p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-primary">Unable to Connect</h1>
          <p className="text-muted-foreground">
            {error || 'Unable to authenticate. Please try again.'}
          </p>
          <button 
            onClick={() => {
              showTelegramAlert('Retrying connection...')
              window.location.reload()
            }} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return <Dashboard />
}

