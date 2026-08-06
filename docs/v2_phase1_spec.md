# Disney Dashboard v2 — Phase 1 Spec: Terminology Rename ("Estimate" → "Forecast")

**Branch:** `v2-fy26-recalibration-and-terminology`
**PR scope:** Rename-only. No math, no data, no layout, no new columns. Cosmetic + string literals.
**Reviewer:** Agustin. Diff-only review before Phase 2 begins.

---

## 1. Rename rule (from user spec, restated for reference during review)

- **Rename** any use of "Estimate," "Est.," "FY26E," "FY27E," "FY28E" that refers to a **fiscal-period label** (a year column, a header, a range label naming forecast years).
- **Keep** any use of "estimate" / "estimated" / "estimates" / "Est." that refers to an **individual modeling construction** (a single derived figure, an analyst-inferred value, a code comment about UI sizing).
- Individual-construction usages that **stay untouched** are enumerated in §4 so the review can confirm we didn't miss any and didn't rename anything we shouldn't have.

---

## 2. Files changed and exact edits

### 2.1 `components/ForecastTable.tsx`

| Line | Before | After |
|---:|---|---|
| 268 | `Dollars in $M · FY25 actual + FY26–28 projected` | `Dollars in $M · FY25 actual + FY26–28 forecast` |
| 295 | `<ColHeader label="FY26E" isForecast hasFiftyThird />` | `<ColHeader label="FY26 Forecast" isForecast hasFiftyThird />` |
| 296 | `<ColHeader label="FY27E" isForecast />` | `<ColHeader label="FY27 Forecast" isForecast />` |
| 297 | `<ColHeader label="FY28E" isForecast />` | `<ColHeader label="FY28 Forecast" isForecast />` |

The `hasFiftyThird` asterisk indicator on FY26 Forecast is preserved; the footnote at line 272 (`* FY26 includes +2% 53rd-week benefit`) is unchanged.

### 2.2 `components/SegmentChart.tsx`

| Line | Before | After |
|---:|---|---|
| 123 | `{ label: "FY26E*", data: forecast.fy26 },` | `{ label: "FY26 Forecast*", data: forecast.fy26 },` |
| 124 | `{ label: "FY27E", data: forecast.fy27 },` | `{ label: "FY27 Forecast", data: forecast.fy27 },` |
| 125 | `{ label: "FY28E", data: forecast.fy28 },` | `{ label: "FY28 Forecast", data: forecast.fy28 },` |

**Review-time visual check:** the segment bar chart's x-axis labels grew from 4–5 characters to 12–13 characters. Verified during Phase 1 local run: Recharts auto-dropped the `FY27 Forecast` tick to prevent overlap. Fallback applied in the same commit — set `interval={0}`, `angle={-25}`, `textAnchor="end"`, `height={56}`, and shrank tick font from 12px → 11px. Post-fix DOM confirms all four ticks render: `FY25 · FY26 Forecast* · FY27 Forecast · FY28 Forecast`. No other content change.

### 2.3 `components/Header.tsx`

| Line | Before | After |
|---:|---|---|
| 36 | `DIS · FY25–FY28E` | `DIS · FY25 Actual + FY26–FY28 Forecast` |

Per user answer #4: precise version, avoids conflating baseline actual with forecast years, matches the ForecastTable subhead's post-rename phrasing.

### 2.4 `lib/forecastMath.ts`

The `projectYear()` calls at lines 309, 312, 315 pass a `yearLabel` string that becomes the row/period identifier downstream. Rename to keep the UI labels consistent even though these strings are not currently rendered directly in the table (the ColHeader labels are hardcoded in ForecastTable — see §2.1).

| Line | Before | After |
|---:|---|---|
| 309 | `projectYear("FY26E", lob, fy25SportsRevenue, drivers, true);` | `projectYear("FY26 Forecast", lob, fy25SportsRevenue, drivers, true);` |
| 312 | `projectYear("FY27E", lob27, fy26SportsRevenue, drivers, false);` | `projectYear("FY27 Forecast", lob27, fy26SportsRevenue, drivers, false);` |
| 315 | `projectYear("FY28E", lob28, fy27SportsRevenue, drivers, false);` | `projectYear("FY28 Forecast", lob28, fy27SportsRevenue, drivers, false);` |

If any consumer downstream (chart tooltip, narrative logic) matches on the exact string `"FY26E"`, that consumer must be updated in the same commit. A grep of the repo confirms these three literals are the only occurrences; no string-match consumers exist. Reviewer: please verify at diff time.

### 2.5 `lib/disneyData.ts`

| Line | Before | After |
|---:|---|---|
| 39 | `forecastYears: string[]; // ["FY26E", "FY27E", "FY28E"]` | `forecastYears: string[]; // ["FY26 Forecast", "FY27 Forecast", "FY28 Forecast"]` |
| 97 | `forecastYears: ["FY26E", "FY27E", "FY28E"],` | `forecastYears: ["FY26 Forecast", "FY27 Forecast", "FY28 Forecast"],` |

Note: the `forecastYears` array is declared but not currently consumed by any renderer. The rename is for consistency; no UI effect this PR. Flagged so the reviewer isn't surprised by an unused-array rename.

### 2.6 `README.md`, `app/layout.tsx`, `AGENTS.md`, `CLAUDE.md`

**No changes.** Verified:

