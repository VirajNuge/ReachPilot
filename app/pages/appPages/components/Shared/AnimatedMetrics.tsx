"use client";

import React, { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from "framer-motion";

/**
 * AnimatedCounter - Animates a number from 0 to target value
 */
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1.5,
  className = "",
  suffix = "",
  prefix = "",
  decimals = 0,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    decimals > 0 ? latest.toFixed(decimals) : String(Math.round(latest)),
  );

  useEffect(() => {
    if (isInView) {
      animate(count, value, {
        duration,
        ease: "easeOut",
      });
    }
  }, [isInView, value, count, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
};

/**
 * AnimatedProgress - Animated progress bar
 */
interface AnimatedProgressProps {
  value: number;
  max?: number;
  height?: number;
  className?: string;
  barColor?: string;
  bgColor?: string;
  showValue?: boolean;
  delay?: number;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  max = 100,
  height = 8,
  className = "",
  barColor = "#5D5FEF",
  bgColor = "#E5E7EB",
  showValue = false,
  delay = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const percentage = (value / max) * 100;

  return (
    <div ref={ref} className={`animated-progress ${className}`}>
      <div
        className="progress-bg"
        style={{
          height: `${height}px`,
          backgroundColor: bgColor,
          borderRadius: `${height / 2}px`,
          overflow: "hidden",
        }}
      >
        <motion.div
          className="progress-bar"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${percentage}%` } : { width: 0 }}
          transition={{
            duration: 0.8,
            delay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          style={{
            height: "100%",
            backgroundColor: barColor,
            borderRadius: `${height / 2}px`,
          }}
        />
      </div>
      {showValue && (
        <motion.span
          className="progress-value"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: delay + 0.3 }}
          style={{
            fontSize: "12px",
            color: "#666",
            marginLeft: "8px",
          }}
        >
          {value}/{max}
        </motion.span>
      )}
    </div>
  );
};

/**
 * AnimatedScoreCircle - Circular progress with animated fill
 */
interface AnimatedScoreCircleProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
  label?: string;
}

export const AnimatedScoreCircle: React.FC<AnimatedScoreCircleProps> = ({
  score,
  maxScore = 100,
  size = 80,
  strokeWidth = 6,
  className = "",
  color = "#5D5FEF",
  label,
}) => {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true });

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = (score / maxScore) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={`animated-score-circle ${className}`}
      style={{ textAlign: "center" }}
    >
      <svg
        ref={ref}
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        {/* Animated progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={
            isInView
              ? { strokeDashoffset }
              : { strokeDashoffset: circumference }
          }
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div
        style={{
          position: "relative",
          marginTop: -size / 2 - 10,
          height: size / 2 + 10,
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            fontSize: size / 3.5,
            fontWeight: 600,
            color: "#1a1a1a",
          }}
        >
          <AnimatedCounter value={score} />
        </motion.div>
        {label && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.6 }}
            style={{
              fontSize: 11,
              color: "#888",
              marginTop: 2,
            }}
          >
            {label}
          </motion.div>
        )}
      </div>
    </div>
  );
};

/**
 * AnimatedPercentage - Big animated percentage display
 */
interface AnimatedPercentageProps {
  value: number;
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
  trend?: "up" | "down" | "neutral";
}

export const AnimatedPercentage: React.FC<AnimatedPercentageProps> = ({
  value,
  size = "md",
  color,
  className = "",
  trend,
}) => {
  const sizeMap = {
    sm: { fontSize: 24, trendSize: 12 },
    md: { fontSize: 36, trendSize: 14 },
    lg: { fontSize: 48, trendSize: 16 },
  };

  const trendColors = {
    up: "#22C55E",
    down: "#EF4444",
    neutral: "#888",
  };

  const { fontSize, trendSize } = sizeMap[size];
  const displayColor = color || (trend ? trendColors[trend] : "#1a1a1a");

  return (
    <div
      className={`animated-percentage ${className}`}
      style={{ display: "inline-flex", alignItems: "baseline" }}
    >
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          fontSize,
          fontWeight: 700,
          color: displayColor,
        }}
      >
        <AnimatedCounter value={value} suffix="%" decimals={1} />
      </motion.span>
      {trend && (
        <motion.span
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            marginLeft: 4,
            fontSize: trendSize,
            color: trendColors[trend],
          }}
        >
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
        </motion.span>
      )}
    </div>
  );
};

export default AnimatedCounter;
