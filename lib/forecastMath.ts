// lib/forecastMath.ts
// ─────────────────────────────────────────────────────────────────────────────
// New Method forecast engine (spec: docs/v3_spec.md, sections 4–5). Pure
// functions, no UI. All dollar values in $M.
//
// FY27 is projected from Disney's restated FY26 with the 53rd week removed;
// FY28 is projected from FY27 with the same drivers. The Old Method has no
// engine: its FY26 forecast is frozen in FINAL_FY26_FORECAST.
// ─────────────────────────────────────────────────────────────────────────────

import { DISNEY_CONFIG, DriverValues, NEW_METHOD, SegmentKey } from "./disneyData";

export interface SegmentYear {
  revenueLines: number[]; // $M — same order as the segment's revenueLineLabels
  revenue: number; // $M
  operatingIncome: number; // $M
  operatingMargin: number; // percent, e.g. 14.8
}

export interface ForecastYear {
  entertainment: SegmentYear;
  sports: SegmentYear;
  experiences: SegmentYear;
  totalSegmentOI: number;
}

export interface NewForecast {
  fy26Base: ForecastYear; // restated FY26 excluding the 53rd week (the FY27 growth basis)
  fy27: ForecastYear;
  fy28: ForecastYear;
}

export interface TornadoBar {
  driverId: string;
  driverLabel: string;
  upsideDelta: number; // $M change in FY27 Total Segment OI at +10% relative
  downsideDelta: number; // $M change in FY27 Total Segment OI at −10% relative
  absSwing: number; // |upside − downside| — used for sort order
}

// ── Line-of-business state ───────────────────────────────────────────────────

