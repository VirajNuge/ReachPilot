"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

export function AmbientBackdrop() {
  const reduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for cursor spotlight
  const springX = useSpring(mouseX, { stiffness: 45, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 45, damping: 25 });

  useEffect(() => {
    if (reduceMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, reduceMotion]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {/* Interactive cursor light reflex */}
      {!reduceMotion && (
        <motion.div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            x: springX,
            y: springY,
            translateX: "-50%",
            translateY: "-50%",
            width: "700px",
            height: "700px",
            background:
              "radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, rgba(168, 85, 247, 0.03) 40%, transparent 70%)",
            filter: "blur(40px)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Floating primary ambient orb */}
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, 40, -25, 0],
                y: [0, -35, 20, 0],
                scale: [1, 1.08, 0.95, 1],
              }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "4%",
          right: "-5%",
          width: "720px",
          height: "720px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 40% 40%, rgba(192, 132, 252, 0.28), rgba(147, 51, 234, 0.12) 48%, transparent 72%)",
          filter: "blur(60px)",
        }}
      />

      {/* Secondary accent orb on the left */}
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, -30, 20, 0],
                y: [0, 30, -25, 0],
                scale: [1, 0.96, 1.06, 1],
              }
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{
          position: "absolute",
          top: "16%",
          left: "-10%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.16), rgba(99, 102, 241, 0.08) 45%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      {/* Subtle architectural dot-grid overlay with smooth vignette mask */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(124, 58, 237, 0.12) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage:
            "radial-gradient(ellipse 90% 70% at 50% 30%, black 35%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 70% at 50% 30%, black 35%, transparent 85%)",
          opacity: 0.7,
        }}
      />
    </div>
  );
}
