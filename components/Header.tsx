"use client";

// Placeholder — full implementation in Step 10 (About modal wired up)
// This skeleton establishes the header slot in the layout.

interface HeaderProps {
  onAboutOpen: () => void;
  onReset: () => void;
}

export default function Header({ onAboutOpen, onReset }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 w-full border-b flex items-center justify-between px-6"
      style={{
        height: 64,
        backgroundColor: "var(--color-primary)",
        borderColor: "var(--color-primary-hover)",
      }}
    >
      {/* Left — title */}
      <div className="flex items-center gap-3">
        <span
          className="font-semibold tracking-tight"
          style={{ fontSize: 20, color: "#ffffff" }}
        >
          Disney Segment Forecast Dashboard
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded font-medium"
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          DIS · FY25–FY28E
        </span>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onAboutOpen}
          className="text-sm px-3 py-1.5 rounded transition-colors"
          style={{
            color: "rgba(255,255,255,0.85)",
            backgroundColor: "rgba(255,255,255,0.1)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")
          }
        >
          About
        </button>

        <a
          href="https://github.com/agustinecortez/disney-segment-dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm px-3 py-1.5 rounded transition-colors"
          style={{
            color: "rgba(255,255,255,0.85)",
            backgroundColor: "rgba(255,255,255,0.1)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")
          }
        >
          GitHub
        </a>

        <button
          onClick={onReset}
          className="text-sm px-3 py-1.5 rounded transition-colors font-medium"
          style={{
            color: "var(--color-primary)",
            backgroundColor: "#ffffff",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--color-accent-subtle)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#ffffff")
          }
        >
          Reset
        </button>
      </div>
    </header>
  );
}
