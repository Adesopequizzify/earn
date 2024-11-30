import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, sendEmailVerification, User, reload } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, collection, query, where, getDocs, addDoc } from 'firebase/firestore'

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

export const createUserDocument = async (user: User, username: string, referralCode?: string) => {
  if (!user) return

  const userRef = doc(db, 'users', user.uid)
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) {
    const { email } = user
    const newUserData = {
      username,
      email,
      points: 1500,
      rank: 'NOVICE',
      createdAt: new Date(),
      emailVerified: false,
      referralCode: generateReferralCode(),
    }

    try {
      await setDoc(userRef, newUserData)

      if (referralCode) {
        await handleReferral(referralCode, user.uid)
      }
    } catch (error) {
      console.error("Error creating user document", error)
    }
  }
}

const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const handleReferral = async (referralCode: string, newUserId: string) => {
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

    // Update new user's points
    await updateDoc(doc(db, 'users', newUserId), {
      points: increment(1500)
    })

    // Add to referrals collection
    await addDoc(collection(db, 'referrals'), {
      referrerId,
      referredId: newUserId,
      date: new Date()
    })
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

