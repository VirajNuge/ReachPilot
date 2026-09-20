import { NextRequest } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { getExtensionSession, type ExtensionSession } from "@/lib/extensionAuth";

export type RequestIdentity = ExtensionSession & { source: "app" | "extension" };

export async function getRequestIdentity(
  request: NextRequest,
  accountIdOverride?: string,
): Promise<RequestIdentity | null> {
  const appAuth = await getAuthFromRequest(request);
  if (appAuth?.userId) {
    const accountId = accountIdOverride ?? request.nextUrl.searchParams.get("accountId") ?? "";
    return {
      userId: appAuth.userId,
      accountId,
      source: "app",
    };
  }

  const extension = await getExtensionSession(request);
  return extension ? { ...extension, source: "extension" } : null;
}
