"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, X, ChevronLeft, ChevronRight, Users, Shield } from "lucide-react";

interface AdminUser {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  pages: number;
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

function getAvatarColor(str: string) {
  const colors = [
    "bg-[#0052FF]", "bg-blue-500", "bg-emerald-500",
    "bg-orange-500", "bg-pink-500", "bg-teal-500",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[0,1,2,3,4].map(i => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-200 rounded w-24" />
        </td>
      ))}
    </tr>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params}`, { credentials: "include" });
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (!res.ok) throw new Error("Failed to load users");
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [page, search, router]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Top Header */}
      <header className="w-full flex items-center justify-between px-8 py-4 bg-[#F8F9FC] sticky top-0 z-40 shrink-0 border-b border-slate-100">
        <div className="flex flex-col justify-center">
          <nav className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin</span>
            <span className="text-slate-300 text-[10px]">/</span>
            <span className="text-[10px] font-bold text-[#0052FF] uppercase tracking-widest">Users</span>
          </nav>
          <h1 className="text-2xl font-black text-[#1A1D23] tracking-tight">
            Users {data ? <span className="text-slate-400 font-semibold text-lg">({data.total.toLocaleString()})</span> : null}
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
          <Shield size={14} className="text-[#0052FF]" />
          <span className="text-[13px] font-black text-[#1A1D23]">Admin</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, username, or email..."
              className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium text-[#1A1D23] placeholder-slate-400 outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/20 transition-colors"
            />
            {searchInput && (
              <button type="button" onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">
                <X size={14} />
              </button>
            )}
          </div>
        </form>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          {error ? (
            <div className="p-8 text-center">
              <p className="text-red-500 font-semibold">{error}</p>
              <button onClick={fetchUsers} className="mt-3 text-[13px] text-[#0052FF] font-bold bg-transparent border-none cursor-pointer hover:underline">Retry</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-100">
                    <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    [0,1,2,3,4,5].map(i => <SkeletonRow key={i} />)
                  ) : !data || data.users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <Users size={32} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-[14px] font-semibold text-slate-400">
                          {search ? "No users match your search" : "No users found"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    data.users.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 ${getAvatarColor(user._id)}`}>
                              {getInitials(user.firstName, user.lastName)}
                            </div>
                            <p className="text-[14px] font-semibold text-[#1A1D23]">{user.firstName} {user.lastName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-slate-500">@{user.username}</td>
                        <td className="px-6 py-4 text-[13px] text-slate-500">{user.email}</td>
                        <td className="px-6 py-4 text-[13px] text-slate-400">
                          {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => router.push(`/admin/users/${user._id}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0052FF] hover:bg-[#0047FF] text-white text-[12px] font-bold rounded-lg transition-colors cursor-pointer border-none"
                          >
                            <Eye size={13} /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data && data.pages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[13px] text-slate-400">
                Page {data.page} of {data.pages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                  disabled={page === data.pages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
