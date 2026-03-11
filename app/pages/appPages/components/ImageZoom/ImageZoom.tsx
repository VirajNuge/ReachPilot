"use client";

import React, { useState, useEffect } from "react";
import { X, Maximize2 } from "lucide-react";

interface ImageZoomModalProps {
  src: string; // The URL of the full-size image (or placeholder)
  alt: string;
  children: React.ReactNode; // The small thumbnail content we wrap
}

export default function ImageZoomModal({
  src,
  alt,
  children,
}: ImageZoomModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Feature: Close modal when pressing the "Escape" key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      {/* 1. THE TRIGGER: What you click on the page */}
      <div
        className="relative group cursor-zoom-in h-full w-full"
        onClick={() => setIsOpen(true)}
      >
        {children}

        {/* Hover Effect: Shows a subtle zoom icon */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center rounded-lg">
          <Maximize2
            className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md transform scale-75 group-hover:scale-100 transition-all duration-300"
            size={28}
          />
        </div>
      </div>

      {/* 2. THE MODAL: Full screen overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)} // Close when clicking background
        >
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 p-2 rounded-full transition-colors z-50 bg-[#000100] hover:bg-black text-white"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <X size={32} />
          </button>

          {/* The Large Image */}
          <div
            className="relative max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking the image itself
          >
            {/* If src is missing/empty, we show a fallback */}
            {src ? (
              <img
                src={src}
                alt={alt}
                className="w-full h-full object-contain max-h-[90vh]"
              />
            ) : (
              <div className="w-[80vw] h-[50vh] bg-gray-800 flex items-center justify-center text-white">
                <p>No image source generated yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
