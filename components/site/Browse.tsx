"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AREAS, TYPE_LABEL, type AreaId, type Listing, type PropType, type Purpose } from "@/lib/data";
import { useDB } from "@/lib/store";
import { ListingCard } from "./ListingCard";
import { Map } from "./Map";
import { MapCard } from "./MapCard";
import { useCurrency } from "./currency";
import { BUDGETS, budgetLabel } from "./HeroSearch";

type Sort = "new" | "low" | "high";

export function Browse() {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const db = useDB();
  const cur = useCurrency();
  const [hover, setHover] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  const f = {
    purpose: (params.get("purpose") as Purpose | null) ?? "",
    area: (params.get("area") as AreaId | null) ?? "",
    type: (params.get("type") as PropType | null) ?? "",
    max: params.get("max") ?? "",
    beds: params.get("beds") ?? "",
    furnished: params.get("furnished") ?? "",
    all: params.get("all") === "1",
    sort: (params.get("sort") as Sort | null) ?? "new",
    view: params.get("view") === "map" ? "map" : "list",
  };

  function set(patch: Partial<Record<keyof typeof f, string>>) {
    const q = new URLSearchParams(params.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? q.set(k, v) : q.delete(k)));
    if ("purpose" in patch) q.delete("max");
    router.replace(`${path}?${q}`, { scroll: false });
  }

  const results = useMemo(() => {
    const ls = (db?.listings ?? []).filter((l: Listing) =>
      (!f.purpose || l.purpose === f.purpose) &&
      (!f.area || l.area === f.area) &&
      (!f.type || l.type === f.type) &&
      (!f.max || l.price <= Number(f.max)) &&
      (!f.beds || l.beds >= Number(f.beds)) &&
      (!f.furnished || l.furnished === (f.furnished === "yes")) &&
      (f.all || l.status === "available" || l.status === "under-offer"));
    return ls.sort((a, b) => f.sort === "low" ? a.price - b.price : f.sort === "high" ? b.price - a.price : b.listedAt - a.listedAt);
  }, [db, f.purpose, f.area, f.type, f.max, f.beds, f.furnished, f.all, f.sort]);

  const activeCount = [f.area, f.type, f.max, f.beds, f.furnished].filter(Boolean).length;
  const pickedListing = results.find((l) => l.id === picked);
  const heading = f.purpose === "rent" ? "Homes to rent" : f.purpose === "sale" ? "Homes for sale" : "All homes";

  const chip = "rounded-full border border-line bg-white px-3.5 py-2 text-sm font-semibold hover:border-basalt-soft";
  const select = `${chip} appearance-none pr-8 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22><path d=%22M5 8l5 5 5-5%22 fill=%22none%22 stroke=%22%231c2b2d%22 stroke-width=%222%22/></svg>')] bg-[length:14px] bg-[right_0.7rem_center] bg-no-repeat`;
  const on = (v: string) => (v ? "border-basalt ring-1 ring-basalt" : "");

  return (
    <main>
      {/* filter bar */}
      <div className="sticky top-16 z-[1050] border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] sm:px-6">
          <div className="flex shrink-0 rounded-full bg-mist p-0.5" role="radiogroup" aria-label="Rent or buy">
            {([["", "All"], ["rent", "Rent"], ["sale", "Buy"]] as const).map(([v, label]) => (
              <button key={v} role="radio" aria-checked={f.purpose === v} onClick={() => set({ purpose: v })}
                className={`rounded-full px-3.5 py-1.5 text-sm font-bold ${f.purpose === v ? "bg-white shadow-sm" : "text-muted"}`}>{label}</button>
            ))}
          </div>
          <select aria-label="Neighbourhood" className={`${select} ${on(f.area)}`} value={f.area} onChange={(e) => set({ area: e.target.value })}>
            <option value="">Any area</option>
            {Object.entries(AREAS).sort((a, b) => a[1].label.localeCompare(b[1].label)).map(([id, a]) => <option key={id} value={id}>{a.label}</option>)}
          </select>
          {f.purpose && (
            <select aria-label="Budget" className={`${select} ${on(f.max)}`} value={f.max} onChange={(e) => set({ max: e.target.value })}>
              <option value="">Any price</option>
              {BUDGETS[f.purpose as Purpose].map((b) => <option key={b} value={b}>{budgetLabel(b, cur, f.purpose as Purpose)}</option>)}
            </select>
          )}
          <select aria-label="Property type" className={`${select} ${on(f.type)}`} value={f.type} onChange={(e) => set({ type: e.target.value })}>
            <option value="">Any type</option>
            {(Object.keys(TYPE_LABEL) as PropType[]).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
          </select>
          <select aria-label="Bedrooms" className={`${select} ${on(f.beds)}`} value={f.beds} onChange={(e) => set({ beds: e.target.value })}>
            <option value="">Any beds</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+ beds</option>)}
          </select>
          <select aria-label="Furnishing" className={`${select} ${on(f.furnished)}`} value={f.furnished} onChange={(e) => set({ furnished: e.target.value })}>
            <option value="">Furnished or not</option>
            <option value="yes">Furnished</option>
            <option value="no">Unfurnished</option>
          </select>
          {activeCount > 0 && (
            <button onClick={() => set({ area: "", type: "", max: "", beds: "", furnished: "" })} className="shrink-0 px-2 text-sm font-bold text-jac">
              Clear {activeCount}
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:grid lg:grid-cols-[1fr_minmax(380px,42%)] lg:gap-6">
        {/* list */}
        <section className={`${f.view === "map" ? "hidden lg:block" : ""} py-6`} aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{heading}{f.area ? ` in ${AREAS[f.area as AreaId].label}` : " in Kigali"}</h1>
              <p className="text-sm text-muted">{db ? `${results.length} ${results.length === 1 ? "home" : "homes"}` : "Loading…"}</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={f.all} onChange={(e) => set({ all: e.target.checked ? "1" : "" })} className="size-4 accent-jac" />
                Show let and sold
              </label>
              <select aria-label="Sort" className={select} value={f.sort} onChange={(e) => set({ sort: e.target.value === "new" ? "" : e.target.value })}>
                <option value="new">Newest first</option>
                <option value="low">Lowest price</option>
                <option value="high">Highest price</option>
              </select>
            </div>
          </div>

          {db && results.length === 0 ? (
            <div className="mt-10 rounded-3xl bg-mist p-10 text-center">
              <p className="text-lg font-bold">No homes match all of that.</p>
              <p className="mt-1 text-muted">Try a bigger budget or another neighbourhood. New homes come in every week.</p>
              <button onClick={() => set({ area: "", type: "", max: "", beds: "", furnished: "" })} className="mt-5 rounded-full bg-basalt px-5 py-2.5 font-bold text-white">Clear filters</button>
            </div>
          ) : (
            <div className="mt-6 grid gap-x-5 gap-y-8 sm:grid-cols-2">
              {results.map((l, i) => <ListingCard key={l.id} l={l} active={l.id === picked} onHover={setHover} priority={i < 4} />)}
            </div>
          )}
        </section>

        {/* map */}
        <aside className={`${f.view === "map" ? "block" : "hidden"} lg:block`}>
          <div className="relative -mx-4 h-[calc(100dvh-8.6rem)] overflow-hidden sm:-mx-6 lg:sticky lg:top-[8.6rem] lg:mx-0 lg:mt-6 lg:h-[calc(100dvh-10rem)] lg:rounded-3xl lg:border lg:border-line">
            <Map listings={results} currency={cur} activeId={hover ?? picked} onSelect={setPicked} className="size-full" />
            {pickedListing && <MapCard l={pickedListing} onClose={() => setPicked(null)} className="bottom-20 lg:bottom-4" />}
          </div>
        </aside>
      </div>

      {/* mobile list/map switch */}
      <button onClick={() => set({ view: f.view === "map" ? "" : "map" })}
        className="fixed bottom-5 left-1/2 z-[1060] -translate-x-1/2 rounded-full bg-basalt px-5 py-3 font-bold text-white shadow-xl lg:hidden">
        {f.view === "map" ? "Show list" : "Show map"}
      </button>
    </main>
  );
}
