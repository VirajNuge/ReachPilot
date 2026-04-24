"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  FaMoneyBillWave,
  FaMagic,
  FaTimes,
  FaCheck,
  FaCopy,
  FaExclamationCircle,
} from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
import { FunnelTactic } from "../../../../../lib/types/analysis";

interface GeneratedAsset {
  type: string;
  description: string;
  template: string;
}

type AssetModalState = "closed" | "loading" | "results" | "error";

interface FunnelOptimizerProps {
  funnelTactics?: FunnelTactic[];
}

const MOCK_FUNNEL_TACTICS: FunnelTactic[] = [
  {
    id: "ft-1",
    title: "Upgrade Lead Magnet Offer",
    difficulty: "Easy",
    problem:
      "Current lead magnet is a generic checklist with low perceived value. Opt-in rate is below 3%, leaving the majority of profile traffic unconverted.",
    solution:
      "Replace the generic checklist with a highly specific, outcome-driven asset — a 'swipe file', a scored self-audit, or a 5-day email micro-course. Name it with the exact transformation the audience wants (e.g. '7-Day Content Momentum Plan'). Specific lead magnets consistently outperform generic ones by 3–5x opt-in rate.",
    impact: "+18% opt-in rate",
    status: "Pending",
  },
  {
    id: "ft-2",
    title: "Add Retargeting Pixel to Bio Link",
    difficulty: "Easy",
    problem:
      "Profile visitors who click the bio link but don't convert are lost permanently — no mechanism to re-engage them with paid ads or email sequences later.",
    solution:
      "Install a Meta/Google retargeting pixel on your landing page. Use a free redirect tool (Linktree Pro, Beacons, or a custom domain) to fire the pixel on every click. This builds a warm audience pool of 'intent-qualified' visitors you can retarget for under $2 CPM on paid channels.",
    impact: "+35% retarget pool",
    status: "Pending",
  },
  {
    id: "ft-3",
    title: "Compress the Awareness-to-CTA Gap",
    difficulty: "Medium",
    problem:
      "New followers are being served hard conversion CTAs (buy, book a call) within the first 3 posts. Cold audiences require 5–7 trust-building touches before they're ready to convert — skipping these kills conversion rates.",
    solution:
      "Map a 7-post nurture arc: Posts 1–3 deliver pure value with no CTA, Posts 4–5 introduce the problem you solve, Posts 6–7 present the offer. Use 'Save this for later' micro-CTAs in early posts to increase algorithm reach and return visits.",
    impact: "+22% conversion rate",
    status: "Pending",
  },
  {
    id: "ft-4",
    title: "Add Social Proof Layer to Landing Page",
    difficulty: "Easy",
    problem:
      "Landing page has no testimonials, case studies, or outcome metrics. Without social proof, cold traffic has no trust anchor and bounces within 8 seconds.",
    solution:
      "Add a 3-quote testimonial strip above the fold. Prioritise outcome-specific quotes ('I went from X to Y in Z days') over general praise. If no testimonials exist yet, use anonymised DM screenshots or aggregate metrics ('Used by 500+ creators'). Update quarterly as new proof accumulates.",
    impact: "+27% landing conversion",
    status: "Pending",
  },
  {
    id: "ft-5",
    title: "Fix Tripwire Price Anchoring",
    difficulty: "Medium",
    problem:
      "The first paid offer jumps from free content directly to a $197+ product, creating too large a commitment gap. Most cold audiences need a low-risk $7–$27 entry point to establish the buyer relationship.",
    solution:
      "Introduce a tripwire product priced between $9–$27 — a focused mini-workshop, a template pack, or an audio training. Position it as 'the next logical step' after the lead magnet. A tripwire buyer is statistically 7x more likely to purchase your core offer than a free subscriber.",
    impact: "+41% buyer conversion",
    status: "Pending",
  },
  {
    id: "ft-6",
    title: "Implement Post-Purchase Upsell Flow",
    difficulty: "Medium",
    problem:
      "After purchase, buyers are taken to a generic 'thank you' page with no next step. This wastes the highest-intent moment in the funnel — immediately post-purchase, buyers are in an active buying mindset.",
    solution:
      "Add a one-click order bump or upsell on the thank-you page. Offer a closely related product at 30–50% discount ('Since you just grabbed X, here's Y for only $27'). Post-purchase upsells convert at 15–25% with zero additional ad spend — highest ROI action in the funnel.",
    impact: "+19% revenue per buyer",
    status: "Pending",
  },
  {
    id: "ft-7",
    title: "Activate Abandoned Cart / Waitlist Sequence",
    difficulty: "Hard",
    problem:
      "Visitors who add to cart or join a waitlist but don't complete purchase receive no follow-up. Typically 60–80% of cart abandoners can be recovered with a well-timed email sequence.",
    solution:
      "Build a 3-email abandoned cart sequence: Email 1 (1 hour after abandon): 'Did something go wrong?' + direct link. Email 2 (24 hours): Address top objection + testimonial. Email 3 (72 hours): Final urgency + limited bonus. Use ConvertKit or MailerLite conditional automation to trigger on non-purchase tag.",
    impact: "+31% cart recovery",
    status: "Pending",
  },
  {
    id: "ft-8",
    title: "Create a Content-to-Funnel Bridge Post",
    difficulty: "Easy",
    problem:
      "Organic content and the sales funnel operate in silos — viral posts drive engagement but zero funnel entry because there's no bridge mechanism connecting the two.",
    solution:
      "Create a recurring 'bridge post' format: a value-dense carousel or thread that ends with a single, friction-free CTA ('DM me the word [KEYWORD] and I'll send you the full template free'). Bridge posts convert at 2–5% of impressions into list subscribers — outperforming bio-link CTAs by 4x because the action is in-feed.",
    impact: "+44% list growth/post",
    status: "Pending",
  },
  {
    id: "ft-9",
    title: "Segment Email List by Purchase Intent",
    difficulty: "Hard",
    problem:
      "All subscribers receive the same email sequence regardless of whether they clicked a 'buy' link, downloaded a free resource, or signed up from a giveaway. Blasting the wrong offer to the wrong segment kills deliverability and burns trust.",
    solution:
      "Tag subscribers based on acquisition source and click behaviour. Create 3 segments: Cold (free opt-in, no link clicks), Warm (clicked sales page but didn't buy), Hot (bought at least one product). Write separate email tracks for each. Segmented campaigns produce 760% higher revenue than one-size-fits-all broadcasts.",
    impact: "+52% email revenue",
    status: "Pending",
  },
];

