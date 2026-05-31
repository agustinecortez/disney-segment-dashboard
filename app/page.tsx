"use client";

import { useState } from "react";
import Header from "@/components/Header";
import DriverPanel from "@/components/DriverPanel";
import ForecastTable from "@/components/ForecastTable";
import SegmentChart from "@/components/SegmentChart";
import Footer from "@/components/Footer";
import { getDefaultDriverValues, DriverValues } from "@/lib/disneyData";

export default function DashboardPage() {
  const [drivers, setDrivers] = useState<DriverValues>(getDefaultDriverValues);
  const [aboutOpen, setAboutOpen] = useState(false);

  function handleDriverChange(id: string, value: number) {
    setDrivers((prev) => ({ ...prev, [id]: value }));
  }

  function handleReset() {
    setDrivers(getDefaultDriverValues());
  }

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Header onAboutOpen={() => setAboutOpen(true)} onReset={handleReset} />

      {/* ── Body: driver rail + main canvas ─────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left rail — sticky, scrollable internally. Desktop only. */}
        <div className="hidden lg:flex lg:flex-col" style={{ width: 320, minWidth: 320 }}>
          <div className="sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
            <DriverPanel drivers={drivers} onChange={handleDriverChange} />
          </div>
        </div>

        {/* Main canvas — scrollable */}
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4">

          {/* Forecast Table */}
          <ForecastTable drivers={drivers} />

          {/* Charts row placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SegmentChart drivers={drivers} />

            <div className="card">
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                FY26 OI Sensitivity
              </p>
              <div
                className="h-64 rounded flex items-center justify-center text-sm"
                style={{
                  backgroundColor: "var(--color-bg-subtle)",
                  color: "var(--color-text-tertiary)",
                }}
              >
                Tornado Chart — Step 8
              </div>
            </div>
          </div>

          {/* Narrative placeholder */}
          <div className="card">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Scenario Briefing
            </p>
            <div
              className="h-32 rounded flex items-center justify-center text-sm"
              style={{
                backgroundColor: "var(--color-bg-subtle)",
                color: "var(--color-text-tertiary)",
              }}
            >
              Narrative Panel — Step 9
            </div>
          </div>

          {/* Mobile: driver panel stacks below charts */}
          <div className="lg:hidden">
            <DriverPanel drivers={drivers} onChange={handleDriverChange} />
          </div>

        </main>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <Footer />

      {/* ── About modal stub — full implementation Step 10 ─────────────── */}
      {aboutOpen && (
        <div className="modal-backdrop" onClick={() => setAboutOpen(false)}>
          <div className="card w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold text-base mb-2" style={{ color: "var(--color-text-primary)" }}>
              About this dashboard
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Full About card — Step 10
            </p>
            <button
              className="mt-4 text-sm font-medium"
              style={{ color: "var(--color-primary)" }}
              onClick={() => setAboutOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
