"use client";

import React, { useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  User,
  Sparkles,
  SlidersHorizontal,
  FileText,
  LayoutGrid,
  Image as ImageIcon,
  Plus,
  X,
  Upload,
  Wand2,
} from "lucide-react";

import type {
  PostGenerationInput,
  PostObjective,
  TargetAudience,
  ContentAngle,
  PostPlatform,
  BrandType,
  VisualStyle,
  ImageGenType,
  GeminiImageModel,
  ToneType,
  CTAType,
  IntensityLevel,
  ContentStrategyOutput,
  CaptionGeneratorOutput,
  PosterPromptOutput,
  ImageVariation,
  PostPackage,
  ContentScore,
  HookOption,
  RemixStyle,
  PostTextBlock,
  ReferenceImage,
} from "@/lib/types/postGeneration";
import {
  POST_OBJECTIVE_LABELS,
  TARGET_AUDIENCE_LABELS,
  CONTENT_ANGLE_LABELS,
  BRAND_TYPE_LABELS,
  VISUAL_STYLE_LABELS,
  IMAGE_GEN_TYPE_LABELS,
  IMAGE_MODEL_LABELS,
  TONE_LABELS,
  CTA_LABELS,
  PLATFORM_DISPLAY,
  PLATFORM_INTELLIGENCE,
  POST_IMAGE_SIZES,
} from "@/lib/types/postGeneration";

import { GenerationPipeline, PipelineStage } from "./Pipeline/GenerationPipeline";
import { OutputDashboard } from "./Output/OutputDashboard";

// ── Constants ────────────────────────────────────────────────────────────────

type ViewState = "idle" | "generating" | "output";

const ALL_PLATFORMS: PostPlatform[] = ["linkedin", "x", "instagram_post", "facebook"];

const FONTS = [
  "Montserrat",
  "Inter",
  "Poppins",
  "Roboto",
  "Playfair Display",
  "Space Grotesk",
];

const INITIAL_STAGES: PipelineStage[] = [
  {
    name: "Content Strategist",
    description: "Analyzing your brief and creating a content strategy",
    status: "pending",
  },
  {
    name: "Caption Generator",
    description: "Writing platform-optimized captions",
    status: "pending",
  },
  {
    name: "Image Prompt Generator",
    description: "Designing visual concepts for your post",
    status: "pending",
  },
  {
    name: "Image Render",
    description: "Generating your social media image with AI",
    status: "pending",
  },
];

function buildPipelineStages(platforms: PostPlatform[]): PipelineStage[] {
  const stages: PipelineStage[] = [
    { name: "Content Strategist", description: "Analyzing your brief and creating a content strategy", status: "pending" },
    { name: "Caption Generator", description: "Writing platform-optimized captions", status: "pending" },
  ];
  if (platforms.includes("linkedin")) {
    stages.push({ name: "LinkedIn Optimizer", description: "Refining your LinkedIn post for maximum virality", status: "pending" });
  }
  if (platforms.includes("x")) {
    stages.push({ name: "X Optimizer", description: "Refining your X post for maximum engagement", status: "pending" });
  }
  if (platforms.includes("instagram_post")) {
    stages.push({ name: "Instagram Optimizer", description: "Refining your Instagram post for maximum engagement", status: "pending" });
  }
  if (platforms.includes("facebook")) {
    stages.push({ name: "Facebook Optimizer", description: "Refining your Facebook post for maximum discussion and reach", status: "pending" });
  }
  stages.push({ name: "Image Prompt Generator", description: "Designing visual concepts for your post", status: "pending" });
  stages.push({ name: "Image Render", description: "Generating your social media image with AI", status: "pending" });
  return stages;
}

const DEFAULT_INPUT: PostGenerationInput = {
  objective: "educational",
  targetAudiences: ["general_audience"],
  coreMessage: "",
  platforms: ["linkedin"],
  generationFocus: "balanced",
  brandType: "personal_brand",
  visualStyles: ["minimal"],
  imageGenType: "ai_background",
  brandAssets: { colorPalette: ["#0052FF", "#1A1D23"], watermark: false },
  tones: ["professional"],
  ctas: ["none"],
  emojiLevel: "medium",
  hashtagIntensity: "medium",
  textBlocks: [],
  referenceImages: [],
};

// ── Persona → Wizard mapping helpers ─────────────────────────────────────────

function deriveBrandType(userRole: string, industry: string): BrandType {
  if (["Agency"].includes(industry)) return "agency";
  if (["E-commerce"].includes(industry)) return "ecommerce";
  if (["Founder", "Executive"].includes(userRole) && ["SaaS", "Fintech", "EdTech"].includes(industry)) return "startup_saas";
  if (["Creator", "Coach", "Freelancer"].includes(userRole)) return "creator";
  if (["Marketer", "Sales Rep", "Consultant"].includes(userRole)) return "personal_brand";
  return "personal_brand";
}

function deriveTargetAudience(
  audienceRole: string | string[] | undefined,
  audienceSegments: string[] | undefined
): TargetAudience {
  const roleStr = Array.isArray(audienceRole) ? audienceRole.join(" ") : (audienceRole ?? "");
  const combined = (roleStr + " " + (audienceSegments ?? []).join(" ")).toLowerCase();
  if (combined.includes("founder") || combined.includes("startup")) return "startup_founders";
  if (combined.includes("developer") || combined.includes("engineer")) return "developers";
  if (combined.includes("marketing") || combined.includes("agency")) return "marketing_agencies";
  if (combined.includes("real estate")) return "real_estate_buyers";
  if (roleStr || (audienceSegments && audienceSegments.length > 0)) return "custom";
  return "general_audience";
}

