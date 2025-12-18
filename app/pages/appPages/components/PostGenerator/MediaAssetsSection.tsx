"use client";

import React from "react";
import { ImageIcon, Upload, X } from "lucide-react";

import {
  GeneratorFormState,
  UploadedImage,
} from "../../[id]/postGenerator/page";

interface MediaAssetsSectionProps {
  formState: GeneratorFormState;
  setFormState: React.Dispatch<React.SetStateAction<GeneratorFormState>>;
}

// Shared header
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

export default function MediaAssetsSection({
  formState,
  setFormState,
}: MediaAssetsSectionProps) {
  // Update state helper
  const updateState = (field: keyof GeneratorFormState, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // Image Upload Handler
  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const newImages: UploadedImage[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      description: "",
    }));

    updateState("images", [...formState.images, ...newImages]);
  };

  // Remove image
  const removeImage = (id: string) => {
    updateState(
      "images",
      formState.images.filter((img) => img.id !== id)
    );
  };

  // Update context note
  const updateImageDescription = (id: string, text: string) => {
    updateState(
      "images",
      formState.images.map((img) =>
        img.id === id ? { ...img, description: text } : img
      )
    );
  };

  return (
    <section>
      <SectionHeader icon={ImageIcon} title="Media Assets" />

      <div className="space-y-4">
        {/* Upload Box */}
        <label className="group flex flex-col items-center justify-center w-full py-10 bg-slate-50/30 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-indigo-50/30 hover:border-indigo-300 transition-all duration-300">
          <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 group-hover:shadow-md transition-all text-indigo-500 ring-1 ring-indigo-50">
            <Upload size={20} />
          </div>

          <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
            Click to Upload Media
          </span>
          <span className="text-[10px] text-slate-400 mt-1">
            Supports JPG, PNG
          </span>

          <input
            type="file"
            multiple
            className="hidden"
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files)}
          />
        </label>

        {/* Uploaded Images List */}
        {formState.images.map((img) => (
          <div
            key={img.id}
            className="flex gap-3 p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all group"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-100 shrink-0">
              <img
                src={img.previewUrl}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>

            {/* Description Input */}
            <div className="flex-1 flex flex-col justify-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                AI Context
              </span>

              <input
                type="text"
                placeholder="e.g. Product on table, skyline, texture, scene mood"
                className="w-full text-xs font-medium border-b border-slate-100 focus:border-indigo-500 pb-1 outline-none transition-colors bg-transparent placeholder-slate-300"
                value={img.description}
                onChange={(e) => updateImageDescription(img.id, e.target.value)}
              />
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeImage(img.id)}
              className="self-center p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
