"use client";

import React, { useState } from "react";
import { AssetFolder } from "@/lib/mockdata/templatedata";
import {
  Folder,
  FolderOpen,
  Plus,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface AssetFolderTreeProps {
  folders: AssetFolder[];
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
}

const AssetFolderTree: React.FC<AssetFolderTreeProps> = ({
  folders,
  selectedFolderId,
  onSelectFolder,
}) => {
  // Default expanded state
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({
    f2: true, // Example default open folder
  });

  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const topLevelFolders = folders.filter((f) => !f.parentId);

  const renderFolderItem = (folder: AssetFolder, level = 0) => {
    const isSelected = folder.id === selectedFolderId;
    const subFolders = folders.filter((f) => f.parentId === folder.id);
    const hasChildren = subFolders.length > 0;
    const isExpanded = expandedFolders[folder.id];

    // Indentation: 12px per level + 8px base padding
    const paddingLeft = level === 0 ? 8 : level * 12 + 8;

    return (
      <div key={folder.id} className="w-[220px]">
        <div
          onClick={() => onSelectFolder(folder.id)}
          style={{ paddingLeft: `${paddingLeft}px` }}
          className={`
            group flex items-center justify-between w-full  py-2 pr-2 mb-0.5 rounded-lg cursor-pointer transition-all duration-200
            border border-transparent select-none
            ${
              isSelected
                ? "bg-violet-50 text-violet-700 font-medium"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }
          `}
        >
          {/* Left Side: Chevron + Icon + Name */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Toggle Arrow */}
            <div
              className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-black/5 transition-colors ${
                hasChildren ? "cursor-pointer" : "invisible"
              }`}
              onClick={(e) => hasChildren && toggleFolder(folder.id, e)}
            >
              {hasChildren &&
                (isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                ))}
            </div>

            {/* Folder Icon */}
            {isSelected ? (
              <FolderOpen size={18} className="text-violet-600 flex-shrink-0" />
            ) : (
              <Folder
                size={18}
                className="text-slate-400 group-hover:text-violet-400 flex-shrink-0 transition-colors"
              />
            )}

            {/* Folder Name - Truncates nicely */}
            <span className="truncate text-sm leading-none pt-0.5">
              {folder.name}
            </span>
          </div>

          {/* Right Side: Count Badge */}
          {folder.itemCount > 0 && (
            <span
              className={`
                text-[10px] px-2 py-0.5 rounded-full font-semibold ml-2 flex-shrink-0 transition-colors
                ${
                  isSelected
                    ? "bg-violet-200 text-violet-800"
                    : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-sm"
                }
              `}
            >
              {folder.itemCount}
            </span>
          )}
        </div>

        {/* Recursive Render for Children */}
        {hasChildren && isExpanded && (
          <div className="w-full">
            {subFolders.map((child) => renderFolderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="h-full flex flex-col w-full overflow-hidden pt-4">
      {/* Header Section */}
      <div className="flex items-center justify-between px-3 mb-2 group">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
          Workspaces
        </h3>

        {/* Minimal 'Add' Button */}
        <button
          className="
            flex items-center justify-center w-6 h-6 rounded-md
            text-slate-400 transition-all duration-200
            hover:text-violet-600 hover:bg-violet-100
            focus:outline-none focus:ring-2 focus:ring-violet-200 border-none cursor-pointer
          "
          title="New Workspace"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Folder List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-0.5 pb-4 px-2">
        {topLevelFolders.map((folder) => renderFolderItem(folder))}
      </div>
    </nav>
  );
};

export default AssetFolderTree;