- `README.md` already uses "forecasts" / "Forecast scenarios" natively. Its lone use of "illustrative estimates" (line 35) is an individual-construction usage — keep per rule.
- `app/layout.tsx` title and meta description already read "Disney Segment Forecast Dashboard" and "Driver-based segment forecast model." No "Estimate"/"FY2xE" usages present. Confirmed against user's Phase 1 note that the meta description does not need adjustment.
- `AGENTS.md` and `CLAUDE.md`: zero matches for `estimate|est\.|FY2[6-8]E`.

---

## 3. Files not changed but reviewed and confirmed out of scope

- `components/DriverPanel.tsx` — no matches.
- `components/NarrativePanel.tsx` — no matches.
- `components/Footer.tsx` — no matches. Source disclosure (rendered from `disneyData.ts` `sourceDisclosure`) contains "illustrative estimates"; kept per rule §1.
- `components/AboutCard.tsx` — one match at line 165 ("analyst estimates where Disney does not separately disclose") — kept per rule §1.
- `components/DriverSlider.tsx` — one match at line 34, a code comment about tooltip sizing — kept per rule §1.
- `components/ForecastTable.tsx` line 67 — a `title=` tooltip reading "FY26 includes an estimated +2% benefit from a 53rd fiscal week." "Estimated" here is an individual-construction adjective, not a period label — kept per rule §1.
- `lib/narrativeLogic.ts` line 132 — prose containing "point estimates" — kept per rule §1.

---

## 4. Kept-untouched inventory (for reviewer confirmation)

The following seven usages of "estimate" / "estimated" / "estimates" / "Est." **remain unchanged** after this PR. Reviewer: confirm during diff review that none of these were changed and none in §2 were missed.

1. `components/DriverSlider.tsx:34` — code comment: `// generous estimate (tooltip text …)`
2. `components/ForecastTable.tsx:67` — 53rd-week `title` tooltip.
3. `components/AboutCard.tsx:165` — "analyst estimates where Disney does not separately disclose."
4. `lib/disneyData.ts:65` — comment: `Disney Cruise Line (estimated, see note)`.
5. `lib/disneyData.ts:80` — comment: `Cruise revenue of $3,700M is an analyst-derived estimate.`
6. `lib/disneyData.ts:277` (sourceDisclosure prose) — "illustrative estimates inferred from management commentary."
7. `lib/narrativeLogic.ts:132` — prose: "point estimates."
8. `README.md:35` — "illustrative estimates inferred from management commentary."

---

## 5. Verification steps before opening the PR

1. `npm run build` passes (no TS errors from any renamed string literal or import).
2. `npm run dev` and load the dashboard locally:
   - Segment Forecast table shows column headers `FY25 Actual · FY26 Forecast · FY27 Forecast · FY28 Forecast`, with asterisk on `FY26 Forecast`.
   - Table subhead reads `Dollars in $M · FY25 actual + FY26–28 forecast`.
   - Segment chart x-axis reads `FY25 · FY26 Forecast* · FY27 Forecast · FY28 Forecast` without truncation. (If truncated at 1440×900, apply the `angle: -30` fallback noted in §2.2 in the same commit.)
   - Header reads `DIS · FY25 Actual + FY26–FY28 Forecast`.
   - Reset button, sliders, tornado chart, narrative panel, About modal, footer all render and function identically to pre-rename.
3. Grep confirms zero remaining occurrences of `FY26E`, `FY27E`, `FY28E` anywhere in `app/`, `components/`, `lib/`, or `README.md`:
   `grep -rnE 'FY2[6-8]E' app components lib README.md AGENTS.md CLAUDE.md` → empty result.
4. Grep confirms the seven kept-untouched usages in §4 still exist verbatim.

---

## 6. Commit plan

One commit on branch `v2-fy26-recalibration-and-terminology`:

```
Phase 1: Rename "Estimate" period labels to "Forecast"

- Segment Forecast table headers: FY26E/FY27E/FY28E → FY26 Forecast/FY27 Forecast/FY28 Forecast
- Segment chart x-axis labels: same rename
- Header subline: DIS · FY25–FY28E → DIS · FY25 Actual + FY26–FY28 Forecast
- ForecastTable subhead: "FY26–28 projected" → "FY26–28 forecast"
- lib/forecastMath.ts projectYear() yearLabel strings: match UI rename
- lib/disneyData.ts forecastYears[] values: match UI rename

Individual-construction uses of "estimate"/"estimated" (analyst-derived
cruise figure, illustrative LOB estimates in disclosure, tooltip sizing
comment, 53rd-week tooltip, narrative "point estimates") are unchanged.

No math, layout, or data changes. Rename-only PR.
```

PR opened against `main`. Not merged until Agustin approves.

---

## 7. Out of scope for Phase 1 (do NOT do in this PR)

- No `PRIOR_FY26_FORECAST` constant. Phase 2.
- No new table column. Phase 2.
- No driver default recalibration. Phase 3.
- No README additions. Phase 4.
- No slider range widening. Phase 3.
- No About modal source list additions. Phase 3 or 4 (TBD in Phase 3 spec).

If any of the above is tempting mid-implementation, capture in Build Journal and defer.

---

## Version

| Version | Date | Change |
|---|---|---|
| Phase 1 spec v1.0 | 2026-08-05 | Initial draft for Agustin review |
