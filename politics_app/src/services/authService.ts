// src/services/authService.ts
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  TwitterAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "../config/firebaseConfig";

// Create providers
const googleProvider = new GoogleAuthProvider();
const twitterProvider = new TwitterAuthProvider();

// Simple function to handle Google sign-in
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Google login error:", error);
    return { success: false, error };
  }
};

// Simple function to handle Twitter sign-in
export const signInWithTwitter = async () => {
  try {
    const result = await signInWithPopup(auth, twitterProvider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Twitter login error:", error);
    return { success: false, error };
  }
};

// Simple function to handle sign-out
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error };
  }
};

// Function to get the current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Setup auth state listener
export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};
