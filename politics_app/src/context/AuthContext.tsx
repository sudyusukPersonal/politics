// src/context/AuthContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { User } from "firebase/auth";
import {
  subscribeToAuthChanges,
  getCurrentUser,
  handleRedirectResult,
} from "../services/authService";

// Context type definition
interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  showAuthMessage: (message: string) => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [redirectChecked, setRedirectChecked] = useState(false);

  // Show auth message in a popup
  const showAuthMessage = (message: string) => {
    // Simple popup message - we're using alert per requirements
    alert(message);
  };

  // First set up auth state listener
  useEffect(() => {
    console.log("Setting up auth state listener");

    const unsubscribe = subscribeToAuthChanges((user) => {
      console.log("Auth state changed:", user?.displayName || "Not logged in");
      setCurrentUser(user);
      setIsAuthLoading(false);
    });

    // Cleanup subscription
    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  // Then check for redirect result (order is important)
  useEffect(() => {
    const checkRedirectResult = async () => {
      if (redirectChecked) return;

      try {
        console.log("Checking for redirect result in AuthContext");
        setIsAuthLoading(true);

        const result = await handleRedirectResult();
        setRedirectChecked(true);

        if (result.success && result.user) {
          console.log(
            "Successful login after redirect:",
            result.user.displayName
          );
          setCurrentUser(result.user);
          showAuthMessage(
            `認証できました。ようこそ、${
              result.user?.displayName || "ユーザー"
            }さん！`
          );
        }
      } catch (error) {
        console.error("Error handling redirect result in AuthContext:", error);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkRedirectResult();
  }, [redirectChecked]);

  const contextValue = {
    currentUser,
    isAuthenticated: !!currentUser,
    isAuthLoading,
    showAuthMessage,
  };

  console.log(
    "Auth context current state:",
    contextValue.isAuthenticated ? "Authenticated" : "Not authenticated",
    contextValue.currentUser?.displayName || ""
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
