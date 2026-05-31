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
