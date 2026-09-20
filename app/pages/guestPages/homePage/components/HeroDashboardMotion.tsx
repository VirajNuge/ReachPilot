"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  BrainCircuit,
  Sparkles,
  TrendingUp,
  LineChart,
  UsersRound,
  ChevronRight,
  Activity,
  Layers,
} from "lucide-react";
import styles from "../homePage.module.css";

type TabType = "signals" | "content" | "pipeline";

export function HeroDashboardMotion() {
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<TabType>("signals");

  // Mouse tilt tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 120, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 120, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      className={styles.dashboardContainer}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1400 }}
    >
      {/* Ambient background glow behind the card */}
      <div className={styles.dashboardGlow} />

      <motion.div
        className={styles.dashboardFrame}
        style={
          reduceMotion
            ? undefined
            : {
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }
        }
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top title bar */}
        <div className={styles.dashboardTopbar}>
          <div className={styles.topbarLeft}>
            <span className={styles.windowDots}>
              <span className={styles.dotClose} />
              <span className={styles.dotMin} />
              <span className={styles.dotMax} />
            </span>
            <span className={styles.workspaceLabel}>
              <Activity size={12} className={styles.pulseIcon} />
              ReachPilot Signal Hub
            </span>
          </div>

          {/* Interactive tab navigation inside the preview */}
          <div className={styles.previewTabs}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "signals" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("signals")}
            >
              Audience Signals
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "content" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("content")}
            >
              AI Content Engine
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "pipeline" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("pipeline")}
            >
              Pipeline
            </button>
          </div>

          <div className={styles.topbarRight}>
            <span className={styles.liveBadge}>
              <span className={styles.liveDot} />
              Live Sync
            </span>
          </div>
        </div>

        {/* Dashboard inner content */}
        <div className={styles.dashboardBody}>
          {/* Micro sidebar */}
          <aside className={styles.previewSidebar}>
            <div className={styles.miniLogo}>RP</div>
            <div className={styles.sidebarNav}>
              <span className={styles.activeSideIcon} title="Analytics">
                <BarChart3 size={15} />
              </span>
              <span title="AI Copilot">
                <BrainCircuit size={15} />
              </span>
              <span title="Ideas & Content">
                <Layers size={15} />
              </span>
              <span title="Growth Community">
                <UsersRound size={15} />
              </span>
            </div>
          </aside>

          {/* Dynamic Content Area */}
          <div className={styles.dashboardContent}>
            {/* Header greeting & score */}
            <div className={styles.contentHeader}>
              <div>
                <span className={styles.dateLabel}>Creator Intelligence Live</span>
                <h4 className={styles.greetingTitle}>Audience Momentum &amp; Positioning</h4>
              </div>
              <div className={styles.scorePill}>
                <span className={styles.scoreCircle}>88</span>
                <div>
                  <small>Profile Health</small>
                  <strong>Optimized</strong>
                </div>
              </div>
            </div>

            {/* Metric counters */}
            <div className={styles.metricsRow}>
              <div className={styles.metricItem}>
                <small>Signal Velocity</small>
                <div className={styles.metricVal}>
                  <strong>+34.2%</strong>
                  <span className={styles.badgeUp}>
                    <TrendingUp size={11} /> 7d
                  </span>
                </div>
                <div className={styles.miniProgress}>
                  <motion.div
                    className={styles.miniBar}
                    initial={{ width: 0 }}
                    animate={{ width: "76%" }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                  />
                </div>
              </div>

              <div className={styles.metricItem}>
                <small>Resonance Rate</small>
                <div className={styles.metricVal}>
                  <strong>92.4%</strong>
                  <span className={styles.badgeAccent}>High intent</span>
                </div>
                <div className={styles.miniProgress}>
                  <motion.div
                    className={styles.miniBarAccent}
                    initial={{ width: 0 }}
                    animate={{ width: "92%" }}
                    transition={{ duration: 1.2, delay: 0.4 }}
                  />
                </div>
              </div>

              <div className={styles.metricItem}>
                <small>Active Opportunities</small>
                <div className={styles.metricVal}>
                  <strong>14 Leads</strong>
                  <span className={styles.badgeGreen}>Ready to close</span>
                </div>
                <div className={styles.miniProgress}>
                  <motion.div
                    className={styles.miniBarGreen}
                    initial={{ width: 0 }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 1.2, delay: 0.5 }}
                  />
                </div>
              </div>
            </div>

            {/* Tab Switched Dynamic Content */}
            <AnimatePresence mode="wait">
              {activeTab === "signals" && (
                <motion.div
                  key="signals"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className={styles.tabContentGrid}
                >
                  {/* Dynamic Area Chart */}
                  <div className={styles.chartPanel}>
                    <div className={styles.panelHeader}>
                      <span>Audience Signal Trajectory</span>
                      <small>
                        Past 30 Days <ChevronRight size={12} />
                      </small>
                    </div>
                    <div className={styles.svgChartContainer}>
                      <svg viewBox="0 0 500 150" className={styles.motionSvg} preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
                            <stop offset="70%" stopColor="#a855f7" stopOpacity="0.08" />
                            <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#7c3aed" />
                            <stop offset="50%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#38bdf8" />
                          </linearGradient>
                        </defs>

                        {/* Shaded Area */}
                        <motion.path
                          d="M0,135 C50,120 90,125 140,85 C190,45 240,95 290,60 C340,25 390,55 440,20 C470,2 490,15 500,10 L500,150 L0,150 Z"
                          fill="url(#glowGradient)"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.9, delay: 0.4 }}
                        />

                        {/* Animated Line */}
                        <motion.path
                          d="M0,135 C50,120 90,125 140,85 C190,45 240,95 290,60 C340,25 390,55 440,20 C470,2 490,15 500,10"
                          fill="none"
                          stroke="url(#lineStroke)"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                        />

                        {/* Glowing milestone nodes */}
                        <circle cx="290" cy="60" r="5" fill="#a855f7" stroke="#fff" strokeWidth="2.5" />
                        <circle cx="440" cy="20" r="5" fill="#38bdf8" stroke="#fff" strokeWidth="2.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Signal Radar Breakdown */}
                  <div className={styles.sideInfoPanel}>
                    <div className={styles.panelHeader}>
                      <span>Audience Appetite</span>
                      <Sparkles size={13} className={styles.accentIcon} />
                    </div>
                    <div className={styles.radarRingWrapper}>
                      <div className={styles.radarRing}>
                        <span className={styles.radarScore}>94%</span>
                        <small>Resonance</small>
                      </div>
                    </div>
                    <div className={styles.tagsContainer}>
                      <span className={styles.tagPill}>Systems Thinking</span>
                      <span className={styles.tagPill}>Scale Insights</span>
                      <span className={styles.tagPill}>Actionable</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "content" && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className={styles.contentEnginePreview}
                >
                  <div className={styles.engineHeader}>
                    <div className={styles.engineBadge}>
                      <Sparkles size={12} /> Real-time Synthesis
                    </div>
                    <small>Predicted Reach: 45K - 65K</small>
                  </div>
                  <div className={styles.generatedHookCard}>
                    <span className={styles.hookLabel}>High-Conversion Hook Angle #01</span>
                    <p className={styles.hookText}>
                      &ldquo;Most creators look at vanity impressions. Here are the 3 underlying signals that actually
                      predict high-ticket consulting inquiries:&rdquo;
                    </p>
                    <div className={styles.hookMeta}>
                      <span>Retention Score: <strong>96/100</strong></span>
                      <span>Format: <strong>Story Breakdown</strong></span>
                      <span className={styles.copyPill}>Ready to publish</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "pipeline" && (
                <motion.div
                  key="pipeline"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className={styles.pipelinePreview}
                >
                  <div className={styles.pipelineList}>
                    <div className={styles.pipelineStep}>
                      <span className={styles.stepBadge}>01</span>
                      <div>
                        <strong>Inbound Signal Captured</strong>
                        <small>3 VP Leads commented on &quot;Architecture Patterns&quot;</small>
                      </div>
                      <span className={styles.statusHot}>Hot</span>
                    </div>
                    <div className={styles.pipelineStep}>
                      <span className={styles.stepBadge}>02</span>
                      <div>
                        <strong>Smart CRM Follow-Up Drafted</strong>
                        <small>Contextual DM generated based on recent engagement</small>
                      </div>
                      <span className={styles.statusQueued}>Scheduled</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Floating Micro Badge 1 (Top Right) */}
      <motion.div
        className={styles.floatingTopBadge}
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -9, 0],
                rotate: [0, 1.5, 0],
              }
        }
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className={styles.floatingIcon}>
          <LineChart size={16} />
        </div>
        <div>
          <small>Signal Surge</small>
          <strong>+38.5% Inbound Reach</strong>
        </div>
      </motion.div>

      {/* Floating Micro Badge 2 (Bottom Left) */}
      <motion.div
        className={styles.floatingBottomBadge}
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, 8, 0],
                rotate: [0, -1, 0],
              }
        }
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      >
        <div className={styles.floatingIconPurple}>
          <Sparkles size={15} />
        </div>
        <div>
          <small>AI Reasoning</small>
          <strong>&ldquo;Insight validated by 14 posts&rdquo;</strong>
        </div>
      </motion.div>
    </div>
  );
}
