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

    const periods = ['day', 'week', 'days_28'];
    const results: Record<string, number | string> = {};

    for (const p of periods) {
      const url = `https://graph.facebook.com/v21.0/${pageId}/insights?metric=page_impressions&period=${p}&since=${sinceTs}&access_token=${token}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        results[p] = data.data?.[0]?.values?.reduce((s: number, v: any) => s + (v.value || 0), 0) || 0;
      } else {
        const err = await res.json();
        results[p] = "ERROR: " + JSON.stringify(err);
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errMsg });
  }
}
