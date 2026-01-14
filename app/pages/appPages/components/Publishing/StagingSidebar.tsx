"use client";

import React from "react";
import { Plus, GripVertical, Image as ImageIcon, Layers } from "lucide-react";
import { PostDraft, Platform } from "./types";
import {
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaPinterest,
  FaAt,
} from "react-icons/fa";

interface StagingSidebarProps {
  drafts: PostDraft[];
  onDraftDragStart: (e: React.DragEvent, draft: PostDraft) => void;
  onCreateNew: () => void;
}

export default function StagingSidebar({
  drafts,
  onDraftDragStart,
  onCreateNew,
}: StagingSidebarProps) {
  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case "linkedin":
        return <FaLinkedin className="text-[#0077B5]" size={10} />;
      case "twitter":
        return <FaTwitter className="text-black" size={10} />;
      case "instagram":
        return <FaInstagram className="text-[#E1306C]" size={10} />;
      case "facebook":
        return <FaFacebook className="text-[#1877F2]" size={10} />;
      case "threads":
        return <FaAt className="text-black" size={10} />; // Threads Proxy
      case "pinterest":
        return <FaPinterest className="text-[#E60023]" size={10} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-[300px] flex-shrink-0 bg-white border-r border-gray-200 h-full flex flex-col z-10">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/50 space-y-3">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Drafts Library</h3>
          <p className="text-xs text-gray-500 mt-1">
            Drag items to the calendar to schedule.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="w-full py-2.5 bg-white border border-gray-300 shadow-sm rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Create Manual Post
        </button>
      </div>

      {/* Drafts List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {drafts.length === 0 ? (
          <div className="text-center py-10 opacity-50 flex flex-col items-center">
            <div className="p-3 bg-gray-100 rounded-full mb-3">
              <ImageIcon size={20} className="text-gray-400" />
            </div>
            <p className="text-xs font-medium">No drafts available.</p>
          </div>
        ) : (
          drafts.map((draft) => (
            <div
              key={draft.id}
              draggable
              onDragStart={(e) => onDraftDragStart(e, draft)}
              className="group bg-white p-2 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 cursor-grab active:cursor-grabbing transition-all relative flex gap-3"
            >
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                <GripVertical size={14} />
              </div>

              {/* Thumbnail */}
              <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-100 relative">
                {draft.media && draft.media.length > 0 ? (
                  <>
                    <img
                      src={draft.media[0]}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    {draft.media.length > 1 && (
                      <div className="absolute bottom-1 right-1 bg-black/60 px-1 rounded text-[8px] text-white flex items-center gap-0.5">
                        <Layers size={8} /> {draft.media.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon size={16} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                <div className="flex items-center gap-1 flex-wrap">
                  {draft.platforms.length > 0 ? (
                    draft.platforms.map((p) => (
                      <div
                        key={p}
                        className="p-1 bg-gray-50 rounded-full border border-gray-100"
                      >
                        {getPlatformIcon(p)}
                      </div>
                    ))
                  ) : (
                    <span className="text-[9px] text-gray-400 italic">
                      No platform
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-gray-800 leading-tight truncate">
                  {draft.title || "Untitled Draft"}
                </h4>
                <p className="text-[10px] text-gray-500 line-clamp-1">
                  {draft.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-gray-100 text-[10px] text-center text-gray-400 font-medium bg-gray-50/50">
        {drafts.length} drafts ready
      </div>
    </div>
  );
}
