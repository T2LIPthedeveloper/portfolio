"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plane } from "lucide-react";
import type { TravelManifest } from "@/types/travel";
import { BoundedList } from "@/components/ui/BoundedList";
import { cn } from "@/lib/utils";
import { TravelGlobe } from "./TravelGlobe";
import { PilotModePanel } from "./PilotModePanel";
import { usePilotMode } from "./PilotModeProvider";

interface TravelPageContentProps {
  data: TravelManifest;
}

const GLOBE_BOX =
  "w-full min-h-[280px] h-[min(42vh,420px)] lg:h-full lg:min-h-[360px]";

const TRAVEL_SCOPE_NOTE =
  "Markers show everywhere I've been. Flight stats cover logged trips since 2017.";

export function TravelPageContent({ data }: TravelPageContentProps) {
  const { isPilotMode, togglePilot } = usePilotMode();

  const mappedJourneys = [
    ...data.tripMappings.map((trip) => ({
      id: trip.id,
      name: trip.name,
      description: trip.description,
      kind: "flight" as const,
    })),
    ...data.roadTrips.map((trip) => ({
      id: trip.id,
      name: trip.name,
      description: trip.description,
      kind: "road" as const,
    })),
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-text-muted">
            Trips &amp; places
          </p>
          <h1 className="mt-2 font-display text-4xl text-text-primary md:text-5xl">Travel</h1>
          <p className="mt-2 max-w-2xl text-base text-text-secondary">{TRAVEL_SCOPE_NOTE}</p>
        </div>
        <button
          type="button"
          onClick={togglePilot}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-base font-medium transition-colors",
            isPilotMode
              ? "border-[#fbbf24]/40 bg-[#0f172a] text-[#fbbf24] hover:bg-[#1e293b]"
              : "border-border bg-surface text-text-primary hover:border-accent/40 hover:text-accent"
          )}
        >
          <Plane className="h-4 w-4" />
          {isPilotMode ? "Exit Pilot Mode" : "Pilot Mode"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isPilotMode ? (
          <motion.div
            key="pilot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between border-b border-border pb-2">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">
                Cockpit · flight legs
              </p>
              <span className="font-mono text-xs text-gold">LIVE</span>
            </div>
            <div className="grid items-stretch gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <TravelGlobe data={data} mode="pilot" className={GLOBE_BOX} />
              <div className={cn(GLOBE_BOX, "min-h-0 overflow-hidden")}>
                <PilotModePanel data={data} />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="destinations"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid items-stretch gap-5 lg:grid-cols-[1.2fr_1fr] lg:min-h-[360px]"
          >
            <TravelGlobe data={data} mode="destinations" className={GLOBE_BOX} />
            <aside className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
              <div className="grid shrink-0 grid-cols-2 gap-2">
                {[
                  ["Places", data.destinationStats.totalPlaces],
                  ["Countries", data.destinationStats.totalCountries],
                  ["Trips", data.destinationStats.totalTrips],
                  ["Road trips", data.roadTrips.length],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-border bg-surface p-3">
                    <p className="font-mono text-xs uppercase tracking-wider text-text-muted">
                      {label}
                    </p>
                    <p className="mt-1 font-display text-2xl text-text-primary md:text-3xl">{value}</p>
                  </div>
                ))}
              </div>
              <BoundedList
                title="Mapped journeys"
                items={mappedJourneys}
                getKey={(trip) => trip.id}
                className="min-h-0 shrink-0"
                renderItem={(trip) => (
                  <div className="rounded-lg border border-border px-3 py-2 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-text-primary">{trip.name}</p>
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                        {trip.kind === "road" ? "Road" : "Flight"}
                      </span>
                    </div>
                    {trip.description && (
                      <p className="mt-0.5 text-text-secondary">{trip.description}</p>
                    )}
                  </div>
                )}
              />
              <BoundedList
                title="Destinations"
                items={data.destinations}
                getKey={(place) => place.id}
                className="min-h-0 flex-1"
                renderItem={(place) => (
                  <div className="flex justify-between gap-2 py-1 text-sm">
                    <span className="text-text-primary">
                      {place.name}, {place.country}
                    </span>
                    <span className="shrink-0 font-mono text-xs uppercase text-text-muted">
                      {place.sources[0]}
                    </span>
                  </div>
                )}
              />
            </aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
