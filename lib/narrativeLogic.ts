// lib/narrativeLogic.ts
// ─────────────────────────────────────────────────────────────────────────────
// Adaptive narrative logic. If-then conditional text engine.
// Spec: Section 9, Disney_Dashboard_Build_Spec_v1_1.md
//
// No LLM calls — 4-6 paragraph variants per slot, conditional on forecast state.
// LLM-generated narrative deferred to v1.5 per spec Decision 8.
// ─────────────────────────────────────────────────────────────────────────────

import { DriverValues } from "./disneyData";
import { FullForecast } from "./forecastMath";

export interface NarrativeOutput {
  headline: string;       // P1 — FY26 SOI growth vs. guidance
  segmentCallout: string; // P2 — leading segment driver
  riskWatch: string;      // P3 — risks and sensitivities
  editorialFrame: string; // P4 — only shown when >5pp off-consensus
}

// ── Helper types ──────────────────────────────────────────────────────────────

type HeadlineTone = "aggressive" | "in-line" | "conservative" | "contractionary";
type LeadSegment = "entertainment" | "sports" | "experiences";

function pct(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function fmtB(value: number): string {
  return `$${(value / 1000).toFixed(1)}B`;
}

// ── Paragraph 1 — Headline ────────────────────────────────────────────────────

function buildHeadline(
  tone: HeadlineTone,
  fy26Growth: number,
  fy26SOI: number,
  fy28SOI: number
): string {
  const growthStr = pct(fy26Growth);
  const soiStr = fmtB(fy26SOI);
  const fy28Str = fmtB(fy28SOI);

  switch (tone) {
    case "aggressive":
      return `At current driver assumptions, this scenario projects FY26 Total Segment Operating Income of approximately ${soiStr}, representing ${growthStr} growth over FY25 — well above the high end of Disney's stated FY26 guidance range. This is an optimistic scenario that assumes a combination of DTC subscriber acceleration, strong per-capita spending at the parks, and margin expansion across all three segments simultaneously. If sustained, the three-year path reaches approximately ${fy28Str} in Total Segment OI by FY28.`;

    case "in-line":
      return `At current driver assumptions, this scenario projects FY26 Total Segment Operating Income of approximately ${soiStr}, representing ${growthStr} growth over FY25 — broadly in line with Disney's stated FY26 guidance (double-digit adjusted EPS growth implies comparable Total Segment OI growth). Default assumptions align with management's own disclosed outlook: DTC margin expansion, modest ESPN affiliate stabilization, and Experiences growth driven by cruise fleet expansion. If momentum is maintained, the three-year path reaches approximately ${fy28Str} in Total Segment OI by FY28.`;

    case "conservative":
      return `At current driver assumptions, this scenario projects FY26 Total Segment Operating Income of approximately ${soiStr}, representing ${growthStr} growth over FY25 — at or below the low end of Disney's guidance range. This scenario reflects a more cautious view: slower DTC subscriber or ARPU growth, more modest Experiences contribution, or margin pressure that offsets revenue gains. Disney would still be generating significant operating income, but below management's stated ambitions. The three-year path reaches approximately ${fy28Str} in Total Segment OI by FY28.`;

    case "contractionary":
      return `At current driver assumptions, this scenario projects FY26 Total Segment Operating Income of approximately ${soiStr} — implying year-over-year contraction of ${Math.abs(fy26Growth).toFixed(1)}% versus FY25's ${fmtB(17551)} base. This is a stress scenario that would materially miss Disney's own FY26 guidance. Sustained contraction at this level would likely trigger significant management action — further cost restructuring, content spend moderation, or strategic portfolio changes. The three-year path reaches approximately ${fy28Str} in Total Segment OI by FY28 under these assumptions.`;
  }
}

// ── Paragraph 2 — Segment callout ─────────────────────────────────────────────

function buildSegmentCallout(
  leadSegment: LeadSegment,
  drivers: DriverValues,
  forecast: FullForecast
): string {
  const fy25 = forecast.fy25Actual;
  const fy26 = forecast.fy26;

  const entGrowth =
    ((fy26.entertainment.operatingIncome - fy25.entertainment.operatingIncome) /
      Math.abs(fy25.entertainment.operatingIncome)) *
    100;
  const spoGrowth =
    ((fy26.sports.operatingIncome - fy25.sports.operatingIncome) /
      Math.abs(fy25.sports.operatingIncome)) *
    100;
  const expGrowth =
    ((fy26.experiences.operatingIncome - fy25.experiences.operatingIncome) /
      Math.abs(fy25.experiences.operatingIncome)) *
    100;

  switch (leadSegment) {
    case "entertainment":
      return `Entertainment is the largest contributor to year-over-year operating income growth in this scenario (${pct(entGrowth)} YoY). The primary lever is DTC: subscriber growth of ${pct(drivers.dtcSubGrowth)} and ARPU growth of ${pct(drivers.dtcArpuGrowth)} compound to expand the DTC revenue base, while the ${Math.abs(drivers.linearDecline).toFixed(1)}% linear networks decline creates a partially offsetting headwind. Disney has explicitly guided to 10% DTC SVOD operating margin in FY26; this scenario applies a ${drivers.entertainmentMargin.toFixed(1)}% blended Entertainment segment margin, ${drivers.entertainmentMargin > 11 ? "above" : drivers.entertainmentMargin < 11 ? "below" : "in line with"} the FY25 actual of 11.0%.`;

    case "experiences":
      return `Experiences is the largest contributor to year-over-year operating income growth in this scenario (${pct(expGrowth)} YoY), driven by ${drivers.cruiseCapacityGrowth.toFixed(1)}% cruise line capacity expansion as new ships enter service and ${pct(drivers.perCapitaGrowth)} per-capita guest spending growth. Domestic parks attendance is assumed ${drivers.attendanceGrowth === 0 ? "flat, consistent with the FY25 trend" : `at ${pct(drivers.attendanceGrowth)}`}. At a ${drivers.experiencesMargin.toFixed(1)}% operating margin, Experiences generates approximately ${fmtB(fy26.experiences.operatingIncome)} in FY26 OI — the single largest segment profit pool.`;

    case "sports":
      return `Sports is the largest contributor to year-over-year operating income growth in this scenario (${pct(spoGrowth)} YoY). ESPN affiliate revenue growth of ${pct(drivers.espnAffiliateGrowth)} and advertising growth of ${pct(drivers.sportsAdvertisingGrowth)} both outpace the contractual sports rights cost escalation embedded in this model. This is a notable assumption: the NBA's new rights deal starts FY26 and represents a meaningful cost step-up. At ${drivers.sportsMargin.toFixed(1)}% operating margin, Sports generates approximately ${fmtB(fy26.sports.operatingIncome)} in FY26 OI. Entertainment (${pct(entGrowth)}) and Experiences (${pct(expGrowth)}) contribute more modestly in this scenario.`;
  }
}

// ── Paragraph 3 — Risk and watch-points ───────────────────────────────────────

function buildRiskWatch(
  tone: HeadlineTone,
  drivers: DriverValues,
  forecast: FullForecast
): string {
  const fy26 = forecast.fy26;

  // Compute the two largest sensitivities for the risk paragraph
  const expMarginSwingApprox = fy26.experiences.revenue * 0.1 * 0.276; // ~10% relative on 27.6%
  const entMarginSwingApprox = fy26.entertainment.revenue * 0.1 * 0.11;

  const topSensitivity = `a 10% relative shift in the Experiences operating margin (currently ${drivers.experiencesMargin.toFixed(1)}%) moves FY26 Total Segment OI by approximately ±${fmtB(expMarginSwingApprox)}, and the same shift in Entertainment margin moves it by approximately ±${fmtB(entMarginSwingApprox)}`;

  if (tone === "aggressive") {
    return `Key sensitivities: ${topSensitivity}. For this scenario to materialize, several tailwinds would need to converge simultaneously — DTC subscribers growing at ${pct(drivers.dtcSubGrowth)}, cruise capacity expanding at ${drivers.cruiseCapacityGrowth.toFixed(0)}%, and per-capita park spending continuing to compound at ${pct(drivers.perCapitaGrowth)}. The most exposed assumptions are DTC subscriber growth (Netflix competitive intensity is the primary swing factor) and the Experiences margin, which faces near-term pressure from cruise pre-opening costs. The tornado chart to the left ranks drivers by sensitivity.`;
  }

  if (tone === "contractionary") {
    return `Key sensitivities: ${topSensitivity}. For this stress scenario to materialize, multiple headwinds would need to compound simultaneously. The most likely pathways to contraction are an Experiences margin compression below 22% (driven by cruise ramp costs exceeding projections or domestic parks demand softness) combined with DTC subscriber growth stalling due to competitive pressure. Disney's cost structure is largely fixed in the near term — sports rights contracts, content commitments, and resort operating costs limit the company's ability to rapidly reduce expenses if revenue disappoints.`;
  }

  return `Key sensitivities: ${topSensitivity}. The most exposed driver to external shock is sports advertising (tied to the broader advertising cycle and the absence of a political ad tailwind in even years), followed by DTC subscriber growth given competitive intensity from Netflix, Amazon Prime Video, and Warner Bros. Discovery. Parks attendance is assumed ${drivers.attendanceGrowth === 0 ? "flat" : pct(drivers.attendanceGrowth)} — a domestic softening could move Experiences OI materially given the segment's high fixed-cost operating leverage. Use the sensitivity chart to stress-test individual drivers.`;
}

// ── Paragraph 4 — Editorial frame (conditional) ───────────────────────────────

function buildEditorialFrame(
  tone: HeadlineTone,
  fy26Growth: number
): string {
  // Disney's guidance midpoint is ~10% SOI growth (double-digit = 10-15%)
  // Show this paragraph only when >5pp above or below the guidance midpoint
  // Aggressive: well above guidance
  if (tone === "aggressive") {
    return `This scenario is meaningfully above consensus expectations. Disney's own guidance implies approximately 10–15% Total Segment OI growth in FY26; this scenario projects ${pct(fy26Growth)}. An analyst evaluating this scenario would likely ask: which of the margin assumptions can be supported by disclosed cost guidance? Disney has given explicit DTC margin targets, but Experiences and Sports margins are inferred from trend. High-side scenarios in this tool are best interpreted as sensitivity tests rather than point estimates.`;
  }

  // Contractionary: well below guidance
  if (tone === "contractionary") {
    return `This scenario is materially below consensus and would represent a significant negative surprise relative to Disney's own stated FY26 guidance. Scenarios of this magnitude would typically be stress-tested against specific risk factors — a domestic parks recession scenario, DTC subscriber churn exceeding projections, or a sports rights cost acceleration. If you are modeling this as a downside case, the tornado chart is the right tool for identifying which single driver is most responsible for the gap versus the in-line case.`;
  }

  return "";
}

// ── Main export ────────────────────────────────────────────────────────────────

export function generateNarrative(
  drivers: DriverValues,
  forecast: FullForecast
): NarrativeOutput {
  const fy25SOI = forecast.fy25Actual.totalSegmentOI; // 17,551
  const fy26SOI = forecast.fy26.totalSegmentOI;
  const fy28SOI = forecast.fy28.totalSegmentOI;
  const fy26Growth = ((fy26SOI - fy25SOI) / Math.abs(fy25SOI)) * 100;

  // ── Tone classification (spec Section 9) ──────────────────────────────────
  // Disney guidance "double-digit" = ~10-15% SOI growth
  // Guidance midpoint ~12.5%
  let tone: HeadlineTone;
  if (fy26Growth >= 15) tone = "aggressive";
  else if (fy26Growth >= 5) tone = "in-line";
  else if (fy26Growth >= 0) tone = "conservative";
  else tone = "contractionary";

  // ── Lead segment: largest OI delta vs FY25 ────────────────────────────────
  const entDelta =
    forecast.fy26.entertainment.operatingIncome -
    forecast.fy25Actual.entertainment.operatingIncome;
  const spoDelta =
    forecast.fy26.sports.operatingIncome -
    forecast.fy25Actual.sports.operatingIncome;
  const expDelta =
    forecast.fy26.experiences.operatingIncome -
    forecast.fy25Actual.experiences.operatingIncome;

  let leadSegment: LeadSegment;
  const maxDelta = Math.max(entDelta, spoDelta, expDelta);
  if (maxDelta === entDelta) leadSegment = "entertainment";
  else if (maxDelta === expDelta) leadSegment = "experiences";
  else leadSegment = "sports";

  // ── Guidance deviation: >5pp off the ~12.5% midpoint ──────────────────────
  const guidanceMidpoint = 12.5;
  const isOffConsensus = Math.abs(fy26Growth - guidanceMidpoint) > 5;
  const showEditorial =
    isOffConsensus && (tone === "aggressive" || tone === "contractionary");

  return {
    headline: buildHeadline(tone, fy26Growth, fy26SOI, fy28SOI),
    segmentCallout: buildSegmentCallout(leadSegment, drivers, forecast),
    riskWatch: buildRiskWatch(tone, drivers, forecast),
    editorialFrame: showEditorial
      ? buildEditorialFrame(tone, fy26Growth)
      : "",
  };
}
