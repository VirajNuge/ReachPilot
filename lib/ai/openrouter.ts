import "server-only";

import { parseAIJson } from "@/lib/parseAIJson";
import { AI_MODELS } from "@/lib/aiConfig";
import type { Schema } from "@/lib/ai/schema";
import { consumeAiRateLimit } from "@/lib/ai/rateLimit";

export type AiErrorCode =
  | "configuration"
  | "authentication"
  | "rate_limit"
  | "timeout"
  | "content_blocked"
  | "invalid_output"
  | "upstream";

export interface AiUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  cost?: number;
}

export class OpenRouterError extends Error {
  readonly code: AiErrorCode;
  readonly status?: number;
  readonly requestId: string;

  constructor(
    code: AiErrorCode,
    message: string,
    requestId: string,
    status?: number,
  ) {
    super(message);
    this.name = "OpenRouterError";
    this.code = code;
    this.status = status;
    this.requestId = requestId;
  }
}

type TextPart = { type: "text"; text: string };
type ImagePart = { type: "image_url"; image_url: { url: string } };
export type AiMessageContent = string | Array<TextPart | ImagePart>;

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: AiMessageContent;
}

export interface GenerateTextOptions {
  model?: string;
  messages: AiMessage[];
  temperature?: number;
  maxTokens?: number;
  responseSchema?: Schema | Record<string, unknown>;
  schemaName?: string;
  requestId?: string;
  rateLimitKey?: string;
}

export interface GenerateTextResult {
  text: string;
  model: string;
  requestId: string;
  usage?: AiUsage;
}

export interface GenerateImageOptions {
  model?: string;
  prompt: string;
  count?: number;
  aspectRatio?: string;
  size?: string;
  quality?: "auto" | "low" | "medium" | "high";
  referenceImages?: string[];
  requestId?: string;
  rateLimitKey?: string;
}

export interface GeneratedImage {
  data: string;
  mimeType: string;
}

export interface GenerateImageResult {
  images: GeneratedImage[];
  model: string;
  requestId: string;
  usage?: AiUsage;
}

interface OpenRouterConfig {
  apiKey: string;
  textModel: string;
  visionModel: string;
  imageModel: string;
  siteUrl?: string;
  appName: string;
  timeoutMs: number;
  maxRetries: number;
}

