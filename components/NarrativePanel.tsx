"use client";

import { useMemo } from "react";
import { DriverValues } from "@/lib/disneyData";
import { computeNewForecast } from "@/lib/forecastMath";
import { classifyTone, fy27TotalGrowth, generateNarrative } from "@/lib/narrativeLogic";

interface NarrativePanelProps {
  drivers: DriverValues;
}

function Paragraph({ text }: { text: string }) {
  if (!text) return null;
  return (
    <p
      className="text-sm leading-relaxed"
      style={{ color: "var(--color-text-primary)" }}
    >
      {text}
    </p>
  );
}

export default function NarrativePanel({ drivers }: NarrativePanelProps) {
  const forecast = useMemo(() => computeNewForecast(drivers), [drivers]);
  const narrative = useMemo(
    () => generateNarrative(drivers, forecast),
    [drivers, forecast]
  );

  // Derive tone label and color for the scenario badge (FY27 Total Segment OI
  // growth vs. FY26 excluding the 53rd week — Disney's guidance basis)
  const fy27Growth = fy27TotalGrowth(forecast);
  const tone = classifyTone(fy27Growth);

  type ToneMeta = { label: string; bg: string; text: string; border: string };
  let toneMeta: ToneMeta;
  if (tone === "aggressive") {
    toneMeta = {
      label: "Aggressive scenario",
      bg: "#EFF8F3",
      text: "var(--color-positive)",
      border: "#BBE0CC",
    };
  } else if (tone === "in-line") {
    toneMeta = {
      label: "In-line with guidance",
      bg: "var(--color-accent-subtle)",
      text: "var(--color-accent)",
      border: "#E0C98A",
    };
  } else if (tone === "conservative") {
    toneMeta = {
      label: "Conservative scenario",
      bg: "#F4F4F0",
      text: "var(--color-text-secondary)",
      border: "var(--color-border-strong)",
    };
  } else {
    toneMeta = {
      label: "Stress scenario",
      bg: "#FDF2F2",
      text: "var(--color-negative)",
      border: "#F0BBBB",
    };
  }

  return (
    <div className="card p-0 overflow-hidden">
      {/* Card header */}
      <div
        className="px-6 py-3 border-b flex items-center justify-between"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div>
          <p
            className="font-semibold text-sm"
            style={{ color: "var(--color-text-primary)" }}
          >
            Scenario Briefing
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            FY27 against Disney&apos;s guidance · adapts as you adjust drivers
          </p>
        </div>

        {/* Scenario tone badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{
            backgroundColor: toneMeta.bg,
            color: toneMeta.text,
            border: `1px solid ${toneMeta.border}`,
          }}
        >
          {toneMeta.label}
          <span
            className="tabular-nums font-normal"
            style={{ color: toneMeta.text, opacity: 0.8 }}
          >
            FY27 SOI {fy27Growth >= 0 ? "+" : ""}{fy27Growth.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Narrative body */}
      <div className="px-6 py-5 space-y-4">
        <Paragraph text={narrative.headline} />
        <Paragraph text={narrative.segmentCallout} />
        <Paragraph text={narrative.riskWatch} />

        {/* Editorial frame — only shown when off-consensus */}
        {narrative.editorialFrame && (
          <div
            className="rounded-lg px-4 py-3 border-l-4"
            style={{
              backgroundColor: "var(--color-bg-subtle)",
              borderLeftColor: "var(--color-accent)",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--color-accent)" }}
            >
              Off-guidance note
            </p>
            <Paragraph text={narrative.editorialFrame} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-6 py-2.5 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          Narrative logic is rule-based, not AI-generated. It reflects driver values and outputs
          as of the current slider state. This is not investment advice.
        </p>
      </div>
    </div>
  );
}
