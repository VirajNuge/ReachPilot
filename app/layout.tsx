// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Chatbot from "./components/Chatbot/Chatbot";

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
      <body suppressHydrationWarning>
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
