import { promises as fs } from "fs";
import path from "path";
import type { DestinationsFile, TripMapping } from "@/types/destinations";
import type { DestinationPlace } from "@/types/destinations";
import type {
  AirportPoint,
  FlightDetail,
  FlightRecord,
  TripArc,
} from "@/types/travel";
import { distanceMiles, flightKey } from "./distance";

const DESTINATIONS_PATH = path.join(process.cwd(), "public/data/destinations.json");
const TRIP_MAPPINGS_PATH = path.join(process.cwd(), "public/data/trip-mappings.json");

export async function loadDestinationsFile(): Promise<DestinationsFile> {
  try {
    const raw = await fs.readFile(DESTINATIONS_PATH, "utf-8");
    return JSON.parse(raw) as DestinationsFile;
  } catch {
    return {
      meta: {
        scopeNote:
          "Destination markers reflect lifetime visits. Flight data and Pilot Mode cover logged flights from 2017 onward.",
      },
      places: [],
    };
  }
}

export async function loadTripMappings(): Promise<TripMapping[]> {
  try {
    const raw = await fs.readFile(TRIP_MAPPINGS_PATH, "utf-8");
    return JSON.parse(raw) as TripMapping[];
  } catch {
    return [];
  }
}

function cityFromAirportLabel(label: string): string {
  return label.split("/")[0]?.trim() ?? label;
}

export function seedDestinationsFromFlights(
  flights: FlightRecord[],
  points: AirportPoint[],
  existing: DestinationPlace[]
): DestinationPlace[] {
  const byId = new Map(existing.map((place) => [place.id, place]));

  for (const point of points) {
    const id = point.iata.toLowerCase();
    const existingPlace = byId.get(id);
    const flightDates = flights
      .filter((f) => f.fromIata === point.iata || f.toIata === point.iata)
      .map((f) => f.date)
      .sort();

    if (existingPlace) {
      if (!existingPlace.sources.includes("flight")) {
        existingPlace.sources.push("flight");
      }
      continue;
    }

    byId.set(id, {
      id,
      name: point.city,
      country: point.country ?? point.city,
      lat: point.lat,
      lng: point.lng,
      sources: ["flight"],
      firstVisit: flightDates[0]?.slice(0, 4),
    });
  }

  for (const flight of flights) {
    const destId = flight.toIata.toLowerCase();
    if (byId.has(destId)) continue;

    const destPoint = points.find((p) => p.iata === flight.toIata);
    if (!destPoint) continue;

    byId.set(destId, {
      id: destId,
      name: destPoint.city,
      country: destPoint.country ?? cityFromAirportLabel(flight.to),
      lat: destPoint.lat,
      lng: destPoint.lng,
      sources: ["flight"],
      firstVisit: flight.date.slice(0, 4),
    });
  }

  return Array.from(byId.values());
}

export function buildFlightDetails(
  flights: FlightRecord[],
  coords: Map<string, { lat: number; lng: number; name: string; city: string; country: string }>
): FlightDetail[] {
  const legGroups = new Map<string, FlightRecord[]>();

  for (const flight of flights) {
    const journeyKey = `${flight.date}|${flight.flightNumber}`;
    const group = legGroups.get(journeyKey) ?? [];
    group.push(flight);
    legGroups.set(journeyKey, group);
  }

  const details: FlightDetail[] = [];

  for (const [journeyKey, legs] of legGroups) {
    legs.forEach((flight, index) => {
      const from = coords.get(flight.fromIata);
      const to = coords.get(flight.toIata);
      if (!from || !to) return;

      details.push({
        ...flight,
        key: `${journeyKey}|leg${index + 1}`,
        miles: Math.round(distanceMiles(from.lat, from.lng, to.lat, to.lng)),
        startLat: from.lat,
        startLng: from.lng,
        endLat: to.lat,
        endLng: to.lng,
        legNumber: index + 1,
        totalLegs: legs.length,
        journeyKey,
        isMultiLeg: legs.length > 1,
      });
    });
  }

  return details.sort((a, b) => b.date.localeCompare(a.date));
}

export function expandFlightKeys(keys: string[], flights: FlightDetail[]): string[] {
  const flightByJourney = new Map<string, FlightDetail[]>();

  for (const flight of flights) {
    const group = flightByJourney.get(flight.journeyKey) ?? [];
    group.push(flight);
    flightByJourney.set(flight.journeyKey, group);
  }

  const expanded = new Set<string>();

  for (const key of keys) {
    if (key.includes("|leg")) {
      expanded.add(key);
      continue;
    }

    const matchingLegs = flightByJourney.get(key);
    if (matchingLegs?.length) {
      matchingLegs.forEach((leg) => expanded.add(leg.key));
    } else {
      expanded.add(key);
    }
  }

  return Array.from(expanded);
}

export function buildTripArcs(
  tripMappings: TripMapping[],
  flights: FlightDetail[],
  destinations: DestinationPlace[]
): TripArc[] {
  const destById = new Map(destinations.map((d) => [d.id, d]));
  const flightByKey = new Map(flights.map((f) => [f.key, f]));

  return tripMappings
    .map((trip) => {
      const expandedKeys = expandFlightKeys(trip.flightKeys ?? [], flights);
      const tripFlights = expandedKeys
        .map((key) => flightByKey.get(key))
        .filter((f): f is FlightDetail => Boolean(f));

      let coords: [number, number][] = [];

      const destCoords =
        trip.destinationIds
          ?.map((id) => destById.get(id))
          .filter((d): d is DestinationPlace => Boolean(d))
          .map((d) => [d.lat, d.lng] as [number, number]) ?? [];

      // Curated destination path wins when the author provided ≥2 places.
      if (destCoords.length >= 2) {
        coords = destCoords;
      } else if (tripFlights.length > 0) {
        const flightCoords: [number, number][] = [];
        const first = tripFlights[0];
        flightCoords.push([first.startLat, first.startLng]);
        tripFlights.forEach((f) => flightCoords.push([f.endLat, f.endLng]));
        coords = flightCoords;
      }

      if (coords.length < 2) return null;

      const [start] = coords;
      const end = coords[coords.length - 1];

      return {
        id: trip.id,
        name: trip.name,
        startLat: start[0],
        startLng: start[1],
        endLat: end[0],
        endLng: end[1],
        color: trip.color ?? "#2dd4bf",
        coords,
      } satisfies TripArc;
    })
    .filter((arc): arc is TripArc => arc !== null);
}

export function computePilotStats(flights: FlightDetail[]) {
  const aircraftCounts = new Map<string, number>();
  const airlines = new Set<string>();
  let totalMiles = 0;
  let earliest = flights[flights.length - 1]?.date ?? "2017";

  for (const flight of flights) {
    totalMiles += flight.miles;
    airlines.add(flight.airline);
    aircraftCounts.set(flight.aircraft, (aircraftCounts.get(flight.aircraft) ?? 0) + 1);
    if (flight.date < earliest) earliest = flight.date;
  }

  const topAircraft = Array.from(aircraftCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalMiles,
    uniqueAircraft: aircraftCounts.size,
    uniqueAirlines: airlines.size,
    dataSince: earliest.slice(0, 4),
    topAircraft,
  };
}
