"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  BsChevronLeft,
  BsCheckCircleFill,
  BsStarFill,
} from "react-icons/bs";
import {
  Sparkles,
  Loader2,
  CheckCircle,
  ArrowRight,
  Upload,
  Plus,
  X,
  Search,
  Link2,
  Link2Off,
} from "lucide-react";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  FormInput,
  FormSelect,
  TagGroup,
  ToneSlider,
  WebsiteScraper,
  MultiSelectDropdown,
} from "../../components/PersonaForm";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface PersonaData {
  // Step 1 — YOU
  personaName: string;
  userRole: string;
  industry: string;
  tagline: string;
  websiteUrl: string;
  businessStage: string;
  scrapedWebsiteData: string;
  // Step 2 — AUDIENCE
  audienceSegments: string[];
  audienceRole: string[];
  painPoints: string[];
  audienceGoals: string[];
  audienceDesiredOutcome: string[];
  // Step 3 — OFFER
  productsServices: string[];
  uniquePOV: string[];
  credibilitySignals: string[];
  conversionGoal: string[];
  primaryObjective: string[];
  brandArchetype: string[];
  // Step 4 — VOICE
  toneSliders: { formalCasual: number; seriousPlayful: number; inspiringInformative: number; dataDriven: number; };
  writingStyle: string;
  emojiUsage: string;
  influencerStyle: string;
  writingSamples: string;
  // Step 5 — CONTENT
  contentThemes: string[];
  contentMix: string[];
  postingFrequency: string;
  doNotTalk: string[];
  coreValues: string[];
  // Step 6 — BRAND STYLE
  logoUrl: string;
  colorPalette: string[];
  fontFamily: string;
  brandColorHex: string;
}

const defaultPersona: PersonaData = {
  personaName: "", userRole: "", industry: "", tagline: "", websiteUrl: "",
  businessStage: "", scrapedWebsiteData: "",
  audienceSegments: [], audienceRole: [], painPoints: [], audienceGoals: [], audienceDesiredOutcome: [],
  productsServices: [], uniquePOV: [], credibilitySignals: [], conversionGoal: [], primaryObjective: [], brandArchetype: [],
  toneSliders: { formalCasual: 50, seriousPlayful: 50, inspiringInformative: 50, dataDriven: 50 },
  writingStyle: "First Person (I/Me)", emojiUsage: "", influencerStyle: "", writingSamples: "",
  contentThemes: [], contentMix: [], postingFrequency: "", doNotTalk: [], coreValues: [],
  logoUrl: "", colorPalette: [], fontFamily: "Inter", brandColorHex: "",
};

