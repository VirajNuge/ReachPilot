"use client";

import React, { Suspense } from "react";
import { PostGeneratorPage } from "../../components/PostGenerator/PostGeneratorPage";

export default function PostGeneratorRoute() {
  return (
    <Suspense fallback={null}>
      <PostGeneratorPage />
    </Suspense>
  );
}
