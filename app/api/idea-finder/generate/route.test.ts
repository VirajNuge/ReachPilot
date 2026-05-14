import { describe, expect, it } from "vitest";
import {
  buildEmptyIdeaFinderContext,
  isValidRequest,
  joinCandidateText,
} from "./route";

describe("idea-finder generate route helpers", () => {
  it("joins grounded candidate text across multiple parts", () => {
    const text = joinCandidateText({
      content: {
        parts: [{ text: '{"ideas":[' }, { text: '{"title":"One"}]}' }],
      },
    });

    expect(text).toBe('{"ideas":[{"title":"One"}]}');
  });

  it("returns an empty string when no grounded text exists", () => {
    expect(joinCandidateText({ content: { parts: [] } })).toBe("");
    expect(joinCandidateText(undefined)).toBe("");
  });

  it("validates the core Idea Finder request shape", () => {
    expect(
      isValidRequest({
        mode: "voice-match",
        platform: "linkedin",
        accountId: "acct_123",
        importPersona: true,
      }),
    ).toBe(true);

    expect(
      isValidRequest({
        mode: "voice-match",
        platform: "linkedin",
        accountId: "",
      }),
    ).toBe(false);

    expect(
      isValidRequest({
        mode: "invalid-mode",
        platform: "linkedin",
        accountId: "acct_123",
      }),
    ).toBe(false);
  });

  it("builds an empty degraded context for the requested platform", () => {
    const context = buildEmptyIdeaFinderContext("all");

    expect(context.platform.target).toBe("all platforms");
    expect(context.persona.summary).toBe("");
    expect(context.analysis.postDNA).toEqual([]);
    expect(context.postHistory.recentPosts).toEqual([]);
  });
});
