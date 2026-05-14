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

    const metrics = ['page_posts_impressions', 'page_posts_impressions_unique', 'page_views_total', 'page_video_views', 'page_engaged_users', 'page_post_engagements'];
    const results: Record<string, number> = {};

    for (const m of metrics) {
      const url = `https://graph.facebook.com/v21.0/${pageId}/insights?metric=${m}&period=days_28&access_token=${token}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        results[m] = data.data?.[0]?.values?.[0]?.value || 0;
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errMsg });
  }
}
