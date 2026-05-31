"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DISNEY_CONFIG, DriverValues, SegmentBaseline } from "@/lib/disneyData";
import DriverSlider from "./DriverSlider";

interface DriverPanelProps {
  drivers: DriverValues;
  onChange: (id: string, value: number) => void;
}

const SEGMENT_COLORS: Record<string, string> = {
  entertainment: "var(--color-entertainment)",
  sports: "var(--color-sports)",
  experiences: "var(--color-experiences)",
};

function SegmentSection({
  segment,
  drivers,
  onChange,
}: {
  segment: SegmentBaseline;
  drivers: DriverValues;
  onChange: (id: string, value: number) => void;
}) {
  const [open, setOpen] = useState(true);
  const accentColor = SEGMENT_COLORS[segment.key];

  return (
    <div className="mb-2">
      {/* Section header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 transition-colors"
        style={{
          borderLeft: `3px solid ${accentColor}`,
          backgroundColor: open ? "var(--color-bg-subtle)" : "transparent",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--color-bg-subtle)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = open
            ? "var(--color-bg-subtle)"
            : "transparent")
        }
        aria-expanded={open}
      >
        <span
          className="text-sm font-semibold"
          style={{ color: accentColor }}
        >
          {segment.name}
        </span>
        <span style={{ color: "var(--color-text-tertiary)" }}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>

      {/* Sliders */}
      {open && (
        <div className="px-4 pt-3 pb-1">
          {segment.drivers.map((driver) => (
            <DriverSlider
              key={driver.id}
              driver={driver}
              value={drivers[driver.id]}
              onChange={onChange}
              accentColor={accentColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DriverPanel({ drivers, onChange }: DriverPanelProps) {
  return (
    <aside
      className="h-full border-r flex flex-col"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-bg-card)",
      }}
    >
      {/* Panel header */}
      <div
        className="px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Scenario Drivers
        </p>
        <p
          className="text-xs mt-0.5"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          12 drivers · 3 segments
        </p>
      </div>

      {/* Segments */}
      <div className="flex-1 overflow-y-auto py-2">
        {DISNEY_CONFIG.segments.map((segment) => (
          <SegmentSection
            key={segment.key}
            segment={segment}
            drivers={drivers}
            onChange={onChange}
          />
        ))}
      </div>

      {/* Footer hint */}
      <div
        className="px-4 py-2.5 border-t flex-shrink-0"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p
          className="text-xs leading-relaxed"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Adjust sliders to model scenarios. Outputs update in real time.
        </p>
      </div>
    </aside>
  );
}
