# Disney Segment Forecast Dashboard

An interactive driver-based financial scenario tool for The Walt Disney Company's three reportable segments — Entertainment, Sports, and Experiences. Built as a methodology demonstration of operational forecast modeling using public financial disclosures.

## Live URL

**[disney-segment-dashboard.vercel.app](https://disney-segment-dashboard.vercel.app)**

## What this dashboard does

The tool reads Disney's FY25 and FY26 actual segment financials — revenues, Disney's reported cost lines, equity income from investees, and segment operating income — from the 10-K filings and earnings releases, sets them beside the final FY26 forecast driven by twelve user-adjustable operational sliders, and displays the results across a forecast table, segment chart, sensitivity tornado, and adaptive narrative panel.

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
- Q1, Q2, and Q3 FY26 earnings releases (February 2, May 6, and August 5, 2026) — evidence for the final FY26 forecast
- Q4 FY26 earnings release (November 17, 2026) and FY26 Form 10-K (fiscal year ended October 3, 2026) — FY26 actuals

Segment cost lines and equity income from investees come from the segment information note in each year's 10-K.

Line-of-business operating metrics including parks attendance, per-capita guest spending, and cruise capacity growth are illustrative estimates inferred from management commentary; Disney does not publicly disclose all of these as absolute figures.

## What the Q1–Q3 FY26 actuals taught us

v2 (released August 2026) recalibrates the FY26 driver defaults using evidence from Disney's Q1, Q2, and Q3 fiscal 2026 filings (Business Wire releases dated February 2, May 6, and August 5, 2026 respectively). v1's shipped FY26 forecast — the version live on this dashboard from May 31, 2026 through v2's release — was shown beside it as a frozen "Prior FY26 Forecast" column until v2.1 replaced that comparison with FY26 actuals. Each recalibrated default's evidence citation is documented in its driver's info tooltip.

Three segment-level lessons stand out. **Entertainment margin was conservative in v1.** The v1 default of 11.5% assumed only modest expansion from FY25's 11.0%; actuals ran Q1 9.5% → Q2 ~11.3% → Q3 14.8%, with Entertainment SVOD hitting a 13% operating margin in Q3 FY26 as DTC scaled against a comparatively fixed content cost base. v2 raises the default to 12.5%. **Sports cost pressure ran heavier than modeled.** v1 assumed +4% programming cost growth; Q3 FY26 saw Sports operating income decline 17% year-over-year (vs. Disney's own −14% guidance), driven by a double-digit programming expense step-up including NBA rights timing. v2 raises the `sportsRightsCostGrowth` default to +7% and derives a `sportsMargin` default of 18.0% to hold effective FY26 Sports OI inside Disney's mid-single-digit growth guidance range. **Experiences margin ran hotter than assumed.** v1 held Experiences margin flat at 27.6%; Disney disclosed approximately 30% Experiences operating margin through the first nine months of FY26 on the Q3 earnings call, with Q3 alone at 30.3%. v2 raises the default to 29.5% — deliberately below the 9M YTD figure to avoid over-projecting the Q3 breakout. A structural change already announced but out of scope for v2 is the Consumer Products line-of-business reorganization from Experiences to Entertainment, effective FY27. Modeling that reorganization requires Disney's restated historical segment baselines, expected in the Q1 FY27 filing (early February 2027), and will be revisited in a future v3.

**What v2 explicitly does not do.** v2 does not convert the model from annual to quarterly — the dashboard stays a full-year projection tool. v2 does not model the Consumer Products reorganization (deferred to v3 as noted above). v2 does not attempt to converge default-state Total Segment Operating Income on Disney's own blended actual-plus-Q4-guide FY26 outlook (~$19.7B); at v2 defaults the model produces approximately $20.9B — roughly $1.0B above the implied guide — because applying Q3-rate driver evidence uniformly across all four quarters of FY26 produces a higher full-year figure than blending three actuals quarters with a softer Q4 guide. Users who want to converge on Disney's implied outlook can soften individual drivers toward blended Q1–Q3 rates; the dashboard's purpose is scenario modeling, not guidance matching.

## FY26 forecast vs. actual (v2.1)

Disney reported fiscal 2026 on November 17, 2026. v2.1 (November 2026) sets the actuals beside the final FY26 forecast — the v2 forecast as recalibrated in August 2026 — and breaks each segment into Disney's reported cost lines, equity income from investees, and a segment operating income subtotal. Segment operating income at default settings, $M:

| Segment | FY26 Forecast | FY26 Actual | Forecast minus actual |
|---|---:|---:|---:|
| Entertainment | 5,644 | 5,443 | +201 |
| Sports | 2,971 | 3,094 | −123 |
| Experiences | 12,247 | 11,191 | +1,056 |
| **Total Segment Operating Income** | **20,862** | **19,728** | **+1,134** |

The forecast came in about 5.7% high. In August it disclosed that it sat about $1.0B above Disney's own implied outlook of ~$19.7B; Disney's outlook proved accurate. Most of the miss is Experiences, where revenue came in about $1.9B below forecast and the margin was 28.3% against 29.5%. Net income differs by far more ($15,715M forecast vs. $9,899M actual) because the forecast held FY25's below-the-line amount, which included a tax benefit, while FY26 carried tax expense and higher restructuring charges.

v2.1 also retires the FY27 and FY28 forecast columns and the frozen Prior FY26 Forecast column. Disney's reorganization of Consumer Products into Entertainment (effective FY27) and the restated segment history expected in February 2027 will change the out-years too much to keep them as a reference. Full spec: `docs/v2_1_spec.md`.

## Disclosure

Forecast scenarios are driver-based projections and do not represent company guidance. This dashboard is presented for educational and methodology demonstration purposes only and is not investment advice or a recommendation to buy, hold, or sell any security.

## About the methodology

Built by **Omico Group** — a methodology for closing the gap between enterprise AI experimentation and AI execution. This dashboard demonstrates driver-based segment forecasting applied to a public company using publicly available financial disclosures.

Companion portfolio asset: [AI Opportunity Assessment](https://ai-opportunity-assessment-livid.vercel.app)

## Author

**Agustin E. Cortez, MBA**
agustin.e.cortez@gmail.com

Finance & FP&A Leader · AI Implementation Methodology Builder
ex-American Express Global Business Travel · Warner Bros · DIRECTV Latin America · Starwood · Infineon Technologies
