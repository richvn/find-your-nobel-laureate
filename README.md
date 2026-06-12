# Find your Nobel Laureate

A web application to find Science Nobel laureates based on their birth city or their institutional affiliation at the time of their award.

## How it works

### Data Pipeline
- **Script**: `data/fetch_laureates.mts`
- **Source**: Official Nobel Prize API (v2.1).
- **Process**: 
  1. Fetches all laureates via pagination.
  2. Filters for "Science" categories (Physics, Chemistry, Physiology or Medicine).
  3. Normalizes city names (e.g., "New York City" -> "new york") for consistent matching.
  4. Saves results to `data/laureates.json`.

### Frontend
- **Tech Stack**: React + TypeScript + Vite.
- **Search Logic**: 
  - Searches are performed against normalized versions of the user's input.
  - Matches against `birthCity` or any city in the `affiliationCities` array.
  - "New York" matches "New York City" due to the normalization mapping.
- **UI**: 
  - Summarizes results using the specific text: *'X people have won a science Nobel. y were born in [City], and z were affiliated with an institution in [City] at the time of their award.'*

## Getting Started

### Development
1. Navigate to `client/`: `cd find-your-nobel-laureate/client`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`

### Refreshing Data
1. Navigate to `data/`: `cd find-your-nobel-laureate/data`
2. Run fetcher: `npx ts-node --esm fetch_laureates.mts`
3. Copy to client: `cp laureates.json ../client/src/data/laureates.json`
