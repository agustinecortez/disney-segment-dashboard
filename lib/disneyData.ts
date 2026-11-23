// lib/disneyData.ts
// ─────────────────────────────────────────────────────────────────────────────
// All Disney-specific data lives here. This is the swappable config — when a
// future engagement requires a different sample company, only this file changes.
//
// Two methods (spec: docs/v3_spec.md):
//   Old Method — FY25 and FY26 actuals as originally reported (FY25 and FY26
//     Forms 10-K, Q4 FY25 and Q4 FY26 earnings releases) beside the final FY26
//     forecast as of August 2026, frozen in FINAL_FY26_FORECAST.
//   New Method — Disney's new segment structure effective FY27, with FY25 and
//     FY26 as restated in Disney's Form 8-K supplemental segment information
//     (November 17, 2026), projected to FY27 and FY28 by the 12 drivers below.
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
  // ── Old Method (as originally reported) ──
  fy25Revenue: number; // $M
  fy25OperatingIncome: number; // $M
  costLineLabels: string[]; // Disney's significant segment expense categories, in reported order
  fy25CostLines: number[]; // $M — same order as costLineLabels
  fy25EquityIncome: number; // $M
  fy26Actual: SegmentActual;
  // ── New Method drivers (FY27–FY28) ──
  drivers: DriverDefinition[];
}

export interface CompanyConfig {
  companyName: string;
  ticker: string;
  belowTheLineAdjustment: number; // $M — FY25 net income attributable to Disney minus Total Segment OI; held in the final FY26 forecast
  fy26ActualBelowTheLine: number; // $M — FY26 net income attributable to Disney minus Total Segment OI, as reported
  fy26ActualNetIncome: number; // $M — FY26 net income attributable to Disney, as reported
  segments: SegmentBaseline[];
  sourceDisclosure: string;
  aboutText: string;
  methodologyNote: string; // Old Method: "FY26 Forecast vs. Actual" section in AboutCard
  newMethodNote: string; // New Method: "New Method (FY27–FY28)" section in AboutCard
}

// ─────────────────────────────────────────────────────────────────────────────
// Disney company configuration
// ─────────────────────────────────────────────────────────────────────────────

