// lib/tableModel.ts
// ─────────────────────────────────────────────────────────────────────────────
// Builds every figure shown in the two Segment Forecast tables. Pure functions,
// no UI.
//
// Old Method (spec: docs/v2_1_spec.md, fixed in docs/v3_spec.md section 3):
//   FY25 Actual, FY26 Actual (as originally reported) and the final FY26
//   forecast from FINAL_FY26_FORECAST. Nothing here reads the sliders.
//
// New Method (spec: docs/v3_spec.md section 4):
//   FY25 and FY26 as restated by Disney, plus FY27 and FY28 from the engine.
//   Forecast revenue lines are rounded and Revenues is their sum; operating
//   income is rounded; Costs and Expenses = Revenues − operating income +
//   equity income, split across cost lines by FY26 shares; totals are sums of
//   displayed figures; net income comes from the below-the-line bridge.
// ─────────────────────────────────────────────────────────────────────────────

import {
  DISNEY_CONFIG,
  DriverValues,
  FINAL_FY26_FORECAST,
  NEW_METHOD,
  RestatedYear,
  SegmentKey,
} from "./disneyData";
import { computeNewForecast, SegmentYear } from "./forecastMath";

export const SEGMENT_KEYS: SegmentKey[] = ["entertainment", "sports", "experiences"];

export interface SegmentColumn {
  revenue: number; // $M
  revenueLines: number[]; // $M — New Method only (empty in the Old Method)
  costLines: number[]; // $M — same order as the segment's cost line labels
  costsAndExpenses: number; // $M — sum of costLines
  equityIncome: number; // $M
  operatingIncome: number; // $M
  operatingMargin: number; // percent, e.g. 11.7
}

export interface TableColumn {
  entertainment: SegmentColumn;
  sports: SegmentColumn;
  experiences: SegmentColumn;
  totalSegmentOI: number; // $M
  belowTheLine: number; // $M — signed (negative for deduction)
  netIncome: number; // $M
}

export interface OldTableModel {
  fy25Actual: TableColumn;
  fy26Actual: TableColumn;
  fy26Forecast: TableColumn;
}