// ─────────────────────────────────────────────
// STEP CONFIG
// ─────────────────────────────────────────────
const personaSteps = [
  { id: 1, label: "YOU",      title: "Who You Are",       description: "Your identity, role, and brand basics." },
  { id: 2, label: "AUDIENCE", title: "Who You Write For",  description: "Your ideal reader and their problems." },
  { id: 3, label: "OFFER",    title: "What You Do",        description: "Products, unique POV, and credibility." },
  { id: 4, label: "VOICE",    title: "Your Voice & Style", description: "Tone, writing style, and real examples." },
  { id: 5, label: "CONTENT",  title: "Content Strategy",   description: "Topics, formats, and rules." },
  { id: 6, label: "BRAND",    title: "Brand Style",        description: "Logo, colors, font — your visual identity." },
  { id: 7, label: "CONNECT",  title: "Connected Accounts", description: "Link your social platforms for publishing." },
];

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function AccountPersona() {
  const { user } = useAuth();
  const params = useParams();
  const accountId = params?.id as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [persona, setPersona] = useState<PersonaData>(defaultPersona);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Google Fonts state
  const [googleFonts, setGoogleFonts] = useState<string[]>([]);
  const [fontSearch, setFontSearch] = useState("");
  const [fontsLoading, setFontsLoading] = useState(false);

  // Connected accounts state
  const [connections, setConnections] = useState<Array<{ platform: string; platformUsername?: string }>>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const totalSteps = personaSteps.length;
  const activeStepData = personaSteps.find((s) => s.id === currentStep)!;

  // Pre-load on mount
  useEffect(() => {
    if (!accountId) return;
    fetch(`/api/persona/save?accountId=${accountId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.persona) {
          const loaded = { ...data.persona };
          // Back-compat: if colorPalette is missing but brandColorHex exists, seed it
          if ((!loaded.colorPalette || loaded.colorPalette.length === 0) && loaded.brandColorHex) {
            loaded.colorPalette = [loaded.brandColorHex];
          }
          // Back-compat: coerce old string fields to string[] for MultiSelectDropdown
          const arrayFields = [
            "audienceRole", "painPoints", "audienceDesiredOutcome",
            "productsServices", "uniquePOV", "credibilitySignals",
            "conversionGoal", "doNotTalk", "brandArchetype",
          ] as const;
          for (const field of arrayFields) {
            if (typeof loaded[field] === "string") {
              loaded[field] = (loaded[field] as string) ? [loaded[field] as string] : [];
            } else if (!Array.isArray(loaded[field])) {
              loaded[field] = [];
            }
          }
          setPersona((prev) => ({ ...prev, ...loaded }));
        }
      })
      .catch(() => {});
  }, [accountId]);

  // Load Google Fonts metadata once
  useEffect(() => {
    setFontsLoading(true);
    fetch("https://fonts.google.com/metadata.json")
      .then((r) => r.json())
      .then((data: { familyMetadataList?: Array<{ family: string }> }) => {
        const families = (data.familyMetadataList ?? [])
          .map((f) => f.family)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));
        setGoogleFonts(families);
      })
      .catch(() => {
        // Fallback to a curated list if fetch fails
        setGoogleFonts(["DM Sans", "Inter", "Lato", "Merriweather", "Montserrat", "Nunito", "Open Sans", "Playfair Display", "Poppins", "Raleway", "Roboto", "Rubik", "Space Grotesk", "Ubuntu", "Work Sans"]);
      })
      .finally(() => setFontsLoading(false));
  }, []);

  // Load font CSS for selected font whenever it changes
  useEffect(() => {
    if (!persona.fontFamily) return;
    const id = `gf-${persona.fontFamily.replace(/\s+/g, "-")}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(persona.fontFamily).replace(/%20/g, "+")}:wght@400;600;700&display=swap`;
    document.head.appendChild(link);
  }, [persona.fontFamily]);

  // Fetch connections when step 7 is active
  useEffect(() => {
    if (currentStep !== 7 || !accountId) return;
    setConnectionsLoading(true);
    fetch(`/api/auth/connections?accountId=${accountId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.connections) setConnections(data.connections);
      })
      .catch(() => {})
      .finally(() => setConnectionsLoading(false));
  }, [currentStep, accountId]);

  const update = useCallback((key: keyof PersonaData, value: any) => {
    setPersona((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((p) => p + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((p) => p - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      // Keep brandColorHex in sync with first colorPalette entry
      const personaToSave = {
        ...persona,
        brandColorHex: persona.colorPalette[0] || persona.brandColorHex || "",
      };
      const res = await fetch("/api/persona/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, accountId, persona: personaToSave }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err: any) {
      setSaveError(err.message || "Could not save persona.");
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────
  // STEP CONTENT
  // ─────────────────────────────────────────────
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-400">
            <FormInput label="Persona Name" placeholder="e.g., The Bold Founder" value={persona.personaName} onChange={(v) => update("personaName", v)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="User Role"
                options={["Founder", "Marketer", "Creator", "Sales Rep", "Consultant", "Executive", "Coach", "Freelancer"]}
                value={persona.userRole}
                onChange={(v) => update("userRole", v)}
              />
              <FormSelect
                label="Industry / Niche"
                options={["SaaS", "E-commerce", "Health & Wellness", "Fintech", "EdTech", "Agency", "Creator Economy", "B2B Services", "Retail", "Real Estate", "Coaching & Consulting"]}
                value={persona.industry}
                onChange={(v) => update("industry", v)}
              />
            </div>
            <FormInput label="Tagline / One-liner" placeholder="Helping startups scale with AI..." value={persona.tagline} onChange={(v) => update("tagline", v)} />
            <FormSelect
              label="Business Stage"
              options={["Idea / Pre-revenue", "MVP / Early Stage", "Growth Phase", "Scale / Enterprise"]}
              value={persona.businessStage}
              onChange={(v) => update("businessStage", v)}
            />
            <WebsiteScraper
              url={persona.websiteUrl}
              onUrlChange={(v) => update("websiteUrl", v)}
              onScraped={(data) => update("scrapedWebsiteData", data)}
            />
            {persona.scrapedWebsiteData && (
              <div className="mt-3 p-4 bg-[#0052FF]/5 border border-[#0052FF]/15 rounded-2xl">
                <p className="text-[11px] font-bold text-[#0052FF] mb-1 uppercase tracking-widest">Extracted from Website</p>
                <p className="text-[12px] text-slate-600 leading-relaxed line-clamp-4">{persona.scrapedWebsiteData}</p>
              </div>
            )}
            <MultiSelectDropdown
              label="Brand Archetype"
              options={["Hero", "Sage", "Rebel", "Magician", "Caregiver", "Everyman", "Creator", "Ruler", "Jester", "Lover", "Explorer", "Outlaw"]}
              selected={persona.brandArchetype}
              onChange={(v) => update("brandArchetype", v)}
              placeholder="Select archetypes..."
              hint="The character archetype your brand embodies"
            />
          </div>
        );

      case 2:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-400">
            <MultiSelectDropdown
              label="Audience Role / Job Title"
              options={["Founder / CEO", "Marketing Manager", "Product Manager", "Developer / Engineer", "Designer", "Sales Rep", "Consultant", "Coach / Trainer", "Freelancer", "Student", "Executive / C-Suite", "Small Business Owner", "Content Creator", "HR Professional", "Finance / Accounting"]}
              selected={persona.audienceRole}
              onChange={(v) => update("audienceRole", v)}
              placeholder="Select audience roles..."
            />
            <MultiSelectDropdown
              label="Audience Segments"
              options={["Early-stage founders", "Bootstrapped entrepreneurs", "VC-backed startups", "Agency owners", "Freelancers", "Remote workers", "Mid-market companies", "Enterprise teams", "B2B buyers", "B2C consumers", "Tech-savvy users", "Non-technical users", "Side hustlers", "Career changers", "Solopreneurs"]}
              selected={persona.audienceSegments}
              onChange={(v) => update("audienceSegments", v)}
              placeholder="Select audience segments..."
              hint="Who specifically makes up your audience?"
            />
            <MultiSelectDropdown
              label="Their Biggest Pain Points"
              options={["No time to create content", "Inconsistent posting", "Low engagement", "Hard to stand out", "No clear strategy", "Limited budget", "Finding the right audience", "Measuring ROI", "Scaling content production", "Writer's block / creativity"]}
              selected={persona.painPoints}
              onChange={(v) => update("painPoints", v)}
              placeholder="Select pain points..."
              hint="What keeps them up at night?"
            />
            <MultiSelectDropdown
              label="What They Ultimately Want"
              options={["Build a large following", "Generate consistent leads", "Become a thought leader", "Grow revenue", "Launch a successful product", "Build brand recognition", "Grow a community", "Land speaking opportunities", "Get press coverage", "Attract investors"]}
              selected={persona.audienceDesiredOutcome}
              onChange={(v) => update("audienceDesiredOutcome", v)}
              placeholder="Select desired outcomes..."
              hint="The transformation they desire"
            />
            <MultiSelectDropdown
              label="Audience Goals"
              options={["Learn new skills", "Generate leads", "Attract funding", "Build community", "Automate workflows", "Find clients", "Career growth", "Launch a product", "Save time", "Reduce costs", "Scale their business", "Build authority", "Land a job", "Grow their audience"]}
              selected={persona.audienceGoals}
              onChange={(v) => update("audienceGoals", v)}
              placeholder="Select goals..."
            />
          </div>
        );

      case 3:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-400">
            <MultiSelectDropdown
              label="Products & Services"
              options={["SaaS product", "Coaching / consulting", "Online course", "Agency services", "Physical product", "Digital downloads", "Membership / community", "Freelance services", "Events / workshops", "Newsletter / media"]}
              selected={persona.productsServices}
              onChange={(v) => update("productsServices", v)}
              placeholder="Select what you offer..."
            />
            <MultiSelectDropdown
              label="Your Unique POV"
              options={["AI will replace most marketers", "Authenticity beats polish", "Niche beats broad every time", "Consistency beats virality", "Data beats intuition", "Community beats audience", "Short-form is king", "Video is not optional anymore", "Personal brand is the best business card"]}
              selected={persona.uniquePOV}
              onChange={(v) => update("uniquePOV", v)}
              placeholder="Select your POV..."
              hint="Your contrarian take — the more specific, the better"
            />
            <MultiSelectDropdown
              label="Credibility Signals"
              options={["10+ years experience", "500+ clients served", "Featured in major press", "100K+ followers", "Generated $1M+ revenue", "Award-winning", "Published author", "TEDx speaker", "University degree", "Industry certification", "Built a successful exit"]}
              selected={persona.credibilitySignals}
              onChange={(v) => update("credibilitySignals", v)}
              placeholder="Select credibility signals..."
            />
            <MultiSelectDropdown
              label="Primary Goals"
              options={["Build Authority", "Generate Leads", "Sell Products", "Drive Traffic", "Recruit Talent", "Grow Community", "Educate Audience", "Build Brand Awareness", "Nurture Existing Customers"]}
              selected={persona.primaryObjective}
              onChange={(v) => update("primaryObjective", v)}
              placeholder="Select your goals..."
            />
            <MultiSelectDropdown
              label="Conversion Goal"
              options={["Book a discovery call", "Download a lead magnet", "Sign up for newsletter", "Buy a product/course", "Follow on social", "Join community", "Watch a demo", "Book a workshop", "Request a quote"]}
              selected={persona.conversionGoal}
              onChange={(v) => update("conversionGoal", v)}
              placeholder="Select conversion goals..."
            />
          </div>
        );

      case 4:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-400">
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl mb-6">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-5">Tone Sliders — drag to calibrate your voice</p>
              <ToneSlider leftLabel="Formal" rightLabel="Casual" value={persona.toneSliders.formalCasual} onChange={(v) => update("toneSliders", { ...persona.toneSliders, formalCasual: v })} />
              <ToneSlider leftLabel="Serious" rightLabel="Playful" value={persona.toneSliders.seriousPlayful} onChange={(v) => update("toneSliders", { ...persona.toneSliders, seriousPlayful: v })} />
              <ToneSlider leftLabel="Inspiring" rightLabel="Informative" value={persona.toneSliders.inspiringInformative} onChange={(v) => update("toneSliders", { ...persona.toneSliders, inspiringInformative: v })} />
              <ToneSlider leftLabel="Data-Driven" rightLabel="Storytelling" value={persona.toneSliders.dataDriven} onChange={(v) => update("toneSliders", { ...persona.toneSliders, dataDriven: v })} />
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Writing Style</p>
            <div className="flex gap-3 mb-6">
              {["First Person (I/Me)", "Third Person (They/Their)", "Brand Voice (We/Our)"].map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => update("writingStyle", style)}
                  className={`flex-1 py-3 rounded-2xl font-bold text-[12px] transition-all border ${
                    persona.writingStyle === style
                      ? "bg-[#0052FF] text-white border-[#0052FF] shadow-md shadow-blue-200"
                      : "bg-white text-slate-500 border-slate-200 hover:border-[#0052FF]/30"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
            <FormSelect label="Emoji Usage" options={["None (Strict)", "Minimal (1–2 per post)", "Moderate (3–5 per post)", "Heavy Emoji User"]} value={persona.emojiUsage} onChange={(v) => update("emojiUsage", v)} />
            <FormSelect label="Influencer Style" options={["Gary Vee", "Alex Hormozi", "Brené Brown", "Simon Sinek", "Naval Ravikant", "MrBeast", "Sahil Bloom", "Justin Welsh", "Lenny Rachitsky", "Codie Sanchez", "Mark Manson", "Tim Ferriss", "James Clear", "Ann Handley", "Seth Godin"]} value={persona.influencerStyle} onChange={(v) => update("influencerStyle", v)} />
            
            <div className="mb-5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Real Writing Samples
              </label>
              <p className="text-[11px] text-slate-400 mb-2">
                Paste 1–3 of your actual posts or writing examples here. The more authentic, the better...
              </p>
              <p className="text-[11px] text-slate-400 mb-2">
                This is the most powerful input. Your AI will match your exact voice.
              </p>
              <textarea
                placeholder="Paste 1–3 of your actual posts or writing examples here. The more authentic, the better..."
                value={persona.writingSamples}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.length <= 3000) update("writingSamples", val);
                }}
                maxLength={3000}
                className="w-full px-5 py-3.5 rounded-2xl border-none bg-[#F8FAFC] focus:bg-white focus:ring-2 focus:ring-[#0052FF]/20 focus:shadow-[0_4px_20px_rgba(0,82,255,0.05)] outline-none transition-all text-[13px] font-medium text-[#1A1D23] placeholder:text-slate-400 resize-none h-40"
              />
              {persona.writingSamples.length > 0 && (
                <div className="text-right mt-1 text-slate-400 text-[11px]">
                  {persona.writingSamples.length} / 3000 characters
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-400">
            <MultiSelectDropdown
              label="Content Themes"
              options={["AI & Tech", "Business Strategy", "Personal Growth", "Design & UX", "Marketing Tips", "Startup Stories", "Finance", "Health & Wellness", "Productivity", "Culture", "Leadership", "Sales", "Entrepreneurship", "Future of Work", "SaaS & Software"]}
              selected={persona.contentThemes}
              onChange={(v) => update("contentThemes", v)}
              placeholder="Select content themes..."
            />
            <MultiSelectDropdown
              label="Preferred Content Mix"
              options={["Thought Leadership", "How-to Guides", "Memes / Humor", "Case Studies", "Behind-the-Scenes", "Video Shorts", "Newsletters", "Personal Stories", "Data & Insights", "Product Updates", "Polls & Questions", "Listicles", "Controversial Takes"]}
              selected={persona.contentMix}
              onChange={(v) => update("contentMix", v)}
              placeholder="Select content types..."
            />
            <FormSelect label="Posting Frequency" options={["Daily", "3× per week", "Weekly", "Bi-weekly", "Ad-hoc"]} value={persona.postingFrequency} onChange={(v) => update("postingFrequency", v)} />
            <MultiSelectDropdown
              label="Core Values"
              options={["Innovation", "Transparency", "Growth", "Trust", "Impact", "Excellence", "Fun", "Authenticity", "Sustainability", "Diversity", "Community", "Education", "Integrity", "Creativity", "Simplicity"]}
              selected={persona.coreValues}
              onChange={(v) => update("coreValues", v)}
              placeholder="Select core values..."
            />
            <MultiSelectDropdown
              label="Topics to Avoid"
              options={["Politics", "Religion", "Competitor mentions", "Controversial social issues", "Personal finance advice", "Medical advice", "Legal advice", "Negative industry talk", "Pricing details"]}
              selected={persona.doNotTalk}
              onChange={(v) => update("doNotTalk", v)}
              placeholder="Select topics to avoid..."
            />
          </div>
        );

      case 6: {
        const FALLBACK_FONTS = ["DM Sans", "Inter", "Lato", "Merriweather", "Montserrat", "Nunito", "Open Sans", "Playfair Display", "Poppins", "Raleway", "Roboto", "Rubik", "Space Grotesk", "Ubuntu", "Work Sans"];
        const fontList = googleFonts.length > 0 ? googleFonts : FALLBACK_FONTS;
        const filteredFonts = fontList
          .filter((f) => f.toLowerCase().includes(fontSearch.toLowerCase()))
          .slice(0, 120);

        const loadFontPreview = (fontName: string) => {
          const id = `gf-${fontName.replace(/\s+/g, "-")}`;
          if (document.getElementById(id)) return;
          const link = document.createElement("link");
          link.id = id;
          link.rel = "stylesheet";
          link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName).replace(/%20/g, "+")}:wght@400;600&display=swap`;
          document.head.appendChild(link);
        };

        const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onloadend = () => update("logoUrl", reader.result as string);
          reader.readAsDataURL(file);
        };
        const addColor = () => {
          if (persona.colorPalette.length < 5) {
            update("colorPalette", [...persona.colorPalette, "#0052FF"]);
          }
        };
        const updateColor = (i: number, val: string) => {
          const next = [...persona.colorPalette];
          next[i] = val;
          update("colorPalette", next);
          if (i === 0) update("brandColorHex", val);
        };
        const removeColor = (i: number) => {
          const next = persona.colorPalette.filter((_, idx) => idx !== i);
          update("colorPalette", next);
          if (i === 0 && next.length > 0) update("brandColorHex", next[0]);
        };

        return (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-400 space-y-8">

            {/* Logo Upload */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                Brand Logo
              </label>
              <input
                ref={logoFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              {persona.logoUrl ? (
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl border border-slate-200 bg-[#F8FAFC] flex items-center justify-center overflow-hidden shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={persona.logoUrl} alt="Brand logo" className="max-w-full max-h-full object-contain p-2" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-bold text-[#0052FF] bg-[#0052FF]/10 hover:bg-[#0052FF]/20 transition-all border-none"
                    >
                      <Upload size={12} /> Replace Logo
                    </button>
                    <button
                      type="button"
                      onClick={() => update("logoUrl", "")}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-bold text-slate-500 bg-slate-100 hover:bg-red-50 hover:text-red-500 transition-all border-none"
                    >
                      <X size={12} /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center w-full h-28 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#0052FF] hover:bg-[#0052FF]/5 transition-all text-slate-400 hover:text-[#0052FF] gap-2 group"
                >
                  <Upload size={22} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[12px] font-bold">Upload Logo</span>
                  <span className="text-[11px] font-medium">PNG, JPG, SVG — max 2MB</span>
                </button>
              )}
            </div>

            {/* Color Palette */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                Brand Colors <span className="normal-case font-medium text-slate-400">(up to 5)</span>
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {persona.colorPalette.map((color, i) => (
                  <div key={i} className="relative group">
                    <div
                      className="w-12 h-12 rounded-full border-2 border-slate-200 shadow-sm overflow-hidden relative cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    >
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => updateColor(i, e.target.value)}
                        className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer opacity-0"
                      />
                    </div>
                    {persona.colorPalette.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColor(i)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    )}
                    <div className="mt-1 text-center text-[9px] font-mono text-slate-400">{color.toUpperCase()}</div>
                  </div>
                ))}
                {persona.colorPalette.length < 5 && (
                  <button
                    type="button"
                    onClick={addColor}
                    className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-[#0052FF] hover:border-[#0052FF] hover:bg-blue-50 transition-all"
                  >
                    <Plus size={18} />
                  </button>
                )}
              </div>
              {persona.colorPalette.length === 0 && (
                <p className="text-[11px] text-slate-400 mt-2">Click + to add your brand colors. First color becomes the primary brand color.</p>
              )}
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                Primary Font
              </label>

              {/* Search box */}
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search 1,400+ Google Fonts…"
                  value={fontSearch}
                  onChange={(e) => setFontSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl border-none bg-[#F8FAFC] focus:bg-white focus:ring-2 focus:ring-[#0052FF]/20 outline-none transition-all text-[13px] font-medium text-[#1A1D23] placeholder:text-slate-400"
                />
              </div>

              {/* Selected font pill */}
              {persona.fontFamily && (
                <div className="flex items-center gap-2 mb-3 px-4 py-2 rounded-full bg-[#0052FF]/10 w-fit">
                  <CheckCircle size={13} className="text-[#0052FF]" />
                  <span
                    className="text-[13px] font-semibold text-[#0052FF]"
                    style={{ fontFamily: persona.fontFamily }}
                  >
                    {persona.fontFamily}
                  </span>
                </div>
              )}

              {/* Font list */}
              {fontsLoading ? (
                <div className="flex items-center justify-center h-20 text-slate-400">
                  <Loader2 size={18} className="animate-spin mr-2" />
                  <span className="text-[13px]">Loading Google Fonts…</span>
                </div>
              ) : (
                <div className="border border-slate-100 rounded-2xl overflow-hidden bg-[#F8FAFC]">
                  <div className="overflow-y-auto" style={{ maxHeight: "280px" }}>
                    {filteredFonts.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-[13px]">No fonts matching &quot;{fontSearch}&quot;</div>
                    ) : (
                      filteredFonts.map((font) => {
                        const isSelected = persona.fontFamily === font;
                        return (
                          <button
                            key={font}
                            type="button"
                            onMouseEnter={() => loadFontPreview(font)}
                            onClick={() => {
                              loadFontPreview(font);
                              update("fontFamily", font);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors border-b border-slate-100 last:border-b-0 ${
                              isSelected
                                ? "bg-[#0052FF]/10 text-[#0052FF]"
                                : "bg-white hover:bg-[#F8FAFC] text-slate-700"
                            }`}
                          >
                            <span
                              className="text-[14px]"
                              style={{ fontFamily: font }}
                            >
                              {font}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-2 shrink-0" style={{ fontFamily: font }}>
                              Aa
                            </span>
                            {isSelected && <CheckCircle size={14} className="text-[#0052FF] ml-2 shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                  {filteredFonts.length === 120 && (
                    <div className="px-4 py-2 text-center text-[11px] text-slate-400 border-t border-slate-100 bg-white">
                      Showing first 120 results — type to filter
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Preview */}
            {(persona.colorPalette.length > 0 || persona.logoUrl) && (
              <div className="p-6 rounded-2xl border border-slate-100 bg-[#F8FAFC]">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Brand Preview</p>
                <div
                  className="rounded-xl p-5 flex items-center gap-4"
                  style={{ backgroundColor: persona.colorPalette[0] || "#0052FF" }}
                >
                  {persona.logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={persona.logoUrl} alt="Logo preview" className="w-12 h-12 object-contain rounded-lg bg-white/20 p-1.5" />
                  )}
                  <div>
                    <p
                      className="text-base font-black"
                      style={{ fontFamily: persona.fontFamily || "Inter", color: "#ffffff" }}
                    >
                      {persona.personaName || "Your Brand"}
                    </p>
                    <p
                      className="text-[12px] opacity-80"
                      style={{ fontFamily: persona.fontFamily || "Inter", color: "#ffffff" }}
                    >
                      {persona.tagline || "Your brand tagline"}
                    </p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    {persona.colorPalette.slice(1).map((c, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white/30" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 7: {
        const PLATFORMS = [
          { key: "facebook",          name: "Facebook",           subtitle: "Facebook Pages",        color: "#1877F2", emoji: "📘", canDisconnect: true  },
          { key: "instagram",         name: "Instagram",          subtitle: "Instagram Professional", color: "#E1306C", emoji: "📸", canDisconnect: true  },
          { key: "threads",           name: "Threads",            subtitle: "Text-based conversations", color: "#000000", emoji: "🧵", canDisconnect: true  },
          { key: "linkedin",          name: "LinkedIn",           subtitle: "Professional network",  color: "#0A66C2", emoji: "💼", canDisconnect: true  },
          { key: "x",                 name: "X (Twitter)",        subtitle: "Real-time social",      color: "#000000", emoji: "🐦", canDisconnect: true  },
          { key: "pinterest",         name: "Pinterest",          subtitle: "Visual discovery",      color: "#E60023", emoji: "📌", canDisconnect: true  },
        ];

        const handleDisconnect = async (platformKey: string) => {
          setDisconnecting(platformKey);
          try {
            await fetch("/api/auth/connections", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ platform: platformKey, accountId }),
            });
            // Refresh
            const res = await fetch(`/api/auth/connections?accountId=${accountId}`);
            const data = await res.json();
            if (data.connections) setConnections(data.connections);
          } catch { /* ignore */ } finally {
            setDisconnecting(null);
          }
        };

        return (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-400 space-y-4">
            <p className="text-[13px] text-slate-500 font-medium -mt-2 mb-6">
              Connect your social accounts to enable direct publishing from this persona.
            </p>

            {connectionsLoading ? (
              <div className="flex items-center gap-2 text-slate-400 py-8 justify-center">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-[13px]">Loading connections…</span>
              </div>
            ) : (
              PLATFORMS.map((platform) => {
                const conn = connections.find((c) => c.platform === platform.key);
                const isConnected = !!conn;
                return (
                  <div
                    key={platform.key}
                    className={`flex items-center gap-4 p-5 rounded-2xl bg-white border transition-all ${
                      isConnected
                        ? "border-l-4 shadow-sm"
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                    style={isConnected ? { borderLeftColor: platform.color, borderLeftWidth: "4px" } : {}}
                  >
                    {/* Icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: `${platform.color}15` }}
                    >
                      {platform.emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-[#1A1D23]">{platform.name}</p>
                      <p className="text-[12px] text-slate-400">
                        {isConnected && conn?.platformUsername
                          ? <span className="text-green-600 font-semibold">Connected as @{conn.platformUsername}</span>
                          : isConnected
                          ? <span className="text-green-600 font-semibold">Connected</span>
                          : platform.subtitle}
                      </p>
                    </div>

                    {/* Action */}
                    {isConnected ? (
                      <button
                        type="button"
                        onClick={() => platform.canDisconnect && handleDisconnect(platform.key)}
                        disabled={!platform.canDisconnect || disconnecting === platform.key}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold text-slate-500 bg-slate-100 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none shrink-0"
                      >
                        {disconnecting === platform.key
                          ? <><Loader2 size={12} className="animate-spin" /> Disconnecting…</>
                          : <><Link2Off size={12} /> Disconnect</>}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { window.open(`/api/auth/${platform.key}?accountId=${accountId}`, '_blank'); }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold text-white transition-all hover:opacity-90 active:scale-95 border-none shrink-0"
                        style={{ backgroundColor: platform.color }}
                      >
                        <Link2 size={12} /> Connect
                      </button>
                    )}
                  </div>
                );
              })
            )}

            <p className="text-[11px] text-slate-400 pt-2">
              Connecting an account stores an access token securely. You can disconnect at any time.
            </p>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#E8ECF2] pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* ── LEFT COLUMN ── */}
        <div>

          {/* Step Progress Bar */}
          <div className="hidden md:flex items-center mb-6 bg-white rounded-full px-8 py-5 shadow-[0_4px_30px_rgba(0,0,0,0.02)] border-none overflow-hidden gap-2">
            {personaSteps.map((step, idx) => {
              const isDone = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-2xl transition-all shrink-0 border-none ${
                      isActive ? "bg-[#0052FF]/5 shadow-[0_4px_20px_rgba(0,82,255,0.05)]" : "hover:bg-[#F8FAFC] hover:shadow-sm"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-none text-[12px] font-black transition-all ${
                      isDone
                        ? "bg-[#0052FF] text-white shadow-[0_4px_16px_rgba(0,82,255,0.3)]"
                        : isActive
                        ? "bg-[#0052FF]/10 text-[#0052FF] ring-4 ring-[#0052FF]/5"
                        : "text-slate-400 bg-[#F8FAFC]"
                    }`}>
                      {isDone ? <BsCheckCircleFill size={14} /> : step.id}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest hidden lg:block ${
                      isActive ? "text-[#0052FF]" : isDone ? "text-slate-500" : "text-slate-400"
                    }`}>
                      {step.label}
                    </span>
                  </button>
                  {idx < personaSteps.length - 1 && (
                    <div className={`h-1.5 flex-1 mx-2 min-w-[20px] rounded-full transition-all ${
                      currentStep > step.id ? "bg-[#0052FF]" : "bg-[#F8FAFC]"
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
            {/* Step Header */}
            <div className="mb-10">
              <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#0052FF] bg-[#0052FF]/10 px-4 py-2 rounded-full mb-4">
                <Sparkles size={12} strokeWidth={3} />
                Step {currentStep} / {totalSteps}
              </span>
              <h2 className="text-3xl font-black text-[#1A1D23] tracking-tight mb-2">{activeStepData.title}</h2>
              <p className="text-slate-500 text-[15px] font-medium">{activeStepData.description}</p>
            </div>

            {/* Step Form */}
            <div className="min-h-[380px]">{renderStepContent()}</div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-[14px] transition-all border-none ${
                  currentStep === 1
                    ? "text-slate-400 bg-transparent cursor-not-allowed"
                    : "text-slate-500 bg-[#F8FAFC] hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:text-[#1A1D23]"
                }`}
              >
                <BsChevronLeft size={12} strokeWidth={1.5} /> Back
              </button>

              <div className="flex items-center gap-4">
                {saveError && (
                  <span className="text-[12px] font-bold text-red-500 bg-red-50 px-4 py-2 rounded-full">{saveError}</span>
                )}
                {saved && (
                  <span className="flex items-center gap-2 text-[12px] font-bold text-green-700 bg-green-50 px-4 py-2 rounded-full">
                    <CheckCircle size={14} /> Persona saved!
                  </span>
                )}
                
                {/* Save Progress Button (Secondary) */}
                {currentStep < totalSteps && (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-[13px] text-[#0052FF] bg-[#0052FF]/10 hover:bg-[#0052FF]/20 transition-all disabled:opacity-70 border-none"
                  >
                    {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Save Progress"}
                  </button>
                )}

                {currentStep === totalSteps ? (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2.5 px-8 py-3.5 rounded-full font-black text-[14px] text-white bg-[#0052FF] hover:bg-blue-600 shadow-[0_8px_30px_rgba(0,82,255,0.4)] transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 border-none"
                  >
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><BsStarFill size={14} /> Finish & Save Persona</>}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2.5 px-8 py-3.5 rounded-full font-black text-[14px] text-white bg-[#0052FF] hover:bg-blue-600 shadow-[0_8px_30px_rgba(0,82,255,0.4)] transition-all hover:-translate-y-0.5 active:translate-y-0 border-none"
                  >
                    Continue <ArrowRight size={16} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
