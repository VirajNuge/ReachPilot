"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CircleUserRound,
  Sparkles,
  BarChart3,
  UsersRound,
  ArrowUpRight,
  TrendingUp,
  Flame,
  CheckCircle2,
  Workflow,
} from "lucide-react";
import styles from "../homePage.module.css";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

function SpotlightCard({ children, className = "", delay = 0 }: SpotlightCardProps) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const reduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      className={`${styles.bentoCard} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      style={
        {
          "--mouse-x": `${coords.x}px`,
          "--mouse-y": `${coords.y}px`,
        } as React.CSSProperties
      }
    >
      {/* Dynamic spotlight border highlight */}
      <div
        className={styles.spotlightHighlight}
        style={{ opacity: isHovered ? 1 : 0 }}
      />
      <div className={styles.bentoCardInner}>{children}</div>
    </motion.div>
  );
}

export function MotionBentoGrid() {
  const [insightMode, setInsightMode] = useState<"raw" | "refined">("refined");

  return (
    <div className={styles.bentoContainer}>
      {/* Card 1: Profile Intelligence & Radar (Span 2 on desktop) */}
      <SpotlightCard className={styles.bentoWide} delay={0.05}>
        <div className={styles.bentoHeader}>
          <div className={styles.bentoBadge}>
            <CircleUserRound size={14} />
            <span>01 / Profile Intelligence</span>
          </div>
          <span className={styles.liveIndicator}>Continuous Audit</span>
        </div>

        <div className={styles.radarLayout}>
          <div className={styles.radarText}>
            <h3 className={styles.bentoTitle}>A high-definition diagnosis of your profile authority.</h3>
            <p className={styles.bentoBody}>
              ReachPilot decodes audience signals, headline friction, and positioning gaps—giving you a prioritized
              playbook of what to fix to double inbound credibility.
            </p>
            <div className={styles.radarMetricsList}>
              <div className={styles.radarMetricRow}>
                <span>Positioning Clarity</span>
                <div className={styles.radarProgressBar}>
                  <motion.div
                    className={styles.radarProgressFill}
                    initial={{ width: 0 }}
                    whileInView={{ width: "91%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
                <strong>91%</strong>
              </div>
              <div className={styles.radarMetricRow}>
                <span>Hook Retention Index</span>
                <div className={styles.radarProgressBar}>
                  <motion.div
                    className={styles.radarProgressFill}
                    initial={{ width: 0 }}
                    whileInView={{ width: "84%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
                <strong>84%</strong>
              </div>
            </div>
          </div>

          {/* Animated circular radar */}
          <div className={styles.radarGraphic}>
            <div className={styles.scannerCircle}>
              <div className={styles.radarSweep} />
              <div className={styles.radarScoreCenter}>
                <span className={styles.scoreBig}>89</span>
                <small>Health Score</small>
              </div>
            </div>
            <div className={styles.radarTag}>
              <Flame size={12} className={styles.fireIcon} /> Top 5% Category Authority
            </div>
          </div>
        </div>
      </SpotlightCard>

      {/* Card 2: AI Content Engine (Interactive toggle) */}
      <SpotlightCard delay={0.12}>
        <div className={styles.bentoHeader}>
          <div className={styles.bentoBadge}>
            <Sparkles size={14} />
            <span>02 / Creative Engine</span>
          </div>
        </div>

        <h3 className={styles.bentoTitle}>Ideas that sound like you, backed by data.</h3>
        <p className={styles.bentoBody}>
          Never start from a blank page or sound like an AI chatbot. ReachPilot turns your raw notes into compelling hooks.
        </p>

        <div className={styles.contentEngineBox}>
          <div className={styles.toggleRow}>
            <button
              type="button"
              className={`${styles.miniToggle} ${insightMode === "raw" ? styles.toggleActive : ""}`}
              onClick={() => setInsightMode("raw")}
            >
              Raw Note
            </button>
            <button
              type="button"
              className={`${styles.miniToggle} ${insightMode === "refined" ? styles.toggleActive : ""}`}
              onClick={() => setInsightMode("refined")}
            >
              Refined Hook ✨
            </button>
          </div>

          <div className={styles.noteDisplay}>
            {insightMode === "raw" ? (
              <p className={styles.rawText}>
                &ldquo;People spend too much time on design before checking if anyone wants the actual product.&rdquo;
              </p>
            ) : (
              <p className={styles.refinedText}>
                &ldquo;I watched 12 founders burn \$150k on UI before making a single dollar. Here is the 48-hour validation
                checklist we use instead:&rdquo;
              </p>
            )}
          </div>
          <div className={styles.noteFooter}>
            <span className={styles.efficiencyBadge}>+41% Retention Lift</span>
            <span className={styles.typeBadge}>Framework Post</span>
          </div>
        </div>
      </SpotlightCard>

      {/* Card 3: Dynamic Audience Resonance Equalizer */}
      <SpotlightCard delay={0.18}>
        <div className={styles.bentoHeader}>
          <div className={styles.bentoBadge}>
            <BarChart3 size={14} />
            <span>03 / Growth Feedback</span>
          </div>
          <span className={styles.liveIndicator}>Real-time Resonance</span>
        </div>

        <h3 className={styles.bentoTitle}>Listen to what your audience actually craves.</h3>
        <p className={styles.bentoBody}>
          Track topic momentum in real-time. Identify which sub-themes generate comments vs lurkers.
        </p>

        {/* Dynamic animated equalizer bars */}
        <div className={styles.equalizerContainer}>
          {[45, 80, 60, 95, 70, 88, 55, 92, 65, 78].map((h, i) => (
            <motion.div
              key={i}
              className={styles.equalizerBar}
              animate={{
                height: [`${h * 0.45}%`, `${h}%`, `${h * 0.6}%`],
              }}
              transition={{
                duration: 1.8 + (i % 4) * 0.3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            />
          ))}
        </div>

        <div className={styles.equalizerFooter}>
          <div className={styles.clusterPills}>
            <span className={styles.clusterPillActive}>Engineering Leadership ↗</span>
            <span className={styles.clusterPill}>Case Studies</span>
            <span className={styles.clusterPill}>Pricing Strategy</span>
          </div>
        </div>
      </SpotlightCard>

      {/* Card 4: Conversion & CRM Opportunity Pipeline (Span 2 on desktop) */}
      <SpotlightCard className={styles.bentoWide} delay={0.24}>
        <div className={styles.bentoHeader}>
          <div className={styles.bentoBadge}>
            <UsersRound size={14} />
            <span>04 / Conversion Momentum</span>
          </div>
          <span className={styles.liveIndicator}>Pipeline Sync</span>
        </div>

        <div className={styles.pipelineLayout}>
          <div>
            <h3 className={styles.bentoTitle}>Turn views into conversations, contracts, and clients.</h3>
            <p className={styles.bentoBody}>
              Social impressions are meaningless without a system to capture high-intent leads. ReachPilot bridges content
              publishing directly to relationship tracking.
            </p>
          </div>

          <div className={styles.pipelineFlow}>
            <div className={styles.flowNode}>
              <div className={styles.flowIcon}>
                <TrendingUp size={16} />
              </div>
              <div>
                <strong>Viral Post Signal</strong>
                <small>High ICP engagement</small>
              </div>
            </div>
            <div className={styles.flowConnector}>
              <motion.div
                className={styles.flowPulse}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <div className={styles.flowNode}>
              <div className={styles.flowIconPurple}>
                <Workflow size={16} />
              </div>
              <div>
                <strong>Smart Inbound Tag</strong>
                <small>5 Founders &amp; CTOs</small>
              </div>
            </div>
            <div className={styles.flowConnector}>
              <motion.div
                className={styles.flowPulse}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.8 }}
              />
            </div>
            <div className={styles.flowNode}>
              <div className={styles.flowIconGreen}>
                <CheckCircle2 size={16} />
              </div>
              <div>
                <strong>Client Opportunity</strong>
                <small>\$12.5k Pipeline Added</small>
              </div>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}
