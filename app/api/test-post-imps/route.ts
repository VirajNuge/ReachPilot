import { NextResponse } from "next/server";
import { getCollection } from "@/lib/models/connection";

export async function GET() {
  try {
    const col = await getCollection();
    const connection = await col.findOne({ platform: 'facebook', accountId: '69aec54949b2b3a437016e50' });
    if (!connection) return NextResponse.json({ error: 'No FB connection found' });
    
    const token = connection.pageAccessToken;
    const pageId = connection.pageId;

    const resPosts = await fetch(`https://graph.facebook.com/v19.0/${pageId}/posts?access_token=${token}`);
    const posts = await resPosts.json();
    
    const results: Record<string, number> = {};
    for (const post of posts.data || []) {
        const resIns = await fetch(`https://graph.facebook.com/v19.0/${post.id}/insights?metric=post_impressions&access_token=${token}`);
        const ins = await resIns.json();
        results[post.id] = ins.data?.[0]?.values?.[0]?.value || 0;
    }

    return NextResponse.json(results);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errMsg });
  }
}
