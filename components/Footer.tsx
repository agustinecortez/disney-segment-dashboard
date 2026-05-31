import { DISNEY_CONFIG } from "@/lib/disneyData";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="w-full border-t"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-bg-subtle)",
      }}
    >
      {/* ── Primary disclosure row ─────────────────────────────────────── */}
      <div
        className="px-6 py-3 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p
          className="text-xs leading-relaxed"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {DISNEY_CONFIG.sourceDisclosure}
        </p>
      </div>

      {/* ── Attribution row ────────────────────────────────────────────── */}
      <div className="px-6 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Left — brand */}
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--color-text-secondary)" }}
          >
            AugieAI Execute
          </span>
          <span
            className="text-xs"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            · Project 3 · Disney Segment Forecast Dashboard
          </span>
          <span
            className="text-xs"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            · © {year}
          </span>
        </div>

        {/* Right — links */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/agustinecortez/disney-segment-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors"
            style={{ color: "var(--color-text-tertiary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--color-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--color-text-tertiary)")
            }
          >
            GitHub →
          </a>
          <a
            href="https://www.thewaltdisneycompany.com/investor-relations/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors"
            style={{ color: "var(--color-text-tertiary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--color-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--color-text-tertiary)")
            }
          >
            Disney IR →
          </a>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{
              backgroundColor: "var(--color-accent-subtle)",
              color: "var(--color-accent)",
              border: "1px solid #E0C98A",
            }}
          >
            Educational use only · Not investment advice
          </span>
        </div>
      </div>
    </footer>
  );
}
