"use client";

import React from "react";
import {
  ArrowRight,
  Layout,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Layers,
} from "lucide-react";
import { WORKSPACE_DATA } from "./workspaceData";
import { ClientWorkspace } from "./workspaceTypes";

interface ClientDirectoryProps {
  onSelectWorkspace: (workspace: ClientWorkspace) => void;
}

export default function ClientDirectory({
  onSelectWorkspace,
}: ClientDirectoryProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-y-auto pr-2 custom-scrollbar">
      {/* Header Stats */}
      <div className="flex gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-1">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-1">
            <Layout size={14} /> Active Workspaces
          </div>
          <div className="text-2xl font-black text-gray-900">
            {WORKSPACE_DATA.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-1">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-1">
            <FileText size={14} /> Total Assets Managed
          </div>
          <div className="text-2xl font-black text-gray-900">1,204</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        {WORKSPACE_DATA.map((workspace) => {
          // ⭐ FIX: Added '?' safety check and explicitly typed '(p: any)' to fix the error
          const pendingCount =
            workspace.postQueue?.filter((p: any) => p.status === "In Review")
              .length || 0;

          return (
            <div
              key={workspace.id}
              onClick={() => onSelectWorkspace(workspace)}
              className="group bg-white rounded-2xl border border-gray-200 p-0 hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer relative overflow-hidden flex flex-col"
            >
              {/* Brand Header */}
              <div className="h-24 w-full relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{ background: workspace.brand.primaryColor }}
                ></div>
                <div className="absolute top-4 right-4 flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-white/50 backdrop-blur-md"></div>
                  <div className="w-2 h-2 rounded-full bg-white/50 backdrop-blur-md"></div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 -mt-10 relative z-10 flex-1 flex flex-col">
                <div className="flex justify-between items-end mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-2xl font-bold text-gray-700">
                    {workspace.logo}
                  </div>
                  {pendingCount > 0 ? (
                    <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold border border-orange-100 flex items-center gap-1">
                      <AlertCircle size={12} /> {pendingCount} Review
                    </span>
                  ) : (
                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold border border-green-100 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Sync Active
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {workspace.clientName}
                </h3>
                <p className="text-xs text-gray-500 mb-6 line-clamp-2">
                  {workspace.description}
                </p>

                {/* Mini Stats */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">
                      Tone
                    </p>
                    <p className="text-xs font-bold text-gray-800 truncate">
                      {workspace.voice.tone}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">
                      Posts
                    </p>
                    <p className="text-xs font-bold text-gray-800">
                      {workspace.totalPostsCreated}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                    <Clock size={12} /> Active {workspace.lastActive}
                  </div>
                  <span className="text-indigo-600 font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Enter Studio <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* 'Add New' Card */}
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-300 hover:bg-indigo-50/10 transition-colors cursor-pointer group min-h-[340px]">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-white group-hover:shadow-md transition-all text-gray-400 group-hover:text-indigo-600">
            <Layers size={24} />
          </div>
          <span className="font-bold text-sm text-gray-600 group-hover:text-indigo-600">
            New Brand Workspace
          </span>
        </div>
      </div>
    </div>
  );
}
