'use client';

import React, { useMemo, type ReactNode, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// This flag ensures the default user creation runs only once per session.
let defaultUserCreated = false;

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    const createDefaultUser = async () => {
      if (!firebaseServices.auth || defaultUserCreated) {
        return;
      }
      defaultUserCreated = true; // Set flag to run only once per session

      // If a user is already logged in when the app loads, don't interfere.
      if (firebaseServices.auth.currentUser) {
        return;
      }

      const email = 'varnikaindane123@gmail.com';
      const password = 'Anil@123';

      try {
        // Attempt to create the user. This will auto-sign them in.
        await createUserWithEmailAndPassword(firebaseServices.auth, email, password);
        console.log('Default user created successfully. Signing out to ensure clean state.');
        // IMPORTANT: Immediately sign out the user that was just created
        // to ensure the app starts in a logged-out state.
        await signOut(firebaseServices.auth);
      } catch (error: any) {
        // If the user already exists, that's fine. We don't need to do anything.
        if (error.code === 'auth/email-already-in-use') {
          console.log('Default user already exists.');
        } else {
          // For other errors, log them.
          console.error('Failed to create default user:', error);
        }
      }
    };

    createDefaultUser();
  }, [firebaseServices.auth]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
