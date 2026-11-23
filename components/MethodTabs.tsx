"use client";

export type Method = "old" | "new";

interface MethodTabsProps {
  active: Method;
  onChange: (method: Method) => void;
}

const TABS: { key: Method; label: string }[] = [
  { key: "old", label: "Old Method" },
  { key: "new", label: "New Method" },
];

/**
 * Method tabs — Old Method / New Method (docs/v3_spec.md section 2). Styled
 * after the NBCU dashboard's segment tabs, but each tab selects a forecasting
 * method rather than a segment. Switching tabs never resets driver values.
 */
export default function MethodTabs({ active, onChange }: MethodTabsProps) {
  return (
    <div
      className="flex gap-1 px-6 pt-3 border-b overflow-x-auto"
      style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
      role="tablist"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className="px-4 py-2.5 text-sm font-semibold rounded-t-md transition-colors flex-shrink-0"
            style={{
              color: isActive ? "var(--color-primary)" : "var(--color-text-tertiary)",
              borderBottom: isActive ? "2px solid var(--color-primary)" : "2px solid transparent",
              backgroundColor: isActive ? "var(--color-bg-subtle)" : "transparent",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
