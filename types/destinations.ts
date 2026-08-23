export type DestinationSource = "flight" | "manual" | "road-trip";

export interface DestinationPlace {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  sources: DestinationSource[];
  firstVisit?: string;
  notes?: string;
}

export interface DestinationsFile {
  meta: {
    scopeNote: string;
  };
  places: DestinationPlace[];
}

export interface TripMapping {
  id: string;
  name: string;
  description?: string;
  /** Match flights via date|flightNumber keys. Omit or [] for non-flight trips. */
  flightKeys?: string[];
  /** Optional ordered destination place IDs for globe path (preferred when ≥2) */
  destinationIds?: string[];
  color?: string;
}
