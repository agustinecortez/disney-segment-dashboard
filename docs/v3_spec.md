# v3 — Old Method and New Method: Fixed FY26 Forecast, FY27–FY28 Forecast on Disney's New Segment Structure

**Spec date:** November 23, 2026
**Base:** branch `v2.1-fy26-actuals` (`docs/v2_1_spec.md`)
**Branch:** `v3-new-method`
**Owner:** Agustin E. Cortez, MBA
**Designed in:** the same prototype session as v2.1 (November 23, 2026). Layout, defaults and the guidance rule below were reviewed on rendered mock-ups before any code changed.

---

## 1. Why

On November 17, 2026 Disney filed supplemental segment information (Form 8-K, Item 7.01) restating fiscal 2025 and 2026 for its new segment structure, effective with the first quarter of fiscal 2027:

- Consumer Products (except Branded Retail) moves from Experiences to Entertainment: $3,711M of fiscal 2026 revenue and $2,332M of operating income.
- Equity income is excluded from Entertainment segment results ($408M in fiscal 2026). Disney sold its A+E stake on September 30, 2026.
- Entertainment revenue is reported as SVOD, Content and IP, and Networks and vMVPD.
- Fiscal 2027 guidance is given on this structure.

This is the restated history that `docs/v2_phase4_spec.md` and the README reserved as the v3 trigger (expected February 2027; it arrived early). The fiscal 2026 forecast is kept fixed as the final August 2026 forecast, and the 12 scenario drivers now drive fiscal 2027 and 2028 on the new structure.

## 2. Page structure — two tabs

Tabs in the style of the NBCU dashboard's segment tabs, but selecting a method, not a segment:

| Tab | Header title | Contents |
|---|---|---|
| Old Method | `Disney Segment Forecast Dashboard (Old Method)` | The v2.1 Segment Forecast table (FY25 Actual, FY26 Actual, FY26 Forecast*), now fully fixed. No driver rail, chart, sensitivity or narrative. |
| New Method (default) | `Disney Segment Forecast Dashboard (New Method)` | Driver rail (12 drivers, 3 segments), New Method Segment Forecast table, Segment Revenue & Operating Income chart, FY27 OI Sensitivity, Scenario Briefing. |

The Reset button shows on the New Method tab only.

## 3. Old Method — fixed

The FY26 Forecast column is frozen as the final forecast as of August 2026 (the v2.0/v2.1 default-state output, including the v2.1 rounding fix): Total Segment Operating Income $20,862M, net income $15,715M. It no longer reads the sliders. The v2 driver set and FY25-based projection engine are retired; the frozen values live in `FINAL_FY26_FORECAST` in `lib/disneyData.ts`. Table layout, footnotes and badges are exactly as in `docs/v2_1_spec.md`.

## 4. New Method — Segment Forecast table

### Columns

