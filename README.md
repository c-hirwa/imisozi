# Imisozi Homes

Website and agent dashboard for a fictional Kigali estate agency (*imisozi* means hills). Rentals and sales.

**Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Leaflet. Font: Schibsted Grotesk via Fontsource.

## Pages

| Route | What it is |
|---|---|
| `/` | Homepage: search (rent or buy, area, budget, bedrooms), latest listings, neighbourhood guide, map of every home |
| `/properties` | Results with filters that update the URL (shareable searches), list and map side by side, price pins on the map |
| `/properties/IM-101` | Property page: photo gallery and full-screen viewer, details, what's included, map, distances, book a viewing or ask a question |
| `/saved` | Homes the visitor hearted, with a side-by-side comparison of up to three |
| `/agent` | Agent dashboard (demo PIN **2580**): overview, leads with status and notes, viewings agenda, listings manager with add/edit |

Prices switch between RWF and USD from the header (rate set in `lib/data.ts`).

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
```

To see the live flow, open `/agent` in one tab and a property page in another. Book a viewing and it pops up in the dashboard.
Add a listing in the dashboard and it appears on the website straight away.

## How the data works (no backend yet)

Listings, leads and viewings are stored in the browser's localStorage (`lib/store.ts`) and synced across tabs, so the
website and dashboard only share data **in the same browser**. The first visit loads 14 sample listings and a few leads.
"Reset demo data" in the dashboard restores them. Uploaded photos are resized in the browser and stored too, so add a few
at most, since browsers cap localStorage at about 5 MB.

To make it real, replace the functions in `lib/store.ts` with database calls (Supabase fits: `listings` and `leads` tables,
Storage for photos, realtime for new-lead alerts). Components only use that file's exports. The PIN is a demo gate only.

## Customising for a client

- `lib/data.ts`: agency details, agents, neighbourhoods, listings, exchange rate
- Photos are free images from [Unsplash](https://unsplash.com/license), loaded from their CDN at the size each slot needs.
  Replace them with the agency's own photos before launch.
- Map tiles are CARTO Voyager on OpenStreetMap data, with attribution shown on the map. For a busy production site,
  check CARTO's terms or switch to a paid tile provider.
