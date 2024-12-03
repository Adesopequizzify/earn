import { collection, query, where, getDocs, doc, updateDoc, increment, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { UserData, ReferralData } from "./types";

interface ReferralResult {
  success: boolean;
  message: string;
}

export async function processReferral(newUserId: string, referralCode: string): Promise<ReferralResult> {
  console.log(`Processing referral for new user ${newUserId} with referral code ${referralCode}`);
  try {
    // Find referrer by their referral code
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referralCode', '==', referralCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('No matching referrer found');
      return { success: false, message: 'Invalid referral code' };
    }

    const referrerDoc = querySnapshot.docs[0];
    const referrerId = referrerDoc.id;

    console.log(`Found referrer with ID: ${referrerId}`);

    // Prevent self-referral
    if (referrerId === newUserId) {
      console.log('Self-referral detected, aborting');
      return { success: false, message: 'Self-referral is not allowed' };
    }

    // Update referrer
    const referrerRef = doc(db, 'users', referrerId);
    const referrerBonus = 2500;
    await updateDoc(referrerRef, {
      points: increment(referrerBonus),
    });

    console.log(`Updated referrer ${referrerId} with bonus points`);

    // Record the referral
    const referralRef = doc(db, 'referrals', `${referrerId}_${newUserId}`);
    const referralData: ReferralData = {
      referrerId,
      referredId: newUserId,
      pointsAwarded: referrerBonus,
      timestamp: new Date()
    };
    await setDoc(referralRef, referralData);

    console.log(`Recorded referral in the database`);

    return { success: true, message: `Referral processed successfully. ${referrerBonus} points awarded to referrer.` };
  } catch (error) {
    console.error('Error processing referral:', error);
    return { success: false, message: 'An error occurred while processing the referral' };
  }
}

export async function getReferralStats(userId: string) {
  try {
    const referralsRef = collection(db, 'referrals');
    const q = query(referralsRef, where('referrerId', '==', userId));
    const querySnapshot = await getDocs(q);

    const totalReferrals = querySnapshot.size;
    let totalPoints = 0;

    querySnapshot.forEach((doc) => {
      const referralData = doc.data() as ReferralData;
      totalPoints += referralData.pointsAwarded;
    });

    return { totalReferrals, totalPoints };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return { totalReferrals: 0, totalPoints: 0 };
  }
}

