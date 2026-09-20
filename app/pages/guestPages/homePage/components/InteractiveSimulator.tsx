"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Check,
  Copy,
  Clock,
  Target,
  Zap,
  Bot,
} from "lucide-react";
import styles from "../homePage.module.css";

interface PersonaConfig {
  id: string;
  name: string;
  role: string;
  topic: string;
  score: number;
  bestTime: string;
  targetICP: string;
  hooks: {
    title: string;
    text: string;
    retention: string;
  }[];
}

const personas: PersonaConfig[] = [
  {
    id: "founder",
    name: "SaaS Founder",
    role: "Bootstrapping to $1M ARR",
    topic: "Building in public without giving away competitive moats",
    score: 95,
    bestTime: "Tue & Thu, 8:15 AM EST",
    targetICP: "Founders, Investors & Early Adopters",
    hooks: [
      {
        title: "The Hard Truth Hook",
        text: "Most founders build features to avoid doing sales calls. Here is the unglamorous 3-step routine that booked our first 40 customers:",
        retention: "97% (Top 2%)",
      },
      {
        title: "The Contrarian Angle",
        text: "We stopped tracking monthly active users and focused entirely on 7-day retention. Revenue tripled in 60 days. Why vanity metrics kill SaaS:",
        retention: "94%",
      },
      {
        title: "Framework Teardown",
        text: "The exact onboarding sequence that reduced our churn by 32% (complete teardown + email copies):",
        retention: "91%",
      },
    ],
  },
  {
    id: "consultant",
    name: "Growth Consultant",
    role: "High-ticket Advisory",
    topic: "Winning $20k retainers with zero cold outreach",
    score: 92,
    bestTime: "Mon & Wed, 9:00 AM EST",
    targetICP: "CMOs, VPs of Marketing & Founders",
    hooks: [
      {
        title: "The Teardown Angle",
        text: "I audited 25 B2B landing pages this month. 23 of them made the exact same positioning mistake on the hero header. Fix this today:",
        retention: "96% (High Inbound)",
      },
      {
        title: "Proof of Concept",
        text: "How a 6-line LinkedIn post generated a $35k advisory contract without an intro call or pitch deck:",
        retention: "93%",
      },
      {
        title: "System Breakdown",
        text: "Stop selling hours. Sell an outcome-based audit. Here is the 1-page proposal structure our clients sign within 48 hours:",
        retention: "90%",
      },
    ],
  },
  {
    id: "tech_leader",
    name: "Tech Director",
    role: "Engineering & AI Systems",
    topic: "Modern microservices vs modular monoliths",
    score: 97,
    bestTime: "Wed & Fri, 10:30 AM EST",
    targetICP: "Senior Engineers, CTOs & Tech Leads",
    hooks: [
      {
        title: "The Counter-Intuitive Angle",
        text: "We migrated back from 18 microservices to a modular monolith. Infrastructure costs dropped 64% and deployment frequency doubled. An honest post-mortem:",
        retention: "98% (High Virality)",
      },
      {
        title: "Engineering Blueprint",
        text: "Before introducing Kafka or Redis, ask your team these 4 architectural questions. It will save you 6 months of technical debt:",
        retention: "95%",
      },
      {
        title: "Real-world Lesson",
        text: "The silent latency killer in modern distributed databases that 90% of benchmarks hide:",
        retention: "92%",
      },
    ],
  },
];

export function InteractiveSimulator() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaConfig>(personas[0]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const reduceMotion = useReducedMotion();

  const handleSelect = (persona: PersonaConfig) => {
    if (persona.id === selectedPersona.id) return;
    setIsSimulating(true);
    setTimeout(() => {
      setSelectedPersona(persona);
      setIsSimulating(false);
    }, 280);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={styles.simulatorWrap}>
      {/* Header */}
      <div className={styles.simulatorHeader}>
        <div className={styles.simulatorBadge}>
          <Bot size={13} />
          <span>Interactive Live Simulator</span>
        </div>
        <h2 className={styles.simulatorTitle}>Test ReachPilot on your niche right now.</h2>
        <p className={styles.simulatorSubtitle}>
          Select a creator profile below to watch how our AI engine translates raw strategic insight into high-retention hooks.
        </p>

        {/* Persona Selectors */}
        <div className={styles.personaRow}>
          {personas.map((persona) => {
            const isActive = persona.id === selectedPersona.id;
            return (
              <button
                key={persona.id}
                type="button"
                className={`${styles.personaBtn} ${isActive ? styles.personaBtnActive : ""}`}
                onClick={() => handleSelect(persona)}
              >
                <span className={styles.personaIcon}>
                  {isActive && <Sparkles size={12} />}
                </span>
                <div>
                  <strong>{persona.name}</strong>
                  <small>{persona.role}</small>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulator Display Card */}
      <div className={styles.simulatorBox}>
        <div className={styles.simulatorTopbar}>
          <div className={styles.statusGroup}>
            <span className={styles.activeDot} />
            <small>
              {isSimulating ? "Analyzing audience resonance..." : "Signal Synthesis Complete"}
            </small>
          </div>
          <div className={styles.simTiming}>
            <Clock size={12} />
            <span>Optimal Window: <strong>{selectedPersona.bestTime}</strong></span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isSimulating && (
            <motion.div
              key={selectedPersona.id}
              initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={styles.simGrid}
            >
              {/* Left Column: Context & Signal Radar */}
              <div className={styles.simLeft}>
                <div className={styles.simContextCard}>
                  <span className={styles.simMetaLabel}>Topic Analyzed</span>
                  <p className={styles.simTopic}>{selectedPersona.topic}</p>
                </div>

                <div className={styles.simScoreCard}>
                  <div className={styles.simScoreHeader}>
                    <div>
                      <small>Signal Resonance Score</small>
                      <h4>Exceptional Clarity</h4>
                    </div>
                    <div className={styles.scorePillLarge}>
                      <span>{selectedPersona.score}</span>
                      <small>/100</small>
                    </div>
                  </div>

                  <div className={styles.simMetaTags}>
                    <div className={styles.simMetaTag}>
                      <Target size={12} />
                      <span>{selectedPersona.targetICP}</span>
                    </div>
                    <div className={styles.simMetaTag}>
                      <Zap size={12} />
                      <span>Zero AI Generic Phrasing</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Generated Hooks */}
              <div className={styles.simRight}>
                <div className={styles.hooksHeader}>
                  <span>Recommended Hook Formats</span>
                  <small>Ranked by engagement potential</small>
                </div>

                <div className={styles.hooksList}>
                  {selectedPersona.hooks.map((hook, idx) => (
                    <motion.div
                      key={idx}
                      className={styles.hookItem}
                      initial={reduceMotion ? undefined : { opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08, duration: 0.35 }}
                    >
                      <div className={styles.hookItemTop}>
                        <span className={styles.hookAngleBadge}>{hook.title}</span>
                        <div className={styles.hookActions}>
                          <span className={styles.retentionRate}>
                            Est. Retention: <strong>{hook.retention}</strong>
                          </span>
                          <button
                            type="button"
                            className={styles.copyBtn}
                            onClick={() => handleCopy(hook.text, idx)}
                            title="Copy to clipboard"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check size={12} className={styles.checkIcon} />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <p className={styles.hookParagraph}>&ldquo;{hook.text}&rdquo;</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
