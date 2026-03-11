# Persona Builder Redesign — Useful Fields Only + AI Wiring

## TL;DR

> **Quick Summary**: Completely redesign the Account Persona Builder from a bloated 8-step, ~30-field form to a focused 5-step, ~20-field form collecting only data that directly powers AI generation. Simultaneously wire the persona data (currently saved but ignored) into the Gemini AI routes so it actually affects content output.
>
> **Deliverables**:
> - New 5-step persona form with high-value fields (uniquePOV, writingSamples, productsServices, credibilitySignals)
> - Persona pre-loaded from DB on mount (currently broken — starts blank every visit)
> - Extracted shared form component primitives
> - Updated PersonaDocument TypeScript interface and save API (backward compatible)
> - New lib/personaPromptBuilder.ts — pure function that converts persona to Gemini system prompt string
> - Persona injected into generate-solution and chatbot AI routes
> - Vitest unit tests for the prompt builder
>
> **Estimated Effort**: Medium (3-5 days)
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: Task 1 → Task 2+3 → Task 4+5 → Task 6 → Final Wave

