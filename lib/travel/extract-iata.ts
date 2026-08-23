const IATA_REGEX = /\(([A-Z]{3})\/[A-Z]{4}\)/;

export function extractIata(airportString: string): string | null {
  const match = airportString.match(IATA_REGEX);
  return match ? match[1] : null;
}
