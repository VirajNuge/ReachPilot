// lib/mockdata/templatedata.ts

export type Platform = "LinkedIn" | "X" | "Facebook" | "Instagram";
export type AssetType = "text" | "image" | "hybrid"; // Hybrid = Text + Image
export type PerformanceTrend = "up" | "down" | "neutral";
export type PersonaTone =
  | "Professional"
  | "Viral/Edgy"
  | "Storyteller"
  | "Sales-Driven"
  | "Default"
  | "Tech";

export interface AssetFolder {
  id: string;
  name: string;
  type: "client_workspace" | "campaign" | "general";
  parentId?: string;
  itemCount: number;
}

export interface TemplatePerformance {
  metricLabel: string;
  value: string;
  trend: PerformanceTrend;
}

export interface ReachPilotTemplate {
  id: string;
  title: string;
  description: string;
  type: AssetType;
  folderId: string;
  platforms: Platform[];

  isPremium: boolean;
  performance?: TemplatePerformance;
  recommendedPersonas: PersonaTone[];

  // Visual Preview for Image/Hybrid Templates (URL to a sample image)
  coverImage?: string;

  content: {
    linkedin?: string;
    x?: string[];
    facebook?: string;
    // The "Blueprint" for the AI Image Generator (Flux/Stable Diffusion)
    imagePrompt?: string;
  };
}

// --- MOCK DATA ---

export const MOCK_FOLDERS: AssetFolder[] = [
  { id: "f1", name: "All Templates", type: "general", itemCount: 12 },
  {
    id: "f2",
    name: "Client: TechStart",
    type: "client_workspace",
    itemCount: 5,
  },
  { id: "f3", name: "Client: EcoLife", type: "client_workspace", itemCount: 3 },
  {
    id: "f4",
    name: "Q1 Launch Campaign",
    type: "campaign",
    parentId: "f2",
    itemCount: 2,
  },
  {
    id: "f5",
    name: "Personal Branding",
    type: "campaign",
    parentId: "f2",
    itemCount: 4,
  },
];

