import React from "react";
import "./analyzedAccount.css";
import TopMenu from "../../../components/topMenu/topMenu";
import AccStatus from "../../../components/AccStatus/page";
import QkFix from "../../../components/AccQkFix/page";
import AccBio from "../../../components/AccBio/AccBio";

const quickFixes = [
  {
    headline: "Headline",
    description:
      "Your headline doesn’t include industry keywords. Add terms like ‘AI SaaS Growth’.",
    tag: "HIGH IMPACT",
  },
  {
    headline: "About Section",
    description: "Add measurable results or metrics to show real impact.",
    tag: "MEDIUM IMPACT",
  },
  {
    headline: "Profile Photo",
    description: "Use a clear, professional headshot with good lighting.",
    tag: "LOW IMPACT",
  },
  {
    headline: "Experience Details",
    description:
      "Include your key achievements with action verbs and measurable outcomes.",
    tag: "HIGH IMPACT",
  },
  {
    headline: "Skills Section",
    description:
      "Reorder skills by relevance and remove duplicates to highlight core strengths.",
    tag: "MEDIUM IMPACT",
  },
  {
    headline: "Featured Section",
    description:
      "Add projects, links, or case studies to showcase your best work visually.",
    tag: "HIGH IMPACT",
  },
  {
    headline: "Engagement",
    description:
      "Engage with posts weekly to increase visibility and algorithm reach.",
    tag: "LOW IMPACT",
  },
];

const analyzedAccount = () => {
  return (
    <>
      <TopMenu
        pageName="Profile Analyzer"
        userName="Robert Downey Jr."
        userTier="Free Tier"
        tokens={2000}
      />
      <div className="analyzeAccContainer flex gap-[10px] mt-[10px]">
        <div className="analyzeLeft">
          <div className="mb-[10px]">
            <AccStatus
              name="Robert Pattinson"
              title="Sr.UI Designer | Graphic Designer | Brand Designer | Logo Designer | Book Cover Designer"
              image="/images/app/pp.jpg"
              followers={2456}
              projects="500+"
              target={65}
            />
          </div>
          <div className="QkFixContainer">
            <h3 className="font-[500] mb-[12px]">Quick Fixes</h3>
            <div className="custom-scroll">
              {quickFixes.map((fix, index) => (
                <QkFix
                  key={index}
                  headline={fix.headline}
                  description={fix.description}
                  tag={fix.tag}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="analyzeRight bg-[#f9f9f9] w-[1000px] h-[614px] rounded-[12px] p-[12px]">
          <div className="PAna-Container-Left">
            <div>
              <AccBio />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default analyzedAccount;
