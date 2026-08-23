# Travel data — how to update your logs

This folder feeds the `/travel` globe and Pilot Mode. Edit the source files below, then regenerate the manifest.

## Quick workflow

1. Update the source files listed in the next section.
2. From the repo root, run:

```bash
npm run travel:import
```

3. Restart (or refresh) the Next.js dev server so it picks up `travel-manifest.json`.

Dry-run (no write):

```bash
npm run travel:import:dry
```

## Source files (edit these)

| File | What it controls |
|---|---|
| `flights.csv` | Pilot Mode + flight arcs. Export from [my.flightradar24.com](https://my.flightradar24.com) and replace this file. |
| `destinations.json` | Lifetime destination markers (cities you’ve visited beyond the flight log). |
| `trip-mappings.json` | Groups multi-leg trips for Destinations view (keys like `YYYY-MM-DD\|FLIGHTNUM`). |
| `road-trips.json` | Manual road-trip polylines (city waypoints). |

## Generated file (do not hand-edit)

| File | Notes |
|---|---|
| `travel-manifest.json` | Built by `npm run travel:import`. Globe/Pilot Mode read this at runtime. |

## Related files outside this folder

| File | Purpose |
|---|---|
| `data/airports.json` (repo root `data/`) | IATA → lat/lng/city/country lookup. Import CLI geocodes unknown codes and can append here. |
| `public/images/globe/` | Light/dark ocean textures for the globe. |

## Common edits

### Add a new flight
1. Re-export CSV from FlightRadar24 → overwrite `flights.csv`.
2. If a new airport IATA appears, the import CLI will try to geocode it into `data/airports.json`.
3. Run `npm run travel:import`.

### Add a place you’ve visited (no flight log)
Add an entry to `destinations.json`:

```json
{
  "id": "tokyo",
  "name": "Tokyo",
  "country": "Japan",
  "lat": 35.6762,
  "lng": 139.6503,
  "sources": ["manual"],
  "firstVisit": "2019",
  "notes": "Optional note"
}
```

Then run `npm run travel:import`.

### Group a multi-city trip
In `trip-mappings.json`, map flight keys to a shared trip name. Keys are `date|flightNumber` matching rows in `flights.csv`.

### Add a road trip
Append to `road-trips.json` with ordered city waypoints (`name`, `lat`, `lng`). Run import afterward.

## Views reminder

| View | Scope |
|---|---|
| **Destinations** | Lifetime places + mapped trips + road trips |
| **Pilot Mode** | Aviation log from `flights.csv` (miles, aircraft types, airlines, arcs) |
