"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  Coins,
  Bell,
  Sparkles,
  LayoutGrid,
  Plus,
  Check,
  Trash2,
  Loader2,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";

interface TopMenuProps {
  pageName: string;
  tokens?: number;
}

/**
 * TopMenu Component — accounts data is now sourced from AuthContext
 * (no additional API calls on mount).
 */
const TopMenu: React.FC<TopMenuProps> = ({ pageName, tokens = 2000 }) => {
  const { user, loading, accounts, setAccounts, activeAccountId, setActiveAccountId } =
    useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setIsAddingAccount(false);
        setNewAccountName("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchAccount = async (accountId: string) => {
    try {
      const res = await fetch("/api/accounts/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });

      if (res.ok) {
        setActiveAccountId(accountId);
        setIsDropdownOpen(false);
        const newPath = pathname
          .replace(/^\/pages\/appPages\/[^/]+/, `/${accountId}`)
          .replace(/^\/[^/]+\//, `/${accountId}/`);
        router.push(newPath);
      }
    } catch (error) {
      console.error("Failed to switch account", error);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAccountName }),
      });

      if (res.ok) {
        const data = await res.json();
        setAccounts((prev) => [...prev, data.account]);
        setIsAddingAccount(false);
        setNewAccountName("");
        await handleSwitchAccount(data.account._id);
      }
    } catch (error) {
      console.error("Failed to add account", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async (
    e: React.MouseEvent,
    accountId: string
  ) => {
    e.stopPropagation();
    if (accounts.length <= 1) return;
    if (!confirm("Are you sure you want to delete this account?")) return;

    try {
      const res = await fetch(`/api/accounts/${accountId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAccounts((prev) => prev.filter((a) => a._id !== accountId));
      }
    } catch (error) {
      console.error("Failed to delete account", error);
    }
  };

  const activeAccount =
    accounts.find((a) => a._id === activeAccountId) || accounts[0];
  const userInitials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() ||
      "U"
    : "U";

  return (
    <header className="w-full max-w-full flex items-center justify-between px-6 py-3 bg-[#E8ECF2] sticky top-0 z-40 shrink-0 box-border">
      {/* LEFT: PAGE TITLE */}
      <div className="flex flex-col justify-center">
        <nav className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Overview
          </span>
          <span className="text-slate-300 text-[10px]">/</span>
          <span className="text-[10px] font-bold text-[#0052FF] uppercase tracking-widest">
            {pageName}
          </span>
        </nav>
        <h1 className="text-2xl font-black text-[#1A1D23] tracking-tight flex items-center gap-2.5">
          {pageName}
          <div className="flex items-center justify-center w-6 h-6 bg-[#0052FF]/10 rounded-lg">
            <Sparkles size={13} className="text-[#0052FF]" />
          </div>
        </h1>
      </div>

      {/* RIGHT: GLOBAL UTILITIES */}
      <div className="flex items-center gap-3">
        {/* Bell */}
        <div className="relative">
          <button className="p-2.5 text-slate-400 hover:text-[#1A1D23] bg-white hover:shadow-md rounded-xl transition-all border border-white/60 shadow-sm active:scale-95">
            <Bell size={17} strokeWidth={2.5} />
          </button>
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF4D4D] border-2 border-[#E8ECF2] rounded-full animate-pulse" />
        </div>

        {/* Tokens pill */}
        <div className="flex items-center gap-2.5 bg-white border border-white/60 rounded-2xl px-4 py-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer">
          <div className="w-7 h-7 bg-[#0052FF]/10 rounded-xl flex items-center justify-center text-[#0052FF]">
            <Coins size={14} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">
              Tokens
            </span>
            <span className="text-[14px] font-black text-[#1A1D23] tabular-nums leading-none">
              {tokens.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-300/40" />

        {/* Account Switcher — uses AuthContext data, zero extra fetches */}
        <div className="relative z-50" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-white shadow-sm hover:shadow-md border border-white/60 transition-all group"
          >
            <div className="relative">
              <div
                className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden"
                style={{ backgroundColor: activeAccount?.color || "#1A1D23" }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                <span className="relative z-10">
                  {loading ? "?" : userInitials}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-md shadow-sm border border-slate-100 flex items-center justify-center">
                <LayoutGrid size={8} className="text-[#0052FF]" strokeWidth={3} />
              </div>
            </div>
            <div className="text-left hidden xl:block min-w-[100px]">
              {loading ? (
                <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-[13px] font-black text-[#1A1D23] group-hover:text-[#0052FF] transition-colors leading-tight truncate max-w-[120px]">
                  {activeAccount?.name || "My Account"}
                </p>
              )}
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {user?.firstName ? `${user.firstName} ${user.lastName}` : "User"}
              </p>
            </div>
            <ChevronDown
              size={13}
              strokeWidth={3}
              className={`text-slate-300 group-hover:text-[#0052FF] transition-all ml-1 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Panel */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 z-50 min-w-[280px] bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Switch Account
                </span>
                <button
                  onClick={() => setIsAddingAccount(!isAddingAccount)}
                  className="text-[#0052FF] hover:bg-[#0052FF]/10 p-1.5 rounded-lg transition-colors"
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
              </div>

              {/* Add Account Form */}
              {isAddingAccount && (
                <form
                  onSubmit={handleAddAccount}
                  className="p-3 border-b border-slate-100 bg-[#0052FF]/5"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                      placeholder="Account name..."
                      className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] bg-white"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!newAccountName.trim() || isSubmitting}
                      className="bg-[#0052FF] text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-[#0052FF]/90 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[60px]"
                    >
                      {isSubmitting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "Add"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Account List */}
              <div className="max-h-[300px] overflow-y-auto p-2 flex flex-col gap-1">
                {accounts.map((account) => {
                  const isActive = account._id === activeAccount?._id;
                  return (
                    <div
                      key={account._id}
                      onClick={() =>
                        !isActive && handleSwitchAccount(account._id)
                      }
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all group ${
                        isActive ? "bg-[#0052FF]/5" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-[10px] shadow-sm"
                          style={{ backgroundColor: account.color }}
                        >
                          {account.avatarInitials}
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            isActive ? "text-[#0052FF]" : "text-[#1A1D23]"
                          }`}
                        >
                          {account.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isActive && accounts.length > 1 && (
                          <button
                            onClick={(e) =>
                              handleDeleteAccount(e, account._id)
                            }
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        {isActive && (
                          <div className="w-5 h-5 rounded-full bg-[#0052FF] flex items-center justify-center text-white shadow-sm">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopMenu;
