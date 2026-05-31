"use client";

// Placeholder — full implementation in Step 5.
// Renders a labeled left rail so the layout skeleton is visible.

import { DriverValues } from "@/lib/disneyData";

interface DriverPanelProps {
  drivers: DriverValues;
  onChange: (id: string, value: number) => void;
}

export default function DriverPanel({ drivers: _drivers, onChange: _onChange }: DriverPanelProps) {
  return (
    <aside
      className="shrink-0 border-r overflow-y-auto"
      style={{
        width: 320,
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-bg-card)",
      }}
    >
      <div className="p-4">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Scenario Drivers
        </p>

        {/* Segment placeholders */}
        {[
          { label: "Entertainment", color: "var(--color-entertainment)", drivers: 4 },
          { label: "Sports", color: "var(--color-sports)", drivers: 4 },
          { label: "Experiences", color: "var(--color-experiences)", drivers: 4 },
        ].map((seg) => (
          <div key={seg.label} className="mb-6">
            <div
              className="h-1 w-full rounded-full mb-3"
              style={{ backgroundColor: seg.color }}
            />
            <p className="font-semibold text-sm mb-3" style={{ color: "var(--color-text-primary)" }}>
              {seg.label}
            </p>
            {Array.from({ length: seg.drivers }).map((_, i) => (
              <div
                key={i}
                className="h-10 rounded mb-2"
                style={{ backgroundColor: "var(--color-bg-subtle)" }}
              />
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
