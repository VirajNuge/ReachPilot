"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Trash2, AlertTriangle, Shield } from "lucide-react";

interface UserDetail {
  user: {
    _id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
  };
  personas: {
    _id: string;
    personaName: string;
    userRole: string;
    industry: string;
    writingStyle: string;
    createdAt: string;
    updatedAt: string;
    toneSliders?: {
      formalCasual: number;
      seriousPlayful: number;
      inspiringInformative: number;
      dataDriven: number;
    };
  }[];
  postStats: {
    total: number;
    recent: {
      id: string;
      platform: string;
      objective: string;
      status: string;
      createdAt: string;
    }[];
  };
  brandStyles: {
    _id: string;
    name: string;
    colorPalette: string[];
    visualStyle: string;
    fontFamily: string;
  }[];
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

function getAvatarColor(str: string) {
  const colors = ["bg-[#0052FF]", "bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-pink-500", "bg-teal-500"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  published: "bg-emerald-100 text-emerald-700",
  scheduled: "bg-blue-100 text-blue-700",
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram_post: "Instagram",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  facebook: "Facebook",
};

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/users/${id}`, { credentials: "include" });
        if (res.status === 401) { router.push("/admin/login"); return; }
        if (res.status === 404) { setError("User not found"); return; }
        if (!res.ok) throw new Error("Failed to load user");
        setData(await res.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, router]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure? This will permanently delete this user and ALL their data (personas, posts, brand styles). This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete user");
      router.push("/admin/users");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <header className="w-full flex items-center justify-between px-8 py-4 bg-[#F8F9FC] sticky top-0 z-40 shrink-0 border-b border-slate-100">
          <div className="flex flex-col justify-center">
            <nav className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin</span>
              <span className="text-slate-300 text-[10px]">/</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Users</span>
              <span className="text-slate-300 text-[10px]">/</span>
              <span className="text-[10px] font-bold text-[#0052FF] uppercase tracking-widest">Detail</span>
            </nav>
            <h1 className="text-2xl font-black text-[#1A1D23] tracking-tight">User Detail</h1>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
            <Shield size={14} className="text-[#0052FF]" />
            <span className="text-[13px] font-black text-[#1A1D23]">Admin</span>
          </div>
        </header>
        <div className="flex-1 p-8 animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-48" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-48 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col h-full">
        <header className="w-full flex items-center justify-between px-8 py-4 bg-[#F8F9FC] sticky top-0 z-40 shrink-0 border-b border-slate-100">
          <div className="flex flex-col justify-center">
            <nav className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin</span>
              <span className="text-slate-300 text-[10px]">/</span>
              <span className="text-[10px] font-bold text-[#0052FF] uppercase tracking-widest">Users</span>
            </nav>
            <h1 className="text-2xl font-black text-[#1A1D23] tracking-tight">User Detail</h1>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
            <Shield size={14} className="text-[#0052FF]" />
            <span className="text-[13px] font-black text-[#1A1D23]">Admin</span>
          </div>
        </header>
        <div className="flex-1 p-8 text-center">
          <p className="text-red-500 font-semibold">{error || "User not found"}</p>
          <button onClick={() => router.push("/admin/users")} className="mt-3 text-[13px] text-[#0052FF] font-bold bg-transparent border-none cursor-pointer hover:underline">← Back to users</button>
        </div>
      </div>
    );
  }

  const { user, personas, postStats, brandStyles } = data;

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Top Header */}
      <header className="w-full flex items-center justify-between px-8 py-4 bg-[#F8F9FC] sticky top-0 z-40 shrink-0 border-b border-slate-100">
        <div className="flex flex-col justify-center">
          <nav className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin</span>
            <span className="text-slate-300 text-[10px]">/</span>
            <button onClick={() => router.push("/admin/users")} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#0052FF] bg-transparent border-none cursor-pointer transition-colors">Users</button>
            <span className="text-slate-300 text-[10px]">/</span>
            <span className="text-[10px] font-bold text-[#0052FF] uppercase tracking-widest">{user.firstName} {user.lastName}</span>
          </nav>
          <h1 className="text-2xl font-black text-[#1A1D23] tracking-tight">{user.firstName} {user.lastName}</h1>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
          <Shield size={14} className="text-[#0052FF]" />
          <span className="text-[13px] font-black text-[#1A1D23]">Admin</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl">
        {/* Back */}
        <button
          onClick={() => router.push("/admin/users")}
          className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-[#0052FF] bg-transparent border-none cursor-pointer mb-6 transition-colors"
        >
          <ChevronLeft size={16} /> Back to Users
        </button>

        {/* User Card */}
        <div className="bg-white rounded-2xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 mb-6">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-[22px] font-black flex-shrink-0 ${getAvatarColor(user._id)}`}>
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div className="flex-1">
              <h2 className="text-[22px] font-black text-[#1A1D23] tracking-tight">{user.firstName} {user.lastName}</h2>
              <p className="text-[14px] text-slate-500 font-medium">@{user.username}</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 pt-5 border-t border-slate-50">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
              <p className="text-[14px] font-semibold text-[#1A1D23]">{user.email}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Member Since</p>
              <p className="text-[14px] font-semibold text-[#1A1D23]">
                {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        {/* Personas */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 mb-6 overflow-hidden">
          <div className="px-7 py-5 border-b border-slate-50">
            <h2 className="text-[16px] font-black text-[#1A1D23]">Personas ({personas.length})</h2>
          </div>
          {personas.length === 0 ? (
            <p className="px-7 py-8 text-[14px] text-slate-400 text-center">No personas created yet</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {personas.map((p) => (
                <div key={p._id} className="px-7 py-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[15px] font-bold text-[#1A1D23]">{p.personaName}</p>
                      <p className="text-[13px] text-slate-500 mt-0.5">{p.userRole} · {p.industry}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Updated {new Date(p.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  {p.writingStyle && (
                    <span className="mt-2 inline-block px-2.5 py-1 bg-[#0052FF]/10 text-[#0052FF] text-[11px] font-bold rounded-lg">
                      Style: {p.writingStyle}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Post Stats */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 mb-6 overflow-hidden">
          <div className="px-7 py-5 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-[16px] font-black text-[#1A1D23]">Post History</h2>
            <span className="px-3 py-1 bg-[#0052FF]/10 text-[#0052FF] text-[12px] font-bold rounded-full">
              {postStats.total} total
            </span>
          </div>
          {postStats.recent.length === 0 ? (
            <p className="px-7 py-8 text-[14px] text-slate-400 text-center">No posts generated yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/60">
                    <th className="px-7 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Platform</th>
                    <th className="px-7 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Objective</th>
                    <th className="px-7 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-7 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {postStats.recent.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50/50">
                      <td className="px-7 py-3.5 text-[13px] font-semibold text-[#1A1D23]">{PLATFORM_LABELS[post.platform] || post.platform}</td>
                      <td className="px-7 py-3.5 text-[13px] text-slate-500 capitalize">{post.objective?.replace(/_/g, " ")}</td>
                      <td className="px-7 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${STATUS_COLORS[post.status] ?? "bg-slate-100 text-slate-600"}`}>{post.status}</span>
                      </td>
                      <td className="px-7 py-3.5 text-[13px] text-slate-400">{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Brand Styles */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 mb-8 overflow-hidden">
          <div className="px-7 py-5 border-b border-slate-50">
            <h2 className="text-[16px] font-black text-[#1A1D23]">Brand Styles ({brandStyles.length})</h2>
          </div>
          {brandStyles.length === 0 ? (
            <p className="px-7 py-8 text-[14px] text-slate-400 text-center">No brand styles saved</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {brandStyles.map((bs) => (
                <div key={bs._id} className="px-7 py-4 flex items-center gap-4">
                  <div className="flex gap-1">
                    {(bs.colorPalette || []).slice(0, 5).map((c, i) => (
                      <div key={i} className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#1A1D23]">{bs.name}</p>
                    <p className="text-[12px] text-slate-400">{bs.visualStyle} · {bs.fontFamily || "Default font"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border-2 border-red-100 p-7">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-[16px] font-black text-red-600">Danger Zone</h3>
              <p className="text-[13px] text-red-400 mt-1">
                Deleting this user will permanently remove their account, all personas, post history, and brand styles. This action cannot be undone.
              </p>
            </div>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-[14px] font-bold rounded-xl transition-colors cursor-pointer border-none"
          >
            <Trash2 size={15} />
            {deleting ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
}
