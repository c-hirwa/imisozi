// All business details and listings are fictional. Swap them out when reusing this for a real agency.
export const AGENCY = {
  name: "Imisozi Homes",
  phoneDisplay: "+250 780 000 000",
  whatsapp: "250780000000",
  email: "hello@imisozi.example",
  office: "KG 9 Ave, Kacyiru, Kigali",
};

export const USD_RATE = 1450; // RWF per USD, approximate. Update before quoting.

export const AGENTS = [
  { id: "aline", name: "Aline Uwase", role: "Rentals", initials: "AU" },
  { id: "david", name: "David Mugisha", role: "Sales", initials: "DM" },
];

/** Unsplash photo id, a full URL, or a data: URL from an upload. */
export const img = (src: string, w = 1000, h?: number) =>
  src.startsWith("data:") || src.startsWith("http")
    ? src
    : `https://images.unsplash.com/photo-${src}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ""}&q=70`;

export const PHOTOS = {
  hero: "1687986261123-b17f08f2796c", // Kigali skyline at sunset
  hills: "1773137476402-45a80af8e307",
};

export type AreaId =
  | "nyarutarama" | "kibagabaga" | "kacyiru" | "kimihurura" | "kiyovu" | "gacuriro"
  | "rebero" | "niboye" | "remera" | "gisozi" | "kanombe" | "kicukiro";

export const AREAS: Record<AreaId, { label: string; lat: number; lng: number; blurb: string; photo?: string }> = {
  nyarutarama: { label: "Nyarutarama", lat: -1.9385, lng: 30.1025, blurb: "Big gardens, embassies and the golf course. Quiet and green.", photo: "1764978588978-eb242701933c" },
  kibagabaga: { label: "Kibagabaga", lat: -1.9305, lng: 30.1185, blurb: "Family houses with space, close to international schools.", photo: "1708772565599-2c4e4b3ed9db" },
  kacyiru: { label: "Kacyiru", lat: -1.9425, lng: 30.0855, blurb: "Central, walkable to ministries and offices.", photo: "1776521769699-74de0c760f50" },
  kimihurura: { label: "Kimihurura", lat: -1.9535, lng: 30.0885, blurb: "Cafés, restaurants and the best of Kigali after dark.", photo: "1773137476402-45a80af8e307" },
  kiyovu: { label: "Kiyovu", lat: -1.9505, lng: 30.0605, blurb: "Leafy streets right above the city centre." },
  gacuriro: { label: "Gacuriro", lat: -1.9145, lng: 30.0965, blurb: "Newer estates and apartments with modern finishes.", photo: "1551357141-f73a8402ceb3" },
  rebero: { label: "Rebero", lat: -1.9905, lng: 30.0705, blurb: "Hilltop views over the whole city. Cooler at night.", photo: "1779900275257-aaadab6d9285" },
  niboye: { label: "Niboye", lat: -1.9865, lng: 30.1055, blurb: "Good-value houses on quiet residential roads." },
  remera: { label: "Remera", lat: -1.9565, lng: 30.1085, blurb: "Busy and affordable, next to the stadium and transport." },
  gisozi: { label: "Gisozi", lat: -1.9245, lng: 30.0615, blurb: "Growing fast, with prices still within reach." },
  kanombe: { label: "Kanombe", lat: -1.9705, lng: 30.1595, blurb: "Near the airport, with land still available." },
  kicukiro: { label: "Kicukiro", lat: -1.9765, lng: 30.0985, blurb: "Established neighbourhood with schools and markets." },
};

export type Purpose = "rent" | "sale";
export type PropType = "house" | "apartment" | "villa" | "townhouse" | "plot";
export type Status = "available" | "under-offer" | "let" | "sold";

export type Listing = {
  id: string;
  title: string;
  purpose: Purpose;
  type: PropType;
  area: AreaId;
  price: number; // RWF; per month for rentals
  beds: number;
  baths: number;
  size: number; // m² (land size for plots)
  furnished: boolean;
  parking: number;
  features: string[];
  description: string;
  photos: string[];
  lat: number;
  lng: number;
  status: Status;
  listedAt: number; // ms
  agent: string;
  views: number;
};

export const FEATURES = [
  "Backup generator", "Water tank", "Security guard", "Garden", "Fibre internet", "Swimming pool",
  "Balcony", "City view", "Staff quarters", "Solar water heater", "Gated compound", "Lift",
  "Gym", "Borehole", "Title deed ready", "Road access",
];

