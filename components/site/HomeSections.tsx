"use client";

import Link from "next/link";
import { useState } from "react";
import { AREAS, img, type AreaId } from "@/lib/data";
import { useDB } from "@/lib/store";
import { ListingCard } from "./ListingCard";
import { Map } from "./Map";
import { useCurrency } from "./currency";
import { MapCard } from "./MapCard";

export function HomeSections() {
  const db = useDB();
  const cur = useCurrency();
  const [sel, setSel] = useState<string | null>(null);
  const listings = db?.listings ?? [];
  const latest = [...listings].filter((l) => l.status === "available").sort((a, b) => b.listedAt - a.listedAt).slice(0, 8);
  const featuredAreas = (Object.keys(AREAS) as AreaId[]).filter((a) => AREAS[a].photo);
  const selected = listings.find((l) => l.id === sel);

  return (
    <>
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Just listed</h2>
          <Link href="/properties" className="font-bold text-jac hover:underline">See all homes</Link>
        </div>
        <div className="-mx-4 mt-6 flex snap-x gap-5 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 [scrollbar-width:thin]">
          {!db && Array.from({ length: 4 }, (_, i) => <div key={i} className="aspect-[7/5] w-72 shrink-0 animate-pulse rounded-2xl bg-mist" />)}
          {latest.map((l, i) => (
            <div key={l.id} className="w-72 shrink-0 snap-start sm:w-80"><ListingCard l={l} priority={i < 3} /></div>
          ))}
        </div>
      </section>

      <section id="areas" className="mx-auto mt-20 max-w-7xl scroll-mt-20 px-4 sm:px-6">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Know where you&apos;re moving</h2>
        <p className="mt-2 max-w-xl text-muted">Every Kigali neighbourhood feels different. Here&apos;s ours in a sentence each.</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredAreas.map((a) => {
            const n = listings.filter((l) => l.area === a && l.status === "available").length;
            return (
              <li key={a} className="group relative overflow-hidden rounded-2xl bg-basalt text-white">
                <img src={img(AREAS[a].photo!, 800, 520)} alt="" loading="lazy"
                  className="aspect-[8/5] w-full object-cover opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-60" />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-basalt/90 via-basalt/20 to-transparent p-5">
                  <h3 className="text-2xl font-extrabold">
                    <Link href={`/properties?area=${a}`} className="after:absolute after:inset-0">{AREAS[a].label}</Link>
                  </h3>
                  <p className="mt-1 text-sm text-white/85">{AREAS[a].blurb}</p>
                  <p className="mt-2 text-sm font-bold text-sage">{db ? `${n} ${n === 1 ? "home" : "homes"} available` : " "}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">See it on the map</h2>
            <p className="mt-2 text-muted">Addresses here can be vague. The pins aren&apos;t. Tap one to see the home.</p>
          </div>
          <Link href="/properties?view=map" className="hidden font-bold text-jac hover:underline sm:block">Open full map</Link>
        </div>
        <div className="relative mt-6 overflow-hidden rounded-3xl border border-line">
          <Map listings={listings} currency={cur} activeId={sel} onSelect={setSel} className="h-[460px] w-full" />
          {selected && <MapCard l={selected} onClose={() => setSel(null)} />}
        </div>
      </section>
    </>
  );
}
