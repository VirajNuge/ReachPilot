"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import MotionBackground from "../../components/Shared/MotionBackground";
import BriefingForm from "../../components/GenerateIdeas/BriefingForm";
import IdeaGrid from "../../components/GenerateIdeas/Board/IdeaGrid";
import BlueprintModal from "../../components/GenerateIdeas/BlueprintModal";
import type {
  GeneratedIdea,
  IdeaMode,
  IdeaPlatform,
  IdeaFinderResponse,
} from "@/lib/ideaFinder/types";
import type { PostGenerationInput } from "@/lib/types/postGeneration";
import { mapIdeaToPostSeed } from "@/lib/ideaFinder/ideaToPostSeed";
import { validatePostSeed } from "@/lib/ideaFinder/postSeedValidation";

export default function GenerateIdeasPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [currentMode, setCurrentMode] = useState<IdeaMode>("voice-match");
  const [lastFormData, setLastFormData] = useState<{
    mode: IdeaMode;
    topic: string;
    audience: string;
    goal: string;
    vibe: string;
    platform: IdeaPlatform;
    count: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [selectedIdea, setSelectedIdea] = useState<GeneratedIdea | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGenerate = async (data: {
    mode: IdeaMode;
    topic: string;
    audience: string;
    goal: string;
    vibe: string;
    platform: IdeaPlatform;
    count: number;
  }) => {
    setIsGenerating(true);
    setGenerationStep("Analyzing your brief and context...");
    setError(null);
    setIdeas([]);
    setCurrentMode(data.mode);
    setLastFormData(data);

    try {
      setGenerationStep("Generating high-quality idea blueprints...");
      const res = await fetch("/api/idea-finder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: data.mode,
          topic: data.topic,
          platform: data.platform,
          audience: data.audience,
          vibe: data.vibe,
          count: data.count,
          accountId,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Generation failed");
        return;
      }

      setGenerationStep("Finalizing output...");
      const response = json.data as IdeaFinderResponse;
      setIdeas(response.ideas);
    } catch {
      setError("Network error — please try again");
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  const handleIdeaClick = (idea: GeneratedIdea) => {
    setSelectedIdea(idea);
    setIsModalOpen(true);
  };

  const handleSave = async (idea: GeneratedIdea) => {
    try {
      await fetch("/api/idea-finder/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          mode: currentMode,
          accountId,
        }),
      });
    } catch {
      // Fire-and-forget
    }
  };

  const handleFeedback = async (
    idea: GeneratedIdea,
    feedback: "positive" | "negative"
  ) => {
    try {
      await fetch("/api/idea-finder/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId: idea.id,
          feedback,
        }),
      });
    } catch {
      // Fire-and-forget
    }
  };

  const handleGenerateMore = () => {
    if (lastFormData) {
      handleGenerate(lastFormData);
    }
  };

  const handleStartOver = () => {
    setIdeas([]);
    setError(null);
    setGenerationStep("");
  };

  const handleGenerateDraft = async (idea: GeneratedIdea, editedSeed?: PostGenerationInput) => {
    try {
      // Use edited seed if provided, otherwise fallback to idea.postSeed, or regenerate
      let seedToUse = editedSeed ?? idea.postSeed;
      if (!seedToUse) {
        console.warn("[handleGenerateDraft] postSeed missing — regenerating from mapper");
        const { postSeed } = mapIdeaToPostSeed(idea, currentMode);
        seedToUse = postSeed;
      }

      // Client-side validation before API call
      const validation = validatePostSeed(seedToUse);
      if (!validation.valid) {
        const missingFields = validation.errors.filter((e) => e.severity === "error").map((e) => e.message).join(", ");
        setError(`Cannot hand off: ${missingFields}`);
        return;
      }

      // Attach seed to idea for handoff
      const ideaWithSeed: GeneratedIdea = { ...idea, postSeed: seedToUse };

      const res = await fetch("/api/idea-finder/to-post-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: ideaWithSeed }),
      });

      const json = await res.json();
      if (!res.ok || !json?.success || !json?.data?.input) {
        setError(json?.error || "Failed to prepare Post Generator handoff");
        return;
      }

      localStorage.setItem(
        "reachpilot_post_generator_seed_input",
        JSON.stringify(json.data.input),
      );
      router.push(`/${accountId}/postGenerator`);
    } catch {
      setError("Failed to open Post Generator with this idea");
    }
  };

  const showInputForm = !isGenerating && ideas.length === 0;
  const showOutput = !isGenerating && ideas.length > 0;

  return (
    <div className="relative h-screen bg-[#f4f8fb] flex flex-col font-sans overflow-hidden">
      <MotionBackground />

      <div className="relative z-10 flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {error && (
          <div className="max-w-5xl mx-auto mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        {showInputForm && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="max-w-[760px] mx-auto bg-white rounded-3xl border border-slate-100 shadow-[0_12px_36px_rgba(15,23,42,0.08)] overflow-hidden"
          >
            <div className="px-8 pt-8 pb-5 border-b border-slate-100">
              <div className="flex items-center justify-center gap-3">
                <div className="p-2.5 bg-[#0052FF]/10 text-[#0052FF] rounded-xl">
                  <Lightbulb size={18} className="stroke-[2.5px]" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-black text-[#000100] tracking-tight leading-none">
                    Generate Ideas
                  </h2>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mt-1 block">
                    Content Strategist AI
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mt-4 text-center max-w-lg mx-auto">
                Enter your brief in guided steps. Output appears only after generation completes.
              </p>
            </div>

            <div className="px-8 py-6">
              <BriefingForm
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            </div>
          </motion.div>
        )}

        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-[980px] mx-auto"
          >
            <IdeaGrid
              ideas={ideas}
              mode={currentMode}
              isGenerating={isGenerating}
              generationStep={generationStep}
              onIdeaClick={handleIdeaClick}
              onSave={handleSave}
              onFeedback={handleFeedback}
              onGenerateMore={undefined}
            />
          </motion.div>
        )}

        {showOutput && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-[1600px] mx-auto"
          >
            <div className="mb-5 flex items-center justify-between bg-white/70 backdrop-blur-sm border border-slate-100 rounded-2xl px-5 py-3">
              <div>
                <h3 className="text-sm font-black text-[#000100] uppercase tracking-widest">Idea Output</h3>
                <p className="text-xs text-slate-500 font-medium">Your generated blueprints are ready.</p>
              </div>
              <button
                type="button"
                onClick={handleStartOver}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold uppercase tracking-widest text-slate-600 hover:border-[#0052FF]/40 hover:text-[#0052FF] transition-all"
              >
                New Brief
              </button>
            </div>

            <IdeaGrid
              ideas={ideas}
              mode={currentMode}
              isGenerating={false}
              generationStep={undefined}
              onIdeaClick={handleIdeaClick}
              onSave={handleSave}
              onFeedback={handleFeedback}
              onGenerateMore={handleGenerateMore}
            />
          </motion.div>
        )}
      </div>

      {/* Blueprint Modal */}
      <BlueprintModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        idea={selectedIdea}
        onGenerateDraft={handleGenerateDraft}
      />
    </div>
  );
}
