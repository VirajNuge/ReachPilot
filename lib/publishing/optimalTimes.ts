import type { PersonaDocument } from "@/lib/models/persona";
import type { OptimalSlotWithMeta } from "@/lib/publishing/types";

export interface MonthlyOptimalTimesInput {
  month: number;
  year: number;
}

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function toLowerList(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim().toLowerCase()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value.trim() ? [value.trim().toLowerCase()] : [];
  }
  return [];
}

function hasAny(values: string[], needles: string[]): boolean {
  return needles.some((needle) => values.some((value) => value.includes(needle)));
}

function getPostingTargetSlots(persona?: PersonaDocument | null): number {
  const postingFrequency = toLowerList(persona?.postingFrequency).join(" ");

  if (postingFrequency.includes("daily")) return 20;
  if (postingFrequency.includes("5")) return 18;
  if (postingFrequency.includes("3")) return 12;
  if (postingFrequency.includes("weekly")) return 8;
  if (postingFrequency.includes("bi-weekly")) return 6;
  return 10;
}

function getDayWeights(persona?: PersonaDocument | null): number[] {
  const weights = [0.9, 1.15, 1.3, 1.25, 1.1, 0.8, 0.75];
  const industries = toLowerList(persona?.industry);
  const roles = toLowerList(persona?.audienceRole);
  const businessStage = toLowerList(persona?.businessStage);
  const themes = toLowerList(persona?.contentThemes);
  const goals = toLowerList(persona?.audienceGoals);

  if (hasAny(industries, ["saas", "b2b", "agency", "consult", "fintech", "software", "tech"])) {
    weights[1] += 0.2;
    weights[2] += 0.45;
    weights[3] += 0.35;
    weights[4] += 0.2;
    weights[5] -= 0.15;
    weights[6] -= 0.2;
  }

  if (hasAny(industries, ["e-commerce", "ecommerce", "retail", "consumer", "creator", "lifestyle", "wellness", "fitness"])) {
    weights[4] += 0.1;
    weights[5] += 0.2;
    weights[6] += 0.35;
  }

  if (hasAny(roles, ["founder", "ceo", "executive", "owner", "manager", "consultant", "coach", "sales"])) {
    weights[1] += 0.2;
    weights[2] += 0.25;
    weights[3] += 0.25;
    weights[4] += 0.15;
  }

  if (hasAny(roles, ["creator", "marketer", "community", "designer", "writer"])) {
    weights[4] += 0.15;
    weights[5] += 0.2;
    weights[6] += 0.2;
  }

  if (hasAny(businessStage, ["idea", "pre-revenue", "mvp", "early stage"])) {
    weights[1] += 0.15;
    weights[2] += 0.15;
    weights[3] += 0.1;
  }

  if (hasAny(businessStage, ["growth", "scale", "enterprise"])) {
    weights[1] += 0.15;
    weights[2] += 0.25;
    weights[3] += 0.25;
    weights[4] += 0.1;
  }

  if (hasAny(themes, ["education", "how-to", "strategy", "tutorial", "guide"])) {
    weights[2] += 0.2;
    weights[3] += 0.2;
  }

  if (hasAny(goals, ["convert", "book", "lead", "sell", "demo", "quote"])) {
    weights[1] += 0.15;
    weights[2] += 0.25;
    weights[3] += 0.25;
  }

  return weights;
}

