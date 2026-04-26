import React, { useState, useRef, useEffect } from "react";
import { X, UploadCloud, CheckCircle, Loader2, CalendarDays, Send } from "lucide-react";
import { ALL_PLATFORMS, PLATFORM_META, Platform } from "./types";

interface CustomPostModalProps {
  accountId: string;
  onClose: () => void;
  onSuccess: (draftId: string) => void;
}

export function CustomPostModal({ accountId, onClose, onSuccess }: CustomPostModalProps) {
  const [platforms, setPlatforms] = useState<Platform[]>(["linkedin"]);
  const [captionMode, setCaptionMode] = useState<"single" | "per_platform">("single");
  
  const [singleCaption, setSingleCaption] = useState("");
  const [captions, setCaptions] = useState<Partial<Record<Platform, string>>>({});
  
  const [singleImageFile, setSingleImageFile] = useState<File | null>(null);
  const [singleImagePreview, setSingleImagePreview] = useState<string | null>(null);
  
  const [platformImages, setPlatformImages] = useState<Partial<Record<Platform, { file: File | null; preview: string | null }>>>({});

  const [activeTab, setActiveTab] = useState<Platform | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitType, setSubmitType] = useState<"draft" | "schedule" | "publish" | null>(null);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set active tab when per_platform is selected and no tab is active
  useEffect(() => {
    if (captionMode === "per_platform" && platforms.length > 0 && !activeTab) {
      setActiveTab(platforms[0]);
    }
  }, [captionMode, platforms, activeTab]);

  const togglePlatform = (p: Platform) => {
    setPlatforms((prev) => {
      if (prev.includes(p)) {
        const next = prev.filter((i) => i !== p);
        if (activeTab === p) setActiveTab(next[0] || null);
        return next;
      }
      return [...prev, p];
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    
    setError("");
    const preview = URL.createObjectURL(file);
    
    if (captionMode === "single") {
      setSingleImageFile(file);
      setSingleImagePreview(preview);
    } else if (activeTab) {
      setPlatformImages(prev => ({
        ...prev,
        [activeTab]: { file, preview }
      }));
    }
    
    // Clear input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const removeImage = () => {
    if (captionMode === "single") {
      setSingleImageFile(null);
      setSingleImagePreview(null);
    } else if (activeTab) {
      setPlatformImages(prev => {
        const next = { ...prev };
        delete next[activeTab];
        return next;
      });
    }
  };

  const validateSubmission = (type: "draft" | "schedule" | "publish") => {
    if (platforms.length === 0) {
      setError("Please select at least one platform.");
      return false;
    }
    
    // Check captions
    if (captionMode === "single" && !singleCaption.trim()) {
      setError("Please write a caption.");
      return false;
    } else if (captionMode === "per_platform") {
      for (const p of platforms) {
        if (!captions[p]?.trim()) {
          setError(`Please write a caption for ${PLATFORM_META[p].label}.`);
          setActiveTab(p);
          return false;
        }
      }
    }
    
    // Check required images
    const reqImagePlatforms = platforms.filter(p => ["instagram_post", "facebook", "pinterest"].includes(p));
    if (reqImagePlatforms.length > 0) {
      if (captionMode === "single" && !singleImageFile) {
        setError(`An image is required for ${reqImagePlatforms.map(p => PLATFORM_META[p].label).join(", ")}.`);
        return false;
      } else if (captionMode === "per_platform") {
        for (const p of reqImagePlatforms) {
          if (!platformImages[p]?.file) {
            setError(`An image is required for ${PLATFORM_META[p].label}.`);
            setActiveTab(p);
            return false;
          }
        }
      }
    }
    
    if (type === "schedule") {
      if (!scheduleDate) {
        setError("Please select a date and time to schedule.");
        return false;
      }
      if (new Date(scheduleDate) <= new Date()) {
        setError("Schedule time must be in the future.");
        return false;
      }
    }
    
    return true;
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Image upload failed");
    }
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (type: "draft" | "schedule" | "publish") => {
    if (!validateSubmission(type)) return;

    setIsSubmitting(true);
    setSubmitType(type);
    setError("");

    try {
      setIsUploading(true);
      let globalImageUrl: string | undefined;
      const uploadedPlatformImages: Record<string, string> = {};
      
      if (captionMode === "single" && singleImageFile) {
        globalImageUrl = await uploadFile(singleImageFile);
      } else if (captionMode === "per_platform") {
        for (const p of platforms) {
          if (platformImages[p]?.file) {
            uploadedPlatformImages[p] = await uploadFile(platformImages[p].file!);
          }
        }
      }
      setIsUploading(false);

      // Build payload
      const finalCaptions: Record<string, string> = {};
      for (const p of platforms) {
        finalCaptions[p] = captionMode === "single" ? singleCaption : (captions[p] || "");
      }
      
      const payload = {
        accountId,
        platforms,
        captions: finalCaptions,
        platformImages: Object.keys(uploadedPlatformImages).length > 0 ? uploadedPlatformImages : undefined,
        imageUrl: globalImageUrl,
        scheduledDate: type === "schedule" ? new Date(scheduleDate).toISOString() : undefined,
      };

      const res = await fetch("/api/post-generation/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create post");
      
      const draftId = data.id;
      
      if (type === "publish") {
        const pubRes = await fetch(`/api/post-generation/publish/${draftId}`, { method: "POST" });
        if (!pubRes.ok) throw new Error("Failed to publish post immediately");
      }

      onSuccess(draftId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsSubmitting(false);
      setSubmitType(null);
      setIsUploading(false);
    }
  };

  const currentPreview = captionMode === "single" ? singleImagePreview : (activeTab ? platformImages[activeTab]?.preview : null);
  const currentCaption = captionMode === "single" ? singleCaption : (activeTab ? captions[activeTab] || "" : "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-black text-[#1A1D23]">Create Custom Post</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Platforms */}
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Select Platforms</label>
            <div className="flex flex-wrap gap-2">
              {ALL_PLATFORMS.map((p) => {
                const meta = PLATFORM_META[p];
                const active = platforms.includes(p);
                const reqImage = ["instagram_post", "facebook", "pinterest"].includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border shadow-sm ${
                      active 
                        ? "bg-[#EEF3FF] border-[#0052FF]/30 text-[#0052FF]" 
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${active ? "" : "opacity-40"}`}
                      style={{ backgroundColor: meta.color }}
                    />
                    {meta.label}
                    {reqImage && active && <span className="text-xs" title="Image required">📷</span>}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Caption Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setCaptionMode("single")}
              className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all ${captionMode === "single" ? "bg-white text-[#1A1D23] shadow-sm" : "text-slate-500 hover:text-[#1A1D23]"}`}
            >
              Single Caption
            </button>
            <button
              onClick={() => setCaptionMode("per_platform")}
              disabled={platforms.length === 0}
              className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all ${captionMode === "per_platform" ? "bg-white text-[#1A1D23] shadow-sm" : "text-slate-500 hover:text-[#1A1D23] disabled:opacity-50"}`}
            >
              Per Platform
            </button>
          </div>
          
          {/* Content Area */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            
            {/* Per-platform Tabs */}
            {captionMode === "per_platform" && platforms.length > 0 && (
              <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto [scrollbar-width:none]">
                {platforms.map(p => {
                  const m = PLATFORM_META[p];
                  const active = activeTab === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setActiveTab(p)}
                      className={`px-4 py-3 text-[12px] font-bold whitespace-nowrap transition-all border-b-2 ${active ? "border-[#0052FF] text-[#1A1D23] bg-white" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: m.color }} />
                      {m.shortLabel}
                    </button>
                  );
                })}
              </div>
            )}
            
            <div className="p-4 space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Image {["instagram_post", "facebook", "pinterest"].includes(captionMode === "single" ? platforms[0] : activeTab || "") && <span className="text-red-500 ml-1">* Required</span>}</span>
                </label>
                
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                />

                {currentPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center h-48 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentPreview} alt="Preview" className="max-w-full max-h-full object-contain" />
                    <button 
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 h-32 flex flex-col items-center justify-center text-slate-400 hover:border-[#0052FF]/40 hover:bg-[#EEF3FF] hover:text-[#0052FF] transition-all cursor-pointer group"
                  >
                    <UploadCloud size={24} className="mb-2 text-slate-300 group-hover:text-[#0052FF] transition-colors" />
                    <p className="text-xs font-bold mb-0.5">Upload image</p>
                    <p className="text-[10px] font-medium opacity-70">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Caption</label>
                <textarea
                  placeholder="What do you want to share?"
                  value={currentCaption}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (captionMode === "single") setSingleCaption(val);
                    else if (activeTab) setCaptions(prev => ({ ...prev, [activeTab]: val }));
                  }}
                  className="w-full min-h-[140px] p-4 text-[13px] bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#0052FF] focus:ring-4 focus:ring-[#0052FF]/10 resize-y transition-all"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm font-bold text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2">
              <span className="mt-0.5">⚠️</span> {error}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 shrink-0 bg-slate-50 flex flex-col gap-3">
          
          {/* Scheduling Row */}
          <div className="flex items-center gap-3">
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={e => setScheduleDate(e.target.value)}
              className="flex-1 bg-white rounded-xl px-4 py-2.5 text-[12px] font-bold text-[#1A1D23] border border-slate-200 outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20 shadow-sm transition-all"
            />
            <button
              onClick={() => handleSubmit("schedule")}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-[12px] transition-colors flex items-center justify-center gap-2 border border-indigo-100 disabled:opacity-50"
            >
              {isSubmitting && submitType === "schedule" ? <Loader2 size={14} className="animate-spin" /> : <CalendarDays size={14} />}
              Schedule
            </button>
          </div>

          {/* Primary Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit("draft")}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-white hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-[13px] transition-colors border border-slate-200 disabled:opacity-50"
            >
              {isSubmitting && submitType === "draft" ? "Saving..." : "Save Draft"}
            </button>
            <button
              onClick={() => handleSubmit("publish")}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#0052FF] hover:bg-[#003DD4] text-white rounded-xl font-bold text-[13px] transition-colors shadow-[0_4px_14px_rgba(0,82,255,0.25)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && submitType === "publish" ? (
                <><Loader2 size={14} className="animate-spin" /> {isUploading ? "Uploading..." : "Publishing..."}</>
              ) : (
                <><Send size={14} /> Publish Now</>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
