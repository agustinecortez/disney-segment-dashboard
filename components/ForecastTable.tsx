"use client";

// Old Method Segment Forecast table — FY25 Actual, FY26 Actual and the final
// FY26 forecast as of August 2026. Fully fixed: it does not read the sliders.
// Layout per docs/v2_1_spec.md; frozen per docs/v3_spec.md section 3.

import { DISNEY_CONFIG, SegmentKey } from "@/lib/disneyData";
import { buildOldTableModel, OldTableModel, SegmentColumn } from "@/lib/tableModel";
import {
  ColHeader,
  DataCell,
  fmtM,
  fmtNeg,
  fmtPct,
  LineItemHeader,
  RowLabel,
  RULE_LIGHT,
  RULE_SUBTOTAL,
  RULE_TOTAL,
  SEGMENT_COLORS,
  SegmentHeaderRow,
  TableCardHeader,
  TableFootnote,
} from "./tableParts";

type ColumnKey = keyof OldTableModel;
const COLUMNS: ColumnKey[] = ["fy25Actual", "fy26Actual", "fy26Forecast"];
const MODEL: OldTableModel = buildOldTableModel();

// Growth badges appear under FY26 Actual only, measured against FY25 Actual.
function growthPrior(column: ColumnKey, fy25Value: number): number | undefined {
  return column === "fy26Actual" ? fy25Value : undefined;
}

function SegmentRows({ segmentKey }: { segmentKey: SegmentKey }) {
  const config = DISNEY_CONFIG.segments.find((s) => s.key === segmentKey)!;
  const cell = (column: ColumnKey): SegmentColumn => MODEL[column][segmentKey];
  const fy25 = cell("fy25Actual");
  const isForecast = (c: ColumnKey) => c === "fy26Forecast";

  return (
    <>
      <SegmentHeaderRow label={config.name} color={SEGMENT_COLORS[segmentKey]} colSpan={COLUMNS.length + 1} />

      <tr className="hover:bg-[#FAFAF7] transition-colors">
        <RowLabel label="Revenues" indent={1} />
        {COLUMNS.map((c) => (
          <DataCell
            key={c}
            isForecast={isForecast(c)}
            text={fmtM(cell(c).revenue)}
            value={cell(c).revenue}
            prior={growthPrior(c, fy25.revenue)}
          />
        ))}
      </tr>

      {config.costLineLabels.map((label, i) => (
        <tr key={label} className="hover:bg-[#FAFAF7] transition-colors">
          <RowLabel label={label} indent={2} color="var(--color-text-secondary)" />
          {COLUMNS.map((c) => (
            <DataCell key={c} isForecast={isForecast(c)} text={fmtNeg(cell(c).costLines[i])} muted />
          ))}
        </tr>
      ))}

      <tr className="hover:bg-[#FAFAF7] transition-colors">
        <RowLabel label="Costs and Expenses" indent={1} topBorder={RULE_LIGHT} />
        {COLUMNS.map((c) => (
          <DataCell key={c} isForecast={isForecast(c)} text={fmtNeg(cell(c).costsAndExpenses)} topBorder={RULE_LIGHT} />
        ))}
      </tr>

      <tr className="hover:bg-[#FAFAF7] transition-colors">
        <RowLabel label="Equity income from investees" indent={1} />
        {COLUMNS.map((c) => (
          <DataCell
            key={c}
            isForecast={isForecast(c)}
            text={cell(c).equityIncome === 0 ? "—" : fmtM(cell(c).equityIncome)}
          />
        ))}
      </tr>

      <tr className="hover:bg-[#FAFAF7] transition-colors">
        <RowLabel label={`${config.name} Operating Income`} indent={1} bold topBorder={RULE_SUBTOTAL} />
        {COLUMNS.map((c) => (
          <DataCell
            key={c}
            isForecast={isForecast(c)}
            text={fmtM(cell(c).operatingIncome)}
            value={cell(c).operatingIncome}
            prior={growthPrior(c, fy25.operatingIncome)}
            bold
            topBorder={RULE_SUBTOTAL}
          />
        ))}
      </tr>

      <tr className="hover:bg-[#FAFAF7] transition-colors">
        <RowLabel label="Operating Margin" indent={1} />
        {COLUMNS.map((c) => (
          <DataCell key={c} isForecast={isForecast(c)} text={fmtPct(cell(c).operatingMargin)} />
        ))}
      </tr>
    </>
  );
}

export default function ForecastTable() {
  const fy25 = MODEL.fy25Actual;
  const isForecast = (c: ColumnKey) => c === "fy26Forecast";

  return (
    <div className="overflow-x-auto">
    <div className="card p-0 overflow-hidden" style={{ minWidth: 600 }}>
      <TableCardHeader
        subtitle="Dollars in $M · FY25 and FY26 actual + FY26 forecast"
        note="* Final Forecast as of August 2026"
      />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 600 }}>
          <thead>
            <tr>
              <LineItemHeader />
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
            <SegmentRows segmentKey="entertainment" />
            <SegmentRows segmentKey="sports" />
            <SegmentRows segmentKey="experiences" />

            <tr style={{ backgroundColor: "var(--color-bg-subtle)" }}>
              <RowLabel label="Total Segment Operating Income" bold topBorder={RULE_TOTAL} />
              {COLUMNS.map((c) => (
                <DataCell
                  key={c}
                  isForecast={isForecast(c)}
                  text={fmtM(MODEL[c].totalSegmentOI)}
                  value={MODEL[c].totalSegmentOI}
                  prior={growthPrior(c, fy25.totalSegmentOI)}
                  bold
                  topBorder={RULE_TOTAL}
                />
              ))}
            </tr>

            <tr className="hover:bg-[#FAFAF7] transition-colors">
              <RowLabel label="Corporate, eliminations & below-the-line" color="var(--color-text-secondary)" />
              {COLUMNS.map((c) => (
                <DataCell key={c} isForecast={isForecast(c)} text={fmtNeg(MODEL[c].belowTheLine)} muted />
              ))}
            </tr>

            <tr style={{ backgroundColor: "var(--color-bg-subtle)" }}>
              <RowLabel label="Net Income to Shareholders (proxy)" bold topBorder={RULE_TOTAL} />
              {COLUMNS.map((c) => (
                <DataCell
                  key={c}
                  isForecast={isForecast(c)}
                  text={fmtM(MODEL[c].netIncome)}
                  value={MODEL[c].netIncome}
                  prior={growthPrior(c, fy25.netIncome)}
                  bold
                  topBorder={RULE_TOTAL}
                />
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <TableFootnote>
        FY26 includes a 53rd week. The forecast assumes a +2% revenue benefit from it; Disney
        estimates it added about $1.6 billion (2%) to revenue. Below-the-line is as reported in
        the actual columns (corporate costs, restructuring, interest, acquisition amortization,
        tax, minority interests); the forecast holds the FY25 amount. In the forecast column,
        cost lines keep their fiscal 2025 shares and equity income is held at the fiscal 2025
        level. Growth shown under FY26 Actual is against FY25 Actual. ▲ green = positive, ▼ red =
        negative.
      </TableFootnote>
    </div>
    </div>
  );
}
