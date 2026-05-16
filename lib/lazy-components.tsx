/**
 * Lazy-loaded component definitions to reduce initial bundle size.
 * These components are code-split and loaded only when needed.
 */

import React from "react";
import dynamic from "next/dynamic";

// Lazy-load framer-motion animations for admin pages
export const LazyAnimatedContainer = dynamic(
  () => import("@/components/animated/LazyAnimatedContainer"),
  {
    loading: () => <div />, // Minimal placeholder
    ssr: false, // Disable SSR for animations
  }
);

// Lazy-load recharts for dashboard analytics
export const LazyChart = dynamic(
  () => import("@/components/charts/LazyChart"),
  {
    loading: () => <div className="h-64 bg-gray-100 rounded" />,
    ssr: false,
  }
);

export const LazyPieChart = dynamic(
  () => import("@/components/charts/LazyPieChart"),
  {
    loading: () => <div className="h-64 bg-gray-100 rounded" />,
    ssr: false,
  }
);

export const LazyRadarChart = dynamic(
  () => import("@/components/charts/LazyRadarChart"),
  {
    loading: () => <div className="h-64 bg-gray-100 rounded" />,
    ssr: false,
  }
);
