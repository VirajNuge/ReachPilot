import { NextRequest, NextResponse } from "next/server";

// We define what a "Question" looks like so the code stays organized
interface MinedQuestion {
  id: string;
  source: "reddit" | "quora" | "google";
  title: string;
  snippet: string;
  metrics: { upvotes: number; comments: number };
  painLevel: "Critical" | "High" | "Medium";
  timestamp: string;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Get the keyword and sources from the frontend
    const { keyword, sources } = await req.json();

    // 2. Security Check: Ensure the keyword isn't empty
    if (!keyword || keyword.length < 3) {
      return NextResponse.json({ error: "Keyword too short" }, { status: 400 });
    }

    const allQuestions: MinedQuestion[] = [];

    // 3. Conditional Mining: Only search sources the user checked
    if (sources.includes("reddit")) {
      const redditResults = await mineReddit(keyword);
      allQuestions.push(...redditResults);
    }
    if (sources.includes("quora")) {
      const quoraResults = await mineQuora(keyword);
      allQuestions.push(...quoraResults);
    }

    if (sources.includes("google")) {
      const googleResults = await mineGoogle(keyword);
      allQuestions.push(...googleResults);
    }
    // 4. Send the final list back to the frontend
    return NextResponse.json({ questions: allQuestions });
  } catch (error) {
    console.error("Mining Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// --- REDDIT LOGIC ---
async function mineReddit(keyword: string): Promise<MinedQuestion[]> {
  // We use Reddit's free .json feature to search
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(
    keyword
  )}&limit=10`;

  const response = await fetch(url, {
    headers: { "User-Agent": "ReachPilot/1.0" }, // Reddit blocks empty "User-Agents"
  });

  if (!response.ok) return [];

  const data = await response.json();
  const posts = data?.data?.children || [];

  return posts.map((post: any) => ({
    id: `reddit-${post.data.id}`,
    source: "reddit",
    title: post.data.title,
    snippet:
      post.data.selftext?.substring(0, 200) || "No description provided.",
    metrics: {
      upvotes: post.data.ups || 0,
      comments: post.data.num_comments || 0,
    },
    // We calculate "Pain Level" based on how many people are talking about it
    painLevel: post.data.ups > 100 ? "Critical" : "High",
    timestamp: "Recent",
  }));
}
async function mineGoogle(keyword: string): Promise<MinedQuestion[]> {
  const serpApiKey = process.env.SERP_API_KEY;
  if (!serpApiKey) return [];

  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
    keyword
  )}&api_key=${serpApiKey}`;

  const response = await fetch(url);
  if (!response.ok) return [];

  const data = await response.json();
  const paaQuestions = data?.related_questions || [];

  return paaQuestions.map((q: any, index: number) => ({
    id: `google-paa-${index}`,
    source: "google",
    title: q.question,
    snippet: q.snippet || "High-intent search query from Google.",
    metrics: { upvotes: 0, comments: 0 },
    painLevel: "High",
    timestamp: "Trending",
  }));
}
async function mineQuora(keyword: string): Promise<MinedQuestion[]> {
  const serpApiKey = process.env.SERP_API_KEY;
  if (!serpApiKey) return [];

  // This "site:quora.com" operator forces Google to only find Quora links
  const query = `site:quora.com ${keyword}`;
  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
    query
  )}&api_key=${serpApiKey}`;

  const response = await fetch(url);
  if (!response.ok) return [];

  const data = await response.json();
  const results = data?.organic_results || [];

  return results.map((r: any, index: number) => ({
    id: `quora-${index}`,
    source: "quora",
    title: r.title,
    snippet: r.snippet || "Quora discussion thread.",
    metrics: { upvotes: 0, comments: 0 },
    painLevel: "Medium",
    timestamp: "Recent",
  }));
}
