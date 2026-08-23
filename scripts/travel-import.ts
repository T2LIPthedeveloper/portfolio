import { writeTravelManifest } from "../lib/travel/index";
import { geocodePlace } from "../lib/travel/geocode";
import { promises as fs } from "fs";
import path from "path";
import type { RoadTrip, RoadTripWaypoint } from "../types/travel";

const ROAD_TRIPS_PATH = path.join(process.cwd(), "public/data/road-trips.json");

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const useNominatim = args.includes("--geocode");
  const roadTripIndex = args.indexOf("--road-trip");
  const pointsIndex = args.indexOf("--points");

  if (roadTripIndex !== -1 && pointsIndex !== -1) {
    const name = args[roadTripIndex + 1];
    const placeNames = args.slice(pointsIndex + 1);

    if (!name || placeNames.length < 2) {
      console.error('Usage: --road-trip "Name" --points "City A" "City B" ...');
      process.exit(1);
    }

    const waypoints: RoadTripWaypoint[] = [];
    for (const place of placeNames) {
      const coord = await geocodePlace(place);
      if (!coord) {
        console.warn(`Could not geocode: ${place}`);
        continue;
      }
      waypoints.push({ name: place, lat: coord[0], lng: coord[1] });
    }

    if (waypoints.length >= 2 && !dryRun) {
      let trips: RoadTrip[] = [];
      try {
        trips = JSON.parse(await fs.readFile(ROAD_TRIPS_PATH, "utf-8")) as RoadTrip[];
      } catch {
        trips = [];
      }

      trips.push({
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        waypoints,
      });

      await fs.writeFile(ROAD_TRIPS_PATH, JSON.stringify(trips, null, 2));
      console.log(`Added road trip: ${name} (${waypoints.length} waypoints)`);
    }
  }

  const manifest = await writeTravelManifest({ useNominatim, dryRun });

  console.log("\nTravel import complete:");
  console.log(`  Flights:  ${manifest.stats.totalFlights}`);
  console.log(`  Routes:   ${manifest.stats.uniqueRoutes}`);
  console.log(`  Airports: ${manifest.stats.uniqueAirports}`);
  console.log(`  Road trips: ${manifest.roadTrips.length}`);

  if (dryRun) {
    console.log("\n(dry run — no files written)");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
