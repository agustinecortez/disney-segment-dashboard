"use client";

// New Method Segment Forecast table — FY25 and FY26 as restated by Disney for
// its new segment structure, plus FY27 and FY28 driven by the 12 scenario
// drivers (docs/v3_spec.md section 4).

import { useMemo } from "react";
import { DriverValues, NEW_METHOD, SegmentKey } from "@/lib/disneyData";
import { buildNewTableModel, NewTableModel, SegmentColumn } from "@/lib/tableModel";
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

interface NewForecastTableProps {
  drivers: DriverValues;
}

type ColumnKey = "fy25Actual" | "fy26Actual" | "fy27Forecast" | "fy28Forecast";
const COLUMNS: ColumnKey[] = ["fy25Actual", "fy26Actual", "fy27Forecast", "fy28Forecast"];
const isForecast = (c: ColumnKey) => c === "fy27Forecast" || c === "fy28Forecast";

/**
 * Growth badge basis (docs/v3_spec.md section 4):
 *   FY26 vs FY25; FY27 vs FY26 excluding the 53rd week (Disney's guidance
 *   basis); FY28 vs FY27.
 */
function growthPrior(
  model: NewTableModel,
  column: ColumnKey,
  pick: (c: SegmentColumn | { revenue: number; operatingIncome: number }) => number,
  segment: SegmentKey
): number | undefined {
  if (column === "fy26Actual") return pick(model.fy25Actual[segment]);
  if (column === "fy27Forecast") return pick(model.fy26Base[segment]);
  if (column === "fy28Forecast") return pick(model.fy27Forecast[segment]);
  return undefined;
}

function SegmentRows({ segmentKey, model }: { segmentKey: SegmentKey; model: NewTableModel }) {
  const config = NEW_METHOD.segments[segmentKey];
  const cell = (column: ColumnKey): SegmentColumn => model[column][segmentKey];

  return (
    <>
      <SegmentHeaderRow label={config.name} color={SEGMENT_COLORS[segmentKey]} colSpan={COLUMNS.length + 1} />

      {/* Revenues, then Disney's new revenue lines */}
      <tr className="hover:bg-[#FAFAF7] transition-colors">
        <RowLabel label="Revenues" indent={1} />
        {COLUMNS.map((c) => (
          <DataCell
            key={c}
            isForecast={isForecast(c)}
            text={fmtM(cell(c).revenue)}
            value={cell(c).revenue}
            prior={growthPrior(model, c, (x) => x.revenue, segmentKey)}
          />
        ))}
      </tr>
      {config.revenueLineLabels.map((label, i) => (
        <tr key={`rev-${label}`} className="hover:bg-[#FAFAF7] transition-colors">
          <RowLabel label={label} indent={2} color="var(--color-text-secondary)" />
          {COLUMNS.map((c) => (
            <DataCell key={c} isForecast={isForecast(c)} text={fmtM(cell(c).revenueLines[i])} muted />
          ))}
        </tr>
      ))}

      {/* Disney's restated cost lines — a light rule separates them from the
          revenue lines above */}
      {config.costLineLabels.map((label, i) => (
        <tr key={`cost-${label}`} className="hover:bg-[#FAFAF7] transition-colors">
          <RowLabel
            label={label}
            indent={2}
            color="var(--color-text-secondary)"
            topBorder={i === 0 ? RULE_LIGHT : undefined}
          />
          {COLUMNS.map((c) => (
            <DataCell
              key={c}
              isForecast={isForecast(c)}
              text={fmtNeg(cell(c).costLines[i])}
              topBorder={i === 0 ? RULE_LIGHT : undefined}
              muted
            />
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
            prior={growthPrior(model, c, (x) => x.operatingIncome, segmentKey)}
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

export default function NewForecastTable({ drivers }: NewForecastTableProps) {
  const model = useMemo(() => buildNewTableModel(drivers), [drivers]);

  const totalPrior = (c: ColumnKey): number | undefined =>
    c === "fy26Actual"
      ? model.fy25Actual.totalSegmentOI
      : c === "fy27Forecast"
        ? model.fy26Base.totalSegmentOI
        : c === "fy28Forecast"
          ? model.fy27Forecast.totalSegmentOI
          : undefined;

  const netIncomePrior = (c: ColumnKey): number | undefined => {
    const i = COLUMNS.indexOf(c);
    return i > 0 ? model[COLUMNS[i - 1]].netIncome : undefined;
  };

  return (
    <div className="overflow-x-auto">
    <div className="card p-0 overflow-hidden" style={{ minWidth: 680 }}>
      <TableCardHeader
        subtitle="Dollars in $M · Disney's new segment structure, FY25–FY26 restated by Disney"
        note="Driven by the 12 scenario drivers"
      />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 680 }}>
          <thead>
            <tr>
              <LineItemHeader />
              <ColHeader label="FY25 Actual" variant="actual" tooltip="Restated by Disney, November 17, 2026" />
              <ColHeader label="FY26 Actual" variant="actual" tooltip="Restated by Disney, November 17, 2026" />
              <ColHeader label="FY27 Forecast" variant="forecast" />
              <ColHeader label="FY28 Forecast" variant="forecast" />
            </tr>
          </thead>

          <tbody>
            <SegmentRows segmentKey="entertainment" model={model} />
            <SegmentRows segmentKey="sports" model={model} />
            <SegmentRows segmentKey="experiences" model={model} />

            <tr style={{ backgroundColor: "var(--color-bg-subtle)" }}>
              <RowLabel label="Total Segment Operating Income" bold topBorder={RULE_TOTAL} />
              {COLUMNS.map((c) => (
                <DataCell
                  key={c}
                  isForecast={isForecast(c)}
                  text={fmtM(model[c].totalSegmentOI)}
                  value={model[c].totalSegmentOI}
                  prior={totalPrior(c)}
                  bold
                  topBorder={RULE_TOTAL}
                />
              ))}
            </tr>

            <tr className="hover:bg-[#FAFAF7] transition-colors">
              <RowLabel label="Corporate, eliminations & below-the-line" color="var(--color-text-secondary)" />
              {COLUMNS.map((c) => (
                <DataCell key={c} isForecast={isForecast(c)} text={fmtNeg(model[c].belowTheLine)} muted />
              ))}
            </tr>

            <tr style={{ backgroundColor: "var(--color-bg-subtle)" }}>
              <RowLabel label="Net Income to Shareholders (proxy)" bold topBorder={RULE_TOTAL} />
              {COLUMNS.map((c) => (
                <DataCell
                  key={c}
                  isForecast={isForecast(c)}
                  text={fmtM(model[c].netIncome)}
                  value={model[c].netIncome}
                  prior={netIncomePrior(c)}
                  bold
                  topBorder={RULE_TOTAL}
                />
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <TableFootnote>
        FY25 and FY26 are Disney&apos;s restated figures (Consumer Products moved to Entertainment;
        equity income removed from Entertainment). FY27 growth is against FY26 excluding the 53rd
        week, the basis of Disney&apos;s guidance; FY28 growth is against FY27; net income growth is
        against the prior year as reported. Forecast cost lines keep their FY26 shares; Sports
        equity income is held at the FY26 level. Forecast below-the-line: corporate costs,
        interest and minority interests at FY26 levels, acquisition amortization of about $1.2
        billion and a 22% tax rate per Disney&apos;s FY27 guidance, no restructuring charges. ▲ green
        = positive, ▼ red = negative.
      </TableFootnote>
    </div>
    </div>
  );
}
