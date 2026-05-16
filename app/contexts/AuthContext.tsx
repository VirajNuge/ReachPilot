"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface Account {
  _id: string;
  name: string;
  avatarInitials: string;
  color: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // ── Accounts (lifted here so TopMenu never re-fetches) ──
  accounts: Account[];
  activeAccountId: string | null;
  setActiveAccountId: (id: string) => void;
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  // ── Auth actions ──────────────────────────────────────
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

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const router = useRouter();

  // ── Single batch fetch on mount — replaces 3 separate serial calls ─────────
  useEffect(() => {
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      // Fire all three in parallel — one round-trip window for everything
      const [meRes, accountsRes, activeRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/accounts"),
        fetch("/api/accounts/active"),
      ]);

      if (meRes.ok) {
        const data = await meRes.json();
        setUser(data.user ?? null);
      } else {
        setUser(null);
      }

      if (accountsRes.ok) {
        const data = await accountsRes.json();
        setAccounts(data.accounts ?? []);
      }

      if (activeRes.ok) {
        const data = await activeRes.json();
        setActiveAccountId(data.accountId ?? null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (username: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      setUser(data.user);

      // Fetch accounts + active in parallel after login
      try {
        const [accountsRes, activeRes] = await Promise.all([
          fetch("/api/accounts"),
          fetch("/api/accounts/active"),
        ]);
        let resolvedAccounts: Account[] = [];
        let resolvedActive: string | null = null;

        if (accountsRes.ok) {
          const d = await accountsRes.json();
          resolvedAccounts = d.accounts ?? [];
          setAccounts(resolvedAccounts);
        }
        if (activeRes.ok) {
          const d = await activeRes.json();
          resolvedActive = d.accountId ?? null;
          setActiveAccountId(resolvedActive);
        }

        const accountId =
          resolvedActive ||
          resolvedAccounts[0]?._id ||
          "1";
        router.push(`/${accountId}/profileAnalyzer`);
      } catch {
        router.push("/1/profileAnalyzer");
      }
    },
    [router]
  );

  // ── Signup ─────────────────────────────────────────────────────────────────
  const signup = useCallback(
    async (formData: {
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
      if (!res.ok) throw new Error(data.error || "Signup failed");

      setUser(data.user);

      try {
        const accountsRes = await fetch("/api/accounts");
        if (accountsRes.ok) {
          const d = await accountsRes.json();
          const accs: Account[] = d.accounts ?? [];
          setAccounts(accs);
          const accountId = accs[0]?._id || "1";
          router.push(`/${accountId}/profileAnalyzer`);
        } else {
          router.push("/1/profileAnalyzer");
        }
      } catch {
        router.push("/1/profileAnalyzer");
      }
    },
    [router]
  );

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setAccounts([]);
    setActiveAccountId(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        accounts,
        activeAccountId,
        setActiveAccountId,
        setAccounts,
        login,
        signup,
        logout,
      }}
    >
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
