"use client";

import React from "react";
import styles from "../homePage.module.css";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const platforms = [
  { name: "LinkedIn", badge: "Personal Branding" },
  { name: "X / Twitter", badge: "Fast Signals" },
  { name: "Substack", badge: "Long-form Thought" },
  { name: "Beehiiv", badge: "Newsletter Growth" },
  { name: "YouTube", badge: "Video Repurposing" },
  { name: "Threads", badge: "Micro Community" },
];

const highlights = [
  { icon: TrendingUp, text: "1.4M+ Impressions Analyzed" },
  { icon: Zap, text: "3.2x Faster Idea-to-Post Velocity" },
  { icon: ShieldCheck, text: "Zero Cookie-Cutter AI Fluff" },
  { icon: Sparkles, text: "94% Audience Signal Accuracy" },
];

export function PlatformMarquee() {
  return (
    <div className={styles.marqueeSection}>
      <div className={styles.marqueeHeader}>
        <span className={styles.marqueeEyebrow}>Ecosystem Connectivity</span>
        <p className={styles.marqueeTitle}>Engineered for the platforms where authority is built</p>
      </div>

      {/* Infinite scrolling ticker */}
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeTrack}>
          {[...platforms, ...platforms, ...platforms].map((platform, idx) => (
            <div key={`${platform.name}-${idx}`} className={styles.marqueePill}>
              <span className={styles.pillDot} />
              <strong className={styles.pillName}>{platform.name}</strong>
              <small className={styles.pillBadge}>{platform.badge}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Highlights strip */}
      <div className={styles.proofStrip}>
        {highlights.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className={styles.proofStripItem}>
              <span className={styles.proofIcon}>
                <Icon size={14} />
              </span>
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
