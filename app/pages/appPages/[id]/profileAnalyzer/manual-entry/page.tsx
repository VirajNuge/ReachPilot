"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TopMenu from "../../../components/topMenu/topMenu";
import { ManualDataEntry } from "../../../components/Shared/ManualDataEntry";
import type { ManualProfileData } from "../../../components/Shared/ManualDataEntry";
import type { Platform } from "../../../components/Shared/PlatformSelector";

export default function ManualEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const platform = (searchParams.get("platform") as Platform) || "linkedin";

  const handleSubmit = (data: ManualProfileData) => {
    // Encode the manual data and navigate to analysis page
    const encodedData = encodeURIComponent(JSON.stringify(data));
    router.push(
      `/pages/appPages/1/profileAnalyzer/analyzed-account?platform=${platform}&manual=true&data=${encodedData}`,
    );
  };

  const handleCancel = () => {
    router.push("/pages/appPages/1/profileAnalyzer");
  };

  return (
    <>
      <TopMenu
        pageName="Manual Entry"
        userName="Robert Downey Jr."
        userTier="Free Tier"
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
