import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, increment, writeBatch } from 'firebase/firestore'

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

async function logReferralStep(step: string, details: any) {
  console.log(`Referral Step: ${step}`, details);
}

export async function processReferral(newUserId: string, referralCode: string): Promise<{ referrerId: string } | null> {
  try {
    await logReferralStep('Start', { newUserId, referralCode });

    // 1. Verify the referral code exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referralCode', '==', referralCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      await logReferralStep('Invalid Referral Code', { referralCode });
      return null;
    }

    const referrerDoc = querySnapshot.docs[0];
    const referrerId = referrerDoc.id;
    const referrerData = referrerDoc.data() as UserData;

    await logReferralStep('Referrer Found', { referrerId, referrerData });

    // 2. Verify this isn't a self-referral
    if (referrerId === newUserId) {
      await logReferralStep('Self-Referral Attempt', { newUserId, referrerId });
      return null;
    }

    // 3. Start the batch write
    const batch = writeBatch(db);

    // Update referrer's points
    batch.update(doc(db, 'users', referrerId), {
      points: increment(2500)
    });

    // Create referral record
    const referralRef = doc(collection(db, 'referrals'));
    batch.set(referralRef, {
      referrerId,
      referredId: newUserId,
      date: new Date(),
      processed: true
    });

    // Create reward records
    const referrerRewardRef = doc(collection(db, 'rewards'));
    batch.set(referrerRewardRef, {
      userId: referrerId,
      amount: 2500,
      type: 'referral',
      description: `Referral bonus for inviting user ${newUserId}`,
      date: new Date()
    });

    // 5. Commit the batch
    await batch.commit();
    await logReferralStep('Batch Committed', { referrerId, newUserId });

    await logReferralStep('Referral Processed Successfully', { referrerId, newUserId });
    return { referrerId };
  } catch (error) {
    console.error('Error processing referral:', error);
    await logReferralStep('Error', { error });
    throw error;
  }
}
