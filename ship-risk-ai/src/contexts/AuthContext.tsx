import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { auth } from "../services/firebase";
import type { User, AuthContextType } from "../types/user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      // Firebase not initialized, use demo mode
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.warn("Auth error:", error.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string) => {
    try {
      setError(null);
      if (!auth) throw new Error("Firebase not configured");
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed";
      setError(message);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      if (!auth) throw new Error("Firebase not configured");
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      if (!auth) throw new Error("Firebase not configured");
      await signOut(auth);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout failed";
      setError(message);
      throw err;
    }
  };

  // Demo user for testing without Firebase
  const loginAsDemo = async () => {
    try {
      setError(null);
      setUser({
        uid: "demo-user-" + Date.now(),
        email: "demo@ship-risk-ai.com",
        displayName: "Demo User",
        photoURL: null,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Demo login failed";
      setError(message);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    loginAsDemo,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
