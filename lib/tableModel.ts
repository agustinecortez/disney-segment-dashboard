// lib/tableModel.ts
// ─────────────────────────────────────────────────────────────────────────────
// Builds every figure shown in the Segment Forecast table: FY25 Actual,
// FY26 Actual, and the live FY26 Forecast. Pure functions, no UI.
//
// Display rules (spec: docs/v2_1_spec.md, section 2):
//   - Actual columns are Disney's reported figures. Revenues − Costs and
//     Expenses + Equity income = segment operating income, exactly.
//   - Forecast revenues and operating income are rounded to $1M for display.
//     Equity income is held at the FY25 level. Costs and Expenses is derived
//     so each segment foots exactly, then split across Disney's cost lines
//     using FY25 shares (a presentational split, not a line-level forecast).
//   - Forecast Total Segment OI is the sum of the displayed segment figures,
//     so the column foots; net income is that total plus below-the-line.
// ─────────────────────────────────────────────────────────────────────────────

import { DISNEY_CONFIG, DriverValues, SegmentKey } from "./disneyData";
import { computeFullForecast } from "./forecastMath";

export const SEGMENT_KEYS: SegmentKey[] = ["entertainment", "sports", "experiences"];

export interface SegmentColumn {
  revenue: number; // $M
  costLines: number[]; // $M — same order as the segment's costLineLabels
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

export interface TableModel {
  fy25Actual: TableColumn;
  fy26Actual: TableColumn;
  fy26Forecast: TableColumn;
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

function actualSegment(
  revenue: number,
  operatingIncome: number,
  costLines: number[],
  equityIncome: number
): SegmentColumn {
  return {
    revenue,
    costLines: [...costLines],
    costsAndExpenses: sum(costLines),
    equityIncome,
    operatingIncome,
    operatingMargin: marginPct(operatingIncome, revenue),
  };
}

function segmentConfig(key: SegmentKey) {
  return DISNEY_CONFIG.segments.find((s) => s.key === key)!;
}

function buildFY25Actual(): TableColumn {
  const segs = Object.fromEntries(
    SEGMENT_KEYS.map((key) => {
      const s = segmentConfig(key);
      return [
        key,
        actualSegment(s.fy25Revenue, s.fy25OperatingIncome, s.fy25CostLines, s.fy25EquityIncome),
      ];
    })
  ) as Record<SegmentKey, SegmentColumn>;
  const totalSegmentOI = sum(SEGMENT_KEYS.map((k) => segs[k].operatingIncome));
  const belowTheLine = DISNEY_CONFIG.belowTheLineAdjustment;
  return { ...segs, totalSegmentOI, belowTheLine, netIncome: totalSegmentOI + belowTheLine };
}

function buildFY26Actual(): TableColumn {
  const segs = Object.fromEntries(
    SEGMENT_KEYS.map((key) => {
      const a = segmentConfig(key).fy26Actual;
      return [key, actualSegment(a.revenue, a.operatingIncome, a.costLines, a.equityIncome)];
    })
  ) as Record<SegmentKey, SegmentColumn>;
  const totalSegmentOI = sum(SEGMENT_KEYS.map((k) => segs[k].operatingIncome));
  const belowTheLine = DISNEY_CONFIG.fy26ActualBelowTheLine;
  return { ...segs, totalSegmentOI, belowTheLine, netIncome: totalSegmentOI + belowTheLine };
}

function buildFY26Forecast(drivers: DriverValues): TableColumn {
  const fy26 = computeFullForecast(drivers).fy26;
  const segs = Object.fromEntries(
    SEGMENT_KEYS.map((key) => {
      const s = segmentConfig(key);
      const engine = fy26[key];
      const revenue = Math.round(engine.revenue);
      const operatingIncome = Math.round(engine.operatingIncome);
      const equityIncome = s.fy25EquityIncome;
      const costsAndExpenses = revenue - operatingIncome + equityIncome;
      return [
        key,
        {
          revenue,
          costLines: splitByShares(costsAndExpenses, s.fy25CostLines),
          costsAndExpenses,
          equityIncome,
          operatingIncome,
          operatingMargin: engine.operatingMargin,
        },
      ];
    })
  ) as Record<SegmentKey, SegmentColumn>;
  const totalSegmentOI = sum(SEGMENT_KEYS.map((k) => segs[k].operatingIncome));
  const belowTheLine = DISNEY_CONFIG.belowTheLineAdjustment;
  return { ...segs, totalSegmentOI, belowTheLine, netIncome: totalSegmentOI + belowTheLine };
}

export function buildTableModel(drivers: DriverValues): TableModel {
  return {
    fy25Actual: buildFY25Actual(),
    fy26Actual: buildFY26Actual(),
    fy26Forecast: buildFY26Forecast(drivers),
  };
}
