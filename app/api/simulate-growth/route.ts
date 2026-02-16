import { NextRequest, NextResponse } from "next/server";
import { GrowthSimulationResult } from "../../../lib/types/analysis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { authority = 0, frequency = 0 } = body.input || {};

    // --- Simulation Logic (Algorithmic / "The Lab") ---
    // In a real app, this would use a more complex model or AI.
    // Here we use multipliers based on the "sliders" to show impact.

    // Base values (could be fetched from valid session/profile if needed)
    const baseFollowers = 1000;
    const baseEngagement = 50;
    const baseRevenue = 0;

    // Multipliers
    const authorityMultiplier = 1 + authority / 100; // e.g. 20 -> 1.2x
    const frequencyMultiplier = 1 + frequency / 50; // e.g. 50 -> 2.0x (diminishing returns logic could be added)

    // Calculate Outcomes
    const projectedFollowers = Math.floor(
      baseFollowers * authorityMultiplier * frequencyMultiplier,
    );
    const projectedEngagement = Math.floor(
      baseEngagement * (authorityMultiplier * 0.8) * frequencyMultiplier,
    );
    const projectedRevenue = Math.floor(
      projectedFollowers * 0.1 * authorityMultiplier,
    ); // $0.10 per follower * authority quality

    // Generate Graph Data (30 Days)
    const trajectory_graph = Array.from({ length: 30 }, (_, i) => {
      // Linear growth example
      const progress = (i + 1) / 30;
      const dailyValue = Math.floor(
        baseEngagement + (projectedEngagement - baseEngagement) * progress,
      );
      return { day: i + 1, value: dailyValue };
    });

    const result: GrowthSimulationResult = {
      input: { authority, frequency },
      outcome: {
        followers: projectedFollowers,
        engagement: projectedEngagement,
        revenue_potential: projectedRevenue,
      },
      trajectory_graph,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      { error: "Failed to run simulation" },
      { status: 500 },
    );
  }
}
