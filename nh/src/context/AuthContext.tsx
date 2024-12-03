"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getTelegramUser } from '@/lib/telegram'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface TelegramUser {
  id: string
  username: string
  firstName: string
  lastName: string
  languageCode: string | null // Changed from string to string | null
  isPremium: boolean
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
}

interface AuthContextType {
  user: TelegramUser | null
  userData: UserData | null
  loading: boolean
  error: string | null
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
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
  try {
    const userRef = doc(db, 'users', telegramUser.id)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      const newUserData: UserData = {
        telegramId: telegramUser.id,
        username: telegramUser.username,
        points: 1500,
        rank: 'NOVICE',
        referralCode: generateReferralCode(telegramUser.id),
        referredBy: null,
        createdAt: new Date(),
        lastLogin: new Date(),
        completedTasks: [],
        languageCode: telegramUser.languageCode || 'en' // Provide default value
      }
      await setDoc(userRef, newUserData)
      setUserData(newUserData)
    } else {
      const existingUserData = userSnap.data() as UserData
      const updatedUserData = {
        ...existingUserData,
        lastLogin: new Date(),
        languageCode: telegramUser.languageCode || existingUserData.languageCode || 'en'
      }
      await setDoc(userRef, updatedUserData, { merge: true })
      setUserData(updatedUserData)
    }
  } catch (err) {
    setError('Failed to create or update user data')
    console.error('Error in createOrUpdateUser:', err)
  }
}


  const refreshUserData = async () => {
    if (user) {
      try {
        const userRef = doc(db, 'users', user.id)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          setUserData(userSnap.data() as UserData)
        }
      } catch (err) {
        setError('Failed to refresh user data')
        console.error('Error in refreshUserData:', err)
      }
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
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

