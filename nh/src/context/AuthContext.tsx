"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getTelegramUser, initializeTelegramWebApp } from '@/lib/telegram'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { processReferral } from '@/lib/referralSystem'

interface TelegramUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string | null;
}

interface UserData {
  telegramId: string;
  username: string;
  points: number;
  rank: string;
  referralCode: string;
  referredBy: string | null;
  createdAt: Date;
  lastLogin: Date;
  completedTasks: string[];
  languageCode: string | null;
}

interface AuthContextType {
  user: TelegramUser | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  error: null,
  refreshUserData: async () => {},
})

export const useAuth = () => useContext(AuthContext)

function generateReferralCode(telegramId: string): string {
  return `WC${telegramId.substring(0, 6).toUpperCase()}`
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUserData = async () => {
    if (user) {
      try {
        console.log('Refreshing user data for user:', user.id)
        const userRef = doc(db, 'users', user.id.toString())
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          const refreshedUserData = userSnap.data() as UserData
          console.log('Refreshed user data:', refreshedUserData)
          setUserData(refreshedUserData)
        } else {
          console.log('User document does not exist')
        }
      } catch (err) {
        console.error('Error refreshing user data:', err)
        setError('Failed to refresh user data')
      }
    } else {
      console.log('No user to refresh data for')
    }
  }

  const createOrUpdateUser = async (telegramUser: TelegramUser) => {
    try {
      console.log('Creating or updating user:', telegramUser.id)
      const userRef = doc(db, 'users', telegramUser.id.toString())
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        console.log('Creating new user:', telegramUser.id)
        const newUserData: UserData = {
          telegramId: telegramUser.id.toString(),
          username: telegramUser.username,
          points: 1500,
          rank: 'NOVICE',
          referralCode: generateReferralCode(telegramUser.id.toString()),
          referredBy: null,
          createdAt: new Date(),
          lastLogin: new Date(),
          completedTasks: [],
          languageCode: telegramUser.language_code
        }

        const webApp = window.Telegram?.WebApp
        const startParam = webApp?.initDataUnsafe?.start_param
        
        if (startParam) {
          console.log('Processing referral for new user with start param:', startParam)
          const referralResult = await processReferral(telegramUser.id.toString(), startParam)
          if (referralResult) {
            console.log('Referral processed successfully:', referralResult)
            newUserData.referredBy = referralResult.referrerId
            newUserData.points += 1000 // Bonus points for being referred
          } else {
            console.log('Referral processing did not return a result')
          }
        } else {
          console.log('No start param found for referral processing')
        }

        await setDoc(userRef, newUserData)
        console.log('New user data saved:', newUserData)
        setUserData(newUserData)
      } else {
        console.log('Updating existing user:', telegramUser.id)
        const existingUserData = userSnap.data() as UserData
        const updatedUserData = {
          ...existingUserData,
          lastLogin: new Date(),
          languageCode: telegramUser.language_code || existingUserData.languageCode
        }
        await setDoc(userRef, updatedUserData, { merge: true })
        console.log('Updated user data:', updatedUserData)
        setUserData(updatedUserData)
      }
    } catch (err) {
      console.error('Error in createOrUpdateUser:', err)
      setError('Failed to create or update user data')
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('Initializing Telegram Web App')
        initializeTelegramWebApp()
        const telegramUser = getTelegramUser()
        if (telegramUser) {
          console.log('Telegram user found:', telegramUser)
          setUser(telegramUser)
          await createOrUpdateUser(telegramUser)
        } else {
          console.log('Telegram Web App data not available')
          setError('Telegram Web App data not available')
        }
      } catch (err) {
        console.error('Error in initAuth:', err)
        setError('Failed to initialize authentication')
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

