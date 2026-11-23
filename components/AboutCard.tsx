"use client";

import { useEffect, useCallback } from "react";
import { X, ExternalLink, GitBranch } from "lucide-react";
import { DISNEY_CONFIG } from "@/lib/disneyData";

interface AboutCardProps {
  isOpen: boolean;
  onClose: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-wider mb-2"
      style={{ color: "var(--color-text-tertiary)" }}
    >
      {children}
    </p>
  );
}

function NoteSection({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-2 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
      <SectionLabel>{title}</SectionLabel>
      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-primary)" }}>
        {text}
      </p>
    </div>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li>
      <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
        {label}
      </span>{" "}
      {children}
    </li>
  );
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
              Disney Segment Forecast Dashboard · Omico Group
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

          {/* New Method note — how FY27–FY28 are built (docs/v3_spec.md). */}
          <NoteSection title="New Method (FY27–FY28)" text={DISNEY_CONFIG.newMethodNote} />

          {/* Old Method note — how the final (August 2026) FY26 forecast
              compared with Disney's reported FY26 results. */}
          <NoteSection title="Old Method: FY26 Forecast vs. Actual" text={DISNEY_CONFIG.methodologyNote} />

          {/* Data sourcing section */}
          <div
            className="mt-2 pt-4 border-t"
            style={{ borderColor: "var(--color-border)" }}
          >
            <SectionLabel>Data Sources</SectionLabel>
            <ul className="text-sm space-y-1.5" style={{ color: "var(--color-text-secondary)" }}>
              <Item label="FY25 Actuals:">Disney Q4 FY25 Earnings Press Release, filed November 13, 2025</Item>
              <Item label="FY25 10-K:">The Walt Disney Company Annual Report on Form 10-K, fiscal year ended September 27, 2025</Item>
              <Item label="Q1–Q3 FY26 Actuals:">Disney earnings releases filed February 2, May 6, and August 5, 2026 — evidence for the final FY26 forecast</Item>
              <Item label="FY26 Actuals:">Disney Q4 FY26 Earnings Release, filed November 17, 2026</Item>
              <Item label="FY26 10-K:">The Walt Disney Company Annual Report on Form 10-K, fiscal year ended October 3, 2026</Item>
              <Item label="Restated FY25–FY26 segments:">Disney Form 8-K supplemental segment information, November 17, 2026 (new segment structure)</Item>
              <Item label="FY27 guidance:">Disney Q4 FY26 Earnings Release and earnings call, November 17, 2026</Item>
              <Item label="Segment cost lines and equity income:">Segment information note in the FY25 and FY26 Forms 10-K (Old Method); Form 8-K supplemental segment information (New Method)</Item>
              <Item label="Driver evidence in tooltips:">Disney+ and Hulu U.S. price changes (September 2026), Fubo and Hulu + Live TV combination (October 29, 2025), Disney Cruise Line fleet announcements, Q4 FY26 earnings call</Item>
            </ul>
          </div>

          {/* Forecast assumptions section */}
          <div
            className="pt-3 border-t"
            style={{ borderColor: "var(--color-border)" }}
          >
            <SectionLabel>Key Forecast Assumptions — New Method (FY27–FY28)</SectionLabel>
            <ul className="text-sm space-y-1.5" style={{ color: "var(--color-text-secondary)" }}>
              <Item label="Guidance anchoring:">Revenue and cost drivers come from FY26 actuals and recent disclosures; the three margin drivers default to the low end of Disney&apos;s FY27 guidance for each segment.</Item>
              <Item label="53rd fiscal week:">Removed from the FY26 base before growth is applied, using Disney&apos;s segment estimates; the Consumer Products share of the Experiences estimate is moved to Entertainment (an estimate).</Item>
              <Item label="Cruise revenue:">Estimated at $4.5B in FY26 inside Experiences Domestic; Disney does not disclose it (a UK filing showed about $3.0B for FY25).</Item>
              <Item label="Content and IP; Sports other:">Content and IP revenue grows a fixed +5% a year; Sports other revenue is held flat.</Item>
              <Item label="Forecast cost lines and equity income:">Total Costs and Expenses is split across Disney&apos;s restated cost lines using FY26 shares; Sports equity income is held at the FY26 level.</Item>
              <Item label="Below-the-line:">Corporate costs, interest, India joint venture loss and minority interests at FY26 levels; acquisition amortization of about $1.2B and a 22% tax rate per Disney&apos;s FY27 guidance; no restructuring charges.</Item>
              <Item label="FX assumption:">Neutral (0% impact) across all segments.</Item>
            </ul>

            <div className="mt-3">
              <SectionLabel>Key Forecast Assumptions — Old Method (final FY26 forecast)</SectionLabel>
            </div>
            <ul className="text-sm space-y-1.5" style={{ color: "var(--color-text-secondary)" }}>
              <Item label="Below-the-line:">Fixed at the FY25 amount of ($5,147M) for the FY26 forecast — includes corporate costs, interest, tax, and minority interests. Actual columns show the amount as reported.</Item>
              <Item label="53rd fiscal week:">A +2% revenue benefit applied to FY26, reflecting Disney&apos;s fiscal calendar.</Item>
              <Item label="Forecast cost lines and equity income:">The forecast total Costs and Expenses is split across Disney&apos;s reported cost lines using their FY25 shares, and equity income from investees is held at the FY25 level.</Item>
              <Item label="Content & Consumer Products growth:">Hardcoded at +5% and +3% respectively.</Item>
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
              Omico Group
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
