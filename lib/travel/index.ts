import { promises as fs } from "fs";
import path from "path";
import type { RoadTrip, RoadTripPath, TravelManifest } from "@/types/travel";
import { parseFlightsCsv } from "./parse-flights";
import { loadAirports, resolveAirport } from "./geocode";
import { buildAirportPoints, groupRoutes } from "./group-routes";
import {
  buildFlightDetails,
  buildTripArcs,
  computePilotStats,
  loadDestinationsFile,
  loadTripMappings,
  seedDestinationsFromFlights,
} from "./destinations";

const MANIFEST_PATH = path.join(process.cwd(), "public/data/travel-manifest.json");
const ROAD_TRIPS_PATH = path.join(process.cwd(), "public/data/road-trips.json");

async function loadRoadTrips(): Promise<RoadTripPath[]> {
  try {
    const raw = await fs.readFile(ROAD_TRIPS_PATH, "utf-8");
    const trips = JSON.parse(raw) as RoadTrip[];
    return trips
      .map((trip) => {
        const fromWaypoints =
          trip.waypoints?.map((point) => [point.lat, point.lng] as [number, number]) ?? [];
        const coords = fromWaypoints.length >= 2 ? fromWaypoints : (trip.path ?? []);
        if (coords.length < 2) return null;
        return {
          id: trip.id,
          name: trip.name,
          description: trip.description,
          coords,
        } satisfies RoadTripPath;
      })
      .filter((trip): trip is RoadTripPath => trip !== null);
  } catch {
    return [];
  }
}

export async function buildTravelManifest(options: {
  useNominatim?: boolean;
  dryRun?: boolean;
} = {}): Promise<TravelManifest> {
  const flights = await parseFlightsCsv();
  const airportsDb = await loadAirports();
  const destinationsFile = await loadDestinationsFile();
  const tripMappings = await loadTripMappings();
  const coords = new Map<string, { lat: number; lng: number; name: string; city: string; country: string }>();

  for (const flight of flights) {
    for (const [iata, label] of [
      [flight.fromIata, flight.from] as const,
      [flight.toIata, flight.to] as const,
    ]) {
      if (coords.has(iata)) continue;

      const staticAirport = airportsDb[iata];
      if (staticAirport) {
        coords.set(iata, { ...staticAirport, name: staticAirport.name });
        continue;
      }

      const resolved = await resolveAirport(iata, label, options);
      if (resolved) {
        coords.set(iata, resolved);
      }
    }
  }

  const flightDetails = buildFlightDetails(flights, coords);
  const arcs = groupRoutes(flights, coords);
  const points = buildAirportPoints(flights, coords);
  const roadTrips = await loadRoadTrips();
  const destinations = seedDestinationsFromFlights(
    flights,
    points,
    destinationsFile.places
  );
  const tripArcs = buildTripArcs(tripMappings, flightDetails, destinations);
  const pilotStats = computePilotStats(flightDetails);

  const countries = new Set(destinations.map((d) => d.country).filter(Boolean));

  return {
    generatedAt: new Date().toISOString(),
    scopeNote: destinationsFile.meta.scopeNote,
    stats: {
      totalFlights: flights.length,
      uniqueRoutes: arcs.length,
      uniqueAirports: points.length,
      countries: countries.size,
    },
    arcs,
    points,
    roadTrips,
    flights: flightDetails,
    destinations,
    tripMappings,
    tripArcs,
    pilotStats,
    destinationStats: {
      totalPlaces: destinations.length,
      totalCountries: countries.size,
      totalTrips: tripMappings.length + roadTrips.length,
      lifetimeScope: true,
    },
  };
}

export async function writeTravelManifest(
  options: { useNominatim?: boolean; dryRun?: boolean } = {}
): Promise<TravelManifest> {
  const manifest = await buildTravelManifest(options);

  if (!options.dryRun) {
    await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  }

  return manifest;
}

export async function getTravelData(): Promise<TravelManifest> {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, "utf-8");
    const parsed = JSON.parse(raw) as TravelManifest;
    if (parsed.flights && parsed.destinations) return parsed;
  } catch {
    // fall through to rebuild
  }
  return writeTravelManifest({ useNominatim: false });
}