function getHourWeights(persona?: PersonaDocument | null): Record<number, number> {
  const weights: Record<number, number> = {};
  for (let hour = 0; hour < 24; hour += 1) {
    weights[hour] = 0.35;
  }

  const industries = toLowerList(persona?.industry);
  const roles = toLowerList(persona?.audienceRole);
  const themes = toLowerList(persona?.contentThemes);
  const goals = toLowerList(persona?.audienceGoals);
  const toneSliders = persona?.toneSliders;

  [8, 9, 10].forEach((hour) => (weights[hour] += 1.25));
  [11, 12, 13].forEach((hour) => (weights[hour] += 1.05));
  [16, 17, 18].forEach((hour) => (weights[hour] += 0.8));
  [19, 20].forEach((hour) => (weights[hour] += 0.55));

  if (hasAny(industries, ["saas", "b2b", "consult", "agency", "fintech", "software", "tech"])) {
    [8, 9, 10, 11, 12].forEach((hour) => (weights[hour] += 0.35));
  }

  if (hasAny(industries, ["e-commerce", "ecommerce", "retail", "consumer", "creator", "lifestyle", "wellness", "fitness"])) {
    [17, 18, 19, 20, 21].forEach((hour) => (weights[hour] += 0.35));
  }

  if (hasAny(roles, ["founder", "ceo", "executive", "owner", "consultant", "coach"])) {
    [7, 8, 9].forEach((hour) => (weights[hour] += 0.25));
    [12, 13].forEach((hour) => (weights[hour] += 0.2));
  }

  if (hasAny(roles, ["creator", "marketer", "community", "designer", "writer"])) {
    [18, 19, 20].forEach((hour) => (weights[hour] += 0.2));
  }

  if (hasAny(themes, ["education", "guide", "strategy", "tutorial"])) {
    [9, 10, 11, 12, 13].forEach((hour) => (weights[hour] += 0.15));
  }

  if (hasAny(goals, ["convert", "lead", "book", "demo", "sell"])) {
    [11, 12, 13, 16, 17].forEach((hour) => (weights[hour] += 0.15));
  }

  if (toneSliders) {
    if (toneSliders.seriousPlayful >= 60) {
      [18, 19, 20].forEach((hour) => (weights[hour] += 0.15));
    } else {
      [8, 9, 10, 11].forEach((hour) => (weights[hour] += 0.1));
    }

    if (toneSliders.inspiringInformative >= 60) {
      [9, 10, 11, 12, 13].forEach((hour) => (weights[hour] += 0.15));
    }
  }

  return weights;
}

function getBucketLabel(hour: number): string {
  if (hour < 8) return "Early morning";
  if (hour < 11) return "Morning commute";
  if (hour < 14) return "Lunch break";
  if (hour < 17) return "Afternoon check-in";
  if (hour < 20) return "Evening scroll";
  return "Late evening";
}

function getReason(persona: PersonaDocument | null | undefined, dayIndex: number, hour: number): string {
  const industries = toLowerList(persona?.industry);
  const roles = toLowerList(persona?.audienceRole);
  const stage = toLowerList(persona?.businessStage);

  const pieces: string[] = [];
  pieces.push(`${WEEKDAY_NAMES[dayIndex]} ${getBucketLabel(hour).toLowerCase()}`);

  if (hasAny(industries, ["saas", "b2b", "consult", "agency", "fintech", "software", "tech"])) {
    pieces.push("matches B2B weekday attention patterns");
  } else if (hasAny(industries, ["e-commerce", "ecommerce", "retail", "consumer", "creator", "lifestyle", "wellness", "fitness"])) {
    pieces.push("fits higher consumer engagement windows");
  }

  if (hasAny(roles, ["founder", "ceo", "executive", "owner", "consultant", "coach"])) {
    pieces.push("aligns with high-intent decision-maker behavior");
  }

  if (hasAny(stage, ["growth", "scale", "enterprise"])) {
    pieces.push("supports more conversion-focused timing");
  }

  return `${pieces.join(" and ")}.`;
}

function getPreferredHours(persona?: PersonaDocument | null): number[] {
  const baseHours = [8, 9, 11, 12, 13, 16, 17, 18, 19];
  const industries = toLowerList(persona?.industry);

  if (hasAny(industries, ["saas", "b2b", "consult", "agency", "fintech", "software", "tech"])) {
    return [8, 9, 10, 11, 12, 13, 16, 17];
  }

  if (hasAny(industries, ["e-commerce", "ecommerce", "retail", "consumer", "creator", "lifestyle", "wellness", "fitness"])) {
    return [11, 12, 13, 17, 18, 19, 20, 21];
  }

  return baseHours;
}

function getTargetHoursPerWeek(targetSlots: number, weeksInMonth: number): number {
  return Math.max(1, Math.ceil(targetSlots / Math.max(weeksInMonth, 1)));
}

function formatDateKey(year: number, month: number, dayOfMonth: number): string {
  const paddedMonth = String(month + 1).padStart(2, "0");
  const paddedDay = String(dayOfMonth).padStart(2, "0");
  return `${year}-${paddedMonth}-${paddedDay}`;
}

