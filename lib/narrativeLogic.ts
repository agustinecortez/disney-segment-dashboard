// lib/narrativeLogic.ts
// ─────────────────────────────────────────────────────────────────────────────
// Adaptive narrative logic for the New Method tab. If-then conditional text
// engine, framed against Disney's FY27 guidance (Q4 FY26 earnings release,
// November 17, 2026). Spec: docs/v3_spec.md section 6.
//
// No LLM calls — paragraph variants are conditional on forecast state.
// ─────────────────────────────────────────────────────────────────────────────

import { DriverValues, NEW_METHOD, SegmentKey } from "./disneyData";
import { NewForecast } from "./forecastMath";

export interface NarrativeOutput {
  headline: string; // P1 — FY27 Total Segment OI growth vs. guidance, segment check, FY28 path
  segmentCallout: string; // P2 — lead segment
  riskWatch: string; // P3 — risks and sensitivities
  editorialFrame: string; // P4 — only shown when well off guidance
}

export type HeadlineTone = "aggressive" | "in-line" | "conservative" | "contractionary";

const GUIDANCE_TOTAL = NEW_METHOD.guidance.total; // ~8%, excluding the 53rd week

function pct(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function fmtB(value: number): string {
  return `$${(value / 1000).toFixed(1)}B`;
}

function growth(current: number, prior: number): number {
  return ((current - prior) / Math.abs(prior)) * 100;
}

/** FY27 Total Segment OI growth vs. FY26 excluding the 53rd week (Disney's guidance basis). */
export function fy27TotalGrowth(forecast: NewForecast): number {
  return growth(forecast.fy27.totalSegmentOI, forecast.fy26Base.totalSegmentOI);
}

/** Tone bands on FY27 growth: aggressive ≥ 11%, in line 5–11%, conservative 0–5%, stress < 0%. */
export function classifyTone(fy27Growth: number): HeadlineTone {
  if (fy27Growth >= 11) return "aggressive";
  if (fy27Growth >= 5) return "in-line";
  if (fy27Growth >= 0) return "conservative";
  return "contractionary";
}

function segmentGrowth(forecast: NewForecast, key: SegmentKey): number {
  return growth(forecast.fy27[key].operatingIncome, forecast.fy26Base[key].operatingIncome);
}

function guidanceStatus(key: SegmentKey, g: number): string {
  const guide = NEW_METHOD.guidance[key];
  if (g < guide.low) return "below the range";
  if (guide.high !== null && g > guide.high) return "above the range";
  if (g < guide.low + 1) return "at the low end";
  return "within the range";
}

// ── Paragraph 1 — Headline ────────────────────────────────────────────────────

function buildHeadline(tone: HeadlineTone, forecast: NewForecast): string {
  const g = fy27TotalGrowth(forecast);
  const soiStr = fmtB(forecast.fy27.totalSegmentOI);
  const opener = `At current driver assumptions, this scenario projects FY27 Total Segment Operating Income of approximately ${soiStr}, ${pct(g)} over FY26 excluding the 53rd week (the basis Disney uses for its guidance)`;

  const toneText: Record<HeadlineTone, string> = {
    aggressive: `well above Disney's guidance of approximately ${GUIDANCE_TOTAL}% growth. Disney is guiding cautiously, with most of the year's growth expected in the first half; this scenario assumes stronger momentum than management has signaled.`,
    "in-line": `in line with Disney's guidance of approximately ${GUIDANCE_TOTAL}% growth.`,
    conservative: `below Disney's guidance of approximately ${GUIDANCE_TOTAL}% growth. This is a cautious case: slower streaming growth, softer parks demand, or margins that do not expand as management expects.`,
    contractionary: `a decline, against Disney's guidance of approximately ${GUIDANCE_TOTAL}% growth. This is a stress case that would materially miss Disney's own outlook.`,
  };

  const segmentCheck = (["entertainment", "sports", "experiences"] as SegmentKey[])
    .map((key) => {
      const sg = segmentGrowth(forecast, key);
      return `${NEW_METHOD.segments[key].name} ${pct(sg)} (guidance: ${NEW_METHOD.guidance[key].text}; ${guidanceStatus(key, sg)})`;
    })
    .join(", ");

  const fy28 = forecast.fy28.totalSegmentOI;
  const fy28Growth = growth(fy28, forecast.fy27.totalSegmentOI);

  return `${opener} — ${toneText[tone]} By segment: ${segmentCheck}. Holding the same drivers, FY28 reaches approximately ${fmtB(fy28)} (${pct(fy28Growth)}); Disney has not given FY28 guidance.`;
}

// ── Paragraph 2 — Lead segment ────────────────────────────────────────────────

function buildSegmentCallout(drivers: DriverValues, forecast: NewForecast): string {
  const delta = (key: SegmentKey) =>
    forecast.fy27[key].operatingIncome - forecast.fy26Base[key].operatingIncome;
  const keys: SegmentKey[] = ["entertainment", "sports", "experiences"];
  const lead = keys.reduce((best, key) => (delta(key) > delta(best) ? key : best), keys[0]);

  const g = segmentGrowth(forecast, lead);
  const oi = forecast.fy27[lead].operatingIncome;

  switch (lead) {
    case "entertainment": {
      const svodGrowth = ((1 + drivers.svodSubGrowth / 100) * (1 + drivers.svodArpuGrowth / 100) - 1) * 100;
      return `Entertainment adds the most operating income in this scenario (${pct(g)}). SVOD revenue grows about ${pct(svodGrowth)} from ${pct(drivers.svodSubGrowth)} subscriber growth and ${pct(drivers.svodArpuGrowth)} revenue per subscriber, Networks and vMVPD revenue moves ${pct(drivers.networksGrowth)}, and Content and IP grows a fixed ${NEW_METHOD.contentAndIpGrowth}%. At a ${drivers.entertainmentMargin.toFixed(1)}% segment margin, Entertainment earns approximately ${fmtB(oi)} in FY27. Disney stops reporting SVOD operating income from Q1 FY27, so the segment margin becomes the main way to track streaming profitability.`;
    }
    case "experiences":
      return `Experiences adds the most operating income in this scenario (${pct(g)}), driven by ${pct(drivers.attendanceGrowth)} attendance, ${pct(drivers.perCapitaGrowth)} per capita spending and ${pct(drivers.cruiseCapacityGrowth)} cruise capacity as Disney Destiny and Disney Adventure run a full year. At a ${drivers.experiencesMargin.toFixed(1)}% margin, Experiences earns approximately ${fmtB(oi)} in FY27, Disney's largest segment profit pool. Disney expects Experiences growth in the first half of the year and relatively flat results in the second half.`;
    case "sports": {
      const effective = (forecast.fy27.sports.operatingIncome / forecast.fy27.sports.revenue) * 100;
      return `Sports adds the most operating income in this scenario (${pct(g)}). Affiliate growth of ${pct(drivers.espnAffiliateGrowth)} and advertising growth of ${pct(drivers.sportsAdvertisingGrowth)} against ${pct(drivers.sportsRightsCostGrowth)} programming cost growth give an effective margin of about ${effective.toFixed(1)}%, or approximately ${fmtB(oi)} of FY27 operating income. Disney expects Sports operating income to decline in Q1 on College Football Playoff timing before growing for the full year.`;
    }
  }
}

// ── Paragraph 3 — Risk and watch-points ───────────────────────────────────────

function buildRiskWatch(tone: HeadlineTone, drivers: DriverValues, forecast: NewForecast): string {
  const fy27 = forecast.fy27;
  const expSwing = fy27.experiences.revenue * 0.1 * (drivers.experiencesMargin / 100);
  const entSwing = fy27.entertainment.revenue * 0.1 * (drivers.entertainmentMargin / 100);
  const sensitivity = `a 10% relative shift in the Experiences margin (currently ${drivers.experiencesMargin.toFixed(1)}%) moves FY27 Total Segment OI by approximately ±${fmtB(expSwing)}, and the same shift in the Entertainment margin (currently ${drivers.entertainmentMargin.toFixed(1)}%) moves it by approximately ±${fmtB(entSwing)}`;

  if (tone === "aggressive") {
    return `Key sensitivities: ${sensitivity}. For this scenario to hold, several tailwinds would need to arrive together: SVOD pricing sticking without subscriber losses, parks attendance holding up despite consumer pressure at Shanghai and Hong Kong, and margins expanding faster than Disney has guided. Disney's guidance assumes no material deterioration of the global macroeconomic environment.`;
  }

  if (tone === "contractionary") {
    return `Key sensitivities: ${sensitivity}. The likeliest paths to a decline are an Experiences margin squeeze from softer parks demand combined with streaming growth stalling after price increases. Disney's cost base is largely committed in the near term: $11.2B of sports programming payments fall due in FY27 and cash content spending rises about 9%, which limits how quickly costs can follow revenue down.`;
  }

  return `Key sensitivities: ${sensitivity}. FY27 watch-points: consumer pressure at Shanghai and Hong Kong, which Disney expects to continue; sports rights costs as cash content spending rises about 9% to about $26B; and whether price increases hold SVOD subscribers. Disney's guidance assumes no material deterioration of the global macroeconomic environment. Use the sensitivity chart to stress-test individual drivers.`;
}

// ── Paragraph 4 — Editorial frame (conditional) ───────────────────────────────

function buildEditorialFrame(tone: HeadlineTone, fy27Growth: number): string {
  if (tone === "aggressive") {
    return `This scenario is meaningfully above Disney's own outlook: Disney guides FY27 Total Segment OI growth of approximately ${GUIDANCE_TOTAL}% excluding the 53rd week, and this scenario projects ${pct(fy27Growth)}. In FY26 Disney's outlook proved more accurate than this tool's evidence-only forecast, which ran $1.1B high. High-side scenarios here are best read as sensitivity tests rather than point estimates.`;
  }
  if (tone === "contractionary") {
    return `This scenario would be a significant negative surprise against Disney's guidance of approximately ${GUIDANCE_TOTAL}% growth. Scenarios of this size are usually tested against specific risks — a domestic parks slowdown, streaming churn after price increases, or a step-up in sports rights costs. The sensitivity chart shows which single driver does the most to close the gap to the in-line case.`;
  }
  return "";
}

// ── Main export ────────────────────────────────────────────────────────────────

export function generateNarrative(drivers: DriverValues, forecast: NewForecast): NarrativeOutput {
  const g = fy27TotalGrowth(forecast);
  const tone = classifyTone(g);
  const showEditorial =
    Math.abs(g - GUIDANCE_TOTAL) > 4 && (tone === "aggressive" || tone === "contractionary");

  return {
    headline: buildHeadline(tone, forecast),
    segmentCallout: buildSegmentCallout(drivers, forecast),
    riskWatch: buildRiskWatch(tone, drivers, forecast),
    editorialFrame: showEditorial ? buildEditorialFrame(tone, g) : "",
  };
}