`FY25 Actual` and `FY26 Actual` (Disney's restated figures, navy headers) · `FY27 Forecast` and `FY28 Forecast` (gold headers, gold cell tint).

### Rows per segment

1. `Revenues`, then Disney's new revenue lines, indented and muted:
   - Entertainment: SVOD (Disney+, Hulu); Content and IP; Networks and vMVPD
   - Sports: Subscription and affiliate fees; Advertising; Other (content sales plus other)
   - Experiences: Domestic; International
2. Cost lines, indented and muted — Entertainment and Experiences use Disney's restated lines (Operating expenses; Selling, general, administrative and other; Depreciation and amortization); Sports keeps its 10-K lines (unchanged segment)
3. `Costs and Expenses`
4. `Equity income from investees` (Sports only; dash for Entertainment and Experiences under the new structure)
5. `[Segment] Operating Income` (bold subtotal)
6. `Operating Margin`

Then `Total Segment Operating Income`, `Corporate, eliminations & below-the-line`, `Net Income to Shareholders (proxy)`.

### Restated actuals (Form 8-K, November 17, 2026; Sports from the 10-Ks)

| $M | FY25 Ent | FY26 Ent | FY25 Sports | FY26 Sports | FY25 Exp | FY26 Exp |
|---|---:|---:|---:|---:|---:|---:|
| Revenues | 46,020 | 50,273 | 17,672 | 18,632 | 32,602 | 35,855 |
| Costs and Expenses | 39,618 | 42,906 | 14,857 | 15,616 | 24,774 | 26,996 |
| Equity income | — | — | 67 | 78 | — | — |
| Segment operating income | 6,402 | 7,367 | 2,882 | 3,094 | 7,828 | 8,859 |

Total Segment Operating Income: 17,112 (FY25), 19,320 (FY26). Net income attributable to Disney is unchanged by the restatement (12,404; 9,899), so restated below-the-line is (4,708) and (9,421).

### Forecast rules

- **Base.** FY27 is projected from restated FY26 with the 53rd week removed, using Disney's segment estimates ($810M/$230M Entertainment, $290M/$80M Sports, $580M/$180M Experiences, revenue/operating income). The Consumer Products share of the Experiences estimate is moved to Entertainment in proportion to Consumer Products' revenue and operating income (an estimate): Entertainment $864M/$268M, Sports $290M/$80M, Experiences $526M/$142M. Each segment's revenue lines are scaled down proportionally.
- **Revenue lines.** SVOD = prior × (1 + subscriber growth) × (1 + revenue per subscriber growth). Networks and vMVPD = prior × (1 + networks growth). Content and IP grows a fixed 5%. Subscription and affiliate fees and Advertising grow by their drivers; Sports Other is held flat. Experiences Domestic = domestic parks and resorts × (1 + attendance) × (1 + per capita) + cruise × (1 + cruise capacity) × (1 + per capita); International = prior × (1 + attendance) × (1 + per capita). Fiscal 2026 cruise revenue is estimated at $4,500M inside Domestic (Disney does not disclose it; a UK filing showed about $3.0B for fiscal 2025, plus two new ships for part of fiscal 2026).
- **Operating income.** Revenue × segment margin driver. Sports uses the Decision 17 effective margin: margin driver − 50% × (programming cost growth − organic Sports revenue growth), with growth measured on the 52-week basis.
- **Display.** Revenue lines are rounded and Revenues is their sum; operating income is rounded; Costs and Expenses = Revenues − operating income + equity income; cost lines split Costs and Expenses using FY26 shares (largest remainder). Sports equity income held at FY26 ($78M). Totals are sums of displayed figures.
- **Below-the-line (forecast).** Corporate and unallocated shared expenses ($1,461M), net interest ($1,157M), India joint venture loss ($158M) and noncontrolling interests ($749M) at FY26 levels; acquisition amortization $1,200M and a 22% tax rate from Disney's FY27 guidance ("about $1.2 billion", "low-20s"); no restructuring charges.
- **Growth badges.** FY26 vs FY25; FY27 vs FY26 excluding the 53rd week (Disney's guidance basis); FY28 vs FY27; net income vs the prior year as reported. Badges on Revenues, segment operating income, Total Segment Operating Income and net income only.

## 5. Driver defaults — anchored to the low end of Disney's FY27 guidance

Rule (replaces Decision 33's "evidence over convergence" for this version): revenue and cost drivers come from fiscal 2026 actuals and recent news; the three margin drivers are set so each segment's FY27 operating income lands at the low end of Disney's guidance. Rationale: Disney's own FY26 outlook proved accurate while the evidence-only defaults overshot by $1.1B, and the owner's view is that Disney is in a cautious phase with less compelling content than in past years. Margin sliders move in 0.1-point steps so the low end can be hit.

| Driver | v2 default | v3 default | Range / step | Evidence |
|---|---:|---:|---|---|
| SVOD Subscriber Growth | 8.0 | 5.0 | −5 to 20 / 0.5 | No subscriber counts disclosed; engagement growth internationally; free tier being explored |
| SVOD Revenue per Subscriber Growth | 2.0 | 4.0 | −2 to 10 / 0.5 | October 2026 price increase: bundle unchanged, ad-supported standalone +4%, ad-free premium +13% |
| Networks and vMVPD Revenue Growth (was Linear Networks Revenue Decline) | −12.0 | −5.0 | −20 to 10 / 0.5 | FY26 14,946 vs 14,247 includes Fubo from October 29, 2025; about −5% excluding Fubo; networks advertising 3,087 vs 3,259 |
| Entertainment Operating Margin | 12.5 | 14.8 | 10 to 20 / 0.1 | Restated FY26 14.7%; CFO expects segment margin to expand; set to the low end of high-single-digit guidance |
| ESPN Affiliate/Subscription Revenue Growth | 3.0 | 5.0 | −5 to 15 / 0.5 | FY26 12,798 vs 11,944 (+7.1%, about +5.5% without the 53rd week) |
| Sports Advertising Revenue Growth | 3.0 | 5.0 | −10 to 20 / 0.5 | FY26 4,768 vs 4,444 (+7.3%); ESPN advertising +20% in Q4; College Football Playoff grows from 11 to 23 games starting 2027 |
| Sports Rights & Programming Cost Growth | 7.0 | 7.0 | 0 to 15 / 0.5 | Cash content spend +9% to about $26B, driven by sports; $11.2B of sports programming commitments due in FY27 |
| Sports Operating Margin | 18.0 | 18.5 | 12 to 24 / 0.1 | Effective 17.4% after the cost adjustment; lowest 0.1 step at or above double-digit guidance |
| Parks Attendance Growth | 3.0 | 2.0 | −5 to 10 / 0.5 | FY26 global guests +4% ex-53rd; Q4 domestic +3% ex-53rd; Shanghai and Hong Kong pressure expected to continue into FY27 |
| Per Capita Guest Spending Growth | 5.0 | 4.0 | 0 to 10 / 0.5 | Q4 per capita +4% domestic, +5% international |
| Cruise Line Capacity Growth | 50.0 | 12.0 | 0 to 40 / 0.5 | First full year of Disney Destiny and Disney Adventure; next ship (Disney Believe) late 2027, mostly FY28; stateroom estimate |
| Experiences Operating Margin | 29.5 | 24.6 | 20 to 30 / 0.1 | Restated FY26 24.7% (Consumer Products moved out); set to the low end of high-single-digit guidance |

### Default-state results (FY27 vs FY26 excluding the 53rd week)

| Segment | FY27 operating income | Growth | Disney guidance |
|---|---:|---:|---|
| Entertainment | 7,598 | +7.0% | high single digits |
| Sports | 3,334 | +10.6% | double digits (high single digits reported) |
| Experiences | 9,333 | +7.1% | high single digits |
| **Total** | **20,265** | **+7.6%** | **approximately 8%** |

FY28 (no guidance; same drivers): Total Segment Operating Income 21,446 (+5.8%).

## 6. Chart, sensitivity and narrative (New Method tab)

- **Segment Revenue & Operating Income:** FY25 Actual, FY26 Actual (restated), FY27 Forecast, FY28 Forecast.
- **FY27 OI Sensitivity** (renamed from FY26): ±10% relative shift per driver on FY27 Total Segment Operating Income, sorted by swing.
- **Scenario Briefing:** rewritten for FY27 against Disney's FY27 guidance. Tone bands on FY27 Total Segment Operating Income growth (ex-53rd basis): aggressive ≥ 11%, in line 5% to 11%, conservative 0% to 5%, stress below 0%. Each briefing checks every segment against its guidance range, names the lead segment, and gives the FY28 path. An off-guidance note appears when growth is more than 4 points from 8% in the aggressive or stress bands.

## 7. Other changes

- About box: describes both methods; keeps the FY26 forecast-vs-actual note (Old Method); adds a New Method note, the Form 8-K restatement and FY27 guidance sources, and separate assumption lists per method.
- Page title and description, header badge per tab, README v3 section.
- A light rule separates each segment's revenue lines from its cost lines in the New Method table.
- Header wraps on phones (title on several lines, badge hidden below tablet width) so the action buttons stay visible; desktop unchanged.

## 8. Out of scope

- Quarterly modeling; FY27 quarterly guidance (Q1 about $5.4B) is cited in the narrative only.
- Forecasting individual cost lines, equity income, or below-the-line items beyond the bridge in section 4.
- Any change to the Old Method numbers.

## 9. Exit criteria

- [x] Two tabs; header title follows the tab; Old Method shows only the fixed table; New Method shows the driver rail, table, chart, sensitivity and briefing.
- [x] Old Method table identical to v2.1 at default state and unaffected by any slider.
- [x] New Method FY25 and FY26 columns match Disney's restated figures exactly; every segment in every column foots.
- [x] At defaults, FY27 lands at +7.0% / +10.6% / +7.1% / +7.6% and FY27 Total Segment Operating Income is $20,265M.
- [x] Sliders move only the FY27 and FY28 columns, chart bars, sensitivity and briefing.
- [x] No user-facing text claims FY26 is a live forecast or refers to the Prior column.
- [x] Type check and production build pass; rendered on desktop and phone widths.