function getDayOfMonthFromDateKey(dateKey?: string): number | null {
  if (!dateKey) return null;
  const parts = dateKey.split("-");
  if (parts.length !== 3) return null;
  const dayValue = Number(parts[2]);
  return Number.isFinite(dayValue) ? dayValue : null;
}

export function buildMonthlyOptimalSlots(
  persona: PersonaDocument | null | undefined,
  { month, year }: MonthlyOptimalTimesInput
): OptimalSlotWithMeta[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeksInMonth = Math.max(4, Math.ceil(daysInMonth / 7));
  const targetSlots = getPostingTargetSlots(persona);
  const targetPerWeek = getTargetHoursPerWeek(targetSlots, weeksInMonth);
  const dayWeights = getDayWeights(persona);
  const hourWeights = getHourWeights(persona);
  const preferredHours = getPreferredHours(persona);

  const candidates: OptimalSlotWithMeta[] = [];

  for (let dayOfMonth = 1; dayOfMonth <= daysInMonth; dayOfMonth += 1) {
    const date = new Date(year, month, dayOfMonth);
    const dayIndex = date.getDay();
    const weekIndex = Math.min(weeksInMonth - 1, Math.floor((dayOfMonth - 1) / 7));

    for (const hour of preferredHours) {
      const hourScore = hourWeights[hour] ?? 0.35;
      const dayScore = dayWeights[dayIndex] ?? 1;
      const weeklyBalance = 1 + weekIndex * 0.02;
      const proximityBoost = dayOfMonth <= 7 ? 0.2 : dayOfMonth >= daysInMonth - 6 ? 0.15 : 0;
      const score = dayScore * 40 + hourScore * 45 + weeklyBalance * 8 + proximityBoost * 10;

      candidates.push({
        day: dayIndex,
        hour,
        minute: 0,
        label: getBucketLabel(hour),
        reason: getReason(persona, dayIndex, hour),
        score: Math.round(score),
        month,
        year,
        date: formatDateKey(year, month, dayOfMonth),
      });
    }
  }

  const slots: OptimalSlotWithMeta[] = [];
  const usedDates = new Set<string>();

  for (let weekIndex = 0; weekIndex < weeksInMonth && slots.length < targetSlots; weekIndex += 1) {
    const startDay = weekIndex * 7 + 1;
    const endDay = Math.min(daysInMonth, startDay + 6);
    const weekCandidates = candidates
      .filter((candidate) => {
        const candidateDay = getDayOfMonthFromDateKey(candidate.date);
        if (candidateDay === null) return false;
        return candidateDay >= startDay && candidateDay <= endDay;
      })
      .sort((left, right) => (right.score ?? 0) - (left.score ?? 0) || left.date!.localeCompare(right.date!));

    for (const candidate of weekCandidates) {
      if (slots.length >= targetSlots) break;
      if (!candidate.date || usedDates.has(candidate.date)) continue;

      slots.push(candidate);
      usedDates.add(candidate.date);

      const weekSlotCount = slots.filter((slot) => {
        const slotDay = getDayOfMonthFromDateKey(slot.date);
        if (slotDay === null) return false;
        return slotDay >= startDay && slotDay <= endDay;
      }).length;

      if (weekSlotCount >= targetPerWeek) {
        break;
      }
    }
  }

  if (slots.length < targetSlots) {
    const fallbackCandidates = [...candidates].sort((left, right) => (right.score ?? 0) - (left.score ?? 0) || left.date!.localeCompare(right.date!));
    for (const candidate of fallbackCandidates) {
      if (slots.length >= targetSlots) break;
      if (!candidate.date || usedDates.has(candidate.date)) continue;
      slots.push(candidate);
      usedDates.add(candidate.date);
    }
  }

  return slots.sort((left, right) => (right.score ?? 0) - (left.score ?? 0) || left.date!.localeCompare(right.date!));
}

export function buildFallbackOptimalSlots(input: MonthlyOptimalTimesInput): OptimalSlotWithMeta[] {
  return buildMonthlyOptimalSlots(null, input);
}
