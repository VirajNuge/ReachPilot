"use client";

import dynamic from "next/dynamic";

// Lazy-load Chatbot — deferred until after shell paints, ssr: false allowed in Client Components
const Chatbot = dynamic(() => import("./Chatbot/Chatbot"), {
  ssr: false,
  loading: () => null,
});

export default function ChatbotLoader() {
  return <Chatbot />;
}
