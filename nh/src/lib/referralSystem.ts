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

export async function processReferral(newUserId: string, referralCode: string, retryCount = 0): Promise<boolean> {
  try {
    await logReferralStep('Start', { newUserId, referralCode, retryCount });

    // 1. Verify the referral code exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referralCode', '==', referralCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      await logReferralStep('Invalid Referral Code', { referralCode });
      return false;
    }

    const referrerDoc = querySnapshot.docs[0];
    const referrerId = referrerDoc.id;
    const referrerData = referrerDoc.data() as UserData;

    await logReferralStep('Referrer Found', { referrerId, referrerData });

    // 2. Verify this isn't a self-referral
    if (referrerId === newUserId) {
      await logReferralStep('Self-Referral Attempt', { newUserId, referrerId });
      return false;
    }

    // 3. Check if the new user exists and hasn't been referred yet
    const newUserRef = doc(db, 'users', newUserId);
    const newUserSnap = await getDoc(newUserRef);

    if (!newUserSnap.exists()) {
      await logReferralStep('New User Not Found', { newUserId });
      return false;
    }

    const newUserData = newUserSnap.data() as UserData;
    if (newUserData.referredBy) {
      await logReferralStep('User Already Referred', { newUserId, referredBy: newUserData.referredBy });
      return false;
    }

    // 4. Start the batch write
    const batch = writeBatch(db);

    // Update referrer's points
    batch.update(doc(db, 'users', referrerId), {
      points: increment(2500)
    });

    // Update new user's points and referredBy
    batch.update(newUserRef, {
      points: increment(1500),
      referredBy: referrerId
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

    const newUserRewardRef = doc(collection(db, 'rewards'));
    batch.set(newUserRewardRef, {
      userId: newUserId,
      amount: 1500,
      type: 'welcome',
      description: `Welcome bonus from referral by ${referrerData.username}`,
      date: new Date()
    });

    // 5. Commit the batch
    await batch.commit();
    await logReferralStep('Batch Committed', { referrerId, newUserId });

    // 6. Update the pending referral
    const pendingReferralsRef = collection(db, 'pendingReferrals');
    const pendingQuery = query(pendingReferralsRef,
      where('chatId', '==', newUserId),
      where('referralCode', '==', referralCode)
    );
    const pendingSnapshot = await getDocs(pendingQuery);

    if (!pendingSnapshot.empty) {
      const pendingDoc = pendingSnapshot.docs[0];
      await updateDoc(pendingDoc.ref, {
        processed: true,
        processedAt: new Date()
      });
      await logReferralStep('Pending Referral Updated', { pendingDocId: pendingDoc.id });
    }

    await logReferralStep('Referral Processed Successfully', { referrerId, newUserId });
    return true;
  } catch (error) {
    console.error('Error processing referral:', error);
    await logReferralStep('Error', { error, retryCount });

    // Retry mechanism
    if (retryCount < 3) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return processReferral(newUserId, referralCode, retryCount + 1);
    }

    throw error;
  }
}

export async function checkPendingReferrals(userId: string): Promise<void> {
  try {
    console.log('Checking pending referrals for user:', userId);
    const pendingReferralsRef = collection(db, 'pendingReferrals');
    const q = query(
      pendingReferralsRef, 
      where('chatId', '==', userId),
      where('processed', '!=', true)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('Found pending referrals:', querySnapshot.size);

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      console.log('Processing pending referral:', data);
      await processReferral(userId, data.referralCode);
    }
  } catch (error) {
    console.error('Error checking pending referrals:', error);
  }
}