export const DISNEY_CONFIG: CompanyConfig = {
  companyName: "The Walt Disney Company",
  ticker: "DIS",

  // Bridges $17,551M Total Segment OI → $12,404M Net Income to Disney shareholders
  belowTheLineAdjustment: -5_147,

  // FY26 as reported: $19,728M Total Segment OI → $9,899M Net Income to Disney
  // shareholders. The (9,829) covers corporate and unallocated shared expenses
  // (1,461), India joint venture equity loss (158), restructuring and
  // impairment (1,456), net interest (1,157), acquisition amortization (1,284),
  // income taxes (3,564) and noncontrolling interests (749).
  fy26ActualBelowTheLine: -9_829,
  fy26ActualNetIncome: 9_899,

  segments: [
    // ── Entertainment ─────────────────────────────────────────────────────
    {
      key: "entertainment",
      name: "Entertainment",
      fy25Revenue: 42_466,
      fy25OperatingIncome: 4_674,
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
          id: "svodSubGrowth",
          label: "SVOD Subscriber Growth",
          description:
            "Growth in Disney+ and Hulu paid subscriptions. Disney no longer reports subscriber counts, and stops reporting SVOD operating income from Q1 FY27; SVOD revenue is still reported (FY26 restated $22,414M, +13.6% as reported). On the Q4 FY26 call (Nov 17, 2026) management cited healthy engagement growth on Disney+, especially in EMEA, Latin America and APAC, and said it is exploring a free, ad-supported tier. Default +5.0% assumes pricing does more of the work than subscriber growth.",
          unit: "percent",
          defaultValue: 5,
          min: -5,
          max: 20,
          step: 0.5,
        },
        {
          id: "svodArpuGrowth",
          label: "SVOD Revenue per Subscriber Growth",
          description:
            "Subscription fees and advertising per subscriber. October 2026 U.S. price increase: the most popular bundle unchanged, standalone ad-supported plans +4% ($11.99 to $12.49), ad-free premium +13% ($18.99 to $21.49). Default +4.0%. With subscriber growth, SVOD revenue grows about 9% at defaults, against roughly 11% in FY26 excluding the 53rd week.",
          unit: "percent",
          defaultValue: 4,
          min: -2,
          max: 10,
          step: 0.5,
        },
        {
          id: "networksGrowth",
          label: "Networks and vMVPD Revenue Growth",
          description:
            "Linear networks plus virtual pay-TV (Hulu + Live TV and Fubo). FY26 restated revenue rose to $14,946M from $14,247M, but that includes Fubo, combined with Hulu + Live TV on October 29, 2025 (Disney owns 70%). Excluding about 11 months of Fubo, the business shrank about 5%; networks advertising fell to $3,087M from $3,259M. Default −5.0%.",
          unit: "percent",
          defaultValue: -5,
          min: -20,
          max: 10,
          step: 0.5,
        },
        {
          id: "entertainmentMargin",
          label: "Entertainment Operating Margin",
          description:
            "Segment operating income ÷ revenue on Disney's new structure (Consumer Products included, equity income excluded). Restated FY25 13.9%, FY26 14.7% (14.4% excluding the 53rd week). CFO on the Q4 FY26 call: \"we expect Entertainment segment margin to expand as well,\" led by SVOD. Disney guides FY27 Entertainment operating income to grow in the high single digits excluding the 53rd week; the 14.8% default lands at +7.0%, the low end of that range.",
          unit: "margin",
          defaultValue: 14.8,
          min: 10,
          max: 20,
          step: 0.1,
        },
      ],
    },

    // ── Sports ─────────────────────────────────────────────────────────────
    {
      key: "sports",
      name: "Sports",
      fy25Revenue: 17_672,
      fy25OperatingIncome: 2_882,
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
            "Cable and satellite affiliate fees plus ESPN direct-to-consumer subscriptions. FY26 subscription and affiliate fees $12,798M vs. $11,944M in FY25 (+7.1%; about +5.5% excluding the 53rd week), including the NFL Network transaction. Default +5.0%.",
          unit: "percent",
          defaultValue: 5,
          min: -5,
          max: 15,
          step: 0.5,
        },
        {
          id: "sportsAdvertisingGrowth",
          label: "Sports Advertising Revenue Growth",
          description:
            "National and local ad sales. FY26 advertising $4,768M vs. $4,444M (+7.3%); ESPN advertising grew 20% in Q4 FY26. ESPN will carry every round of the expanded College Football Playoff, growing from 11 to 23 games starting with the 2027 season (mostly FY28). Default +5.0%.",
          unit: "percent",
          defaultValue: 5,
          min: -10,
          max: 20,
          step: 0.5,
        },
        {
          id: "sportsRightsCostGrowth",
          label: "Sports Rights & Programming Cost Growth",
          description:
            "Contractual sports rights and programming cost increases. Programming costs are approximately 50% of Sports revenue; when cost growth exceeds organic revenue growth, the effective Sports margin compresses proportionally. Disney guides FY27 cash content spend up about 9% to about $26B, driven by sports, international content and theatrical, and $11.2B of sports programming commitments fall due in FY27. Default +7.0%.",
          unit: "percent",
          defaultValue: 7,
          min: 0,
          max: 15,
          step: 0.5,
        },
        {
          id: "sportsMargin",
          label: "Sports Operating Margin",
          description:
            "Sports operating margin before the programming-cost adjustment. FY26 actual 16.6%. At default revenue and cost growth the adjustment subtracts about 1.0 point, for an effective FY27 margin of about 17.4%. Disney guides Sports operating income to grow double digits excluding the 53rd week (high single digits as reported), with Q1 down on College Football Playoff timing. The 18.5% default is the lowest 0.1 step that reaches double-digit growth (+10.6%).",
          unit: "margin",
          defaultValue: 18.5,
          min: 12,
          max: 24,
          step: 0.1,
        },
      ],
    },

    // ── Experiences ────────────────────────────────────────────────────────
    {
      key: "experiences",
      name: "Experiences",
      fy25Revenue: 36_156,
      fy25OperatingIncome: 9_995,
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
            "Guest volume at domestic and international parks and resorts. FY26 global guests +5% (+4% excluding the 53rd week); Q4 FY26 domestic attendance +3% excluding the 53rd week; Walt Disney World resort bookings pacing up for Q1 FY27. Management expects consumer pressure at Shanghai and Hong Kong to continue into FY27. Default +2.0%.",
          unit: "percent",
          defaultValue: 2,
          min: -5,
          max: 10,
          step: 0.5,
        },
        {
          id: "perCapitaGrowth",
          label: "Per Capita Guest Spending Growth",
          description:
            "Spend per guest across tickets, food, merchandise, hotels and cruises. Q4 FY26 per capita spending +4% domestic, +5% international. Default +4.0%.",
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
            "Disney Cruise Line capacity growth. Disney Destiny and Disney Adventure entered service during FY26, so FY27 is their first full year; the next ship, Disney Believe, is expected in late 2027 (mostly FY28). The +12.0% default estimates the stateroom increase from a full year of both ships. Cruise revenue is estimated at $4.5B in FY26 (Disney does not disclose it; a UK filing showed about $3.0B in FY25).",
          unit: "percent",
          defaultValue: 12,
          min: 0,
          max: 40,
          step: 0.5,
        },
        {
          id: "experiencesMargin",
          label: "Experiences Operating Margin",
          description:
            "Experiences operating margin on the new structure (Consumer Products moved to Entertainment; Branded Retail remains). Restated FY25 24.0%, FY26 24.7%. Disney guides FY27 Experiences operating income to grow in the high single digits excluding the 53rd week, with growth in the first half and relatively flat in the second half. The 24.6% default lands at +7.1%, the low end of that range.",
          unit: "margin",
          defaultValue: 24.6,
          min: 20,
          max: 30,
          step: 0.1,
        },
      ],
    },
  ],

  aboutText: `This dashboard models The Walt Disney Company's three segments using Disney's public disclosures. The Old Method tab compares the final FY26 forecast (August 2026) with FY25 and FY26 actuals as originally reported in the 10-K filings and earnings releases. The New Method tab uses Disney's new segment structure, effective FY27, with FY25 and FY26 as restated by Disney on November 17, 2026, and projects FY27 and FY28 from twelve adjustable drivers. Forecast scenarios are illustrative and do not represent company guidance. Built by Omico Group as a methodology demonstration of driver-based segment forecasting. This is not investment advice.`,

  methodologyNote: `The Old Method FY26 Forecast column is the final forecast, last recalibrated in August 2026 using Disney's Q1, Q2, and Q3 fiscal 2026 results (February 2, May 6, and August 5, 2026). Disney reported FY26 Total Segment Operating Income of $19.7B on November 17, 2026; the forecast was $20.9B, about $1.1B (5.7%) high. Most of the gap is Experiences, forecast $1.1B too high: revenue came in about $1.9B below forecast and the margin was 28.3% against 29.5%. Entertainment came in $0.2B below forecast and Sports $0.1B above. In August the forecast disclosed that it sat about $1.0B above the ~$19.7B implied by Disney's own outlook; Disney's outlook proved accurate. Net income differs by far more than segment operating income because the forecast held FY25's below-the-line amount, which included a tax benefit, while FY26 carried tax expense and higher restructuring charges.`,

  newMethodNote: `Disney restated FY25 and FY26 for its new segment structure on November 17, 2026: Consumer Products (except Branded Retail) moved from Experiences to Entertainment, and equity income was removed from Entertainment. FY27 and FY28 are projected from restated FY26 with the 53rd week removed, using Disney's segment estimates of that week. Revenue and cost drivers come from FY26 actuals and recent disclosures; the three margin drivers are set so each segment's FY27 operating income lands at the low end of Disney's FY27 guidance (Entertainment and Experiences high single digits, Sports double digits, total about 8%, all excluding the 53rd week). At defaults FY27 Total Segment Operating Income is $20.3B, up 7.6%. This anchoring replaces the Old Method's evidence-only approach, which overshot FY26 by $1.1B while Disney's own outlook proved accurate. FY28 has no guidance and follows the same drivers.`,

  sourceDisclosure: `Baseline figures sourced from The Walt Disney Company's Fourth Quarter and Full Year Fiscal 2025 Earnings Press Release (filed November 13, 2025) and FY25 Form 10-K. FY26 actuals sourced from the Fourth Quarter Fiscal 2026 earnings release (November 17, 2026) and FY26 Form 10-K. Restated FY25 and FY26 segment figures sourced from Disney's Form 8-K supplemental segment information (November 17, 2026). Line-of-business operating metrics including parks attendance, per-capita guest spending, and cruise capacity growth are illustrative estimates inferred from management commentary; Disney does not publicly disclose all of these as absolute figures. Forecast scenarios are driver-based projections by Omico Group and do not represent company guidance. This dashboard is presented for educational and methodology demonstration purposes only and is not investment advice or a recommendation to buy, hold, or sell any security.`,
};

