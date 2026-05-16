import { NextRequest, NextResponse } from "next/server";
import { triggerRecurringAnalyses } from "../../../../lib/jobs/recurringAnalysis";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await triggerRecurringAnalyses();
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Cron recurring-analysis failed:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
