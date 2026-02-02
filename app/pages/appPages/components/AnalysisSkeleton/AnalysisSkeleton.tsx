"use client";

import React from "react";
import { motion } from "framer-motion";

// Shimmer animation component
const Shimmer: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`relative overflow-hidden ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
  </div>
);

// Generic skeleton box
export const SkeletonBox: React.FC<{
  width?: string;
  height?: string;
  rounded?: string;
  className?: string;
}> = ({
  width = "w-full",
  height = "h-4",
  rounded = "rounded",
  className = "",
}) => (
  <div className={`bg-gray-200 ${width} ${height} ${rounded} ${className}`}>
    <Shimmer className="w-full h-full" />
  </div>
);

// Profile status skeleton
export const AccStatusSkeleton: React.FC = () => (
  <motion.div
    className="w-[500px] h-max rounded-[12px] bg-white border border-gray-100 shadow-sm p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="flex gap-4 items-center">
      <SkeletonBox width="w-14" height="h-14" rounded="rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonBox width="w-32" height="h-5" rounded="rounded" />
        <SkeletonBox width="w-48" height="h-4" rounded="rounded" />
        <div className="flex gap-3 mt-2">
          <SkeletonBox width="w-20" height="h-8" rounded="rounded-lg" />
          <SkeletonBox width="w-20" height="h-8" rounded="rounded-lg" />
        </div>
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="flex justify-between">
        <SkeletonBox width="w-24" height="h-4" rounded="rounded" />
        <SkeletonBox width="w-12" height="h-4" rounded="rounded" />
      </div>
      <SkeletonBox width="w-full" height="h-3" rounded="rounded-full" />
    </div>
  </motion.div>
);

// Quick fixes skeleton
export const QuickFixesSkeleton: React.FC = () => (
  <div className="bg-gray-50 w-[478px] rounded-[10px] p-4">
    <SkeletonBox width="w-28" height="h-5" rounded="rounded" className="mb-4" />
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-3 rounded-lg space-y-2">
          <SkeletonBox width="w-3/4" height="h-4" rounded="rounded" />
          <SkeletonBox width="w-full" height="h-3" rounded="rounded" />
          <SkeletonBox width="w-24" height="h-6" rounded="rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

// Bio analysis skeleton
export const AccBioSkeleton: React.FC = () => (
  <div className="bg-white rounded-[8px] p-4 w-[450px]">
    <div className="flex items-center gap-2 mb-4">
      <SkeletonBox width="w-5" height="h-5" rounded="rounded" />
      <SkeletonBox width="w-40" height="h-5" rounded="rounded" />
    </div>
    <div className="flex gap-2 mb-4">
      <SkeletonBox width="w-20" height="h-7" rounded="rounded-full" />
      <SkeletonBox width="w-24" height="h-7" rounded="rounded-full" />
      <SkeletonBox width="w-20" height="h-7" rounded="rounded-full" />
    </div>
    <div className="space-y-3">
      <SkeletonBox width="w-full" height="h-3" rounded="rounded" />
      <SkeletonBox width="w-5/6" height="h-3" rounded="rounded" />
      <SkeletonBox width="w-full" height="h-3" rounded="rounded" />
      <SkeletonBox width="w-4/5" height="h-3" rounded="rounded" />
    </div>
    <SkeletonBox
      width="w-32"
      height="h-8"
      rounded="rounded-full"
      className="mt-4"
    />
  </div>
);

// Chart skeleton
export const ChartSkeleton: React.FC = () => (
  <div className="bg-white rounded-[8px] p-4 w-[450px]">
    <div className="flex items-center gap-2 mb-4">
      <SkeletonBox width="w-5" height="h-5" rounded="rounded" />
      <SkeletonBox width="w-36" height="h-5" rounded="rounded" />
    </div>
    <div className="flex items-end justify-around h-[180px] px-6 pb-4">
      <SkeletonBox width="w-16" height="h-24" rounded="rounded-t" />
      <SkeletonBox width="w-16" height="h-32" rounded="rounded-t" />
      <SkeletonBox width="w-16" height="h-20" rounded="rounded-t" />
    </div>
    <div className="space-y-2 mt-2">
      <SkeletonBox width="w-full" height="h-3" rounded="rounded" />
      <SkeletonBox width="w-5/6" height="h-3" rounded="rounded" />
      <SkeletonBox width="w-4/5" height="h-3" rounded="rounded" />
    </div>
  </div>
);

// Keywords skeleton
export const KeywordsSkeleton: React.FC = () => (
  <div className="bg-white rounded-[8px] p-4 w-[450px] mt-3">
    <div className="flex items-center gap-2 mb-4">
      <SkeletonBox width="w-5" height="h-5" rounded="rounded" />
      <SkeletonBox width="w-44" height="h-5" rounded="rounded" />
    </div>
    <div className="flex flex-wrap gap-2 mb-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <SkeletonBox key={i} width="w-20" height="h-7" rounded="rounded-full" />
      ))}
    </div>
    <div className="space-y-3">
      <SkeletonBox width="w-full" height="h-8" rounded="rounded-lg" />
      <SkeletonBox width="w-full" height="h-8" rounded="rounded-lg" />
    </div>
  </div>
);

// Schedule heatmap skeleton
export const ScheduleSkeleton: React.FC = () => (
  <div className="bg-white rounded-[8px] p-4 w-[450px]">
    <div className="flex items-center gap-2 mb-4">
      <SkeletonBox width="w-5" height="h-5" rounded="rounded" />
      <SkeletonBox width="w-32" height="h-5" rounded="rounded" />
    </div>
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((row) => (
        <div key={row} className="flex gap-2">
          <SkeletonBox width="w-12" height="h-6" rounded="rounded" />
          {[1, 2, 3, 4].map((col) => (
            <SkeletonBox
              key={col}
              width="w-16"
              height="h-6"
              rounded="rounded"
            />
          ))}
        </div>
      ))}
    </div>
    <SkeletonBox
      width="w-full"
      height="h-10"
      rounded="rounded-lg"
      className="mt-4"
    />
  </div>
);

// Full page loading skeleton
export const AnalysisSkeleton: React.FC = () => (
  <div className="flex gap-4 mt-4 px-4">
    <div className="flex flex-col gap-4">
      <AccStatusSkeleton />
      <QuickFixesSkeleton />
    </div>
    <div className="bg-gray-50 rounded-xl p-4 flex gap-4">
      <div className="flex flex-col gap-4">
        <AccBioSkeleton />
        <KeywordsSkeleton />
      </div>
      <div className="flex flex-col gap-4">
        <ChartSkeleton />
        <ScheduleSkeleton />
      </div>
    </div>
  </div>
);

export default AnalysisSkeleton;
