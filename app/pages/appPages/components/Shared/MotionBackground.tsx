"use client";

import React from "react";
import { motion } from "framer-motion";

interface MotionBackgroundProps {
  variant?: "subtle" | "gradient" | "dots";
  className?: string;
  children?: React.ReactNode;
}

/**
 * MotionBackground - Subtle animated background effects
 * Minimalistic design with optional animated elements
 */
export const MotionBackground: React.FC<MotionBackgroundProps> = ({
  variant = "subtle",
  className = "",
  children,
}) => {
  if (variant === "subtle") {
    return (
      <div className={`motion-bg-subtle ${className}`}>
        {/* Subtle gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full opacity-[0.03]"
            style={{
              background:
                "radial-gradient(circle, #5D5FEF 0%, transparent 70%)",
              top: "-10%",
              right: "-10%",
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.03, 0.05, 0.03],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full opacity-[0.02]"
            style={{
              background:
                "radial-gradient(circle, #8B5CF6 0%, transparent 70%)",
              bottom: "10%",
              left: "-5%",
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.02, 0.04, 0.02],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>
        {children}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={`motion-bg-dots ${className}`}>
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #5D5FEF 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        {children}
      </div>
    );
  }

  // Gradient variant
  return (
    <div className={`motion-bg-gradient ${className}`}>
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, #f8f9ff 0%, #fff 50%, #f5f3ff 100%)",
        }}
        animate={{
          background: [
            "linear-gradient(135deg, #f8f9ff 0%, #fff 50%, #f5f3ff 100%)",
            "linear-gradient(135deg, #f5f3ff 0%, #fff 50%, #f8f9ff 100%)",
            "linear-gradient(135deg, #f8f9ff 0%, #fff 50%, #f5f3ff 100%)",
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

/**
 * FloatingElements - Subtle floating shapes for visual interest
 */
export const FloatingElements: React.FC<{ count?: number }> = ({
  count = 5,
}) => {
  const elements = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 8 + Math.random() * 12,
    left: `${10 + Math.random() * 80}%`,
    delay: Math.random() * 5,
    duration: 15 + Math.random() * 10,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((el) => (
        <motion.div
          key={el.id}
          className="absolute rounded-full bg-[#5D5FEF]"
          style={{
            width: el.size,
            height: el.size,
            left: el.left,
            opacity: 0.03,
          }}
          initial={{ y: "100vh" }}
          animate={{ y: "-100px" }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            delay: el.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default MotionBackground;
