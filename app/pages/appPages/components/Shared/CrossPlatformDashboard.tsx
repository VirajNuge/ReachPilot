"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Platform } from "./PlatformSelector";
import { getPlatformConfig } from "./PlatformSelector";

interface CrossPlatformData {
  platform: Platform;
  name: string;
  followers: number;
  engagement?: number;
  score?: number;
}

interface CrossPlatformDashboardProps {
  profiles: CrossPlatformData[];
  onAddPlatform?: () => void;
}

const platformColors: Record<Platform, string> = {
  linkedin: "#0077B5",
  facebook: "#1877F2",
  twitter: "#000000",
  instagram: "#E4405F",
  pinterest: "#E60023",
};

export function CrossPlatformDashboard({
  profiles,
  onAddPlatform,
}: CrossPlatformDashboardProps) {
  // Calculate totals
  const totalFollowers = profiles.reduce((sum, p) => sum + p.followers, 0);
  const avgScore =
    profiles.length > 0
      ? Math.round(
          profiles.reduce((sum, p) => sum + (p.score || 0), 0) /
            profiles.length,
        )
      : 0;
  const bestPlatform = profiles.reduce(
    (best, p) => (p.followers > (best?.followers || 0) ? p : best),
    profiles[0],
  );

  return (
    <div className="cross-platform-dashboard">
      {/* Summary Cards */}
      <div className="summary-grid">
        <motion.div
          className="summary-card total"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-label">Total Reach</div>
          <div className="card-value">{totalFollowers.toLocaleString()}</div>
          <div className="card-sub">across {profiles.length} platforms</div>
        </motion.div>

        <motion.div
          className="summary-card score"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card-label">Avg Profile Score</div>
          <div className="card-value">{avgScore}%</div>
          <div className="card-sub">optimization level</div>
        </motion.div>

        {bestPlatform && (
          <motion.div
            className="summary-card best"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="card-label">Strongest Platform</div>
            <div
              className="card-value"
              style={{ color: platformColors[bestPlatform.platform] }}
            >
              {getPlatformConfig(bestPlatform.platform).name}
            </div>
            <div className="card-sub">
              {bestPlatform.followers.toLocaleString()} followers
            </div>
          </motion.div>
        )}
      </div>

      {/* Platform Breakdown */}
      <div className="platform-breakdown">
        <h3>Platform Breakdown</h3>
        <div className="platform-bars">
          {profiles.map((profile, index) => {
            const config = getPlatformConfig(profile.platform);
            const widthPercent =
              totalFollowers > 0
                ? (profile.followers / totalFollowers) * 100
                : 0;

            return (
              <motion.div
                key={profile.platform}
                className="platform-bar-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="bar-header">
                  <span
                    className="platform-icon"
                    style={{ color: platformColors[profile.platform] }}
                  >
                    {React.createElement(config.icon, { size: 16 })}
                  </span>
                  <span className="platform-name">{config.name}</span>
                  <span className="platform-followers">
                    {profile.followers.toLocaleString()}
                  </span>
                  <span className="platform-percent">
                    {widthPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="bar-track">
                  <motion.div
                    className="bar-fill"
                    style={{
                      backgroundColor: platformColors[profile.platform],
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercent}%` }}
                    transition={{ delay: 0.3 + 0.1 * index, duration: 0.6 }}
                  />
                </div>
                {profile.score !== undefined && (
                  <div className="bar-score">Score: {profile.score}%</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="cross-platform-recs">
        <h3>Cross-Platform Insights</h3>
        <div className="rec-list">
          <motion.div
            className="rec-item"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="rec-icon">🎯</span>
            <span className="rec-text">
              Focus growth efforts on{" "}
              <strong>{bestPlatform?.platform || "your strongest"}</strong>{" "}
              where you have the most momentum
            </span>
          </motion.div>
          <motion.div
            className="rec-item"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="rec-icon">🔄</span>
            <span className="rec-text">
              Repurpose top content across platforms to maximize reach
            </span>
          </motion.div>
          <motion.div
            className="rec-item"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span className="rec-icon">📊</span>
            <span className="rec-text">
              Your total reach of{" "}
              <strong>{totalFollowers.toLocaleString()}</strong> puts you in the
              top 20% of multi-platform creators
            </span>
          </motion.div>
        </div>
      </div>

      {onAddPlatform && (
        <motion.button
          className="add-platform-btn bg-[#000100] hover:bg-black text-white"
          onClick={onAddPlatform}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          + Add Another Platform
        </motion.button>
      )}

      <style jsx>{`
        .cross-platform-dashboard {
          padding: 24px;
          background: #fafafa;
          border-radius: 16px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        .summary-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .card-label {
          font-size: 13px;
          color: #666;
          margin-bottom: 8px;
        }
        .card-value {
          font-size: 28px;
          font-weight: 700;
          color: #111;
          margin-bottom: 4px;
        }
        .card-sub {
          font-size: 12px;
          color: #888;
        }
        .platform-breakdown {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .platform-breakdown h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 20px 0;
        }
        .platform-bar-item {
          margin-bottom: 16px;
        }
        .bar-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .platform-icon {
          display: flex;
        }
        .platform-name {
          font-weight: 500;
          flex: 1;
        }
        .platform-followers {
          color: #333;
          font-weight: 500;
        }
        .platform-percent {
          color: #888;
          font-size: 12px;
          width: 50px;
          text-align: right;
        }
        .bar-track {
          height: 8px;
          background: #eee;
          border-radius: 4px;
          overflow: hidden;
        }
        .bar-fill {
          height: 100%;
          border-radius: 4px;
        }
        .bar-score {
          font-size: 11px;
          color: #888;
          margin-top: 4px;
        }
        .cross-platform-recs {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .cross-platform-recs h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 16px 0;
        }
        .rec-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .rec-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.5;
        }
        .rec-icon {
          font-size: 18px;
        }
        .rec-text strong {
          color: #0066ff;
        }
        .add-platform-btn {
          width: 100%;
          padding: 14px;
          background: white;
          border: 2px dashed #ddd;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
        }
        .add-platform-btn:hover {
          border-color: #0066ff;
          color: #0066ff;
        }
      `}</style>
    </div>
  );
}

export default CrossPlatformDashboard;
