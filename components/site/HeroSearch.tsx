"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AREAS, USD_RATE, type AreaId, type Purpose } from "@/lib/data";
import { useCurrency } from "./currency";

export const BUDGETS: Record<Purpose, number[]> = {
  rent: [300_000, 800_000, 1_500_000, 2_500_000],
  sale: [100_000_000, 200_000_000, 400_000_000, 800_000_000],
};
export function budgetLabel(rwf: number, cur: "RWF" | "USD", purpose: Purpose) {
  if (cur === "USD") {
    const u = rwf / USD_RATE;
    return `Up to $${u >= 1e6 ? +(u / 1e6).toFixed(1) + "M" : u >= 1e4 ? Math.round(u / 1000) + "k" : Math.round(u / 10) * 10}${purpose === "rent" ? "/mo" : ""}`;
  }
  return `Up to ${rwf >= 1e6 ? +(rwf / 1e6).toFixed(1) + "M" : rwf / 1000 + "k"} RWF${purpose === "rent" ? "/mo" : ""}`;
}

export function HeroSearch() {
  const router = useRouter();
  const cur = useCurrency();
  const [purpose, setPurpose] = useState<Purpose>("rent");
  const [area, setArea] = useState<AreaId | "">("");
  const [max, setMax] = useState("");
  const [beds, setBeds] = useState("");

  function go(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams({ purpose });
    if (area) q.set("area", area);
    if (max) q.set("max", max);
    if (beds) q.set("beds", beds);
    router.push(`/properties?${q}`);
  }

  const sel = "w-full appearance-none bg-transparent py-1 font-semibold text-basalt focus:outline-none";
  return (
    <form onSubmit={go} className="max-w-4xl rounded-3xl bg-white p-2 text-basalt shadow-2xl">
      <div className="flex gap-1 p-1" role="radiogroup" aria-label="Rent or buy">
        {(["rent", "sale"] as const).map((p) => (
          <button type="button" key={p} role="radio" aria-checked={purpose === p} onClick={() => { setPurpose(p); setMax(""); }}
            className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${purpose === p ? "bg-basalt text-white" : "text-muted hover:bg-mist"}`}>
            {p === "rent" ? "Rent" : "Buy"}
          </button>
        ))}
      </div>
      <div className="grid gap-1 sm:grid-cols-[1.3fr_1fr_0.8fr_auto]">
        <label className="rounded-2xl px-4 py-2.5 hover:bg-mist">
          <span className="block text-xs font-semibold text-muted">Neighbourhood</span>
          <select className={sel} value={area} onChange={(e) => setArea(e.target.value as AreaId | "")}>
            <option value="">Anywhere in Kigali</option>
            {Object.entries(AREAS).sort((a, b) => a[1].label.localeCompare(b[1].label)).map(([id, a]) => <option key={id} value={id}>{a.label}</option>)}
          </select>
        </label>
        <label className="rounded-2xl px-4 py-2.5 hover:bg-mist">
          <span className="block text-xs font-semibold text-muted">Budget</span>
          <select className={sel} value={max} onChange={(e) => setMax(e.target.value)}>
            <option value="">Any price</option>
            {BUDGETS[purpose].map((b) => <option key={b} value={b}>{budgetLabel(b, cur, purpose)}</option>)}
          </select>
        </label>
        <label className="rounded-2xl px-4 py-2.5 hover:bg-mist">
          <span className="block text-xs font-semibold text-muted">Bedrooms</span>
          <select className={sel} value={beds} onChange={(e) => setBeds(e.target.value)}>
            <option value="">Any</option>
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </label>
        <button className="m-1 rounded-2xl bg-jac px-7 py-3.5 font-bold text-white hover:bg-jac-deep">Search homes</button>
      </div>
    </form>
  );
}
