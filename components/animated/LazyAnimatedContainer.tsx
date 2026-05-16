"use client";

/**
 * Lazy-loaded framer-motion animation wrapper.
 * This component is code-split to reduce admin page bundle size.
 */

import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface LazyAnimatedContainerProps {
  children: ReactNode;
  isOpen: boolean;
  delay?: number;
}

export default function LazyAnimatedContainer({
  children,
  isOpen,
  delay = 0,
}: LazyAnimatedContainerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ delay, duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
