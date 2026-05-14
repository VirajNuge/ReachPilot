import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { upsertConnection } from "@/lib/models/connection";

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
    console.error("Facebook OAuth callback missing accountId", {
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
    req.cookies.get("rp_oauth_facebook_redirect_uri")?.value?.trim() ||
    process.env.FACEBOOK_REDIRECT_URI?.trim() ||
    new URL("/api/auth/facebook/callback", req.nextUrl.origin).toString();

  if (error || !code) {
    const response = NextResponse.redirect(new URL(`/${accountId}/accountPersona?error=auth_denied`, process.env.NEXTAUTH_URL || req.url));
    response.cookies.delete("rp_oauth_account");
    response.cookies.delete("rp_oauth_facebook_redirect_uri");
    return response;
  }

  try {
    if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
      throw new Error("Missing Facebook OAuth app credentials");
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
      console.error("Facebook OAuth token exchange failed", {
        status: tokenResponse.status,
        tokenError: tokenData?.error ?? null,
        tokenData,
      });
      throw new Error(tokenData?.error?.message || "Token exchange failed");
    }

    const shortLivedToken = tokenData.access_token;

    // 2. Exchange for long-lived user token (~60 days)
    const longLivedUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", process.env.FACEBOOK_APP_ID!);
    longLivedUrl.searchParams.set("client_secret", process.env.FACEBOOK_APP_SECRET!);
    longLivedUrl.searchParams.set("fb_exchange_token", shortLivedToken);

    const longLivedResponse = await fetch(longLivedUrl.toString());
    const longLivedData = await longLivedResponse.json();
    if (!longLivedResponse.ok || longLivedData?.error) {
      console.error("Facebook OAuth long-lived token exchange failed", {
        status: longLivedResponse.status,
        tokenError: longLivedData?.error ?? null,
        tokenData: longLivedData,
      });
      throw new Error(longLivedData?.error?.message || "Long-lived token exchange failed");
    }
    const userToken = longLivedData.access_token || shortLivedToken;

    // 3. Fetch Facebook user profile
    const userResponse = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${userToken}`);
    const userData = await userResponse.json();
    if (!userResponse.ok || userData?.error) {
      console.error("Facebook OAuth user profile fetch failed", {
        status: userResponse.status,
        userData,
      });
      throw new Error(userData?.error?.message || "Failed to fetch user profile");
    }

    // 4. Fetch managed Pages to get Page Access Token (required for publishing)
    let pageId: string | undefined;
    let pageAccessToken: string | undefined;
    let platformUsername = userData.name;

    type FacebookPage = {
      id?: string;
      name?: string;
      access_token?: string;
      tasks?: string[];
    };

    const fetchPagesWithToken = async (
      token: string,
      tokenKind: "long_lived" | "short_lived"
    ): Promise<FacebookPage[]> => {
      const edges = [`me/accounts`, `${userData.id}/accounts`];
      for (const edge of edges) {
        const res = await fetch(
          `https://graph.facebook.com/v19.0/${edge}?fields=id,name,access_token,tasks&access_token=${token}`
        );
        const data = await res.json();
        if (!res.ok || data?.error) {
          console.error("Facebook OAuth pages fetch failed", {
            tokenKind,
            edge,
            status: res.status,
            data,
          });
          continue;
        }
        const pages = (data?.data ?? []) as FacebookPage[];
        if (pages.length > 0) return pages;
      }

      // Some accounts expose managed pages more reliably via nested accounts edge.
      const nestedRes = await fetch(
        `https://graph.facebook.com/v19.0/me?fields=accounts{id,name,access_token,tasks}&access_token=${token}`
      );
      const nestedData = await nestedRes.json();
      if (!nestedRes.ok || nestedData?.error) {
        console.error("Facebook OAuth nested accounts fetch failed", {
          tokenKind,
          status: nestedRes.status,
          data: nestedData,
        });
      } else {
        const nestedPages = (nestedData?.accounts?.data ?? []) as FacebookPage[];
        if (nestedPages.length > 0) return nestedPages;
      }

      return [];
    };

    const pagesFromLongLived = await fetchPagesWithToken(userToken, "long_lived");
    const pagesFromShortLived =
      pagesFromLongLived.length === 0 && shortLivedToken !== userToken
        ? await fetchPagesWithToken(shortLivedToken, "short_lived")
        : [];

    const pagesById = new Map<string, FacebookPage>();
    for (const page of [...pagesFromLongLived, ...pagesFromShortLived]) {
      if (!page.id) continue;
      const existing = pagesById.get(page.id);
      if (!existing) {
        pagesById.set(page.id, page);
        continue;
      }

      pagesById.set(page.id, {
        id: page.id,
        name: page.name || existing.name,
        access_token: page.access_token || existing.access_token,
        tasks: Array.isArray(page.tasks) && page.tasks.length > 0 ? page.tasks : existing.tasks,
      });
    }

    let pages = Array.from(pagesById.values());

    if (pages.length === 0 && process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
      try {
        const appAccessToken = `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`;
        const debugRes = await fetch(
          `https://graph.facebook.com/v19.0/debug_token?input_token=${encodeURIComponent(userToken)}&access_token=${encodeURIComponent(appAccessToken)}`
        );
        const debugData = await debugRes.json();
        if (!debugRes.ok || debugData?.error) {
          console.error("Facebook OAuth debug_token failed", {
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
            .filter((scope) => scope.scope === "pages_show_list" || scope.scope === "pages_manage_posts")
            .flatMap((scope) => scope.target_ids ?? [])
            .filter(Boolean);

          const uniqueTargetIds = Array.from(new Set(pageTargetIds));
          if (uniqueTargetIds.length > 0) {
            console.error("Facebook OAuth using target_ids fallback", {
              targetIdsCount: uniqueTargetIds.length,
              targetIds: uniqueTargetIds,
            });
          }

          for (const pageTargetId of uniqueTargetIds) {
            const detailCandidates: FacebookPage[] = [];

            const detailResLong = await fetch(
              `https://graph.facebook.com/v19.0/${pageTargetId}?fields=id,name,access_token,tasks&access_token=${userToken}`
            );
            const detailDataLong = await detailResLong.json();
            if (detailResLong.ok && !detailDataLong?.error) {
              detailCandidates.push({
                id: detailDataLong.id,
                name: detailDataLong.name,
                access_token: detailDataLong.access_token,
                tasks: detailDataLong.tasks,
              });
            }

            if (detailCandidates.length === 0 && shortLivedToken !== userToken) {
              const detailResShort = await fetch(
                `https://graph.facebook.com/v19.0/${pageTargetId}?fields=id,name,access_token,tasks&access_token=${shortLivedToken}`
              );
              const detailDataShort = await detailResShort.json();
              if (detailResShort.ok && !detailDataShort?.error) {
                detailCandidates.push({
                  id: detailDataShort.id,
                  name: detailDataShort.name,
                  access_token: detailDataShort.access_token,
                  tasks: detailDataShort.tasks,
                });
              } else {
                console.error("Facebook OAuth target_id page fetch failed", {
                  pageTargetId,
                  status: detailResShort.status,
                  detailData: detailDataShort,
                  tokenKind: "short_lived",
                });
              }
            }

            for (const candidate of detailCandidates) {
              if (!candidate.id) continue;
              pagesById.set(candidate.id, candidate);
            }
          }

          pages = Array.from(pagesById.values());
        }
      } catch (debugError) {
        console.error("Facebook OAuth debug_token fallback exception", debugError);
      }
    }

    let publishablePage =
      pages.find(
        (page) =>
          Boolean(page.id) &&
          Boolean(page.access_token) &&
          Array.isArray(page.tasks) &&
          page.tasks.includes("CREATE_CONTENT")
      ) ??
      pages.find((page) => Boolean(page.id) && Boolean(page.access_token));

    if (!publishablePage?.access_token && pages.length > 0) {
      const candidatePageId = pages[0]?.id;
      if (candidatePageId) {
        const pageDetailsRes = await fetch(
          `https://graph.facebook.com/v19.0/${candidatePageId}?fields=id,name,access_token,tasks&access_token=${userToken}`
        );
        const pageDetails = await pageDetailsRes.json();
        if (pageDetailsRes.ok && !pageDetails?.error) {
          publishablePage = {
            id: pageDetails.id,
            name: pageDetails.name,
            access_token: pageDetails.access_token,
            tasks: pageDetails.tasks,
          };
        } else {
          console.error("Facebook OAuth page details fallback failed", {
            candidatePageId,
            status: pageDetailsRes.status,
            pageDetails,
          });
        }
      }
    }

    if (!publishablePage?.id || !publishablePage?.access_token) {
      const pagesSummary = pages.map((page) => ({
        id: page.id ?? null,
        hasAccessToken: Boolean(page.access_token),
        tasks: Array.isArray(page.tasks) ? page.tasks : [],
      }));
      let permissionsSummary: Array<{ permission?: string; status?: string }> = [];
      try {
        const permsRes = await fetch(
          `https://graph.facebook.com/v19.0/me/permissions?access_token=${userToken}`
        );
        const permsData = await permsRes.json();
        if (permsRes.ok && Array.isArray(permsData?.data)) {
          permissionsSummary = permsData.data.map((item: { permission?: string; status?: string }) => ({
            permission: item.permission,
            status: item.status,
          }));
        } else {
          console.error("Facebook OAuth permissions fetch failed", {
            status: permsRes.status,
            permsData,
          });
        }
      } catch (permError) {
        console.error("Facebook OAuth permissions fetch exception", permError);
      }

      console.error("Facebook OAuth no publishable page", {
        pagesCount: pages.length,
        pagesSummary,
        permissionsSummary,
      });
      throw new Error(`No publishable Facebook Page found. pages_count=${pages.length}. Verify pages_show_list and pages_manage_posts are granted.`);
    }

    pageId = publishablePage.id;
    pageAccessToken = publishablePage.access_token;
    platformUsername = publishablePage.name || userData.name;

    // 5. Upsert connection with both user token and page token
    await upsertConnection(auth.userId, accountId, "facebook", {
      accessToken: userToken,
      platformUserId: userData.id,
      platformUsername,
      scope: "pages_manage_posts,pages_manage_metadata,pages_read_engagement,pages_show_list,read_insights,public_profile,business_management",
      pageId,
      pageAccessToken,
    });

    const response = NextResponse.redirect(new URL(`/${accountId}/accountPersona?connected=facebook`, process.env.NEXTAUTH_URL || req.url));
    response.cookies.delete("rp_oauth_account");
    response.cookies.delete("rp_oauth_facebook_redirect_uri");
    return response;
  } catch (error) {
    console.error("Facebook OAuth callback failed", {
      accountId,
      hasCodeParam: Boolean(code),
      errorParam: error ?? null,
    });
    const message = error instanceof Error ? encodeURIComponent(error.message) : "OAuth failed";
    const response = NextResponse.redirect(new URL(`/${accountId}/accountPersona?error=auth_failed&platform=facebook&reason=${message}`, process.env.NEXTAUTH_URL || req.url));
    response.cookies.delete("rp_oauth_account");
    response.cookies.delete("rp_oauth_facebook_redirect_uri");
    return response;
  }
}
