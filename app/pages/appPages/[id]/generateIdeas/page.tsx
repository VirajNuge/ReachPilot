"use client";

import React, { useState } from "react";
import { Lightbulb } from "lucide-react";
import TopMenu from "../../components/topMenu/topMenu";
import BriefingForm from "../../components/GenerateIdeas/BriefingForm";
import IdeaGrid from "../../components/GenerateIdeas/Board/IdeaGrid";
import BlueprintModal from "../../components/GenerateIdeas/BlueprintModal"; // Import the Modal
import { ContentIdea } from "../../components/GenerateIdeas/Board/IdeaCard";

export default function GenerateIdeasPage() {
  const [isGenerating, setIsGenerating] = useState(false);

  // State for the modal
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGenerate = (data: any) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2500);
  };

  const handleIdeaClick = (idea: ContentIdea) => {
    // Set the idea and open the modal
    setSelectedIdea(idea);
    setIsModalOpen(true);
  };

  return (
    <div className="h-screen bg-[#F8F9FC] flex flex-col font-sans overflow-hidden">
      <div className="flex-shrink-0">
        <TopMenu
          pageName="Idea Generator"
          tokens={2000}
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-[420px] flex-shrink-0 bg-white border-r border-gray-200 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="p-6 space-y-8">
            <div className="space-y-3 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-none">
                    Generate Ideas
                  </h2>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-yellow-600">
                    Content Strategist AI
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Define your goal and topic below. The AI will scout trends and
                generate high-potential content blueprints.
              </p>
            </div>
            <BriefingForm
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 h-full overflow-y-auto bg-[#FAFAFA] p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="max-w-[1600px] mx-auto h-full">
            <IdeaGrid
              isGenerating={isGenerating}
              onIdeaClick={handleIdeaClick}
            />
          </div>
        </div>
      </div>

      {/* ⭐ STEP 4: The Interaction Modal */}
      <BlueprintModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        idea={selectedIdea}
      />
    </div>
  );
}
