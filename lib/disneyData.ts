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
  forecastYears: string[]; // ["FY26E", "FY27E", "FY28E"]
  belowTheLineAdjustment: number; // $M — bridges Total Segment OI to Net Income
  fxAssumption: number; // % — held constant
  fiftyThirdWeekBenefit: number; // % — applied to FY26 revenue only
  segments: SegmentBaseline[];
  sourceDisclosure: string;
  aboutText: string;
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
  forecastYears: ["FY26E", "FY27E", "FY28E"],

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
            "Bottom-line segment margin. FY25 actual: 11.0%. Disney guides DTC SVOD to 10% margin in FY26; blended segment margin benefits from DTC mix shift as linear declines. Default of 11.5% reflects modest expansion from FY25.",
          unit: "margin",
          defaultValue: 11.5,
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
            "Cable affiliate fees plus ESPN DTC subs. FY25 actual: ~flat (7% higher effective rates offset by 7% fewer subs). ESPN DTC service launched August 2025.",
          unit: "percent",
          defaultValue: 2,
          min: -5,
          max: 15,
          step: 0.5,
        },
        {
          id: "sportsAdvertisingGrowth",
          label: "Sports Advertising Revenue Growth",
          description:
            "National + local ad sales. FY25 actual: +13% on expanded College Football Playoff coverage. Political ad cycle is a swing factor.",
          unit: "percent",
          defaultValue: 5,
          min: -10,
          max: 15,
          step: 0.5,
        },
        {
          id: "sportsRightsCostGrowth",
          label: "Sports Rights & Programming Cost Growth",
          description:
            "Contractual sports rights increases (NBA, NFL, college). FY25: rising. NBA new deal starts FY26 and represents a meaningful step-up.",
          unit: "percent",
          defaultValue: 6,
          min: 0,
          max: 15,
          step: 0.5,
        },
        {
          id: "sportsMargin",
          label: "Sports Operating Margin",
          description:
            "Bottom-line segment margin. FY25 actual: 16.3%. NBA new rights deal starts FY26 and represents a meaningful cost step-up; default of 15.9% reflects that pressure. Disney guides low-single-digit SOI growth FY26.",
          unit: "margin",
          defaultValue: 15.9,
          min: 10,
          max: 22,
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
            "Combined domestic + international visitor volume. FY25 actual: ~0% (Domestic -1%, International +1%). Revenue growth came from per-capita spending and cruise capacity, not attendance.",
          unit: "percent",
          defaultValue: 0,
          min: -5,
          max: 10,
          step: 0.5,
        },
        {
          id: "perCapitaGrowth",
          label: "Per Capita Guest Spending Growth",
          description:
            "Spend per visitor across tickets, food, merchandise, hotels. FY25 actual: ~+4%. Premiumization story — Genie+, premium tickets, cruise upgrades.",
          unit: "percent",
          defaultValue: 4,
          min: 0,
          max: 10,
          step: 0.5,
        },
        {
          id: "cruiseCapacityGrowth",
          label: "Cruise Line Capacity Growth",
          description:
            "Reflects new ships entering service. Disney Treasure launched FY25; Adventure and Destiny launching FY26. Fleet expanding from 5 to 8 ships over FY25–FY26.",
          unit: "percent",
          defaultValue: 25,
          min: 0,
          max: 50,
          step: 0.5,
        },
        {
          id: "experiencesMargin",
          label: "Experiences Operating Margin",
          description:
            "Bottom-line segment margin. FY25 actual: 27.6%. Cruise Line pre-opening costs are a near-term drag; long-term mix-positive.",
          unit: "margin",
          defaultValue: 27.6,
          min: 22,
          max: 32,
          step: 0.5,
        },
      ],
    },
  ],

  aboutText: `This dashboard models The Walt Disney Company using publicly disclosed FY25 segment financials from the 10-K (filed November 2025) and Q4 FY25 earnings press release (filed November 13, 2025). The segment structure, line-of-business breakdowns, and driver categories all come directly from Disney's own disclosures. Forecast scenarios are illustrative — adjustable by the user — and do not represent company guidance. Default-state outputs align with Disney's own stated FY26 outlook ranges. Built by AugieAI Execute as a methodology demonstration of driver-based segment forecasting. This is not investment advice.`,

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
