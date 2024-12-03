"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getTelegramUser, initializeTelegramWebApp } from '@/lib/telegram'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { processReferral } from '@/lib/referralSystem'
import { UserData } from '@/lib/types'
import { useToast } from "@/components/ui/use-toast"

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string | null;
}

interface AuthContextType {
  user: TelegramUser | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  refreshUserData: () => Promise<void>;
  statusMessage: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  error: null,
  refreshUserData: async () => {},
  statusMessage: '',
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
  const [statusMessage, setStatusMessage] = useState<string>('Initializing...')
  const { toast } = useToast()

  const refreshUserData = async () => {
    if (user) {
      try {
        setStatusMessage('Refreshing user data...')
        console.log('Refreshing user data for user:', user.id)
        const userRef = doc(db, 'users', user.id.toString())
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          const refreshedUserData = userSnap.data() as UserData
          console.log('Refreshed user data:', refreshedUserData)
          setUserData(refreshedUserData)
          setStatusMessage('User data refreshed')
        } else {
          console.log('User document does not exist')
          setStatusMessage('User data not found')
          toast({
            title: "Error",
            description: "User data not found",
            variant: "destructive",
          })
        }
      } catch (err) {
        console.error('Error refreshing user data:', err)
        setError('Failed to refresh user data')
        setStatusMessage('Failed to refresh user data')
        toast({
          title: "Error",
          description: "Failed to refresh user data",
          variant: "destructive",
        })
      }
    } else {
      console.log('No user to refresh data for')
      setStatusMessage('No user to refresh data for')
    }
  }

  const createOrUpdateUser = async (telegramUser: TelegramUser) => {
    try {
      console.log('Creating or updating user:', telegramUser.id)
      const userRef = doc(db, 'users', telegramUser.id.toString())
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        setStatusMessage('Creating new user...')
        console.log('Creating new user:', telegramUser.id)
        const newUserData: UserData = {
          telegramId: telegramUser.id.toString(),
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name || '',
          username: telegramUser.username || '',
          points: 1500,
          rank: 'NOVICE',
          referralCode: generateReferralCode(telegramUser.id.toString()),
          createdAt: new Date(),
          lastLogin: new Date(),
          completedTasks: [],
          languageCode: telegramUser.language_code
        }

        const webApp = window.Telegram?.WebApp
        const startParam = webApp?.initDataUnsafe?.start_param
        
        if (startParam) {
          setStatusMessage('Processing referral...')
          console.log('Processing referral for new user with start param:', startParam)
          const referralResult = await processReferral(telegramUser.id.toString(), startParam)
          if (referralResult.success) {
            console.log('Referral processed successfully:', referralResult.message)
            newUserData.points += 1000 // Bonus points for being referred
            setStatusMessage('Referral processed successfully')
            toast({
              title: "Referral Successful",
              description: referralResult.message,
            })
          } else {
            console.log('Referral processing failed:', referralResult.message)
            setStatusMessage('Referral processing failed')
            toast({
              title: "Referral Failed",
              description: referralResult.message,
              variant: "destructive",
            })
          }
        } else {
          console.log('No start param found for referral processing')
        }

        setStatusMessage('Saving user data...')
        await setDoc(userRef, newUserData)
        console.log('New user data saved:', newUserData)
        setUserData(newUserData)
        setStatusMessage('Welcome! Your account has been created.')
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully.",
        })
      } else {
        setStatusMessage('Updating existing user...')
        console.log('Updating existing user:', telegramUser.id)
        const existingUserData = userSnap.data() as UserData
        const updatedUserData = {
          ...existingUserData,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name || existingUserData.lastName,
          username: telegramUser.username || existingUserData.username,
          lastLogin: new Date(),
          languageCode: telegramUser.language_code || existingUserData.languageCode
        }
        await setDoc(userRef, updatedUserData, { merge: true })
        console.log('Updated user data:', updatedUserData)
        setUserData(updatedUserData)
        setStatusMessage('Welcome back! Your session has been updated.')
        toast({
          title: "Welcome back!",
          description: "Your session has been updated.",
        })
      }
    } catch (err) {
      console.error('Error in createOrUpdateUser:', err)
      setError('Failed to create or update user data')
      setStatusMessage('Failed to create or update user data')
      toast({
        title: "Error",
        description: "Failed to create or update user data",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        setStatusMessage('Initializing Telegram Web App...')
        console.log('Initializing Telegram Web App')
        initializeTelegramWebApp()
        const telegramUser = getTelegramUser()
        if (telegramUser) {
          setStatusMessage('Telegram user found')
          console.log('Telegram user found:', telegramUser)
          setUser(telegramUser)
          await createOrUpdateUser(telegramUser)
        } else {
          console.log('Telegram Web App data not available')
          setError('Telegram Web App data not available')
          setStatusMessage('Telegram Web App data not available')
          toast({
            title: "Error",
            description: "Telegram Web App data not available",
            variant: "destructive",
          })
        }
      } catch (err) {
        console.error('Error in initAuth:', err)
        setError('Failed to initialize authentication')
        setStatusMessage('Failed to initialize authentication')
        toast({
          title: "Error",
          description: "Failed to initialize authentication",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    // Delay the initialization by 10 seconds
    const timer = setTimeout(() => {
      initAuth()
    }, 10000)

    // Clean up the timer if the component unmounts
    return () => clearTimeout(timer)
  }, [])

  return (
    <AuthContext.Provider value={{ user, userData, loading, error, refreshUserData, statusMessage }}>
      {children}
    </AuthContext.Provider>
  )
}

