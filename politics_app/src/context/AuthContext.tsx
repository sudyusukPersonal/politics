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
} from "../services/authService";

// Context type definition
interface AuthContextType {
  // State
  currentUser: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;

  // Functions
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
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

  // Message handling (simplified for this implementation)
  const showAuthMessage = (message: string) => {
    alert(message); // Simple alert for now
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });

    // Check for existing user
    const initialUser = getCurrentUser();
    if (initialUser) {
      setCurrentUser(initialUser);
    }

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAuthLoading,
        setCurrentUser,
        showAuthMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
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
