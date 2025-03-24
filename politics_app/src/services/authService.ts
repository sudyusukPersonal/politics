// src/services/authService.ts
import {
  getAuth,
  signInWithRedirect,
  GoogleAuthProvider,
  TwitterAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  getRedirectResult,
} from "firebase/auth";
import { auth } from "../config/firebaseConfig";

// Create providers
const googleProvider = new GoogleAuthProvider();
const twitterProvider = new TwitterAuthProvider();

// Function to handle Google sign-in with redirect
export const signInWithGoogle = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
    return { success: true };
  } catch (error) {
    console.error("Google login error:", error);
    return { success: false, error };
  }
};

// Function to handle Twitter sign-in with redirect
export const signInWithTwitter = async () => {
  try {
    await signInWithRedirect(auth, twitterProvider);
    return { success: true };
  } catch (error) {
    console.error("Twitter login error:", error);
    return { success: false, error };
  }
};

// Function to handle redirect result
export const handleRedirectResult = async () => {
  try {
    console.log("Checking for redirect result...");
    const result = await getRedirectResult(auth);
    if (result) {
      console.log("Redirect result found:", result.user?.displayName);
      return { success: true, user: result.user };
    }
    console.log("No redirect result found");
    return { success: false, user: null };
  } catch (error) {
    console.error("Redirect result error:", error);
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
