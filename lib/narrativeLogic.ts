// lib/narrativeLogic.ts
// ─────────────────────────────────────────────────────────────────────────────
// Adaptive narrative logic. Placeholder — returns empty strings until Step 9.
// ─────────────────────────────────────────────────────────────────────────────

import { DriverValues } from "./disneyData";
import { FullForecast } from "./forecastMath";

export interface NarrativeOutput {
  headline: string;       // Paragraph 1 — FY26 SOI growth vs guidance
  segmentCallout: string; // Paragraph 2 — leading segment
  riskWatch: string;      // Paragraph 3 — risks and sensitivities
  editorialFrame: string; // Paragraph 4 — only shown when off-consensus >5pp
}

// ── Placeholder ───────────────────────────────────────────────────────────────

export function generateNarrative(
  _drivers: DriverValues,
  _forecast: FullForecast
): NarrativeOutput {
  return {
    headline: "",
    segmentCallout: "",
    riskWatch: "",
    editorialFrame: "",
  };
}
