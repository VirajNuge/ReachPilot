import { PostCanvas } from "@/app/pages/appPages/components/PostGenerator/Templates/PostCanvas";
import type { CreativeHandoffV2, PostGenerationInput } from "@/lib/types/postGeneration";

function asString(value: string | string[] | undefined, fallback = ""): string {
  return Array.isArray(value) ? value[0] ?? fallback : value ?? fallback;
}

export default async function PostExportRenderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const imageUrl = asString(params.imageUrl);
  const width = Number(asString(params.width, "1080")) || 1080;
  const height = Number(asString(params.height, "1080")) || 1080;

  if (!imageUrl) {
    return (
      <main style={{ padding: 32, fontFamily: "Inter, Arial, sans-serif" }}>
        <h1>ReachPilot export render surface</h1>
        <p>Provide query params like <code>?imageUrl=...&headline=...&subtext=...&cta=...</code> to preview a composed asset.</p>
      </main>
    );
  }

  const creativeHandoff: CreativeHandoffV2 = {
    schemaVersion: "v2",
    visualBrief: {
      prompt: "Preview render surface",
      subject: asString(params.subject, "Campaign subject"),
      environment: asString(params.environment, "Editorial background"),
      lighting: asString(params.lighting, "Soft dramatic light"),
      mood: asString(params.mood, "Confident"),
      composition: "rule_of_thirds",
      negativeSpaceZone: "bottom_left",
      renderStyle: "photorealistic",
      brandColorUsage: [],
      avoid: ["visible text"],
    },
    copyBrief: {
      headline: asString(params.headline, "ReachPilot Preview"),
      subtext: asString(params.subtext, "Composed with the new template engine"),
      cta: asString(params.cta, "Export Now"),
    },
    layoutBrief: {
      templateId: (asString(params.templateId, "hero-bottom-overlay") as CreativeHandoffV2["layoutBrief"]["templateId"]),
      alignment: (asString(params.alignment, "left") as CreativeHandoffV2["layoutBrief"]["alignment"]),
      textTheme: (asString(params.textTheme, "light-on-dark") as CreativeHandoffV2["layoutBrief"]["textTheme"]),
      safeArea: (asString(params.safeArea, "bottom_left") as CreativeHandoffV2["layoutBrief"]["safeArea"]),
      overlay: (asString(params.overlay, "black-gradient-80") as CreativeHandoffV2["layoutBrief"]["overlay"]),
    },
  };

  const brandAssets: PostGenerationInput["brandAssets"] = {
    logoUrl: asString(params.logoUrl) || undefined,
    colorPalette: asString(params.colors)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    fontFamily: asString(params.fontFamily) || undefined,
    watermark: false,
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#E5E7EB", padding: 24 }}>
      <PostCanvas
        creativeHandoff={creativeHandoff}
        brandAssets={brandAssets}
        backgroundImageUrl={imageUrl}
        width={width}
        height={height}
      />
    </main>
  );
}
