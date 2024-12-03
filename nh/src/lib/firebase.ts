import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, collection, query, where, getDocs, addDoc } from 'firebase/firestore'

const firebaseConfig = {
 apiKey: "AIzaSyDuoOrUZxbuB1pq-zajOAEnuq1ia6IrQ8M",
  authDomain: "earn-co.firebaseapp.com",
  projectId: "earn-co",
  storageBucket: "earn-co.firebasestorage.app",
  messagingSenderId: "149304945888",
  appId: "1:149304945888:web:cb1cd493926d982627b485",
  measurementId: "G-96JNDZSD11"
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)

export { app, db }

export const createUserDocument = async (telegramId: string, username: string, referralCode?: string) => {
  const userRef = doc(db, 'users', telegramId)
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) {
    const newUserData = {
      username,
      points: 1500,
      rank: 'NOVICE',
      createdAt: new Date(),
      referralCode: generateReferralCode(telegramId),
      completedTasks: [],
    }

    try {
      await setDoc(userRef, newUserData)

      if (referralCode) {
        await handleReferral(referralCode, telegramId)
      }
    } catch (error) {
      console.error("Error creating user document", error)
    }
  }
}

const generateReferralCode = (telegramId: string) => {
  return `REF${telegramId.substring(0, 6).toUpperCase()}`
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

