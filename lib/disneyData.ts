// lib/disneyData.ts
// ─────────────────────────────────────────────────────────────────────────────
// All Disney-specific data lives here. This is the swappable config — when a
// future engagement requires a different sample company, only this file changes.
//
// Baseline figures sourced from The Walt Disney Company's Fourth Quarter and
// Full Year Fiscal 2025 Earnings Press Release (filed November 13, 2025) and
// FY25 Form 10-K.
// ─────────────────────────────────────────────────────────────────────────────

export type SegmentKey = "entertainment" | "sports" | "experiences";

export interface DriverDefinition {
  id: string;
  label: string;
  description: string; // Tooltip text
  unit: "percent" | "margin";
  defaultValue: number;
  min: number;
  max: number;
  step: number;
}

export interface SegmentBaseline {
  key: SegmentKey;
  name: string;
  fy25Revenue: number; // $M
  fy25OperatingIncome: number; // $M
  fy24Revenue: number; // $M
  fy24OperatingIncome: number; // $M
  drivers: DriverDefinition[];
}

export interface CompanyConfig {
  companyName: string;
  ticker: string;
  fiscalYearEndDate: string;
  baselineYear: string; // "FY25"
  forecastYears: string[]; // ["FY26 Forecast", "FY27 Forecast", "FY28 Forecast"]
  belowTheLineAdjustment: number; // $M — bridges Total Segment OI to Net Income
  fxAssumption: number; // % — held constant
  fiftyThirdWeekBenefit: number; // % — applied to FY26 revenue only
  segments: SegmentBaseline[];
  sourceDisclosure: string;
  aboutText: string;
  methodologyNote: string; // v2 addition — rendered as its own paragraph in AboutCard
}

// ─────────────────────────────────────────────────────────────────────────────
// Line-of-business revenue splits used in forecast math (FY25 starting values)
// ─────────────────────────────────────────────────────────────────────────────

export interface EntertainmentLOB {
  dtc: number;     // $M — Disney+, Hulu
  linear: number;  // $M — linear networks
  content: number; // $M — content sales/licensing & other
}

export interface SportsLOB {
  affiliate: number;    // $M — ESPN affiliate fees + DTC subs
  advertising: number;  // $M — national + local ad sales
}

export interface ExperiencesLOB {
  parks: number;           // $M — domestic + international parks (excl. cruise)
  cruise: number;          // $M — Disney Cruise Line (estimated, see note)
  consumerProducts: number;// $M — consumer products & licensing
}

export const ENTERTAINMENT_LOB: EntertainmentLOB = {
  dtc: 24_614,
  linear: 9_364,
  content: 8_488,
};

export const SPORTS_LOB: SportsLOB = {
  affiliate: 10_000,
  advertising: 7_672,
};

// Note: Cruise revenue of $3,700M is an analyst-derived estimate. Disney does
// not separately disclose cruise revenue inside the Domestic Parks line.
export const EXPERIENCES_LOB: ExperiencesLOB = {
  parks: 28_011,
  cruise: 3_700,
  consumerProducts: 4_445,
};

// ─────────────────────────────────────────────────────────────────────────────
// Disney company configuration
// ─────────────────────────────────────────────────────────────────────────────

