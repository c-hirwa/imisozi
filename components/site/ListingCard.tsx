"use client";

import Link from "next/link";
import { useState } from "react";
import { AREAS, STATUS_LABEL, TYPE_LABEL, img, price, type Listing } from "@/lib/data";
import { toggleSaved, useSaved } from "@/lib/store";
import { useCurrency } from "./currency";
import { HeartIcon } from "./Header";

export function ListingCard({ l, active, onHover, priority }: { l: Listing; active?: boolean; onHover?: (id: string | null) => void; priority?: boolean }) {
  const cur = useCurrency();
  const saved = useSaved().includes(l.id);
  const off = l.status === "let" || l.status === "sold";
  const [now] = useState(() => Date.now());
  const fresh = now - l.listedAt < 3 * 86400000;
  return (
    <article onMouseEnter={() => onHover?.(l.id)} onMouseLeave={() => onHover?.(null)}
      className={`group relative rounded-2xl transition-shadow ${active ? "ring-2 ring-jac ring-offset-4" : ""}`}>
      <div className="relative overflow-hidden rounded-2xl bg-mist">
        <img src={img(l.photos[0], 700, 500)} alt="" loading={priority ? "eager" : "lazy"}
          className={`aspect-[7/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${off ? "grayscale-[.6]" : ""}`} />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold">{l.purpose === "rent" ? "For rent" : "For sale"}</span>
          {l.status !== "available" && <span className="rounded-full bg-basalt px-2.5 py-1 text-xs font-bold text-white">{STATUS_LABEL[l.status]}</span>}
          {l.status === "available" && fresh && <span className="rounded-full bg-sun px-2.5 py-1 text-xs font-bold">New</span>}
        </div>
        <button onClick={(e) => { e.preventDefault(); toggleSaved(l.id); }} aria-pressed={saved} aria-label={saved ? `Remove ${l.title} from saved` : `Save ${l.title}`}
          className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-white/95 shadow-sm hover:scale-105">
          <HeartIcon filled={saved} key={String(saved)} className={`size-5 ${saved ? "pop" : ""}`} />
        </button>
      </div>
      <div className="px-1 pt-3">
        <p className="text-lg font-extrabold tracking-tight tnum">{price(l.price, cur, l.purpose)}</p>
        <h3 className="mt-0.5 font-semibold leading-snug">
          <Link href={`/properties/${l.id}`} className="after:absolute after:inset-0 after:content-['']">{l.title}</Link>
        </h3>
        <p className="mt-1 text-sm text-muted">
          {TYPE_LABEL[l.type]} in {AREAS[l.area].label}
        </p>
        <Facts l={l} className="mt-2" />
      </div>
    </article>
  );
}

export function Facts({ l, className = "" }: { l: Listing; className?: string }) {
  const items = l.type === "plot"
    ? [`${l.size.toLocaleString()} m² of land`]
    : [`${l.beds} ${l.beds === 1 ? "bed" : "beds"}`, `${l.baths} ${l.baths === 1 ? "bath" : "baths"}`, `${l.size} m²`, l.furnished ? "Furnished" : "Unfurnished"];
  return (
    <ul className={`flex flex-wrap gap-x-3 gap-y-1 text-sm text-basalt-soft ${className}`}>
      {items.map((t) => <li key={t} className="tnum">{t}</li>)}
    </ul>
  );
}