export const TYPE_LABEL: Record<PropType, string> = {
  house: "House", apartment: "Apartment", villa: "Villa", townhouse: "Townhouse", plot: "Plot",
};
export const STATUS_LABEL: Record<Status, string> = {
  available: "Available", "under-offer": "Under offer", let: "Let", sold: "Sold",
};

const D = 86400000;
type Seed = Omit<Listing, "listedAt" | "lat" | "lng" | "views"> & { daysAgo: number; dx: number; dy: number; views: number };

const SEED: Seed[] = [
  {
    id: "IM-101", title: "Family house behind a gated wall", purpose: "rent", type: "house", area: "kibagabaga",
    price: 1_740_000, beds: 3, baths: 3, size: 220, furnished: true, parking: 2, agent: "aline", status: "available",
    features: ["Backup generator", "Water tank", "Security guard", "Garden", "Fibre internet", "Staff quarters"],
    description: "A bright three-bedroom house on a quiet murram road, five minutes from the international schools. The garden is mature and private, the kitchen was redone last year, and there's a separate room for staff. Water tank and generator mean no surprises during cuts.",
    photos: ["1642667670006-6b3059ccf96d", "1600494448850-6013c64ba722", "1615874959474-d609969a20ed", "1600489000022-c2086d79f9d4", "1584622650111-993a426fbf0a"],
    daysAgo: 2, dx: 0.002, dy: -0.001, views: 184,
  },
  {
    id: "IM-102", title: "Two-bed apartment with a balcony", purpose: "rent", type: "apartment", area: "kacyiru",
    price: 1_305_000, beds: 2, baths: 2, size: 110, furnished: true, parking: 1, agent: "aline", status: "available",
    features: ["Backup generator", "Lift", "Balcony", "Fibre internet", "Security guard"],
    description: "Fully furnished on the fourth floor of a new block, walking distance to the ministries and Kigali Heights. Fast fibre is already connected, so you can work from home on day one.",
    photos: ["1784853879843-f3c5aacf2569", "1724582586529-62622e50c0b3", "1595526114035-0d45ed16cfbf", "1507089947368-19c1da9775ae", "1774685110793-e427dfa87467"],
    daysAgo: 5, dx: -0.001, dy: 0.002, views: 241,
  },
  {
    id: "IM-103", title: "One-bed flat near the cafés", purpose: "rent", type: "apartment", area: "kimihurura",
    price: 800_000, beds: 1, baths: 1, size: 65, furnished: true, parking: 1, agent: "aline", status: "available",
    features: ["Backup generator", "Fibre internet", "Balcony", "Gated compound"],
    description: "A compact, well-finished flat for one or a couple. Kimihurura's restaurants are a short walk away, and the compound is calm once you're inside the gate.",
    photos: ["1775733924031-521cd86c69cc", "1564078516393-cf04bd966897", "1774578342100-f779e988c83d", "1588854337236-6889d631faa8"],
    daysAgo: 1, dx: 0.001, dy: 0.001, views: 96,
  },
  {
    id: "IM-104", title: "Four-bed villa with a pool", purpose: "rent", type: "villa", area: "nyarutarama",
    price: 3_625_000, beds: 4, baths: 4, size: 380, furnished: true, parking: 3, agent: "aline", status: "under-offer",
    features: ["Swimming pool", "Backup generator", "Water tank", "Security guard", "Garden", "Staff quarters", "Solar water heater"],
    description: "A large modern villa a few streets from the golf course, with a heated pool and a terrace that looks out over the valley. Suits a diplomatic or NGO family. Available fully furnished.",
    photos: ["1613977257363-707ba9348227", "1628744876497-eb30460be9f6", "1616594039964-ae9021a400a0", "1617228069096-4638a7ffc906", "1620626011761-996317b8d101", "1761591672132-b4d3588992d1"],
    daysAgo: 12, dx: -0.002, dy: 0.001, views: 402,
  },
  {
    id: "IM-105", title: "Three-bed house with a big yard", purpose: "rent", type: "house", area: "niboye",
    price: 450_000, beds: 3, baths: 2, size: 160, furnished: false, parking: 2, agent: "aline", status: "available",
    features: ["Water tank", "Garden", "Gated compound", "Road access"],
    description: "Solid brick house on a tarmac road with room for two cars and a vegetable garden. Unfurnished, so you can make it your own. Good value for families working in Kicukiro.",
    photos: ["1787672358119-25cb4c768d14", "1600210492493-0946911123ea", "1773578978637-c9771e7a9913", "1616486029423-aaa4789e8c9a"],
    daysAgo: 8, dx: 0.001, dy: -0.002, views: 133,
  },
  {
    id: "IM-106", title: "Modern two-bed in a new estate", purpose: "rent", type: "apartment", area: "gacuriro",
    price: 1_015_000, beds: 2, baths: 2, size: 105, furnished: true, parking: 1, agent: "aline", status: "available",
    features: ["Gym", "Backup generator", "Security guard", "Balcony", "Fibre internet"],
    description: "Two bedrooms in a managed estate with a gym, playground and 24-hour security. Everything is new, including the appliances.",
    photos: ["1760235674447-fe0cc115b697", "1617806118233-18e1de247200", "1616486029423-aaa4789e8c9a", "1507089947368-19c1da9775ae"],
    daysAgo: 3, dx: -0.002, dy: -0.001, views: 158,
  },
  {
    id: "IM-107", title: "Studio for a student or young professional", purpose: "rent", type: "apartment", area: "remera",
    price: 220_000, beds: 1, baths: 1, size: 35, furnished: true, parking: 0, agent: "aline", status: "let",
    features: ["Water tank", "Fibre internet", "Security guard"],
    description: "Small, clean and close to buses and the stadium. Bills are simple and the landlord lives nearby.",
    photos: ["1580216643062-cf460548a66a", "1595526114035-0d45ed16cfbf", "1584622650111-993a426fbf0a"],
    daysAgo: 20, dx: 0.002, dy: 0.001, views: 87,
  },
  {
    id: "IM-201", title: "Four-bed house with views over the city", purpose: "sale", type: "house", area: "rebero",
    price: 280_000_000, beds: 4, baths: 4, size: 310, furnished: false, parking: 3, agent: "david", status: "available",
    features: ["City view", "Backup generator", "Water tank", "Garden", "Title deed ready", "Solar water heater"],
    description: "Built in 2022 on one of the highest points in Kigali. Every main room faces the city, and the terrace is where you'll spend your evenings. Freehold title is ready for transfer.",
    photos: ["1721815693498-cc28507c0ba2", "1761591672132-b4d3588992d1", "1724582586529-62622e50c0b3", "1616594039964-ae9021a400a0", "1617228069096-4638a7ffc906"],
    daysAgo: 4, dx: 0.001, dy: 0.002, views: 312,
  },
  {
    id: "IM-202", title: "Three-bed townhouse, ready to move in", purpose: "sale", type: "townhouse", area: "gacuriro",
    price: 180_000_000, beds: 3, baths: 3, size: 190, furnished: false, parking: 2, agent: "david", status: "available",
    features: ["Gated compound", "Security guard", "Backup generator", "Title deed ready"],
    description: "End-of-row townhouse in a finished estate with paved roads and street lighting. Low maintenance, good for first-time buyers or as a rental investment.",
    photos: ["1771366260867-7e07094579d7", "1600210492493-0946911123ea", "1615874959474-d609969a20ed", "1588854337236-6889d631faa8"],
    daysAgo: 9, dx: 0.002, dy: 0.001, views: 205,
  },
  {
    id: "IM-203", title: "600 m² residential plot", purpose: "sale", type: "plot", area: "kanombe",
    price: 35_000_000, beds: 0, baths: 0, size: 600, furnished: false, parking: 0, agent: "david", status: "available",
    features: ["Road access", "Title deed ready"],
    description: "Flat, serviced plot zoned for residential use, with water and electricity at the boundary. Ten minutes from the airport. Neighbouring plots are already being built on.",
    photos: ["1747854805840-9be7d5e360e6", "1653663786108-21ca52a24171"],
    daysAgo: 6, dx: -0.001, dy: -0.002, views: 149,
  },
  {
    id: "IM-204", title: "Five-bed villa on a quiet street", purpose: "sale", type: "villa", area: "nyarutarama",
    price: 650_000_000, beds: 5, baths: 5, size: 520, furnished: false, parking: 4, agent: "david", status: "available",
    features: ["Swimming pool", "Garden", "Staff quarters", "Backup generator", "Borehole", "Security guard", "Title deed ready"],
    description: "A statement home on a 1,200 m² plot with a pool, borehole and separate staff house. Finished to a high standard throughout.",
    photos: ["1580587771525-78b9dba3b914", "1600596542815-ffad4c1539a9", "1628744876497-eb30460be9f6", "1616486029423-aaa4789e8c9a", "1620626011761-996317b8d101"],
    daysAgo: 15, dx: 0.001, dy: -0.002, views: 523,
  },
  {
    id: "IM-205", title: "Two-bed apartment above the city centre", purpose: "sale", type: "apartment", area: "kiyovu",
    price: 120_000_000, beds: 2, baths: 2, size: 95, furnished: true, parking: 1, agent: "david", status: "under-offer",
    features: ["Lift", "Balcony", "City view", "Backup generator", "Title deed ready"],
    description: "Sold furnished, in a small block with a lift and secure parking. Strong rental demand in Kiyovu makes this a good investment.",
    photos: ["1479839672679-a46483c0e7c8", "1564078516393-cf04bd966897", "1774578342100-f779e988c83d", "1507089947368-19c1da9775ae"],
    daysAgo: 18, dx: -0.001, dy: 0.001, views: 276,
  },
  {
    id: "IM-206", title: "Three-bed family house with a garden", purpose: "sale", type: "house", area: "gisozi",
    price: 95_000_000, beds: 3, baths: 2, size: 170, furnished: false, parking: 2, agent: "david", status: "available",
    features: ["Garden", "Water tank", "Road access", "Title deed ready"],
    description: "A well-kept house in a growing part of the city, with a lawn for the kids and room to extend.",
    photos: ["1586228046763-cd367fc926bf", "1600494448850-6013c64ba722", "1595526114035-0d45ed16cfbf", "1600489000022-c2086d79f9d4"],
    daysAgo: 11, dx: 0.002, dy: -0.001, views: 118,
  },
  {
    id: "IM-207", title: "Four-bed house near schools and markets", purpose: "sale", type: "house", area: "kicukiro",
    price: 210_000_000, beds: 4, baths: 3, size: 240, furnished: false, parking: 2, agent: "david", status: "sold",
    features: ["Backup generator", "Water tank", "Garden", "Gated compound", "Title deed ready"],
    description: "Spacious house with a separate guest wing, in an established neighbourhood with everything nearby.",
    photos: ["1654535095187-769ba364ad7a", "1773578978637-c9771e7a9913", "1615874959474-d609969a20ed", "1588854337236-6889d631faa8"],
    daysAgo: 30, dx: -0.002, dy: 0.002, views: 290,
  },
];

