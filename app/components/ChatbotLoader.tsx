"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

// Lazy-load Chatbot — deferred until after shell paints, ssr: false allowed in Client Components
const Chatbot = dynamic(() => import("./Chatbot/Chatbot"), {
  ssr: false,
  loading: () => null,
});

export default function ChatbotLoader() {
  const pathname = usePathname();
  const isAppRoute =
    pathname === "/account" ||
    pathname.startsWith("/pages/appPages/") ||
    /^\/(?:\d+|[a-f0-9]{24})(?:\/|$)/i.test(pathname);

  if (!isAppRoute) return null;

  return <Chatbot />;
}
