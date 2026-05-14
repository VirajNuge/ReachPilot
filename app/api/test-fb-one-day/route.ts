import { NextResponse } from "next/server";
import { getCollection } from "@/lib/models/connection";

export async function GET() {
  try {
    const col = await getCollection();
    const connection = await col.findOne({ platform: 'facebook', accountId: '69aec54949b2b3a437016e50' });
    if (!connection) return NextResponse.json({ error: 'No FB connection found' });
    
    const token = connection.pageAccessToken;
    const pageId = connection.pageId;
    const sinceTs = Math.floor((Date.now() - 1 * 24 * 60 * 60 * 1000) / 1000);

    const url = `https://graph.facebook.com/v18.0/${pageId}/insights?metric=page_impressions&period=day&since=${sinceTs}&access_token=${token}`;
    const res = await fetch(url);
    if (res.ok) {
      return NextResponse.json(await res.json());
    } else {
      return NextResponse.json({ error: await res.json() });
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errMsg });
  }
}
