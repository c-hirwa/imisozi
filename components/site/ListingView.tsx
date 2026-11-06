"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AGENCY, AGENTS, AREAS, STATUS_LABEL, TYPE_LABEL, distances, img, price, type Listing } from "@/lib/data";
import { countView, toggleSaved, useDB, useSaved } from "@/lib/store";
import { useCurrency } from "./currency";
import { HeartIcon } from "./Header";
import { ListingCard } from "./ListingCard";
import { Map } from "./Map";
import { Contact } from "./Contact";

export function ListingView({ id }: { id: string }) {
  const db = useDB();
  const cur = useCurrency();
  const saved = useSaved().includes(id);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const l = db?.listings.find((x) => x.id === id);

  useEffect(() => { if (l) countView(l.id); }, [l]);

  const similar = useMemo(() => {
    if (!db || !l) return [];
    return db.listings
      .filter((x) => x.id !== l.id && x.purpose === l.purpose && x.status === "available")
      .map((x) => ({ x, score: (x.area === l.area ? 2 : 0) + (x.type === l.type ? 1 : 0) - Math.abs(x.price - l.price) / l.price }))
      .sort((a, b) => b.score - a.score).slice(0, 3).map((s) => s.x);
  }, [db, l]);

  if (!db) return <div className="mx-auto h-[70vh] max-w-7xl animate-pulse px-4 py-8"><div className="h-full rounded-3xl bg-mist" /></div>;
  if (!l) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-3xl font-extrabold">This home isn&apos;t listed any more</h1>
        <p className="mt-2 text-muted">It may have been taken off the market. There are plenty of others.</p>
        <Link href="/properties" className="mt-6 inline-block rounded-full bg-basalt px-5 py-3 font-bold text-white">Browse homes</Link>
      </main>
    );
  }

  const agent = AGENTS.find((a) => a.id === l.agent) ?? AGENTS[0];
  const d = distances(l);
  const off = l.status === "let" || l.status === "sold";

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: l!.title, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch {}
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 sm:px-6 lg:pb-0">
      <nav className="py-4 text-sm text-muted" aria-label="Breadcrumb">
        <Link href={`/properties?purpose=${l.purpose}`} className="hover:text-basalt hover:underline">{l.purpose === "rent" ? "Homes to rent" : "Homes for sale"}</Link>
        <span aria-hidden="true"> / </span>
        <Link href={`/properties?purpose=${l.purpose}&area=${l.area}`} className="hover:text-basalt hover:underline">{AREAS[l.area].label}</Link>
      </nav>

      <Gallery photos={l.photos} title={l.title} onOpen={setLightbox} />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start gap-4">
            <div className="min-w-0 basis-full sm:basis-0 sm:flex-1">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold">{l.purpose === "rent" ? "For rent" : "For sale"}</span>
                {l.status !== "available" && <span className="rounded-full bg-basalt px-3 py-1 text-xs font-bold text-white">{STATUS_LABEL[l.status]}</span>}
              </div>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{l.title}</h1>
              <p className="mt-1 text-muted">{TYPE_LABEL[l.type]} in {AREAS[l.area].label}, Kigali</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleSaved(l.id)} aria-pressed={saved} className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-bold hover:bg-mist">
                <HeartIcon filled={saved} key={String(saved)} className={`size-5 ${saved ? "pop" : ""}`} /> {saved ? "Saved" : "Save"}
              </button>
              <button onClick={share} className="rounded-full border border-line px-4 py-2 text-sm font-bold hover:bg-mist">{copied ? "Link copied" : "Share"}</button>
            </div>
          </div>
          <p className="mt-5 text-3xl font-extrabold tracking-tight tnum">{price(l.price, cur, l.purpose)}</p>
          {cur === "RWF" && <p className="text-sm text-muted tnum">About {price(l.price, "USD", l.purpose)}</p>}
          {cur === "USD" && <p className="text-sm text-muted tnum">{price(l.price, "RWF", l.purpose)}</p>}

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {(l.type === "plot"
              ? [["Land", `${l.size.toLocaleString()} m²`], ["Type", "Residential plot"], ["Title", l.features.includes("Title deed ready") ? "Ready" : "Ask us"]]
              : [["Bedrooms", l.beds], ["Bathrooms", l.baths], ["Size", `${l.size} m²`], ["Parking", l.parking ? `${l.parking} ${l.parking === 1 ? "car" : "cars"}` : "Street"], ["Furnishing", l.furnished ? "Furnished" : "Unfurnished"], ["Type", TYPE_LABEL[l.type]]]
            ).map(([k, v]) => (
              <div key={String(k)} className="bg-white p-4">
                <dt className="text-sm text-muted">{k}</dt>
                <dd className="text-lg font-bold tnum">{v}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-10">
            <h2 className="text-xl font-extrabold">About this home</h2>
            <p className="mt-3 max-w-[68ch] text-lg leading-relaxed text-basalt-soft">{l.description}</p>
          </section>

          {l.features.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-extrabold">What&apos;s included</h2>
              <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {l.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <svg viewBox="0 0 20 20" className="size-5 shrink-0 text-jac" aria-hidden="true"><circle cx="10" cy="10" r="10" fill="currentColor" opacity=".14" /><path d="M6 10.5l2.6 2.5L14 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-10">
            <h2 className="text-xl font-extrabold">Where it is</h2>
            <p className="mt-2 text-muted">{AREAS[l.area].blurb}</p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-line">
              <Map listings={[l]} currency={cur} center={[l.lat, l.lng]} zoom={15} activeId={l.id} className="h-72 w-full" />
            </div>
            <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <li><span className="font-bold tnum">{d.cbd.toFixed(1)} km</span> <span className="text-muted">to the city centre</span></li>
              <li><span className="font-bold tnum">{d.airport.toFixed(1)} km</span> <span className="text-muted">to Kigali International Airport</span></li>
              <li className="text-muted">Straight-line distances. The exact address is shared when you book a viewing.</li>
            </ul>
          </section>
          <p className="mt-8 text-sm text-muted">Reference {l.id}. Listed {new Date(l.listedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.</p>
        </div>

        <aside id="contact" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
          <Contact listing={l} agent={agent} off={off} leads={db.leads} />
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-extrabold tracking-tight">Similar homes</h2>
          <div className="mt-6 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((x) => <ListingCard key={x.id} l={x} />)}
          </div>
        </section>
      )}

      {/* mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-[1040] flex items-center gap-3 border-t border-line bg-white px-4 py-3 lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate font-extrabold tnum">{price(l.price, cur, l.purpose)}</p>
          <p className="truncate text-xs text-muted">{AREAS[l.area].label}</p>
        </div>
        <a href={`https://wa.me/${AGENCY.whatsapp}?text=${encodeURIComponent(`Hi, I'm interested in ${l.title} (${l.id}).`)}`} target="_blank" rel="noopener"
          className="rounded-full border border-line px-4 py-2.5 text-sm font-bold">WhatsApp</a>
        {!off && <a href="#contact" className="rounded-full bg-jac px-4 py-2.5 text-sm font-bold text-white">Book a viewing</a>}
      </div>

      {lightbox !== null && <Lightbox photos={l.photos} start={lightbox} onClose={() => setLightbox(null)} />}
    </main>
  );
}

function Gallery({ photos, title, onOpen }: { photos: string[]; title: string; onOpen: (i: number) => void }) {
  const [idx, setIdx] = useState(0);
  return (
    <>
      {/* mobile: swipe */}
      <div className="relative -mx-4 sm:-mx-6 md:hidden">
        <div className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
          onScroll={(e) => { const t = e.currentTarget; setIdx(Math.round(t.scrollLeft / t.clientWidth)); }}>
          {photos.map((p, i) => (
            <button key={i} onClick={() => onOpen(i)} className="w-full shrink-0 snap-center" aria-label={`Open photo ${i + 1}`}>
              <img src={img(p, 900, 640)} alt={i === 0 ? title : ""} className="aspect-[4/3] w-full bg-mist object-cover" loading={i ? "lazy" : "eager"} />
            </button>
          ))}
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-basalt/80 px-2.5 py-1 text-xs font-bold text-white tnum">{idx + 1} / {photos.length}</span>
      </div>
      {/* desktop: mosaic */}
      <div className="relative hidden h-[460px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl md:grid">
        {photos.slice(0, 5).map((p, i) => (
          <button key={i} onClick={() => onOpen(i)} aria-label={`Open photo ${i + 1}`}
            className={`group overflow-hidden bg-mist ${i === 0 ? "col-span-2 row-span-2" : ""} ${photos.length === 2 && i === 1 ? "col-span-2 row-span-2" : ""}`}>
            <img src={img(p, i === 0 ? 1200 : 600, i === 0 ? 920 : 460)} alt={i === 0 ? title : ""} className="size-full object-cover transition duration-500 group-hover:scale-[1.03] group-hover:brightness-95" />
          </button>
        ))}
        <button onClick={() => onOpen(0)} className="absolute bottom-4 right-4 rounded-full bg-white px-4 py-2 text-sm font-bold shadow-lg">
          Show all {photos.length} photos
        </button>
      </div>
    </>
  );
}

function Lightbox({ photos, start, onClose }: { photos: string[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((x) => (x + 1) % photos.length);
      if (e.key === "ArrowLeft") setI((x) => (x - 1 + photos.length) % photos.length);
    };
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [photos.length, onClose]);
  const btn = "grid size-12 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20";
  return (
    <div role="dialog" aria-modal="true" aria-label="Photos" className="fade-in fixed inset-0 z-[2000] flex flex-col bg-basalt">
      <div className="flex items-center justify-between p-4 text-white">
        <span className="font-bold tnum">{i + 1} / {photos.length}</span>
        <button onClick={onClose} className={btn} aria-label="Close photos" autoFocus>×</button>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-2 pb-6 sm:px-20">
        <img key={i} src={img(photos[i], 1800)} alt="" className="fade-in max-h-full max-w-full rounded-xl object-contain" />
        <button onClick={() => setI((i - 1 + photos.length) % photos.length)} className={`${btn} absolute left-3 sm:left-6`} aria-label="Previous photo">‹</button>
        <button onClick={() => setI((i + 1) % photos.length)} className={`${btn} absolute right-3 sm:right-6`} aria-label="Next photo">›</button>
      </div>
      <div className="flex justify-center gap-2 overflow-x-auto px-4 pb-5">
        {photos.map((p, j) => (
          <button key={j} onClick={() => setI(j)} aria-label={`Photo ${j + 1}`} aria-current={i === j}
            className={`shrink-0 overflow-hidden rounded-lg ${i === j ? "ring-2 ring-white" : "opacity-50 hover:opacity-80"}`}>
            <img src={img(p, 160, 110)} alt="" className="h-14 w-20 object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

export type { Listing };
