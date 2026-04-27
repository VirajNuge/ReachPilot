/**
 * Initialize Analytics Models
 * 
 * This module ensures all MongoDB indexes are created on app startup.
 * Call this in your initialization code (e.g., app middleware).
 */

import { ensurePostIndexes } from "../models/socialMediaPost";
import { ensureMetricsIndexes } from "../models/socialMediaMetrics";

let isInitialized = false;

/**
 * Initialize all analytics models and indexes
 * Safe to call multiple times (uses flag to prevent redundant operations)
 */
export async function initializeAnalyticsModels(): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    console.log("[Analytics] Initializing models...");
    
    await Promise.all([
      ensurePostIndexes(),
      ensureMetricsIndexes(),
    ]);
    
    isInitialized = true;
    console.log("[Analytics] Models initialized successfully");
  } catch (error) {
    console.error("[Analytics] Failed to initialize models:", error);
    // Don't throw - allow app to start even if this fails
    // Next request will try again
  }
}

/**
 * Check if models are initialized
 */
export function areAnalyticsModelsInitialized(): boolean {
  return isInitialized;
}

/**
 * Force re-initialization (useful for testing)
 */
export function resetAnalyticsModels(): void {
  isInitialized = false;
}
