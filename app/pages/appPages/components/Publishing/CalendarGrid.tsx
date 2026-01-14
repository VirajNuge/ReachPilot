"use client";

import React from "react";
import { PostDraft, Platform } from "./types";
import {
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaPinterest,
  FaAt,
} from "react-icons/fa";
import { Layers, Image as ImageIcon } from "lucide-react";

interface CalendarGridProps {
  scheduledPosts: PostDraft[];
  onDropDraft: (draftId: string, date: Date) => void;
  onPostClick: (post: PostDraft) => void;
}

export default function CalendarGrid({
  scheduledPosts,
  onDropDraft,
  onPostClick,
}: CalendarGridProps) {
  // Mock Calendar: Nov 2025
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date();
    d.setDate(i + 1);
    return d;
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-indigo-50/50");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-indigo-50/50");
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-indigo-50/50");
    const draftId = e.dataTransfer.getData("draftId");
    if (draftId) {
      onDropDraft(draftId, date);
    }
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case "linkedin":
        return <FaLinkedin className="text-[#0077B5]" size={10} />;
      case "twitter":
        return <FaTwitter className="text-[#1DA1F2]" size={10} />;
      case "instagram":
        return <FaInstagram className="text-[#E1306C]" size={10} />;
      case "facebook":
        return <FaFacebook className="text-[#1877F2]" size={10} />;
      case "threads":
        return <FaAt className="text-black" size={10} />;
      case "pinterest":
        return <FaPinterest className="text-[#E60023]" size={10} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
        <h2 className="text-lg font-bold text-gray-800">Content Schedule</h2>
        <div className="flex gap-2">
          <span className="text-xs font-bold px-3 py-1 bg-gray-100 rounded-lg text-gray-600">
            November 2025
          </span>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm z-10">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* The Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
        {days.map((date, index) => {
          const daysPosts = scheduledPosts.filter(
            (p) => p.scheduledDate?.getDate() === date.getDate()
          );
          const isToday = date.getDate() === new Date().getDate();

          return (
            <div
              key={index}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, date)}
              className="border-b border-r border-gray-100 p-2 transition-all relative group hover:bg-gray-50 min-h-[100px]"
            >
              {/* Date Number */}
              <div className="flex justify-end mb-1">
                <span
                  className={`text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                    isToday
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "text-gray-400 group-hover:text-gray-900"
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>

              {/* Dropped Posts */}
              <div className="space-y-1.5 relative z-10">
                {daysPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPostClick(post);
                    }}
                    className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group/card"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex -space-x-1">
                        {post.platforms.map((p) => (
                          <div
                            key={p}
                            className="w-4 h-4 rounded-full bg-gray-50 border border-white flex items-center justify-center shadow-sm z-0"
                          >
                            {getPlatformIcon(p)}
                          </div>
                        ))}
                      </div>
                      {post.media && post.media.length > 1 && (
                        <Layers size={10} className="text-gray-400" />
                      )}
                      {post.media && post.media.length === 1 && (
                        <ImageIcon size={10} className="text-gray-400" />
                      )}
                    </div>

                    <div className="text-[10px] font-bold text-gray-700 truncate leading-tight">
                      {post.title || "Untitled"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
