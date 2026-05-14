// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Chatbot from "./components/Chatbot/Chatbot";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "ReachPilot",
  description: "AI-powered idea generator and social media growth platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  const attrs = ['fdprocessedid'];
  function removeFromNode(node) {
    if (!node || node.nodeType !== 1) return;
    for (const a of attrs) node.removeAttribute && node.removeAttribute(a);
    try {
      node.querySelectorAll && node.querySelectorAll('*').forEach(el => {
        for (const a of attrs) el.removeAttribute && el.removeAttribute(a);
      });
    } catch (e) {}
  }
  try {
    // initial sweep
    document.querySelectorAll && document.querySelectorAll('*').forEach(removeFromNode);
    // guard against extensions that mutate DOM right before hydration
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const n of m.addedNodes || []) removeFromNode(n);
      }
    });
    observer.observe(document.documentElement || document, { childList: true, subtree: true });
    // stop observing shortly after page load
    setTimeout(() => observer.disconnect(), 3000);
  } catch (e) {}
})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          {children}
          <Chatbot />
        </Providers>
      </body>
    </html>
  );
}
