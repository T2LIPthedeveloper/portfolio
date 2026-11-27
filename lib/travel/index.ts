import { promises as fs } from "fs";
import path from "path";
import { unstable_cache } from "next/cache";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";
import type {
  RoadTrip,
  RoadTripPath,
  TravelDestinationsData,
  TravelManifest,
  TravelPilotData,
} from "@/types/travel";
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

const DATA_DIR = path.join(process.cwd(), "public/data");
const MANIFEST_PATH = path.join(DATA_DIR, "travel-manifest.json");
const DESTINATIONS_PATH = path.join(DATA_DIR, "travel-destinations.json");
const PILOT_PATH = path.join(DATA_DIR, "travel-pilot.json");
const COUNTRIES_TOPO_PATH = path.join(DATA_DIR, "countries-110m.json");
const COUNTRIES_GEO_PATH = path.join(DATA_DIR, "countries-110m.geojson");
const ROAD_TRIPS_PATH = path.join(DATA_DIR, "road-trips.json");

async function loadRoadTrips(): Promise<RoadTripPath[]> {
  try {
    const raw = await fs.readFile(ROAD_TRIPS_PATH, "utf-8");
    const trips = JSON.parse(raw) as RoadTrip[];
    const paths: RoadTripPath[] = [];

    for (const trip of trips) {
      const fromWaypoints =
        trip.waypoints?.map((point) => [point.lat, point.lng] as [number, number]) ?? [];
      const coords = fromWaypoints.length >= 2 ? fromWaypoints : (trip.path ?? []);
      if (coords.length < 2) continue;
      paths.push({
        id: trip.id,
        name: trip.name,
        description: trip.description,
        coords,
      });
    }

    return paths;
  } catch {
    return [];
  }
}

function toDestinationsData(manifest: TravelManifest): TravelDestinationsData {
  return {
    generatedAt: manifest.generatedAt,
    scopeNote: manifest.scopeNote,
    destinations: manifest.destinations,
    tripMappings: manifest.tripMappings,
    tripArcs: manifest.tripArcs,
    roadTrips: manifest.roadTrips,
    destinationStats: manifest.destinationStats,
  };
}

function toPilotData(manifest: TravelManifest): TravelPilotData {
  return {
    arcs: manifest.arcs,
    points: manifest.points,
    flights: manifest.flights,
    pilotStats: manifest.pilotStats,
    stats: manifest.stats,
  };
}

function roundCoord(n: number) {
  return Math.round(n * 100) / 100;
}

function quantizeCoords(coords: unknown): unknown {
  if (!Array.isArray(coords)) return coords;
  if (typeof coords[0] === "number") {
    return [roundCoord(coords[0] as number), roundCoord(coords[1] as number)];
  }
  return coords.map(quantizeCoords);
}

/** Precompute TopoJSON → quantized GeoJSON so the browser never loads topojson-client. */
async function writeCountriesGeoJson(): Promise<void> {
  try {
    const raw = await fs.readFile(COUNTRIES_TOPO_PATH, "utf-8");
    const world = JSON.parse(raw) as Topology;
    const collection = feature(
      world,
      world.objects.countries as GeometryCollection
    ) as FeatureCollection<Geometry>;
    const slim = {
      type: "FeatureCollection" as const,
      features: collection.features
        .filter((f): f is typeof f & { geometry: Geometry } => Boolean(f.geometry))
        .map((f) => ({
          type: "Feature" as const,
          properties: {},
          geometry: {
            ...f.geometry,
            coordinates: quantizeCoords(
              "coordinates" in f.geometry ? f.geometry.coordinates : []
            ),
          },
        })),
    };
    await fs.writeFile(COUNTRIES_GEO_PATH, JSON.stringify(slim));
  } catch (error) {
    console.warn("Could not precompute countries GeoJSON:", error);
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
    await fs.writeFile(DESTINATIONS_PATH, JSON.stringify(toDestinationsData(manifest), null, 2));
    await fs.writeFile(PILOT_PATH, JSON.stringify(toPilotData(manifest), null, 2));
    await writeCountriesGeoJson();
  }

  return manifest;
}

async function readTravelManifest(): Promise<TravelManifest> {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, "utf-8");
    const parsed = JSON.parse(raw) as TravelManifest;
    if (parsed.flights && parsed.destinations) return parsed;
  } catch {
    // fall through to rebuild
  }
  return writeTravelManifest({ useNominatim: false });
}

export async function getTravelData(): Promise<TravelManifest> {
  return unstable_cache(readTravelManifest, ["travel-manifest"], {
    revalidate: 3600,
    tags: ["travel"],
  })();
}

async function readTravelDestinations(): Promise<TravelDestinationsData> {
  try {
    const raw = await fs.readFile(DESTINATIONS_PATH, "utf-8");
    return JSON.parse(raw) as TravelDestinationsData;
  } catch {
    const manifest = await readTravelManifest();
    const destinations = toDestinationsData(manifest);
    await fs.writeFile(DESTINATIONS_PATH, JSON.stringify(destinations, null, 2)).catch(() => undefined);
    return destinations;
  }
}

export async function getTravelDestinationsData(): Promise<TravelDestinationsData> {
  return unstable_cache(readTravelDestinations, ["travel-destinations"], {
    revalidate: 3600,
    tags: ["travel"],
  })();
}