// ─────────────────────────────────────────────────────────────────────────────
// Old Method — the final FY26 forecast as of August 2026, frozen.
// Captured from the v2.1 default-state output (v2 driver defaults, FY25 cost-line
// shares, FY25 equity income, totals as the sum of displayed segments). These
// values are constants: never recomputed and not affected by any slider.
// ─────────────────────────────────────────────────────────────────────────────

export interface FrozenSegmentForecast {
  revenue: number; // $M
  costLines: number[]; // $M — same order as the segment's costLineLabels
  equityIncome: number; // $M
  operatingIncome: number; // $M
  operatingMargin: number; // percent
}

export const FINAL_FY26_FORECAST: Record<SegmentKey, FrozenSegmentForecast> & {
  totalSegmentOI: number;
  belowTheLine: number;
  netIncome: number;
} = {
  entertainment: { revenue: 45_153, costLines: [23_273, 5_643, 10_170, 862], equityIncome: 439, operatingIncome: 5_644, operatingMargin: 12.5 },
  sports: { revenue: 18_566, costLines: [13_169, 1_039, 1_403, 51], equityIncome: 67, operatingIncome: 2_971, operatingMargin: 16.0 },
  experiences: { revenue: 41_514, costLines: [10_010, 3_928, 3_639, 3_929, 4_603, 3_158], equityIncome: 0, operatingIncome: 12_247, operatingMargin: 29.5 },
  totalSegmentOI: 20_862,
  belowTheLine: -5_147,
  netIncome: 15_715,
};

