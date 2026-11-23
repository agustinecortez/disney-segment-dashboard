"use client";

import { useState } from "react";
import Header from "@/components/Header";
import MethodTabs, { Method } from "@/components/MethodTabs";
import DriverPanel from "@/components/DriverPanel";
import ForecastTable from "@/components/ForecastTable";
import NewForecastTable from "@/components/NewForecastTable";
import SegmentChart from "@/components/SegmentChart";
import TornadoChart from "@/components/TornadoChart";
import NarrativePanel from "@/components/NarrativePanel";
import AboutCard from "@/components/AboutCard";
import Footer from "@/components/Footer";
import { getDefaultDriverValues, DriverValues } from "@/lib/disneyData";

// Header text per method (docs/v3_spec.md section 2)
const HEADER: Record<Method, { title: string; badge: string }> = {
  old: {
    title: "Disney Segment Forecast Dashboard (Old Method)",
    badge: "DIS · FY25 and FY26 Actual + FY26 Forecast",
  },
  new: {
    title: "Disney Segment Forecast Dashboard (New Method)",
    badge: "DIS · FY25 and FY26 Actual (restated) + FY27–FY28 Forecast",
  },
};

export default function DashboardPage() {
  const [drivers, setDrivers] = useState<DriverValues>(getDefaultDriverValues);
  const [method, setMethod] = useState<Method>("new");
  const [aboutOpen, setAboutOpen] = useState(false);

  function handleDriverChange(id: string, value: number) {
    setDrivers((prev) => ({ ...prev, [id]: value }));
  }

  function handleReset() {
    setDrivers(getDefaultDriverValues());
  }

  const isNew = method === "new";

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Header
        title={HEADER[method].title}
        badge={HEADER[method].badge}
        showReset={isNew}
        onAboutOpen={() => setAboutOpen(true)}
        onReset={handleReset}
      />

      {/* ── Method tabs ─────────────────────────────────────────────────── */}
      <MethodTabs active={method} onChange={setMethod} />

      {/* ── Body ────────────────────────────────────────────────────────── */}
      {isNew ? (
        <div className="flex flex-1" style={{ minHeight: 0 }}>
          {/* Left rail — sticky, scrollable internally. Desktop only. */}
          <div className="hidden lg:flex lg:flex-col flex-shrink-0" style={{ width: 320 }}>
            <div className="sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
              <DriverPanel drivers={drivers} onChange={handleDriverChange} />
            </div>
          </div>

          {/* Main canvas — scrollable */}
          <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4" style={{ minWidth: 0 }}>
            <NewForecastTable drivers={drivers} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SegmentChart drivers={drivers} />
              <TornadoChart drivers={drivers} />
            </div>

            <NarrativePanel drivers={drivers} />

            {/* Mobile: driver panel stacks below charts */}
            <div className="lg:hidden card p-0 overflow-hidden">
              <DriverPanel drivers={drivers} onChange={handleDriverChange} />
            </div>
          </main>
        </div>
      ) : (
        <main className="flex-1 px-6 py-6 space-y-4" style={{ minWidth: 0 }}>
          <ForecastTable />
        </main>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <Footer />

      {/* ── About modal ─────────────────────────────────────────────────── */}
      <AboutCard isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
