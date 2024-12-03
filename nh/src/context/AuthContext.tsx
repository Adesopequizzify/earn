"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getTelegramUser, initializeTelegramWebApp } from '@/lib/telegram'
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/lib/firebase'

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
  return `REF${telegramId.substring(0, 6).toUpperCase()}`
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const createOrUpdateUser = async (telegramUser: TelegramUser) => {
    try {
      const userRef = doc(db, 'users', telegramUser.id.toString())
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
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
        await setDoc(userRef, newUserData)
        setUserData(newUserData)

        // Check for pending referrals
        await checkPendingReferrals(telegramUser.id.toString())
      } else {
        const existingUserData = userSnap.data() as UserData
        const updatedUserData = {
          ...existingUserData,
          lastLogin: new Date(),
          languageCode: telegramUser.language_code || existingUserData.languageCode
        }
        await setDoc(userRef, updatedUserData, { merge: true })
        setUserData(updatedUserData)
      }
    } catch (err) {
      setError('Failed to create or update user data')
      console.error('Error in createOrUpdateUser:', err)
    }
  }

  const checkPendingReferrals = async (userId: string) => {
    const pendingReferralsRef = collection(db, 'pendingReferrals')
    const q = query(pendingReferralsRef, where('chatId', '==', userId))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const pendingReferral = querySnapshot.docs[0].data()
      const referralCode = pendingReferral.referralCode

      // Process the referral
      await processReferral(userId, referralCode)

      // Delete the pending referral
      await setDoc(querySnapshot.docs[0].ref, { processed: true }, { merge: true })
    }
  }

  const processReferral = async (newUserId: string, referralCode: string) => {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('referralCode', '==', referralCode))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const referrerDoc = querySnapshot.docs[0]
      const referrerId = referrerDoc.id

      // Update referrer's points
      await updateDoc(doc(db, 'users', referrerId), {
        points: increment(2500)
      })

      // Update new user's points and set referredBy
      await updateDoc(doc(db, 'users', newUserId), {
        points: increment(1500),
        referredBy: referrerId
      })

      // Add to referrals collection
      await setDoc(doc(collection(db, 'referrals')), {
        referrerId,
        referredId: newUserId,
        date: new Date()
      })
    }
  }

  const refreshUserData = async () => {
    if (user) {
      try {
        const userRef = doc(db, 'users', user.id.toString())
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
        initializeTelegramWebApp()
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

