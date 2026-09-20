import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { config, middleware } from "../middleware";

const originalNodeEnv = process.env.NODE_ENV;

function setNodeEnv(value: string) {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

function requestFor(pathname: string) {
  return new NextRequest(`http://localhost${pathname}`);
}

afterEach(() => {
  (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
});

describe("diagnostic route protection", () => {
  it.each(["/api/debug-db", "/api/debug-models", "/api/test-fb-24", "/api/find-24"])(
    "returns 404 for %s in production",
    async (pathname) => {
      setNodeEnv("production");

      const response = await middleware(requestFor(pathname));

      expect(response.status).toBe(404);
    },
  );

  it("keeps diagnostic routes available for local development", async () => {
    setNodeEnv("development");

    const response = await middleware(requestFor("/api/debug-db"));

    expect(response.status).toBe(200);
  });

  it("matches API routes so production protection is applied", () => {
    expect(config.matcher).toContain("/api/:path*");
  });
});
