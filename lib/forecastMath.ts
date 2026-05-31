// lib/forecastMath.ts
// ─────────────────────────────────────────────────────────────────────────────
// Pure forecast math functions. No UI dependencies. All dollar values in $M.
//
// Math spec: Disney_Dashboard_Build_Spec_v1_1.md Section 4
// ─────────────────────────────────────────────────────────────────────────────

import {
  DISNEY_CONFIG,
  ENTERTAINMENT_LOB,
  SPORTS_LOB,
  EXPERIENCES_LOB,
  DriverValues,
} from "./disneyData";

export interface SegmentForecast {
  revenue: number;
  operatingIncome: number;
  operatingMargin: number; // percentage, e.g. 11.0
}

export interface YearForecast {
  year: string;
  entertainment: SegmentForecast;
  sports: SegmentForecast;
  experiences: SegmentForecast;
  totalSegmentOI: number;
  belowTheLine: number;
  netIncomeProxy: number;
}

export interface FullForecast {
  fy25Actual: YearForecast;
  fy26: YearForecast;
  fy27: YearForecast;
  fy28: YearForecast;
}

export interface TornadoBar {
  driverId: string;
  driverLabel: string;
  upsideDelta: number;   // $M change in FY26 Total Segment OI at +10% relative
  downsideDelta: number; // $M change in FY26 Total Segment OI at −10% relative
  absSwing: number;      // |upside − downside| — used for sort order
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

interface LOBState {
  entertainment: { dtc: number; linear: number; content: number };
  sports: { affiliate: number; advertising: number };
  experiences: { parks: number; cruise: number; consumerProducts: number };
}

/** Seed the LOB state from FY25 actuals. */
function seedLOB(): LOBState {
  return {
    entertainment: { ...ENTERTAINMENT_LOB },
    sports: { ...SPORTS_LOB },
    experiences: { ...EXPERIENCES_LOB },
  };
}

/**
 * Project one year of Entertainment revenue from the previous year's LOB state.
 * Returns updated DTC/linear/content values and total revenue.
 */
function projectEntertainmentRevenue(
  prev: LOBState["entertainment"],
  drivers: DriverValues
): { dtc: number; linear: number; content: number; total: number } {
  const dtc =
    prev.dtc *
    (1 + drivers.dtcSubGrowth / 100) *
    (1 + drivers.dtcArpuGrowth / 100);
  const linear = prev.linear * (1 + drivers.linearDecline / 100);
  const content = prev.content * 1.05; // hardcoded mid-single-digit growth
  return { dtc, linear, content, total: dtc + linear + content };
}

/**
 * Project one year of Sports revenue from the previous year's LOB state.
 */
function projectSportsRevenue(
  prev: LOBState["sports"],
  drivers: DriverValues
): { affiliate: number; advertising: number; total: number } {
  const affiliate = prev.affiliate * (1 + drivers.espnAffiliateGrowth / 100);
  const advertising =
    prev.advertising * (1 + drivers.sportsAdvertisingGrowth / 100);
  return { affiliate, advertising, total: affiliate + advertising };
}

/**
 * Project one year of Experiences revenue from the previous year's LOB state.
 */
function projectExperiencesRevenue(
  prev: LOBState["experiences"],
  drivers: DriverValues
): { parks: number; cruise: number; consumerProducts: number; total: number } {
  const parks =
    prev.parks *
    (1 + drivers.attendanceGrowth / 100) *
    (1 + drivers.perCapitaGrowth / 100);
  const cruise =
    prev.cruise *
    (1 + drivers.cruiseCapacityGrowth / 100) *
    (1 + drivers.perCapitaGrowth / 100);
  const consumerProducts = prev.consumerProducts * 1.03; // hardcoded mid-low growth
  return { parks, cruise, consumerProducts, total: parks + cruise + consumerProducts };
}

/** Build a SegmentForecast from revenue + margin driver. */
function makeSegmentForecast(
  revenue: number,
  marginPct: number
): SegmentForecast {
  const operatingIncome = revenue * (marginPct / 100);
  return { revenue, operatingIncome, operatingMargin: marginPct };
}

/**
 * Compute effective Sports operating margin after adjusting for programming
 * cost growth vs. revenue growth differential.
 *
 * Economic logic: programming costs are ~50% of Sports revenue. When costs
 * grow faster than revenue, the margin compresses proportionally to the cost
 * share of revenue times the differential.
 *
 * The growth rate uses ORGANIC (pre-53rd-week) revenue as the base. The 53rd
 * fiscal week is a calendar artifact — including it would make costs appear
 * cheaper relative to revenue in FY26 and distort the adjustment in every
 * subsequent year whose prior-year base includes the 53rd-week boost.
 *
 * Formula:
 *   revenueGrowthRate     = (organicSportsRevenue / prevSportsRevenue) - 1
 *   programmingCostGrowth = sportsRightsCostGrowth / 100
 *   costShareOfRevenue    = 0.50
 *   marginAdjustment      = -costShareOfRevenue × (programmingCostGrowth − revenueGrowthRate)
 *   effectiveMargin       = sportsMargin + (marginAdjustment × 100)
 *
 * Note: the OI calculation (sportsRevenue × effectiveMargin) in the caller
 * continues to use the as-reported (post-53rd) revenue — the fix is to the
 * margin-adjustment math only.
 */
function computeEffectiveSportsMargin(
  organicSportsRevenue: number, // pre-53rd-week, for growth rate calc only
  prevSportsRevenue: number,    // prior year as-reported revenue
  drivers: DriverValues
): number {
  const revenueGrowthRate = organicSportsRevenue / prevSportsRevenue - 1;
  const programmingCostGrowthRate = drivers.sportsRightsCostGrowth / 100;
  const costShareOfRevenue = 0.50;
  const marginAdjustment =
    -1 * costShareOfRevenue * (programmingCostGrowthRate - revenueGrowthRate);
  return drivers.sportsMargin + marginAdjustment * 100;
}

/** Roll up three segments into totals. */
function rollup(
  entertainment: SegmentForecast,
  sports: SegmentForecast,
  experiences: SegmentForecast,
  year: string
): YearForecast {
  const totalSegmentOI =
    entertainment.operatingIncome +
    sports.operatingIncome +
    experiences.operatingIncome;
  const belowTheLine = DISNEY_CONFIG.belowTheLineAdjustment;
  return {
    year,
    entertainment,
    sports,
    experiences,
    totalSegmentOI,
    belowTheLine,
    netIncomeProxy: totalSegmentOI + belowTheLine,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FY25 actual (static — read straight from config, no math)
// ─────────────────────────────────────────────────────────────────────────────

function buildFY25Actual(): YearForecast {
  const cfg = DISNEY_CONFIG;
  const ent = cfg.segments.find((s) => s.key === "entertainment")!;
  const spo = cfg.segments.find((s) => s.key === "sports")!;
  const exp = cfg.segments.find((s) => s.key === "experiences")!;

  const entertainment: SegmentForecast = {
    revenue: ent.fy25Revenue,
    operatingIncome: ent.fy25OperatingIncome,
    operatingMargin:
      Math.round((ent.fy25OperatingIncome / ent.fy25Revenue) * 1000) / 10,
  };
  const sports: SegmentForecast = {
    revenue: spo.fy25Revenue,
    operatingIncome: spo.fy25OperatingIncome,
    operatingMargin:
      Math.round((spo.fy25OperatingIncome / spo.fy25Revenue) * 1000) / 10,
  };
  const experiences: SegmentForecast = {
    revenue: exp.fy25Revenue,
    operatingIncome: exp.fy25OperatingIncome,
    operatingMargin:
      Math.round((exp.fy25OperatingIncome / exp.fy25Revenue) * 1000) / 10,
  };

  return rollup(entertainment, sports, experiences, "FY25");
}

// ─────────────────────────────────────────────────────────────────────────────
// Core projection engine
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Project one forecast year, given previous-year LOB state and driver values.
 *
 * prevSportsRevenue: the actual computed sports revenue from the prior year
 * (used in the programming cost vs. revenue growth adjustment).
 * For FY26 this is the FY25 actual (17,672). For FY27/FY28 it is the prior
 * forecast year's computed sports revenue (including any 53rd-week effect).
 *
 * Returns the YearForecast, updated LOB state, and this year's Sports revenue
 * for threading into the next year.
 */
function projectYear(
  year: string,
  prevLOB: LOBState,
  prevSportsRevenue: number,
  drivers: DriverValues,
  applyFiftyThirdWeek: boolean
): { forecast: YearForecast; nextLOB: LOBState; sportsRevenue: number } {
  // Revenue projection
  const entLOB = projectEntertainmentRevenue(prevLOB.entertainment, drivers);
  const spoLOB = projectSportsRevenue(prevLOB.sports, drivers);
  const expLOB = projectExperiencesRevenue(prevLOB.experiences, drivers);

  let entRevenue = entLOB.total;
  let spoRevenue = spoLOB.total;
  let expRevenue = expLOB.total;

  // Capture organic (pre-53rd-week) sports revenue for the margin adjustment
  // growth-rate calculation before the calendar multiplier is applied.
  const organicSpoRevenue = spoRevenue;

  // FY26 53rd-week benefit applied to total company revenue proportionally
  if (applyFiftyThirdWeek) {
    const multiplier = 1 + DISNEY_CONFIG.fiftyThirdWeekBenefit / 100;
    entRevenue *= multiplier;
    spoRevenue *= multiplier;
    expRevenue *= multiplier;
  }

  // Operating income = revenue × effective margin
  // Entertainment and Experiences use margin driver directly.
  // Sports uses an adjusted margin that accounts for programming cost growth
  // vs. organic revenue growth (53rd-week excluded from growth rate — see
  // computeEffectiveSportsMargin). OI itself uses as-reported spoRevenue.
  const effectiveSportsMargin = computeEffectiveSportsMargin(
    organicSpoRevenue,  // pre-53rd, for growth rate only
    prevSportsRevenue,
    drivers
  );

  const entertainment = makeSegmentForecast(entRevenue, drivers.entertainmentMargin);
  const sports        = makeSegmentForecast(spoRevenue, effectiveSportsMargin);
  const experiences   = makeSegmentForecast(expRevenue, drivers.experiencesMargin);

  const forecast = rollup(entertainment, sports, experiences, year);

  // Next year's LOB base (53rd week is a one-time event — do not carry forward)
  const nextLOB: LOBState = {
    entertainment: {
      dtc: entLOB.dtc,
      linear: entLOB.linear,
      content: entLOB.content,
    },
    sports: {
      affiliate: spoLOB.affiliate,
      advertising: spoLOB.advertising,
    },
    experiences: {
      parks: expLOB.parks,
      cruise: expLOB.cruise,
      consumerProducts: expLOB.consumerProducts,
    },
  };

  return { forecast, nextLOB, sportsRevenue: spoRevenue };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export function computeFullForecast(drivers: DriverValues): FullForecast {
  const fy25Actual = buildFY25Actual();
  const lob = seedLOB();

  // FY25 actual sports revenue as the prior-year baseline for FY26
  const fy25SportsRevenue = fy25Actual.sports.revenue; // 17,672

  const { forecast: fy26, nextLOB: lob27, sportsRevenue: fy26SportsRevenue } =
    projectYear("FY26E", lob, fy25SportsRevenue, drivers, true);

  const { forecast: fy27, nextLOB: lob28, sportsRevenue: fy27SportsRevenue } =
    projectYear("FY27E", lob27, fy26SportsRevenue, drivers, false);

  const { forecast: fy28 } =
    projectYear("FY28E", lob28, fy27SportsRevenue, drivers, false);

  return { fy25Actual, fy26, fy27, fy28 };
}

/**
 * Compute tornado bars: sensitivity of FY26 Total Segment OI to ±10% relative
 * movement in each driver, holding all others at default.
 *
 * "10% relative" means the driver value itself moves by 10%:
 *   e.g. 8% sub growth → 8.8% upside, 7.2% downside
 *   e.g. 11.0% margin  → 12.1% upside, 9.9% downside
 */
export function computeTornadoBars(drivers: DriverValues): TornadoBar[] {
  const baseline = computeFullForecast(drivers).fy26.totalSegmentOI;

  // Collect all driver definitions across all segments
  const allDrivers = DISNEY_CONFIG.segments.flatMap((s) => s.drivers);

  const bars: TornadoBar[] = allDrivers.map((driver) => {
    const upDrivers   = { ...drivers, [driver.id]: drivers[driver.id] * 1.1 };
    const downDrivers = { ...drivers, [driver.id]: drivers[driver.id] * 0.9 };

    const upOI   = computeFullForecast(upDrivers).fy26.totalSegmentOI;
    const downOI = computeFullForecast(downDrivers).fy26.totalSegmentOI;

    const upsideDelta   = upOI - baseline;
    const downsideDelta = downOI - baseline;

    return {
      driverId: driver.id,
      driverLabel: driver.label,
      upsideDelta,
      downsideDelta,
      absSwing: Math.abs(upsideDelta - downsideDelta),
    };
  });

  // Sort largest swing at top
  return bars.sort((a, b) => b.absSwing - a.absSwing);
}
