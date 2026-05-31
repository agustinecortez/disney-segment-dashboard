"use client";

import { useEffect, useCallback } from "react";
import { X, ExternalLink, GitBranch } from "lucide-react";
import { DISNEY_CONFIG } from "@/lib/disneyData";

interface AboutCardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutCard({ isOpen, onClose }: AboutCardProps) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll while modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  // Split aboutText into paragraphs on sentence boundaries for readability
  const paragraphs = DISNEY_CONFIG.aboutText
    .split(/(?<=\.) (?=[A-Z])/)
    .reduce<string[]>((acc, sentence) => {
      // Group into ~2-sentence paragraphs
      if (acc.length === 0 || acc[acc.length - 1].split(". ").length >= 2) {
        acc.push(sentence);
      } else {
        acc[acc.length - 1] += " " + sentence;
      }
      return acc;
    }, []);

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
    >
      <div
        className="w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: "var(--color-bg-card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-primary)",
          }}
        >
          <div>
            <h2
              id="about-modal-title"
              className="font-semibold text-base"
              style={{ color: "#ffffff" }}
            >
              About this dashboard
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
              Disney Segment Forecast Dashboard · AugieAI Execute
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full transition-colors"
            style={{
              width: 32,
              height: 32,
              color: "rgba(255,255,255,0.75)",
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")
            }
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {/* Credibility banner */}
          <div
            className="rounded-lg px-4 py-3 border-l-4"
            style={{
              backgroundColor: "var(--color-accent-subtle)",
              borderLeftColor: "var(--color-accent)",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: "var(--color-accent)" }}
            >
              Methodology Demonstration
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>
              This tool demonstrates driver-based segment forecasting as a methodology.
              It is not investment advice and does not represent Disney's internal projections.
            </p>
          </div>

          {/* About text paragraphs */}
          {paragraphs.map((para, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-primary)" }}
            >
              {para}
            </p>
          ))}

          {/* Data sourcing section */}
          <div
            className="mt-2 pt-4 border-t"
            style={{ borderColor: "var(--color-border)" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Data Sources
            </p>
            <ul
              className="text-sm space-y-1.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <li>
                <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                  FY25 Actuals:
                </span>{" "}
                Disney Q4 FY25 Earnings Press Release, filed November 13, 2025
              </li>
              <li>
                <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                  FY25 10-K:
                </span>{" "}
                The Walt Disney Company Annual Report on Form 10-K, fiscal year ended September 27, 2025
              </li>
              <li>
                <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                  Line-of-business splits:
                </span>{" "}
                Derived from management commentary and analyst estimates where Disney does not separately disclose (e.g., cruise line revenue)
              </li>
              <li>
                <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                  Peer references in tooltips:
                </span>{" "}
                Publicly reported subscriber and pricing data for Netflix, Max, Paramount+ as of calendar 2025
              </li>
            </ul>
          </div>

          {/* Forecast assumptions section */}
          <div
            className="pt-3 border-t"
            style={{ borderColor: "var(--color-border)" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Key Forecast Assumptions
            </p>
            <ul
              className="text-sm space-y-1.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <li>
                <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                  Below-the-line:
                </span>{" "}
                Fixed at ($5,147M) for all forecast years — includes corporate costs, interest, tax, and minority interests. This simplification avoids modeling tax rate variation, which adds complexity without proportional value.
              </li>
              <li>
                <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                  FX assumption:
                </span>{" "}
                Neutral (0% impact) across all segments and years, per management commentary.
              </li>
              <li>
                <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                  53rd fiscal week:
                </span>{" "}
                A +2% revenue benefit applied to FY26 only, reflecting Disney's fiscal calendar. Not applicable to FY27 or FY28.
              </li>
              <li>
                <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                  Content & Consumer Products growth:
                </span>{" "}
                Hardcoded at +5% and +3% respectively — not exposed as user drivers, as these lines are less sensitive to near-term operational decisions.
              </li>
            </ul>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-6 py-3 border-t"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-bg-subtle)",
          }}
        >
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            Built by{" "}
            <span className="font-semibold" style={{ color: "var(--color-text-secondary)" }}>
              AugieAI Execute
            </span>
            {" "}· Educational and methodology demonstration purposes only
          </p>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/agustinecortez/disney-segment-dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors font-medium"
              style={{
                color: "var(--color-text-secondary)",
                backgroundColor: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "var(--color-border-strong)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--color-border)")
              }
            >
              <GitBranch size={13} />
              View on GitHub
            </a>

            <a
              href="https://www.thewaltdisneycompany.com/investor-relations/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors font-medium"
              style={{
                color: "var(--color-primary)",
                backgroundColor: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "var(--color-border-strong)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--color-border)")
              }
            >
              <ExternalLink size={13} />
              Disney IR
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
