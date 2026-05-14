import { NextResponse } from "next/server";
import { getCollection } from "@/lib/models/connection";

export async function GET() {
  try {
    const col = await getCollection();
    const connection = await col.findOne({ platform: 'facebook', accountId: '69aec54949b2b3a437016e50' });
    if (!connection) return NextResponse.json({ error: 'No FB connection found' });
    
    const token = connection.pageAccessToken;
    const pageId = connection.pageId;

    const url = `https://graph.facebook.com/v21.0/${pageId}/insights?metric=page_impressions&access_token=${token}`;
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
