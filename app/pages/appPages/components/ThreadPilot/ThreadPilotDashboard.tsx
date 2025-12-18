"use client";

import React from "react";
import TrendFeed from "./Dashboard/TrendFeed";
import DraftQueue from "./Dashboard/DraftQueue";

export default function ThreadPilotDashboard() {
  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Input (Trends) */}
      <div className="h-[600px]">
        <TrendFeed />
      </div>

      {/* Right Column: Output (Drafts) */}
      <div className="h-[600px]">
        <DraftQueue />
      </div>
    </div>
  );
}
