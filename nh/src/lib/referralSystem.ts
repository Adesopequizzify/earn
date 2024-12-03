import { db } from './firebase'
import { doc, getDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore'

interface ReferralResult {
  referrerId: string;
  success: boolean;
}

export async function processReferral(newUserId: string, referralCode: string): Promise<ReferralResult | null> {
  try {
    // Find referrer by their referral code
    const usersRef = doc(db, 'users', referralCode)
    const referrerDoc = await getDoc(usersRef)

    if (!referrerDoc.exists()) return null

    const referrerId = referrerDoc.id

    // Prevent self-referral
    if (referrerId === newUserId) return null

    // Update referrer
    await setDoc(doc(db, 'users', referrerId), {
      points: increment(2500), // Bonus for referring
      lastUpdated: serverTimestamp()
    }, { merge: true })

    // Record the referral
    await setDoc(doc(db, 'referrals', `${referrerId}_${newUserId}`), {
      referrerId,
      referredId: newUserId,
      points: 2500,
      timestamp: serverTimestamp()
    })

    return { referrerId, success: true }
  } catch (error) {
    console.error('Error processing referral:', error)
    return null
  }
}

export async function getReferralStats(userId: string) {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) return { totalReferrals: 0, totalPoints: 0 }

    const userData = userDoc.data()
    return {
      totalReferrals: userData.totalReferrals || 0,
      totalPoints: userData.referralPoints || 0
    }
  } catch (error) {
    console.error('Error getting referral stats:', error)
    return { totalReferrals: 0, totalPoints: 0 }
  }
}

