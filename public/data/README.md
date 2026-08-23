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

## Which file should I edit?

| Situation | File |
|---|---|
| Visited a city, no trip story | `destinations.json` |
| Flight-heavy vacation (many legs) | `trip-mappings.json` + keys from `flights.csv` |
| Named itinerary **without** flights (train/bus/ferry hops between cities you already logged as destinations) | `trip-mappings.json` with `destinationIds` only |
| Drive / road / rail route you want drawn as an ordered polyline | `road-trips.json` with `waypoints` |
| Always finish with | `npm run travel:import` |

## Source files (edit these)

| File | What it controls |
|---|---|
| `flights.csv` | Pilot Mode + flight arcs. Export from [my.flightradar24.com](https://my.flightradar24.com) and replace this file. |
| `destinations.json` | Lifetime destination markers (cities you’ve visited beyond the flight log). |
| `trip-mappings.json` | Named trips — flight-backed and/or destination-only itineraries. |
| `road-trips.json` | Ground polylines (many city waypoints). |

## Generated file (do not hand-edit)

| File | Notes |
|---|---|
| `travel-manifest.json` | Built by `npm run travel:import`. Globe/Pilot Mode read this at runtime. |

## Related files outside this folder

| File | Purpose |
|---|---|
| `data/airports.json` (repo root `data/`) | IATA → lat/lng/city/country lookup. Import CLI geocodes unknown codes and can append here. |
| `public/images/globe/` | Light/dark ocean textures for the globe. |

---

## Common edits

### Add a new flight

1. Re-export CSV from FlightRadar24 → overwrite `flights.csv`.
2. If a new airport IATA appears, the import CLI will try to geocode it into `data/airports.json` (use `--geocode` if needed).
3. Run `npm run travel:import`.

### Add a place you’ve visited (no flight log)

Add an entry to `destinations.json` under `places`:

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

---

## Trip mappings (`trip-mappings.json`)

Trips appear in Destinations view and can draw a path on the globe.

### Flight keys

Keys match rows in `flights.csv`:

```text
YYYY-MM-DD|FLIGHTNUM
```

Example: `2024-05-13|SQ24`.

If FlightRadar24 logged one flight number as multiple legs, a single key expands to all legs automatically.

### Multi-flight trip (many legs)

List every `date|flightNumber` for the vacation. Optionally set `destinationIds` (≥2) to draw a **curated city path** on the globe instead of every airport hop.

```json
{
  "id": "india-family-2023",
  "name": "India Family Circuit",
  "description": "Pune base with Delhi, Srinagar, and return — lots of short hops",
  "flightKeys": [
    "2023-12-20|AI854",
    "2023-12-21|AI827",
    "2023-12-23|6E201",
    "2023-12-24|6E882",
    "2023-12-26|AI826",
    "2023-12-26|AI853"
  ],
  "destinationIds": ["pnq", "del", "sxr"],
  "color": "#2dd4bf"
}
```

**Path rules:**

- If `destinationIds` has **≥2** known places → that ordered list is the globe path.
- Otherwise → path is derived from matched flights (origin of first leg, then each arrival).

### Non-flight trip (no flights)

Use this when you want a named itinerary on Destinations **without** Pilot Mode flight legs — e.g. train / bus / ferry between places already in `destinations.json`. Omit `flightKeys` (or use `[]`).

```json
{
  "id": "japan-rail-2019",
  "name": "Japan Rail Loop",
  "description": "Tokyo → Kyoto → Osaka → Hiroshima by shinkansen (no FR24 flights)",
  "destinationIds": ["tokyo", "kyoto", "osaka", "hiroshima"],
  "color": "#b45309"
}
```

Ensure each id exists in `destinations.json` (or was seeded from airports). Then run `npm run travel:import`.

**vs road trips:** use a trip-mapping when you care about the **named story + city markers**. Use `road-trips.json` when you want a **dense ground polyline** with many intermediate stops.

---

## Road trips (`road-trips.json`)

Draw ordered driving / overland routes. Prefer **named waypoints** when you cover many cities — easier to edit than raw lat/lng pairs.

- `lat` / `lng` are decimal degrees.
- Order = draw order on the globe (start → end).
- No hard limit on waypoint count; dozens of stops are fine.

### Example — long multi-city road trip

```json
[
  {
    "id": "pacific-coast-2022",
    "name": "Pacific Coast Highway",
    "description": "SF → LA coastal drive with inland detours",
    "waypoints": [
      { "name": "San Francisco", "lat": 37.7749, "lng": -122.4194 },
      { "name": "Santa Cruz", "lat": 36.9741, "lng": -122.0308 },
      { "name": "Monterey", "lat": 36.6002, "lng": -121.8947 },
      { "name": "Big Sur", "lat": 36.2704, "lng": -121.8081 },
      { "name": "San Luis Obispo", "lat": 35.2828, "lng": -120.6596 },
      { "name": "Santa Barbara", "lat": 34.4208, "lng": -119.6982 },
      { "name": "Ventura", "lat": 34.2746, "lng": -119.229 },
      { "name": "Malibu", "lat": 34.0259, "lng": -118.7798 },
      { "name": "Los Angeles", "lat": 34.0522, "lng": -118.2437 },
      { "name": "San Diego", "lat": 32.7157, "lng": -117.1611 }
    ]
  }
]
```

### Legacy format (still supported)

```json
{
  "id": "short-drive",
  "name": "Austin ↔ San Antonio",
  "path": [
    [30.2672, -97.7431],
    [29.4241, -98.4936]
  ]
}
```

If both `waypoints` and `path` exist, **waypoints win** when there are ≥2.

### Bootstrap with CLI (geocode city names)

```bash
npm run travel:import -- --road-trip "Pacific Coast Highway" --points \
  "San Francisco" "Santa Cruz" "Monterey" "Big Sur" \
  "San Luis Obispo" "Santa Barbara" "Los Angeles" "San Diego"
```

This appends a trip with named `waypoints`. Tweak coordinates in the JSON afterward for precision, then re-run `npm run travel:import`.

---

## Views reminder

| View | Scope |
|---|---|
| **Destinations** | Lifetime places + trip mappings + road trips |
| **Pilot Mode** | Aviation log from `flights.csv` (miles, aircraft types, airlines, arcs) |

After updating travel JSON/CSV, always run `npm run travel:import` then refresh the dev server.
