import { NextResponse } from "next/server";
import { getCollection } from "@/lib/models/connection";

export async function GET() {
  try {
    const col = await getCollection();
    const connection = await col.findOne({ platform: 'facebook', accountId: '69aec54949b2b3a437016e50' });
    if (!connection) return NextResponse.json({ error: 'No FB connection found' });
    
    const token = connection.pageAccessToken;
    const pageId = connection.pageId;
    const sinceTs = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);

    const candidates = [
        "page_impressions",
        "page_impressions_unique",
        "page_posts_impressions",
        "page_posts_impressions_unique",
        "page_views_total",
        "page_video_views",
        "page_daily_follows",
        "page_daily_unfollows",
        "page_engaged_users",
        "page_post_engagements",
        "page_consumptions",
        "page_negative_feedback",
        "page_fans",
        "page_fan_adds",
        "page_impressions_organic",
        "page_impressions_organic_unique",
        "page_impressions_paid",
        "page_impressions_paid_unique",
        "page_impressions_viral",
        "page_impressions_viral_unique",
        "page_impressions_nonviral",
        "page_impressions_nonviral_unique",
    ];

    const results: Record<string, number | string> = {};

    for (const m of candidates) {
      const url = `https://graph.facebook.com/v19.0/${pageId}/insights?metric=${m}&period=day&since=${sinceTs}&access_token=${token}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const sum = data.data?.[0]?.values?.reduce((s: number, v: any) => s + (v.value || 0), 0) || 0;
        results[m] = sum;
      } else {
        const err = await res.json();
        results[m] = "ERR: " + err.error?.message;
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errMsg });
  }
}
