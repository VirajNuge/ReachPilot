"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ArrowUpRight, Sparkles } from "lucide-react";
import styles from "../homePage.module.css";

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);
  const reduceMotion = useReducedMotion();

  const plans = [
    {
      name: "Starter",
      monthlyPrice: "$0",
      annualPrice: "$0",
      period: "forever",
      description: "A focused starting point for exploring your social media growth system.",
      features: [
        "10 AI credits / month",
        "Profile health analyzer",
        "Basic hook generation",
        "Community inspiration vault",
        "Standard latency",
      ],
      featured: false,
      ctaText: "Start for free",
      ctaHref: "/signup",
    },
    {
      name: "Pro",
      monthlyPrice: "$19.99",
      annualPrice: "$15.99",
      period: "per month",
      description: "The complete intelligence engine for high-output personal brand creators.",
      features: [
        "250 AI credits / month",
        "Unlimited profile & post audits",
        "Custom creator voice training",
        "High-retention hook synthesizer",
        "Audience resonance analytics",
        "CRM & lead follow-up pipeline",
        "Priority AI generation speed",
      ],
      featured: true,
      badge: "Most Popular",
      ctaText: "Unlock Pro Access",
      ctaHref: "/signup",
    },
    {
      name: "Agency",
      monthlyPrice: "$49.99",
      annualPrice: "$39.99",
      period: "per month",
      description: "A collaborative multi-client workspace for agencies, studios, and teams.",
      features: [
        "1,000 AI credits / month",
        "Multi-client workspace management",
        "Custom branding & export reports",
        "Team permissions & review workflows",
        "Dedicated account strategist",
        "Priority 24/7 support & SLA",
      ],
      featured: false,
      ctaText: "Scale with Agency",
      ctaHref: "/signup",
    },
  ];

  return (
    <div className={styles.pricingSectionContainer}>
      <div className={styles.pricingHeader}>
        <div className={styles.pricingEyebrow}>
          <Sparkles size={13} />
          <span>Flexible Plans Built for Growth</span>
        </div>
        <h2 className={styles.pricingTitle}>Invest in clarity, not more tools.</h2>
        <p className={styles.pricingSubtitle}>
          Choose the plan that matches your creative volume. Upgrade, downgrade, or cancel anytime.
        </p>

        {/* Annual / Monthly Toggle Switch */}
        <div className={styles.billingToggleWrapper}>
          <span className={!isAnnual ? styles.toggleActiveLabel : styles.toggleInactiveLabel}>
            Monthly
          </span>
          <button
            type="button"
            className={styles.toggleSwitch}
            onClick={() => setIsAnnual(!isAnnual)}
            aria-label="Toggle annual or monthly pricing"
          >
            <motion.div
              className={styles.toggleSlider}
              animate={{ x: isAnnual ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={isAnnual ? styles.toggleActiveLabel : styles.toggleInactiveLabel}>
            Annual Billing
          </span>
          <span className={styles.saveBadge}>Save 20%</span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className={styles.planGrid}>
        {plans.map((plan, index) => {
          const displayPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;

          return (
            <motion.div
              key={plan.name}
              className={`${styles.planCard} ${plan.featured ? styles.featuredPlan : ""}`}
              initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={reduceMotion ? undefined : { y: -5 }}
            >
              {plan.featured && (
                <div className={styles.planBadgeHighlight}>
                  <Sparkles size={11} />
                  <span>{plan.badge}</span>
                </div>
              )}

              <span className={styles.planName}>{plan.name}</span>

              <div className={styles.planPriceBlock}>
                <motion.span
                  key={displayPrice}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={styles.planPriceValue}
                >
                  {displayPrice}
                </motion.span>
                <small className={styles.planPricePeriod}>
                  /{plan.period}
                  {isAnnual && plan.monthlyPrice !== "$0" && <em> (billed annually)</em>}
                </small>
              </div>

              <p className={styles.planDescription}>{plan.description}</p>

              <div className={styles.planDivider} />

              <ul className={styles.planFeatureList}>
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className={styles.planFeatureItem}>
                    <Check size={14} className={styles.featureCheckIcon} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={plan.featured ? styles.primaryPricingButton : styles.secondaryPricingButton}
              >
                {plan.ctaText} <ArrowUpRight size={14} />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