export const DISNEY_CONFIG: CompanyConfig = {
  companyName: "The Walt Disney Company",
  ticker: "DIS",
  fiscalYearEndDate: "September 27, 2025",
  baselineYear: "FY25",
  forecastYears: ["FY26 Forecast", "FY27 Forecast", "FY28 Forecast"],

  // Bridges $17,551M Total Segment OI → $12,404M Net Income to Disney shareholders
  belowTheLineAdjustment: -5_147,

  fxAssumption: 0,       // % — neutral assumption per Decision Q3 in baseline V2
  fiftyThirdWeekBenefit: 2, // % — applied to FY26 revenue only

  segments: [
    // ── Entertainment ─────────────────────────────────────────────────────
    {
      key: "entertainment",
      name: "Entertainment",
      fy25Revenue: 42_466,
      fy25OperatingIncome: 4_674,
      fy24Revenue: 41_228,
      fy24OperatingIncome: 1_443,
      drivers: [
        {
          id: "dtcSubGrowth",
          label: "DTC Subscriber Growth",
          description:
            "Disney+ and Hulu subscriber base expansion. FY25 actual: ~+8%. Net adds Q4 FY25: +12.4M. Peer reference: Netflix ~+9% global net adds in calendar 2025.",
          unit: "percent",
          defaultValue: 8,
          min: -5,
          max: 20,
          step: 0.5,
        },
        {
          id: "dtcArpuGrowth",
          label: "DTC ARPU Growth",
          description:
            "Average revenue per subscriber. FY25 actual: ~+2%. Disney+ blended ARPU $8.04/mo. Peer reference: Netflix Standard $17.99, Max $9.99–15.99, Paramount+ $7.99–11.99. Disney has pricing headroom.",
          unit: "percent",
          defaultValue: 2,
          min: -2,
          max: 10,
          step: 0.5,
        },
        {
          id: "linearDecline",
          label: "Linear Networks Revenue Decline",
          description:
            "Structural decline of linear TV. FY25 actual: -12%. Reflects cable cord-cutting, partially offset by Star India deconsolidation. Industry peers also declining 8–14%.",
          unit: "percent",
          defaultValue: -12,
          min: -20,
          max: 0,
          step: 0.5,
        },
        {
          id: "entertainmentMargin",
          label: "Entertainment Operating Margin",
          description:
            "Bottom-line segment margin. FY25 actual: 11.0%. Disney guides DTC SVOD to 10% margin in FY26; blended segment margin benefits from DTC mix shift as linear declines. Default of 11.5% reflects modest expansion from FY25. " +
            "Q1 FY26 9.5%, Q2 FY26 ~11.3%, Q3 FY26 14.8%. Entertainment SVOD operating margin reached 13% in Q3 FY26 per Disney Q3 FY26 earnings release (Aug 5, 2026).",
          unit: "margin",
          defaultValue: 12.5,
          min: 6,
          max: 18,
          step: 0.5,
        },
      ],
    },

    // ── Sports ─────────────────────────────────────────────────────────────
    {
      key: "sports",
      name: "Sports",
      fy25Revenue: 17_672,
      fy25OperatingIncome: 2_882,
      fy24Revenue: 17_617,
      fy24OperatingIncome: 2_448,
      drivers: [
        {
          id: "espnAffiliateGrowth",
          label: "ESPN Affiliate/Subscription Revenue Growth",
          description:
            "Cable affiliate fees plus ESPN DTC subs. FY25 actual: ~flat (7% higher effective rates offset by 7% fewer subs). ESPN DTC service launched August 2025. " +
            "Q2 FY26 ESPN affiliate/subscription revenues grew 6% YoY (NFL transaction contributed 3%) per Disney Q2 FY26 earnings release (May 6, 2026).",
          unit: "percent",
          defaultValue: 3,
          min: -5,
          max: 15,
          step: 0.5,
        },
        {
          id: "sportsAdvertisingGrowth",
          label: "Sports Advertising Revenue Growth",
          description:
            "National + local ad sales. FY25 actual: +13% on expanded College Football Playoff coverage. Political ad cycle is a swing factor. " +
            "Q2 FY26 ESPN advertising revenue declined 2% YoY; Q3 FY26 lifted by NBA Finals but transitory per Disney Q2 and Q3 FY26 earnings releases.",
          unit: "percent",
          defaultValue: 3,
          min: -10,
          max: 15,
          step: 0.5,
        },
        {
          id: "sportsRightsCostGrowth",
          label: "Sports Rights & Programming Cost Growth",
          description:
            "Contractual sports rights and programming cost increases. FY25 actual: rising mid-single-digit on existing portfolio. NBA new deal in FY26 represents a meaningful step-up — move slider to +6-8% to model that scenario. Programming costs are approximately 50% of Sports revenue; when cost growth exceeds revenue growth, Sports operating margin compresses proportionally. " +
            "Q3 FY26 Sports OI declined 17% YoY vs. Disney's own −14% guidance, driven by double-digit programming expense increase including NBA rights timing, per Disney Q3 FY26 earnings release (Aug 5, 2026). " +
            "Note: at the +7% v2 default, this driver persists year-over-year through FY27 and FY28 without offsetting affiliate or advertising growth relief modeled in the current defaults. Combined with the FY26 53rd-week revenue bump distorting FY27's YoY growth-rate comparison, effective Sports operating margin dips ~1pp to ~15.0% in FY27 before fully recovering to ~16.0% in FY28 as the 53rd-week distortion falls out of the denominator. FY27/FY28 driver recalibration is explicitly out of v2 scope — awaiting FY27 disclosure evidence. Adjust the affiliate, advertising, or cost drivers to model a different out-year trajectory.",
          unit: "percent",
          defaultValue: 7,
          min: 0,
          max: 15,
          step: 0.5,
        },
        {
          id: "sportsMargin",
          label: "Sports Operating Margin",
          // Note: "v1 default 16.0%" in the appended prose refers to the *effective*
          // FY26 output at v1 defaults (as shown in the Prior FY26 Forecast column),
          // not the underlying slider seed which was 16.3. This is the reader-facing
          // framing and matches what users see in the Prior column.
          description:
            "Sports segment operating margin before adjustment for programming cost vs. revenue growth differential. FY25 actual: 16.3%. The sportsRightsCostGrowth driver applies an additional adjustment on top of this base — if programming costs grow faster than revenue, the effective margin compresses below this value automatically. " +
            "v1 default 16.0% raised to preserve alignment with Disney's mid-single-digit Sports OI growth guidance after the Sports Rights & Programming Cost Growth default was recalibrated from +4% to +7% per Q3 FY26 evidence. Per Decision 17 wiring, the cost driver differential compresses effective margin; the sportsMargin slider default is set to offset that compression at defaults.",
          unit: "margin",
          defaultValue: 18.0,
          min: 10,
          max: 24,
          step: 0.5,
        },
      ],
    },

    // ── Experiences ────────────────────────────────────────────────────────
    {
      key: "experiences",
      name: "Experiences",
      fy25Revenue: 36_156,
      fy25OperatingIncome: 9_995,
      fy24Revenue: 34_151,
      fy24OperatingIncome: 9_267,
      drivers: [
        {
          id: "attendanceGrowth",
          label: "Parks Attendance Growth",
          description:
            "Combined domestic + international visitor volume. FY25 actual: ~0% (Domestic -1%, International +1%). Revenue growth came from per-capita spending and cruise capacity, not attendance. " +
            "Q3 FY26 domestic parks attendance +3%, global guest attendance +4% per Disney Q3 FY26 earnings release (Aug 5, 2026).",
          unit: "percent",
          defaultValue: 3,
          min: -5,
          max: 10,
          step: 0.5,
        },
        {
          id: "perCapitaGrowth",
          label: "Per Capita Guest Spending Growth",
          description:
            "Spend per visitor across tickets, food, merchandise, hotels. FY25 actual: ~+4%. Premiumization story — Genie+, premium tickets, cruise upgrades. " +
            "Q3 FY26 average ticket revenue per guest +5% per Disney Q3 FY26 earnings release (Aug 5, 2026).",
          unit: "percent",
          defaultValue: 5,
          min: 0,
          max: 10,
          step: 0.5,
        },
        {
          id: "cruiseCapacityGrowth",
          label: "Cruise Line Capacity Growth",
          description:
            "Reflects new ships entering service. Disney Treasure launched FY25; Adventure and Destiny launching FY26. Fleet expanding from 5 to 8 ships over FY25–FY26. " +
            "Q3 FY26 was first full quarter of Disney Destiny and Disney Adventure; stateroom capacity increased approximately 50% YoY per Disney Q3 FY26 earnings release (Aug 5, 2026).",
          unit: "percent",
          defaultValue: 50,
          min: 0,
          max: 75,
          step: 0.5,
        },
        {
          id: "experiencesMargin",
          label: "Experiences Operating Margin",
          description:
            "Bottom-line segment margin. FY25 actual: 27.6%. Cruise Line pre-opening costs are a near-term drag; long-term mix-positive. " +
            "Q3 FY26 Experiences OI $3.02B / Revenue $9.97B = 30.3% margin; Disney disclosed ~30% operating margin through first nine months of FY26 on Q3 earnings call (Aug 5, 2026).",
          unit: "margin",
          defaultValue: 29.5,
          min: 22,
          max: 32,
          step: 0.5,
        },
      ],
    },
  ],

  aboutText: `This dashboard models The Walt Disney Company using publicly disclosed FY25 segment financials from the 10-K (filed November 2025) and Q4 FY25 earnings press release (filed November 13, 2025). The segment structure, line-of-business breakdowns, and driver categories all come directly from Disney's own disclosures. Forecast scenarios are illustrative — adjustable by the user — and do not represent company guidance. Default-state outputs align with Disney's own stated FY26 outlook ranges. Built by AugieAI Execute as a methodology demonstration of driver-based segment forecasting. This is not investment advice.`,

  methodologyNote: `v2 recalibrates the FY26 driver defaults using evidence from Disney's Q1, Q2, and Q3 fiscal 2026 filings (February 2, May 6, and August 5, 2026 respectively). v1's shipped FY26 forecast is preserved on the Segment Forecast table as a frozen "Prior FY26 Forecast" column for retrospective comparison. At v2 defaults, FY26 Total Segment Operating Income lands at approximately $20.9B, roughly $1.0B above the ~$19.7B implied by Disney's own Q4 FY26 guidance plus 9-month year-to-date actuals. The divergence is not a modeling error — it reflects that the actuals-based margin trajectory in Entertainment (~12.5% vs. v1's 11.5%) and Experiences (~29.5% vs. v1's 27.6%) supports a higher full-year Operating Income than Disney's externally-guided outlook implicitly assumes.`,

  sourceDisclosure: `Baseline figures sourced from The Walt Disney Company's Fourth Quarter and Full Year Fiscal 2025 Earnings Press Release (filed November 13, 2025) and FY25 Form 10-K. Line-of-business operating metrics including parks attendance, per-capita guest spending, and cruise capacity growth are illustrative estimates inferred from management commentary; Disney does not publicly disclose all of these as absolute figures. Forecast scenarios are driver-based projections by AugieAI Execute and do not represent company guidance. This dashboard is presented for educational and methodology demonstration purposes only and is not investment advice or a recommendation to buy, hold, or sell any security.`,
};