function getConfig(): OpenRouterConfig {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new OpenRouterError(
      "configuration",
      "AI provider is not configured",
      createRequestId(),
    );
  }

  return {
    apiKey,
    textModel: process.env.OPENROUTER_TEXT_MODEL?.trim() || AI_MODELS.TEXT,
    visionModel:
      process.env.OPENROUTER_VISION_MODEL?.trim() || AI_MODELS.VISION,
    imageModel:
      process.env.OPENROUTER_IMAGE_MODEL?.trim() || AI_MODELS.IMAGE_DEFAULT,
    siteUrl: process.env.OPENROUTER_SITE_URL?.trim(),
    appName: process.env.OPENROUTER_APP_NAME?.trim() || "ReachPilot",
    timeoutMs: parsePositiveInt(process.env.OPENROUTER_TIMEOUT_MS, 60_000),
    maxRetries: Math.min(
      parsePositiveInt(process.env.OPENROUTER_MAX_RETRIES, 2),
      4,
    ),
  };
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function createRequestId(): string {
  return `ai_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function mapLegacyModel(model: string | undefined, kind: "text" | "image"): string {
  if (!model) return kind === "image" ? AI_MODELS.IMAGE_DEFAULT : AI_MODELS.TEXT;

  if (kind === "image") {
    if (
      model.startsWith("gemini-") ||
      model.startsWith("imagen-") ||
      model === "dall-e-3"
    ) {
      return AI_MODELS.IMAGE_DEFAULT;
    }
    return model;
  }

  if (model.startsWith("gemini-")) return AI_MODELS.TEXT;
  return model;
}

function toJsonSchema(schema: Schema | Record<string, unknown>): Record<string, unknown> {
  const input = schema as Record<string, unknown>;
  const rawType = String(input.type ?? "").toUpperCase();
  const typeMap: Record<string, string> = {
    OBJECT: "object",
    ARRAY: "array",
    STRING: "string",
    NUMBER: "number",
    BOOLEAN: "boolean",
  };
  const result: Record<string, unknown> = {
    type: typeMap[rawType] ?? input.type ?? "object",
  };

  if (typeof input.description === "string") result.description = input.description;
  if (Array.isArray(input.required)) result.required = input.required;
  if (Array.isArray(input.enum)) result.enum = input.enum;
  if (input.nullable === true) result.nullable = true;

  if (input.properties && typeof input.properties === "object") {
    result.properties = Object.fromEntries(
      Object.entries(input.properties as Record<string, unknown>).map(([key, value]) => [
        key,
        toJsonSchema(value as Schema),
      ]),
    );
    result.additionalProperties = false;
  }

  if (input.items && typeof input.items === "object") {
    result.items = toJsonSchema(input.items as Schema);
  }

  return result;
}

function normalizeUsage(raw: Record<string, unknown> | undefined): AiUsage | undefined {
  if (!raw) return undefined;
  return {
    promptTokens: asNumber(raw.prompt_tokens ?? raw.promptTokens),
    completionTokens: asNumber(raw.completion_tokens ?? raw.completionTokens),
    totalTokens: asNumber(raw.total_tokens ?? raw.totalTokens),
    cost: asNumber(raw.cost),
  };
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function classifyError(status: number | undefined, message: string): AiErrorCode {
  if (status === 401 || status === 403) return "authentication";
  if (status === 429) return "rate_limit";
  if (/safety|blocked|content policy|moderation/i.test(message)) {
    return "content_blocked";
  }
  return "upstream";
}

function isRetryable(status: number | undefined): boolean {
  return status === 408 || status === 409 || status === 425 || status === 429 || Boolean(status && status >= 500);
}

async function requestOpenRouter(
  path: string,
  body: Record<string, unknown>,
  requestId = createRequestId(),
  rateLimitKey = "global",
): Promise<Record<string, unknown>> {
  const config = getConfig();
  const configuredLimit = Number(process.env.OPENROUTER_RATE_LIMIT_PER_MINUTE ?? 60);
  const limitKey = `${rateLimitKey}:${path}:${String(body.model ?? "default")}`;
  if (!consumeAiRateLimit(limitKey, configuredLimit)) {
    throw new OpenRouterError("rate_limit", "AI request rate limit exceeded", requestId, 429);
  }
  let lastError: OpenRouterError | undefined;

  for (let attempt = 0; attempt <= config.maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
    const startedAt = Date.now();

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "X-Title": config.appName,
        "X-Request-ID": requestId,
      };
      if (config.siteUrl) headers["HTTP-Referer"] = config.siteUrl;

      const response = await fetch(`https://openrouter.ai/api/v1${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const raw = await response.text();
      let payload: Record<string, unknown> = {};
      try {
        payload = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      } catch {
        payload = {};
      }

      if (!response.ok) {
        const errorPayload = payload.error as Record<string, unknown> | undefined;
        const providerMessage =
          typeof errorPayload?.message === "string" ? errorPayload.message : "AI request failed";
        const error = new OpenRouterError(
          classifyError(response.status, providerMessage),
          providerMessage,
          requestId,
          response.status,
        );
        lastError = error;
        if (!isRetryable(response.status) || attempt >= config.maxRetries) throw error;
      } else {
        console.info("[ai] request complete", {
          requestId,
          path,
          status: response.status,
          latencyMs: Date.now() - startedAt,
        });
        return payload;
      }
    } catch (error) {
      if (error instanceof OpenRouterError) {
        lastError = error;
        if (!isRetryable(error.status) || attempt >= config.maxRetries) throw error;
      } else if (error instanceof DOMException && error.name === "AbortError") {
        throw new OpenRouterError("timeout", "AI request timed out", requestId);
      } else {
        lastError = new OpenRouterError("upstream", "AI provider is unavailable", requestId);
        if (attempt >= config.maxRetries) throw lastError;
      }
    } finally {
      clearTimeout(timeout);
    }

    await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
  }

  throw lastError ?? new OpenRouterError("upstream", "AI provider is unavailable", requestId);
}

