import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, sendEmailVerification, User, reload } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db }

export const createUserDocument = async (user: User, username: string) => {
  if (!user) return

  const userRef = doc(db, 'users', user.uid)
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) {
    const { email } = user
    try {
      await setDoc(userRef, {
        username,
        email,
        points: 2500,
        rank: 'NOVICE',
        createdAt: new Date(),
        emailVerified: false,
      })
    } catch (error) {
      console.error("Error creating user document", error)
    }
  }
}

export const sendVerificationEmail = async (user: User) => {
  try {
    await sendEmailVerification(user)
  } catch (error) {
    console.error("Error sending verification email", error)
    throw error
  }
}

export const checkEmailVerification = async (user: User): Promise<boolean> => {
  try {
    await reload(user)
    return user.emailVerified
  } catch (error) {
    console.error("Error checking email verification", error)
    throw error
  }
}

export const updateUserEmailVerificationStatus = async (userId: string, isVerified: boolean) => {
  const userRef = doc(db, 'users', userId)
  try {
    await updateDoc(userRef, { emailVerified: isVerified })
  } catch (error) {
    console.error("Error updating user email verification status", error)
    throw error
  }
}

export const updateUserRank = async (userId: string, points: number) => {
  const userRef = doc(db, 'users', userId)
  let newRank = 'NOVICE'

  if (points >= 50000) newRank = 'LEGEND'
  else if (points >= 10000) newRank = 'MASTER'
  else if (points >= 5000) newRank = 'EXPERT'
  else if (points >= 1000) newRank = 'ADEPT'

  try {
    await updateDoc(userRef, { rank: newRank })
  } catch (error) {
    console.error("Error updating user rank", error)
  }
}

