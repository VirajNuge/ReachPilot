import { PersonaDocument } from "./models/persona";

type PartialPersona = Partial<PersonaDocument> | null | undefined;

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function toneBucket(value: number, leftLabel: string, rightLabel: string): string {
  const n = Math.max(0, Math.min(100, value));

  if (n <= 30) return `very ${leftLabel}`;
  if (n <= 45) return `slightly ${leftLabel}`;
  if (n <= 55) return `balanced ${leftLabel}/${rightLabel}`;
  if (n <= 75) return `slightly ${rightLabel}`;
  return `very ${rightLabel}`;
}

function buildToneDescription(persona: Partial<PersonaDocument>): string {
  const sliders = persona.toneSliders;
  if (!sliders) return "";

  const parts: string[] = [];

  if (typeof sliders.formalCasual === "number") {
    parts.push(toneBucket(sliders.formalCasual, "Formal", "Casual"));
  }
  if (typeof sliders.seriousPlayful === "number") {
    parts.push(toneBucket(sliders.seriousPlayful, "Serious", "Playful"));
  }
  if (typeof sliders.inspiringInformative === "number") {
    parts.push(toneBucket(sliders.inspiringInformative, "Inspiring", "Informative"));
  }
  if (typeof sliders.dataDriven === "number") {
    parts.push(toneBucket(sliders.dataDriven, "Data-Driven", "Storytelling"));
  }

  return parts.join(", ");
}

function hasRequiredIdentity(persona: PartialPersona): persona is Partial<PersonaDocument> {
  if (!persona) return false;
  return Boolean(cleanText(persona.personaName) && cleanText(persona.userRole));
}

function section(title: string, lines: string[]): string {
  if (!lines.length) return "";
  return `${title}\n${lines.join("\n")}`;
}

