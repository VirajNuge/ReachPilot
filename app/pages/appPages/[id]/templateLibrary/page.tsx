"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MOCK_FOLDERS,
  ReachPilotTemplate,
  getTemplatesByFolder,
  Platform,
  AssetType,
} from "../../../../../lib/mockdata/templatedata";
import AssetFolderTree from "../../components/TemplateLibrary/AssetFolderTree";
import SmartTemplateCard from "../../components/TemplateLibrary/SmartTemplateCard";
import TemplatePreviewModal from "../../components/TemplateLibrary/TemplatePreviewModal";
import LibraryFilterBar from "../../components/TemplateLibrary/LibraryFilterBar";
import TemplatePage from "../../components/TemplateLibrary/TemplatePage";
import { Search, LayoutGrid, List, X, Layers } from "lucide-react";
import TopMenu from "../../components/topMenu/topMenu";

type TabType = "assets" | "caption-templates";

export default function TemplateLibraryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);

  // --- Tab ---
  const [activeTab, setActiveTab] = useState<TabType>("assets");

  // --- State ---
  const [selectedFolderId, setSelectedFolderId] = useState<string>("f1");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter States
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | "All">(
    "All",
  );
  const [selectedType, setSelectedType] = useState<AssetType | "All">("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReachPilotTemplate | null>(null);

  // --- Derived Data ---
  const currentTemplates = getTemplatesByFolder(selectedFolderId).filter(
    (t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform =
        selectedPlatform === "All" || t.platforms.includes(selectedPlatform);
      const matchesType = selectedType === "All" || t.type === selectedType;
      return matchesSearch && matchesPlatform && matchesType;
    },
  );

  const selectedFolderName =
    MOCK_FOLDERS.find((f) => f.id === selectedFolderId)?.name || "Library";

  // --- Actions ---

  const handlePreview = (template: ReachPilotTemplate) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const clearSearch = () => setSearchQuery("");

  return (
    <>
      <TopMenu
        pageName="Template Library"
        tokens={2000}
      />
      <div className="flex h-[calc(100vh-64px)] bg-[#fbfaff]">
        {/* 1. LEFT SIDEBAR — only shown for assets tab */}
        {activeTab === "assets" && (
          <aside className="w-64 bg-white border-r border-slate-100 flex flex-col p-5 hidden md:flex">
            <AssetFolderTree
              folders={MOCK_FOLDERS}
              selectedFolderId={selectedFolderId}
              onSelectFolder={setSelectedFolderId}
            />
          </aside>
        )}

        {/* 2. MAIN CONTENT */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* --- TAB BAR --- */}
          <div className="flex items-center gap-1 px-8 pt-4 bg-white border-b border-slate-200/60 sticky top-0 z-30">
            <button
              onClick={() => setActiveTab("assets")}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold rounded-t-xl transition-colors cursor-pointer border-none -mb-px border-b-2 ${
                activeTab === "assets"
                  ? "text-violet-700 border-b-2 border-violet-600 bg-violet-50/60"
                  : "text-slate-500 hover:text-slate-700 border-transparent"
              }`}
            >
              <LayoutGrid size={14} /> Asset Library
            </button>
            <button
              onClick={() => setActiveTab("caption-templates")}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold rounded-t-xl transition-colors cursor-pointer border-none -mb-px border-b-2 ${
                activeTab === "caption-templates"
                  ? "text-[#0052FF] border-b-2 border-[#0052FF] bg-[#0052FF]/5"
                  : "text-slate-500 hover:text-slate-700 border-transparent"
              }`}
            >
              <Layers size={14} /> Caption Templates
            </button>
          </div>

          {/* --- ASSET LIBRARY TAB --- */}
          {activeTab === "assets" && (
            <>
              <header className="sticky top-[49px] z-20 px-8 py-5 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                      {selectedFolderName}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                      {currentTemplates.length} assets available
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative group w-full md:w-80 z-10 focus-within:z-20 transition-all duration-300">
                      <div className="absolute left-3.5 top-3 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors pointer-events-none">
                        <Search size={18} strokeWidth={2.5} />
                      </div>
                      <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        spellCheck={false}
                        autoComplete="off"
                        className="
                          w-[240px] pl-11 pr-10 py-2.5
                          bg-white border border-slate-200 rounded-full
                          text-sm text-slate-700 placeholder:text-slate-400 font-medium tracking-tight
                          shadow-sm transition-all duration-200
                          hover:shadow-md hover:border-slate-300
                          focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 focus:shadow-lg
                        "
                      />
                      {searchQuery && (
                        <button
                          onClick={clearSearch}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200"
                          aria-label="Clear search"
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                <LibraryFilterBar
                  selectedPlatform={selectedPlatform}
                  selectedType={selectedType}
                  onPlatformChange={setSelectedPlatform}
                  onTypeChange={setSelectedType}
                />
                {currentTemplates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
                    {currentTemplates.map((template) => (
                      <SmartTemplateCard
                        key={template.id}
                        template={template}
                        onPreview={handlePreview}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-start pt-20 text-slate-400 pb-20">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Search size={24} className="opacity-40 text-slate-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">No matches found</h3>
                    <p className="text-sm text-slate-500 mb-4 max-w-xs text-center">
                      Try adjusting your search or filters.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedPlatform("All");
                        setSelectedType("All");
                      }}
                      className="text-violet-600 text-sm font-medium hover:underline hover:text-violet-700 transition-colors"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* --- CAPTION TEMPLATES TAB --- */}
          {activeTab === "caption-templates" && (
            <TemplatePage
              accountId={id}
              onSelectTemplate={(templateId) => {
                router.push(`/pages/appPages/${id}/postGenerator?templateId=${templateId}`);
              }}
            />
          )}
        </main>

        {/* 3. PREVIEW MODAL */}
        {selectedTemplate && (
          <TemplatePreviewModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            template={selectedTemplate}
          />
        )}
      </div>
    </>
  );
}
