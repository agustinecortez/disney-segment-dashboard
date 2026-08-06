# Disney Dashboard v2 — Phase 2 Spec: Frozen "Prior FY26 Forecast" Column

**Branch:** `v2-fy26-recalibration-and-terminology` (continues from Phase 1)
**PR scope:** Add a hardcoded `PRIOR_FY26_FORECAST` constant in the data layer and a new column in the Segment Forecast table sourced from that constant. No math changes, no driver changes, no defaults changed.
**Reviewer:** Agustin. Diff-only review before Phase 3 begins.
**Prerequisite:** Phase 1 PR (`v2 Phase 1: Rename "Estimate" period labels to "Forecast"`) merged.

---

## 1. What Phase 2 is (and what it is not)

**Is:**
- A frozen snapshot of v1's shipped FY26 forecast, encoded as a `const` in `lib/disneyData.ts`.
- One new column in the Segment Forecast table, placed between `FY25 Actual` and `FY26 Forecast`, sourced from that constant.
- A tooltip on the new column header explaining what it is.

**Is not:**
- Any change to `forecastMath.ts` (no new math, no new derivation).
- Any change to driver defaults (Phase 3).
- Any change to slider ranges (Phase 3).
- Any change to the segment bar chart, the tornado chart, the narrative panel, the About modal, the footer, or the README (Phases 3 and 4).
- A delta chip between Prior FY26 Forecast and FY26 Forecast columns. Comparison is visual only. Same restraint as NBCU v2.0.
- A metric-card sub-row addition — Disney's dashboard has no metric cards (the table is the sole aggregate display). Skipped per user spec's conditional.

---

## 2. The frozen constant

### 2.1 Values (verified from live code at Reset state, 2026-08-05)

All values below were captured from the live app at the current v1 defaults during Phase 1 verification and match Agustin's quoted values exactly.

| Segment | Revenue ($M) | Operating Income ($M) | Operating Margin | YoY OI vs FY25 |
|---|---:|---:|---:|---:|
| Entertainment | 45,153 | 5,193 | 11.5% | +11.1% |
| Sports | 18,621 | 2,970 | 16.0% | +3.1% |
| Experiences | 39,290 | 10,844 | 27.6% | +8.5% |
| **Total Segment OI** | — | **19,007** | — | **+8.3%** |
| Corporate, eliminations & below-the-line | — | (5,147) | — | — |
| **Net Income to Shareholders (proxy)** | — | **13,860** | — | **+11.7%** |

The Sports Operating Margin cell will display `16.0%` even though the underlying `sportsMargin` slider default is `16.3%` — this is the effective FY26 margin after Decision 17's cost-vs-revenue differential adjustment through `sportsRightsCostGrowth` at +4%. Phase 3 will document this in the driver tooltip when the base slider default is raised to offset the Sports Rights & Programming Cost Growth recalibration.

### 2.2 Location: `lib/disneyData.ts`

The constant lives alongside the existing swappable Disney config. When a future engagement swaps to a different sample company, the entire "prior forecast" block goes with it. Portability preserved.

### 2.3 Shape and TypeScript type

Reuse the existing `SegmentForecast` shape so the ForecastTable's existing cell components can consume the constant without a new render path. Add one new interface for the top-level container:

```typescript
// lib/disneyData.ts (added below existing DISNEY_CONFIG export)

/**
 * Frozen snapshot of v1.0's shipped FY26 forecast at v1 driver defaults.
 * Captured from the live Vercel deployment on 2026-08-05 for retrospective
 * comparison against v2's recalibrated FY26 forecast. These values are
 * constants — never recomputed and never affected by slider movement.
 *
 * Source: live dashboard at Reset state (v1 defaults), verified during
 * Phase 1 local run. Sports operating margin of 16.0% reflects the
 * effective margin after Decision 17's cost/revenue differential; the
 * underlying sportsMargin slider default at v1 was 16.3%.
 */
export interface PriorSegmentForecast {
  revenue: number;          // $M
  operatingIncome: number;  // $M
  operatingMargin: number;  // percent, e.g. 11.5
}

export interface PriorFY26Forecast {
  entertainment: PriorSegmentForecast;
  sports: PriorSegmentForecast;
  experiences: PriorSegmentForecast;
  totalSegmentOI: number;   // $M
  belowTheLine: number;     // $M — signed (negative for expense/deduction)
  netIncomeProxy: number;   // $M
  shippedOn: string;        // ISO date of v1.0 tag on GitHub
  capturedFrom: string;     // provenance note
}

export const PRIOR_FY26_FORECAST: PriorFY26Forecast = {
  entertainment: { revenue: 45_153, operatingIncome: 5_193, operatingMargin: 11.5 },
  sports:        { revenue: 18_621, operatingIncome: 2_970, operatingMargin: 16.0 },
  experiences:   { revenue: 39_290, operatingIncome: 10_844, operatingMargin: 27.6 },
  totalSegmentOI: 19_007,
  belowTheLine:  -5_147,
  netIncomeProxy: 13_860,
  shippedOn:     "2026-05-31",
  capturedFrom:  "Live Vercel deployment at Reset state, 2026-08-05",
};
```