export function buildContentGenerationContext(persona: Partial<PersonaDocument>): string {
  if (!hasRequiredIdentity(persona)) return "";

  const personaName = cleanText(persona.personaName);
  const userRole = cleanText(persona.userRole);
  const industry = cleanText(persona.industry);

  const firstLine = industry
    ? `You are creating content for ${personaName}, ${userRole} in ${industry}.`
    : `You are creating content for ${personaName}, ${userRole}.`;

  const whoTheyAre: string[] = [];
  whoTheyAre.push(`- Role: ${userRole}`);
  if (industry) whoTheyAre.push(`- Industry: ${industry}`);
  const businessStage = cleanText(persona.businessStage);
  if (businessStage) whoTheyAre.push(`- Business Stage: ${businessStage}`);
  const tagline = cleanText(persona.tagline);
  if (tagline) whoTheyAre.push(`- Tagline: ${tagline}`);
  const scrapedWebsiteData = cleanText(persona.scrapedWebsiteData);
  if (scrapedWebsiteData) whoTheyAre.push(`- Brand context: ${scrapedWebsiteData}`);

  const productsAndPov: string[] = [];
  const productsServices = cleanText(persona.productsServices);
  const uniquePOV = cleanText(persona.uniquePOV);
  const credibilitySignals = cleanText(persona.credibilitySignals);
  if (productsServices) productsAndPov.push(`- What they offer: ${productsServices}`);
  if (uniquePOV) productsAndPov.push(`- Their unique take: ${uniquePOV}`);
  if (credibilitySignals) productsAndPov.push(`- Why they're credible: ${credibilitySignals}`);

  const audience: string[] = [];
  const audienceRole = cleanText(persona.audienceRole);
  const audienceSegments = cleanList(persona.audienceSegments);
  const painPoints = cleanText(persona.painPoints);
  const audienceDesiredOutcome = cleanText(persona.audienceDesiredOutcome);
  const audienceGoals = cleanList(persona.audienceGoals);
  if (audienceRole) audience.push(`- Reader role: ${audienceRole}`);
  if (audienceSegments.length) audience.push(`- Audience segments: ${audienceSegments.join(", ")}`);
  if (painPoints) audience.push(`- Pain points: ${painPoints}`);
  if (audienceDesiredOutcome) audience.push(`- Desired outcome: ${audienceDesiredOutcome}`);
  if (audienceGoals.length) audience.push(`- Goals: ${audienceGoals.join(", ")}`);

  const contentGoals: string[] = [];
  const primaryObjective = cleanList(persona.primaryObjective);
  const conversionGoal = cleanText(persona.conversionGoal);
  const contentMix = cleanList(persona.contentMix);
  if (primaryObjective.length) contentGoals.push(`- Primary goals: ${primaryObjective.join(", ")}`);
  if (conversionGoal) contentGoals.push(`- Conversion goal: ${conversionGoal}`);
  if (contentMix.length) contentGoals.push(`- Content types: ${contentMix.join(", ")}`);

  const voiceAndTone: string[] = [];
  const toneDescription = buildToneDescription(persona);
  if (toneDescription) voiceAndTone.push(`- Tone: ${toneDescription}`);
  const writingStyle = cleanText(persona.writingStyle);
  if (writingStyle) voiceAndTone.push(`- Writing style: ${writingStyle}`);
  const emojiUsage = cleanText(persona.emojiUsage);
  if (emojiUsage) voiceAndTone.push(`- Emoji usage: ${emojiUsage}`);
  const influencerStyle = cleanText(persona.influencerStyle);
  if (influencerStyle) voiceAndTone.push(`- Voice to emulate: ${influencerStyle}`);

  const contentTopics: string[] = [];
  const contentThemes = cleanList(persona.contentThemes);
  const coreValues = cleanList(persona.coreValues);
  const postingFrequency = cleanText(persona.postingFrequency);
  const doNotTalk = cleanText(persona.doNotTalk);
  if (contentThemes.length) contentTopics.push(`- Themes: ${contentThemes.join(", ")}`);
  if (coreValues.length) contentTopics.push(`- Values: ${coreValues.join(", ")}`);
  if (postingFrequency) contentTopics.push(`- Posts: ${postingFrequency}`);
  if (doNotTalk) contentTopics.push(`- NEVER discuss: ${doNotTalk}`);

  const writingSamples = cleanText(persona.writingSamples);

  const blocks = [
    firstLine,
    section("## WHO THEY ARE", whoTheyAre),
    section("## THEIR PRODUCTS & UNIQUE POV", productsAndPov),
    section("## TARGET AUDIENCE", audience),
    section("## CONTENT GOALS", contentGoals),
    section("## VOICE & TONE", voiceAndTone),
    section("## CONTENT TOPICS", contentTopics),
    writingSamples
      ? `## WRITING EXAMPLES (match this voice exactly)\n${writingSamples}`
      : "",
  ].filter(Boolean);

  return blocks.join("\n\n");
}

export function buildChatbotContext(persona: Partial<PersonaDocument>): string {
  if (!hasRequiredIdentity(persona)) return "";

  const personaName = cleanText(persona.personaName);
  const userRole = cleanText(persona.userRole);
  const industry = cleanText(persona.industry);

  const sentences: string[] = [];
  sentences.push(
    industry
      ? `You are assisting ${personaName}, a ${userRole} in ${industry}.`
      : `You are assisting ${personaName}, a ${userRole}.`
  );

  const uniqueAngle = cleanText(persona.uniquePOV) || cleanText(persona.tagline);
  if (uniqueAngle) {
    sentences.push(`Their unique angle is ${uniqueAngle}.`);
  }

  const audienceRole = cleanText(persona.audienceRole);
  const audienceSegments = cleanList(persona.audienceSegments);
  const audienceDescriptor = audienceRole || audienceSegments.join(", ");
  const painPoints = cleanText(persona.painPoints);
  if (audienceDescriptor && painPoints) {
    sentences.push(`They write for ${audienceDescriptor}, who struggle with ${painPoints}.`);
  } else if (audienceDescriptor) {
    sentences.push(`They write for ${audienceDescriptor}.`);
  }

  const toneDescription = buildToneDescription(persona);
  if (toneDescription) {
    sentences.push(`Their tone is ${toneDescription}.`);
  }

  const styleParts = [cleanText(persona.writingStyle), cleanText(persona.emojiUsage)].filter(Boolean);
  if (styleParts.length) {
    sentences.push(`Always match their writing style: ${styleParts.join(", ")}.`);
  }

  return sentences.join(" ");
}
