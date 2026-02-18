"use client";

import React from "react";
import { RawAnalysisData } from "../../../../../lib/types/analysis";
import { FaUsers, FaMapMarkerAlt, FaLink } from "react-icons/fa";

interface PulseHeaderProps {
  profile: RawAnalysisData["profile"];
}

export default function PulseHeader({ profile }: PulseHeaderProps) {
  // Format followers count (e.g. 12000 -> 12k)
  const formatFollowers = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "k";
    return count.toLocaleString();
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden mb-6 relative group">
      {/* Banner Image */}
      <div className="h-32 w-full bg-slate-100 relative">
        {profile.banner ? (
          <img
            src={profile.banner}
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
      </div>

      <div className="px-8 pb-6 relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12">
        {/* Profile Picture */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
            {profile.pfp ? (
              <img
                src={profile.pfp}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center text-3xl">
                👤
              </div>
            )}
          </div>
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <div className="w-2 h-2 bg-white rounded-full relative z-10"></div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1 text-center md:text-left pt-2 md:pt-0">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            {profile.name}
          </h1>
          <p className="text-sm font-medium text-slate-500 mb-2 max-w-2xl">
            {profile.headline || profile.bio}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 text-slate-600">
              <FaUsers className="text-violet-500" />
              <span>{formatFollowers(profile.followers)} Followers</span>
            </div>

            {profile.projects && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 text-slate-600">
                <span>🚀 {profile.projects} Projects</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats / Actions could go here */}
      </div>
    </div>
  );
}
