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
    question: "Can ReachPilot publish content for me?",
    answer:
      "ReachPilot helps you plan and schedule content where supported. You remain in control of what is reviewed, edited, and published.",
  },
  {
    question: "What kind of analytics does ReachPilot provide?",
    answer:
      "You can explore profile health, post performance, audience signals, and growth patterns through the analytics features available to your connected accounts.",
  },
  {
    question: "Is my data safe?",
    answer:
      "ReachPilot uses secure authentication and protected storage. Review the Privacy Policy for the current data practices and connected-service details.",
  },
  {
    question: "Is ReachPilot free to use?",
    answer:
      "ReachPilot currently has Starter, Pro, and Agency plans. See the pricing page for the current plan structure and included features.",
  },
  {
    question: "What features are planned for the next release?",
    answer:
      "ReachPilot is evolving continuously. Contact us if you have a workflow or integration that would make the product more useful for you.",
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
          <button onClick={() => toggleFAQ(index)} className="faq-question" aria-expanded={openIndex === index} aria-controls={`faq-answer-${index}`}>
            <span className="faq-question-text">{faq.question}</span>
            <span className={`faq-icon ${openIndex === index ? "open" : ""}`}>
              +
            </span>
          </button>

          <div id={`faq-answer-${index}`} className={`faq-answer ${openIndex === index ? "show" : ""}`}>
            {faq.answer}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQSection;
