import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../lib/models/user", () => ({ createUser: vi.fn() }));
vi.mock("../../../../lib/auth", () => ({
  signToken: vi.fn(),
  setAuthCookie: vi.fn(() => ({ name: "rp_token", value: "token", path: "/" })),
}));

import { createUser } from "../../../../lib/models/user";
import { setAuthCookie, signToken } from "../../../../lib/auth";
import * as route from "./route";

const validForm = {
  signupCode: "owner-code",
  username: "viraj",
  email: "viraj@example.com",
  firstName: "Viraj",
  lastName: "Nuge",
  password: "password123",
};

function request(body: Record<string, unknown>) {
  return new Request("http://localhost/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SIGNUP_ACCESS_CODE = "owner-code";
    vi.mocked(createUser).mockResolvedValue({
      id: "user-1",
      username: "viraj",
      email: "viraj@example.com",
      firstName: "Viraj",
      lastName: "Nuge",
      createdAt: new Date().toISOString(),
    });
    vi.mocked(signToken).mockResolvedValue("signed-token");
  });

  it("rejects a missing or invalid access code before creating a user", async () => {
    const missing = await route.POST(request({ ...validForm, signupCode: "" }) as never);
    const invalid = await route.POST(request({ ...validForm, signupCode: "wrong-code" }) as never);

    expect(missing.status).toBe(403);
    expect(invalid.status).toBe(403);
    expect(vi.mocked(createUser)).not.toHaveBeenCalled();
  });

  it("creates an account and sets the auth cookie for the configured code", async () => {
    const response = await route.POST(request(validForm) as never);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.user.username).toBe("viraj");
    expect(vi.mocked(createUser)).toHaveBeenCalledWith({
      username: "viraj",
      email: "viraj@example.com",
      firstName: "Viraj",
      lastName: "Nuge",
      password: "password123",
    });
    expect(vi.mocked(signToken)).toHaveBeenCalled();
    expect(vi.mocked(setAuthCookie)).toHaveBeenCalledWith("signed-token");
  });

  it("fails closed when the access code is not configured", async () => {
    delete process.env.SIGNUP_ACCESS_CODE;

    const response = await route.POST(request(validForm) as never);
    expect(response.status).toBe(503);
    expect(vi.mocked(createUser)).not.toHaveBeenCalled();
  });
});
