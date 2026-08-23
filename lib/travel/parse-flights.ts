import Papa from "papaparse";
import { promises as fs } from "fs";
import path from "path";
import { extractIata } from "./extract-iata";
import type { FlightRecord } from "@/types/travel";

export async function parseFlightsCsv(
  csvPath = path.join(process.cwd(), "public/data/flights.csv")
): Promise<FlightRecord[]> {
  const content = await fs.readFile(csvPath, "utf-8");
  const trimmed = content.replace(/^\uFEFF/, "").trim();

  const parsed = Papa.parse<Record<string, string>>(trimmed, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data
    .map((row) => {
      const from = row.From ?? "";
      const to = row.To ?? "";
      const fromIata = extractIata(from);
      const toIata = extractIata(to);

      if (!fromIata || !toIata) return null;

      return {
        date: row.Date ?? "",
        flightNumber: row["Flight number"] ?? "",
        from,
        to,
        fromIata,
        toIata,
        airline: row.Airline ?? "",
        aircraft: row.Aircraft ?? "Unknown",
        duration: row.Duration ?? "",
        note: row.Note ?? "",
      } satisfies FlightRecord;
    })
    .filter((record): record is FlightRecord => record !== null);
}
