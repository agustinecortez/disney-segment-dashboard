"use client";

interface HeaderProps {
  title: string;
  badge: string;
  showReset: boolean;
  onAboutOpen: () => void;
  onReset: () => void;
}

export default function Header({ title, badge, showReset, onAboutOpen, onReset }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 w-full border-b flex items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:h-16 lg:py-0"
      style={{
        minHeight: 64,
        backgroundColor: "var(--color-primary)",
        borderColor: "var(--color-primary-hover)",
      }}
    >
      {/* Left — title. On phones the title wraps and the badge is hidden so
          the action buttons stay on screen. */}
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="font-semibold tracking-tight text-base leading-tight sm:text-xl"
          style={{ color: "#ffffff" }}
        >
          {title}
        </span>
        <span
          className="hidden md:inline text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap"
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          {badge}
        </span>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
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

        {showReset && (
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
        )}
      </div>
    </header>
  );
}
