# v2.1 — Fiscal 2026 Actuals, Segment Cost Detail, and Out-Year Retirement

**Spec date:** November 23, 2026
**Base:** `main` at `3cbfc03` (tag `v2.0`)
**Branch:** `v2.1-fy26-actuals`
**Owner:** Agustin E. Cortez, MBA
**Designed in:** a prototype review session on November 23, 2026. Every layout decision below was reviewed on a rendered mock-up of the Segment Forecast table before any code changed.

---

## 1. Why

Disney reported fiscal 2026 on November 17, 2026 (fourth-quarter earnings release) and filed its fiscal 2026 annual report on Form 10-K the same week. The dashboard's fiscal 2026 forecast can now be shown next to the real result.

At the same time, the fiscal 2027 and fiscal 2028 forecast columns are being retired. Disney's announced reorganization of Consumer Products from Experiences into Entertainment (effective fiscal 2027) and the restated segment history expected in February 2027 will change the out-years too much to keep them as a reference, and they will not be maintained in the meantime. The frozen "Prior FY26 Forecast" column (the v1 forecast as shipped May 31, 2026) is also retired: with actuals available, the actual-versus-final-forecast comparison replaces the v1-versus-v2 comparison.

## 2. Segment Forecast table — new layout

### Columns

| Column | Source | Header style |
|---|---|---|
| `FY25 Actual` | Fiscal 2025 annual report and fourth-quarter fiscal 2025 release | Navy (unchanged) |
| `FY26 Actual` | Fiscal 2026 annual report and fourth-quarter fiscal 2026 release | Navy (same as `FY25 Actual`) |
| `FY26 Forecast*` | Live forecast engine at current slider values | Gold (unchanged), gold cell tint (unchanged) |

Removed: `Prior FY26 Forecast`, `FY27 Forecast`, `FY28 Forecast`.

### Rows, per segment (Entertainment, Sports, Experiences — order unchanged)

