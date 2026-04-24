"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  FaUserFriends,
  FaRocket,
  FaTimes,
  FaCheck,
  FaCopy,
  FaClipboardList,
} from "react-icons/fa";
import { TbTargetArrow } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
import { CrowdTactic } from "../../../../../lib/types/analysis";

interface CrowdHijackerProps {
  crowdTactics?: CrowdTactic[];
}

const MOCK_CROWD_TACTICS: CrowdTactic[] = [
  {
    id: "ct-1",
    title: "Answer Unanswered Competitor Comments",
    audienceState: "Frustrated",
    action:
      "Identify the competitor's 10 most-liked unanswered comments from the last 30 days. Reply to each with a direct, insightful answer — no self-promotion, just genuine value. Sign off with your name and niche. This positions you as the expert who shows up when others don't. Each reply becomes a permanent beacon for anyone who later reads that thread.",
    targetParams: "Top 10 unanswered comments · 30-day window · 1 reply/day",
    status: "Ready",
  },
  {
    id: "ct-2",
    title: "Hijack 'Skeptic' Comment Threads",
    audienceState: "Skeptical",
    action:
      "Filter competitor comments for phrases like 'does this actually work', 'not sure I believe', 'sounds too good'. These are Skeptics who are open to being convinced — they just haven't been served the right proof yet. Reply with a concise case study or data point that addresses their exact doubt. Don't pitch anything. Let the quality of your insight do the positioning work.",
    targetParams: "Skeptic keyword filter · 5 threads/week · Data-led replies",
    status: "Ready",
  },
  {
    id: "ct-3",
    title: "Convert 'Seekers' with a Resource Drop",
    audienceState: "Engaged",
    action:
      "Find comments where users explicitly ask for more resources — 'where can I learn more about this?', 'do you have a tutorial on X?'. Reply with a direct link to your most relevant free resource (a post, thread, or lead magnet). These are Seekers in active discovery mode — the conversion pathway from comment reply to opt-in is shortest with this segment. Expected follow-through rate: 12–18%.",
    targetParams:
      "Resource-request keyword filter · Link-drop replies · Track profile visits",
    status: "Ready",
  },
  {
    id: "ct-4",
    title: "Lead the Comment Section Debate",
    audienceState: "Skeptical",
    action:
      "Identify competitor posts with polarising takes or controversial claims. Join the top-comment debate with a nuanced, well-reasoned counterpoint or supporting argument. High-engagement debate threads surface in followers' feeds, exposing your profile to audiences you've never reached. Aim to be the comment that changes the conversation — not the loudest, but the most insightful.",
    targetParams: "Debate threads · 50+ comment posts · Nuanced POV replies",
    status: "Ready",
  },
  {
    id: "ct-5",
    title: "DM Prompt Trigger from High-Value Reply",
    audienceState: "Engaged",
    action:
      "After dropping a high-value comment on a competitor's post, follow up with any user who likes or replies to your comment within 24 hours. Send a personalised DM: 'Glad that resonated — I've got a deeper breakdown of this if you're interested. No pitch, just the full framework.' This warm DM converts at 20–35% into list subscribers because the context of your comment pre-qualifies intent.",
    targetParams:
      "Post-engagement DM · 24h window · Personalised opener · No pitch",
    status: "Ready",
  },
  {
    id: "ct-6",
    title: "Mirror Competitor's Top Post Format",
    audienceState: "Engaged",
    action:
      "Identify the competitor's 3 highest-performing posts by engagement rate. Analyse the format, hook structure, and topic angle. Create your own version — same format, different perspective, deeper insight, and your personal story layered in. Tag it to the same trending topic or hashtag cluster. You're borrowing a proven format and redirecting audience attention with a superior execution.",
    targetParams:
      "Top 3 competitor posts · Format mirror · Distinct POV · Same topic cluster",
    status: "Ready",
  },
  {
    id: "ct-7",
    title: "Engage Competitor's New Followers",
    audienceState: "Skeptical",
    action:
      "Monitor the competitor's recent followers list (via public profile activity or third-party tools). Identify accounts that followed in the last 7 days — these are 'fresh intent' users who just discovered the niche. Follow them, then engage meaningfully with their last post. Don't pitch. Build the relationship over 3–5 touchpoints before any outreach. Conversion timeline: 2–4 weeks to follow-back and engage.",
    targetParams:
      "New follower list · 7-day recency · 3-touch engagement sequence",
    status: "Ready",
  },
  {
    id: "ct-8",
    title: "Build Authority in Niche Comment Pods",
    audienceState: "Frustrated",
    action:
      "Locate 3–5 niche-specific group threads, Discord servers, or Slack communities where your competitor's audience congregates outside the main platform. Join them and contribute 2–3 high-value messages per week for 30 days before any self-promotion. Establish your name as the go-to expert. After 30 days of value, a single resource post will convert at a significantly higher rate than cold outreach.",
    targetParams:
      "3-5 niche communities · 30-day value phase · 2-3 posts/week",
    status: "Ready",
  },
  {
    id: "ct-9",
    title: "Redirect 'Pain Point' Search Traffic",
    audienceState: "Frustrated",
    action:
      "Identify the top 5 pain-point phrases appearing across competitor comments (e.g., 'I can never stay consistent', 'algorithm keeps tanking my reach'). Create posts or threads targeting these exact phrases as headlines. Tag them to match the competitor's most-used hashtags. Users who search or scroll through those tags will encounter your content as a direct answer to their frustration — without ever needing to visit the competitor's profile first.",
    targetParams:
      "Top 5 pain phrases · Targeted post creation · Competitor hashtag overlap",
    status: "Ready",
  },
];

