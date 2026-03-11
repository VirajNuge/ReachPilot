"use client";
import React, { useState } from "react";
import "./faq.css";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is ReachPilot?",
    answer:
      "ReachPilot is an AI-powered social media growth and client management platform designed to help professionals, freelancers, and agencies grow their personal brands, analyze content strategy, and manage clients — all in one place.",
  },
  {
    question: "Who can use ReachPilot?",
    answer:
      "It's built for professionals who use LinkedIn, Twitter (X), and other social platforms to build visibility — including freelancers, consultants, startup founders, and marketing agencies.",
  },
  {
    question: "How is ReachPilot different from other social media tools?",
    answer:
      "Unlike traditional schedulers, ReachPilot integrates AI-driven content analysis, social media analytics, and client management. It doesn’t just show data — it helps you understand growth and convert your audience into clients.",
  },
  {
    question: "Does ReachPilot automatically post for me?",
    answer:
      "Yes. You can schedule your content for LinkedIn, Twitter (X), or email newsletters using the smart calendar and auto-queue system.",
  },
  {
    question: "What kind of analytics does ReachPilot provide?",
    answer:
      "You'll see detailed metrics like post performance, engagement heatmaps, follower growth, and client conversion funnels — all visualized with charts and AI insights.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Yes. ReachPilot uses encrypted storage and secure authentication through Supabase/Firebase. Your social media and client data are never shared or used for AI training.",
  },
  {
    question: "Is ReachPilot free to use?",
    answer:
      "ReachPilot offers a free trial for new users. After the trial, you can choose between a Creator, Pro, or Agency plan depending on your needs.",
  },
  {
    question: "What features are planned for the next release?",
    answer:
      "Upcoming updates include Threads & Instagram integration, Voice-to-post assistant, AI content calendar insights, and an agency workspace with multi-client management.",
  },
];

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className={`faq-item ${openIndex === index ? "active" : ""}`}
        >
          <button onClick={() => toggleFAQ(index)} className="faq-question">
            <span className="faq-question-text">{faq.question}</span>
            <span className={`faq-icon ${openIndex === index ? "open" : ""}`}>
              +
            </span>
          </button>

          <div className={`faq-answer ${openIndex === index ? "show" : ""}`}>
            {faq.answer}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQSection;
