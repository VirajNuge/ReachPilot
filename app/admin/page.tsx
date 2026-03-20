"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, FileText, UserCircle, Palette, TrendingUp, RefreshCw, Shield } from "lucide-react";

interface StatsData {
  stats: {
    totalUsers: number;
    totalPersonas: number;
    totalPosts: number;
    totalBrandStyles: number;
    newUsersThisMonth: number;
    newPostsThisMonth: number;
  };
  recentUsers: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
  }[];
  postsByStatus: { status: string; count: number }[];
}

function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  delta?: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-semibold text-slate-500 mb-1">{label}</p>
          <p className="text-[32px] font-black text-[#1A1D23] leading-none">{value.toLocaleString()}</p>
          {delta !== undefined && (
            <p className="text-[12px] font-semibold text-emerald-500 mt-2 flex items-center gap-1">
              <TrendingUp size={12} />+{delta} this month
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-3 bg-slate-200 rounded w-24 mb-2" />
          <div className="h-8 bg-slate-200 rounded w-16 mb-2" />
          <div className="h-3 bg-slate-200 rounded w-20" />
        </div>
        <div className="w-11 h-11 bg-slate-200 rounded-2xl" />
      </div>
    </div>
  );
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

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  published: "bg-emerald-100 text-emerald-700",
  scheduled: "bg-blue-100 text-blue-700",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (!res.ok) throw new Error("Failed to load stats");
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Top Header */}
      <header className="w-full flex items-center justify-between px-8 py-4 bg-[#F8F9FC] sticky top-0 z-40 shrink-0 border-b border-slate-100">
        <div className="flex flex-col justify-center">
          <nav className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin</span>
            <span className="text-slate-300 text-[10px]">/</span>
            <span className="text-[10px] font-bold text-[#0052FF] uppercase tracking-widest">Dashboard</span>
          </nav>
          <h1 className="text-2xl font-black text-[#1A1D23] tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
          <Shield size={14} className="text-[#0052FF]" />
          <span className="text-[13px] font-black text-[#1A1D23]">Admin</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <p className="text-[15px] text-slate-500 font-medium mb-8">Welcome back, Viraj. Here&apos;s what&apos;s happening.</p>

        {/* Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8 flex items-center justify-between">
            <p className="text-red-600 font-semibold text-[14px]">{error}</p>
            <button onClick={fetchStats} className="flex items-center gap-2 text-[13px] font-bold text-red-600 hover:text-red-700 bg-transparent border-none cursor-pointer">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Users" value={data.stats.totalUsers} delta={data.stats.newUsersThisMonth} icon={Users} color="bg-[#0052FF]" />
              <StatCard label="Posts Generated" value={data.stats.totalPosts} delta={data.stats.newPostsThisMonth} icon={FileText} color="bg-[#3b82f6]" />
              <StatCard label="Personas" value={data.stats.totalPersonas} icon={UserCircle} color="bg-emerald-500" />
              <StatCard label="Brand Styles" value={data.stats.totalBrandStyles} icon={Palette} color="bg-orange-500" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Recent Users */}
              <div className="xl:col-span-2 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-50">
                  <h2 className="text-[16px] font-black text-[#1A1D23]">Recent Users</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/60">
                        <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {data.recentUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0 ${getAvatarColor(user.id)}`}>
                                {getInitials(user.firstName, user.lastName)}
                              </div>
                              <div>
                                <p className="text-[13px] font-semibold text-[#1A1D23]">{user.firstName} {user.lastName}</p>
                                <p className="text-[12px] text-slate-400">@{user.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[13px] text-slate-500">{user.email}</td>
                          <td className="px-6 py-4 text-[13px] text-slate-400">
                            {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                        </tr>
                      ))}
                      {data.recentUsers.length === 0 && (
                        <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400 text-[13px]">No users yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Post Status */}
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100">
                <div className="px-6 py-5 border-b border-slate-50">
                  <h2 className="text-[16px] font-black text-[#1A1D23]">Post Status</h2>
                </div>
                <div className="px-6 py-5 space-y-3">
                  {data.postsByStatus.length === 0 ? (
                    <p className="text-[13px] text-slate-400 text-center py-4">No posts generated yet</p>
                  ) : (
                    data.postsByStatus.map((s) => (
                      <div key={s.status} className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-[12px] font-bold capitalize ${STATUS_COLORS[s.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {s.status}
                        </span>
                        <span className="text-[15px] font-black text-[#1A1D23]">{s.count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
