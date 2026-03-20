/**
 * Seed script: 12 default caption template bundles (one per category).
 * Run with: npx ts-node --project tsconfig.json scripts/seedCaptionTemplates.ts
 *
 * Requires MONGO_URI in environment (e.g. via .env.local loaded with dotenv).
 */

import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error("MONGO_URI not set in .env.local");

const COLLECTION = "adminCaptionTemplates";

interface PlatformVariant {
  platform: string;
  structure: string;
  examplePost?: string;
  characterLimit?: number;
}

interface CaptionTemplateSeed {
  name: string;
  description: string;
  category: string;
  platforms: string[];
  platformVariants: PlatformVariant[];
  isBundle: boolean;
  matchKeywords: string[];
  bestForObjectives: string[];
  isActive: boolean;
  sortOrder: number;
}

const TEMPLATES: CaptionTemplateSeed[] = [
  // ── 1. How To ─────────────────────────────────────────────────────────────
  {
    name: "How-To Guide Bundle",
    description: "Step-by-step instructional posts that teach your audience a specific skill or process.",
    category: "how_to",
    platforms: ["linkedin", "x", "instagram_post", "facebook"],
    platformVariants: [
      {
        platform: "linkedin",
        structure:
          "Hook: Start with a relatable problem or surprising stat (1–2 sentences).\n" +
          "Setup: Briefly explain why mastering this matters for professionals.\n" +
          "Steps: Number each step clearly (3–7 steps). Keep each step to 1–2 sentences.\n" +
          "Pro Tip: Add one advanced insight or common mistake to avoid.\n" +
          "CTA: Ask readers to share their own approach or save this post.\n" +
          "Format: Use line breaks between steps. 1,300–1,800 characters ideal.",
        examplePost:
          "Most people overcomplicate onboarding. Here's how to do it in 5 steps:\n\n1. Send a welcome email the moment they sign up\n2. Give one clear next action — not ten\n3. Check in on day 3 with a genuine question\n4. Share a quick win they can achieve in under 10 minutes\n5. Ask for feedback after week one\n\nPro tip: Automate steps 1–3 so you can focus your energy on 4 and 5.\n\nWhat's your onboarding secret? Drop it below 👇",
        characterLimit: 3000,
      },
      {
        platform: "x",
        structure:
          "Thread format (4–7 tweets).\n" +
          "Tweet 1 (Hook): Bold claim or unexpected insight. End with '🧵'.\n" +
          "Tweets 2–6: One step per tweet. Short, punchy, actionable.\n" +
          "Final tweet: Summary + CTA (follow for more / reply with your tip).\n" +
          "Format: Each tweet under 240 chars. Use numbers to signal sequence.",
        characterLimit: 280,
      },
      {
        platform: "instagram_post",
        structure:
          "Line 1 (Hook): Curiosity-gap opener. Make them tap 'more'.\n" +
          "Body: List 3–5 steps with emojis as bullet points.\n" +
          "Value close: One memorable takeaway sentence.\n" +
          "CTA: 'Save this for later' or tag someone who needs this.\n" +
          "Hashtags: 5–10 niche-specific tags at end.\n" +
          "Format: Short sentences. Lots of white space. 150–300 characters visible before fold.",
        characterLimit: 2200,
      },
      {
        platform: "facebook",
        structure:
          "Conversational opener: Address the reader directly ('If you've ever struggled with…').\n" +
          "Body: Walk through 3–5 steps in plain language. Use bold for step headers.\n" +
          "Story element: Add a brief personal anecdote to build connection.\n" +
          "CTA: Ask a question to drive comments.\n" +
          "Format: Short paragraphs. 150–250 words optimal.",
        characterLimit: 63206,
      },
    ],
    isBundle: true,
    matchKeywords: ["how to", "guide", "tutorial", "steps", "learn", "tips", "walkthrough"],
    bestForObjectives: ["educate", "brand_awareness", "thought_leadership"],
    isActive: true,
    sortOrder: 1,
  },

  // ── 2. Listicle ───────────────────────────────────────────────────────────
  {
    name: "Listicle Bundle",
    description: "Numbered or bulleted list posts that are highly scannable and shareable.",
    category: "listicle",
    platforms: ["linkedin", "x", "instagram_post", "facebook"],
    platformVariants: [
      {
        platform: "linkedin",
        structure:
          "Hook: '[Number] things I wish I knew about [topic]' or 'The [Number] [topic] mistakes most people make'.\n" +
          "List items: 5–10 items. Each gets 1–2 lines of explanation.\n" +
          "Format: Separate each item with a line break. Number them clearly.\n" +
          "Close: A synthesizing sentence that ties the list together.\n" +
          "CTA: 'Which one surprised you most?' or 'What would you add?'",
        characterLimit: 3000,
      },
      {
        platform: "x",
        structure:
          "Single tweet if ≤5 items. Thread if 6+ items.\n" +
          "Tweet 1: The list title as a hook.\n" +
          "Each subsequent tweet: One item with brief context.\n" +
          "Last tweet: 'Which one resonates most? RT if you found this useful.'",
        characterLimit: 280,
      },
      {
        platform: "instagram_post",
        structure:
          "Hook line: 'X [things/ways/reasons] that [outcome]'.\n" +
          "List: 3–7 items, each on its own line with an emoji bullet.\n" +
          "Closing hook: One punchy sentence.\n" +
          "CTA: 'Save this' or 'Tag a [role] who needs this.'\n" +
          "Hashtags: 7–10 at end.",
        characterLimit: 2200,
      },
      {
        platform: "facebook",
        structure:
          "Opener: Relatable question or bold statement.\n" +
          "List: 5–8 items in bold with 1–2 sentence explanations.\n" +
          "Engagement CTA: 'Comment your #1 below.'",
        characterLimit: 63206,
      },
    ],
    isBundle: true,
    matchKeywords: ["list", "tips", "ways", "reasons", "things", "mistakes", "lessons"],
    bestForObjectives: ["educate", "engagement", "brand_awareness"],
    isActive: true,
    sortOrder: 2,
  },

  // ── 3. Thought Leadership ─────────────────────────────────────────────────
  {
    name: "Thought Leadership Bundle",
    description: "Opinion-driven posts that establish authority by sharing a bold, well-argued perspective.",
    category: "thought_leadership",
    platforms: ["linkedin", "x", "instagram_post", "facebook"],
    platformVariants: [
      {
        platform: "linkedin",
        structure:
          "Hook: A contrarian or provocative statement (1 sentence).\n" +
          "Setup: Acknowledge the conventional wisdom you're challenging.\n" +
          "Argument: 3 supporting points with evidence, data, or personal experience.\n" +
          "Nuance: Concede where the other view has merit (builds credibility).\n" +
          "Conclusion: Restate your stance clearly and confidently.\n" +
          "CTA: 'Agree or disagree? Tell me why.'",
        characterLimit: 3000,
      },
      {
        platform: "x",
        structure:
          "Tweet 1: The hot take. Short. Punchy. Slightly provocative.\n" +
          "Thread: 3–5 tweets expanding the argument with evidence.\n" +
          "Final tweet: 'Unpopular opinion? Maybe. But here's why I stand by it.'",
        characterLimit: 280,
      },
      {
        platform: "instagram_post",
        structure:
          "Opening line: Bold claim that creates curiosity.\n" +
          "Body: 3 concise supporting points (1–2 lines each).\n" +
          "Closer: A rallying statement that invites agreement.\n" +
          "CTA: 'Do you agree? Drop a ✅ or ❌ below.'\n" +
          "Hashtags: Thought leadership + niche tags.",
        characterLimit: 2200,
      },
      {
        platform: "facebook",
        structure:
          "Open with a question that challenges assumptions.\n" +
          "Share your perspective in 2–3 paragraphs.\n" +
          "Use a personal story to ground the argument.\n" +
          "Close with an open question to drive discussion.",
        characterLimit: 63206,
      },
    ],
    isBundle: true,
    matchKeywords: ["opinion", "perspective", "unpopular", "hot take", "I believe", "leadership", "industry", "future"],
    bestForObjectives: ["thought_leadership", "brand_awareness", "engagement"],
    isActive: true,
    sortOrder: 3,
  },

  // ── 4. Product Launch ─────────────────────────────────────────────────────
  {
    name: "Product Launch Bundle",
    description: "Announcement posts built to generate excitement, explain value, and drive action for a new product or feature.",
    category: "product_launch",
    platforms: ["linkedin", "x", "instagram_post", "facebook"],
    platformVariants: [
      {
        platform: "linkedin",
        structure:
          "Hook: 'We've been working on something.' OR start with the problem it solves.\n" +
          "Problem: 1–2 sentences on the pain point this addresses.\n" +
          "Solution: Introduce the product/feature with its key benefit.\n" +
          "3 Key Features: Bullet list. Benefit-first language (not feature-first).\n" +
          "Social proof: Beta user quote or early stat if available.\n" +
          "CTA: Link + urgency trigger ('Early access closes Friday').",
        characterLimit: 3000,
      },
      {
        platform: "x",
        structure:
          "Tweet 1: The announcement. Short. Punchy. Link included.\n" +
          "Tweet 2: The problem it solves.\n" +
          "Tweet 3: Top 3 features as a list.\n" +
          "Tweet 4: CTA — try it / sign up / learn more.",
        characterLimit: 280,
      },
      {
        platform: "instagram_post",
        structure:
          "Hook: '✨ [Product] is here!' or 'The wait is over.'\n" +
          "Body: 2–3 sentences on what it does and who it's for.\n" +
          "Features: 3 emoji bullets.\n" +
          "CTA: 'Link in bio' + urgency ('Limited spots').\n" +
          "Hashtags: Product category + launch + brand tags.",
        characterLimit: 2200,
      },
      {
        platform: "facebook",
        structure:
          "Story-driven opener: 'For the past [X months], we've been building…'\n" +
          "What it is: Clear explanation in plain language.\n" +
          "Why it matters: The transformation it enables for the user.\n" +
          "CTA: Comment, share, or click link.\n" +
          "Pin this post for maximum reach.",
        characterLimit: 63206,
      },
    ],
    isBundle: true,
    matchKeywords: ["launch", "new product", "introducing", "announcing", "feature", "release", "now available"],
    bestForObjectives: ["product_launch", "lead_generation", "sales"],
    isActive: true,
    sortOrder: 4,
  },

  // ── 5. Behind the Scenes ──────────────────────────────────────────────────
  {
    name: "Behind the Scenes Bundle",
    description: "Candid, authentic posts showing your process, team, or culture to build trust and connection.",
    category: "behind_the_scenes",
    platforms: ["linkedin", "x", "instagram_post", "facebook"],
    platformVariants: [
      {
        platform: "linkedin",
        structure:
          "Hook: A candid admission or surprising process detail.\n" +
          "The scene: Describe what's actually happening behind the curtain.\n" +
          "What it reveals: The values, decisions, or struggles involved.\n" +
          "Lesson: What this taught you or what you'd do differently.\n" +
          "CTA: 'What does [topic] look like for your team?'",
        characterLimit: 3000,
      },
      {
        platform: "x",
        structure:
          "Tweet 1: One honest, raw sentence about the process.\n" +
          "Thread: 3–4 tweets going deeper into the behind-the-scenes story.\n" +
          "Final tweet: Takeaway + invite replies.",
        characterLimit: 280,
      },
      {
        platform: "instagram_post",
        structure:
          "Hook: 'Here's what [thing] actually looks like.' or 'Nobody shows you this part.'\n" +
          "Body: 3–5 sentences describing the real process.\n" +
          "Humanising detail: A small imperfection or challenge.\n" +
          "CTA: 'What would you like to see more of? Tell me below 👇'\n" +
          "Hashtags: BTS + niche + brand.",
        characterLimit: 2200,
      },
      {
        platform: "facebook",
        structure:
          "Personal opener: Start with 'I want to show you something…'\n" +
          "Describe the scene: What's happening, who's involved.\n" +
          "Why it matters: Connect to your brand's mission or values.\n" +
          "CTA: 'What questions do you have about how we work?'",
        characterLimit: 63206,
      },
    ],
    isBundle: true,
    matchKeywords: ["behind the scenes", "bts", "process", "how we", "team", "day in the life", "real talk"],
    bestForObjectives: ["brand_awareness", "community", "trust"],
    isActive: true,
    sortOrder: 5,
  },

  // ── 6. Testimonial ────────────────────────────────────────────────────────
  {
    name: "Testimonial Bundle",
    description: "Social-proof posts featuring customer results, quotes, or case study highlights.",
    category: "testimonial",
    platforms: ["linkedin", "x", "instagram_post", "facebook"],
    platformVariants: [
      {
        platform: "linkedin",
        structure:
          "Hook: Lead with the result ('[Client] grew revenue 40% in 90 days.').\n" +
          "Context: Who the client is, what challenge they faced.\n" +
          "Quote: 2–3 sentences in their own words (use quotation marks).\n" +
          "What changed: The specific solution or shift that made it happen.\n" +
          "CTA: 'If you're facing [same challenge], let's talk.' + link.",
        characterLimit: 3000,
      },
      {
        platform: "x",
        structure:
          "Tweet 1: The result as a one-liner. Hard numbers if possible.\n" +
          "Tweet 2: The quote.\n" +
          "Tweet 3: What made the difference + CTA.",
        characterLimit: 280,
      },
      {
        platform: "instagram_post",
        structure:
          "Hook: The transformation ('From [before] to [after] in [time].').\n" +
          "Quote: 2–3 sentences in quotation marks.\n" +
          "Result callout: Bold the key metric.\n" +
          "CTA: 'Want results like this? Link in bio.'\n" +
          "Hashtags: Results + niche + social proof tags.",
        characterLimit: 2200,
      },
      {
        platform: "facebook",
        structure:
          "Open with the transformation story in narrative form.\n" +
          "Include a direct quote.\n" +
          "Explain what specifically worked.\n" +
          "CTA: 'Could this work for you? Message us to find out.'",
        characterLimit: 63206,
      },
    ],
    isBundle: true,
    matchKeywords: ["testimonial", "case study", "client", "results", "success story", "review", "proof"],
    bestForObjectives: ["social_proof", "lead_generation", "sales"],
    isActive: true,
    sortOrder: 6,
  },

  // ── 7. Engagement Question ────────────────────────────────────────────────
  {
    name: "Engagement Question Bundle",
    description: "Question-first posts designed to spark discussion and maximise comment volume.",
    category: "engagement_question",
    platforms: ["linkedin", "x", "instagram_post", "facebook"],
    platformVariants: [
      {
        platform: "linkedin",
        structure:
          "The question: Lead with it. Make it specific and relatable to your audience.\n" +
          "Context: 2–3 sentences explaining why you're asking (personal trigger, industry trend, etc.).\n" +
          "Your answer: Share your own take first — it lowers the barrier to reply.\n" +
          "CTA: 'What's your experience?' or 'I'd love to hear your take.'\n" +
          "Format: Keep it under 800 characters for maximum reach.",
        characterLimit: 3000,
      },
      {
        platform: "x",
        structure:
          "Single tweet: The question. Crisp. Under 200 characters.\n" +
          "Optional: Add a poll with 2–4 answer options for easy engagement.",
        characterLimit: 280,
      },
      {
        platform: "instagram_post",
        structure:
          "Hook: The question as the first line (in bold or caps if needed).\n" +
          "Context: 1–2 sentences of setup.\n" +
          "Your answer: Share yours briefly.\n" +
          "CTA: 'Drop your answer below 👇' or 'A or B? Tell me!'\n" +
          "Hashtags: Niche + engagement tags.",
        characterLimit: 2200,
      },
      {
        platform: "facebook",
        structure:
          "Start with the question.\n" +
          "Share a personal story that prompted the question.\n" +
          "Invite multiple answers: 'Option A, B, or something else?'\n" +
          "Reply to every comment within the first hour.",
        characterLimit: 63206,
      },
    ],
    isBundle: true,
    matchKeywords: ["question", "poll", "what do you think", "your opinion", "debate", "curious", "community"],
    bestForObjectives: ["engagement", "community", "brand_awareness"],
    isActive: true,
    sortOrder: 7,
  },

  // ── 8. Personal Story ─────────────────────────────────────────────────────
  {
    name: "Personal Story Bundle",
    description: "Narrative-driven posts that build deep connection by sharing a real experience and the lesson it taught.",
    category: "personal_story",
    platforms: ["linkedin", "x", "instagram_post", "facebook"],
    platformVariants: [
      {
        platform: "linkedin",
        structure:
          "Hook: Start in the middle of the action ('I was about to quit…').\n" +
          "Setup: Brief context — when, where, what was at stake.\n" +
          "Conflict: The problem, failure, or turning point.\n" +
          "Resolution: What happened and what changed.\n" +
          "Lesson: The single, clear takeaway (1–2 sentences).\n" +
          "CTA: 'Has this ever happened to you?' or 'What would you have done?'",
        characterLimit: 3000,
      },
      {
        platform: "x",
        structure:
          "Thread format.\n" +
          "Tweet 1: The story hook — the moment everything changed.\n" +
          "Tweets 2–5: The story beats (context → conflict → resolution).\n" +
          "Final tweet: The lesson in one crisp sentence.",
        characterLimit: 280,
      },
      {
        platform: "instagram_post",
        structure:
          "Hook: Emotional or dramatic opener before the fold.\n" +
          "Story: 3–5 sentences covering the arc.\n" +
          "Lesson: Bold or isolated on its own line.\n" +
          "CTA: 'Share your story below' or 'Tag someone who needs this.'\n" +
          "Hashtags: Personal development + niche tags.",
        characterLimit: 2200,
      },
      {
        platform: "facebook",
        structure:
          "Conversational, first-person narrative.\n" +
          "Let the story breathe — don't rush to the lesson.\n" +
          "Use dialogue if applicable.\n" +
          "End with the lesson and an open invitation to share their own story.",
        characterLimit: 63206,
      },
    ],
    isBundle: true,
    matchKeywords: ["story", "personal", "experience", "lesson", "journey", "I failed", "I learned", "vulnerable"],
    bestForObjectives: ["brand_awareness", "community", "trust", "engagement"],
    isActive: true,
    sortOrder: 8,
  },

  // ── 9. Announcement ───────────────────────────────────────────────────────
  {
    name: "Announcement Bundle",
    description: "Clean, high-signal posts for sharing news — partnerships, milestones, events, or company updates.",
    category: "announcement",
    platforms: ["linkedin", "x", "instagram_post", "facebook"],
    platformVariants: [
      {
        platform: "linkedin",
        structure:
          "Hook: The news in one punchy sentence.\n" +
          "Context: Why this announcement matters (for your audience, not just you).\n" +
          "Details: Who, what, when, where — the specifics.\n" +
          "Impact: What this means going forward.\n" +
          "CTA: 'Read more / Join us / Register here' + link.",
        characterLimit: 3000,
      },
      {
        platform: "x",
        structure:
          "Tweet 1: The news. Punchy. Direct. Link if applicable.\n" +
          "Optional thread: Context + what it means + next steps.",
        characterLimit: 280,
      },
      {
        platform: "instagram_post",
        structure:
          "Hook: '📢 Big news.' or 'Something exciting just happened.'\n" +
          "Body: The announcement in 2–3 clear sentences.\n" +
          "Details: Key facts (date, who, what).\n" +
          "CTA: 'Link in bio for more' or 'Comment [keyword] to get details.'\n" +
          "Hashtags: Event/milestone + brand tags.",
        characterLimit: 2200,
      },
      {
        platform: "facebook",
        structure:
          "Lead with the news clearly.\n" +
          "Explain the backstory briefly.\n" +
          "Share what's next.\n" +
          "CTA: Share this post or tag someone who'd want to know.",
        characterLimit: 63206,
      },
    ],
    isBundle: true,
    matchKeywords: ["announcement", "news", "milestone", "partnership", "event", "launch", "excited to share"],
    bestForObjectives: ["brand_awareness", "product_launch", "community"],
    isActive: true,
    sortOrder: 9,
  },

  // ── 10. Myth Busting ──────────────────────────────────────────────────────
  {
    name: "Myth Busting Bundle",
    description: "Authoritative posts that challenge common misconceptions to position you as the trusted expert.",
    category: "myth_busting",
    platforms: ["linkedin", "x", "instagram_post", "facebook"],
    platformVariants: [
      {
        platform: "linkedin",
        structure:
          "Hook: 'Myth: [False belief]. Here's the truth.'\n" +
          "The Myth: State it clearly — don't strawman it.\n" +
          "Why people believe it: Acknowledge the logic behind the myth.\n" +
          "The truth: Your counter-argument with evidence or experience.\n" +
          "Stakes: Why believing the myth is costly.\n" +
          "CTA: 'What other myths should I bust? Comment below.'",
        characterLimit: 3000,
      },
      {
        platform: "x",
        structure:
          "Tweet 1: 'Myth: [X]. Reality: [Y]. Here's why this matters → 🧵'\n" +
          "Tweets 2–5: Expand the argument with evidence.\n" +
          "Final tweet: The core truth in one sentence.",
        characterLimit: 280,
      },
      {
        platform: "instagram_post",
        structure:
          "Hook: '🚫 Stop believing this [topic] myth.'\n" +
          "Myth + Truth pairs: 2–3 myths, each followed by the truth.\n" +
          "Format: Myth ❌ / Truth ✅ structure.\n" +
          "CTA: 'Which myth surprised you most? Comment below.'\n" +
          "Hashtags: Niche + education + myth tags.",
        characterLimit: 2200,
      },
      {
        platform: "facebook",
        structure:
          "Open with the most common myth you see.\n" +
          "Share why people get it wrong (empathy first).\n" +
          "Bust it with your evidence or experience.\n" +
          "CTA: 'What myths have you had to unlearn?'",
        characterLimit: 63206,
      },
    ],
    isBundle: true,
    matchKeywords: ["myth", "misconception", "wrong", "actually", "truth", "debunk", "common mistake"],
    bestForObjectives: ["thought_leadership", "educate", "brand_awareness"],
    isActive: true,
    sortOrder: 10,
  },

  // ── 11. Motivational ──────────────────────────────────────────────────────
  {
    name: "Motivational Bundle",
    description: "Energising, shareable posts that inspire action and reinforce a growth mindset.",
    category: "motivational",
    platforms: ["linkedin", "x", "instagram_post", "facebook"],
    platformVariants: [
      {
        platform: "linkedin",
        structure:
          "Hook: A short, punchy line that hits an emotional truth.\n" +
          "Expand: 3–5 sentences unpacking the idea with nuance.\n" +
          "Personal connection: Tie it to a real moment or observation.\n" +
          "Actionable close: One concrete thing they can do today.\n" +
          "CTA: 'Who needs to hear this today? Tag them.'",
        characterLimit: 3000,
      },
      {
        platform: "x",
        structure:
          "Single tweet: One powerful sentence. Under 180 characters.\n" +
          "Optional: Add a second tweet expanding with a 'here's how' angle.",
        characterLimit: 280,
      },
      {
        platform: "instagram_post",
        structure:
          "Hook: The core insight on its own line.\n" +
          "Expand: 2–3 sentences adding depth.\n" +
          "Reframe: Flip the conventional view.\n" +
          "CTA: 'Save this for when you need it' or 'Tag someone building something great.'\n" +
          "Hashtags: Motivation + entrepreneurship + niche tags.",
        characterLimit: 2200,
      },
      {
        platform: "facebook",
        structure:
          "Open with the motivational hook.\n" +
          "Tell a brief story that earns the message.\n" +
          "End with an affirmation or call to action.\n" +
          "Encourage sharing: 'Share this if it resonated.'",
        characterLimit: 63206,
      },
    ],
    isBundle: true,
    matchKeywords: ["motivational", "inspire", "mindset", "growth", "perseverance", "win", "keep going"],
    bestForObjectives: ["engagement", "brand_awareness", "community"],
    isActive: true,
    sortOrder: 11,
  },

  // ── 12. Promotional ───────────────────────────────────────────────────────
  {
    name: "Promotional Bundle",
    description: "Direct-response posts designed to drive sales, sign-ups, or offer redemptions.",
    category: "promotional",
    platforms: ["linkedin", "x", "instagram_post", "facebook"],
    platformVariants: [
      {
        platform: "linkedin",
        structure:
          "Hook: Lead with the benefit, not the product ('Stop losing clients to competitors who…').\n" +
          "Problem: The painful status quo your offer fixes.\n" +
          "Offer: What you're selling, clearly stated.\n" +
          "Value stack: 3 bullet points — what they get.\n" +
          "Urgency: Deadline, limited spots, or price increase.\n" +
          "CTA: Clear action + link. ('Book your free call → [link]')",
        characterLimit: 3000,
      },
      {
        platform: "x",
        structure:
          "Tweet 1: The problem + the offer in one tweet.\n" +
          "Tweet 2: The value stack (3 bullets).\n" +
          "Tweet 3: Urgency + CTA + link.",
        characterLimit: 280,
      },
      {
        platform: "instagram_post",
        structure:
          "Hook: The outcome they want ('Imagine closing 3 new clients this month').\n" +
          "Offer: What it is, who it's for.\n" +
          "Value: 3 emoji bullets on what's included.\n" +
          "Urgency: 'Only [X] spots left' or 'Offer ends [date]'.\n" +
          "CTA: 'Link in bio' or 'DM me the word [KEYWORD] to get started.'\n" +
          "Hashtags: Offer-relevant + conversion-focused tags.",
        characterLimit: 2200,
      },
      {
        platform: "facebook",
        structure:
          "Story-driven opener that describes the transformation.\n" +
          "Introduce the offer naturally after establishing the problem.\n" +
          "Detailed value list.\n" +
          "Social proof: One testimonial snippet.\n" +
          "Urgency + CTA: Click, comment, or message.",
        characterLimit: 63206,
      },
    ],
    isBundle: true,
    matchKeywords: ["offer", "sale", "discount", "promo", "buy", "sign up", "limited", "deal", "free trial"],
    bestForObjectives: ["sales", "lead_generation", "conversions"],
    isActive: true,
    sortOrder: 12,
  },
];

async function seed() {
  const client = new MongoClient(MONGO_URI as string);
  try {
    await client.connect();
    const db = client.db();
    const col = db.collection(COLLECTION);

    const existing = await col.countDocuments();
    if (existing > 0) {
      console.log(`⚠️  Collection already has ${existing} documents. Skipping seed to avoid duplicates.`);
      console.log("   To re-seed, drop the collection first: db.adminCaptionTemplates.drop()");
      return;
    }

    const now = new Date();
    const docs = TEMPLATES.map((t) => ({ ...t, createdAt: now, updatedAt: now }));
    const result = await col.insertMany(docs);
    console.log(`✅ Seeded ${result.insertedCount} caption templates successfully.`);
    TEMPLATES.forEach((t, i) => console.log(`   ${i + 1}. ${t.name}`));
  } finally {
    await client.close();
  }
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
