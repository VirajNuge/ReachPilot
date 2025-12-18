"use client";

import React from "react";
import { GeneratorFormState } from "./page";

import FormatSection from "../../components/PostGenerator/FormatSection";
import ContentBlocksSection from "../../components/PostGenerator/ContentBlocksSection";
import StyleBrandSection from "../../components/PostGenerator/StyleBrandSection";
import MediaAssetsSection from "../../components/PostGenerator/MediaAssetsSection";
import AIDirectionSection from "../../components/PostGenerator/AIDirectionSection";
import GeneratorActions from "../../components/PostGenerator/GeneratorActions";

interface GeneratorFormProps {
  formState: GeneratorFormState;
  setFormState: React.Dispatch<React.SetStateAction<GeneratorFormState>>;
  onGenerate: () => Promise<void>; // ⭐ UPDATED
  isGenerating: boolean;
}

export default function GeneratorForm({
  formState,
  setFormState,
  onGenerate,
  isGenerating,
}: GeneratorFormProps) {
  return (
    <div className="space-y-12 pb-40">
      <FormatSection formState={formState} setFormState={setFormState} />

      <ContentBlocksSection formState={formState} setFormState={setFormState} />

      <StyleBrandSection formState={formState} setFormState={setFormState} />

      <MediaAssetsSection formState={formState} setFormState={setFormState} />

      <AIDirectionSection formState={formState} setFormState={setFormState} />

      <GeneratorActions onGenerate={onGenerate} isGenerating={isGenerating} />
    </div>
  );
}
