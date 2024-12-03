"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getTelegramUser, initializeTelegramWebApp } from '@/lib/telegram'
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, increment, writeBatch } from 'firebase/firestore'
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

  const refreshUserData = async () => {
    if (user) {
      try {
        const userRef = doc(db, 'users', user.id.toString())
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          const refreshedUserData = userSnap.data() as UserData
          setUserData(refreshedUserData)
        }
      } catch (err) {
        console.error('Error refreshing user data:', err)
        setError('Failed to refresh user data')
      }
    }
  }

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
    try {
      // First, verify the referral code exists and hasn't been used
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('referralCode', '==', referralCode))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        console.log('Invalid referral code:', referralCode)
        return
      }

      const referrerDoc = querySnapshot.docs[0]
      const referrerId = referrerDoc.id
      const referrerData = referrerDoc.data() as UserData

      // Verify this isn't a self-referral
      if (referrerId === newUserId) {
        console.log('Self-referral not allowed')
        return
      }

      // Check if the new user has already been referred
      const newUserRef = doc(db, 'users', newUserId)
      const newUserSnap = await getDoc(newUserRef)

      if (!newUserSnap.exists()) {
        console.log('New user document not found')
        return
      }

      const newUserData = newUserSnap.data() as UserData
      if (newUserData.referredBy) {
        console.log('User has already been referred')
        return
      }

      // Start the batch write
      const batch = writeBatch(db)

      // 1. Update referrer's points
      batch.update(doc(db, 'users', referrerId), {
        points: increment(2500)
      })

      // 2. Update new user's points and referredBy
      batch.update(newUserRef, {
        points: increment(1500),
        referredBy: referrerId
      })

      // 3. Create referral record
      const referralRef = doc(collection(db, 'referrals'))
      batch.set(referralRef, {
        referrerId,
        referredId: newUserId,
        date: new Date().toISOString(),
        processed: true
      })

      // 4. Create reward records
      const referrerRewardRef = doc(collection(db, 'rewards'))
      batch.set(referrerRewardRef, {
        userId: referrerId,
        amount: 2500,
        type: 'referral',
        description: `Referral bonus for inviting user ${newUserId}`,
        date: new Date().toISOString()
      })

      const newUserRewardRef = doc(collection(db, 'rewards'))
      batch.set(newUserRewardRef, {
        userId: newUserId,
        amount: 1500,
        type: 'welcome',
        description: `Welcome bonus from referral by ${referrerData.username}`,
        date: new Date().toISOString()
      })

      // Commit the batch
      await batch.commit()

      // After successful batch commit, update the pending referral
      const pendingReferralsRef = collection(db, 'pendingReferrals')
      const pendingQuery = query(pendingReferralsRef,
        where('chatId', '==', newUserId),
        where('referralCode', '==', referralCode)
      )
      const pendingSnapshot = await getDocs(pendingQuery)

      if (!pendingSnapshot.empty) {
        const pendingDoc = pendingSnapshot.docs[0]
        await updateDoc(pendingDoc.ref, {
          processed: true,
          processedAt: new Date().toISOString()
        })
      }

      console.log('Referral processed successfully')

      // Refresh the user data to reflect new points
      await refreshUserData()

    } catch (error) {
      console.error('Error processing referral:', error)
      throw error
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

