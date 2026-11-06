"use client";

/**
 * Demo data layer, stored in localStorage (no backend). Listings, leads and viewings are shared by the
 * website and the agent dashboard in the same browser, and stay in sync across tabs.
 * To go live, replace these functions with database calls (e.g. Supabase). Components only use these exports.
 */
import { useSyncExternalStore } from "react";
import { seedListings, type Listing, type Status } from "./data";

export type LeadStatus = "new" | "contacted" | "viewing" | "closed";
export type Lead = {
  id: number;
  createdAt: number;
  listingId: string;
  kind: "enquiry" | "viewing";
  name: string;
  phone: string;
  email?: string;
  message?: string;
  date?: string; // YYYY-MM-DD for viewings
  slot?: string; // "10:00"
  status: LeadStatus;
  notes?: string;
};
export type DB = { listings: Listing[]; leads: Lead[] };

const KEY = "imisozi:demo:v1";
const EVT = "imisozi:change";
let cache: DB | null = null;
let cacheRaw: string | null = null;

function read(): DB {
  const raw = localStorage.getItem(KEY);
  if (raw && raw === cacheRaw && cache) return cache;
  if (raw) {
    try { cache = JSON.parse(raw) as DB; cacheRaw = raw; return cache; } catch {}
  }
  const s = seed();
  write(s, false);
  return s;
}
function write(db: DB, notify = true) {
  const raw = JSON.stringify(db);
  try {
    localStorage.setItem(KEY, raw);
  } catch {
    throw new Error("Storage is full. Remove a few uploaded photos and try again.");
  }
  cache = db; cacheRaw = raw;
  if (notify) window.dispatchEvent(new Event(EVT));
}
const update = (fn: (db: DB) => DB) => write(fn(read()));

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => { if (e.key === KEY || e.key === SAVED) cb(); };
  window.addEventListener("storage", onStorage);
  window.addEventListener(EVT, cb);
  return () => { window.removeEventListener("storage", onStorage); window.removeEventListener(EVT, cb); };
}

export function useDB(): DB | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

// ---------- listings ----------
export function saveListing(l: Listing) {
  update((db) => {
    const exists = db.listings.some((x) => x.id === l.id);
    return { ...db, listings: exists ? db.listings.map((x) => (x.id === l.id ? l : x)) : [l, ...db.listings] };
  });
}
export function nextListingId(db: DB) {
  const n = db.listings.map((l) => Number(l.id.split("-")[1]) || 0).reduce((a, b) => Math.max(a, b), 300);
  return `IM-${n + 1}`;
}
export function setListingStatus(id: string, status: Status) {
  update((db) => ({ ...db, listings: db.listings.map((l) => (l.id === id ? { ...l, status } : l)) }));
}
export function deleteListing(id: string) {
  update((db) => ({ ...db, listings: db.listings.filter((l) => l.id !== id) }));
}
const viewed = new Set<string>();
export function countView(id: string) {
  if (viewed.has(id)) return; // once per page load
  viewed.add(id);
  update((db) => ({ ...db, listings: db.listings.map((l) => (l.id === id ? { ...l, views: l.views + 1 } : l)) }));
}

// ---------- leads ----------
export function addLead(l: Omit<Lead, "id" | "createdAt" | "status">) {
  update((db) => ({
    ...db,
    leads: [{ ...l, id: db.leads.reduce((m, x) => Math.max(m, x.id), 500) + 1, createdAt: Date.now(), status: l.kind === "viewing" ? "viewing" : "new" }, ...db.leads],
  }));
}
export function updateLead(id: number, patch: Partial<Lead>) {
  update((db) => ({ ...db, leads: db.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
}
export const resetDemo = () => write(seed());

// ---------- saved homes (per visitor) ----------
const SAVED = "imisozi:saved";
let savedCache: string[] = [];
let savedRaw: string | null = null;
function readSaved() {
  const raw = localStorage.getItem(SAVED) ?? "[]";
  if (raw !== savedRaw) { savedRaw = raw; try { savedCache = JSON.parse(raw); } catch { savedCache = []; } }
  return savedCache;
}
const EMPTY: string[] = [];
export function useSaved(): string[] {
  return useSyncExternalStore(subscribe, readSaved, () => EMPTY);
}
export function toggleSaved(id: string) {
  const cur = readSaved();
  localStorage.setItem(SAVED, JSON.stringify(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  window.dispatchEvent(new Event(EVT));
}

// ---------- seed ----------
export const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
function seed(): DB {
  const now = Date.now();
  const day = (o: number) => { const d = new Date(); d.setDate(d.getDate() + o); return ymd(d); };
  const H = 3600_000;
  const leads: Lead[] = [
    { id: 512, createdAt: now - 0.4 * H, listingId: "IM-101", kind: "viewing", name: "Sarah K.", phone: "0788 000 101", date: day(1), slot: "10:00", status: "viewing", message: "Moving from Nairobi with two kids." },
    { id: 511, createdAt: now - 2 * H, listingId: "IM-201", kind: "enquiry", name: "Jean-Paul H.", phone: "0788 000 102", message: "Is the price negotiable? I can pay cash.", status: "new" },
    { id: 510, createdAt: now - 3.5 * H, listingId: "IM-103", kind: "enquiry", name: "Esther N.", phone: "0788 000 103", email: "esther@example.com", message: "Is water included in the rent?", status: "new" },
    { id: 509, createdAt: now - 6 * H, listingId: "IM-104", kind: "viewing", name: "Mark T.", phone: "0788 000 104", date: day(0), slot: "16:00", status: "viewing" },
    { id: 508, createdAt: now - 20 * H, listingId: "IM-203", kind: "enquiry", name: "Innocent B.", phone: "0788 000 105", message: "Can I see the title deed before visiting?", status: "contacted", notes: "Sent title copy on WhatsApp." },
    { id: 507, createdAt: now - 26 * H, listingId: "IM-102", kind: "viewing", name: "Grace M.", phone: "0788 000 106", date: day(2), slot: "14:00", status: "viewing" },
    { id: 506, createdAt: now - 40 * H, listingId: "IM-204", kind: "enquiry", name: "Kevin R.", phone: "0788 000 107", message: "Interested for a client relocating in January.", status: "contacted" },
    { id: 505, createdAt: now - 52 * H, listingId: "IM-106", kind: "enquiry", name: "Diane U.", phone: "0788 000 108", message: "Do you allow pets?", status: "closed", notes: "No pets allowed. Suggested IM-105." },
    { id: 504, createdAt: now - 70 * H, listingId: "IM-202", kind: "viewing", name: "Patrick N.", phone: "0788 000 109", date: day(-1), slot: "11:00", status: "closed", notes: "Liked it, discussing with partner." },
  ];
  return { listings: seedListings(now), leads };
}
