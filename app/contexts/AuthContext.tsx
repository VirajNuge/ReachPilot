"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (data: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    setUser(data.user);
    // Redirect to active account, falling back to accounts API to find the first account
    try {
      const [activeRes, accountsRes] = await Promise.all([
        fetch("/api/accounts/active"),
        fetch("/api/accounts"),
      ]);
      const activeData = activeRes.ok ? await activeRes.json() : null;
      const accountsData = accountsRes.ok ? await accountsRes.json() : null;
      const accountId =
        activeData?.accountId ||
        (accountsData?.accounts?.[0]?._id) ||
        "1";
      router.push(`/${accountId}/profileAnalyzer`);
    } catch {
      router.push("/1/profileAnalyzer");
    }
  }, [router]);

  const signup = useCallback(async (formData: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Signup failed");
    }

    setUser(data.user);
    // After signup, accounts API will auto-create the default account
    try {
      const accountsRes = await fetch("/api/accounts");
      const accountsData = accountsRes.ok ? await accountsRes.json() : null;
      const accountId = accountsData?.accounts?.[0]?._id || "1";
      router.push(`/${accountId}/profileAnalyzer`);
    } catch {
      router.push("/1/profileAnalyzer");
    }
  }, [router]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
