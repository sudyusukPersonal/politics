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

// プロバイダーを作成
const googleProvider = new GoogleAuthProvider();
const twitterProvider = new TwitterAuthProvider();

// Googleでサインインする関数
export const signInWithGoogle = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);

    // リダイレクト後にgetRedirectResultを呼び出してユーザー情報を取得
    const result = await getRedirectResult(auth);
    if (result) {
      console.log("Googleサインイン成功", result.user);
      console.log("表示名:", result.user.displayName);
      console.log("メールアドレス:", result.user.email);
    }

    return { success: true, user: result?.user };
  } catch (error) {
    console.error("Googleログインエラー:", error);
    return { success: false, error };
  }
};

// Twitterでサインインする関数
export const signInWithTwitter = async () => {
  try {
    await signInWithRedirect(auth, twitterProvider);

    // リダイレクト後にgetRedirectResultを呼び出してユーザー情報を取得
    const result = await getRedirectResult(auth);
    if (result) {
      console.log("Twitterサインイン成功", result.user);
      console.log("表示名:", result.user.displayName);
      console.log("メールアドレス:", result.user.email);
    }

    return { success: true, user: result?.user };
  } catch (error) {
    console.error("Twitterログインエラー:", error);
    return { success: false, error };
  }
};

// サインアウトする関数
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("ログアウトエラー:", error);
    return { success: false, error };
  }
};

// 現在のユーザーを取得する関数
export const getCurrentUser = () => {
  return auth.currentUser;
};

// 認証状態の変更を監視する関数
export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};
