import { createHash, timingSafeEqual } from "node:crypto";

const SIGNUP_ACCESS_CODE_ENV = "SIGNUP_ACCESS_CODE";

export function isSignupAccessCodeConfigured() {
  return typeof process.env[SIGNUP_ACCESS_CODE_ENV] === "string" && process.env[SIGNUP_ACCESS_CODE_ENV]!.trim().length > 0;
}

export function isSignupAccessCodeValid(value: unknown) {
  const configured = process.env[SIGNUP_ACCESS_CODE_ENV]?.trim();
  const submitted = typeof value === "string" ? value.trim() : "";
  if (!configured || !submitted) return false;

  const expectedDigest = createHash("sha256").update(configured, "utf8").digest();
  const submittedDigest = createHash("sha256").update(submitted, "utf8").digest();
  return timingSafeEqual(expectedDigest, submittedDigest);
}
