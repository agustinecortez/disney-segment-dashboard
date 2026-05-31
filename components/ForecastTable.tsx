"use client";

import { useMemo } from "react";
import { DriverValues } from "@/lib/disneyData";
import { computeFullForecast, FullForecast, SegmentForecast } from "@/lib/forecastMath";

interface ForecastTableProps {
  drivers: DriverValues;
}

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtM(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

function fmtPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

function yoy(current: number, prior: number): number {
  if (prior === 0) return 0;
  return ((current - prior) / Math.abs(prior)) * 100;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function YoYBadge({ current, prior }: { current: number; prior: number }) {
  const pct = yoy(current, prior);
  const positive = pct >= 0;
  return (
    <span
      className="tabular-nums"
      style={{
        fontSize: 11,
        color: positive ? "var(--color-positive)" : "var(--color-negative)",
      }}
    >
      {positive ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

// Column header cell
function ColHeader({
  label,
  isForecast,
  hasFiftyThird,
}: {
  label: string;
  isForecast: boolean;
  hasFiftyThird?: boolean;
}) {
  return (
    <th
      className="px-3 py-2.5 text-right text-xs font-semibold whitespace-nowrap"
      style={{
        backgroundColor: isForecast ? "var(--color-accent)" : "var(--color-primary)",
        color: isForecast ? "var(--color-primary)" : "#ffffff",
        minWidth: 110,
      }}
    >
      {label}
      {hasFiftyThird && (
        <span
          className="ml-1"
          title="FY26 includes an estimated +2% benefit from a 53rd fiscal week"
          style={{ color: isForecast ? "var(--color-primary)" : "#ffffff", opacity: 0.75 }}
        >
          *
        </span>
      )}
    </th>
  );
}

// Row label cell
function RowLabel({
  label,
  indent,
  bold,
  topBorder,
  color,
}: {
  label: string;
  indent?: boolean;
  bold?: boolean;
  topBorder?: boolean;
  color?: string;
}) {
  return (
    <td
      className="px-3 py-2 text-left whitespace-nowrap"
      style={{
        fontSize: bold ? 13 : 13,
        fontWeight: bold ? 600 : 400,
        paddingLeft: indent ? 24 : 12,
        color: color ?? "var(--color-text-primary)",
        borderTop: topBorder ? "2px solid var(--color-border-strong)" : undefined,
      }}
    >
      {label}
    </td>
  );
}

// Data cell — actual (FY25) column
function ActualCell({
  value,
  formatter,
  bold,
  topBorder,
}: {
  value: number;
  formatter: (v: number) => string;
  bold?: boolean;
  topBorder?: boolean;
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
      {formatter(value)}
    </td>
  );
}

// Data cell — forecast column (with YoY badge)
function ForecastCell({
  value,
  prior,
  formatter,
  bold,
  topBorder,
  showYoY,
  isFiftyThirdYear,
}: {
  value: number;
  prior: number;
  formatter: (v: number) => string;
  bold?: boolean;
  topBorder?: boolean;
  showYoY?: boolean;
  isFiftyThirdYear?: boolean;
}) {
  return (
    <td
      className="px-3 py-2 text-right tabular-nums"
      style={{
        fontSize: 13,
        fontWeight: bold ? 600 : 400,
        color: "var(--color-text-primary)",
        backgroundColor: isFiftyThirdYear
          ? "var(--color-accent-subtle)"
          : undefined,
        borderTop: topBorder ? "2px solid var(--color-border-strong)" : undefined,
      }}
    >
      <div>{formatter(value)}</div>
      {showYoY && (
        <div className="mt-0.5">
          <YoYBadge current={value} prior={prior} />
        </div>
      )}
    </td>
  );
}

// ── Segment block rows ────────────────────────────────────────────────────────

function SegmentRows({
  label,
  color,
  actual,
  fy26,
  fy27,
  fy28,
  fy25Actual,
}: {
  label: string;
  color: string;
  actual: SegmentForecast;
  fy26: SegmentForecast;
  fy27: SegmentForecast;
  fy28: SegmentForecast;
  fy25Actual: SegmentForecast;
}) {
  return (
    <>
      {/* Segment sub-header */}
      <tr>
        <td
          colSpan={5}
          className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
          style={{
            color,
            backgroundColor: "var(--color-bg-subtle)",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          {label}
        </td>
      </tr>

      {/* Revenue */}
      <tr className="hover:bg-[#FAFAF7] transition-colors">
        <RowLabel label="Revenue" indent />
        <ActualCell value={actual.revenue} formatter={fmtM} />
        <ForecastCell value={fy26.revenue} prior={fy25Actual.revenue} formatter={fmtM} showYoY isFiftyThirdYear />
        <ForecastCell value={fy27.revenue} prior={fy26.revenue} formatter={fmtM} showYoY />
        <ForecastCell value={fy28.revenue} prior={fy27.revenue} formatter={fmtM} showYoY />
      </tr>

      {/* Operating Income */}
      <tr className="hover:bg-[#FAFAF7] transition-colors">
        <RowLabel label="Operating Income" indent />
        <ActualCell value={actual.operatingIncome} formatter={fmtM} />
        <ForecastCell value={fy26.operatingIncome} prior={fy25Actual.operatingIncome} formatter={fmtM} showYoY isFiftyThirdYear />
        <ForecastCell value={fy27.operatingIncome} prior={fy26.operatingIncome} formatter={fmtM} showYoY />
        <ForecastCell value={fy28.operatingIncome} prior={fy27.operatingIncome} formatter={fmtM} showYoY />
      </tr>

      {/* Operating Margin */}
      <tr className="hover:bg-[#FAFAF7] transition-colors">
        <RowLabel label="Operating Margin" indent />
        <ActualCell value={actual.operatingMargin} formatter={fmtPct} />
        <ForecastCell value={fy26.operatingMargin} prior={fy25Actual.operatingMargin} formatter={fmtPct} isFiftyThirdYear />
        <ForecastCell value={fy27.operatingMargin} prior={fy26.operatingMargin} formatter={fmtPct} />
        <ForecastCell value={fy28.operatingMargin} prior={fy27.operatingMargin} formatter={fmtPct} />
      </tr>
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ForecastTable({ drivers }: ForecastTableProps) {
  const forecast: FullForecast = useMemo(
    () => computeFullForecast(drivers),
    [drivers]
  );

  const { fy25Actual, fy26, fy27, fy28 } = forecast;

  return (
    <div className="card p-0 overflow-hidden">
      {/* Card header */}
      <div
        className="px-6 py-3 border-b flex items-center justify-between"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
            Segment Forecast
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
            Dollars in $M · FY25 actual + FY26–28 projected
          </p>
        </div>
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          * FY26 includes +2% 53rd-week benefit
        </p>
      </div>

      {/* Scrollable table wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 600 }}>
          <thead>
            <tr>
              <th
                className="px-3 py-2.5 text-left text-xs font-semibold"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "#ffffff",
                  minWidth: 200,
                }}
              >
                Line Item
              </th>
              <ColHeader label="FY25 Actual" isForecast={false} />
              <ColHeader label="FY26E" isForecast hasFiftyThird />
              <ColHeader label="FY27E" isForecast />
              <ColHeader label="FY28E" isForecast />
            </tr>
          </thead>

          <tbody>
            {/* Entertainment */}
            <SegmentRows
              label="Entertainment"
              color="var(--color-entertainment)"
              actual={fy25Actual.entertainment}
              fy26={fy26.entertainment}
              fy27={fy27.entertainment}
              fy28={fy28.entertainment}
              fy25Actual={fy25Actual.entertainment}
            />

            {/* Sports */}
            <SegmentRows
              label="Sports"
              color="var(--color-sports)"
              actual={fy25Actual.sports}
              fy26={fy26.sports}
              fy27={fy27.sports}
              fy28={fy28.sports}
              fy25Actual={fy25Actual.sports}
            />

            {/* Experiences */}
            <SegmentRows
              label="Experiences"
              color="var(--color-experiences)"
              actual={fy25Actual.experiences}
              fy26={fy26.experiences}
              fy27={fy27.experiences}
              fy28={fy28.experiences}
              fy25Actual={fy25Actual.experiences}
            />

            {/* ── Total Segment OI ── */}
            <tr style={{ backgroundColor: "var(--color-bg-subtle)" }}>
              <RowLabel label="Total Segment Operating Income" bold topBorder />
              <ActualCell
                value={fy25Actual.totalSegmentOI}
                formatter={fmtM}
                bold
                topBorder
              />
              <ForecastCell
                value={fy26.totalSegmentOI}
                prior={fy25Actual.totalSegmentOI}
                formatter={fmtM}
                bold
                topBorder
                showYoY
                isFiftyThirdYear
              />
              <ForecastCell
                value={fy27.totalSegmentOI}
                prior={fy26.totalSegmentOI}
                formatter={fmtM}
                bold
                topBorder
                showYoY
              />
              <ForecastCell
                value={fy28.totalSegmentOI}
                prior={fy27.totalSegmentOI}
                formatter={fmtM}
                bold
                topBorder
                showYoY
              />
            </tr>

            {/* ── Corporate / below-the-line ── */}
            <tr className="hover:bg-[#FAFAF7] transition-colors">
              <RowLabel
                label="Corporate, eliminations & below-the-line"
                color="var(--color-text-secondary)"
              />
              {[fy25Actual, fy26, fy27, fy28].map((yr, i) => (
                <td
                  key={i}
                  className="px-3 py-2 text-right tabular-nums"
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-secondary)",
                    backgroundColor:
                      i === 1 ? "var(--color-accent-subtle)" : undefined,
                  }}
                >
                  ({Math.abs(yr.belowTheLine).toLocaleString("en-US")})
                </td>
              ))}
            </tr>

            {/* ── Net Income proxy ── */}
            <tr style={{ backgroundColor: "var(--color-bg-subtle)" }}>
              <RowLabel label="Net Income to Shareholders (proxy)" bold topBorder />
              <ActualCell
                value={fy25Actual.netIncomeProxy}
                formatter={fmtM}
                bold
                topBorder
              />
              <ForecastCell
                value={fy26.netIncomeProxy}
                prior={fy25Actual.netIncomeProxy}
                formatter={fmtM}
                bold
                topBorder
                showYoY
                isFiftyThirdYear
              />
              <ForecastCell
                value={fy27.netIncomeProxy}
                prior={fy26.netIncomeProxy}
                formatter={fmtM}
                bold
                topBorder
                showYoY
              />
              <ForecastCell
                value={fy28.netIncomeProxy}
                prior={fy27.netIncomeProxy}
                formatter={fmtM}
                bold
                topBorder
                showYoY
              />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Table footer note */}
      <div
        className="px-6 py-2 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          Below-the-line held fixed at ($5,147M) — includes corporate costs, interest, tax, and minority interests.
          YoY growth shown below each forecast value. ▲ green = positive, ▼ red = negative.
        </p>
      </div>
    </div>
  );
}