The `shippedOn` and `capturedFrom` fields are metadata only — never rendered — and exist so the provenance stays in the source tree instead of only in git history.

---

## 3. Table changes: `components/ForecastTable.tsx`

### 3.1 Column layout — before and after

**Before Phase 2:**

| Line Item | FY25 Actual | FY26 Forecast * | FY27 Forecast | FY28 Forecast |

**After Phase 2:**

| Line Item | FY25 Actual | Prior FY26 Forecast | FY26 Forecast * | FY27 Forecast | FY28 Forecast |

Column count grows from 5 → 6. `colSpan` on segment sub-header rows (currently `colSpan={5}`) becomes `colSpan={6}`. The Corporate row currently uses `[fy25Actual, fy26, fy27, fy28].map(...)` — needs to become `[fy25Actual, prior, fy26, fy27, fy28].map(...)` and the `i === 1` tint condition (which currently tints FY26) shifts to `i === 2`.

### 3.2 Visual treatment of the new column

The Prior column must read as **frozen historical forecast**, distinct from both the live actuals column (FY25 Actual) and the live forecast columns (FY26/27/28 Forecast). Proposed styling:

- **Header background:** `var(--color-primary)` at 65% opacity (a desaturated navy), so it visually belongs to the "past" side of the table alongside FY25 Actual, rather than the "live" side alongside the accent-gold forecast columns.
- **Header text color:** `#ffffff` (matches FY25 Actual for consistency).
- **Header tooltip (`title=` attribute):** `v1.0 forecast as shipped May 31, 2026, frozen for comparison. See README for context.`
- **Cell background:** none (no accent tint — the tint is reserved for live forecast columns).
- **Cell text color:** `var(--color-text-secondary)` (same muted tone as `ActualCell`, so the column reads as historical/frozen).
- **Font weight:** same as other cells (regular for line items, bold for Total Segment OI and Net Income rows).
- **YoY chip:** **YES**, shown below dollar values, computed against FY25 Actual — same rule as the FY26 Forecast column. Rationale: putting `+11.1%` (Prior) directly next to `+11.1%` (FY26 Forecast) — or a differing figure — is the single most useful visual signal in this whole PR, because it lets the viewer instantly see whether v2's recalibration moved the growth rate.
- **53rd-week asterisk:** **NO**. The v1 shipped forecast already includes the +2% benefit in its numbers, but the asterisk stays on FY26 Forecast to keep the footnote unambiguous. Document this decision in the header tooltip if space allows, otherwise leave it silent — the README will cover it.

### 3.3 New cell component: `PriorCell`

Add a dedicated cell renderer parallel to `ActualCell` and `ForecastCell`. Simpler than trying to overload `ActualCell` with an optional YoY prop.

```typescript
function PriorCell({
  value,
  fy25Prior,
  formatter,
  bold,
  topBorder,
  showYoY,
}: {
  value: number;
  fy25Prior: number;
  formatter: (v: number) => string;
  bold?: boolean;
  topBorder?: boolean;
  showYoY?: boolean;
}) {
  return (
    <td
      className="px-3 py-2 text-right tabular-nums"
      style={{
        fontSize: 13,
        fontWeight: bold ? 600 : 400,
        color: "var(--color-text-secondary)",
        borderTop: topBorder ? "2px solid var(--color-border-strong)" : undefined,
      }}
    >
      <div>{formatter(value)}</div>
      {showYoY && (
        <div className="mt-0.5">
          <YoYBadge current={value} prior={fy25Prior} />
        </div>
      )}
    </td>
  );
}
```

### 3.4 New column-header variant

