"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  CircleUserRound,
  BrainCircuit,
  FileText,
  LineChart,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Faq from "../../../components/faq/faq";
import { GuestShell, Reveal } from "../../../components/guest/GuestShell";
import { AmbientBackdrop } from "./components/AmbientBackdrop";
import { HeroDashboardMotion } from "./components/HeroDashboardMotion";
import { PlatformMarquee } from "./components/PlatformMarquee";
import { MotionBentoGrid } from "./components/MotionBentoGrid";
import { InteractiveSimulator } from "./components/InteractiveSimulator";
import { PricingSection } from "./components/PricingSection";
import styles from "./homePage.module.css";

const workflowSteps = [
  {
    number: "01",
    icon: CircleUserRound,
    title: "Connect",
    body: "Connect your profile and audience touchpoints. ReachPilot indexes your domain context without scraping clutter.",
  },
  {
    number: "02",
    icon: BrainCircuit,
    title: "Understand",
    body: "Our intelligence engine decodes what themes hook your true buyers vs passive lurkers with statistical clarity.",
  },
  {
    number: "03",
    icon: FileText,
    title: "Create",
    body: "Transform raw ideas into high-retention hooks and full posts that sound authentically like you—in seconds.",
  },
  {
    number: "04",
    icon: LineChart,
    title: "Convert",
    body: "Capture high-intent comments directly into relationship pipelines to generate recurring business and deals.",
  },
];

export default function HomePage() {
  const reduceMotion = useReducedMotion();

  return (
    <GuestShell>
      <main style={{ position: "relative" }}>
        {/* Luminous Ambient Background Layer */}
        <AmbientBackdrop />

        {/* 1. Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              {/* Animated Eyebrow Badge */}
              <motion.div
                initial={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={styles.heroEyebrow}
              >
                <span className={styles.pulseDot} />
                <span>Creator Intelligence Engine 2.0</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={styles.heroTitle}
              >
                Make your next move <em>obvious.</em>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className={styles.heroSubtitle}
              >
                ReachPilot turns scattered audience signals into sharper content, deeper authority,
                and high-ticket client relationships—without the guesswork.
              </motion.p>

              {/* CTAs */}
              <motion.div
                className={styles.buttonRow}
                initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href="/signup" className={styles.primaryButton}>
                  Start Free with ReachPilot <ArrowUpRight size={16} />
                </Link>
                <Link href="/services" className={styles.secondaryButton}>
                  Explore the Platform <ArrowUpRight size={15} />
                </Link>
              </motion.div>
            </div>

            {/* 3D Perspective Tilt Dashboard Preview */}
            <HeroDashboardMotion />
          </div>
        </section>

        {/* 2. Platform Connectivity & Credibility Marquee */}
        <PlatformMarquee />

        {/* 3. Modern Motion Bento Grid (Core Capabilities) */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>
              <Sparkles size={13} />
              Connected Intelligence
            </span>
            <h2 className={styles.sectionTitle}>From scattered cues to an unstoppable system.</h2>
            <p className={styles.sectionSubtitle}>
              Stop stitching together disconnected spreadsheets and generic AI prompt tools. ReachPilot creates a
              single coherent engine for your creative output.
            </p>
          </div>

          <MotionBentoGrid />
        </section>

        {/* 4. Interactive Live Simulator ("Signal to Content") */}
        <InteractiveSimulator />

        {/* 5. Four-Step Workflow */}
        <section className={`${styles.section} ${styles.workflowSection}`}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>A Calmer Way to Grow</span>
            <h2 className={styles.sectionTitle}>Four steps from signal to momentum.</h2>
            <p className={styles.sectionSubtitle}>
              Built for operators who value precision and sustainable creative habits over burn-and-churn tactics.
            </p>
          </div>

          <div className={styles.workflowGrid}>
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.number} delay={index * 0.08} className={styles.workflowStep}>
                  <span className={styles.stepNumber}>{step.number}</span>
                  <div className={styles.stepIconWrap}>
                    <Icon size={20} />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                  {index < 3 && (
                    <span className={styles.workflowArrow}>
                      <ChevronRight size={16} />
                    </span>
                  )}
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* 6. Dark Showcase Banner */}
        <section className={styles.darkBand}>
          <div className={styles.darkBandGlow} />
          <div className={styles.darkBandInner}>
            <div>
              <span className={styles.darkBandEyebrow}>Built for high-trust operators</span>
              <h2>Your audience is already telling you what they will buy.</h2>
              <p>
                ReachPilot helps you capture those signals, shape them into magnetic hooks, and convert high-intent
                followers into client conversations.
              </p>
            </div>
            <Link href="/signup" className={styles.lightButton}>
              Claim Your Access Code <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>

        {/* 7. Interactive Pricing Section */}
        <PricingSection />

        {/* 8. FAQ Section */}
        <section className={styles.faqSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Clear Answers</span>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <p className={styles.sectionSubtitle}>
              Everything you need to know before stepping into the ReachPilot ecosystem.
            </p>
          </div>
          <Faq />
        </section>

        {/* 9. Final CTA */}
        <section className={styles.finalCta}>
          <div className={styles.finalCtaGlow} />
          <div className={styles.finalCtaInner}>
            <span className={styles.finalEyebrow}>Your Next Growth Chapter</span>
            <h2>Build a personal brand with undeniable leverage.</h2>
            <p>
              Join ambitious founders, advisors, and creators turning organic attention into measurable business equity.
            </p>
            <div className={styles.finalButtonRow}>
              <Link href="/signup" className={styles.primaryButton}>
                Create Your Account Now <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </GuestShell>
  );
}
