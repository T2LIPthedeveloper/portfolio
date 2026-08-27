"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { feature } from "topojson-client";
import type { GlobeMethods } from "react-globe.gl";
import type { FeatureCollection, Geometry } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { GlobeMode, TravelManifest } from "@/types/travel";
import { cn } from "@/lib/utils";
import { GlobeErrorBoundary } from "./GlobeErrorBoundary";

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-globe-base">
      <p className="font-mono text-xs uppercase tracking-widest text-text-muted">Loading map</p>
    </div>
  ),
});

const OCEAN_LIGHT = "/images/globe/ocean-light.png";
const OCEAN_DARK = "/images/globe/ocean-dark.png";

function canCreateWebGLContext() {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

function GlobeUnavailable() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-text-muted">Map unavailable</p>
      <p className="max-w-xs text-sm text-text-secondary">
        3D globe couldn&apos;t start on this device. Stats and trip lists below still work.
      </p>
    </div>
  );
}

interface TravelGlobeProps {
  data: TravelManifest;
  mode: GlobeMode;
  className?: string;
}

function useContainerSize() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setSize({ width: Math.round(width), height: Math.round(height) });
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { containerRef, size };
}

export function TravelGlobe({ data, mode, className }: TravelGlobeProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const { containerRef, size } = useContainerSize();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [countries, setCountries] = useState<object[]>([]);
  const [webglOk, setWebglOk] = useState(true);

  const isDark = resolvedTheme === "dark";
  const oceanUrl = isDark ? OCEAN_DARK : OCEAN_LIGHT;

  useEffect(() => {
    setMounted(true);
    setWebglOk(canCreateWebGLContext());
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/countries-110m.json")
      .then((res) => res.json())
      .then((world: Topology) => {
        if (cancelled) return;
        const collection = feature(
          world,
          world.objects.countries as GeometryCollection
        ) as FeatureCollection<Geometry>;
        setCountries(collection.features);
      })
      .catch(() => {
        if (!cancelled) setCountries([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const arcsData = useMemo(() => {
    if (mode === "destinations") return [];
    return data.arcs.map((arc) => ({ ...arc }));
  }, [data.arcs, mode]);

  const pilotArcAltitude = useCallback((arc: { startLat: number; endLat: number; startLng: number; endLng: number }) => {
    const span = Math.max(
      Math.abs(arc.endLat - arc.startLat),
      Math.abs(arc.endLng - arc.startLng)
    );
    return 0.08 + Math.min(0.32, span / 70);
  }, []);

  const pointsData = useMemo(() => {
    if (mode === "destinations") {
      return data.destinations.map((place) => ({
        lat: place.lat,
        lng: place.lng,
        name: place.name,
        country: place.country,
        size: 0.22,
        kind: "destination",
      }));
    }
    return data.points.map((point) => ({
      ...point,
      kind: "airport",
      size: Math.min(0.28, 0.08 + point.visitCount * 0.02),
    }));
  }, [data.destinations, data.points, mode]);

  const pathsData = useMemo(() => {
    if (mode !== "destinations") return [];
    return [
      ...data.tripArcs.map((trip) => ({ name: trip.name, coords: trip.coords, color: trip.color })),
      ...data.roadTrips.map((trip) => ({ name: trip.name, coords: trip.coords, color: "#b45309" })),
    ];
  }, [data.tripArcs, data.roadTrips, mode]);

  const ringsData = useMemo(() => {
    if (mode !== "destinations") return [];
    return data.destinations.map((place) => ({
      lat: place.lat,
      lng: place.lng,
      maxR: 2.5,
      propagationSpeed: 1.5,
      repeatPeriod: 1400,
    }));
  }, [data.destinations, mode]);

  const onGlobeReady = useCallback(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.pointOfView({ lat: 18, lng: 8, altitude: 2.4 }, 0);
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.25;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
  }, []);

  const ready = mounted && size.width > 0 && size.height > 0;

  return (
    <div
      ref={containerRef}
      data-cursor="zoom"
      className={cn(
        "relative h-full w-full min-h-[280px] overflow-hidden rounded-2xl border border-border bg-globe-base",
        className
      )}
    >
      {!ready ? (
        <div className="flex h-full w-full items-center justify-center">
          <p className="font-mono text-sm uppercase tracking-widest text-text-muted">Loading map</p>
        </div>
      ) : !webglOk ? (
        <GlobeUnavailable />
      ) : (
        <GlobeErrorBoundary fallback={<GlobeUnavailable />}>
          <Globe
            key={`${mode}-${isDark ? "dark" : "light"}`}
            ref={globeRef}
            width={size.width}
            height={size.height}
            globeImageUrl={oceanUrl}
            backgroundColor="rgba(0,0,0,0)"
            globeOffset={[0, 0]}
            animateIn={false}
            polygonsData={countries}
            polygonCapColor={() => (isDark ? "rgba(34, 211, 238, 0.08)" : "rgba(15, 118, 110, 0.1)")}
            polygonSideColor={() => "rgba(0,0,0,0)"}
            polygonStrokeColor={() => (isDark ? "#67e8f9" : "#0f766e")}
            polygonAltitude={0.004}
            arcsData={arcsData}
            arcColor={() =>
              mode === "pilot" ? ["#22d3ee", "#fbbf24"] : ["#2dd4bf", "#b45308cc"]
            }
            arcStroke={(arc) =>
              mode === "pilot"
                ? Math.max(0.65, Math.min(1.4, 0.45 + (arc as { count: number }).count * 0.12))
                : Math.min(0.8, 0.15 + (arc as { count: number }).count * 0.05)
            }
            arcAltitude={
              mode === "pilot"
                ? (arc: object) =>
                    pilotArcAltitude(
                      arc as { startLat: number; endLat: number; startLng: number; endLng: number }
                    )
                : 0.04
            }
            arcDashLength={mode === "pilot" ? 0.65 : 0.5}
            arcDashGap={mode === "pilot" ? 0.06 : 0.15}
            arcDashAnimateTime={mode === "pilot" ? 1600 : 2200}
            arcLabel={(arc: { fromIata?: string; toIata?: string }) =>
              mode === "pilot" && arc.fromIata && arc.toIata
                ? `${arc.fromIata} → ${arc.toIata}`
                : ""
            }
            pointsData={pointsData}
            pointLat="lat"
            pointLng="lng"
            pointAltitude={0.01}
            pointRadius="size"
            pointColor={(p: { kind?: string }) =>
              mode === "pilot"
                ? p.kind === "destination"
                  ? "#fbbf24"
                  : "#67e8f9"
                : p.kind === "destination"
                  ? "#f59e0b"
                  : "#22d3ee"
            }
            pointLabel={(p: { name?: string; iata?: string; country?: string }) =>
              mode === "destinations"
                ? p.country && p.country !== p.name
                  ? `${p.name}, ${p.country}`
                  : (p.name ?? "")
                : (p.iata ?? "")
            }
            pathsData={pathsData}
            pathPoints="coords"
            pathPointLat={(point: [number, number]) => point[0]}
            pathPointLng={(point: [number, number]) => point[1]}
            pathColor={(path: { color?: string }) => path.color ?? "#2dd4bf"}
            pathStroke={1.4}
            ringsData={ringsData}
            ringColor={() => "#f59e0b66"}
            ringMaxRadius="maxR"
            ringPropagationSpeed="propagationSpeed"
            ringRepeatPeriod="repeatPeriod"
            atmosphereColor={isDark ? "#22d3ee33" : "#0f766e44"}
            atmosphereAltitude={0.12}
            onGlobeReady={onGlobeReady}
          />
        </GlobeErrorBoundary>
      )}
    </div>
  );
}
