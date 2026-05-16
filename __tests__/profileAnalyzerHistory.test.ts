import { describe, it, expect } from "vitest";

// Basic smoke tests for profileAnalyzerHistory model. These tests require MONGO_URI
// to be set in the environment. If not set, tests are skipped.

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  describe.skip("profileAnalyzerHistory (requires MONGO_URI)", () => {
    it("skipped because MONGO_URI not set", () => {});
  });
} else {
  import("../lib/models/profileAnalyzerHistory").then((mod) => {
    const { createProfileAnalysisHistory, getAnalysisById, deleteAnalysis } = mod;

    describe("profileAnalyzerHistory", () => {
      it("can create, fetch and delete an analysis", async () => {
        const id = await createProfileAnalysisHistory("test-user", "test-account", {
          platform: "linkedin",
          profileHandle: "test-handle",
          profileName: "Test User",
          overallScore: 42,
          analysisData: { dummy: true },
          snapshot: {},
          status: "completed",
        });

        expect(id).toBeTruthy();

        const fetched = await getAnalysisById(id);
        expect(fetched).not.toBeNull();
        expect(fetched?.profileHandle).toBe("test-handle");

        const deleted = await deleteAnalysis(id, "test-user");
        expect(deleted).toBe(true);
      });
    });
  });
}
