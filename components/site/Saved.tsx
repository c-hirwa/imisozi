"use client";

import Link from "next/link";
import { useState } from "react";
import { AREAS, STATUS_LABEL, TYPE_LABEL, distances, img, price, type Listing } from "@/lib/data";
import { toggleSaved, useDB, useSaved } from "@/lib/store";
import { useCurrency } from "./currency";
import { ListingCard } from "./ListingCard";

export function Saved() {
  const db = useDB();
  const ids = useSaved();
  const cur = useCurrency();
  const [picked, setPicked] = useState<string[]>([]);
  const homes = ids.map((id) => db?.listings.find((l) => l.id === id)).filter(Boolean) as Listing[];
  const compare = homes.filter((h) => picked.includes(h.id));

  function pick(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? [...p.slice(1), id] : [...p, id]));
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Saved homes</h1>
      {!db ? null : homes.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-mist p-10 text-center">
          <p className="text-lg font-bold">Nothing saved yet.</p>
          <p className="mt-1 text-muted">Tap the heart on any home to keep it here and compare it with others.</p>
          <Link href="/properties" className="mt-5 inline-block rounded-full bg-basalt px-5 py-2.5 font-bold text-white">Browse homes</Link>
        </div>
      ) : (
        <>
          <p className="mt-2 text-muted">Tick two or three to compare them side by side. Saved homes stay on this device.</p>
          <div className="mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {homes.map((h) => (
              <div key={h.id}>
                <ListingCard l={h} active={picked.includes(h.id)} />
                <label className="mt-3 flex cursor-pointer items-center gap-2 px-1 text-sm font-semibold">
                  <input type="checkbox" checked={picked.includes(h.id)} onChange={() => pick(h.id)} className="size-4 accent-jac" />
                  Compare
                </label>
              </div>
            ))}
          </div>

          {compare.length >= 2 && (
            <section className="fade-in mt-14" aria-labelledby="cmp">
              <h2 id="cmp" className="text-2xl font-extrabold tracking-tight">Side by side</h2>
              <div className="mt-5 overflow-x-auto rounded-2xl border border-line">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr>
                      <th className="w-40 bg-mist p-4" />
                      {compare.map((h) => (
                        <th key={h.id} className="p-4 align-top font-normal">
                          <img src={img(h.photos[0], 400, 260)} alt="" className="aspect-[3/2] w-full rounded-xl object-cover" />
                          <Link href={`/properties/${h.id}`} className="mt-2 block font-bold hover:underline">{h.title}</Link>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows(cur).map(([label, fn]) => {
                      const vals = compare.map(fn);
                      return (
                        <tr key={label} className="border-t border-line">
                          <th scope="row" className="bg-mist p-4 font-semibold">{label}</th>
                          {vals.map((v, i) => <td key={i} className="p-4 tnum">{v}</td>)}
                        </tr>
                      );
                    })}
                    <tr className="border-t border-line">
                      <th scope="row" className="bg-mist p-4 font-semibold">Has</th>
                      {compare.map((h) => <td key={h.id} className="p-4 align-top">{h.features.join(", ")}</td>)}
                    </tr>
                    <tr className="border-t border-line">
                      <th scope="row" className="bg-mist p-4" />
                      {compare.map((h) => (
                        <td key={h.id} className="p-4">
                          <button onClick={() => { toggleSaved(h.id); setPicked((p) => p.filter((x) => x !== h.id)); }} className="text-sm font-bold text-muted hover:text-basalt">Remove from saved</button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function rows(cur: "RWF" | "USD"): [string, (h: Listing) => React.ReactNode][] {
  return [
    ["Price", (h) => <span className="font-extrabold">{price(h.price, cur, h.purpose)}</span>],
    ["Status", (h) => STATUS_LABEL[h.status]],
    ["Area", (h) => AREAS[h.area].label],
    ["Type", (h) => TYPE_LABEL[h.type]],
    ["Bedrooms", (h) => (h.type === "plot" ? "–" : h.beds)],
    ["Bathrooms", (h) => (h.type === "plot" ? "–" : h.baths)],
    ["Size", (h) => `${h.size.toLocaleString()} m²`],
    ["Furnished", (h) => (h.type === "plot" ? "–" : h.furnished ? "Yes" : "No")],
    ["Parking", (h) => (h.parking ? h.parking : "–")],
    ["To city centre", (h) => `${distances(h).cbd.toFixed(1)} km`],
    ["Price per m²", (h) => (h.purpose === "sale" ? price(Math.round(h.price / h.size), cur, "sale") : "–")],
  ];
}
