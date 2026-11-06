"use client";
import { useSyncExternalStore } from "react";
import type { Currency } from "@/lib/data";

const KEY = "imisozi:currency";
const EVT = "imisozi:currency";
const sub = (cb: () => void) => { window.addEventListener(EVT, cb); window.addEventListener("storage", cb); return () => { window.removeEventListener(EVT, cb); window.removeEventListener("storage", cb); }; };
const get = (): Currency => { try { return localStorage.getItem(KEY) === "USD" ? "USD" : "RWF"; } catch { return "RWF"; } };

export const useCurrency = () => useSyncExternalStore(sub, get, () => "RWF" as Currency);
export function setCurrency(c: Currency) {
  try { localStorage.setItem(KEY, c); } catch {}
  window.dispatchEvent(new Event(EVT));
}
