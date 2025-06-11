
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendEmailVerification,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { UserProfile, Address, PaymentMethod } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { uploadProfileImage } from '@/lib/firebase/storageService';


interface UpdateUserProfileOptions {
  displayName?: string;
  address?: Address;
  paymentMethod?: PaymentMethod;
  photoFile?: File; 
  photoURL?: string; 
}
interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfileData: (data: UpdateUserProfileOptions) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_COLLECTION = 'users';

const defaultAddress: Address = { street: '', city: '', state: '', zip: '', country: 'India' }; // Default country to India
const defaultPaymentMethod: PaymentMethod = { type: 'credit_card', details: '' };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
        let userProfileData: UserProfile;

        try {
          const docSnap = await getDoc(userDocRef);
          let initialDisplayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous User';
          let initialPhotoURL = firebaseUser.photoURL || (docSnap.exists() ? docSnap.data().photoURL : null);


          if (docSnap.exists()) {
            const firestoreData = docSnap.data() as Partial<UserProfile>;
            userProfileData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firestoreData.displayName || initialDisplayName,
              photoURL: initialPhotoURL, 
              emailVerified: firebaseUser.emailVerified,
              address: firestoreData.address || defaultAddress,
              paymentMethod: firestoreData.paymentMethod || defaultPaymentMethod,
              createdAt: firestoreData.createdAt, 
              providerData: firebaseUser.providerData,
            };
          } else {
            initialDisplayName = firebaseUser.displayName || 
                                 (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User') || 
                                 'Anonymous User';
            initialPhotoURL = firebaseUser.photoURL || null;

            const newProfileToSave: Omit<UserProfile, 'uid' | 'emailVerified' | 'providerData'> = {
              email: firebaseUser.email,
              displayName: initialDisplayName,
              photoURL: initialPhotoURL,
              address: defaultAddress,
              paymentMethod: defaultPaymentMethod,
              createdAt: serverTimestamp() as Timestamp,
            };
            
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
            
            await setDoc(userDocRef, newProfileToSave);
            userProfileData = {
              uid: firebaseUser.uid,
              emailVerified: firebaseUser.emailVerified,
              providerData: firebaseUser.providerData,
              ...newProfileToSave
            } as UserProfile;
          }
          setUser(userProfileData);
        } catch (error) {
          console.error("Error processing user data in onAuthStateChanged:", error);
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
      setLoading(false); 
    });

    return () => unsubscribe();
  }, []);

 const updateUserProfileData = async (dataToUpdate: UpdateUserProfileOptions) => {
    if (!user) {
      toast({ title: 'Not Authenticated', description: 'You must be logged in to update your profile.', variant: 'destructive' });
      throw new Error('User not authenticated');
    }

    const firebaseAuthUser = auth.currentUser;
    if (!firebaseAuthUser) {
      toast({ title: 'Authentication Error', description: 'User session not found. Please log in again.', variant: 'destructive' });
      throw new Error('Firebase Auth user not found');
    }
    
    let newPhotoURL = dataToUpdate.photoURL !== undefined ? dataToUpdate.photoURL : user.photoURL;

    if (dataToUpdate.photoFile) {
      try {
        toast({ title: 'Uploading Photo...', description: 'Please wait.' });
        newPhotoURL = await uploadProfileImage(user.uid, dataToUpdate.photoFile, user.photoURL);
      } catch (uploadError) {
        console.error("Error uploading profile photo:", uploadError);
        toast({ title: 'Photo Upload Failed', description: 'Could not upload your photo. Please try again.', variant: 'destructive' });
        throw uploadError;
      }
    }

    const userDocRef = doc(db, USERS_COLLECTION, user.uid);
    const firestoreUpdates: Partial<UserProfile> = {};
    const authProfileUpdates: { displayName?: string | null; photoURL?: string | null } = {};

    if (dataToUpdate.displayName !== undefined && dataToUpdate.displayName !== user.displayName) {
      firestoreUpdates.displayName = dataToUpdate.displayName;
      authProfileUpdates.displayName = dataToUpdate.displayName;
    }
    if (newPhotoURL !== user.photoURL) {
      firestoreUpdates.photoURL = newPhotoURL;
      authProfileUpdates.photoURL = newPhotoURL;
    }
    if (dataToUpdate.address) {
      firestoreUpdates.address = { ...(user.address || defaultAddress), ...dataToUpdate.address };
      if(!firestoreUpdates.address.country) firestoreUpdates.address.country = 'India'; // Ensure default country
    }
    if (dataToUpdate.paymentMethod) {
      firestoreUpdates.paymentMethod = { ...(user.paymentMethod || defaultPaymentMethod), ...dataToUpdate.paymentMethod };
    }

    try {
      if (Object.keys(firestoreUpdates).length > 0) {
        await setDoc(userDocRef, firestoreUpdates, { merge: true });
      }
      if (Object.keys(authProfileUpdates).length > 0) {
        await updateFirebaseProfile(firebaseAuthUser, authProfileUpdates);
      }

      setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, ...firestoreUpdates }; 
        if (newPhotoURL !== undefined) updatedUser.photoURL = newPhotoURL;
        return updatedUser;
      });
      
      if (dataToUpdate.displayName || dataToUpdate.address || dataToUpdate.paymentMethod || (dataToUpdate.photoURL && !dataToUpdate.photoFile)) {
         toast({ title: 'Profile Updated', description: 'Your profile has been saved.' });
      } else if (dataToUpdate.photoFile && newPhotoURL) {
         toast({ title: 'Photo Updated', description: 'Your new profile photo has been saved.' });
      }

    } catch (error) {
      console.error("Error updating user profile:", error);
      toast({ title: 'Update Failed', description: 'Could not save your changes.', variant: 'destructive' });
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Error signing in with email:", error);
      setLoading(false); 
      throw error;
    }
  };
  
  const signUpWithEmail = async (email: string, pass: string, displayName?: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      
      if (userCredential.user) {
        const nameToSet = displayName || email.split('@')[0] || 'User';
        await updateFirebaseProfile(userCredential.user, { displayName: nameToSet });
        
        if (!userCredential.user.emailVerified) {
          await sendEmailVerification(userCredential.user);
          toast({
            title: "Verification Email Sent",
            description: "Please check your email to verify your account."
          });
        }
      }
    } catch (error) {
      console.error("Error signing up with email:", error);
      setLoading(false); 
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null); 
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ title: "Sign out error", description: "Failed to sign out.", variant: "destructive" });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, signOut, updateUserProfileData }}>
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

    