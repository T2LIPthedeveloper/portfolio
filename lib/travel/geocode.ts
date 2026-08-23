import { promises as fs } from "fs";
import path from "path";
import type { AirportRecord } from "@/types/travel";

const AIRPORTS_PATH = path.join(process.cwd(), "data/airports.json");
const CACHE_PATH = path.join(process.cwd(), "data/geocode-cache.json");

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "atulparida-portfolio/1.0";

type AirportDatabase = Record<string, AirportRecord>;
type GeocodeCache = Record<string, AirportRecord>;

async function loadJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function saveJson(filePath: string, data: unknown): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodeNominatim(query: string): Promise<AirportRecord | null> {
  const url = new URL(NOMINATIM_BASE);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!res.ok) return null;

  const results = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
  if (results.length === 0) return null;

  const [result] = results;
  const parts = result.display_name.split(",");

  return {
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
    name: parts[0]?.trim() ?? query,
    city: parts.slice(0, 2).join(",").trim(),
    country: parts.at(-1)?.trim() ?? "",
  };
}

export async function resolveAirport(
  iata: string,
  label: string,
  options: { useNominatim?: boolean; dryRun?: boolean } = {}
): Promise<AirportRecord | null> {
  const airports = await loadJson<AirportDatabase>(AIRPORTS_PATH, {});
  if (airports[iata]) return airports[iata];

  const cache = await loadJson<GeocodeCache>(CACHE_PATH, {});
  if (cache[iata]) return cache[iata];

  if (!options.useNominatim || options.dryRun) return null;

  await sleep(1100);
  const cityMatch = label.match(/^([^/]+)/);
  const query = cityMatch ? `${cityMatch[1].trim()} airport` : `${iata} airport`;
  const result = await geocodeNominatim(query);

  if (result) {
    cache[iata] = result;
    airports[iata] = result;
    await saveJson(CACHE_PATH, cache);
    await saveJson(AIRPORTS_PATH, airports);
  }

  return result;
}

export async function loadAirports(): Promise<AirportDatabase> {
  return loadJson<AirportDatabase>(AIRPORTS_PATH, {});
}

export async function geocodePlace(placeName: string): Promise<[number, number] | null> {
  const cache = await loadJson<GeocodeCache>(CACHE_PATH, {});
  if (cache[placeName]) {
    return [cache[placeName].lat, cache[placeName].lng];
  }

  await sleep(1100);
  const result = await geocodeNominatim(placeName);
  if (!result) return null;

  cache[placeName] = result;
  await saveJson(CACHE_PATH, cache);
  return [result.lat, result.lng];
}