function contentFromLegacyInput(input: unknown): AiMessageContent {
  if (typeof input === "string") return input;
  if (!Array.isArray(input)) return String(input ?? "");

  const parts: Array<TextPart | ImagePart> = [];
  for (const part of input) {
    if (typeof part === "string") {
      parts.push({ type: "text", text: part });
      continue;
    }
    if (!part || typeof part !== "object") continue;
    const candidate = part as Record<string, unknown>;
    if (typeof candidate.text === "string") {
      parts.push({ type: "text", text: candidate.text });
    } else if (candidate.inlineData && typeof candidate.inlineData === "object") {
      const data = candidate.inlineData as Record<string, unknown>;
      if (typeof data.data === "string") {
        const mime = typeof data.mimeType === "string" ? data.mimeType : "image/jpeg";
        parts.push({ type: "image_url", image_url: { url: `data:${mime};base64,${data.data}` } });
      }
    }
  }
  return parts;
}

function messagesFromLegacyInput(input: unknown): AiMessage[] {
  if (
    input &&
    typeof input === "object" &&
    !Array.isArray(input) &&
    Array.isArray((input as Record<string, unknown>).contents)
  ) {
    return ((input as Record<string, unknown>).contents as Array<Record<string, unknown>>).map((item) => ({
      role: item.role === "model" ? "assistant" : "user",
      content: contentFromLegacyInput(item.parts),
    }));
  }
  return [{ role: "user", content: contentFromLegacyInput(input) }];
}

function extractText(payload: Record<string, unknown>, requestId: string): string {
  const choices = Array.isArray(payload.choices) ? payload.choices : [];
  const first = choices[0] as Record<string, unknown> | undefined;
  const message = first?.message as Record<string, unknown> | undefined;
  if (typeof message?.content === "string") return message.content;
  if (Array.isArray(message?.content)) {
    return (message.content as Array<Record<string, unknown>>)
      .filter((item) => typeof item.text === "string")
      .map((item) => item.text as string)
      .join("\n");
  }
  throw new OpenRouterError("invalid_output", "AI returned no text", requestId);
}

export async function generateText(options: GenerateTextOptions): Promise<GenerateTextResult> {
  const requestId = options.requestId ?? createRequestId();
  const config = getConfig();
  const model = mapLegacyModel(options.model, "text");
  const body: Record<string, unknown> = {
    model,
    messages: options.messages,
    temperature: options.temperature,
    max_tokens: options.maxTokens,
    stream: false,
  };

  if (options.responseSchema) {
    body.response_format = {
      type: "json_schema",
      json_schema: {
        name: options.schemaName ?? "reachpilot_response",
        strict: true,
        schema: toJsonSchema(options.responseSchema),
      },
    };
    body.provider = { require_parameters: true };
  }

  const payload = await requestOpenRouter(
    "/chat/completions",
    body,
    requestId,
    options.rateLimitKey,
  );
  return {
    text: extractText(payload, requestId),
    model: typeof payload.model === "string" ? payload.model : model || config.textModel,
    requestId,
    usage: normalizeUsage(payload.usage as Record<string, unknown> | undefined),
  };
}

export async function generateJson<T>(
  options: Omit<GenerateTextOptions, "responseSchema"> & {
    schema: Schema | Record<string, unknown>;
    schemaName?: string;
  },
): Promise<{ data: T; text: string; model: string; requestId: string; usage?: AiUsage }> {
  const result = await generateText({
    ...options,
    responseSchema: options.schema,
    schemaName: options.schemaName,
  });
  try {
    return { ...result, data: JSON.parse(result.text) as T };
  } catch {
    try {
      return { ...result, data: parseAIJson(result.text) as T };
    } catch {
      throw new OpenRouterError("invalid_output", "AI returned invalid JSON", result.requestId);
    }
  }
}

export async function generateVision(options: GenerateTextOptions): Promise<GenerateTextResult> {
  return generateText({ ...options, model: options.model ?? AI_MODELS.VISION });
}

export async function generateImage(options: GenerateImageOptions): Promise<GenerateImageResult> {
  const requestId = options.requestId ?? createRequestId();
  const config = getConfig();
  const model = mapLegacyModel(options.model ?? config.imageModel, "image");
  const body: Record<string, unknown> = {
    model,
    prompt: options.prompt,
    n: Math.min(Math.max(options.count ?? 1, 1), 4),
    quality: options.quality ?? "auto",
  };
  if (options.size) body.size = options.size;
  if (options.aspectRatio) body.aspect_ratio = options.aspectRatio;
  if (options.referenceImages?.length) body.input_references = options.referenceImages;

  const payload = await requestOpenRouter(
    "/images",
    body,
    requestId,
    options.rateLimitKey,
  );
  const items = Array.isArray(payload.data) ? payload.data : [];
  const images = items.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const image = item as Record<string, unknown>;
    if (typeof image.b64_json !== "string") return [];
    return [{ data: image.b64_json, mimeType: typeof image.media_type === "string" ? image.media_type : "image/png" }];
  });
  if (images.length === 0) {
    throw new OpenRouterError("invalid_output", "AI returned no images", requestId);
  }
  return {
    images,
    model: typeof payload.model === "string" ? payload.model : model,
    requestId,
    usage: normalizeUsage(payload.usage as Record<string, unknown> | undefined),
  };
}

