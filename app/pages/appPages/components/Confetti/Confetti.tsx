"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ConfettiProps {
  isActive: boolean;
}

const Confetti: React.FC<ConfettiProps> = ({ isActive }) => {
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    if (isActive) {
      setParticles(Array.from({ length: 50 }, (_, i) => i));
    } else {
      setParticles([]);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((i) => (
        <motion.div
          key={i}
          initial={{
            y: "100vh",
            x: Math.random() * 100 + "vw",
            opacity: 1,
            scale: 0.5,
          }}
          animate={{
            y: "-10vh",
            rotate: Math.random() * 360,
            opacity: 0,
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            delay: Math.random() * 0.5,
            ease: "easeOut",
          }}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            backgroundColor: [
              "#FFD700",
              "#FF6B6B",
              "#4ECDC4",
              "#45B7D1",
              "#96CEB4",
            ][Math.floor(Math.random() * 5)],
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