export interface NewTableModel {
  fy25Actual: TableColumn;
  fy26Actual: TableColumn;
  fy27Forecast: TableColumn;
  fy28Forecast: TableColumn;
  // FY26 excluding the 53rd week — the basis of Disney's FY27 guidance and of
  // the FY27 growth badges.
  fy26Base: Record<SegmentKey, { revenue: number; operatingIncome: number }> & { totalSegmentOI: number };
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

/**
 * Split an integer total across lines in proportion to weights, rounding by
 * largest remainder so the parts add back to the total exactly.
 */
export function splitByShares(total: number, weights: number[]): number[] {
  const weightTotal = sum(weights);
  const raw = weights.map((w) => (total * w) / weightTotal);
  const parts = raw.map(Math.floor);
  let remainder = total - sum(parts);
  raw
    .map((value, i) => ({ i, fraction: value - parts[i] }))
    .sort((a, b) => b.fraction - a.fraction)
    .forEach(({ i }) => {
      if (remainder > 0) {
        parts[i] += 1;
        remainder -= 1;
      }
    });
  return parts;
}

function marginPct(operatingIncome: number, revenue: number): number {
  return Math.round((operatingIncome / revenue) * 1000) / 10;
}

function column(
  segs: Record<SegmentKey, SegmentColumn>,
  belowTheLine: number
): TableColumn {
  const totalSegmentOI = sum(SEGMENT_KEYS.map((k) => segs[k].operatingIncome));
  return { ...segs, totalSegmentOI, belowTheLine, netIncome: totalSegmentOI + belowTheLine };
}

function bySegment(build: (key: SegmentKey) => SegmentColumn): Record<SegmentKey, SegmentColumn> {
  return Object.fromEntries(SEGMENT_KEYS.map((k) => [k, build(k)])) as Record<SegmentKey, SegmentColumn>;
}

// ── Old Method ───────────────────────────────────────────────────────────────

function oldSegmentConfig(key: SegmentKey) {
  return DISNEY_CONFIG.segments.find((s) => s.key === key)!;
}

function actualColumn(revenue: number, operatingIncome: number, costLines: number[], equityIncome: number): SegmentColumn {
  return {
    revenue,
    revenueLines: [],
    costLines: [...costLines],
    costsAndExpenses: sum(costLines),
    equityIncome,
    operatingIncome,
    operatingMargin: marginPct(operatingIncome, revenue),
  };
}

export function buildOldTableModel(): OldTableModel {
  const fy25Actual = column(
    bySegment((k) => {
      const s = oldSegmentConfig(k);
      return actualColumn(s.fy25Revenue, s.fy25OperatingIncome, s.fy25CostLines, s.fy25EquityIncome);
    }),
    DISNEY_CONFIG.belowTheLineAdjustment
  );
  const fy26Actual = column(
    bySegment((k) => {
      const a = oldSegmentConfig(k).fy26Actual;
      return actualColumn(a.revenue, a.operatingIncome, a.costLines, a.equityIncome);
    }),
    DISNEY_CONFIG.fy26ActualBelowTheLine
  );
  const fy26Forecast = column(
    bySegment((k) => {
      const f = FINAL_FY26_FORECAST[k];
      return {
        revenue: f.revenue,
        revenueLines: [],
        costLines: [...f.costLines],
        costsAndExpenses: sum(f.costLines),
        equityIncome: f.equityIncome,
        operatingIncome: f.operatingIncome,
        operatingMargin: f.operatingMargin,
      };
    }),
    FINAL_FY26_FORECAST.belowTheLine
  );
  return { fy25Actual, fy26Actual, fy26Forecast };
}

// ── New Method ───────────────────────────────────────────────────────────────

function restatedColumn(year: RestatedYear): SegmentColumn {
  const revenue = sum(year.revenueLines);
  return {
    revenue,
    revenueLines: [...year.revenueLines],
    costLines: [...year.costLines],
    costsAndExpenses: sum(year.costLines),
    equityIncome: year.equityIncome,
    operatingIncome: year.operatingIncome,
    operatingMargin: marginPct(year.operatingIncome, revenue),
  };
}

function forecastColumn(key: SegmentKey, engine: SegmentYear): SegmentColumn {
  const seg = NEW_METHOD.segments[key];
  const revenueLines = engine.revenueLines.map(Math.round);
  const revenue = sum(revenueLines);
  const operatingIncome = Math.round(engine.operatingIncome);
  const equityIncome = seg.fy26.equityIncome;
  const costsAndExpenses = revenue - operatingIncome + equityIncome;
  return {
    revenue,
    revenueLines,
    costLines: splitByShares(costsAndExpenses, seg.fy26.costLines),
    costsAndExpenses,
    equityIncome,
    operatingIncome,
    operatingMargin: marginPct(operatingIncome, revenue),
  };
}

/** Below-the-line bridge from Total Segment OI to net income attributable to Disney. */
export function forecastNetIncome(totalSegmentOI: number): number {
  const b = NEW_METHOD.belowTheLine;
  const preTax =
    totalSegmentOI -
    b.corporateAndUnallocated -
    b.acquisitionAmortization -
    b.netInterest -
    b.indiaJointVentureLoss -
    b.restructuring;
  const tax = Math.round((preTax * b.taxRatePct) / 100);
  return preTax - tax - b.noncontrollingInterests;
}

function forecastTableColumn(year: { entertainment: SegmentYear; sports: SegmentYear; experiences: SegmentYear }): TableColumn {
  const segs = bySegment((k) => forecastColumn(k, year[k]));
  const totalSegmentOI = sum(SEGMENT_KEYS.map((k) => segs[k].operatingIncome));
  const netIncome = forecastNetIncome(totalSegmentOI);
  return { ...segs, totalSegmentOI, belowTheLine: netIncome - totalSegmentOI, netIncome };
}

export function buildNewTableModel(drivers: DriverValues): NewTableModel {
  const segs = NEW_METHOD.segments;
  const fy25Segs = bySegment((k) => restatedColumn(segs[k].fy25));
  const fy26Segs = bySegment((k) => restatedColumn(segs[k].fy26));
  const fy25Total = sum(SEGMENT_KEYS.map((k) => fy25Segs[k].operatingIncome));
  const fy26Total = sum(SEGMENT_KEYS.map((k) => fy26Segs[k].operatingIncome));

  const forecast = computeNewForecast(drivers);
  const base = forecast.fy26Base;

  return {
    fy25Actual: column(fy25Segs, NEW_METHOD.fy25NetIncome - fy25Total),
    fy26Actual: column(fy26Segs, NEW_METHOD.fy26NetIncome - fy26Total),
    fy27Forecast: forecastTableColumn(forecast.fy27),
    fy28Forecast: forecastTableColumn(forecast.fy28),
    fy26Base: {
      entertainment: { revenue: base.entertainment.revenue, operatingIncome: base.entertainment.operatingIncome },
      sports: { revenue: base.sports.revenue, operatingIncome: base.sports.operatingIncome },
      experiences: { revenue: base.experiences.revenue, operatingIncome: base.experiences.operatingIncome },
      totalSegmentOI: base.totalSegmentOI,
    },
  };
}