function deriveTone(
  sliders: { formalCasual: number; seriousPlayful: number; inspiringInformative: number; dataDriven: number } | undefined
): ToneType {
  if (!sliders) return "professional";
  if (sliders.formalCasual < 30) return "authority";
  if (sliders.formalCasual > 70) return sliders.seriousPlayful > 60 ? "witty" : "friendly";
  if (sliders.inspiringInformative < 40) return "inspirational";
  if (sliders.dataDriven > 60) return "professional";
  return "professional";
}

function deriveVisualStyle(
  brandArchetype: string | string[] | undefined,
  toneSliders: { formalCasual: number } | undefined
): VisualStyle {
  const a = (Array.isArray(brandArchetype) ? brandArchetype.join(" ") : (brandArchetype ?? "")).toLowerCase();
  if (a.includes("luxury") || a.includes("sage")) return "luxury";
  if (a.includes("rebel") || a.includes("outlaw")) return "bold";
  if (a.includes("tech") || a.includes("magician")) return "tech";
  if (a.includes("caregiver") || a.includes("everyman")) return "friendly";
  if (toneSliders && toneSliders.formalCasual < 35) return "corporate";
  return "minimal";
}

function deriveEmojiLevel(emojiUsage: string | undefined): IntensityLevel {
  if (!emojiUsage || emojiUsage.includes("None") || emojiUsage.includes("Strict")) return "low";
  if (emojiUsage.includes("Minimal")) return "low";
  if (emojiUsage.includes("Moderate")) return "medium";
  if (emojiUsage.includes("Heavy")) return "high";
  return "medium";
}

function deriveCTA(conversionGoal: string | string[] | undefined): CTAType {
  if (!conversionGoal || (Array.isArray(conversionGoal) && conversionGoal.length === 0)) return "none";
  const goal = Array.isArray(conversionGoal) ? conversionGoal.join(" ") : conversionGoal;
  if (goal.includes("call")) return "visit_link";
  if (goal.includes("newsletter") || goal.includes("lead magnet")) return "sign_up";
  if (goal.includes("Buy") || goal.includes("product")) return "visit_link";
  if (goal.includes("Follow")) return "follow_for_more";
  if (goal.includes("community") || goal.includes("Join")) return "comment_cta";
  return "none";
}

function deriveContentAngle(contentMix: string[] | undefined): ContentAngle | undefined {
  if (!contentMix?.length) return undefined;
  if (contentMix.includes("How-to Guides")) return "step_by_step_guide";
  if (contentMix.includes("Thought Leadership")) return "contrarian_opinion";
  if (contentMix.includes("Personal Stories") || contentMix.includes("Behind-the-Scenes")) return "story";
  if (contentMix.includes("Case Studies")) return "data_insight";
  return undefined;
}

function deriveObjective(primaryObjective: string[] | undefined): PostObjective {
  if (!primaryObjective?.length) return "educational";
  if (primaryObjective.includes("Generate Leads")) return "lead_generation";
  if (primaryObjective.includes("Sell Products")) return "promotional";
  if (primaryObjective.includes("Build Authority")) return "thought_leadership";
  if (primaryObjective.includes("Grow Community")) return "engagement";
  return "educational";
}

// ── Dropdown component helper ─────────────────────────────────────────────────

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] outline-none transition-all text-sm font-medium text-gray-800 appearance-none cursor-pointer pr-9"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

// ── Multi-select pill component ───────────────────────────────────────────────

interface MultiSelectPillsProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}

