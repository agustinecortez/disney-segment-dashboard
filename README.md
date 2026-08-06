# Disney Segment Forecast Dashboard

An interactive driver-based financial scenario tool for The Walt Disney Company's three reportable segments — Entertainment, Sports, and Experiences. Built as a methodology demonstration of operational forecast modeling using public financial disclosures.

## Live URL

**[disney-segment-dashboard.vercel.app](https://disney-segment-dashboard.vercel.app)**

## What this dashboard does

The tool reads Disney's FY25 actual segment financials from the 10-K and Q4 FY25 earnings press release, projects FY26-FY28 forecasts driven by twelve user-adjustable operational sliders, and displays the results across a forecast table, segment chart, sensitivity tornado, and adaptive narrative panel. Default-state outputs align with Disney's own stated FY26 outlook ranges (double-digit Entertainment SOI growth, low-single-digit Sports SOI growth, high-single-digit Experiences SOI growth).

The dashboard is built around three principles:

- **Credibility.** Every baseline number is sourced from Disney's public filings. The "About this dashboard" modal in the header makes the methodology transparent.
- **Interactivity.** All twelve drivers are live. Outputs recalculate on every slider change.
- **Portability.** Disney-specific data is isolated to one configuration file, making the dashboard architecture swappable to other public companies.

## Tech stack

- **Framework:** Next.js 16 (App Router) with TypeScript
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Icons:** Lucide React
- **Hosting:** Vercel
- **Development environment:** Claude Code

## Source data

Baseline figures sourced from The Walt Disney Company's:
- FY25 Form 10-K (filed November 2025)
- Q4 FY25 earnings press release (filed November 13, 2025)
- FY26 forward guidance from Q4 FY25 earnings call

Line-of-business operating metrics including parks attendance, per-capita guest spending, and cruise capacity growth are illustrative estimates inferred from management commentary; Disney does not publicly disclose all of these as absolute figures.

## What the Q1–Q3 FY26 actuals taught us

v2 (released August 2026) recalibrates the FY26 driver defaults using evidence from Disney's Q1, Q2, and Q3 fiscal 2026 filings (Business Wire releases dated February 2, May 6, and August 5, 2026 respectively). v1's shipped FY26 forecast — the version live on this dashboard from May 31, 2026 through v2's release — is preserved on the Segment Forecast table as a frozen "Prior FY26 Forecast" column so users can see, at a glance, where the driver-based model landed at v1 and where it lands now that three quarters of actuals are in. The Prior column is a hardcoded constant, never recomputed, and persists across every Reset and every slider movement. The methodology and each recalibrated default's evidence citation are documented in the About modal's Methodology Note (v2) and in each driver's info tooltip.

Three segment-level lessons stand out. **Entertainment margin was conservative in v1.** The v1 default of 11.5% assumed only modest expansion from FY25's 11.0%; actuals ran Q1 9.5% → Q2 ~11.3% → Q3 14.8%, with Entertainment SVOD hitting a 13% operating margin in Q3 FY26 as DTC scaled against a comparatively fixed content cost base. v2 raises the default to 12.5%. **Sports cost pressure ran heavier than modeled.** v1 assumed +4% programming cost growth; Q3 FY26 saw Sports operating income decline 17% year-over-year (vs. Disney's own −14% guidance), driven by a double-digit programming expense step-up including NBA rights timing. v2 raises the `sportsRightsCostGrowth` default to +7% and derives a `sportsMargin` default of 18.0% to hold effective FY26 Sports OI inside Disney's mid-single-digit growth guidance range. **Experiences margin ran hotter than assumed.** v1 held Experiences margin flat at 27.6%; Disney disclosed approximately 30% Experiences operating margin through the first nine months of FY26 on the Q3 earnings call, with Q3 alone at 30.3%. v2 raises the default to 29.5% — deliberately below the 9M YTD figure to avoid over-projecting the Q3 breakout. A structural change already announced but out of scope for v2 is the Consumer Products line-of-business reorganization from Experiences to Entertainment, effective FY27. Modeling that reorganization requires Disney's restated historical segment baselines, expected in the Q1 FY27 filing (early February 2027), and will be revisited in a future v3.

**What v2 explicitly does not do.** v2 does not convert the model from annual to quarterly — the dashboard stays a full-year projection tool. v2 does not recalibrate FY27 or FY28 driver defaults; those years continue to use the existing forward-projection logic against the new FY26 base, and their outputs should be read as sensitivity scenarios rather than point forecasts until FY27 disclosure evidence lands. v2 does not model the Consumer Products reorganization (deferred to v3 as noted above). v2 does not attempt to converge default-state Total Segment Operating Income on Disney's own blended actual-plus-Q4-guide FY26 outlook (~$19.7B); at v2 defaults the model produces approximately $20.9B — roughly $1.0B above the implied guide — because applying Q3-rate driver evidence uniformly across all four quarters of FY26 produces a higher full-year figure than blending three actuals quarters with a softer Q4 guide. The About modal's Methodology Note (v2) documents this divergence in full. Users who want to converge on Disney's implied outlook can soften individual drivers toward blended Q1–Q3 rates; the dashboard's purpose is scenario modeling, not guidance matching.

## Disclosure

Forecast scenarios are driver-based projections and do not represent company guidance. This dashboard is presented for educational and methodology demonstration purposes only and is not investment advice or a recommendation to buy, hold, or sell any security.

## About the methodology

Built by **AugieAI Execute** — a methodology for closing the gap between enterprise AI experimentation and AI execution. This dashboard demonstrates driver-based segment forecasting applied to a public company using publicly available financial disclosures.

Companion portfolio asset: [AI Opportunity Assessment](https://ai-opportunity-assessment-livid.vercel.app)

## Author

**Agustin E. Cortez, MBA**
agustin.e.cortez@gmail.com

Finance & FP&A Leader · AI Implementation Methodology Builder
ex-American Express Global Business Travel · Warner Bros · DIRECTV Latin America · Starwood · Infineon Technologies
