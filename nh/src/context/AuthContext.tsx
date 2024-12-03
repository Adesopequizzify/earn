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
  languageCode: string
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
}

interface AuthContextType {
  user: TelegramUser | null
  userData: UserData | null
  loading: boolean
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  refreshUserData: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const createOrUpdateUser = async (telegramUser: TelegramUser) => {
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
      }
      await setDoc(userRef, newUserData)
      setUserData(newUserData)
    } else {
      const existingUserData = userSnap.data() as UserData
      const updatedUserData = {
        ...existingUserData,
        lastLogin: new Date(),
      }
      await setDoc(userRef, updatedUserData, { merge: true })
      setUserData(updatedUserData)
    }
  }

  const refreshUserData = async () => {
    if (user) {
      const userRef = doc(db, 'users', user.id)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        setUserData(userSnap.data() as UserData)
      }
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      const telegramUser = getTelegramUser()
      if (telegramUser) {
        setUser(telegramUser)
        await createOrUpdateUser(telegramUser)
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, userData, loading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  )
}

function generateReferralCode(telegramId: string): string {
  return `REF${telegramId.substring(0, 6).toUpperCase()}`
}

