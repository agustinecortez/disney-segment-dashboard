"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { DriverValues } from "@/lib/disneyData";
import { computeFullForecast } from "@/lib/forecastMath";

interface SegmentChartProps {
  drivers: DriverValues;
}

// Segment definitions — label, revenue color, OI color (60% opacity variant)
const SEGMENTS = [
  {
    key: "entertainment" as const,
    label: "Entertainment",
    revColor: "#4A6FA5",
    oiColor: "#4A6FA580",
    revColorSolid: "#4A6FA5",
    oiColorSolid: "#8AADCB",
  },
  {
    key: "sports" as const,
    label: "Sports",
    revColor: "#C45A4A",
    oiColor: "#C45A4A80",
    revColorSolid: "#C45A4A",
    oiColorSolid: "#D9907E",
  },
  {
    key: "experiences" as const,
    label: "Experiences",
    revColor: "#6B8E5A",
    oiColor: "#6B8E5A80",
    revColorSolid: "#6B8E5A",
    oiColorSolid: "#9BBD88",
  },
];

function fmtB(value: number) {
  return `$${(value / 1000).toFixed(1)}B`;
}

// Custom tooltip
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg shadow-lg p-3 text-xs"
      style={{
        backgroundColor: "var(--color-primary)",
        border: "1px solid var(--color-primary-hover)",
        color: "#ffffff",
        minWidth: 160,
      }}
    >
      <p className="font-semibold mb-2" style={{ color: "rgba(255,255,255,0.75)" }}>
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex justify-between gap-4 mb-0.5">
          <span style={{ color: "rgba(255,255,255,0.85)" }}>{entry.name}</span>
          <span className="font-semibold tabular-nums">{fmtB(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

// Custom legend
function CustomLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
      {SEGMENTS.map((seg) => (
        <div key={seg.key} className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div
              className="rounded-sm"
              style={{ width: 12, height: 12, backgroundColor: seg.revColorSolid }}
            />
            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              {seg.label} Rev
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="rounded-sm"
              style={{ width: 12, height: 12, backgroundColor: seg.oiColorSolid }}
            />
            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              {seg.label} OI
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SegmentChart({ drivers }: SegmentChartProps) {
  const forecast = useMemo(() => computeFullForecast(drivers), [drivers]);

  // Build chart data — one entry per year, each segment's rev + OI as separate keys
  const years = [
    { label: "FY25", data: forecast.fy25Actual },
    { label: "FY26E*", data: forecast.fy26 },
    { label: "FY27E", data: forecast.fy27 },
    { label: "FY28E", data: forecast.fy28 },
  ];

  const chartData = years.map(({ label, data }) => ({
    year: label,
    "Ent Rev": data.entertainment.revenue,
    "Ent OI": data.entertainment.operatingIncome,
    "Spo Rev": data.sports.revenue,
    "Spo OI": data.sports.operatingIncome,
    "Exp Rev": data.experiences.revenue,
    "Exp OI": data.experiences.operatingIncome,
  }));

  // Bar definitions in render order
  const bars = [
    { key: "Ent Rev", color: SEGMENTS[0].revColorSolid },
    { key: "Ent OI", color: SEGMENTS[0].oiColorSolid },
    { key: "Spo Rev", color: SEGMENTS[1].revColorSolid },
    { key: "Spo OI", color: SEGMENTS[1].oiColorSolid },
    { key: "Exp Rev", color: SEGMENTS[2].revColorSolid },
    { key: "Exp OI", color: SEGMENTS[2].oiColorSolid },
  ];

  return (
    <div className="card p-0 overflow-hidden">
      {/* Card header */}
      <div
        className="px-6 py-3 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
          Segment Revenue &amp; Operating Income
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
          Dollars in $M · darker bar = Revenue, lighter bar = OI
        </p>
      </div>

      <div className="px-4 pt-4 pb-2">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart
            data={chartData}
            margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
            barCategoryGap="20%"
            barGap={1}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
              axisLine={{ stroke: "var(--color-border)" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}B`}
              tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <Legend content={<CustomLegend />} />
            {bars.map((bar) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                fill={bar.color}
                radius={[2, 2, 0, 0]}
                maxBarSize={18}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
