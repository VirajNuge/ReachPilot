"use client";

import React from "react";
import { DollarSign, Briefcase, AlertTriangle, TrendingUp } from "lucide-react";
import { Client } from "./crmTypes";

interface StatsRibbonProps {
  clients: Client[];
}

export default function PipelineStatsRibbon({ clients }: StatsRibbonProps) {
  // Calculate logic directly inside component based on current state
  const activeClients = clients.filter(
    (c) => c.stage === "Active" || c.stage === "Retention"
  );
  const potentialClients = clients.filter(
    (c) => c.stage !== "Active" && c.stage !== "Retention"
  );

  const totalMRR = activeClients.reduce((sum, c) => sum + c.contractValue, 0);
  const pipelineValue = potentialClients.reduce(
    (sum, c) => sum + c.contractValue,
    0
  );
  const atRiskCount = clients.filter(
    (c) => c.health === "At Risk" || c.health === "Critical"
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
          <DollarSign size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Monthly Recurring Revenue
          </p>
          <h3 className="text-2xl font-black text-gray-900">
            ${totalMRR.toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          <TrendingUp size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Pipeline Potential
          </p>
          <h3 className="text-2xl font-black text-gray-900">
            ${pipelineValue.toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
          <Briefcase size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Active Clients
          </p>
          <h3 className="text-2xl font-black text-gray-900">
            {activeClients.length}
          </h3>
        </div>
      </div>

      <div
        className={`p-4 rounded-xl border shadow-sm flex items-center gap-4 ${
          atRiskCount > 0
            ? "bg-red-50 border-red-100"
            : "bg-white border-gray-200"
        }`}
      >
        <div
          className={`p-3 rounded-lg ${
            atRiskCount > 0
              ? "bg-red-100 text-red-600"
              : "bg-gray-50 text-gray-400"
          }`}
        >
          <AlertTriangle size={24} />
        </div>
        <div>
          <p
            className={`text-xs font-bold uppercase tracking-wider ${
              atRiskCount > 0 ? "text-red-400" : "text-gray-400"
            }`}
          >
            Churn Risk
          </p>
          <h3
            className={`text-2xl font-black ${
              atRiskCount > 0 ? "text-red-700" : "text-gray-900"
            }`}
          >
            {atRiskCount} Clients
          </h3>
        </div>
      </div>
    </div>
  );
}