// ─────────────────────────────────────────────────────────────────────────────
// New Method — Disney's new segment structure (effective FY27).
// FY25 and FY26 restated in Disney's Form 8-K supplemental segment information
// (November 17, 2026). Sports is unchanged by the restatement; its revenue lines
// come from Note 3 and its cost lines from the segment note of the FY25 and FY26
// Forms 10-K. Revenue lines sum to segment revenue; revenue − sum(costLines) +
// equityIncome = operating income, exactly.
// ─────────────────────────────────────────────────────────────────────────────

export interface RestatedYear {
  revenueLines: number[]; // $M — same order as revenueLineLabels
  costLines: number[]; // $M — same order as costLineLabels
  equityIncome: number; // $M
  operatingIncome: number; // $M
}

export interface NewMethodSegment {
  key: SegmentKey;
  name: string;
  revenueLineLabels: string[];
  costLineLabels: string[];
  fy25: RestatedYear;
  fy26: RestatedYear;
  // Estimated 53rd-week contribution inside FY26, removed from the FY27 base.
  fiftyThirdWeek: { revenue: number; operatingIncome: number };
}

export const NEW_METHOD = {
  segments: {
    entertainment: {
      key: "entertainment",
      name: "Entertainment",
      revenueLineLabels: ["SVOD (Disney+, Hulu)", "Content and IP", "Networks and vMVPD"],
      costLineLabels: [
        "Operating expenses",
        "Selling, general, administrative and other",
        "Depreciation and amortization",
      ],
      fy25: { revenueLines: [19_731, 12_042, 14_247], costLines: [28_274, 10_404, 940], equityIncome: 0, operatingIncome: 6_402 },
      fy26: { revenueLines: [22_414, 12_913, 14_946], costLines: [31_299, 10_582, 1_025], equityIncome: 0, operatingIncome: 7_367 },
      // Disney's Entertainment estimate ($810M / $230M) plus the Consumer Products
      // share of the Experiences estimate (by revenue and operating income share).
      fiftyThirdWeek: { revenue: 864, operatingIncome: 268 },
    },
    sports: {
      key: "sports",
      name: "Sports",
      revenueLineLabels: ["Subscription and affiliate fees", "Advertising", "Other"],
      costLineLabels: [
        "Programming and production costs",
        "Other segment operating expenses",
        "Selling, general, administrative and other",
        "Depreciation and amortization",
      ],
      fy25: { revenueLines: [11_944, 4_444, 1_284], costLines: [12_492, 986, 1_331, 48], equityIncome: 67, operatingIncome: 2_882 },
      fy26: { revenueLines: [12_798, 4_768, 1_066], costLines: [13_091, 1_035, 1_375, 115], equityIncome: 78, operatingIncome: 3_094 },
      fiftyThirdWeek: { revenue: 290, operatingIncome: 80 },
    },
    experiences: {
      key: "experiences",
      name: "Experiences",
      revenueLineLabels: ["Domestic", "International"],
      costLineLabels: [
        "Operating expenses",
        "Selling, general, administrative and other",
        "Depreciation and amortization",
      ],
      fy25: { revenueLines: [26_082, 6_520], costLines: [18_623, 3_443, 2_708], equityIncome: 0, operatingIncome: 7_828 },
      fy26: { revenueLines: [28_899, 6_956], costLines: [20_163, 3_721, 3_112], equityIncome: 0, operatingIncome: 8_859 },
      // Disney's Experiences estimate ($580M / $180M) less the Consumer Products share.
      fiftyThirdWeek: { revenue: 526, operatingIncome: 142 },
    },
  } as Record<SegmentKey, NewMethodSegment>,

  // Net income attributable to Disney is unchanged by the restatement.
  fy25NetIncome: 12_404,
  fy26NetIncome: 9_899,

  // Fixed (non-slider) forecast assumptions
  cruiseRevenueFY26: 4_500, // $M inside Domestic — estimate; Disney does not disclose cruise revenue
  contentAndIpGrowth: 5, // % a year
  sportsOtherGrowth: 0, // % a year

  // Below-the-line bridge for FY27–FY28 ($M unless noted)
  belowTheLine: {
    corporateAndUnallocated: 1_461, // FY26 level
    acquisitionAmortization: 1_200, // FY27 guidance: "about $1.2 billion"
    netInterest: 1_157, // FY26 level
    indiaJointVentureLoss: 158, // FY26 level
    restructuring: 0, // none assumed
    taxRatePct: 22, // FY27 guidance: "low-20s effective tax rate"
    noncontrollingInterests: 749, // FY26 level
  },

  // Disney's FY27 guidance (Q4 FY26 earnings release, November 17, 2026), growth
  // in segment operating income excluding the 53rd week. "High single digits"
  // is read as 7–9%.
  guidance: {
    total: 8,
    entertainment: { low: 7, high: 9, text: "high single digits" },
    sports: { low: 10, high: null as number | null, text: "double digits" },
    experiences: { low: 7, high: 9, text: "high single digits" },
  },
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
