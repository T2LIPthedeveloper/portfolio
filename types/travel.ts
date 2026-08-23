import type { DestinationPlace, TripMapping } from "@/types/destinations";

export interface Airport {
  iata: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
}

export interface AirportRecord {
  lat: number;
  lng: number;
  name: string;
  city: string;
  country: string;
}

export interface FlightRecord {
  date: string;
  flightNumber: string;
  from: string;
  to: string;
  fromIata: string;
  toIata: string;
  airline: string;
  aircraft: string;
  duration: string;
  note: string;
}

export interface FlightDetail extends FlightRecord {
  key: string;
  miles: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  legNumber: number;
  totalLegs: number;
  journeyKey: string;
  isMultiLeg: boolean;
}

export interface FlightArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  count: number;
  airlines: string[];
  dates: string[];
  fromIata: string;
  toIata: string;
}

export interface AirportPoint {
  lat: number;
  lng: number;
  iata: string;
  name: string;
  city: string;
  country: string;
  visitCount: number;
}

export interface RoadTripWaypoint {
  name: string;
  lat: number;
  lng: number;
}

export interface RoadTrip {
  id: string;
  name: string;
  description?: string;
  /** Legacy raw polyline. Prefer `waypoints` for many cities. */
  path?: [number, number][];
  /** Named ordered stops — preferred authoring format. */
  waypoints?: RoadTripWaypoint[];
}

export interface RoadTripPath {
  id: string;
  name: string;
  description?: string;
  coords: [number, number][];
}

export interface TripArc {
  id: string;
  name: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  coords: [number, number][];
}

export interface PilotStats {
  totalMiles: number;
  uniqueAircraft: number;
  uniqueAirlines: number;
  dataSince: string;
  topAircraft: Array<{ type: string; count: number }>;
}

export interface DestinationStats {
  totalPlaces: number;
  totalCountries: number;
  totalTrips: number;
  lifetimeScope: boolean;
}

export interface TravelManifest {
  generatedAt: string;
  scopeNote: string;
  stats: {
    totalFlights: number;
    uniqueRoutes: number;
    uniqueAirports: number;
    countries: number;
  };
  arcs: FlightArc[];
  points: AirportPoint[];
  roadTrips: RoadTripPath[];
  flights: FlightDetail[];
  destinations: DestinationPlace[];
  tripMappings: TripMapping[];
  tripArcs: TripArc[];
  pilotStats: PilotStats;
  destinationStats: DestinationStats;
}

export type GlobeMode = "destinations" | "pilot";

export interface GlobeViewData {
  mode: GlobeMode;
  arcs: Array<FlightArc | TripArc>;
  points: Array<AirportPoint | DestinationPlace & { size?: number }>;
  paths: RoadTripPath[];
}
