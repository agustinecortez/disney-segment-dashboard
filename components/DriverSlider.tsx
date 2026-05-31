"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import { DriverDefinition } from "@/lib/disneyData";

interface DriverSliderProps {
  driver: DriverDefinition;
  value: number;
  onChange: (id: string, value: number) => void;
  accentColor: string;
}

const TOOLTIP_WIDTH  = 320;
const TOOLTIP_OFFSET = 10; // px gap between icon and tooltip edge

interface TooltipPos {
  top:  number;
  left: number;
}

/**
 * Compute the best (top, left) position for the tooltip given the anchor
 * rect and current viewport dimensions. Prefers opening to the RIGHT of the
 * icon; flips LEFT if that would overflow the viewport right edge. Prefers
 * opening BELOW the icon; flips UP if that would overflow the viewport bottom.
 */
function calcTooltipPos(anchorRect: DOMRect): TooltipPos {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Approximate tooltip height — we don't know it before render, use a
  // generous estimate (tooltip text is ~3-5 lines at 14px leading ~1.5 = ~90px)
  const estHeight = 120;

  // Horizontal: try right of icon first
  const rightPos = anchorRect.right + TOOLTIP_OFFSET;
  const leftPos  = anchorRect.left  - TOOLTIP_OFFSET - TOOLTIP_WIDTH;

  const left = rightPos + TOOLTIP_WIDTH <= vw - 8
    ? rightPos          // fits to the right
    : leftPos >= 8
      ? leftPos         // fits to the left
      : 8;              // last resort: pin to left edge with 8px margin

  // Vertical: align top of tooltip to the icon's vertical centre
  const anchorMidY = anchorRect.top + anchorRect.height / 2;
  let top = anchorMidY - estHeight / 2;

  // Clamp so tooltip doesn't overflow top or bottom
  top = Math.max(8, Math.min(top, vh - estHeight - 8));

  return { top, left };
}

// ── Portal tooltip ─────────────────────────────────────────────────────────────

interface PortalTooltipProps {
  text: string;
  anchorRect: DOMRect;
}

function PortalTooltip({ text, anchorRect }: PortalTooltipProps) {
  const [pos, setPos] = useState<TooltipPos>(() => calcTooltipPos(anchorRect));
  const ref = useRef<HTMLDivElement>(null);

  // Re-position once we know the real rendered height
  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const rightPos = anchorRect.right + TOOLTIP_OFFSET;
      const leftPos  = anchorRect.left  - TOOLTIP_OFFSET - rect.width;

      const left = rightPos + rect.width <= vw - 8
        ? rightPos
        : leftPos >= 8
          ? leftPos
          : 8;

      const anchorMidY = anchorRect.top + anchorRect.height / 2;
      let top = anchorMidY - rect.height / 2;
      top = Math.max(8, Math.min(top, vh - rect.height - 8));

      setPos({ top, left });
    }
  }, [anchorRect]);

  // Determine which side the tooltip opened on so we can draw the arrow
  const openedRight = pos.left >= anchorRect.right;

  return createPortal(
    <div
      ref={ref}
      role="tooltip"
      className="fixed rounded-md shadow-xl text-xs leading-relaxed"
      style={{
        top:             pos.top,
        left:            pos.left,
        width:           TOOLTIP_WIDTH,
        maxWidth:        `calc(100vw - 16px)`,
        zIndex:          9999,
        backgroundColor: "var(--color-primary)",
        color:           "#ffffff",
        border:          "1px solid var(--color-primary-hover)",
        padding:         "10px 12px",
        pointerEvents:   "none", // don't steal mouse events
      }}
    >
      {text}

      {/* Arrow pointing back toward the icon */}
      <div
        style={{
          position: "absolute",
          top:      "50%",
          transform: "translateY(-50%)",
          width:  0,
          height: 0,
          // Left tooltip → arrow points RIGHT (toward icon on the right)
          // Right tooltip → arrow points LEFT (toward icon on the left)
          ...(openedRight
            ? {
                left:        -5,
                borderTop:   "5px solid transparent",
                borderBottom:"5px solid transparent",
                borderRight: `5px solid var(--color-primary)`,
              }
            : {
                right:       -5,
                borderTop:   "5px solid transparent",
                borderBottom:"5px solid transparent",
                borderLeft:  `5px solid var(--color-primary)`,
              }),
        }}
      />
    </div>,
    document.body
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function DriverSlider({
  driver,
  value,
  onChange,
  accentColor,
}: DriverSliderProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [anchorRect,     setAnchorRect]     = useState<DOMRect | null>(null);
  const [isMounted,      setIsMounted]      = useState(false);

  // Ensure createPortal only runs client-side (Next.js SSR guard)
  useEffect(() => { setIsMounted(true); }, []);

  const showTooltip = useCallback((e: React.MouseEvent | React.FocusEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setAnchorRect(rect);
    setTooltipVisible(true);
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltipVisible(false);
    setAnchorRect(null);
  }, []);

  const isMargin         = driver.unit === "margin";
  const isNegativeDriver = driver.id   === "linearDecline";

  function formatValue(v: number): string {
    if (isMargin) return `${v.toFixed(1)}%`;
    const sign = v > 0 ? "+" : "";
    return `${sign}${v.toFixed(1)}%`;
  }

  function valueColor(v: number): string {
    if (isMargin) return "var(--color-text-primary)";
    if (v > 0)   return "var(--color-positive)";
    if (v < 0)   return "var(--color-negative)";
    return "var(--color-text-secondary)";
  }

  const pct = ((value - driver.min) / (driver.max - driver.min)) * 100;

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

          {/* Info icon — triggers portal tooltip */}
          <div className="relative flex-shrink-0">
            <button
              className="flex items-center justify-center rounded-full transition-colors"
              style={{ color: "var(--color-text-tertiary)", width: 16, height: 16 }}
              onMouseEnter={showTooltip}
              onMouseLeave={hideTooltip}
              onFocus={showTooltip}
              onBlur={hideTooltip}
              aria-label={`Info: ${driver.label}`}
              aria-describedby={tooltipVisible ? `tooltip-${driver.id}` : undefined}
              tabIndex={0}
            >
              <Info size={12} />
            </button>
          </div>
        </div>

        {/* Current value — right-aligned */}
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
        <span style={{ color: "var(--color-text-tertiary)", fontSize: 10 }}>
          {formatValue(driver.min)}
        </span>
        <span style={{ color: "var(--color-text-tertiary)", fontSize: 10 }}>
          {formatValue(driver.max)}
        </span>
      </div>

      {/* Portal tooltip — renders into document.body, escapes panel bounds */}
      {isMounted && tooltipVisible && anchorRect && (
        <PortalTooltip
          text={driver.description}
          anchorRect={anchorRect}
        />
      )}
    </div>
  );
}
