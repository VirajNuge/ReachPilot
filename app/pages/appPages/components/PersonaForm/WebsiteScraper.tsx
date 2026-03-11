"use client";

import { useState } from "react";
import { Loader2, CheckCircle, XCircle, Globe } from "lucide-react";
import { BsLightningFill } from "react-icons/bs";

interface WebsiteScraperProps {
  url: string;
  onUrlChange: (v: string) => void;
  onScraped: (data: string) => void;
}

export const WebsiteScraper = ({
  url,
  onUrlChange,
  onScraped,
}: WebsiteScraperProps) => {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleScrape = async () => {
    if (!url.trim()) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/persona/scrape-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scrape failed");
      onScraped(data.summary || "");
      setStatus("success");
      setMessage(data.message || "Brand details extracted successfully!");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to scrape website.");
    }
  };

  return (
    <div className="mb-5">
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
        Website URL
      </label>
      <p className="text-[11px] text-slate-400 mb-2">
        Optionally paste your website and we'll auto-extract brand details.
      </p>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
          <input
            type="url"
            placeholder="https://yourbrand.com"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 outline-none transition-all text-[13px] font-medium text-slate-800 placeholder:text-slate-300 shadow-sm"
          />
        </div>
        <button
          type="button"
          onClick={handleScrape}
          disabled={!url.trim() || status === "loading"}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-[13px] text-white bg-[#0052FF] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_4px_16px_rgba(0,82,255,0.3)] shrink-0 border-none"
        >
          {status === "loading" ? (
            <><Loader2 size={13} className="animate-spin" /> Scraping...</>
          ) : (
            <><BsLightningFill size={12} /> Extract</>
          )}
        </button>
      </div>

      {status === "success" && (
        <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-green-600 bg-green-50 px-3 py-2 rounded-xl border border-green-100">
          <CheckCircle size={12} /> {message}
        </div>
      )}
      {status === "error" && (
        <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-red-500 bg-red-50 px-3 py-2 rounded-xl border border-red-100">
          <XCircle size={12} /> {message}
        </div>
      )}
    </div>
  );
};
