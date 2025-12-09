"use client";

import React, { useState } from "react";
import TopMenu from "../../components/topMenu/topMenu";
import {
  BsChevronRight,
  BsChevronLeft,
  BsCheckCircleFill,
  BsFacebook,
  BsTwitterX,
  BsLinkedin,
  BsGoogle,
  BsZoomIn,
  BsEnvelopeFill,
  BsPaletteFill,
  BsEmojiSmile,
  BsChatQuoteFill,
} from "react-icons/bs";

// --- 1. CONFIGURATION DATA ---

const personaSteps = [
  {
    id: 1,
    title: "Identity & Basics",
    description: "Name, role, and core details.",
  },
  {
    id: 2,
    title: "Target Audience",
    description: "Demographics and pain points.",
  },
  {
    id: 3,
    title: "Brand Objectives",
    description: "Goals and conversion targets.",
  },
  {
    id: 4,
    title: "Tone & Voice",
    description: "How your persona communicates.",
  },
  { id: 5, title: "Brand Personality", description: "Archetypes and values." },
  {
    id: 6,
    title: "Content Inspiration",
    description: "Topics and influencers.",
  },
  {
    id: 7,
    title: "Engagement Style",
    description: "How they interact with others.",
  },
  { id: 8, title: "Connections", description: "Integrations and platforms." },
];

// --- 2. REUSABLE FORM COMPONENTS ---

const FormInput = ({ label, placeholder, type = "text" }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-bold text-gray-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
    />
  </div>
);

const FormTextArea = ({ label, placeholder, height = "h-24" }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-bold text-gray-700 mb-2">
      {label}
    </label>
    <textarea
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm resize-none ${height}`}
    />
  </div>
);

const FormSelect = ({ label, options }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-bold text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm appearance-none bg-white">
        <option value="" disabled selected>
          Select an option
        </option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <BsChevronRight className="rotate-90" size={12} />
      </div>
    </div>
  </div>
);

const TagGroup = ({ label, tags }: { label: string; tags: string[] }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const toggleTag = (tag: string) => {
    if (selected.includes(tag)) setSelected(selected.filter((t) => t !== tag));
    else setSelected([...selected, tag]);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-gray-700 mb-3">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isActive = selected.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border
                ${
                  isActive
                    ? "bg-blue-100 text-blue-700 border-blue-200"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }
              `}
            >
              {isActive && "✓ "}
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ToneSlider = ({ leftLabel, rightLabel }: any) => (
  <div className="mb-6 flex items-center gap-4 text-xs font-semibold text-gray-600">
    <span className="w-20 text-right">{leftLabel}</span>
    <input
      type="range"
      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
    />
    <span className="w-20">{rightLabel}</span>
  </div>
);

const IntegrationCard = ({ icon, name, connected = false }: any) => (
  <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
    <div className="flex items-center gap-3">
      <div
        className={`p-2 rounded-lg ${
          connected ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-500"
        }`}
      >
        {icon}
      </div>
      <span className="font-bold text-gray-800 text-sm">{name}</span>
    </div>
    <button
      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
        connected
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {connected ? "Connected" : "Connect"}
    </button>
  </div>
);

// --- 3. MAIN COMPONENT ---

