"use client";

import { useMemo } from "react";
import { DriverValues, PRIOR_FY26_FORECAST, PriorSegmentForecast } from "@/lib/disneyData";
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
  variant,
  hasFiftyThird,
  tooltip,
}: {
  label: string;
  variant: "actual" | "prior" | "forecast";
  hasFiftyThird?: boolean;
  tooltip?: string;
}) {
  // Prior column reads as historical/frozen: desaturated navy at 65% opacity,
  // sitting between the solid navy of FY25 Actual and the accent-gold of the
  // live forecast columns.
  const bg =
    variant === "forecast"
      ? "var(--color-accent)"
      : variant === "prior"
        ? "rgba(30, 58, 95, 0.65)" // var(--color-primary) at 65% opacity
        : "var(--color-primary)";
  const fg = variant === "forecast" ? "var(--color-primary)" : "#ffffff";

  return (
    <th
      className="px-3 py-2.5 text-right text-xs font-semibold whitespace-nowrap"
      title={tooltip}
      style={{
        backgroundColor: bg,
        color: fg,
        minWidth: 110,
      }}
    >
      {label}
      {hasFiftyThird && (
        <span
          className="ml-1"
          title="FY26 includes an estimated +2% benefit from a 53rd fiscal week"
          style={{ color: fg, opacity: 0.75 }}
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
        fontSize: 13,
        fontWeight: bold ? 600 : 400,
        paddingLeft: indent ? 24 : 12,
        color: color ?? "var(--color-text-primary)",
        borderTop: topBorder ? "2px solid var(--color-border-strong)" : undefined,
        position: "sticky",
        left: 0,
        backgroundColor: "var(--color-bg-card)",
        zIndex: 1,
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

// Data cell — Prior FY26 Forecast column (frozen v1 snapshot, muted styling,
// YoY chip computed against FY25 Actual so the growth rate lines up next to
// the live FY26 Forecast column's chip for direct visual comparison).
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

// ── Segment block rows ────────────────────────────────────────────────────────

function SegmentRows({
  label,
  color,
  actual,
  prior,
  fy26,
  fy27,
  fy28,
  fy25Actual,
}: {
  label: string;
  color: string;
  actual: SegmentForecast;
  prior: PriorSegmentForecast;
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
          colSpan={6}
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
        <PriorCell value={prior.revenue} fy25Prior={fy25Actual.revenue} formatter={fmtM} showYoY />
        <ForecastCell value={fy26.revenue} prior={fy25Actual.revenue} formatter={fmtM} showYoY isFiftyThirdYear />
        <ForecastCell value={fy27.revenue} prior={fy26.revenue} formatter={fmtM} showYoY />
        <ForecastCell value={fy28.revenue} prior={fy27.revenue} formatter={fmtM} showYoY />
      </tr>

      {/* Operating Income */}
      <tr className="hover:bg-[#FAFAF7] transition-colors">
        <RowLabel label="Operating Income" indent />
        <ActualCell value={actual.operatingIncome} formatter={fmtM} />
        <PriorCell value={prior.operatingIncome} fy25Prior={fy25Actual.operatingIncome} formatter={fmtM} showYoY />
        <ForecastCell value={fy26.operatingIncome} prior={fy25Actual.operatingIncome} formatter={fmtM} showYoY isFiftyThirdYear />
        <ForecastCell value={fy27.operatingIncome} prior={fy26.operatingIncome} formatter={fmtM} showYoY />
        <ForecastCell value={fy28.operatingIncome} prior={fy27.operatingIncome} formatter={fmtM} showYoY />
      </tr>

      {/* Operating Margin */}
      <tr className="hover:bg-[#FAFAF7] transition-colors">
        <RowLabel label="Operating Margin" indent />
        <ActualCell value={actual.operatingMargin} formatter={fmtPct} />
        <PriorCell value={prior.operatingMargin} fy25Prior={fy25Actual.operatingMargin} formatter={fmtPct} />
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
    <div className="overflow-x-auto">
    <div className="card p-0 overflow-hidden" style={{ minWidth: 600 }}>
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
            Dollars in $M · FY25 actual + FY26–28 forecast
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
                  position: "sticky",
                  left: 0,
                  zIndex: 2,
                }}
              >
                Line Item
              </th>
              <ColHeader label="FY25 Actual" variant="actual" />
              <ColHeader
                label="Prior FY26 Forecast"
                variant="prior"
                tooltip="v1.0 forecast as shipped May 31, 2026, frozen for comparison. See README for context."
              />
              <ColHeader label="FY26 Forecast" variant="forecast" hasFiftyThird />
              <ColHeader label="FY27 Forecast" variant="forecast" />
              <ColHeader label="FY28 Forecast" variant="forecast" />
            </tr>
          </thead>

          <tbody>
            {/* Entertainment */}
            <SegmentRows
              label="Entertainment"
              color="var(--color-entertainment)"
              actual={fy25Actual.entertainment}
              prior={PRIOR_FY26_FORECAST.entertainment}
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
              prior={PRIOR_FY26_FORECAST.sports}
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
              prior={PRIOR_FY26_FORECAST.experiences}
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
              <PriorCell
                value={PRIOR_FY26_FORECAST.totalSegmentOI}
                fy25Prior={fy25Actual.totalSegmentOI}
                formatter={fmtM}
                bold
                topBorder
                showYoY
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
              {[fy25Actual, PRIOR_FY26_FORECAST, fy26, fy27, fy28].map((yr, i) => (
                <td
                  key={i}
                  className="px-3 py-2 text-right tabular-nums"
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-secondary)",
                    backgroundColor:
                      i === 2 ? "var(--color-accent-subtle)" : undefined,
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
              <PriorCell
                value={PRIOR_FY26_FORECAST.netIncomeProxy}
                fy25Prior={fy25Actual.netIncomeProxy}
                formatter={fmtM}
                bold
                topBorder
                showYoY
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
    </div>
  );
}
