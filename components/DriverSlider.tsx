"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { DriverDefinition } from "@/lib/disneyData";

interface DriverSliderProps {
  driver: DriverDefinition;
  value: number;
  onChange: (id: string, value: number) => void;
  accentColor: string;
}

export default function DriverSlider({
  driver,
  value,
  onChange,
  accentColor,
}: DriverSliderProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);

  const isMargin = driver.unit === "margin";
  const isNegativeDriver = driver.id === "linearDecline";

  // Format the displayed value
  function formatValue(v: number): string {
    if (isMargin) return `${v.toFixed(1)}%`;
    const sign = v > 0 ? "+" : "";
    return `${sign}${v.toFixed(1)}%`;
  }

  // Color the value label: positive green, negative red, zero neutral
  function valueColor(v: number): string {
    if (isMargin) return "var(--color-text-primary)";
    if (v > 0) return "var(--color-positive)";
    if (v < 0) return "var(--color-negative)";
    return "var(--color-text-secondary)";
  }

  // Track fill percentage for the slider background
  const pct =
    ((value - driver.min) / (driver.max - driver.min)) * 100;

  return (
    <div className="mb-4 last:mb-0">
      {/* Label row */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1 min-w-0">
          <span
            className="text-xs leading-tight truncate"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {driver.label}
          </span>

          {/* Info tooltip */}
          <div className="relative flex-shrink-0">
            <button
              className="flex items-center justify-center rounded-full transition-colors"
              style={{ color: "var(--color-text-tertiary)", width: 16, height: 16 }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipAbove(rect.top > 160);
                setTooltipVisible(true);
              }}
              onMouseLeave={() => setTooltipVisible(false)}
              onFocus={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipAbove(rect.top > 160);
                setTooltipVisible(true);
              }}
              onBlur={() => setTooltipVisible(false)}
              aria-label={`Info: ${driver.label}`}
              tabIndex={0}
            >
              <Info size={12} />
            </button>

            {tooltipVisible && (
              <div
                className="absolute left-0 z-50 rounded-md p-2.5 shadow-lg text-xs leading-relaxed"
                style={{
                  width: 240,
                  backgroundColor: "var(--color-primary)",
                  color: "#ffffff",
                  border: "1px solid var(--color-primary-hover)",
                  ...(tooltipAbove
                    ? { bottom: "100%", marginBottom: 4 }
                    : { top: "100%", marginTop: 4 }),
                }}
              >
                {driver.description}
                {/* Arrow pointing toward the button */}
                <div
                  className="absolute left-2"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    ...(tooltipAbove
                      ? { top: "100%", borderTop: "5px solid var(--color-primary)" }
                      : { bottom: "100%", borderBottom: "5px solid var(--color-primary)" }),
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Current value — large, right-aligned */}
        <span
          className="text-sm font-semibold tabular-nums flex-shrink-0 ml-2"
          style={{ color: valueColor(value) }}
        >
          {formatValue(value)}
        </span>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={driver.min}
          max={driver.max}
          step={driver.step}
          value={value}
          onChange={(e) => onChange(driver.id, parseFloat(e.target.value))}
          className="w-full"
          style={{
            // Dynamic fill: color the track up to the thumb
            background: isNegativeDriver
              ? `linear-gradient(to right,
                  var(--color-border-strong) 0%,
                  var(--color-border-strong) ${pct}%,
                  ${accentColor} ${pct}%,
                  ${accentColor} 100%)`
              : `linear-gradient(to right,
                  ${accentColor} 0%,
                  ${accentColor} ${pct}%,
                  var(--color-border-strong) ${pct}%,
                  var(--color-border-strong) 100%)`,
          }}
          aria-label={driver.label}
          aria-valuemin={driver.min}
          aria-valuemax={driver.max}
          aria-valuenow={value}
        />
      </div>

      {/* Min/max range hint */}
      <div className="flex justify-between mt-0.5">
        <span className="text-xs" style={{ color: "var(--color-text-tertiary)", fontSize: 10 }}>
          {formatValue(driver.min)}
        </span>
        <span className="text-xs" style={{ color: "var(--color-text-tertiary)", fontSize: 10 }}>
          {formatValue(driver.max)}
        </span>
      </div>
    </div>
  );
}