1. `Revenues` (renamed from "Revenue", matching Disney's wording)
2. Disney's reported cost lines, indented one level further, muted text:
   - Entertainment and Sports: Programming and production costs; Other segment operating expenses; Selling, general, administrative and other; Depreciation and amortization
   - Experiences: Operating labor; Infrastructure costs; Costs of goods sold and distribution costs; Other segment operating expenses; Selling, general, administrative and other; Depreciation and amortization
3. `Costs and Expenses` — subtotal of the cost lines, thin rule above
4. `Equity income from investees` — shown for all three segments; Experiences shows a dash
5. `Entertainment Operating Income` / `Sports Operating Income` / `Experiences Operating Income` — bold subtotal, stronger rule above. Revenues − Costs and Expenses + Equity income = segment operating income, exactly, in every column.
6. `Operating Margin` (unchanged)

Below the segments, unchanged in position and style: `Total Segment Operating Income`, `Corporate, eliminations & below-the-line`, `Net Income to Shareholders (proxy)`.

Considered and rejected during the prototype review: a per-segment "Corporate" row. Disney does not charge corporate costs to its segments; segment operating income is reported before corporate and unallocated shared expenses, which stay in the below-the-line row.

### Numbers

Fiscal 2025 actual (unchanged revenue and operating income; cost lines and equity income newly added from the fiscal 2025 annual report segment note):

| $M | Entertainment | Sports | Experiences |
|---|---:|---:|---:|
| Revenues | 42,466 | 17,672 | 36,156 |
| Costs and Expenses | 38,231 | 14,857 | 26,161 |
| Equity income from investees | 439 | 67 | — |
| Segment operating income | 4,674 | 2,882 | 9,995 |

Fiscal 2026 actual (new, from the fourth-quarter fiscal 2026 release and the fiscal 2026 annual report segment note):

| $M | Entertainment | Sports | Experiences |
|---|---:|---:|---:|
| Revenues | 46,562 | 18,632 | 39,566 |
| Costs and Expenses | 41,527 | 15,616 | 28,375 |
| Equity income from investees | 408 | 78 | — |
| Segment operating income | 5,443 | 3,094 | 11,191 |

Fiscal 2026 actual Total Segment Operating Income 19,728; below-the-line (9,829); net income attributable to Disney 9,899. The below-the-line figure is net income attributable to Disney minus Total Segment Operating Income and covers corporate and unallocated shared expenses (1,461), the India joint venture equity loss (158), restructuring and impairment charges (1,456), net interest expense (1,157), acquisition amortization (1,284), income taxes (3,564) and noncontrolling interests (749).

### Forecast column rules

- Revenues and segment operating income come from the engine, rounded to the nearest $1M for display.
- Equity income from investees is held at the fiscal 2025 level (Entertainment 439, Sports 67).
- Costs and Expenses = rounded Revenues − rounded segment operating income + equity income, so each segment foots exactly.
- Cost lines split the Costs and Expenses total using each line's fiscal 2025 share of that segment's total, rounded by largest remainder so they add exactly to the total. This is a presentational split, not a line-level forecast, and the footnote says so.
- **Rounding fix:** `Total Segment Operating Income` in the forecast column is the sum of the three displayed (rounded) segment figures, and net income is that total plus below-the-line. At default sliders this shows 20,862 and 15,715 (previously 20,861 and 15,714, which did not foot to the rows above).
- No change to `lib/forecastMath.ts`. The tornado chart and narrative still read the unrounded engine values.

### Growth badges

- `FY26 Actual` shows growth against `FY25 Actual` on Revenues, each segment operating income, Total Segment Operating Income and net income.
- `FY26 Forecast*` shows no growth badges.
- No badges on cost lines, Costs and Expenses, equity income or margin (a rising cost would read green).

### Footnotes

- Card header, right side: `* Final Forecast as of August 2026` (the only header note; the asterisk appears only on `FY26 Forecast*`).
- Card subtitle: `Dollars in $M · FY25 and FY26 actual + FY26 forecast`.
- Table footer: the 53rd week (fiscal 2026 runs one week longer; the forecast assumes a +2% revenue benefit; Disney estimates about $1.6 billion, or 2%), what the below-the-line row covers and that the forecast holds the fiscal 2025 amount, the forecast cost-line split and equity income assumptions, and that growth is against fiscal 2025.

## 3. Everything else that changes

| File | Change |
|---|---|
| `lib/tableModel.ts` (new) | Builds every figure in the table for all three columns, applying the rules in section 2; shared by the table and the chart |
| `components/ForecastTable.tsx` | Rebuilt to the layout in section 2 |
| `components/SegmentChart.tsx` | Categories become `FY25 Actual`, `FY26 Actual`, `FY26 Forecast*`; fiscal 2027 and 2028 removed |
| `components/Header.tsx` | Badge text `DIS · FY25 and FY26 Actual + FY26 Forecast` |
| `app/layout.tsx` | Page title and description: Omico Group; no fiscal 2027–2028 |
| `lib/narrativeLogic.ts` | Remove the "three-year path … by FY28" sentence from all four headline variants; remove "Default assumptions align with management's own disclosed outlook…" from the in-line variant |
| `lib/disneyData.ts` | Add fiscal 2025 and fiscal 2026 cost lines, equity income and fiscal 2026 actuals; remove `PRIOR_FY26_FORECAST`; remove the stale "Default of 11.5%…" sentence from the Entertainment margin tooltip; remove the fiscal 2027–2028 paragraph from the Sports rights cost tooltip; About text no longer claims defaults align with Disney's outlook; methodology note rewritten as the fiscal 2026 forecast-versus-actual note; Omico Group branding |
| `components/AboutCard.tsx` | Note label `FY26 Forecast vs. Actual`; add fiscal 2026 data sources; below-the-line assumption applies to the fiscal 2026 forecast only; 53rd-week note drops "Not applicable to FY27 or FY28"; new cost-line and equity income assumption; Omico Group branding |
| `components/Footer.tsx` | Omico Group branding |
| `README.md` | Updated description, sources and v2 section; new "FY26 forecast vs. actual" section; Omico Group branding |

## 4. Out of scope

- Any change to driver defaults, slider ranges or forecast math.
- Rewriting the narrative panel's guidance framing for a completed year (next version, after Disney's restated fiscal 2027 segments in February 2027).
- Modeling Consumer Products moving to Entertainment.
- Forecasting individual cost lines or equity income.

## 5. Exit criteria

- [ ] Table shows exactly three data columns in the order above, with the asterisk only on `FY26 Forecast*`.
- [ ] Every segment in every column: cost lines sum to Costs and Expenses; Revenues − Costs and Expenses + equity income = segment operating income.
- [ ] Actual columns match Disney's filings figure for figure (section 2 tables).
- [ ] Forecast column total equals the sum of the displayed segment figures; net income equals total plus below-the-line.
- [ ] Growth badges appear only under `FY26 Actual`.
- [ ] No user-facing text mentions FY27, FY28, the Prior column or AugieAI Execute.
- [ ] Sliders, Reset, tornado chart and narrative still work; forecast column recalculates on every slider move while both actual columns stay fixed.
- [ ] Type check, lint and production build pass.