export default function AccountPersona() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = personaSteps.length;
  const progressPercentage = Math.round(((currentStep - 1) / totalSteps) * 100);
  const activeStepData = personaSteps.find((step) => step.id === currentStep);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Identity
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="col-span-2">
              <FormInput
                label="Persona Name"
                placeholder="e.g., Tech Thought Leader"
              />
            </div>
            <FormSelect
              label="User Role"
              options={["Founder", "Marketer", "Creator", "Sales"]}
            />
            <FormSelect
              label="Industry/Niche"
              options={["SaaS", "E-commerce", "Health", "Fintech"]}
            />
            <div className="col-span-2">
              <FormInput
                label="Tagline / One-liner"
                placeholder="Helping startups scale..."
              />
            </div>
            <FormInput label="Website URL" placeholder="https://" />
            <FormSelect
              label="Business Stage"
              options={["Idea", "MVP", "Growth", "Scale"]}
            />
          </div>
        );

      case 2: // Target Audience
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TagGroup
              label="Audience Segments"
              tags={[
                "CXOs",
                "SMB Owners",
                "Students",
                "Freelancers",
                "Marketing Managers",
                "Developers",
              ]}
            />
            <div className="grid grid-cols-3 gap-4 mb-6">
              <FormSelect
                label="Age Range"
                options={["18-24", "25-34", "35-44", "45+"]}
              />
              <FormSelect
                label="Region"
                options={["North America", "Europe", "Asia", "Global"]}
              />
              <FormSelect
                label="Education"
                options={["High School", "Undergrad", "Masters", "PhD"]}
              />
            </div>
            <FormTextArea
              label="Pain Points"
              placeholder="What keeps them up at night?"
            />
            <TagGroup
              label="Audience Goals"
              tags={[
                "Learn new skills",
                "Generate leads",
                "Attract funding",
                "Build community",
                "Automate workflows",
              ]}
            />
          </div>
        );

      case 3: // Brand Objectives
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TagGroup
              label="Primary Objective"
              tags={[
                "Build Authority",
                "Generate Leads",
                "Sell Products",
                "Drive Traffic",
                "Recruit Talent",
              ]}
            />
            <TagGroup
              label="Conversion Targets"
              tags={["Sign-ups", "Calls", "Downloads", "Purchases", "Webinars"]}
            />
            <TagGroup
              label="Preferred Content Mix"
              tags={[
                "Thought Leadership",
                "How-to Guides",
                "Memes/Humor",
                "Case Studies",
                "Video Shorts",
              ]}
            />
          </div>
        );

      case 4: // Tone & Voice
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gray-50 p-6 rounded-xl mb-6 border border-gray-100">
              <label className="block text-sm font-bold text-gray-900 mb-4">
                Tone Sliders
              </label>
              <ToneSlider leftLabel="Formal" rightLabel="Casual" />
              <ToneSlider leftLabel="Serious" rightLabel="Playful" />
              <ToneSlider leftLabel="Inspiring" rightLabel="Informative" />
              <ToneSlider leftLabel="Data-Driven" rightLabel="Storytelling" />
            </div>

            <label className="block text-sm font-bold text-gray-700 mb-3">
              Writing Style
            </label>
            <div className="flex gap-4 mb-6">
              <button className="flex-1 py-3 border-2 border-blue-600 bg-blue-50 text-blue-700 font-bold rounded-xl text-sm transition-all shadow-sm">
                First Person (I/Me)
              </button>
              <button className="flex-1 py-3 border border-gray-200 bg-white text-gray-600 font-bold rounded-xl text-sm hover:border-gray-300 transition-all">
                Third Person (They)
              </button>
            </div>
            <TagGroup
              label="Sentence Length"
              tags={["Short & Punchy", "Detailed & Explanatory", "Mixed"]}
            />
          </div>
        );

      case 5: // Brand Personality
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start gap-4 mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <BsPaletteFill className="text-purple-600 mt-1" size={24} />
              <div>
                <h4 className="font-bold text-purple-900 text-sm">
                  Archetype Selection
                </h4>
                <p className="text-xs text-purple-700 mt-1">
                  Choose the character that represents your brand soul.
                </p>
              </div>
            </div>
            <FormSelect
              label="Brand Archetype"
              options={[
                "The Hero",
                "The Sage",
                "The Jester",
                "The Creator",
                "The Ruler",
                "The Caregiver",
              ]}
            />
            <TagGroup
              label="Core Values"
              tags={[
                "Innovation",
                "Sustainability",
                "Transparency",
                "Diversity",
                "Excellence",
                "Fun",
                "Security",
              ]}
            />
            <FormInput
              label="Brand Color Hex (Primary)"
              placeholder="#000000"
            />
          </div>
        );

      case 6: // Content Inspiration
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FormInput
              label="Favorite Influencer to Model"
              placeholder="@ElonMusk, @GaryVee"
            />
            <TagGroup
              label="Content Themes"
              tags={[
                "AI & Tech",
                "Business Strategy",
                "Personal Growth",
                "Design",
                "Marketing Tips",
                "Startup Stories",
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Posting Frequency"
                options={["Daily", "3x Week", "Weekly", "Ad-hoc"]}
              />
              <FormSelect
                label="Content Depth"
                options={["Surface/Viral", "Deep Dives", "Mixed"]}
              />
            </div>
            <FormTextArea
              label="Do NOT Talk About"
              placeholder="e.g. Politics, Religion, Competitors..."
              height="h-20"
            />
          </div>
        );

      case 7: // Engagement Style
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start gap-4 mb-6 p-4 bg-green-50 rounded-xl border border-green-100">
              <BsChatQuoteFill className="text-green-600 mt-1" size={24} />
              <div>
                <h4 className="font-bold text-green-900 text-sm">
                  Interaction Rules
                </h4>
                <p className="text-xs text-green-700 mt-1">
                  Define how your AI responds to comments and DMs.
                </p>
              </div>
            </div>
            <TagGroup
              label="Comment Reply Style"
              tags={[
                "Witty",
                "Professional",
                "Emoji-heavy",
                "Short",
                "Question-based",
              ]}
            />
            <FormSelect
              label="Emoji Usage"
              options={[
                "None (Strict)",
                "Minimal (1 per post)",
                "Moderate",
                "Heavy",
              ]}
            />
            <FormSelect
              label="DM Strategy"
              options={["Open to networking", "Sales focused", "Ignore DMs"]}
            />
          </div>
        );

      case 8: // Connections
        return (
          <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <IntegrationCard
              icon={<BsFacebook size={20} />}
              name="Connect Facebook"
              connected={true}
            />
            <IntegrationCard
              icon={<BsTwitterX size={20} />}
              name="Connect X (Twitter)"
            />
            <IntegrationCard
              icon={<BsLinkedin size={20} />}
              name="Connect LinkedIn"
            />
            <IntegrationCard
              icon={<BsGoogle size={20} />}
              name="Connect Google Calendar"
            />
            <IntegrationCard
              icon={<BsZoomIn size={20} />}
              name="Connect Zoom"
            />
            <IntegrationCard
              icon={<BsEnvelopeFill size={20} />}
              name="Connect Gmail"
            />
          </div>
        );

      default:
        return <div>Error loading step.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopMenu
        pageName="Account Persona Builder"
        userName="Robert Downey Jr."
        userTier="Free Tier"
        tokens={2000}
      />

      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        {/* LEFT COLUMN: The Form Area */}
        <div className="flex-1 order-2 lg:order-1">
          {/* Horizontal Step Indicators */}
          <div className="mb-8 hidden md:flex justify-between items-center relative z-0">
            <div className="absolute left-0 top-1/2 h-0.5 w-full bg-gray-200 -z-10"></div>
            {personaSteps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center relative z-10 group cursor-default ${
                  currentStep >= step.id ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm font-bold transition-colors bg-white
                    ${
                      currentStep > step.id
                        ? "border-blue-600 bg-blue-600 text-white"
                        : currentStep === step.id
                        ? "border-blue-600 text-blue-600 ring-4 ring-blue-100 shadow-md"
                        : "border-gray-300 text-gray-500"
                    }`}
                >
                  {currentStep > step.id ? <BsCheckCircleFill /> : step.id}
                </div>
                <span className="text-[10px] mt-2 font-bold uppercase tracking-wide hidden lg:block bg-gray-50 px-1">
                  {step.title.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-8 border-b border-gray-100 pb-4">
              <span className="text-xs uppercase tracking-wider text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">
                Step {currentStep} / {totalSteps}
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mt-3">
                {activeStepData?.title}
              </h2>
              <p className="text-gray-500 mt-1">
                {activeStepData?.description}
              </p>
            </div>

            <div className="min-h-[400px]">{renderStepContent()}</div>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-colors ${
                  currentStep === 1
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <BsChevronLeft size={12} strokeWidth={1} /> Back
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white bg-[#0012FF] hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95"
              >
                {currentStep === totalSteps ? "Finish & Save" : "Continue"}
                {currentStep !== totalSteps && (
                  <BsChevronRight size={12} strokeWidth={1} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Progress & Visuals */}
        <div className="w-full lg:w-[380px] flex-shrink-0 order-1 lg:order-2">
          <div className="sticky top-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Persona Completion
              </h3>

              <div className="flex items-end justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Progress
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {progressPercentage}%
                </span>
              </div>

              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-[#0012FF] rounded-full transition-all duration-700 ease-out relative"
                  style={{
                    width: `${
                      progressPercentage === 0 ? 5 : progressPercentage
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Dynamic Visual Context */}
            <div className="bg-[#F4F6FF] rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-blue-100 relative overflow-hidden group">
              <div className="text-center relative z-10">
                <p className="text-blue-900 font-bold mb-1 text-lg">
                  Visual Context
                </p>
                <p className="text-sm text-blue-600/70">
                  Illustration for <br />"{activeStepData?.title}"
                </p>
                {/* Step-specific icon hint */}
                <div className="mt-4 text-4xl text-blue-300">
                  {currentStep === 1 && <BsEmojiSmile />}
                  {currentStep === 5 && <BsPaletteFill />}
                  {currentStep === 7 && <BsChatQuoteFill />}
                </div>
              </div>

              {/* Decorative animated blobs */}
              <div className="absolute top-10 left-10 w-24 h-24 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce transition-all duration-1000"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse transition-all duration-1000"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
