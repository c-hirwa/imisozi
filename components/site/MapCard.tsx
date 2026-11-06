"use client";

import Link from "next/link";
import { AREAS, img, price, type Listing } from "@/lib/data";
import { useCurrency } from "./currency";
import { Facts } from "./ListingCard";

export function MapCard({ l, onClose, className = "bottom-4" }: { l: Listing; onClose: () => void; className?: string }) {
  const cur = useCurrency();
  return (
    <div className={`fade-in absolute ${className} left-4 right-4 z-[500] flex overflow-hidden rounded-2xl bg-white shadow-2xl sm:right-auto sm:w-96`}>
      <img src={img(l.photos[0], 300, 300)} alt="" className="w-28 shrink-0 object-cover sm:w-32" />
      <div className="min-w-0 flex-1 p-3 pr-9">
        <p className="font-extrabold tnum">{price(l.price, cur, l.purpose)}</p>
        <Link href={`/properties/${l.id}`} className="line-clamp-2 font-semibold leading-snug hover:underline">{l.title}</Link>
        <p className="text-sm text-muted">{AREAS[l.area].label}</p>
        <Facts l={l} className="mt-1 text-xs" />
      </div>
      <button onClick={onClose} aria-label="Close" className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-mist text-lg leading-none">×</button>
    </div>
  );
}