interface LOBState {
  entertainment: { svod: number; contentAndIp: number; networks: number };
  sports: { affiliate: number; advertising: number; other: number };
  // Domestic is split into parks and resorts vs. cruise for the drivers, and
  // shown as one line.
  experiences: { domesticParks: number; cruise: number; international: number };
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

function segmentYear(revenueLines: number[], operatingIncome: number): SegmentYear {
  const revenue = sum(revenueLines);
  return { revenueLines, revenue, operatingIncome, operatingMargin: (operatingIncome / revenue) * 100 };
}

function linesOf(lob: LOBState) {
  return {
    entertainment: [lob.entertainment.svod, lob.entertainment.contentAndIp, lob.entertainment.networks],
    sports: [lob.sports.affiliate, lob.sports.advertising, lob.sports.other],
    experiences: [lob.experiences.domesticParks + lob.experiences.cruise, lob.experiences.international],
  };
}

/** Restated FY26 with Disney's estimated 53rd week removed proportionally from each segment's lines. */
function buildFY26Base(): { lob: LOBState; year: ForecastYear } {
  const segs = NEW_METHOD.segments;
  const factor = (key: SegmentKey) =>
    1 - segs[key].fiftyThirdWeek.revenue / sum(segs[key].fy26.revenueLines);

  const [svod, contentAndIp, networks] = segs.entertainment.fy26.revenueLines;
  const [affiliate, advertising, other] = segs.sports.fy26.revenueLines;
  const [domestic, international] = segs.experiences.fy26.revenueLines;
  const fe = factor("entertainment");
  const fs = factor("sports");
  const fx = factor("experiences");

  const lob: LOBState = {
    entertainment: { svod: svod * fe, contentAndIp: contentAndIp * fe, networks: networks * fe },
    sports: { affiliate: affiliate * fs, advertising: advertising * fs, other: other * fs },
    experiences: {
      domesticParks: (domestic - NEW_METHOD.cruiseRevenueFY26) * fx,
      cruise: NEW_METHOD.cruiseRevenueFY26 * fx,
      international: international * fx,
    },
  };
  const lines = linesOf(lob);
  const oi = (key: SegmentKey) => segs[key].fy26.operatingIncome - segs[key].fiftyThirdWeek.operatingIncome;
  const year: ForecastYear = {
    entertainment: segmentYear(lines.entertainment, oi("entertainment")),
    sports: segmentYear(lines.sports, oi("sports")),
    experiences: segmentYear(lines.experiences, oi("experiences")),
    totalSegmentOI: oi("entertainment") + oi("sports") + oi("experiences"),
  };
  return { lob, year };
}

/**
 * Effective Sports margin after the programming-cost adjustment (Decision 17):
 *   effectiveMargin = sportsMargin − 50% × (programming cost growth − organic Sports revenue growth)
 * Growth is measured on the 52-week basis (the FY26 base excludes the 53rd week).
 */
export function computeEffectiveSportsMargin(
  sportsRevenue: number,
  prevSportsRevenue: number,
  drivers: DriverValues
): number {
  const revenueGrowthRate = sportsRevenue / prevSportsRevenue - 1;
  const costShareOfRevenue = 0.5;
  const marginAdjustment =
    -costShareOfRevenue * (drivers.sportsRightsCostGrowth / 100 - revenueGrowthRate);
  return drivers.sportsMargin + marginAdjustment * 100;
}

function projectYear(prev: LOBState, drivers: DriverValues): { lob: LOBState; year: ForecastYear } {
  const g = (id: string) => 1 + drivers[id] / 100;
  const lob: LOBState = {
    entertainment: {
      svod: prev.entertainment.svod * g("svodSubGrowth") * g("svodArpuGrowth"),
      contentAndIp: prev.entertainment.contentAndIp * (1 + NEW_METHOD.contentAndIpGrowth / 100),
      networks: prev.entertainment.networks * g("networksGrowth"),
    },
    sports: {
      affiliate: prev.sports.affiliate * g("espnAffiliateGrowth"),
      advertising: prev.sports.advertising * g("sportsAdvertisingGrowth"),
      other: prev.sports.other * (1 + NEW_METHOD.sportsOtherGrowth / 100),
    },
    experiences: {
      domesticParks: prev.experiences.domesticParks * g("attendanceGrowth") * g("perCapitaGrowth"),
      cruise: prev.experiences.cruise * g("cruiseCapacityGrowth") * g("perCapitaGrowth"),
      international: prev.experiences.international * g("attendanceGrowth") * g("perCapitaGrowth"),
    },
  };
  const lines = linesOf(lob);
  const entRevenue = sum(lines.entertainment);
  const spoRevenue = sum(lines.sports);
  const expRevenue = sum(lines.experiences);
  const prevSportsRevenue = sum(linesOf(prev).sports);

  const entOI = entRevenue * (drivers.entertainmentMargin / 100);
  const spoOI = spoRevenue * (computeEffectiveSportsMargin(spoRevenue, prevSportsRevenue, drivers) / 100);
  const expOI = expRevenue * (drivers.experiencesMargin / 100);

  return {
    lob,
    year: {
      entertainment: segmentYear(lines.entertainment, entOI),
      sports: segmentYear(lines.sports, spoOI),
      experiences: segmentYear(lines.experiences, expOI),
      totalSegmentOI: entOI + spoOI + expOI,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export function computeNewForecast(drivers: DriverValues): NewForecast {
  const base = buildFY26Base();
  const fy27 = projectYear(base.lob, drivers);
  const fy28 = projectYear(fy27.lob, drivers);
  return { fy26Base: base.year, fy27: fy27.year, fy28: fy28.year };
}

/**
 * Tornado bars: sensitivity of FY27 Total Segment OI to a ±10% relative move in
 * each driver, holding all others at their current values.
 *   e.g. 5% subscriber growth → 5.5% upside, 4.5% downside
 *   e.g. 14.8% margin → 16.28% upside, 13.32% downside
 */
export function computeTornadoBars(drivers: DriverValues): TornadoBar[] {
  const baseline = computeNewForecast(drivers).fy27.totalSegmentOI;
  const allDrivers = DISNEY_CONFIG.segments.flatMap((s) => s.drivers);

  const bars: TornadoBar[] = allDrivers.map((driver) => {
    const upOI = computeNewForecast({ ...drivers, [driver.id]: drivers[driver.id] * 1.1 }).fy27.totalSegmentOI;
    const downOI = computeNewForecast({ ...drivers, [driver.id]: drivers[driver.id] * 0.9 }).fy27.totalSegmentOI;
    const upsideDelta = upOI - baseline;
    const downsideDelta = downOI - baseline;
    return {
      driverId: driver.id,
      driverLabel: driver.label,
      upsideDelta,
      downsideDelta,
      absSwing: Math.abs(upsideDelta - downsideDelta),
    };
  });

  return bars.sort((a, b) => b.absSwing - a.absSwing);
}
