"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  Calendar as CalendarIcon,
  Trash2,
  CheckCircle2,
  Save,
  Upload,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import { PostDraft, Platform } from "./types";
import {
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaPinterest,
  FaAt,
} from "react-icons/fa";

interface PostContextPanelProps {
  post: PostDraft | null;
  onClose: () => void;
  onUpdate: (updatedPost: PostDraft) => void;
  onDelete: (postId: string) => void;
}

export default function PostContextPanel({
  post,
  onClose,
  onUpdate,
  onDelete,
}: PostContextPanelProps) {
  const [editedContent, setEditedContent] = useState("");
  const [time, setTime] = useState("09:00");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (post) {
      setEditedContent(post.content);
      setSelectedPlatforms(post.platforms);
      setCurrentSlide(0);
      if (post.scheduledDate) {
        const date = post.scheduledDate;
        setTime(
          `${String(date.getHours()).padStart(2, "0")}:${String(
            date.getMinutes()
          ).padStart(2, "0")}`
        );
      }
    }
  }, [post]);

  if (!post) return null;

  const handleSave = () => {
    onUpdate({ ...post, content: editedContent, platforms: selectedPlatforms });
    onClose();
  };

  const togglePlatform = (p: Platform) => {
    if (selectedPlatforms.includes(p)) {
      setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const nextSlide = () => {
    if (currentSlide < post.media.length - 1)
      setCurrentSlide((curr) => curr + 1);
  };
  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide((curr) => curr - 1);
  };

  // Platform Definition List
  const platformList = [
    {
      id: "linkedin",
      icon: <FaLinkedin size={14} />,
      color: "text-[#0077B5]",
      bg: "bg-[#0077B5]/10 border-[#0077B5]",
    },
    {
      id: "twitter",
      icon: <FaTwitter size={14} />,
      color: "text-black",
      bg: "bg-gray-100 border-gray-400",
    },
    {
      id: "instagram",
      icon: <FaInstagram size={14} />,
      color: "text-[#E1306C]",
      bg: "bg-pink-50 border-pink-300",
    },
    {
      id: "facebook",
      icon: <FaFacebook size={14} />,
      color: "text-[#1877F2]",
      bg: "bg-blue-50 border-blue-300",
    },
    {
      id: "threads",
      icon: <FaAt size={14} />,
      color: "text-black",
      bg: "bg-gray-100 border-gray-400",
    },
    {
      id: "pinterest",
      icon: <FaPinterest size={14} />,
      color: "text-[#E60023]",
      bg: "bg-red-50 border-red-300",
    },
  ];

  return (
    <div className="w-[350px] bg-white border-l border-gray-200 h-full flex flex-col shadow-xl z-20">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Edit Post
          </span>
          {post.status === "scheduled" && (
            <div className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-100 flex items-center gap-1">
              <CheckCircle2 size={10} /> Scheduled
            </div>
          )}
        </div>
        <button onClick={onClose} className="bg-[#000100] hover:bg-black text-white">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {/* 1. Multi-Platform Toggles (Grid Layout) */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-700 block">
            Target Platforms
          </label>
          <div className="grid grid-cols-3 gap-2">
            {platformList.map((p) => {
              const isSelected = selectedPlatforms.includes(p.id as Platform);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id as Platform)}
                  className={`py-2 rounded-lg border flex items-center justify-center transition-all ${
                    isSelected
                      ? `${p.bg} ${p.color} ring-1 ring-offset-1 ring-gray-200`
                      : "bg-white border-gray-200 text-gray-300 hover:border-gray-300"
                  }`}
                >
                  {p.icon}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Timing */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-700 flex items-center gap-2">
            <Clock size={14} /> Scheduled Time
          </label>
          <div className="flex gap-2">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none"
            />
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 flex items-center">
              {post.scheduledDate?.toLocaleDateString() || "No Date"}
            </div>
          </div>
        </div>

        {/* 3. Content & Carousel */}
        <div>
          <label className="text-xs font-bold text-gray-700 mb-3 block">
            Content Preview
          </label>
          <div className="p-4 rounded-xl border bg-gray-50/50 border-gray-200">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full bg-transparent border-none p-0 text-sm text-gray-800 leading-relaxed resize-none focus:ring-0 min-h-[80px]"
              spellCheck={false}
              placeholder="Write your caption here..."
            />
            {post.media.length > 0 ? (
              <div className="mt-3 w-full h-40 bg-gray-200 rounded-lg overflow-hidden border border-gray-200/50 group relative">
                <img
                  src={post.media[currentSlide]}
                  alt="slide"
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                {post.media.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      disabled={currentSlide === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full disabled:opacity-0 transition-all bg-[#000100] hover:bg-black text-white"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={nextSlide}
                      disabled={currentSlide === post.media.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full disabled:opacity-0 transition-all bg-[#000100] hover:bg-black text-white"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded text-[10px] text-white font-medium flex items-center gap-1">
                      <Layers size={10} /> {currentSlide + 1}/
                      {post.media.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-3 w-full h-32 bg-white rounded-lg flex flex-col items-center justify-center text-gray-400 text-xs border-2 border-dashed border-gray-300 hover:border-indigo-300 cursor-pointer">
                <Upload size={20} className="mb-2 opacity-50" />
                <p>Upload Media</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-gray-100 bg-gray-50/30 space-y-3">
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-[#000100] hover:bg-black text-white"
        >
          <Save size={16} /> Save Updates
        </button>
        <button
          onClick={() => onDelete(post.id)}
          className="w-full py-3 bg-white border border-gray-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center gap-2"
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  );
}
