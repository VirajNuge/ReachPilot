import React from "react";

import type { CreativeHandoffV2, PostGenerationInput } from "@/lib/types/postGeneration";

import { getTemplateComponent } from "./TemplateRegistry";

export interface PostCanvasProps {
  creativeHandoff: CreativeHandoffV2;
  brandAssets: PostGenerationInput["brandAssets"];
  backgroundImageUrl: string;
  width: number;
  height: number;
  id?: string;
  className?: string;
}

export function PostCanvas({
  creativeHandoff,
  brandAssets,
  backgroundImageUrl,
  width,
  height,
  id,
  className,
}: PostCanvasProps) {
  const Template = getTemplateComponent(creativeHandoff.layoutBrief.templateId);

  return (
    <div id={id} className={className} style={{ width: `${width}px`, maxWidth: "100%" }}>
      <Template
        creativeHandoff={creativeHandoff}
        brandAssets={brandAssets}
        backgroundImageUrl={backgroundImageUrl}
        width={width}
        height={height}
      />
    </div>
  );
}