export const MOCK_TEMPLATES: ReachPilotTemplate[] = [
  // 1. Text Template (Standard)
  {
    id: "t1",
    title: 'The "Visionary" Hiring Announcement',
    description:
      "Sell the company vision before the role. Great for attracting senior talent.",
    type: "text",
    folderId: "f1",
    platforms: ["LinkedIn", "Facebook"],
    isPremium: false,
    recommendedPersonas: ["Professional"],
    performance: { metricLabel: "Avg. Apps", value: "45+", trend: "up" },
    content: {
      linkedin:
        "We're not just looking for a [Role].\n\nWe're looking for someone who hates [Industry Pain Point].\n\nAt [Company], we are building the future of...",
      facebook:
        "We're hiring a [Role] at [Company]! If you're passionate about [Topic], DM me for details. 🚀",
    },
  },

  // 2. Image Template (Visual - Flux Style)
  {
    id: "t2",
    title: "Minimalist Tech Background",
    description:
      "Abstract purplish gradient backgrounds perfect for SaaS announcements.",
    type: "image",
    folderId: "f1",
    platforms: ["LinkedIn", "X"],
    isPremium: true,
    recommendedPersonas: ["Professional", "Tech"],
    coverImage:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    content: {
      imagePrompt:
        "Abstract 3D shapes, glassmorphism, purple and blue gradients, studio lighting, 8k render, minimalist, tech startup vibe",
    },
  },

  // 3. Hybrid Template (Text + Image)
  {
    id: "t3",
    title: "Quote of the Day (Visual)",
    description: "A powerful quote overlay on a dark, moody background.",
    type: "hybrid",
    folderId: "f1",
    platforms: ["Instagram", "LinkedIn"],
    isPremium: false,
    recommendedPersonas: ["Storyteller"],
    coverImage:
      "https://images.unsplash.com/photo-1555445054-d1863b93548d?q=80&w=2670&auto=format&fit=crop",
    content: {
      imagePrompt:
        "Dark workspace, macbook screen, shallow depth of field, moody lighting, cinematic bokeh",
      linkedin: "Motivation isn't magic. It's discipline. [Quote]",
    },
  },

  // 4. Text (Thread/Carousel)
  {
    id: "t4",
    title: "The 'Zero to One' Story",
    description:
      "Break down a success story into actionable steps. High save rate.",
    type: "text",
    folderId: "f5",
    platforms: ["X", "LinkedIn"],
    isPremium: true,
    recommendedPersonas: ["Storyteller", "Viral/Edgy"],
    performance: { metricLabel: "Avg. Likes", value: "2.1k", trend: "up" },
    content: {
      x: [
        "I went from $0 to $10k/month in 30 days. 🧵",
        "Step 1: The Setup...",
        "Step 2: The Failure...",
        "Step 3: The Pivot...",
        "Here is the summary:",
      ],
      linkedin:
        "How I went from $0 to $10k/month in 30 days (A Breakdown).\n\nMost people think you need [Myth].\n\nYou actually need [Truth].\n\n1. The Setup\n...",
    },
  },

  // 5. Image Template (Cyberpunk/Edgy)
  {
    id: "t5",
    title: "Neon Cyberpunk Backdrop",
    description:
      "High energy, futuristic visuals for product launches or crypto.",
    type: "image",
    folderId: "f1",
    platforms: ["Instagram", "X"],
    isPremium: false,
    recommendedPersonas: ["Viral/Edgy", "Tech"],
    coverImage:
      "https://images.unsplash.com/photo-1535868463750-c78d9543614f?q=80&w=2676&auto=format&fit=crop",
    content: {
      imagePrompt:
        "Cyberpunk city street, neon lights, purple and cyan, futuristic ui elements overlay, wet pavement reflection, highly detailed",
    },
  },

  // 6. Hybrid (Sales Focus)
  {
    id: "t6",
    title: "Feature Drop Announcement",
    description: "Showcase a new product feature with a clean device mockup.",
    type: "hybrid",
    folderId: "f4",
    platforms: ["LinkedIn", "X"],
    isPremium: false,
    recommendedPersonas: ["Sales-Driven", "Tech"],
    performance: { metricLabel: "CTR", value: "3.4%", trend: "neutral" },
    coverImage:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2670&auto=format&fit=crop",
    content: {
      imagePrompt:
        "Clean iphone 15 pro mockup floating, solid purple background, soft shadows, studio lighting, app interface visible",
      linkedin:
        "It's finally here. Introducing [Feature Name].\n\nSolve [Problem] in seconds, not hours.\n\nTry it free: [Link]",
      x: ["Shipping day. 📦\n\n[Feature] is live.", "See it in action 👇"],
    },
  },

  // 7. Text (Contrarian)
  {
    id: "t7",
    title: "The 'Unpopular Opinion'",
    description: "Challenge an industry norm to generate comments and debate.",
    type: "text",
    folderId: "f5",
    platforms: ["LinkedIn"],
    isPremium: false,
    recommendedPersonas: ["Viral/Edgy"],
    performance: { metricLabel: "Comments", value: "80+", trend: "up" },
    content: {
      linkedin:
        "Unpopular Opinion: [Popular Trend] is actually hurting your business.\n\nHere is why everyone is wrong...",
    },
  },

  // 8. Image (Soft/Professional)
  {
    id: "t8",
    title: "Soft Pastel Gradient",
    description:
      "Calm, reassuring visuals for mental health or wellness posts.",
    type: "image",
    folderId: "f3",
    platforms: ["Instagram", "Facebook"],
    isPremium: false,
    recommendedPersonas: ["Default", "Professional"],
    coverImage:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2670&auto=format&fit=crop",
    content: {
      imagePrompt:
        "Soft pastel colors, dreamy clouds, fluid shapes, blurred background, grain texture, calming atmosphere",
    },
  },

  // 9. Hybrid (Educational)
  {
    id: "t9",
    title: "The Checklist Post",
    description: "A simple visual checklist combined with deep-dive text.",
    type: "hybrid",
    folderId: "f1",
    platforms: ["LinkedIn"],
    isPremium: true,
    recommendedPersonas: ["Professional", "Sales-Driven"],
    performance: { metricLabel: "Saves", value: "150+", trend: "up" },
    coverImage:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2672&auto=format&fit=crop",
    content: {
      imagePrompt:
        "Minimalist checklist on clipboard, pen, coffee cup, wooden table, top down view, bright natural lighting",
      linkedin:
        "Are you making these 5 mistakes?\n\nChecklist for [Topic]:\n✅ [Item 1]\n✅ [Item 2]\n❌ [Avoid Item 3]\n\nFull breakdown below.",
    },
  },
];

export const getTemplatesByFolder = (folderId: string) => {
  if (folderId === "f1") return MOCK_TEMPLATES;
  return MOCK_TEMPLATES.filter((t) => t.folderId === folderId);
};
