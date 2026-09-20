import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  generateImage,
  generateJson,
  generateText,
  getSafeAiError,
  OpenRouterError,
} from "./openrouter";
import { clearAiRateLimitBuckets } from "./rateLimit";

const schema = {
  type: "OBJECT",
  properties: { answer: { type: "STRING" } },
  required: ["answer"],
};

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("OpenRouter provider", () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-openrouter-key";
    process.env.OPENROUTER_MAX_RETRIES = "2";
    process.env.OPENROUTER_RATE_LIMIT_PER_MINUTE = "100";
    clearAiRateLimitBuckets();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fails safely when the key is missing", async () => {
    delete process.env.OPENROUTER_API_KEY;

    await expect(
      generateText({ messages: [{ role: "user", content: "hello" }] }),
    ).rejects.toMatchObject({ code: "configuration" });
  });

  it("redacts upstream authorization failures", async () => {
    vi.mocked(fetch).mockResolvedValue(
      response({ error: { message: "secret provider detail" } }, 401),
    );

    const error = await generateText({
      messages: [{ role: "user", content: "hello" }],
    }).catch((value) => value);

    expect(getSafeAiError(error)).toMatchObject({
      code: "authentication",
      message: "AI service authentication failed",
    });
    expect(getSafeAiError(error).message).not.toContain("secret provider detail");
  });

  it("retries retryable responses", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(response({ error: { message: "busy" } }, 429))
      .mockResolvedValueOnce(
        response({
          model: "openrouter/free",
          choices: [{ message: { content: "recovered" } }],
        }),
      );

    const result = await generateText({
      messages: [{ role: "user", content: "hello" }],
    });

    expect(result.text).toBe("recovered");
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("supports structured JSON and validates malformed JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      response({ choices: [{ message: { content: '{"answer":"ok"}' } }] }),
    );

    const result = await generateJson<{ answer: string }>({
      messages: [{ role: "user", content: "return JSON" }],
      schema,
    });
    expect(result.data.answer).toBe("ok");

    vi.mocked(fetch).mockResolvedValueOnce(
      response({ choices: [{ message: { content: "not-json" } }] }),
    );
    await expect(
      generateJson({
        messages: [{ role: "user", content: "return JSON" }],
        schema,
      }),
    ).rejects.toMatchObject({ code: "invalid_output" });
  });

  it("normalizes image responses", async () => {
    vi.mocked(fetch).mockResolvedValue(
      response({
        model: "openai/gpt-image-2",
        data: [{ b64_json: "aGVsbG8=", media_type: "image/png" }],
      }),
    );

    const result = await generateImage({ prompt: "a simple blue icon" });
    expect(result.images).toEqual([{ data: "aGVsbG8=", mimeType: "image/png" }]);
  });

  it("maps aborts to a safe timeout error", async () => {
    vi.mocked(fetch).mockRejectedValue(new DOMException("aborted", "AbortError"));

    const error = await generateText({
      messages: [{ role: "user", content: "hello" }],
    }).catch((value) => value);

    expect(error).toBeInstanceOf(OpenRouterError);
    expect(getSafeAiError(error)).toMatchObject({
      code: "timeout",
      message: "AI request timed out",
    });
  });
});
