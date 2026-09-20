export function getAllowedExtensionOrigins(): string[] {
  return (process.env.EXTENSION_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function corsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers.get("origin") ?? "";
  const allowedOrigins = getAllowedExtensionOrigins();

  return {
    ...(origin && allowedOrigins.includes(origin)
      ? { "Access-Control-Allow-Origin": origin }
      : {}),
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-ID",
    Vary: "Origin",
  };
}

export function isAllowedRequestOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || getAllowedExtensionOrigins().includes(origin);
}
