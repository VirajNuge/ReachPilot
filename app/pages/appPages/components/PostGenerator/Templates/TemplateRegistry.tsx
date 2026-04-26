import React from "react";

import type { CreativeHandoffV2, PostGenerationInput, TemplateId } from "@/lib/types/postGeneration";

import { HeroBottomOverlayTemplate } from "./templates/HeroBottomOverlay";
import { MinimalCardTemplate } from "./templates/MinimalCard";
import { QuoteFocusTemplate } from "./templates/QuoteFocus";
import { SplitEditorialTemplate } from "./templates/SplitEditorial";

export interface TemplateRenderProps {
  creativeHandoff: CreativeHandoffV2;
  brandAssets: PostGenerationInput["brandAssets"];
  backgroundImageUrl: string;
  width: number;
  height: number;
}

const TEMPLATE_COMPONENTS: Record<TemplateId, React.ComponentType<TemplateRenderProps>> = {
  "hero-bottom-overlay": HeroBottomOverlayTemplate,
  "split-editorial": SplitEditorialTemplate,
  "minimal-card": MinimalCardTemplate,
  "quote-focus": QuoteFocusTemplate,
};

export function getTemplateComponent(templateId: TemplateId): React.ComponentType<TemplateRenderProps> {
  return TEMPLATE_COMPONENTS[templateId] ?? HeroBottomOverlayTemplate;
}
