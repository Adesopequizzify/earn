"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Onboarding } from '@/components/Onboarding'
import { Dashboard } from '@/components/Dashboard'
import { Loading } from '@/components/Loading'

export default function Home() {
  const { user, loading } = useAuth()
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    if (user) {
      // Check if the user is new (you might want to check this in Firestore)
      setIsNewUser(true)
    }
  }, [user])

  if (loading) {
    return <Loading />
  }

  if (!user) {
    return <Onboarding />
  }

  if (isNewUser) {
    return <Onboarding isNewUser />
  }

  return <Dashboard />
}