// ─────────────────────────────────────────────────────────────────────────────
// Convenience: default driver values as a flat record (used for state init
// and Reset button)
// ─────────────────────────────────────────────────────────────────────────────

export type DriverValues = Record<string, number>;

export function getDefaultDriverValues(): DriverValues {
  const defaults: DriverValues = {};
  for (const segment of DISNEY_CONFIG.segments) {
    for (const driver of segment.drivers) {
      defaults[driver.id] = driver.defaultValue;
    }
  }
  return defaults;
}

// ─────────────────────────────────────────────────────────────────────────────
// Frozen snapshot of v1.0's shipped FY26 forecast at v1 driver defaults.
// Captured from the live Vercel deployment at Reset state on 2026-08-05 for
// retrospective comparison against v2's recalibrated FY26 forecast. These
// values are constants — never recomputed, never affected by slider movement.
//
// Sports operating margin of 16.0% reflects the effective margin after the
// sportsRightsCostGrowth cost/revenue differential adjustment; the underlying
// sportsMargin slider default at v1 was 16.3%.
// ─────────────────────────────────────────────────────────────────────────────

export interface PriorSegmentForecast {
  revenue: number; // $M
  operatingIncome: number; // $M
  operatingMargin: number; // percent, e.g. 11.5
}

export interface PriorFY26Forecast {
  entertainment: PriorSegmentForecast;
  sports: PriorSegmentForecast;
  experiences: PriorSegmentForecast;
  totalSegmentOI: number; // $M
  belowTheLine: number; // $M — signed (negative for deduction)
  netIncomeProxy: number; // $M
  shippedOn: string; // ISO date of v1.0 tag
  capturedFrom: string; // provenance note
}

export const PRIOR_FY26_FORECAST: PriorFY26Forecast = {
  entertainment: { revenue: 45_153, operatingIncome: 5_193, operatingMargin: 11.5 },
  sports:        { revenue: 18_621, operatingIncome: 2_970, operatingMargin: 16.0 },
  experiences:   { revenue: 39_290, operatingIncome: 10_844, operatingMargin: 27.6 },
  totalSegmentOI: 19_007,
  belowTheLine: -5_147,
  netIncomeProxy: 13_860,
  shippedOn: "2026-05-31",
  capturedFrom: "Live Vercel deployment at Reset state, 2026-08-05",
};