/** Compatibility facade used while routes are migrated to the provider-neutral API. */
export class OpenRouterClient {
  private readonly rateLimitKey?: string;

  constructor(_apiKey?: string, options?: { rateLimitKey?: string }) {
    // The provider key is intentionally read only by getConfig() so every
    // route uses the same validation and never passes secrets around.
    this.rateLimitKey = options?.rateLimitKey;
  }

  getGenerativeModel(options: {
    model?: string;
    systemInstruction?: string;
    generationConfig?: {
      temperature?: number;
      maxOutputTokens?: number;
      responseMimeType?: string;
      responseSchema?: Schema | Record<string, unknown>;
    };
  }) {
    const modelStartChat = (chatOptions: { history?: Array<{ role: string; parts: Array<{ text: string }> }> } = {}) =>
      this.startChat({
        history: chatOptions.history,
        model: options.model,
        systemInstruction: options.systemInstruction,
      });

    return {
      generateContent: async (input: unknown) => {
        const legacyConfig =
          input && typeof input === "object" && !Array.isArray(input)
            ? ((input as Record<string, unknown>).generationConfig as
                | { temperature?: number; maxOutputTokens?: number; responseSchema?: Schema | Record<string, unknown> }
                | undefined)
            : undefined;
        const system = options.systemInstruction
          ? ([{ role: "system", content: options.systemInstruction }] satisfies AiMessage[])
          : [];
        const result = await generateText({
          model: options.model,
          messages: [...system, ...messagesFromLegacyInput(input)],
          temperature: legacyConfig?.temperature ?? options.generationConfig?.temperature,
          maxTokens: legacyConfig?.maxOutputTokens ?? options.generationConfig?.maxOutputTokens,
          responseSchema: legacyConfig?.responseSchema ?? options.generationConfig?.responseSchema,
          rateLimitKey: this.rateLimitKey,
        });
        return { response: { text: () => result.text } };
      },
      generateContentStream: async (input: unknown) => {
        const response = await this.getGenerativeModel(options).generateContent(input);
        return {
          stream: {
            async *[Symbol.asyncIterator]() {
              yield { text: () => response.response.text() };
            },
          },
        };
      },
      startChat: modelStartChat,
    };
  }

  startChat(
    options: {
      history?: Array<{ role: string; parts: Array<{ text: string }> }>;
      model?: string;
      systemInstruction?: string;
    } = {},
  ) {
    return {
      sendMessage: async (message: string) => {
        const messages: AiMessage[] = (options.history ?? []).map((item) => ({
          role: item.role === "model" ? "assistant" : (item.role as "user" | "system"),
          content: item.parts.map((part) => part.text).join("\n"),
        }));
        messages.push({ role: "user", content: message });
        const result = await generateText({
          messages: options.systemInstruction
            ? [{ role: "system", content: options.systemInstruction }, ...messages]
            : messages,
          model: options.model ?? AI_MODELS.TEXT,
          rateLimitKey: this.rateLimitKey,
        });
        return { response: { text: () => result.text } };
      },
    };
  }
}

export function getSafeAiError(error: unknown): { code: AiErrorCode; message: string; requestId?: string } {
  if (error instanceof OpenRouterError) {
    const messages: Record<AiErrorCode, string> = {
      configuration: "AI service is not configured",
      authentication: "AI service authentication failed",
      rate_limit: "AI service is temporarily rate limited",
      timeout: "AI request timed out",
      content_blocked: "AI could not process this content",
      invalid_output: "AI returned an invalid response",
      upstream: "AI service is temporarily unavailable",
    };
    return { code: error.code, message: messages[error.code], requestId: error.requestId };
  }
  return { code: "upstream", message: "AI service is temporarily unavailable" };
}
