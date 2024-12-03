"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getTelegramUser } from '@/lib/telegram'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface TelegramUser {
  id: number;
  first_name: string;
  last_name: string | null;
  username: string | null;
  photo_url: string | null;
}

interface UserData {
  telegramId: string
  username: string
  points: number
  rank: string
  referralCode: string
  referredBy: string | null
  createdAt: Date
  lastLogin: Date
  completedTasks: string[]
  languageCode: string | null
}

const AuthContext = createContext<{
  user: TelegramUser | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  refreshUserData: () => Promise<void>;
}>({
  user: null,
  userData: null,
  loading: true,
  error: null,
  refreshUserData: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const createOrUpdateUser = async (telegramUser: TelegramUser) => {
    const userRef = doc(db, 'users', telegramUser.id.toString())
    const userDoc = await getDoc(userRef)

    const userData: UserData = {
      telegramId: telegramUser.id.toString(),
      username: telegramUser.username || '',
      points: userDoc.exists() ? userDoc.data()?.points || 0 : 0,
      rank: userDoc.exists() ? userDoc.data()?.rank || 'Beginner' : 'Beginner',
      referralCode: userDoc.exists() ? userDoc.data()?.referralCode || '' : '',
      referredBy: userDoc.exists() ? userDoc.data()?.referredBy || null : null,
      createdAt: userDoc.exists() ? userDoc.data()?.createdAt : new Date(),
      lastLogin: new Date(),
      completedTasks: userDoc.exists() ? userDoc.data()?.completedTasks || [] : [],
      languageCode: userDoc.exists() ? userDoc.data()?.languageCode || null : null,
    }

    await setDoc(userRef, userData, { merge: true })
    setUserData(userData)
  }

  const refreshUserData = async () => {
    if (!user) return
    await createOrUpdateUser(user)
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        initializeTelegramWebApp() // Initialize Telegram Web App
        const telegramUser = getTelegramUser()
        if (telegramUser) {
          setUser(telegramUser)
          await createOrUpdateUser(telegramUser)
        } else {
          setError('Telegram Web App data not available')
        }
      } catch (err) {
        setError('Failed to initialize authentication')
        console.error('Error in initAuth:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, userData, loading, error, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  )
}


function generateReferralCode(telegramId: string): string {
  return `REF${telegramId.substring(0, 6).toUpperCase()}`
}