// --- Assets Portal Modal ---

interface AssetsModalProps {
  tactic: FunnelTactic;
  modalState: AssetModalState;
  assets: GeneratedAsset[];
  onClose: () => void;
}

const AssetsModal: React.FC<AssetsModalProps> = ({
  tactic,
  modalState,
  assets,
  onClose,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="assets-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.18 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col relative max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100 shrink-0">
            <div>
              <h3 className="text-lg font-black text-[#000100] flex items-center gap-2">
                <BsStars className="text-[#074ed5]" /> Generated Assets
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5 leading-relaxed">
                {tactic.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-[#000100] transition-colors ml-4 shrink-0"
            >
              <FaTimes />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {/* LOADING */}
            {modalState === "loading" && (
              <div className="flex flex-col items-center justify-center py-14 gap-4">
                <div className="p-3 bg-[#074ed5]/10 text-[#074ed5] rounded-2xl animate-pulse">
                  <FaMagic size={24} />
                </div>
                <h4 className="text-base font-black text-[#000100]">
                  Generating assets...
                </h4>
                <p className="text-xs text-slate-400 font-medium">
                  Building ready-to-use templates for this tactic
                </p>
              </div>
            )}

            {/* ERROR */}
            {modalState === "error" && (
              <div className="flex flex-col items-center justify-center py-14 gap-4">
                <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
                  <FaExclamationCircle size={24} />
                </div>
                <h4 className="text-base font-black text-[#000100]">
                  Failed to generate assets
                </h4>
                <p className="text-xs text-slate-400 font-medium">
                  Please try again
                </p>
              </div>
            )}

            {/* RESULTS */}
            {modalState === "results" &&
              assets.map((asset, i) => (
                <div
                  key={i}
                  className="bg-[#f4f8fb] rounded-2xl border border-slate-100 p-4 flex flex-col gap-3"
                >
                  {/* Asset type + description */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black px-2.5 py-1 bg-[#074ed5]/10 text-[#074ed5] rounded-full uppercase tracking-wide">
                        {asset.type}
                      </span>
                      <p className="text-[11px] text-slate-500 font-medium mt-2 leading-relaxed">
                        {asset.description}
                      </p>
                    </div>
                  </div>

                  {/* Template block */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-[#000100] font-medium leading-relaxed whitespace-pre-wrap">
                      {asset.template}
                    </p>
                  </div>

                  {/* Copy button */}
                  <button
                    onClick={() => handleCopy(asset.template, i)}
                    className="self-end flex items-center gap-1.5 text-[11px] font-bold border border-[#074ed5]/30 text-[#074ed5] rounded-xl px-3 py-1.5 hover:bg-[#074ed5] hover:text-white transition-all"
                  >
                    {copiedIndex === i ? (
                      <>
                        <FaCheck size={9} /> Copied
                      </>
                    ) : (
                      <>
                        <FaCopy size={9} /> Copy Template
                      </>
                    )}
                  </button>
                </div>
              ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

// --- Main Component ---

export default function FunnelOptimizer({
  funnelTactics,
}: FunnelOptimizerProps) {
  const [activeTactic, setActiveTactic] = useState<string | null>(null);
  const [assetModalTacticId, setAssetModalTacticId] = useState<string | null>(
    null
  );
  const [assetModalState, setAssetModalState] =
    useState<AssetModalState>("closed");
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);

  const tactics =
    funnelTactics && funnelTactics.length > 0
      ? funnelTactics
      : MOCK_FUNNEL_TACTICS;

  const activeTacticData = tactics.find((t) => t.id === assetModalTacticId);

  const handleGenerateAssets = async (
    e: React.MouseEvent,
    tactic: FunnelTactic
  ) => {
    e.stopPropagation();
    setAssetModalTacticId(tactic.id);
    setAssetModalState("loading");
    setGeneratedAssets([]);

    try {
      const res = await fetch("/api/analyze-extension/generate-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tacticTitle: tactic.title,
          tacticProblem: tactic.problem,
          tacticSolution: tactic.solution,
          tacticImpact: tactic.impact,
        }),
      });

      const json = (await res.json()) as { assets?: GeneratedAsset[] };

      if (!res.ok || !Array.isArray(json.assets) || json.assets.length === 0) {
        throw new Error("bad response");
      }

      setGeneratedAssets(json.assets);
      setAssetModalState("results");
    } catch {
      setAssetModalState("error");
    }
  };

  const closeAssetModal = () => {
    setAssetModalState("closed");
    setAssetModalTacticId(null);
    setGeneratedAssets([]);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-start">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Growth Command
          </h4>
          <div className="relative group cursor-help inline-block">
            <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
              Funnel Optimizer
            </h2>
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#000100] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              Identifies revenue leaks in your funnel. Suggests tactical fixes
              like &ldquo;Upgrading the Lead Magnet&rdquo; or &ldquo;Adding a
              Retargeting Pixel&rdquo;.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-[#000100] transform rotate-45"></div>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Revenue &amp; Conversion Tactics
          </p>
        </div>
        <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0">
          <FaMoneyBillWave size={16} />
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
        {tactics.map((tactic) => (
          <motion.div
            key={tactic.id}
            layout
            onClick={() =>
              setActiveTactic(activeTactic === tactic.id ? null : tactic.id)
            }
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${activeTactic === tactic.id ? "bg-[#074ed5]/5 border-[#074ed5]/20 shadow-sm" : "bg-white border-slate-100 hover:border-[#074ed5]/20"}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {tactic.status === "Pending" && (
                  <div className="w-2 h-2 rounded-full bg-[#caee55] animate-pulse" />
                )}
                <h4 className="font-bold text-[#000100] text-sm">
                  {tactic.title}
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f4f8fb] rounded border border-slate-200 text-slate-500 uppercase shrink-0 ml-2">
                {tactic.difficulty}
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3 leading-snug">
              <span className="font-bold text-[#074ed5]">Problem:</span>{" "}
              {tactic.problem}
            </p>

            <AnimatePresence>
              {activeTactic === tactic.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-[#f4f8fb] rounded-xl border border-slate-100 mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#074ed5] mb-1">
                      <FaMagic /> AI Recommendation
                    </div>
                    <p className="text-sm text-[#000100] font-medium leading-relaxed">
                      {tactic.solution}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs font-bold text-[#caee55] bg-[#caee55]/20 px-2 py-1 rounded-lg border border-[#caee55]/30">
                      Exp. Impact: {tactic.impact}
                    </div>
                    <button
                      onClick={(e) => handleGenerateAssets(e, tactic)}
                      className="px-3 py-1.5 font-bold rounded-xl flex items-center gap-2 transition-colors bg-[#000100] hover:bg-black text-white"
                    >
                      <FaMagic className="text-[#caee55]" /> Generate Assets
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {activeTactic !== tactic.id && (
              <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Solution
                </span>
                <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                  {tactic.solution.substring(0, 30)}...
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Assets Portal Modal */}
      {assetModalState !== "closed" && activeTacticData && (
        <AssetsModal
          tactic={activeTacticData}
          modalState={assetModalState}
          assets={generatedAssets}
          onClose={closeAssetModal}
        />
      )}
    </div>
  );
}
