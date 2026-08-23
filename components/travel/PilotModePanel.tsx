"use client";

import type { TravelManifest } from "@/types/travel";
import { BoundedList } from "@/components/ui/BoundedList";
import { SolariBoard } from "./SolariBoard";

interface PilotModePanelProps {
  data: TravelManifest;
}

export function PilotModePanel({ data }: PilotModePanelProps) {
  const { pilotStats, flights } = data;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <div className="shrink-0 rounded-xl border border-border bg-surface p-3">
        <div className="grid grid-cols-2 gap-3">
          <SolariBoard label="Miles" value={pilotStats.totalMiles} pad={6} compact />
          <SolariBoard label="Flights" value={data.stats.totalFlights} pad={2} compact />
          <SolariBoard label="Aircraft Types" value={pilotStats.uniqueAircraft} pad={2} compact />
          <SolariBoard label="Airlines" value={pilotStats.uniqueAirlines} pad={2} compact />
        </div>
      </div>

      <div className="shrink-0 rounded-xl border border-border bg-surface px-3 py-2.5">
        <p className="font-mono text-xs uppercase tracking-wider text-text-muted">Fleet mix</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {pilotStats.topAircraft.slice(0, 5).map((item) => (
            <span
              key={item.type}
              className="rounded border border-border bg-surface-muted px-2 py-1 font-mono text-xs text-text-secondary"
            >
              {item.type.split("(")[0]?.trim()} · {item.count}×
            </span>
          ))}
        </div>
      </div>

      <BoundedList
        title="Flight log"
        items={flights}
        getKey={(flight) => flight.key}
        className="min-h-0 flex-1 border-border bg-surface"
        rows={4}
        renderItem={(flight) => (
          <div className="rounded-md border border-border bg-surface-muted px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold text-accent">
                {flight.flightNumber}
                {flight.isMultiLeg && (
                  <span className="ml-1 text-xs text-gold">
                    L{flight.legNumber}/{flight.totalLegs}
                  </span>
                )}
              </span>
              <span className="font-mono text-xs text-text-muted">{flight.date}</span>
            </div>
            <p className="mt-0.5 font-mono text-xs text-text-secondary">
              {flight.fromIata} → {flight.toIata} · {flight.miles.toLocaleString()} mi
            </p>
          </div>
        )}
      />
    </div>
  );
}
