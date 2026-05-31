"use client";

import { useState } from "react";
import Header from "@/components/Header";
import DriverPanel from "@/components/DriverPanel";
import ForecastTable from "@/components/ForecastTable";
import SegmentChart from "@/components/SegmentChart";
import TornadoChart from "@/components/TornadoChart";
import NarrativePanel from "@/components/NarrativePanel";
import AboutCard from "@/components/AboutCard";
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

            <TornadoChart drivers={drivers} />
          </div>

          {/* Narrative Panel */}
          <NarrativePanel drivers={drivers} />

          {/* Mobile: driver panel stacks below charts */}
          <div className="lg:hidden">
            <DriverPanel drivers={drivers} onChange={handleDriverChange} />
          </div>

        </main>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <Footer />

      {/* ── About modal ─────────────────────────────────────────────────── */}
      <AboutCard isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
