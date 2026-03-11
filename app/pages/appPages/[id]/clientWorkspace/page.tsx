"use client";

import React, { useState } from "react";
import { Briefcase, Plus, Command } from "lucide-react";

// --- COMPONENT IMPORTS ---
import TopMenu from "../../components/topMenu/topMenu";
import ClientDirectory from "../../components/ClientWorkspace/ClientDirectory";
import SingleClientWorkspace from "../../components/ClientWorkspace/SingleClientWorkspace";

// --- DATA & TYPE IMPORTS ---
// We ONLY import Workspace data. No CRM data allowed.
import { ClientWorkspace } from "../../components/ClientWorkspace/workspaceTypes";

export default function ClientWorkspacesPage() {
  // State is simple: Are we looking at the directory, or a specific workspace?
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<ClientWorkspace | null>(null);
  const [viewMode, setViewMode] = useState<"directory" | "studio">("directory");

  // ACTIONS
  const handleEnterStudio = (workspace: ClientWorkspace) => {
    setSelectedWorkspace(workspace);
    setViewMode("studio");
  };

  const handleExitStudio = () => {
    setSelectedWorkspace(null);
    setViewMode("directory");
  };

  return (
    <div className="h-screen bg-[#F8F9FC] flex flex-col font-sans overflow-hidden">
      {/* 1. TOP NAVIGATION */}
      <div className="flex-shrink-0">
        <TopMenu
          pageName="Brand Studio"
          tokens={2000}
        />
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 overflow-hidden p-6 lg:p-8 flex flex-col">
        <div className="max-w-[1600px] w-full h-full flex flex-col mx-auto">
          {/* HEADER (Context Aware) */}
          <div className="flex-shrink-0 flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center shadow-lg shadow-gray-200">
                <Command size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-none">
                  {viewMode === "directory"
                    ? "Client Workspaces"
                    : selectedWorkspace?.clientName}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {viewMode === "directory"
                    ? "Access brand assets, voice models, and approval queues."
                    : "Brand Studio Active • AI Voice Model Loaded"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {viewMode === "directory" && (
              <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95">
                <Plus size={16} /> New Workspace
              </button>
            )}
          </div>

          {/* DYNAMIC VIEW AREA */}
          <div className="flex-1 min-h-0">
            {/* VIEW A: THE DIRECTORY GRID */}
            {viewMode === "directory" && (
              <ClientDirectory onSelectWorkspace={handleEnterStudio} />
            )}

            {/* VIEW B: THE SINGLE STUDIO */}
            {viewMode === "studio" && selectedWorkspace && (
              <SingleClientWorkspace
                workspace={selectedWorkspace}
                onBack={handleExitStudio}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
