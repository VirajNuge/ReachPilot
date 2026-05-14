import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { getConnections, upsertConnection } from "@/lib/models/connection";

export async function GET(req: NextRequest) {
  const auth = await getAuthFromCookies();
  if (!auth) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || req.url));
  }

  const accountId =
    req.cookies.get("rp_oauth_account")?.value ||
    req.nextUrl.searchParams.get("state")?.trim() ||
    "";
  if (!accountId) {
    console.error("Instagram OAuth callback missing accountId", {
      hasCookieAccount: Boolean(req.cookies.get("rp_oauth_account")?.value),
      hasStateParam: Boolean(req.nextUrl.searchParams.get("state")),
      hasCodeParam: Boolean(req.nextUrl.searchParams.get("code")),
      errorParam: req.nextUrl.searchParams.get("error") ?? null,
    });
    return NextResponse.json({ error: "Missing accountId from OAuth state" }, { status: 400 });
  }

  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const redirectUri =
    req.cookies.get("rp_oauth_instagram_redirect_uri")?.value?.trim() ||
    process.env.INSTAGRAM_REDIRECT_URI?.trim() ||
    new URL("/api/auth/instagram/callback", req.nextUrl.origin).toString();

  if (error || !code) {
    const response = NextResponse.redirect(new URL(`/${accountId}/accountPersona?error=auth_denied`, process.env.NEXTAUTH_URL || req.url));
    response.cookies.delete("rp_oauth_account");
    response.cookies.delete("rp_oauth_instagram_redirect_uri");
    return response;
  }

  try {
    if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
      throw new Error("Missing Meta OAuth app credentials");
    }

    // 1. Exchange code for short-lived user token
    const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", process.env.FACEBOOK_APP_ID!);
    tokenUrl.searchParams.set("client_secret", process.env.FACEBOOK_APP_SECRET!);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || tokenData.error) {
      console.error("Instagram OAuth token exchange failed", {
        status: tokenResponse.status,
        tokenError: tokenData?.error ?? null,
        tokenData,
      });
      throw new Error(tokenData?.error?.message || "Token exchange failed");
    }

    const shortLivedToken = tokenData.access_token;

    // 2. Exchange for long-lived user token
    const longLivedUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", process.env.FACEBOOK_APP_ID!);
    longLivedUrl.searchParams.set("client_secret", process.env.FACEBOOK_APP_SECRET!);
    longLivedUrl.searchParams.set("fb_exchange_token", shortLivedToken);

    const longLivedResponse = await fetch(longLivedUrl.toString());
    const longLivedData = await longLivedResponse.json();
    if (!longLivedResponse.ok || longLivedData?.error) {
      console.error("Instagram OAuth long-lived token exchange failed", {
        status: longLivedResponse.status,
        tokenError: longLivedData?.error ?? null,
        tokenData: longLivedData,
      });
      throw new Error(longLivedData?.error?.message || "Long-lived token exchange failed");
    }
    const userToken = longLivedData.access_token || shortLivedToken;

    // 3. Fetch FB user profile
    const userResponse = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${userToken}`);
    const userData = await userResponse.json();
    if (!userResponse.ok || userData?.error) {
      console.error("Instagram OAuth user profile fetch failed", {
        status: userResponse.status,
        userData,
      });
      throw new Error(userData?.error?.message || "Failed to fetch user profile");
    }

    // 4. Find the Instagram Business Account linked to the user's Facebook Page
    // Step A: Get the user's managed Pages
    let igBusinessId: string | undefined;
    let pageAccessToken: string | undefined;
    let platformUsername = userData.name || "Instagram User";

    const pageEdges = [`me/accounts`, `${userData.id}/accounts`];
    let pagesData: { data?: unknown[]; error?: { message?: string } } = {};
    let pagesFound = false;
    for (const edge of pageEdges) {
      const pagesRes = await fetch(
        `https://graph.facebook.com/v19.0/${edge}?fields=id,name,access_token,tasks,instagram_business_account&access_token=${userToken}`
      );
      const currentPagesData = await pagesRes.json();
      if (!pagesRes.ok || currentPagesData?.error) {
        console.error("Instagram OAuth pages fetch failed", {
          edge,
          status: pagesRes.status,
          pagesData: currentPagesData,
        });
        continue;
      }
      pagesData = currentPagesData;
      if (Array.isArray(currentPagesData?.data) && currentPagesData.data.length > 0) {
        pagesFound = true;
        break;
      }
    }
    if (!pagesFound && (!Array.isArray(pagesData?.data) || pagesData.data.length === 0)) {
      throw new Error("Failed to fetch Facebook Pages for Instagram linkage");
    }
    const pages: Array<{
      id?: string;
      access_token?: string;
      name?: string;
      tasks?: string[];
      instagram_business_account?: { id?: string };
    }> = (pagesData?.data ?? []) as Array<{
      id?: string;
      access_token?: string;
      name?: string;
      tasks?: string[];
      instagram_business_account?: { id?: string };
    }>;

    // Step B: For each page, look up linked IG Business Account
    for (const page of pages) {
      if (!page.id || !page.access_token) continue;
      if (Array.isArray(page.tasks) && !page.tasks.includes("CREATE_CONTENT")) continue;

      const directIgBusinessId = page.instagram_business_account?.id;
      if (directIgBusinessId) {
        igBusinessId = directIgBusinessId;
        pageAccessToken = page.access_token;
        platformUsername = page.name || platformUsername;
        break;
      }

      const igRes = await fetch(
        `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
      );
      const igData = await igRes.json();
      if (!igRes.ok || igData?.error) {
        console.error("Instagram OAuth IG account lookup failed for page", {
          pageId: page.id,
          status: igRes.status,
          igData,
        });
        continue;
      }

      const igAccount = igData?.instagram_business_account;
      if (igAccount?.id) {
        igBusinessId = igAccount.id as string;
        pageAccessToken = page.access_token;

        // Fetch IG username
        try {
          const igProfileRes = await fetch(
            `https://graph.facebook.com/v19.0/${igBusinessId}?fields=username,name&access_token=${page.access_token}`
          );
          const igProfile = await igProfileRes.json();
          platformUsername = igProfile.username || igProfile.name || page.name || platformUsername;
        } catch (profileError) {
          console.error("Instagram OAuth IG profile fetch failed", {
            igBusinessId,
            pageId: page.id,
            error: profileError,
          });
          platformUsername = page.name || platformUsername;
        }
        break; // Use first linked IG Business Account
      }
    }

    if (!igBusinessId && process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
      try {
        const appAccessToken = `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`;
        const debugRes = await fetch(
          `https://graph.facebook.com/v19.0/debug_token?input_token=${encodeURIComponent(userToken)}&access_token=${encodeURIComponent(appAccessToken)}`
        );
        const debugData = await debugRes.json();
        if (!debugRes.ok || debugData?.error) {
          console.error("Instagram OAuth debug_token failed", {
            status: debugRes.status,
            debugData,
          });
        } else {
          type GranularScope = {
            scope?: string;
            target_ids?: string[];
          };
          const granularScopes: GranularScope[] = debugData?.data?.granular_scopes ?? [];
          const pageTargetIds = granularScopes
            .filter(
              (scope) =>
                scope.scope === "pages_show_list" ||
                scope.scope === "pages_manage_posts" ||
                scope.scope === "instagram_basic" ||
                scope.scope === "instagram_content_publish"
            )
            .flatMap((scope) => scope.target_ids ?? [])
            .filter(Boolean);

          const uniqueTargetIds = Array.from(new Set(pageTargetIds));
          for (const pageTargetId of uniqueTargetIds) {
            const pageDetailRes = await fetch(
              `https://graph.facebook.com/v19.0/${pageTargetId}?fields=id,name,access_token,tasks,instagram_business_account&access_token=${userToken}`
            );
            const pageDetailData = await pageDetailRes.json();

            if (!pageDetailRes.ok || pageDetailData?.error) {
              console.error("Instagram OAuth target_id lookup failed", {
                pageTargetId,
                status: pageDetailRes.status,
                pageDetailData,
              });
              continue;
            }

            const directIgId = pageDetailData?.instagram_business_account?.id as string | undefined;
            if (!directIgId) continue;

            igBusinessId = directIgId;
            pageAccessToken = (pageDetailData?.access_token as string | undefined) || pageAccessToken;
            platformUsername = (pageDetailData?.name as string | undefined) || platformUsername;
            break;
          }
        }
      } catch (debugError) {
        console.error("Instagram OAuth debug_token fallback exception", debugError);
      }
    }

    if (!igBusinessId || !pageAccessToken) {
      try {
        const connections = await getConnections(auth.userId, accountId);
        const facebookConnection = connections.find(
          (connection) =>
            connection.platform === "facebook" &&
            typeof connection.pageId === "string" &&
            connection.pageId.length > 0 &&
            typeof connection.pageAccessToken === "string" &&
            connection.pageAccessToken.length > 0
        );

        if (facebookConnection?.pageId && facebookConnection.pageAccessToken) {
          const linkedPageRes = await fetch(
            `https://graph.facebook.com/v19.0/${facebookConnection.pageId}?fields=id,name,instagram_business_account&access_token=${facebookConnection.pageAccessToken}`
          );
          const linkedPageData = await linkedPageRes.json();
          if (linkedPageRes.ok && !linkedPageData?.error) {
            const linkedIgId = linkedPageData?.instagram_business_account?.id as string | undefined;
            if (linkedIgId) {
              igBusinessId = linkedIgId;
              pageAccessToken = facebookConnection.pageAccessToken;
              platformUsername = (linkedPageData?.name as string | undefined) || platformUsername;
            }
          } else {
            console.error("Instagram OAuth fallback via facebook connection failed", {
              status: linkedPageRes.status,
              linkedPageData,
            });
          }
        }
      } catch (connectionFallbackError) {
        console.error("Instagram OAuth facebook-connection fallback exception", connectionFallbackError);
      }
    }

    if (igBusinessId && pageAccessToken) {
      try {
        const igProfileRes = await fetch(
          `https://graph.facebook.com/v19.0/${igBusinessId}?fields=username,name&access_token=${pageAccessToken}`
        );
        const igProfile = await igProfileRes.json();
        if (igProfileRes.ok && !igProfile?.error) {
          platformUsername = igProfile.username || igProfile.name || platformUsername;
        }
      } catch (profileError) {
        console.error("Instagram OAuth final IG profile fetch failed", {
          igBusinessId,
          error: profileError,
        });
      }
    }

    if (!igBusinessId || !pageAccessToken) {
      throw new Error("No linked Instagram Business account found. Link Instagram Business/Creator to a Facebook Page and reconnect.");
    }

    // 5. Upsert connection — store pageId (IG Business Account ID) for publishing
    await upsertConnection(auth.userId, accountId, "instagram", {
      accessToken: userToken,
      platformUserId: userData.id,
      platformUsername,
      scope: "instagram_basic,instagram_content_publish,instagram_manage_insights,pages_show_list,pages_read_engagement,pages_manage_metadata,business_management",
      pageId: igBusinessId,         // IG Business Account ID (used in /media endpoints)
      pageAccessToken,              // Page-scoped token required by Graph API
    });

    const response = NextResponse.redirect(new URL(`/${accountId}/accountPersona?connected=instagram`, process.env.NEXTAUTH_URL || req.url));
    response.cookies.delete("rp_oauth_account");
    response.cookies.delete("rp_oauth_instagram_redirect_uri");
    return response;
  } catch (error) {
    console.error("Instagram OAuth callback failed", {
      accountId,
      hasCodeParam: Boolean(code),
      errorParam: error ?? null,
    });
    const message = error instanceof Error ? encodeURIComponent(error.message) : "OAuth failed";
    const response = NextResponse.redirect(new URL(`/${accountId}/accountPersona?error=auth_failed&platform=instagram&reason=${message}`, process.env.NEXTAUTH_URL || req.url));
    response.cookies.delete("rp_oauth_account");
    response.cookies.delete("rp_oauth_instagram_redirect_uri");
    return response;
  }
}
