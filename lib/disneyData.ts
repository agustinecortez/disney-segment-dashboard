// lib/disneyData.ts
// ─────────────────────────────────────────────────────────────────────────────
// All Disney-specific data lives here. This is the swappable config — when a
// future engagement requires a different sample company, only this file changes.
//
// Baseline figures sourced from The Walt Disney Company's Fourth Quarter and
// Full Year Fiscal 2025 Earnings Press Release (filed November 13, 2025) and
// FY25 Form 10-K. FY26 actuals sourced from the Fourth Quarter Fiscal 2026
// earnings release (November 17, 2026) and FY26 Form 10-K (fiscal year ended
// October 3, 2026). Segment cost lines and equity income come from the
// segment information note in each year's 10-K.
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

// A reported actual year for one segment. Revenue − sum(costLines) +
// equityIncome = operatingIncome, exactly, as Disney reports it.
export interface SegmentActual {
  revenue: number; // $M
  operatingIncome: number; // $M — segment operating income as reported
  costLines: number[]; // $M — significant segment expenses, same order as costLineLabels
  equityIncome: number; // $M — equity in the income of investees included in segment OI
}

export interface SegmentBaseline {
  key: SegmentKey;
  name: string;
  fy25Revenue: number; // $M
  fy25OperatingIncome: number; // $M
  fy24Revenue: number; // $M
  fy24OperatingIncome: number; // $M
  costLineLabels: string[]; // Disney's significant segment expense categories, in reported order
  fy25CostLines: number[]; // $M — same order as costLineLabels
  fy25EquityIncome: number; // $M
  fy26Actual: SegmentActual;
  drivers: DriverDefinition[];
}

export interface CompanyConfig {
  companyName: string;
  ticker: string;
  fiscalYearEndDate: string;
  baselineYear: string; // "FY25"
  forecastYears: string[]; // ["FY26 Forecast"]
  belowTheLineAdjustment: number; // $M — bridges FY25 Total Segment OI to Net Income; held for the FY26 forecast
  fy26ActualBelowTheLine: number; // $M — FY26 net income attributable to Disney minus Total Segment OI, as reported
  fy26ActualNetIncome: number; // $M — FY26 net income attributable to Disney, as reported
  fxAssumption: number; // % — held constant
  fiftyThirdWeekBenefit: number; // % — applied to FY26 revenue only
  segments: SegmentBaseline[];
  sourceDisclosure: string;
  aboutText: string;
  methodologyNote: string; // rendered as its own section in AboutCard ("FY26 Forecast vs. Actual")
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
  forecastYears: ["FY26 Forecast"],

  // Bridges $17,551M Total Segment OI → $12,404M Net Income to Disney shareholders
  belowTheLineAdjustment: -5_147,

  // FY26 as reported: $19,728M Total Segment OI → $9,899M Net Income to Disney
  // shareholders. The (9,829) covers corporate and unallocated shared expenses
  // (1,461), India joint venture equity loss (158), restructuring and
  // impairment (1,456), net interest (1,157), acquisition amortization (1,284),
  // income taxes (3,564) and noncontrolling interests (749).
  fy26ActualBelowTheLine: -9_829,
  fy26ActualNetIncome: 9_899,

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
      costLineLabels: [
        "Programming and production costs",
        "Other segment operating expenses",
        "Selling, general, administrative and other",
        "Depreciation and amortization",
      ],
      fy25CostLines: [22_273, 5_400, 9_733, 825], // total 38,231
      fy25EquityIncome: 439,
      fy26Actual: {
        revenue: 46_562,
        operatingIncome: 5_443,
        costLines: [24_821, 5_889, 9_900, 917], // total 41,527
        equityIncome: 408,
      },
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
            "Bottom-line segment margin. FY25 actual: 11.0%. Disney guides DTC SVOD to 10% margin in FY26; blended segment margin benefits from DTC mix shift as linear declines. " +
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
      costLineLabels: [
        "Programming and production costs",
        "Other segment operating expenses",
        "Selling, general, administrative and other",
        "Depreciation and amortization",
      ],
      fy25CostLines: [12_492, 986, 1_331, 48], // total 14,857
      fy25EquityIncome: 67,
      fy26Actual: {
        revenue: 18_632,
        operatingIncome: 3_094,
        costLines: [13_091, 1_035, 1_375, 115], // total 15,616
        equityIncome: 78,
      },
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
            "Q3 FY26 Sports OI declined 17% YoY vs. Disney's own −14% guidance, driven by double-digit programming expense increase including NBA rights timing, per Disney Q3 FY26 earnings release (Aug 5, 2026).",
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
          // FY26 output at v1 defaults, not the underlying slider seed which was 16.3.
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
      costLineLabels: [
        "Operating labor",
        "Infrastructure costs",
        "Costs of goods sold and distribution costs",
        "Other segment operating expenses",
        "Selling, general, administrative and other",
        "Depreciation and amortization",
      ],
      fy25CostLines: [8_948, 3_511, 3_253, 3_512, 4_114, 2_823], // total 26,161
      fy25EquityIncome: 0,
      fy26Actual: {
        revenue: 39_566,
        operatingIncome: 11_191,
        costLines: [9_586, 3_742, 3_360, 4_064, 4_403, 3_220], // total 28,375
        equityIncome: 0,
      },
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

  aboutText: `This dashboard models The Walt Disney Company using publicly disclosed FY25 segment financials from the 10-K (filed November 2025) and Q4 FY25 earnings press release (filed November 13, 2025), and compares its final FY26 forecast with FY26 actuals from the Q4 FY26 earnings release (November 17, 2026) and FY26 10-K. The segment structure, line-of-business breakdowns, cost lines, and driver categories all come directly from Disney's own disclosures. Forecast scenarios are illustrative — adjustable by the user — and do not represent company guidance. Built by Omico Group as a methodology demonstration of driver-based segment forecasting. This is not investment advice.`,

  methodologyNote: `The FY26 Forecast column is the final forecast, last recalibrated in August 2026 using Disney's Q1, Q2, and Q3 fiscal 2026 results (February 2, May 6, and August 5, 2026). Disney reported FY26 Total Segment Operating Income of $19.7B on November 17, 2026; the forecast at default settings was $20.9B, about $1.1B (5.7%) high. Most of the gap is Experiences, forecast $1.1B too high: revenue came in about $1.9B below forecast and the margin was 28.3% against 29.5%. Entertainment came in $0.2B below forecast and Sports $0.1B above. In August the forecast disclosed that it sat about $1.0B above the ~$19.7B implied by Disney's own outlook; Disney's outlook proved accurate. Net income differs by far more than segment operating income because the forecast held FY25's below-the-line amount, which included a tax benefit, while FY26 carried tax expense and higher restructuring charges.`,

  sourceDisclosure: `Baseline figures sourced from The Walt Disney Company's Fourth Quarter and Full Year Fiscal 2025 Earnings Press Release (filed November 13, 2025) and FY25 Form 10-K. FY26 actuals sourced from the Fourth Quarter Fiscal 2026 earnings release (November 17, 2026) and FY26 Form 10-K. Line-of-business operating metrics including parks attendance, per-capita guest spending, and cruise capacity growth are illustrative estimates inferred from management commentary; Disney does not publicly disclose all of these as absolute figures. Forecast scenarios are driver-based projections by Omico Group and do not represent company guidance. This dashboard is presented for educational and methodology demonstration purposes only and is not investment advice or a recommendation to buy, hold, or sell any security.`,
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