Extend `ColHeader` with an optional `variant: "actual" | "prior" | "forecast"` prop (or add a new `PriorColHeader` component — reviewer's call). Recommendation: extend `ColHeader` with a `variant` prop rather than duplicate. New signature:

```typescript
function ColHeader({
  label,
  variant,
  hasFiftyThird,
  tooltip,
}: {
  label: string;
  variant: "actual" | "prior" | "forecast";
  hasFiftyThird?: boolean;
  tooltip?: string;
}) { ... }
```

Backwards compatibility: replace all existing `isForecast={false}` calls with `variant="actual"` and `isForecast` (or `isForecast={true}`) with `variant="forecast"`. The single new call uses `variant="prior"` with the tooltip prop. Six ColHeader usages total after Phase 2 (Line Item is its own `<th>`, not a ColHeader).

### 3.5 `SegmentRows` prop shape

Add one prop:

```typescript
function SegmentRows({
  label, color,
  actual, fy26, fy27, fy28, fy25Actual,
  prior,   // ← new
}: {
  ...existing...
  prior: PriorSegmentForecast;
}) { ... }
```

The three data rows (Revenue, Operating Income, Operating Margin) each get one new `<PriorCell>` inserted between `<ActualCell>` and the FY26 `<ForecastCell>`. For the Operating Margin row, `showYoY` stays off (matches existing behavior).

### 3.6 Total Segment OI and Net Income proxy rows

Same pattern — insert one `<PriorCell>` in the correct column position, with `bold`, `topBorder`, and `showYoY` all `true`. The Prior column pulls `PRIOR_FY26_FORECAST.totalSegmentOI` and `PRIOR_FY26_FORECAST.netIncomeProxy` respectively.

### 3.7 Corporate row

The Corporate row's inline `.map()` becomes:

```typescript
{[fy25Actual, PRIOR_FY26_FORECAST, fy26, fy27, fy28].map((yr, i) => (
  <td key={i} … style={{
    ...
    backgroundColor: i === 2 ? "var(--color-accent-subtle)" : undefined,
  }}>
    ({Math.abs(yr.belowTheLine).toLocaleString("en-US")})
  </td>
))}
```

Note: `PRIOR_FY26_FORECAST.belowTheLine` is `-5147`, mirroring the derived output. This displays `(5,147)` in the Prior column, identical to every other year. Kept for consistency; also serves as a visual signal that v2's `belowTheLineAdjustment` didn't move.

---

## 4. Reset behavior

**No code change required in Phase 2.** The Reset button calls `getDefaultDriverValues()` which reads from `DISNEY_CONFIG.segments[…].drivers[…].defaultValue`. Phase 2 does not modify any driver default, so Reset behavior in Phase 2 = Reset behavior in Phase 1 (both target v1 defaults). When Phase 3 recalibrates the driver defaults in `disneyData.ts`, Reset will automatically start targeting the v2 recalibrated set with zero code change here.

The Prior FY26 Forecast column persists across every Reset state because it is a `const`, not derived from `drivers` — no `useMemo` dependency, no re-render invalidation. Confirmed by inspection: `computeFullForecast(drivers)` is the sole `drivers`-consumer in the table, and `PRIOR_FY26_FORECAST` is passed in as a static import.

---

## 5. Files changed in Phase 2

| File | Change |
|---|---|
| `lib/disneyData.ts` | Add `PriorSegmentForecast` interface, `PriorFY26Forecast` interface, `PRIOR_FY26_FORECAST` const |
| `components/ForecastTable.tsx` | Add `PriorCell`, extend `ColHeader` with `variant` prop, insert 1 new column in header, update 3 segments × 3 rows + 2 subtotal rows + Corporate map, update `colSpan={5}` → `colSpan={6}` on segment sub-headers, update `SegmentRows` prop shape |

Two files, one commit.

---

## 6. Files NOT changed in Phase 2 (for reviewer confirmation)

- `components/SegmentChart.tsx` — chart continues to show `FY25 · FY26 Forecast* · FY27 Forecast · FY28 Forecast`. No Prior overlay. If you want it later, that's a v2.1 discussion.
- `components/TornadoChart.tsx` — still ±10% sensitivity against the live FY26 Total Segment OI. Prior is not the sensitivity baseline.
- `components/NarrativePanel.tsx` — narrative continues to describe the live scenario. Not comparing to Prior. If you want that later, v2.1.
- `components/AboutCard.tsx` — no changes. Data sources list is updated in Phase 3 or 4 alongside the Q1–Q3 FY26 filings.
- `components/Footer.tsx` — no changes.
- `components/Header.tsx` — no changes.
- `components/DriverPanel.tsx`, `components/DriverSlider.tsx` — no changes.
- `lib/forecastMath.ts` — no changes. `PRIOR_FY26_FORECAST` is a constant, not a computation.
- `lib/narrativeLogic.ts` — no changes.
- `README.md` — no changes. README addition is Phase 4.

---

## 7. Verification steps before opening the PR

1. `npm run build` clean.
2. `npm run dev` and load the dashboard:
   - Segment Forecast table shows 6 columns: `Line Item · FY25 Actual · Prior FY26 Forecast · FY26 Forecast* · FY27 Forecast · FY28 Forecast`.
   - At default (Reset) state, `Prior FY26 Forecast` column shows Entertainment 45,153 / 5,193 / 11.5%, Sports 18,621 / 2,970 / 16.0%, Experiences 39,290 / 10,844 / 27.6%, Total Segment OI 19,007, Net Income proxy 13,860, Corporate (5,147). Every value matches §2.1 exactly.
   - At default state, `Prior FY26 Forecast` and `FY26 Forecast` columns are **identical** — the recalibration hasn't happened yet, so Phase 2 alone should show two identical FY26 columns. This is the correct pre-Phase-3 behavior and validates that the constant renders correctly. Screenshot for the PR.
   - Move any slider. The `FY26 Forecast` column changes; the `Prior FY26 Forecast` column does not. Screenshot for the PR.
   - Hover the `Prior FY26 Forecast` column header. Native `title=` tooltip appears with the shipped-date text.
   - Reset. Prior column unchanged; FY26 Forecast column returns to default values (which equal Prior values because Phase 3 hasn't landed yet).
3. Segment sub-header rows visually span the full table width (no missing cells from a wrong `colSpan`).
4. The Corporate row's `(5,147)` accent tint sits under the `FY26 Forecast` column, not the `Prior FY26 Forecast` column. If tint appears in the wrong column, the `i === 2` index in §3.7 was applied wrong.
5. Segment bar chart, tornado chart, narrative panel, About modal, footer, all sliders continue to work as they did in Phase 1.

---

## 8. Commit plan

Single commit on the same `v2-fy26-recalibration-and-terminology` branch (already open from Phase 1's merge; new commit appended after Phase 1 merges to `main` and this branch is rebased or re-forked).

**If Phase 1 has merged before Phase 2 starts:** create a fresh branch from the updated `main`. Recommended branch name for Phase 2 PR: `v2-fy26-recalibration-and-terminology` still works — GitHub will treat it as a new PR against `main` — but for clarity, use `v2-phase2-prior-fy26-column`.

Commit message:

```
Phase 2: Add frozen "Prior FY26 Forecast" column

- lib/disneyData.ts: Add PRIOR_FY26_FORECAST constant capturing v1.0's
  shipped FY26 forecast at v1 driver defaults (Entertainment 45,153/5,193/
  11.5%, Sports 18,621/2,970/16.0%, Experiences 39,290/10,844/27.6%,
  Total Segment OI 19,007, Net Income proxy 13,860). Values verified
  against live Vercel deployment at Reset state on 2026-08-05.

- components/ForecastTable.tsx: Insert new "Prior FY26 Forecast" column
  between FY25 Actual and FY26 Forecast. New PriorCell renderer, extended
  ColHeader with variant prop, colSpan bumps 5 -> 6 on segment sub-header
  rows, Corporate row tint index shifts from i===1 to i===2.

Column reads visually as historical/frozen (muted secondary text, no
accent tint, desaturated navy header). YoY chip vs FY25 Actual retained
so viewers can compare Prior growth rate directly with the live FY26
Forecast growth rate. Column header tooltip explains the frozen scope
and points to README.

No math changes. No driver default changes. Prior column persists across
Reset because it is a const, not derived from drivers. At default state
Prior and FY26 Forecast columns are identical (expected pre-Phase-3
behavior — the columns will diverge in Phase 3 when v2 driver defaults
recalibrate).
```

PR opened against `main`. Not merged until Agustin approves.

---

## 9. Open questions for reviewer before I implement

1. **Header background tone.** §3.2 proposes desaturated navy (65% opacity) for the Prior header. Alternative: use `var(--color-text-tertiary)` as a solid slate grey, which reads more clearly as "neither actual navy nor forecast gold." Both work. Preference?
2. **`ColHeader` extension vs. new `PriorColHeader` component.** §3.4 recommends extending with a `variant` prop and updating all six call sites. Cleaner long-term but touches every existing header call. Alternative: leave `ColHeader` as-is and add a standalone `PriorColHeader` that's used only once. Preference?
3. **Header tooltip mechanism.** §3.2 uses native `title=` (matches the 53rd-week asterisk pattern). Alternative: reuse the DriverSlider's portal-based tooltip for a richer hover UX. Native `title=` is the lower-lift choice and consistent with existing header behavior. Preference?

If no strong preferences, I'll take the recommended path in each case (desaturated navy header, extend `ColHeader`, native `title=`) and note the choice in the PR description.

---

## 10. Out of scope for Phase 2 (do NOT do in this PR)

- No driver default recalibration. Phase 3.
- No slider range widening. Phase 3.
- No sportsMargin default derivation. Phase 3.
- No new evidence citations in driver tooltips. Phase 3.
- No About modal source list update. Phase 3.
- No README section on "What Q1–Q3 FY26 actuals taught us." Phase 4.
- No segment-chart or tornado-chart Prior overlay. Deferred v2.1.
- No narrative Prior-comparison logic. Deferred v2.1.
- No metric-card Prior sub-row (no metric cards exist).

---

## Version

| Version | Date | Change |
|---|---|---|
| Phase 2 spec v1.0 | 2026-08-05 | Initial draft for Agustin review |