function MultiSelectPills({ label, options, selected, onChange }: MultiSelectPillsProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };
  return (
    <div className="mb-4">
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                isSelected
                  ? "bg-[#0052FF] text-white border-[#0052FF] shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#0052FF]/40 hover:text-[#0052FF]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function PostGeneratorPage() {
  const params = useParams();
  const accountId = params?.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refImgInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formInput, setFormInput] = useState<PostGenerationInput>(DEFAULT_INPUT);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Persona import state
  const [usePersonaImport, setUsePersonaImport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Generation state machine
  const [view, setView] = useState<ViewState>("idle");
  const [lastInput, setLastInput] = useState<PostGenerationInput | null>(null);
  const [strategy, setStrategy] = useState<ContentStrategyOutput | null>(null);
  const [captionOutput, setCaptionOutput] = useState<CaptionGeneratorOutput | null>(null);
  const [imagePrompt, setImagePrompt] = useState<PosterPromptOutput | null>(null);
  const [postPackage, setPostPackage] = useState<PostPackage | null>(null);
  const [contentScore, setContentScore] = useState<ContentScore | null>(null);
  const [hooks, setHooks] = useState<HookOption[] | null>(null);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(INITIAL_STAGES);
  const [error, setError] = useState<string | null>(null);
  const [isRemixing, setIsRemixing] = useState(false);
  const [isScoring, setIsScoring] = useState(false);

  // ── Form helpers ──────────────────────────────────────────────────────────

  const updateInput = (updates: Partial<PostGenerationInput>) => {
    setFormInput((prev) => ({ ...prev, ...updates }));
  };

  const handlePlatformToggle = (platform: PostPlatform) => {
    const current = formInput.platforms;
    if (current.includes(platform)) {
      updateInput({ platforms: current.filter((p) => p !== platform) });
    } else {
      updateInput({ platforms: [...current, platform] });
    }
  };

  // ── Color palette helpers ─────────────────────────────────────────────────

  const handleAddColor = () => {
    if (formInput.brandAssets.colorPalette.length < 5) {
      updateInput({
        brandAssets: {
          ...formInput.brandAssets,
          colorPalette: [...formInput.brandAssets.colorPalette, "#000000"],
        },
      });
    }
  };

  const handleUpdateColor = (index: number, color: string) => {
    const newPalette = [...formInput.brandAssets.colorPalette];
    newPalette[index] = color;
    updateInput({ brandAssets: { ...formInput.brandAssets, colorPalette: newPalette } });
  };

  const handleRemoveColor = (index: number) => {
    const newPalette = formInput.brandAssets.colorPalette.filter((_, i) => i !== index);
    updateInput({ brandAssets: { ...formInput.brandAssets, colorPalette: newPalette } });
  };

  // ── Logo upload ───────────────────────────────────────────────────────────

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateInput({
          brandAssets: { ...formInput.brandAssets, logoUrl: reader.result as string },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // ── Persona import ────────────────────────────────────────────────────────

  const handlePersonaImport = async (enabled: boolean) => {
    setUsePersonaImport(enabled);
    if (!enabled) {
      setImportStatus(null);
      return;
    }
    if (!accountId) {
      setImportStatus("No account ID provided");
      return;
    }

    setIsImporting(true);
    setImportStatus(null);

    try {
      const res = await fetch(`/api/persona?accountId=${accountId}`);
      if (!res.ok) {
        setImportStatus("No persona found for this account");
        return;
      }
      const data = await res.json();
      const p = data.persona;
      if (!p) {
        setImportStatus("No persona found — set up your Persona Builder first");
        return;
      }

      const updates: Partial<PostGenerationInput> = {};

      updates.objective = deriveObjective(p.primaryObjective);
      const audience = deriveTargetAudience(p.audienceRole, p.audienceSegments);
      updates.targetAudiences = [audience];
      if (audience === "custom") {
        updates.customAudience = [
          ...(Array.isArray(p.audienceRole) ? p.audienceRole : p.audienceRole ? [p.audienceRole] : []),
          ...(p.audienceSegments ?? [])
        ].filter(Boolean).join(", ");
      }
      const angle = deriveContentAngle(p.contentMix);
      if (angle) updates.contentAngles = [angle];

      updates.brandType = deriveBrandType(p.userRole ?? "", p.industry ?? "");
      updates.visualStyles = [deriveVisualStyle(p.brandArchetype, p.toneSliders)];
      const personaColors =
        p.colorPalette?.length ? p.colorPalette : p.brandColorHex ? [p.brandColorHex] : [];
      updates.brandAssets = {
        watermark: formInput.brandAssets.watermark,
        colorPalette: personaColors.length ? personaColors : formInput.brandAssets.colorPalette,
        fontFamily: p.fontFamily || formInput.brandAssets.fontFamily,
        logoUrl: p.logoUrl || formInput.brandAssets.logoUrl,
      };

      updates.tones = [deriveTone(p.toneSliders)];
      updates.ctas = [deriveCTA(p.conversionGoal)];
      updates.emojiLevel = deriveEmojiLevel(p.emojiUsage);

      updateInput(updates);
      setImportStatus(`Imported ${Object.keys(updates).length} fields from persona`);
    } catch {
      setImportStatus("Failed to import persona");
    } finally {
      setIsImporting(false);
    }
  };

  // ── Pipeline helpers ──────────────────────────────────────────────────────

  const updateStageStatus = (index: number, status: PipelineStage["status"]) => {
    setPipelineStages((prev) =>
      prev.map((stage, i) => (i === index ? { ...stage, status } : stage))
    );
  };

  const getCurrentStageIndex = () => {
    const activeIndex = pipelineStages.findIndex((s) => s.status === "active");
    if (activeIndex !== -1) return activeIndex;
    const errorIndex = pipelineStages.findIndex((s) => s.status === "error");
    if (errorIndex !== -1) return errorIndex;
    const allCompleted = pipelineStages.every((s) => s.status === "completed");
    if (allCompleted) return pipelineStages.length;
    return 0;
  };

  // ── Generation ────────────────────────────────────────────────────────────

  const handleGenerate = async (wizardInput: PostGenerationInput) => {
    setLastInput(wizardInput);
    setView("generating");
    setError(null);

    const hasLinkedIn = wizardInput.platforms.includes("linkedin");
    const hasX = wizardInput.platforms.includes("x");
    const hasInstagram = wizardInput.platforms.includes("instagram_post");
    const hasFacebook = wizardInput.platforms.includes("facebook");
    const dynamicStages = buildPipelineStages(wizardInput.platforms);
    setPipelineStages(dynamicStages.map((s, i) => i === 0 ? { ...s, status: "active" } : s));

    // Dynamic stage indices
    let offset = 2; // after strategist + captions
    const stageIdx = {
      strategist: 0,
      captions: 1,
      linkedInOptimizer: hasLinkedIn ? offset++ : -1,
      xOptimizer: hasX ? offset++ : -1,
      instagramOptimizer: hasInstagram ? offset++ : -1,
      facebookOptimizer: hasFacebook ? offset++ : -1,
      imagePrompt: offset++,
      imageRender: offset,
    };

    try {
      // Stage 1: Strategist
      const strategyRes = await fetch("/api/post-generation/strategist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: wizardInput, accountId, includePersona: usePersonaImport }),
      });

      if (!strategyRes.ok) {
        const errBody = await strategyRes.json().catch(() => ({}));
        throw new Error((errBody as { error?: string }).error || `Strategy failed (${strategyRes.status})`);
      }
      const strategyJson = await strategyRes.json();
      const strategyData: ContentStrategyOutput = strategyJson.strategy;
      setStrategy(strategyData);

      updateStageStatus(stageIdx.strategist, "completed");
      updateStageStatus(stageIdx.captions, "active");

      // Stage 2: Captions
      const captionsRes = await fetch("/api/post-generation/captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: wizardInput, strategy: strategyData, accountId, includePersona: usePersonaImport }),
      });

      if (!captionsRes.ok) {
        const errBody = await captionsRes.json().catch(() => ({}));
        throw new Error((errBody as { error?: string }).error || `Captions failed (${captionsRes.status})`);
      }
      const captionsJson = await captionsRes.json();
      const captionsData: CaptionGeneratorOutput = captionsJson.captions;
      setCaptionOutput(captionsData);

      // Build captions record early so we can refine LinkedIn before image prompt
      const captionsRecord: Record<string, string> = Object.fromEntries(
        captionsData.captions.map((c) => [c.platform, c.caption])
      );

      updateStageStatus(stageIdx.captions, "completed");

      // Stage 2.5: LinkedIn Optimizer (conditional)
      let linkedInRefinedData: PostPackage["linkedInRefined"] | undefined = undefined;
      if (hasLinkedIn && captionsRecord["linkedin"]) {
        updateStageStatus(stageIdx.linkedInOptimizer, "active");
        try {
          const linkedInRefineRes = await fetch("/api/post-generation/linkedin-refine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              caption: captionsRecord["linkedin"],
              input: wizardInput,
              strategy: strategyData,
              accountId,
              includePersona: usePersonaImport,
            }),
          });
          if (linkedInRefineRes.ok) {
            const refineJson = await linkedInRefineRes.json();
            captionsRecord["linkedin"] = refineJson.refinedCaption;
            linkedInRefinedData = {
               viralityScore: refineJson.viralityScore,
               qualityFlags: refineJson.qualityFlags,
             };
          }
        } catch (err) {
          console.warn("LinkedIn refine failed (non-fatal):", err);
        }
        updateStageStatus(stageIdx.linkedInOptimizer, "completed");
      }

      // Stage 2.6: X Optimizer (conditional)
      let xRefinedData: PostPackage["xRefined"] | undefined = undefined;
      if (hasX && captionsRecord["x"]) {
        updateStageStatus(stageIdx.xOptimizer, "active");
        try {
          const xRefineRes = await fetch("/api/post-generation/x-refine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              caption: captionsRecord["x"],
              input: wizardInput,
              strategy: strategyData,
              accountId,
              includePersona: usePersonaImport,
            }),
          });
          if (xRefineRes.ok) {
            const refineJson = await xRefineRes.json();
            captionsRecord["x"] = refineJson.refinedPost;
            xRefinedData = {
              engagementScore: refineJson.engagementScore,
              qualityFlags: refineJson.qualityFlags,
            };
          }
        } catch (err) {
          console.warn("X refine failed (non-fatal):", err);
        }
        updateStageStatus(stageIdx.xOptimizer, "completed");
      }

      // Stage 2.7: Instagram Optimizer (conditional)
      let instagramRefinedData: PostPackage["instagramRefined"] | undefined = undefined;
      if (hasInstagram && captionsRecord["instagram_post"]) {
        updateStageStatus(stageIdx.instagramOptimizer, "active");
        try {
          const igRefineRes = await fetch("/api/post-generation/instagram-refine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              caption: captionsRecord["instagram_post"],
              input: wizardInput,
              strategy: strategyData,
              accountId,
              includePersona: usePersonaImport,
            }),
          });
          if (igRefineRes.ok) {
            const refineJson = await igRefineRes.json();
            captionsRecord["instagram_post"] = refineJson.refinedCaption;
            instagramRefinedData = {
              engagementScore: refineJson.engagementScore,
              qualityFlags: refineJson.qualityFlags,
              postType: refineJson.postType,
            };
          }
        } catch (err) {
          console.warn("Instagram refine failed (non-fatal):", err);
        }
        updateStageStatus(stageIdx.instagramOptimizer, "completed");
      }

      // Stage 2.8: Facebook Optimizer (conditional)
      let facebookRefinedData: PostPackage["facebookRefined"] | undefined = undefined;
      if (hasFacebook && captionsRecord["facebook"]) {
        updateStageStatus(stageIdx.facebookOptimizer, "active");
        try {
          const fbRefineRes = await fetch("/api/post-generation/facebook-refine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              caption: captionsRecord["facebook"],
              input: wizardInput,
              strategy: strategyData,
              accountId,
              includePersona: usePersonaImport,
            }),
          });
          if (fbRefineRes.ok) {
            const refineJson = await fbRefineRes.json();
            captionsRecord["facebook"] = refineJson.refinedPost;
            facebookRefinedData = {
              engagementScore: refineJson.engagementScore,
              qualityFlags: refineJson.qualityFlags,
            };
          }
        } catch (err) {
          console.warn("Facebook refine failed (non-fatal):", err);
        }
        updateStageStatus(stageIdx.facebookOptimizer, "completed");
      }

      updateStageStatus(stageIdx.imagePrompt, "active");

      // Stage 3: Image Prompt
      const imagePromptRes = await fetch("/api/post-generation/image-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: wizardInput, strategy: strategyData, accountId, includePersona: usePersonaImport }),
      });

      if (!imagePromptRes.ok) {
        const errBody = await imagePromptRes.json().catch(() => ({}));
        throw new Error((errBody as { error?: string }).error || `Image prompt failed (${imagePromptRes.status})`);
      }
      const imagePromptJson = await imagePromptRes.json();
      const imagePromptData: PosterPromptOutput = imagePromptJson.imagePrompt;
      setImagePrompt(imagePromptData);

      updateStageStatus(stageIdx.imagePrompt, "completed");
      updateStageStatus(stageIdx.imageRender, "active");

      // Stage 4: Generate poster variations
      let generatedVariations: ImageVariation[] = [];
      try {
        const generateImageRes = await fetch("/api/post-generation/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            posterOutput: imagePromptData,
            input: wizardInput,
            imageModel: wizardInput.imageModel,
            accountId,
          }),
        });

        if (generateImageRes.ok) {
          const imageGenJson = await generateImageRes.json();
          generatedVariations = imageGenJson.images ?? [];
        } else {
          console.warn("Image generation failed, continuing without images");
        }
      } catch (imageGenError) {
        console.warn("Image generation error (non-fatal):", imageGenError);
      }

      updateStageStatus(stageIdx.imageRender, "completed");

      const sizesRecord = Object.fromEntries(
        wizardInput.platforms.map((p) => [
          p,
          `${PLATFORM_INTELLIGENCE[p].imageSizes[0].width}x${PLATFORM_INTELLIGENCE[p].imageSizes[0].height}`,
        ])
      );

      const newPostPackage: PostPackage = {
        imagePrompt: imagePromptData.posterPrompt,
        imageUrl: generatedVariations[0]?.imageUrl,
        imageVariations: generatedVariations,
        captions: captionsRecord,
        hashtags: captionsData.hashtags,
        sizes: sizesRecord,
        headline: imagePromptData.headline,
        subtext: imagePromptData.subtext,
        cta: imagePromptData.cta,
        designStyle: wizardInput.visualStyles[0] ?? "minimal",
        linkedInRefined: linkedInRefinedData,
        xRefined: xRefinedData,
        instagramRefined: instagramRefinedData,
        facebookRefined: facebookRefinedData,
      };

      setPostPackage(newPostPackage);
      setView("output");

      // Fire Hooks generation in background
      fetch("/api/post-generation/hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: wizardInput, strategy: strategyData, accountId, includePersona: usePersonaImport }),
      })
        .then((res) => res.json())
        .then((data) => setHooks(data.hooks))
        .catch((err) => console.error("Failed to generate hooks:", err));
    } catch (err: unknown) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred during generation.");
      setPipelineStages((prev) =>
        prev.map((stage) => (stage.status === "active" ? { ...stage, status: "error" } : stage))
      );
    }
  };

  const handleRemix = async (caption: string, platform: string, style: RemixStyle) => {
    if (!postPackage) return;
    setIsRemixing(true);
    try {
      const res = await fetch("/api/post-generation/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption, platform, remixStyle: style, accountId }),
      });
      if (!res.ok) throw new Error("Failed to remix caption");
      const data = await res.json();
      setPostPackage((prev) => {
        if (!prev) return prev;
        return { ...prev, captions: { ...prev.captions, [platform]: data.remixedCaption } };
      });
    } catch (err) {
      console.error("Remix error:", err);
    } finally {
      setIsRemixing(false);
    }
  };

  const handleScoreRequest = async (platform: string) => {
    if (!postPackage) return;
    setIsScoring(true);
    try {
      const caption = postPackage.captions[platform];
      const res = await fetch("/api/post-generation/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption, platform, headline: postPackage.headline }),
      });
      if (!res.ok) throw new Error("Failed to score content");
      const scoreJson = await res.json();
      const data: ContentScore = scoreJson.score;
      setContentScore(data);
      setPostPackage((prev) => {
        if (!prev) return prev;
        return { ...prev, contentScore: data };
      });
    } catch (err) {
      console.error("Score error:", err);
    } finally {
      setIsScoring(false);
    }
  };

  const handleRetry = () => {
    if (lastInput) {
      handleGenerate(lastInput);
    } else {
      setView("idle");
    }
  };

  const canGenerate = formInput.coreMessage.trim().length > 0 && formInput.platforms.length > 0;

  // ── Text block helpers ────────────────────────────────────────────────────

  const addTextBlock = () => {
    const newBlock: PostTextBlock = {
      id: Date.now().toString(),
      label: "Title",
      text: "",
    };
    updateInput({ textBlocks: [...(formInput.textBlocks ?? []), newBlock] });
  };

  const updateTextBlock = (id: string, changes: Partial<PostTextBlock>) => {
    updateInput({
      textBlocks: (formInput.textBlocks ?? []).map((b) =>
        b.id === id ? { ...b, ...changes } : b
      ),
    });
  };

  const removeTextBlock = (id: string) => {
    updateInput({ textBlocks: (formInput.textBlocks ?? []).filter((b) => b.id !== id) });
  };

  // ── Reference image helpers ───────────────────────────────────────────────

  const handleReferenceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImg: ReferenceImage = {
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          label: file.name.replace(/\.[^/.]+$/, ""),
          dataUrl: reader.result as string,
        };
        updateInput({ referenceImages: [...(formInput.referenceImages ?? []), newImg] });
      };
      reader.readAsDataURL(file);
    });
    // Reset input so same file can be re-added
    if (e.target) e.target.value = "";
  };

  const updateReferenceImageLabel = (id: string, label: string) => {
    updateInput({
      referenceImages: (formInput.referenceImages ?? []).map((img) =>
        img.id === id ? { ...img, label } : img
      ),
    });
  };

  const removeReferenceImage = (id: string) => {
    updateInput({ referenceImages: (formInput.referenceImages ?? []).filter((img) => img.id !== id) });
  };

  // ── Options arrays for dropdowns ──────────────────────────────────────────

  const objectiveOptions = (
    Object.entries(POST_OBJECTIVE_LABELS) as [PostObjective, { label: string; emoji: string }][]
  ).map(([key, { label }]) => ({ value: key, label }));

  const audienceOptions = (
    Object.entries(TARGET_AUDIENCE_LABELS) as [TargetAudience, string][]
  ).map(([key, label]) => ({ value: key, label }));

  const contentAngleOptions = [
    { value: "", label: "— None —" },
    ...(Object.entries(CONTENT_ANGLE_LABELS) as [ContentAngle, { label: string; desc: string }][]).map(
      ([key, { label }]) => ({ value: key, label })
    ),
  ];

  const toneOptions = (
    Object.entries(TONE_LABELS) as [ToneType, { label: string; desc: string }][]
  ).map(([key, { label }]) => ({ value: key, label }));

  const ctaOptions = (
    Object.entries(CTA_LABELS) as [CTAType, string][]
  ).map(([key, label]) => ({ value: key, label }));

  const intensityOptions: { value: IntensityLevel; label: string }[] = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  const brandTypeOptions = (
    Object.entries(BRAND_TYPE_LABELS) as [BrandType, string][]
  ).map(([key, label]) => ({ value: key, label }));

  const visualStyleOptions = (
    Object.entries(VISUAL_STYLE_LABELS) as [VisualStyle, { label: string; desc: string }][]
  ).map(([key, { label }]) => ({ value: key, label }));

  const imageGenTypeOptions = (
    Object.entries(IMAGE_GEN_TYPE_LABELS) as [ImageGenType, { label: string; desc: string }][]
  ).map(([key, { label }]) => ({ value: key, label }));

  const imageModelOptions = (
    Object.entries(IMAGE_MODEL_LABELS) as [GeminiImageModel, { label: string; desc: string; badge: string }][]
  ).map(([key, { label, badge }]) => ({ value: key, label: `${label} (${badge})` }));

  const fontOptions = FONTS.map((f) => ({ value: f, label: f }));

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-[#E8ECF2]">
      {/* ── Left Panel: Input Form ── */}
      <div className="w-[420px] flex-shrink-0 flex flex-col bg-white border-r border-gray-200 overflow-hidden">
        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* Persona Import */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-[#0052FF]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#0052FF]/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-[#0052FF]" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-800">Import from Persona</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Auto-fill fields from your Persona Builder</p>
                </div>
              </div>
              <button
                onClick={() => handlePersonaImport(!usePersonaImport)}
                disabled={isImporting}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${
                  usePersonaImport ? "bg-[#0052FF]" : "bg-gray-200"
                } ${isImporting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    usePersonaImport ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            {isImporting && (
              <p className="text-[11px] text-gray-500 mt-3 flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 border-2 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
                Importing from persona...
              </p>
            )}
            {importStatus && !isImporting && (
              <p className={`text-[11px] mt-3 font-medium ${
                importStatus.startsWith("Imported") ? "text-green-600" :
                importStatus.includes("found") || importStatus.includes("first") ? "text-amber-600" :
                "text-red-500"
              }`}>
                {importStatus}
              </p>
            )}
            {usePersonaImport && !isImporting && importStatus?.startsWith("Imported") && (
              <div className="mt-3 flex items-center gap-2 p-2.5 bg-white/60 rounded-xl flex-wrap">
                {formInput.brandAssets.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formInput.brandAssets.logoUrl}
                    alt="Brand logo"
                    className="w-8 h-8 object-contain rounded-lg bg-white border border-gray-200 p-1"
                  />
                )}
                <div className="flex items-center gap-1">
                  {formInput.brandAssets.colorPalette.map((c, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
                {formInput.brandAssets.fontFamily && (
                  <span className="text-[11px] font-semibold text-gray-500" style={{ fontFamily: formInput.brandAssets.fontFamily }}>
                    {formInput.brandAssets.fontFamily}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Core Message */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Core Message <span className="text-red-500 normal-case">*</span>
            </label>
            <textarea
              value={formInput.coreMessage}
              onChange={(e) => updateInput({ coreMessage: e.target.value })}
              placeholder="Describe your post idea... e.g., Launching our AI scheduler that helps agencies manage content faster"
              className="w-full h-28 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] outline-none transition-all bg-white resize-none text-sm text-gray-800"
            />
            <div className="text-right text-[10px] text-gray-400 mt-1">{formInput.coreMessage.length} chars</div>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Platforms <span className="text-red-500 normal-case">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_PLATFORMS.map((platform) => {
                const isSelected = formInput.platforms.includes(platform);
                const { label, color } = PLATFORM_DISPLAY[platform];
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => handlePlatformToggle(platform)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? "border-[#0052FF] bg-blue-50/40 shadow-[0_0_0_1px_#0052FF]"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className={`text-[12px] font-bold ${isSelected ? "text-[#0052FF]" : "text-gray-700"}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Objective */}
          <SelectField
            label="Objective"
            value={formInput.objective}
            onChange={(v) => updateInput({ objective: v as PostObjective })}
            options={objectiveOptions}
          />

          {/* Generation Focus */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Generation Focus
            </label>
            <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1">
              {(["caption", "balanced", "image"] as const).map((focus) => {
                const isActive = (formInput.generationFocus ?? "balanced") === focus;
                const icons = {
                  caption: <FileText className="w-3.5 h-3.5" />,
                  balanced: <LayoutGrid className="w-3.5 h-3.5" />,
                  image: <ImageIcon className="w-3.5 h-3.5" />,
                };
                const labels = {
                  caption: "Caption",
                  balanced: "Balanced",
                  image: "Image",
                };
                return (
                  <button
                    key={focus}
                    type="button"
                    onClick={() => updateInput({ generationFocus: focus })}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[12px] font-bold transition-all ${
                      isActive
                        ? "bg-white text-[#0052FF] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <span className={isActive ? "text-[#0052FF]" : "text-gray-400"}>{icons[focus]}</span>
                    {labels[focus]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Post Text Blocks */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Post Text
            </label>
            <p className="text-[11px] text-gray-400 mb-3">Add text blocks for your image. Each block can be labeled.</p>
            <div className="space-y-2">
              {(formInput.textBlocks ?? []).map((block) => (
                <div key={block.id} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <select
                    value={block.label}
                    onChange={(e) => updateTextBlock(block.id, { label: e.target.value })}
                    className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-[11px] font-bold text-gray-700 focus:border-[#0052FF] outline-none w-24 flex-shrink-0 appearance-none"
                  >
                    {["Title", "Subtitle", "Caption", "Body", "Tagline", "CTA Text"].map((lbl) => (
                      <option key={lbl} value={lbl}>{lbl}</option>
                    ))}
                  </select>
                  {block.label === "Caption" || block.label === "Body" ? (
                    <textarea
                      value={block.text}
                      onChange={(e) => updateTextBlock(block.id, { text: e.target.value })}
                      placeholder={`Enter ${block.label.toLowerCase()}...`}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-[13px] text-gray-800 focus:border-[#0052FF] outline-none resize-none h-16"
                    />
                  ) : (
                    <input
                      type="text"
                      value={block.text}
                      onChange={(e) => updateTextBlock(block.id, { text: e.target.value })}
                      placeholder={`Enter ${block.label.toLowerCase()}...`}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-[13px] text-gray-800 focus:border-[#0052FF] outline-none"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeTextBlock(block.id)}
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors mt-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addTextBlock}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#0052FF] hover:bg-blue-50/30 text-[12px] font-bold text-gray-400 hover:text-[#0052FF] transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Text Block
            </button>
          </div>

          {/* Image Concept */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Image Concept
            </label>
            <textarea
              value={formInput.imageConcept ?? ""}
              onChange={(e) => updateInput({ imageConcept: e.target.value || undefined })}
              placeholder="Describe the visual you have in mind..."
              className="w-full h-20 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] outline-none transition-all bg-white resize-none text-sm text-gray-800"
            />
          </div>

          {/* Reference Images */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Reference Images
            </label>
            <p className="text-[11px] text-gray-400 mb-3">Add people, products, or objects to include in the image.</p>
            <input
              ref={refImgInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleReferenceImageUpload}
            />
            {(formInput.referenceImages ?? []).length > 0 && (
              <div className="space-y-2 mb-2">
                {(formInput.referenceImages ?? []).map((img) => (
                  <div key={img.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.dataUrl}
                      alt={img.label}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={img.label}
                      onChange={(e) => updateReferenceImageLabel(img.id, e.target.value)}
                      placeholder="Label this image..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-[12px] text-gray-800 focus:border-[#0052FF] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeReferenceImage(img.id)}
                      className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => refImgInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#0052FF] hover:bg-blue-50/30 text-[12px] font-bold text-gray-400 hover:text-[#0052FF] transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Reference Image
            </button>
          </div>

          {/* Brand Assets */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Brand Assets</p>
            <div className="space-y-4">
              {/* Logo */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Brand Logo</label>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                {formInput.brandAssets.logoUrl ? (
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formInput.brandAssets.logoUrl} alt="Brand logo" className="max-w-full max-h-full object-contain p-1.5" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold text-[#0052FF] bg-blue-50 hover:bg-blue-100 transition-all"
                      >
                        <Upload className="w-3 h-3" /> Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => updateInput({ brandAssets: { ...formInput.brandAssets, logoUrl: undefined } })}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center w-full h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#0052FF] hover:bg-blue-50/30 transition-all text-gray-400 hover:text-[#0052FF] gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Upload Brand Logo</span>
                  </button>
                )}
              </div>

              {/* Color Palette */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Color Palette (Max 5)</label>
                <div className="flex flex-wrap items-center gap-2">
                  {formInput.brandAssets.colorPalette.map((color, index) => (
                    <div key={index} className="relative group">
                      <div
                        className="w-10 h-10 rounded-full border-2 border-gray-200 shadow-sm overflow-hidden relative cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: color }}
                      >
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => handleUpdateColor(index, e.target.value)}
                          className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer opacity-0"
                        />
                      </div>
                      {formInput.brandAssets.colorPalette.length > 1 && (
                        <button
                          onClick={() => handleRemoveColor(index)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {formInput.brandAssets.colorPalette.length < 5 && (
                    <button
                      onClick={handleAddColor}
                      className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-[#0052FF] hover:border-[#0052FF] hover:bg-blue-50 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Font Family */}
              <SelectField
                label="Primary Font"
                value={formInput.brandAssets.fontFamily ?? "Montserrat"}
                onChange={(v) => updateInput({ brandAssets: { ...formInput.brandAssets, fontFamily: v } })}
                options={fontOptions}
              />

              {/* Watermark */}
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Brand Watermark</label>
                <button
                  type="button"
                  onClick={() =>
                    updateInput({ brandAssets: { ...formInput.brandAssets, watermark: !formInput.brandAssets.watermark } })
                  }
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                    formInput.brandAssets.watermark ? "bg-[#0052FF]" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      formInput.brandAssets.watermark ? "translate-x-8" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* AI Image Model — shown when imageGenType is ai_background */}
          {formInput.imageGenType === "ai_background" && (
            <SelectField
              label="AI Image Model"
              value={formInput.imageModel ?? "gemini-2.5-flash-image"}
              onChange={(v) => updateInput({ imageModel: v as GeminiImageModel })}
              options={imageModelOptions}
            />
          )}

          {/* Image Size Picker */}
          {formInput.imageGenType === "ai_background" && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Image Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {POST_IMAGE_SIZES.map((size) => {
                  const isSelected = (formInput.imageSize ?? "1080x1080") === size.id;
                  // Scale the aspect ratio preview box — max 36px on the longer side
                  const MAX = 36;
                  const previewW = size.width >= size.height ? MAX : Math.round(MAX * (size.width / size.height));
                  const previewH = size.height >= size.width ? MAX : Math.round(MAX * (size.height / size.width));
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => updateInput({ imageSize: size.id })}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? "border-[#0052FF] bg-blue-50/50 shadow-[0_0_0_1px_#0052FF]"
                          : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {/* Aspect ratio preview box */}
                      <div className="flex items-center justify-center" style={{ width: MAX, height: MAX }}>
                        <div
                          className={`rounded-sm border-2 transition-colors ${
                            isSelected ? "border-[#0052FF] bg-[#0052FF]/10" : "border-gray-300 bg-gray-100"
                          }`}
                          style={{ width: previewW, height: previewH }}
                        />
                      </div>
                      {/* Label */}
                      <span className={`text-[10px] font-bold leading-tight text-center ${isSelected ? "text-[#0052FF]" : "text-gray-600"}`}>
                        {size.label}
                      </span>
                      {/* Pixel dims */}
                      <span className={`text-[9px] leading-tight ${isSelected ? "text-[#0052FF]/70" : "text-gray-400"}`}>
                        {size.width}×{size.height}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Advanced Settings Accordion */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setAdvancedOpen((o) => !o)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                <span className="text-[12px] font-bold text-gray-700">Advanced Settings</span>
              </div>
              {advancedOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {advancedOpen && (
              <div className="px-4 py-5 space-y-0 border-t border-gray-100">

                {/* Target Audience — multi-select pills */}
                <MultiSelectPills
                  label="Target Audience"
                  options={audienceOptions}
                  selected={formInput.targetAudiences}
                  onChange={(v) => updateInput({ targetAudiences: v as TargetAudience[] })}
                />
                {formInput.targetAudiences.includes("custom") && (
                  <div className="mb-4 -mt-2">
                    <input
                      type="text"
                      placeholder="Describe your specific audience..."
                      value={formInput.customAudience || ""}
                      onChange={(e) => updateInput({ customAudience: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] outline-none transition-all bg-white text-sm text-gray-800"
                    />
                  </div>
                )}

                {/* Content Angle — multi-select pills */}
                <MultiSelectPills
                  label="Content Angle"
                  options={contentAngleOptions.filter(o => o.value !== "")}
                  selected={formInput.contentAngles ?? []}
                  onChange={(v) => updateInput({ contentAngles: v.length ? v as ContentAngle[] : undefined })}
                />

                {/* Tone — multi-select pills */}
                <MultiSelectPills
                  label="Tone"
                  options={toneOptions}
                  selected={formInput.tones}
                  onChange={(v) => updateInput({ tones: v as ToneType[] })}
                />

                {/* CTA — multi-select pills */}
                <MultiSelectPills
                  label="Call to Action"
                  options={ctaOptions}
                  selected={formInput.ctas}
                  onChange={(v) => updateInput({ ctas: v as CTAType[] })}
                />

                {/* Emoji Level */}
                <SelectField
                  label="Emoji Level"
                  value={formInput.emojiLevel}
                  onChange={(v) => updateInput({ emojiLevel: v as IntensityLevel })}
                  options={intensityOptions}
                />

                {/* Hashtag Density */}
                <SelectField
                  label="Hashtag Density"
                  value={formInput.hashtagIntensity}
                  onChange={(v) => updateInput({ hashtagIntensity: v as IntensityLevel })}
                  options={intensityOptions}
                />

                {/* Brand Type */}
                <SelectField
                  label="Brand Type"
                  value={formInput.brandType}
                  onChange={(v) => updateInput({ brandType: v as BrandType })}
                  options={brandTypeOptions}
                />

                {/* Visual Style — multi-select pills */}
                <MultiSelectPills
                  label="Visual Style"
                  options={visualStyleOptions}
                  selected={formInput.visualStyles}
                  onChange={(v) => updateInput({ visualStyles: v as VisualStyle[] })}
                />

                {/* Image Gen Type */}
                <SelectField
                  label="Image Generation"
                  value={formInput.imageGenType}
                  onChange={(v) => updateInput({ imageGenType: v as ImageGenType })}
                  options={imageGenTypeOptions}
                />

              </div>
            )}
          </div>
        </div>

        {/* Generate Button — sticky at bottom */}
        <div className="px-5 py-4 border-t border-gray-100 bg-white">
          <button
            type="button"
            disabled={!canGenerate || view === "generating"}
            onClick={() => handleGenerate(formInput)}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
              canGenerate && view !== "generating"
                ? "bg-[#0052FF] text-white hover:bg-blue-700 shadow-md shadow-blue-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {view === "generating" ? "Generating..." : "Generate Post"}
          </button>
          {!canGenerate && (
            <p className="text-[10px] text-gray-400 text-center mt-2">
              {formInput.coreMessage.trim().length === 0 ? "Add a core message to continue" : "Select at least one platform"}
            </p>
          )}
        </div>
      </div>

      {/* ── Right Panel: Output ── */}
      <div className="flex-1 overflow-y-auto bg-[#E8ECF2]">
        {view === "idle" && (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-5 shadow-sm">
              <Wand2 className="w-8 h-8 text-[#0052FF]/40" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Ready when you are</h2>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Configure your post brief on the left and hit Generate to create platform-optimized content.
            </p>
          </div>
        )}

        {view === "generating" && (
          <div className="flex flex-col items-center justify-center min-h-full py-12 px-8">
            <GenerationPipeline
              currentStage={getCurrentStageIndex()}
              stages={pipelineStages}
            />
            {error && (
              <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-red-100 max-w-md w-full text-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Generation Failed</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <button
                  onClick={handleRetry}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#0052FF] text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Retry Generation
                </button>
              </div>
            )}
          </div>
        )}

        {view === "output" && postPackage && (
          <div className="p-6">
            <OutputDashboard
              postPackage={{
                ...postPackage,
                hooks: hooks || undefined,
                contentScore: contentScore || undefined,
              }}
              input={lastInput ?? formInput}
              strategy={strategy ?? undefined}
              accountId={accountId}
              onRemix={handleRemix}
              onSelectHook={(hook) => {
                console.log("Selected hook:", hook);
              }}
              onScoreRequest={handleScoreRequest}
              isRemixing={isRemixing}
              isScoring={isScoring}
            />
          </div>
        )}
      </div>
    </div>
  );
}
