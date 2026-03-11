"use client";

import React, { useState } from "react";
import { Pickaxe } from "lucide-react";

// --- IMPORTS ---
import TopMenu from "../../components/topMenu/topMenu";
import MinerInput from "../../components/QuestionMine/MinerInput";
import QuestionFeed, {
  QuestionItem,
} from "../../components/QuestionMine/QuestionFeed";
import SolutionModal from "../../components/QuestionMine/SolutionModal";

export default function QuestionMinePage() {
  const [isMining, setIsMining] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);

  const handleSearch = async (term: string, sources: string[]) => {
    setIsMining(true);
    setQuestions([]); // Clear old results immediately

    try {
      const response = await fetch("/api/question-mine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: term, sources }), // Send data to backend
      });

      if (!response.ok) throw new Error("Mining failed");

      const data = await response.json();
      setQuestions(data.questions || []); // Update UI with real questions
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsMining(false);
    }
  };

  const handleSolve = (question: any) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
  };

  return (
    // MAIN WRAPPER
    <div className="h-screen bg-[#F8F9FC] flex flex-col font-sans overflow-hidden">
      {/* 1. TOP NAVIGATION */}
      <div className="flex-shrink-0">
        <TopMenu
          pageName="The Question Mine"
          tokens={2000}
        />
      </div>

      {/* 2. MAIN SPLIT INTERFACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* === LEFT PANEL: THE RADAR (Inputs) === */}
        <div className="w-[420px] flex-shrink-0 bg-white border-r border-gray-200 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="p-6 space-y-8">
            {/* Context Header */}
            <div className="space-y-3 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                  <Pickaxe size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-none">
                    Question Mine
                  </h2>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-orange-600">
                    Community Spy
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Don't guess what they want. Find exactly what they are asking.
                Scan Reddit & Quora for unanswered user pain points.
              </p>
            </div>

            {/* ⭐ STEP 2: Miner Inputs */}
            {/* TODO: Pass onSearch and isMining props */}
            <MinerInput onSearch={handleSearch} isMining={isMining} />
          </div>
        </div>

        {/* === RIGHT PANEL: THE VEIN (Feed) === */}
        <div className="flex-1 h-full overflow-y-auto bg-[#FAFAFA] p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="max-w-[1000px] mx-auto h-full">
            {/* ⭐ STEP 3: Question Feed */}
            <QuestionFeed
              isMining={isMining}
              questions={questions}
              onSolve={handleSolve}
            />
          </div>
        </div>
      </div>

      {/* ⭐ STEP 4: The Solution Modal */}
      {/* TODO: Pass isOpen, onClose, and question props */}
      <SolutionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        question={selectedQuestion}
      />
    </div>
  );
}
