"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, db, checkEmailVerification, updateUserEmailVerificationStatus } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  emailVerified: boolean;
  refreshEmailVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  emailVerified: false,
  refreshEmailVerification: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        const isVerified = await checkEmailVerification(user);
        setEmailVerified(isVerified);
        await updateUserEmailVerificationStatus(user.uid, isVerified);
      } else {
        setEmailVerified(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setUserData(doc.data());
        } else {
          setUserData(null);
        }
      });

      return unsubscribe;
    }
  }, [user]);

  const refreshEmailVerification = async () => {
    if (user) {
      const isVerified = await checkEmailVerification(user);
      setEmailVerified(isVerified);
      await updateUserEmailVerificationStatus(user.uid, isVerified);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, emailVerified, refreshEmailVerification }}>
      {children}
    </AuthContext.Provider>
  );
};

