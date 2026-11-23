"use client";

import { useMemo } from "react";
import { DISNEY_CONFIG, DriverValues, SegmentKey } from "@/lib/disneyData";
import { buildTableModel, SegmentColumn, TableModel } from "@/lib/tableModel";

interface ForecastTableProps {
  drivers: DriverValues;
}

// Column order: FY25 Actual, FY26 Actual, FY26 Forecast (spec: docs/v2_1_spec.md)
type ColumnKey = keyof TableModel;
const COLUMNS: ColumnKey[] = ["fy25Actual", "fy26Actual", "fy26Forecast"];

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtM(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

function fmtNeg(value: number): string {
  return `(${fmtM(Math.abs(value))})`;
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
  marker,
  tooltip,
}: {
  label: string;
  variant: "actual" | "forecast";
  marker?: string;
  tooltip?: string;
}) {
  const bg = variant === "forecast" ? "var(--color-accent)" : "var(--color-primary)";
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
      {marker && (
        <span className="ml-0.5" style={{ color: fg, opacity: 0.75 }}>
          {marker}
        </span>
      )}
    </th>
  );
}

// Row label cell
function RowLabel({
  label,
  indent = 0,
  bold,
  topBorder,
  color,
}: {
  label: string;
  indent?: 0 | 1 | 2;
  bold?: boolean;
  topBorder?: string;
  color?: string;
}) {
  return (
    <td
      className="px-3 py-2 text-left"
      style={{
        fontSize: 13,
        fontWeight: bold ? 600 : 400,
        paddingLeft: [12, 24, 40][indent],
        color: color ?? "var(--color-text-primary)",
        borderTop: topBorder,
        position: "sticky",
        left: 0,
        backgroundColor: "var(--color-bg-card)",
        zIndex: 1,
      }}
    >
      {/* Long cost-line labels wrap on phones so the sticky label column
          stays ~200px wide, leaving room to swipe through the figures. */}
      <div className="max-w-[170px] whitespace-normal leading-snug lg:max-w-none lg:whitespace-nowrap">
        {label}
      </div>
    </td>
  );
}

// Data cell. Actual columns read muted; the forecast column keeps the
// accent tint and primary text. Growth badges render only where `prior` is set.
function DataCell({
  column,
  text,
  value,
  prior,
  bold,
  topBorder,
  muted,
}: {
  column: ColumnKey;
  text: string;
  value?: number;
  prior?: number;
  bold?: boolean;
  topBorder?: string;
  muted?: boolean;
}) {
  const isForecast = column === "fy26Forecast";
  return (
    <td
      className="px-3 py-2 text-right tabular-nums"
      style={{
        fontSize: 13,
        fontWeight: bold ? 600 : 400,
        color:
          isForecast && !muted ? "var(--color-text-primary)" : "var(--color-text-secondary)",
        backgroundColor: isForecast ? "var(--color-accent-subtle)" : undefined,
        borderTop: topBorder,
      }}
    >
      <div>{text}</div>
      {value !== undefined && prior !== undefined && (
        <div className="mt-0.5">
          <YoYBadge current={value} prior={prior} />
        </div>
      )}
    </td>
  );
}

// Growth badges appear under FY26 Actual only, measured against FY25 Actual.
function growthPrior(column: ColumnKey, fy25Value: number): number | undefined {
  return column === "fy26Actual" ? fy25Value : undefined;
}

const RULE_LIGHT = "1px solid var(--color-border)";
const RULE_SUBTOTAL = "1px solid var(--color-border-strong)";
const RULE_TOTAL = "2px solid var(--color-border-strong)";

// ── Segment block rows ────────────────────────────────────────────────────────

