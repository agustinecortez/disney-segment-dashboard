// lib/forecastMath.ts
// ─────────────────────────────────────────────────────────────────────────────
// Pure forecast math functions. No UI dependencies. All values in $M.
// Placeholder implementations — returns zeros until Step 3.
// ─────────────────────────────────────────────────────────────────────────────

import { DriverValues } from "./disneyData";

export interface SegmentForecast {
  revenue: number;
  operatingIncome: number;
  operatingMargin: number; // as a percentage, e.g. 11.0
}

export interface YearForecast {
  year: string;
  entertainment: SegmentForecast;
  sports: SegmentForecast;
  experiences: SegmentForecast;
  totalSegmentOI: number;
  belowTheLine: number;
  netIncomeProxy: number;
}

export interface FullForecast {
  fy25Actual: YearForecast;
  fy26: YearForecast;
  fy27: YearForecast;
  fy28: YearForecast;
}

export interface TornadoBar {
  driverId: string;
  driverLabel: string;
  upsideDelta: number;   // $M change in FY26 Total Segment OI at +10% relative
  downsideDelta: number; // $M change in FY26 Total Segment OI at -10% relative
  absSwing: number;      // |upside - downside| for sorting
}

// ── Placeholder: returns a zeroed forecast ───────────────────────────────────

export function computeFullForecast(
  _drivers: DriverValues
): FullForecast {
  const emptySegment: SegmentForecast = {
    revenue: 0,
    operatingIncome: 0,
    operatingMargin: 0,
  };
  const emptyYear = (year: string): YearForecast => ({
    year,
    entertainment: { ...emptySegment },
    sports: { ...emptySegment },
    experiences: { ...emptySegment },
    totalSegmentOI: 0,
    belowTheLine: 0,
    netIncomeProxy: 0,
  });

  return {
    fy25Actual: emptyYear("FY25"),
    fy26: emptyYear("FY26E"),
    fy27: emptyYear("FY27E"),
    fy28: emptyYear("FY28E"),
  };
}

// ── Placeholder: returns empty tornado data ───────────────────────────────────

export function computeTornadoBars(
  _drivers: DriverValues
): TornadoBar[] {
  return [];
}
