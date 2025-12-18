"use client";

import React from "react";
import {
  Type,
  Plus,
  Trash2,
  ChevronDown,
  AlignLeft,
  MessageSquare,
  Heading1,
  Heading2,
  MousePointerClick,
  Quote as QuoteIcon,
} from "lucide-react";

import { GeneratorFormState, TextElement } from "../../[id]/postGenerator/page";

interface ContentBlocksSectionProps {
  formState: GeneratorFormState;
  setFormState: React.Dispatch<React.SetStateAction<GeneratorFormState>>;
}

// Helper to get distinct visual styles for each block type
const getBlockTypeStyles = (type: string) => {
  switch (type) {
    case "HEADLINE":
      return {
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        focusRing: "focus-within:ring-indigo-500/20",
        icon: Heading1,
        label: "Headline",
      };
    case "SUBHEAD":
      return {
        color: "text-sky-600",
        bg: "bg-sky-50",
        border: "border-sky-200",
        focusRing: "focus-within:ring-sky-500/20",
        icon: Heading2,
        label: "Subhead",
      };
    case "CTA":
      return {
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        focusRing: "focus-within:ring-emerald-500/20",
        icon: MousePointerClick,
        label: "Button / CTA",
      };
    case "QUOTE":
      return {
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        focusRing: "focus-within:ring-amber-500/20",
        icon: QuoteIcon,
        label: "Quote",
      };
    default: // BODY
      return {
        color: "text-slate-600",
        bg: "bg-slate-50",
        border: "border-slate-200",
        focusRing: "focus-within:ring-slate-500/20",
        icon: AlignLeft,
        label: "Body Text",
      };
  }
};

const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="flex items-center gap-3 text-slate-800 pb-4 mb-2">
    <div className="p-2 bg-white text-indigo-600 rounded-lg shadow-sm border border-slate-200">
      <Icon size={18} strokeWidth={2.5} />
    </div>
    <h3 className="text-sm font-bold text-slate-700">{title}</h3>
  </div>
);

export default function ContentBlocksSection({
  formState,
  setFormState,
}: ContentBlocksSectionProps) {
  const updateState = (field: keyof GeneratorFormState, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const addTextElement = () => {
    const el: TextElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: "BODY",
      content: "",
    };
    updateState("textElements", [...formState.textElements, el]);
  };

  const removeTextElement = (id: string) => {
    updateState(
      "textElements",
      formState.textElements.filter((t) => t.id !== id)
    );
  };

  const updateTextElement = (
    id: string,
    field: keyof TextElement,
    value: string
  ) => {
    updateState(
      "textElements",
      formState.textElements.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      )
    );
  };

  return (
    <section className="bg-slate-50/50 p-1 rounded-xl">
      <div className="px-2">
        <SectionHeader icon={Type} title="Content Structure" />
      </div>

      <div className="space-y-3">
        {/* LIST OF CONTENT BLOCKS */}
        {formState.textElements.map((element, index) => {
          const styles = getBlockTypeStyles(element.type);
          const TypeIcon = styles.icon;
          const isLongText =
            element.type === "BODY" || element.type === "QUOTE";

          return (
            <div
              key={element.id}
              className={`group relative bg-white border rounded-xl transition-all duration-300 shadow-sm hover:shadow-md ${styles.border} ${styles.focusRing} focus-within:ring-4 focus-within:border-transparent`}
            >
              {/* Left Color Indicator Strip */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${styles.bg.replace(
                  "bg-",
                  "bg-gradient-to-b from-"
                )} from-transparent to-transparent opacity-50`}
              />

              <div className="p-4 pl-5">
                {/* Header Row: Type Selector & Delete */}
                <div className="flex justify-between items-start mb-3">
                  <div className="relative">
                    <div
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-[10px] font-bold uppercase tracking-wider transition-colors ${styles.bg} ${styles.color} ${styles.border}`}
                    >
                      <TypeIcon size={12} />
                      {/* Select Overlay */}
                      <select
                        value={element.type}
                        onChange={(e) =>
                          updateTextElement(element.id, "type", e.target.value)
                        }
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      >
                        <option value="HEADLINE">Headline</option>
                        <option value="SUBHEAD">Sub-headline</option>
                        <option value="BODY">Body Text</option>
                        <option value="CTA">Call to Action</option>
                        <option value="QUOTE">Quote</option>
                      </select>
                      {styles.label}
                      <ChevronDown size={10} className="ml-1 opacity-50" />
                    </div>
                  </div>

                  <button
                    onClick={() => removeTextElement(element.id)}
                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Remove block"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Content Input Area */}
                <div className="relative">
                  {isLongText ? (
                    <textarea
                      value={element.content}
                      onChange={(e) =>
                        updateTextElement(element.id, "content", e.target.value)
                      }
                      placeholder={`Write your ${element.type.toLowerCase()} content here...`}
                      rows={element.type === "QUOTE" ? 2 : 3}
                      className="w-full text-sm text-slate-700 bg-transparent border-none p-0 placeholder-slate-300 focus:ring-0 resize-none leading-relaxed"
                    />
                  ) : (
                    <input
                      type="text"
                      value={element.content}
                      onChange={(e) =>
                        updateTextElement(element.id, "content", e.target.value)
                      }
                      placeholder={`Enter ${styles.label.toLowerCase()} text...`}
                      className={`w-full text-sm font-medium bg-transparent border-none p-0 placeholder-slate-300 focus:ring-0 ${
                        element.type === "HEADLINE" ? "text-lg" : ""
                      }`}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State / Add Button Area */}
        {formState.textElements.length === 0 ? (
          <button
            onClick={addTextElement}
            className="w-full group flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all duration-300 cursor-pointer"
          >
            <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
              <MessageSquare className="text-indigo-400" size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500 group-hover:text-indigo-600">
              Start building your post
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Click to add your first content block
            </p>
          </button>
        ) : (
          <button
            onClick={addTextElement}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all duration-300"
          >
            <Plus size={14} /> Add Content Block
          </button>
        )}
      </div>
    </section>
  );
}
