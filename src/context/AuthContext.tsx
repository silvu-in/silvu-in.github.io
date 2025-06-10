
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser, 
  // GoogleAuthProvider, // Removed
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendEmailVerification,
  // signInWithRedirect as firebaseSignInWithRedirect, // Removed for Google
  // getRedirectResult, // Removed for Google
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { UserProfile, Address, PaymentMethod } from '@/types';
import { useToast } from "@/hooks/use-toast";
// import { useRouter } from 'next/navigation'; // useRouter not directly used here anymore

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  // signInWithGoogle: () => Promise<void>; // Removed
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfileData: (data: Partial<Pick<UserProfile, 'address' | 'paymentMethod' | 'displayName' | 'photoURL'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_COLLECTION = 'users';

const defaultAddress: Address = { street: '', city: '', state: '', zip: '', country: 'USA' };
const defaultPaymentMethod: PaymentMethod = { type: 'credit_card', details: '' };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  // const router = useRouter(); // Not used directly in this version of context

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      // setLoading(true); // Moved to be set only after all async ops or at the end
      if (firebaseUser) {
        const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
        let userProfileData: UserProfile;

        try {
          const docSnap = await getDoc(userDocRef);
          let initialDisplayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous User';
          let initialPhotoURL = firebaseUser.photoURL || null;

          if (docSnap.exists()) {
            const firestoreData = docSnap.data() as Partial<UserProfile>;
            userProfileData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firestoreData.displayName || initialDisplayName,
              photoURL: firebaseUser.photoURL || firestoreData.photoURL || initialPhotoURL,
              emailVerified: firebaseUser.emailVerified,
              address: firestoreData.address || defaultAddress,
              paymentMethod: firestoreData.paymentMethod || defaultPaymentMethod,
              createdAt: firestoreData.createdAt, 
              providerData: firebaseUser.providerData,
            };
          } else {
            // New user or document doesn't exist, create it
             initialDisplayName = firebaseUser.displayName || // Use Google's display name if available
                                 (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User') || // Fallback to email part
                                 'Anonymous User'; // Final fallback

            initialPhotoURL = firebaseUser.photoURL || null; // Use Google's photo URL if available


            const newProfileToSave: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: initialDisplayName,
              photoURL: initialPhotoURL,
              emailVerified: firebaseUser.emailVerified,
              address: defaultAddress,
              paymentMethod: defaultPaymentMethod,
              createdAt: serverTimestamp() as Timestamp,
              providerData: firebaseUser.providerData,
            };
            
            // Update Firebase Auth profile if needed (e.g., for email signups or if Google info wasn't immediately available)
            if (firebaseUser.displayName !== newProfileToSave.displayName || firebaseUser.photoURL !== newProfileToSave.photoURL) {
                try {
                    await updateFirebaseProfile(firebaseUser, { 
                        displayName: newProfileToSave.displayName,
                        photoURL: newProfileToSave.photoURL
                    });
                } catch (profileUpdateError) {
                    console.error("Error updating Firebase Auth profile for new user:", profileUpdateError);
                }
            }
            
            // Save to Firestore
            await setDoc(userDocRef, {
              email: newProfileToSave.email,
              displayName: newProfileToSave.displayName,
              photoURL: newProfileToSave.photoURL,
              address: newProfileToSave.address,
              paymentMethod: newProfileToSave.paymentMethod,
              createdAt: newProfileToSave.createdAt,
            });
            userProfileData = newProfileToSave;
          }
          setUser(userProfileData);
        } catch (error) {
          console.error("Error processing user data in onAuthStateChanged:", error);
          // Fallback user object in case of error during Firestore ops
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            address: defaultAddress,
            paymentMethod: defaultPaymentMethod,
            createdAt: undefined, 
            providerData: firebaseUser.providerData,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false); // Set loading to false after all operations are done for this auth state change
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-In redirect result processing (commented out as Google Sign-In is removed)
  /*
  useEffect(() => {
    const processRedirectResult = async () => {
      setLoading(true);
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          // User signed in via redirect. onAuthStateChanged will handle Firestore doc.
          toast({
            title: "Signed in with Google",
            description: "Welcome! Your account is ready.",
          });
        }
      } catch (error: any) {
        console.error("Google Redirect Sign-In Error:", error);
        let message = "An unexpected error occurred during Google Sign-In. Please try again.";
        if (error.code === 'auth/account-exists-with-different-credential') {
          message = "An account already exists with this email using a different sign-in method.";
        } else if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
          message = "Google Sign-In was cancelled.";
        } else if (error.code === 'auth/network-request-failed') {
          message = "A network error occurred while trying to sign in with Google. Please check your internet connection and try again. If the issue persists, ad-blockers, VPNs, or browser extensions might be interfering.";
        } else if (error.code) {
          message = error.message; 
        }
        toast({ title: "Google Sign-In Error", description: message, variant: "destructive" });
      } finally {
        // setLoading(false); // onAuthStateChanged should primarily handle this
      }
    };
    // processRedirectResult(); // Commented out
  }, [toast]);
  */

 const updateUserProfileData = async (dataToUpdate: Partial<Pick<UserProfile, 'address' | 'paymentMethod' | 'displayName' | 'photoURL'>>) => {
    if (user) {
      const userDocRef = doc(db, USERS_COLLECTION, user.uid);
      try {
        await setDoc(userDocRef, dataToUpdate, { merge: true });

        const authProfileUpdates: { displayName?: string | null; photoURL?: string | null } = {};
        if (dataToUpdate.displayName !== undefined && dataToUpdate.displayName !== user.displayName) {
            authProfileUpdates.displayName = dataToUpdate.displayName;
        }
        if (dataToUpdate.photoURL !== undefined && dataToUpdate.photoURL !== user.photoURL) {
            authProfileUpdates.photoURL = dataToUpdate.photoURL;
        }

        if (Object.keys(authProfileUpdates).length > 0) {
            const firebaseAuthUser = auth.currentUser;
            if (firebaseAuthUser) {
                await updateFirebaseProfile(firebaseAuthUser, authProfileUpdates);
            }
        }

        setUser(prevUser => {
          if (!prevUser) return null;
          const updatedUser = { ...prevUser, ...dataToUpdate };
          if (dataToUpdate.address) {
            updatedUser.address = { ...(prevUser.address || defaultAddress), ...dataToUpdate.address };
          }
          if (dataToUpdate.paymentMethod) {
            updatedUser.paymentMethod = { ...(prevUser.paymentMethod || defaultPaymentMethod), ...dataToUpdate.paymentMethod };
          }
          return updatedUser;
        });
      } catch (error) {
        console.error("Error updating user profile in Firestore:", error);
        toast({ title: 'Update Failed', description: 'Could not save your changes.', variant: 'destructive' });
        throw error;
      }
    } else {
      toast({ title: 'Not Authenticated', description: 'You must be logged in to update your profile.', variant: 'destructive' });
      throw new Error('User not authenticated');
    }
  };

  // signInWithGoogle function removed
  // const signInWithGoogle = async () => { ... };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle setting user and eventually setLoading(false).
    } catch (error) {
      console.error("Error signing in with email:", error);
      setLoading(false); // Ensure loading is false on error here
      throw error;
    }
  };
  
  const signUpWithEmail = async (email: string, pass: string, displayName?: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      
      if (userCredential.user) {
        const nameToSet = displayName || email.split('@')[0] || 'User';
        // This update will be reflected in onAuthStateChanged for Firestore doc creation
        await updateFirebaseProfile(userCredential.user, { displayName: nameToSet });
        
        if (!userCredential.user.emailVerified) {
          await sendEmailVerification(userCredential.user);
          toast({
            title: "Verification Email Sent",
            description: "Please check your email to verify your account."
          });
        }
      }
      // onAuthStateChanged will eventually set setLoading(false).
    } catch (error) {
      console.error("Error signing up with email:", error);
      setLoading(false); // Ensure loading is false on error here
      throw error;
    }
  };

  const signOut = async () => {
    // setLoading(true); // Not strictly needed here as onAuthStateChanged will trigger a loading sequence
    try {
      await firebaseSignOut(auth);
      setUser(null); // Immediately set user to null for faster UI update
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ title: "Sign out error", description: "Failed to sign out.", variant: "destructive" });
      // throw error; // Optionally rethrow if callers need to handle it
    } finally {
        // onAuthStateChanged will set user to null and then setLoading(false)
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, /*signInWithGoogle,*/ signInWithEmail, signUpWithEmail, signOut, updateUserProfileData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
