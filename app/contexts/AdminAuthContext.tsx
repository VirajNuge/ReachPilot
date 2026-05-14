"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface AdminAuthContextType {
  isAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  // Admin auth is handled by middleware and cookies
  // This provider exists to prevent regular AuthProvider from being used in admin routes
  return (
    <AdminAuthContext.Provider value={{ isAdmin: true }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
