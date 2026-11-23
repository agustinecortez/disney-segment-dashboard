// Shared building blocks for the Old Method and New Method Segment Forecast
// tables. Styling matches the v2.1 table (docs/v2_1_spec.md).

// ── Formatting helpers ────────────────────────────────────────────────────────

export function fmtM(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

export function fmtNeg(value: number): string {
  return `(${fmtM(Math.abs(value))})`;
}

export function fmtPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

function yoy(current: number, prior: number): number {
  if (prior === 0) return 0;
  return ((current - prior) / Math.abs(prior)) * 100;
}

export const RULE_LIGHT = "1px solid var(--color-border)";
export const RULE_SUBTOTAL = "1px solid var(--color-border-strong)";
export const RULE_TOTAL = "2px solid var(--color-border-strong)";

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
export function ColHeader({
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

// "Line Item" header cell
export function LineItemHeader() {
  return (
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
  );
}

// Row label cell
export function RowLabel({
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
      {/* Long line labels wrap on phones so the sticky label column stays
          ~200px wide, leaving room to swipe through the figures. */}
      <div className="max-w-[170px] whitespace-normal leading-snug lg:max-w-none lg:whitespace-nowrap">
        {label}
      </div>
    </td>
  );
}

// Data cell. Actual columns read muted; forecast columns keep the accent tint
// and primary text. A growth badge renders only when `prior` is set.
export function DataCell({
  isForecast,
  text,
  value,
  prior,
  bold,
  topBorder,
  muted,
}: {
  isForecast: boolean;
  text: string;
  value?: number;
  prior?: number;
  bold?: boolean;
  topBorder?: string;
  muted?: boolean;
}) {
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

// Segment sub-header row
export function SegmentHeaderRow({ label, color, colSpan }: { label: string; color: string; colSpan: number }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
        style={{
          color,
          backgroundColor: "var(--color-bg-subtle)",
          borderTop: RULE_LIGHT,
        }}
      >
        {label}
      </td>
    </tr>
  );
}

// Card header (title, subtitle, right-hand note)
export function TableCardHeader({ subtitle, note }: { subtitle: string; note: string }) {
  return (
    <div
      className="px-6 py-3 border-b flex items-center justify-between"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div>
        <p className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
          Segment Forecast
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
          {subtitle}
        </p>
      </div>
      <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
        {note}
      </p>
    </div>
  );
}

// Table footer note
export function TableFootnote({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-2 border-t" style={{ borderColor: "var(--color-border)" }}>
      <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
        {children}
      </p>
    </div>
  );
}

export const SEGMENT_COLORS = {
  entertainment: "var(--color-entertainment)",
  sports: "var(--color-sports)",
  experiences: "var(--color-experiences)",
} as const;
