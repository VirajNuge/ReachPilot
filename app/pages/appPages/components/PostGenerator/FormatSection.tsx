"use client";

import React, { useState } from "react";
import {
  Layout,
  Plus,
  X,
  ChevronDown,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  Monitor,
  Smartphone,
  Youtube,
  Pin,
} from "lucide-react";

import {
  GeneratorFormState,
  PlatformFormat,
  PostType,
} from "../../[id]/postGenerator/page";

interface FormatSectionProps {
  formState: GeneratorFormState;
  setFormState: React.Dispatch<React.SetStateAction<GeneratorFormState>>;
}

// Small reusable header
const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4 mb-6">
    <div className="p-2.5 bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 rounded-xl shadow-sm border border-indigo-100/50">
      <Icon size={18} />
    </div>
    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 select-none">
      {title}
    </h3>
  </div>
);

export default function FormatSection({
  formState,
  setFormState,
}: FormatSectionProps) {
  // local helper to update formState
  const updateState = (field: keyof GeneratorFormState, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // AUDIENCE TAG LOGIC (local UI state)
  const [newSegment, setNewSegment] = useState("");
  const [isAddingSegment, setIsAddingSegment] = useState(false);
  const [audienceTags, setAudienceTags] = useState<string[]>(
    formState.targetAudience ? formState.targetAudience.split(", ") : []
  );

  const addAudienceTag = (tag: string) => {
    if (!tag.trim()) return;
    const updated = [...audienceTags, tag.trim()];
    setAudienceTags(updated);
    updateState("targetAudience", updated.join(", "));
    setNewSegment("");
    setIsAddingSegment(false);
  };

  const removeAudienceTag = (tagToRemove: string) => {
    const updated = audienceTags.filter((t) => t !== tagToRemove);
    setAudienceTags(updated);
    updateState("targetAudience", updated.join(", "));
  };

  return (
    <section>
      <SectionHeader icon={Layout} title="Format & Strategy" />

      {/* Post Type Toggle */}
      <div className="bg-slate-100/80 p-1.5 rounded-xl flex gap-1 mb-6 border border-slate-200">
        {(["SINGLE", "CAROUSEL"] as PostType[]).map((type) => (
          <button
            key={type}
            onClick={() => updateState("postType", type)}
            className={`flex-1 py-3 text-[11px] font-bold rounded-lg transition-all duration-300 ${
              formState.postType === type
                ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5 scale-[1.02]"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Platform Selector */}
      <div className="relative mb-6 group">
        <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400 z-10">
          Platform Format
        </label>
        <select
          value={formState.platform}
          onChange={(e) =>
            updateState("platform", e.target.value as PlatformFormat)
          }
          className="w-full p-4 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 appearance-none shadow-sm hover:border-indigo-300 cursor-pointer"
        >
          {/* INSTAGRAM */}
          <optgroup label="Instagram (Image Post Sizes)">
            <option value="IG_SQUARE">Square — 1080 × 1080</option>
            <option value="IG_PORTRAIT">Portrait — 1080 × 1350</option>
            <option value="IG_STORY">Story — 1080 × 1920</option>
            <option value="IG_REEL_COVER">Reel Cover — 1080 × 1920</option>
          </optgroup>

          {/* TIKTOK */}
          <optgroup label="TikTok">
            <option value="TIKTOK_COVER">Video Cover — 1080 × 1920</option>
          </optgroup>

          {/* PINTEREST */}
          <optgroup label="Pinterest">
            <option value="PINTEREST_PIN">Pin — 1000 × 1500</option>
          </optgroup>

          {/* FACEBOOK */}
          <optgroup label="Facebook">
            <option value="FB_POST">Feed Post — 1200 × 1500</option>
            <option value="FB_EVENT_BANNER">Event Banner — 1920 × 1080</option>
          </optgroup>

          {/* LINKEDIN */}
          <optgroup label="LinkedIn">
            <option value="LINKEDIN_SQUARE">Square — 1080 × 1080</option>
            <option value="LINKEDIN_PORTRAIT">Portrait — 1080 × 1350</option>
            <option value="LINKEDIN_LANDSCAPE">Landscape — 1200 × 627</option>
          </optgroup>

          {/* TWITTER */}
          <optgroup label="Twitter / X">
            <option value="TWITTER_POST">Post — 1600 × 900</option>
          </optgroup>

          {/* YOUTUBE */}
          <optgroup label="YouTube">
            <option value="YOUTUBE_THUMBNAIL">Thumbnail — 1280 × 720</option>
          </optgroup>

          {/* GENERIC */}
          <optgroup label="Generic Sizes">
            <option value="GENERIC_SQUARE">Square — 1080 × 1080</option>
            <option value="GENERIC_PORTRAIT">Portrait — 1080 × 1350</option>
            <option value="GENERIC_LANDSCAPE">Landscape — 1920 × 1080</option>
          </optgroup>
        </select>

        <ChevronDown
          size={16}
          className="absolute right-4 top-4 text-slate-400 pointer-events-none"
        />
      </div>

      {/* Platform Icons */}
      <div className="flex gap-2 justify-between px-1 mb-8">
        {[
          {
            id: "IG",
            icon: Instagram,
            active: formState.platform.startsWith("IG"),
            activeClass:
              "text-pink-600 bg-pink-50 ring-pink-200 shadow-pink-100",
          },
          {
            id: "LINKEDIN",
            icon: Linkedin,
            active: formState.platform.startsWith("LINKEDIN"),
            activeClass:
              "text-blue-700 bg-blue-50 ring-blue-200 shadow-blue-100",
          },
          {
            id: "FB",
            icon: Facebook,
            active: formState.platform.startsWith("FB"),
            activeClass:
              "text-blue-600 bg-blue-50 ring-blue-200 shadow-blue-100",
          },
          {
            id: "TWITTER",
            icon: Twitter,
            active: formState.platform.startsWith("TWITTER"),
            activeClass:
              "text-slate-800 bg-slate-100 ring-slate-300 shadow-slate-200",
          },
          {
            id: "TIKTOK",
            icon: Smartphone,
            active: formState.platform.startsWith("TIKTOK"),
            activeClass: "text-black bg-gray-100 ring-gray-300 shadow-gray-200",
          },
          {
            id: "YOUTUBE",
            icon: Youtube,
            active: formState.platform.startsWith("YOUTUBE"),
            activeClass: "text-red-600 bg-red-50 ring-red-200 shadow-red-100",
          },
          {
            id: "PINTEREST",
            icon: Pin,
            active: formState.platform.startsWith("PINTEREST"),
            activeClass: "text-red-500 bg-red-50 ring-red-200 shadow-red-100",
          },
          {
            id: "GENERIC",
            icon: Monitor,
            active: formState.platform.startsWith("GENERIC"),
            activeClass:
              "text-slate-900 bg-slate-100 ring-slate-300 shadow-slate-200",
          },
        ].map((p) => (
          <div
            key={p.id}
            className={`p-2.5 rounded-full transition-all duration-300 ${
              p.active
                ? `${p.activeClass} ring-2 scale-110 shadow-md`
                : "text-slate-300 grayscale opacity-40 hover:opacity-70 hover:scale-105"
            }`}
          >
            <p.icon size={18} />
          </div>
        ))}
      </div>

      {/* Core Topic / Post Idea */}
      <div className="mb-8 w-[340px]">
        <div className="flex justify-between items-center mb-2 px-1">
          <label className="text-xs font-bold text-slate-700">
            Core Topic / Post Idea
          </label>
          <span className="text-[10px] text-slate-400 font-medium">
            Required
          </span>
        </div>

        <textarea
          value={formState.postIdea}
          onChange={(e) => updateState("postIdea", e.target.value)}
          className="w-full h-28 p-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none shadow-sm hover:border-slate-300"
          placeholder="What should the AI create? (e.g., 'Motivational quote about consistency', 'Cyberpunk product ad', etc.)"
        />
      </div>

      {/* Target Audience Tags */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-3 px-1">
          Target Audience
        </label>

        <div className="flex flex-wrap gap-2.5 bg-slate-50/50 p-4 border border-slate-200 rounded-2xl border-dashed min-h-[60px]">
          {audienceTags.map((tag) => (
            <div
              key={tag}
              className="animate-in fade-in zoom-in duration-200 flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-white border border-indigo-100 shadow-sm rounded-lg text-[11px] font-semibold text-indigo-600 hover:border-indigo-200 hover:shadow-md transition-all group"
            >
              <span>{tag}</span>
              <button
                onClick={() => removeAudienceTag(tag)}
                className="p-0.5 text-indigo-300 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {isAddingSegment ? (
            <input
              autoFocus
              type="text"
              className="w-32 px-3 py-1.5 text-[11px] bg-white border-2 border-indigo-500 rounded-lg outline-none shadow-sm"
              placeholder="Type & Enter"
              value={newSegment}
              onChange={(e) => setNewSegment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addAudienceTag(newSegment)}
              onBlur={() => addAudienceTag(newSegment)}
            />
          ) : (
            <button
              onClick={() => setIsAddingSegment(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 border-dashed hover:border-indigo-400 hover:text-indigo-600 text-slate-400 rounded-lg text-[11px] font-medium transition-all hover:shadow-sm"
            >
              <Plus size={12} /> Add Audience
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
