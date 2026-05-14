"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lightbulb, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const json = await res.json();
    if (typeof json?.error === "string" && json.error.trim()) {
      return json.error;
    }
    if (typeof json?.message === "string" && json.message.trim()) {
      return json.message;
    }
  } catch {
    // Fall through to text parsing.
  }

  try {
    const text = await res.text();
    return text.trim() || `Request failed with status ${res.status}`;
  } catch {
    return `Request failed with status ${res.status}`;
  }
}

export default function GenerateIdeasPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [currentMode, setCurrentMode] = useState<IdeaMode>("voice-match");
  const [savedIdeaIds, setSavedIdeaIds] = useState<Record<string, string>>({});
  const [personaAvailable, setPersonaAvailable] = useState(false);
  const [lastFormData, setLastFormData] = useState<{
    mode: IdeaMode;
    topic: string;
    audience: string;
    coreMessage: string;
    importPersona: boolean;
    goal: string;
    vibe: string;
    platform: IdeaPlatform;
    count: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Interactive background
  const pageRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pageRef.current) return;
    const rect = pageRef.current.getBoundingClientRect();
    pageRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    pageRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  // Modal state
  const [selectedIdea, setSelectedIdea] = useState<GeneratedIdea | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadPersonaAvailability = async () => {
      try {
        const res = await fetch(`/api/idea-finder/persona-availability?accountId=${accountId}`);
        const json = await res.json();
        if (!mounted) return;
        setPersonaAvailable(Boolean(json?.data?.available));
      } catch {
        if (!mounted) return;
        setPersonaAvailable(false);
      }
    };

    if (accountId) {
      loadPersonaAvailability();
    }

    return () => {
      mounted = false;
    };
  }, [accountId]);

  const handleGenerate = async (data: {
    mode: IdeaMode;
    topic: string;
    audience: string;
    coreMessage: string;
    importPersona: boolean;
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

    if (!accountId || !accountId.trim()) {
      setError("Missing account context for Idea Finder. Please reopen the page from a valid account.");
      setIsGenerating(false);
      setGenerationStep("");
      return;
    }

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
          coreMessage: data.coreMessage,
          importPersona: data.importPersona,
          vibe: data.vibe,
          count: 6,
          accountId,
        }),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      if (!res.ok || !json?.success) {
        const message = json?.error || json?.message || (await readErrorMessage(res));
        setError(message || "Generation failed");
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
      if (savedIdeaIds[idea.id]) return;

      const res = await fetch("/api/idea-finder/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          mode: currentMode,
          accountId,
        }),
      });

      const json = await res.json();
      if (res.ok && json?.success && json?.id) {
        setSavedIdeaIds((prev) => ({ ...prev, [idea.id]: json.id }));
      }
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
    <div
      ref={pageRef}
      onMouseMove={handleMouseMove}
      className="relative h-screen bg-gradient-to-br from-[#E2EFFF] to-[#C7DEFF] flex flex-col font-sans overflow-hidden group/page"
    >
      {/* Interactive mouse-reactive grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 opacity-40 group-hover/page:opacity-100"
        style={{
          backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg width=%2730%27 height=%2730%27 viewBox=%270 0 30 30%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath d=%27M14 14V0h2v14h14v2H16v14h-2V16H0v-2h14z%27 fill=%27%2523005FFF%27 fill-opacity=%270.10%27 fill-rule=%27evenodd%27/%3E%3C/svg%3E")',
          backgroundSize: "30px 30px",
          maskImage:
            "radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 80%)",
        }}
      />

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
                personaAvailable={personaAvailable}
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
              savedIdeaIds={savedIdeaIds}
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
                <p className="text-xs text-slate-500 font-medium">
                  {ideas.length} blueprints generated — bookmark to save, or generate more.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Phase 5: Generate Variations moved here — always above the fold */}
                <button
                  type="button"
                  onClick={handleGenerateMore}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#0052FF]/30 bg-[#EEF3FF] text-xs font-bold uppercase tracking-widest text-[#0052FF] hover:bg-[#0052FF] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles size={13} />
                  Generate More
                </button>
                <button
                  type="button"
                  onClick={handleStartOver}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold uppercase tracking-widest text-slate-600 hover:border-[#0052FF]/40 hover:text-[#0052FF] transition-all"
                >
                  New Brief
                </button>
              </div>
            </div>

            <IdeaGrid
              ideas={ideas}
              mode={currentMode}
              isGenerating={false}
              generationStep={undefined}
              onIdeaClick={handleIdeaClick}
              onSave={handleSave}
              savedIdeaIds={savedIdeaIds}
              onGenerateMore={undefined}
            />
          </motion.div>
        )}
      </div>

      {/* Blueprint Modal */}
      <BlueprintModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        idea={selectedIdea}
        mode={currentMode}
        onGenerateDraft={handleGenerateDraft}
      />
    </div>
  );
}
