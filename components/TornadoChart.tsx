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
  ReferenceLine,
  Cell,
} from "recharts";
import { DriverValues, getDefaultDriverValues } from "@/lib/disneyData";
import { computeTornadoBars, TornadoBar } from "@/lib/forecastMath";

interface TornadoChartProps {
  drivers: DriverValues;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDelta(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}$${Math.round(Math.abs(value)).toLocaleString()}M`;
}

// Shorten driver labels so they fit on the Y-axis
function shortLabel(label: string): string {
  const map: Record<string, string> = {
    "DTC Subscriber Growth": "DTC Sub Growth",
    "DTC ARPU Growth": "DTC ARPU",
    "Linear Networks Revenue Decline": "Linear Decline",
    "Entertainment Operating Margin": "Ent. Margin",
    "ESPN Affiliate/Subscription Revenue Growth": "ESPN Affiliate",
    "Sports Advertising Revenue Growth": "Sports Advertising",
    "Sports Rights & Programming Cost Growth": "Sports Rights Cost",
    "Sports Operating Margin": "Sports Margin",
    "Parks Attendance Growth": "Parks Attendance",
    "Per Capita Guest Spending Growth": "Per Capita Spend",
    "Cruise Line Capacity Growth": "Cruise Capacity",
    "Experiences Operating Margin": "Exp. Margin",
  };
  return map[label] ?? label;
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: TornadoBar & { upside: number; downside: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      className="rounded-lg shadow-lg p-3 text-xs"
      style={{
        backgroundColor: "var(--color-primary)",
        border: "1px solid var(--color-primary-hover)",
        color: "#ffffff",
        minWidth: 200,
      }}
    >
      <p className="font-semibold mb-2" style={{ color: "rgba(255,255,255,0.85)" }}>
        {d.driverLabel}
      </p>
      <div className="space-y-1">
        <div className="flex justify-between gap-6">
          <span style={{ color: "rgba(255,255,255,0.7)" }}>+10% scenario</span>
          <span
            className="font-semibold tabular-nums"
            style={{ color: d.upsideDelta >= 0 ? "#6EE7A0" : "#FCA5A5" }}
          >
            {fmtDelta(d.upsideDelta)}
          </span>
        </div>
        <div className="flex justify-between gap-6">
          <span style={{ color: "rgba(255,255,255,0.7)" }}>−10% scenario</span>
          <span
            className="font-semibold tabular-nums"
            style={{ color: d.downsideDelta >= 0 ? "#6EE7A0" : "#FCA5A5" }}
          >
            {fmtDelta(d.downsideDelta)}
          </span>
        </div>
        <div
          className="flex justify-between gap-6 pt-1 mt-1"
          style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}
        >
          <span style={{ color: "rgba(255,255,255,0.7)" }}>Total swing</span>
          <span className="font-semibold tabular-nums">
            ${Math.round(d.absSwing).toLocaleString()}M
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TornadoChart({ drivers }: TornadoChartProps) {
  const bars: TornadoBar[] = useMemo(
    () => computeTornadoBars(drivers),
    [drivers]
  );

  // Recharts horizontal bar needs data shaped as one row per driver.
  // We encode upside as a positive value and downside as a negative value,
  // both relative to zero (the "no change" baseline).
  const chartData = bars.map((b) => ({
    ...b,
    label: shortLabel(b.driverLabel),
    // Recharts reads these two keys for the two bars
    upside: b.upsideDelta,
    downside: b.downsideDelta,
  }));

  // Symmetric x-axis domain — pick the largest absolute value across all bars
  const maxAbs = Math.max(
    ...bars.flatMap((b) => [Math.abs(b.upsideDelta), Math.abs(b.downsideDelta)]),
    500 // minimum domain so chart isn't empty on reset
  );
  const domainPad = Math.ceil(maxAbs * 1.15 / 500) * 500; // round up to nearest 500
  const domain: [number, number] = [-domainPad, domainPad];

  const tickFormatter = (v: number) => {
    if (v === 0) return "$0";
    const sign = v > 0 ? "+" : "−";
    return `${sign}$${(Math.abs(v) / 1000).toFixed(1)}B`;
  };

  return (
    <div className="card p-0 overflow-hidden">
      {/* Card header */}
      <div
        className="px-6 py-3 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
          FY26 OI Sensitivity
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
          Impact on FY26 Total Segment OI of ±10% relative shift per driver · sorted by total swing
        </p>
      </div>

      <div className="px-2 pt-3 pb-2">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart
            layout="vertical"
            data={chartData}
            margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
            barCategoryGap="25%"
            barGap={2}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              horizontal={false}
            />
            <XAxis
              type="number"
              domain={domain}
              tickFormatter={tickFormatter}
              tick={{ fontSize: 10, fill: "var(--color-text-tertiary)" }}
              axisLine={{ stroke: "var(--color-border)" }}
              tickLine={false}
              tickCount={7}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={118}
              tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(0,0,0,0.03)" }}
            />

            {/* Zero reference line */}
            <ReferenceLine
              x={0}
              stroke="var(--color-border-strong)"
              strokeWidth={1.5}
            />

            {/* Upside bars — green when positive, red when negative */}
            <Bar dataKey="upside" name="Upside (+10%)" radius={[0, 2, 2, 0]} maxBarSize={12}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`upside-${index}`}
                  fill={
                    entry.upside >= 0
                      ? "var(--color-positive)"
                      : "var(--color-negative)"
                  }
                />
              ))}
            </Bar>

            {/* Downside bars — red when negative, green when positive */}
            <Bar dataKey="downside" name="Downside (−10%)" radius={[2, 0, 0, 2]} maxBarSize={12}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`downside-${index}`}
                  fill={
                    entry.downside <= 0
                      ? "var(--color-negative)"
                      : "var(--color-positive)"
                  }
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div
        className="px-6 py-2 border-t flex items-center gap-6"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center gap-1.5">
          <div
            className="rounded-sm"
            style={{ width: 12, height: 12, backgroundColor: "var(--color-positive)" }}
          />
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            OI increases (driver +10%)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="rounded-sm"
            style={{ width: 12, height: 12, backgroundColor: "var(--color-negative)" }}
          />
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            OI decreases (driver −10%)
          </span>
        </div>
        <span className="text-xs ml-auto" style={{ color: "var(--color-text-tertiary)" }}>
          ±10% relative to current driver values
        </span>
      </div>
    </div>
  );
}