function SegmentRows({
  segmentKey,
  color,
  model,
}: {
  segmentKey: SegmentKey;
  color: string;
  model: TableModel;
}) {
  const config = DISNEY_CONFIG.segments.find((s) => s.key === segmentKey)!;
  const cell = (column: ColumnKey): SegmentColumn => model[column][segmentKey];
  const fy25 = cell("fy25Actual");

  return (
    <>
      {/* Segment sub-header */}
      <tr>
        <td
          colSpan={COLUMNS.length + 1}
          className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
          style={{
            color,
            backgroundColor: "var(--color-bg-subtle)",
            borderTop: RULE_LIGHT,
          }}
        >
          {config.name}
        </td>
      </tr>

      {/* Revenues */}
      <tr className="hover:bg-[#FAFAF7] transition-colors">
        <RowLabel label="Revenues" indent={1} />
        {COLUMNS.map((c) => (
          <DataCell
            key={c}
            column={c}
            text={fmtM(cell(c).revenue)}
            value={cell(c).revenue}
            prior={growthPrior(c, fy25.revenue)}
          />
        ))}
      </tr>

      {/* Disney's reported cost lines */}
      {config.costLineLabels.map((label, i) => (
        <tr key={label} className="hover:bg-[#FAFAF7] transition-colors">
          <RowLabel label={label} indent={2} color="var(--color-text-secondary)" />
          {COLUMNS.map((c) => (
            <DataCell key={c} column={c} text={fmtNeg(cell(c).costLines[i])} muted />
          ))}
        </tr>
      ))}

      {/* Costs and Expenses */}
      <tr className="hover:bg-[#FAFAF7] transition-colors">
        <RowLabel label="Costs and Expenses" indent={1} topBorder={RULE_LIGHT} />
        {COLUMNS.map((c) => (
          <DataCell
            key={c}
            column={c}
            text={fmtNeg(cell(c).costsAndExpenses)}
            topBorder={RULE_LIGHT}
          />
        ))}
      </tr>

      {/* Equity income from investees */}
      <tr className="hover:bg-[#FAFAF7] transition-colors">
        <RowLabel label="Equity income from investees" indent={1} />
        {COLUMNS.map((c) => (
          <DataCell
            key={c}
            column={c}
            text={cell(c).equityIncome === 0 ? "—" : fmtM(cell(c).equityIncome)}
          />
        ))}
      </tr>

      {/* Segment Operating Income — subtotal */}
      <tr className="hover:bg-[#FAFAF7] transition-colors">
        <RowLabel
          label={`${config.name} Operating Income`}
          indent={1}
          bold
          topBorder={RULE_SUBTOTAL}
        />
        {COLUMNS.map((c) => (
          <DataCell
            key={c}
            column={c}
            text={fmtM(cell(c).operatingIncome)}
            value={cell(c).operatingIncome}
            prior={growthPrior(c, fy25.operatingIncome)}
            bold
            topBorder={RULE_SUBTOTAL}
          />
        ))}
      </tr>

      {/* Operating Margin */}
      <tr className="hover:bg-[#FAFAF7] transition-colors">
        <RowLabel label="Operating Margin" indent={1} />
        {COLUMNS.map((c) => (
          <DataCell key={c} column={c} text={fmtPct(cell(c).operatingMargin)} />
        ))}
      </tr>
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ForecastTable({ drivers }: ForecastTableProps) {
  const model: TableModel = useMemo(() => buildTableModel(drivers), [drivers]);
  const fy25 = model.fy25Actual;

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
            Dollars in $M · FY25 and FY26 actual + FY26 forecast
          </p>
        </div>
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          * Final Forecast as of August 2026
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
              <ColHeader label="FY26 Actual" variant="actual" />
              <ColHeader
                label="FY26 Forecast"
                variant="forecast"
                marker="*"
                tooltip="Final forecast as of August 2026"
              />
            </tr>
          </thead>

          <tbody>
            <SegmentRows segmentKey="entertainment" color="var(--color-entertainment)" model={model} />
            <SegmentRows segmentKey="sports" color="var(--color-sports)" model={model} />
            <SegmentRows segmentKey="experiences" color="var(--color-experiences)" model={model} />

            {/* ── Total Segment OI ── */}
            <tr style={{ backgroundColor: "var(--color-bg-subtle)" }}>
              <RowLabel label="Total Segment Operating Income" bold topBorder={RULE_TOTAL} />
              {COLUMNS.map((c) => (
                <DataCell
                  key={c}
                  column={c}
                  text={fmtM(model[c].totalSegmentOI)}
                  value={model[c].totalSegmentOI}
                  prior={growthPrior(c, fy25.totalSegmentOI)}
                  bold
                  topBorder={RULE_TOTAL}
                />
              ))}
            </tr>

            {/* ── Corporate / below-the-line ── */}
            <tr className="hover:bg-[#FAFAF7] transition-colors">
              <RowLabel
                label="Corporate, eliminations & below-the-line"
                color="var(--color-text-secondary)"
              />
              {COLUMNS.map((c) => (
                <DataCell key={c} column={c} text={fmtNeg(model[c].belowTheLine)} muted />
              ))}
            </tr>

            {/* ── Net Income proxy ── */}
            <tr style={{ backgroundColor: "var(--color-bg-subtle)" }}>
              <RowLabel label="Net Income to Shareholders (proxy)" bold topBorder={RULE_TOTAL} />
              {COLUMNS.map((c) => (
                <DataCell
                  key={c}
                  column={c}
                  text={fmtM(model[c].netIncome)}
                  value={model[c].netIncome}
                  prior={growthPrior(c, fy25.netIncome)}
                  bold
                  topBorder={RULE_TOTAL}
                />
              ))}
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
          FY26 includes a 53rd week. The forecast assumes a +2% revenue benefit from it; Disney
          estimates it added about $1.6 billion (2%) to revenue. Below-the-line is as reported in
          the actual columns (corporate costs, restructuring, interest, acquisition amortization,
          tax, minority interests); the forecast holds the FY25 amount. In the forecast column,
          cost lines keep their fiscal 2025 shares and equity income is held at the fiscal 2025
          level. Growth
          shown under FY26 Actual is against FY25 Actual. ▲ green = positive, ▼ red = negative.
        </p>
      </div>
    </div>
    </div>
  );
}
