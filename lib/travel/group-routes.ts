import type { FlightArc, FlightRecord } from "@/types/travel";

export function groupRoutes(flights: FlightRecord[], coords: Map<string, { lat: number; lng: number; name: string; city: string; country: string }>): FlightArc[] {
  const routeMap = new Map<string, FlightArc>();

  for (const flight of flights) {
    const from = coords.get(flight.fromIata);
    const to = coords.get(flight.toIata);
    if (!from || !to) continue;

    const key = `${flight.fromIata}-${flight.toIata}`;
    const existing = routeMap.get(key);

    if (existing) {
      existing.count += 1;
      if (!existing.airlines.includes(flight.airline)) {
        existing.airlines.push(flight.airline);
      }
      existing.dates.push(flight.date);
    } else {
      routeMap.set(key, {
        startLat: from.lat,
        startLng: from.lng,
        endLat: to.lat,
        endLng: to.lng,
        count: 1,
        airlines: flight.airline ? [flight.airline] : [],
        dates: [flight.date],
        fromIata: flight.fromIata,
        toIata: flight.toIata,
      });
    }
  }

  return Array.from(routeMap.values());
}

export function buildAirportPoints(
  flights: FlightRecord[],
  coords: Map<string, { lat: number; lng: number; name: string; city: string; country: string }>
) {
  const visits = new Map<string, number>();

  for (const flight of flights) {
    visits.set(flight.fromIata, (visits.get(flight.fromIata) ?? 0) + 1);
    visits.set(flight.toIata, (visits.get(flight.toIata) ?? 0) + 1);
  }

  return Array.from(visits.entries())
    .map(([iata, visitCount]) => {
      const airport = coords.get(iata);
      if (!airport) return null;
      return {
        lat: airport.lat,
        lng: airport.lng,
        iata,
        name: airport.name,
        city: airport.city,
        country: airport.country,
        visitCount,
      };
    })
    .filter((point): point is NonNullable<typeof point> => point !== null);
}