// --- Execute Now Portal Modal ---

interface ExecuteModalProps {
  tactic: CrowdTactic;
  onClose: () => void;
}

const ExecuteModal: React.FC<ExecuteModalProps> = ({ tactic, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `TACTIC: ${tactic.title}\n\nAUDIENCE STATE: ${tactic.audienceState}\n\nEXECUTION PLAN:\n${tactic.action}\n\nTARGET PARAMETERS:\n${tactic.targetParams}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stateColor =
    tactic.audienceState === "Frustrated"
      ? { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" }
      : tactic.audienceState === "Skeptical"
      ? { bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-200" }
      : { bg: "bg-[#caee55]/20", text: "text-[#000100]", border: "border-[#caee55]/30" };

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="execute-overlay"
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
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col relative max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#000100] text-white rounded-2xl shrink-0">
                <FaRocket size={16} />
              </div>
              <div>
                <h3 className="text-base font-black text-[#000100] leading-tight">
                  Execution Plan
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {tactic.title}
                </p>
              </div>
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
            {/* Audience State Badge */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Audience State:
              </span>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide border ${stateColor.bg} ${stateColor.text} ${stateColor.border}`}
              >
                {tactic.audienceState}
              </span>
            </div>

            {/* Full Action Plan */}
            <div className="bg-[#f4f8fb] rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <FaClipboardList className="text-[#074ed5] shrink-0" size={11} />
                <h5 className="text-[10px] font-bold text-[#074ed5] uppercase tracking-widest">
                  Full Execution Plan
                </h5>
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {tactic.action}
              </p>
            </div>

            {/* Target Parameters */}
            <div className="bg-[#000100]/5 rounded-2xl border border-[#000100]/10 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <TbTargetArrow className="text-[#000100] shrink-0" size={13} />
                <h5 className="text-[10px] font-bold text-[#000100] uppercase tracking-widest">
                  Target Parameters
                </h5>
              </div>
              <div className="flex flex-wrap gap-2">
                {tactic.targetParams.split(" · ").map((param, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-bold px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-[#000100]"
                  >
                    {param}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-4 border-t border-slate-100 shrink-0 flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all border border-slate-200 hover:border-[#000100] text-[#000100]"
            >
              {copied ? (
                <>
                  <FaCheck size={12} /> Copied!
                </>
              ) : (
                <>
                  <FaCopy size={12} /> Copy Plan
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-[#000100] hover:bg-black text-white rounded-2xl font-bold text-sm transition-all active:scale-[0.98]"
            >
              Got It
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

// --- Main Component ---

export default function CrowdHijacker({ crowdTactics }: CrowdHijackerProps) {
  const [activeTactic, setActiveTactic] = useState<string | null>(null);
  const [executeModalTacticId, setExecuteModalTacticId] = useState<
    string | null
  >(null);

  const tactics =
    crowdTactics && crowdTactics.length > 0
      ? crowdTactics
      : MOCK_CROWD_TACTICS;

  const executeModalTactic = tactics.find(
    (t) => t.id === executeModalTacticId
  );

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
              Crowd Hijacker
            </h2>
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#000100] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              Strategies to engage the competitor&apos;s audience directly.
              Turns their &ldquo;Skeptics&rdquo; into your
              &ldquo;Believers&rdquo; through targeted interaction.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-[#000100] transform rotate-45"></div>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Community Engagement
          </p>
        </div>
        <div className="p-2.5 bg-[#000100] text-white rounded-2xl shadow-sm shrink-0">
          <FaUserFriends size={16} />
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
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${activeTactic === tactic.id ? "bg-[#000100]/5 border-[#000100]/15 shadow-sm" : "bg-white border-slate-100 hover:border-slate-300"}`}
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-[#000100] text-sm">
                {tactic.title}
              </h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ml-2 ${
                  tactic.audienceState === "Frustrated"
                    ? "bg-orange-50 text-orange-600 border-orange-200"
                    : tactic.audienceState === "Skeptical"
                      ? "bg-slate-100 text-slate-500 border-slate-200"
                      : "bg-[#caee55]/20 text-[#000100] border-[#caee55]/30"
                }`}
              >
                {tactic.audienceState}
              </span>
            </div>

            <AnimatePresence>
              {activeTactic === tactic.id ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">
                    {tactic.action}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-[#f4f8fb] px-2 py-1 rounded-lg border border-slate-100">
                      {tactic.targetParams}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExecuteModalTacticId(tactic.id);
                      }}
                      className="px-4 py-2 font-bold rounded-xl flex items-center gap-2 transition-all bg-[#000100] hover:bg-black text-white"
                    >
                      <FaRocket className="text-[#caee55]" /> Execute Now
                    </button>
                  </div>
                </motion.div>
              ) : (
                <p className="text-xs text-slate-400 leading-snug line-clamp-2">
                  {tactic.action}
                </p>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Execute Now Portal Modal */}
      {executeModalTacticId && executeModalTactic && (
        <ExecuteModal
          tactic={executeModalTactic}
          onClose={() => setExecuteModalTacticId(null)}
        />
      )}
    </div>
  );
}