export function seedListings(now = Date.now()): Listing[] {
  return SEED.map(({ daysAgo, dx, dy, ...l }) => ({
    ...l,
    listedAt: now - daysAgo * D,
    lat: AREAS[l.area].lat + dy,
    lng: AREAS[l.area].lng + dx,
  }));
}
export const SEED_IDS = SEED.map((s) => s.id);

// ---------- money ----------
export type Currency = "RWF" | "USD";
export function price(rwf: number, cur: Currency, purpose: Purpose, compact = false) {
  const per = purpose === "rent" ? (compact ? "/mo" : " / month") : "";
  const short = (v: number, unit: string) =>
    v >= 1e9 ? `${+(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `${+(v / 1e6).toFixed(v >= 1e8 ? 0 : 2)}M` : v >= 1e4 && unit === "$" ? `${Math.round(v / 1000)}k` : v.toLocaleString("en-US");
  if (cur === "USD") {
    const usd = purpose === "rent" ? Math.round(rwf / USD_RATE / 10) * 10 : Math.round(rwf / USD_RATE / 1000) * 1000;
    return `$${compact || purpose === "sale" ? short(usd, "$") : usd.toLocaleString("en-US")}${per}`;
  }
  return `RWF ${compact || rwf >= 10_000_000 ? short(rwf, "RWF") : rwf.toLocaleString("en-US")}${per}`;
}

// ---------- distances ----------
const CBD = { lat: -1.9441, lng: 30.0619 };
const AIRPORT = { lat: -1.9686, lng: 30.1395 };
function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const r = (x: number) => (x * Math.PI) / 180;
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}
export const distances = (l: { lat: number; lng: number }) => ({ cbd: km(l, CBD), airport: km(l, AIRPORT) });
