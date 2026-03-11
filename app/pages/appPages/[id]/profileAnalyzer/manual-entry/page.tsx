"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import TopMenu from "../../../components/topMenu/topMenu";
import { ManualDataEntry } from "../../../components/Shared/ManualDataEntry";
import type { ManualProfileData } from "../../../components/Shared/ManualDataEntry";
import type { Platform } from "../../../components/Shared/PlatformSelector";

export default function ManualEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const platform = (searchParams.get("platform") as Platform) || "linkedin";
  const accountId = (params?.id as string) || "1";

  const handleSubmit = (data: ManualProfileData) => {
    // Save to localStorage to avoid URL length limits
    if (typeof window !== "undefined") {
      localStorage.setItem("reachpilot_manual_data", JSON.stringify(data));
    }
    router.push(
      `/pages/appPages/${accountId}/profileAnalyzer/analyzed-account?platform=${platform}&source=manual_storage`,
    );
  };

  const handleCancel = () => {
    router.push(`/pages/appPages/${accountId}/profileAnalyzer`);
  };

  return (
    <>
      <TopMenu
        pageName="Manual Entry"
        tokens={2000}
      />
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          background: "#f5f5f5",
        }}
      >
        <ManualDataEntry
          platform={platform}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </>
  );
}
