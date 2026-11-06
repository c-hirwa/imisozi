"use client";

import { useState } from "react";
import { AREAS, img } from "@/lib/data";
import { updateLead, ymd, type DB } from "@/lib/store";
import { H1, dayLabel, waNumber } from "./ui";

export function Viewings({ db }: { db: DB }) {
  const [past, setPast] = useState(false);
  const today = ymd(new Date());
  const all = db.leads.filter((l) => l.kind === "viewing").sort((a, b) => (a.date! + a.slot).localeCompare(b.date! + b.slot));
  const list = past ? all.filter((v) => v.date! < today).reverse() : all.filter((v) => v.date! >= today);
  const days = [...new Set(list.map((v) => v.date!))];
  return (
    <>
      <H1 aside={
        <div className="flex rounded-full bg-white p-1 text-sm font-semibold" role="radiogroup" aria-label="Which viewings">
          {[false, true].map((p) => (
            <button key={String(p)} role="radio" aria-checked={past === p} onClick={() => setPast(p)} className={`rounded-full px-3.5 py-1.5 ${past === p ? "bg-basalt text-white" : "text-muted"}`}>{p ? "Past" : "Upcoming"}</button>
          ))}
        </div>
      }>Viewings</H1>
      {days.length === 0 && <p className="rounded-2xl bg-white p-6 text-muted">{past ? "No past viewings yet." : "Nothing booked. Viewing requests from the website appear here."}</p>}
      <div className="space-y-6">
        {days.map((d) => (
          <section key={d}>
            <h2 className="mb-2 font-bold">{dayLabel(d)}</h2>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-white">
              {list.filter((v) => v.date === d).map((v) => {
                const home = db.listings.find((x) => x.id === v.listingId);
                const done = v.status === "closed";
                return (
                  <li key={v.id} className={`flex flex-wrap items-center gap-4 px-4 py-3.5 ${done ? "opacity-60" : ""}`}>
                    <span className="w-14 text-xl font-extrabold tnum">{v.slot}</span>
                    {home && <img src={img(home.photos[0], 120, 120)} alt="" className="size-11 rounded-lg object-cover" />}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{v.name} <span className="font-normal text-muted tnum">{v.phone}</span></p>
                      <p className="truncate text-sm text-muted">{home ? `${home.title}, ${AREAS[home.area].label}` : v.listingId}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={`https://wa.me/${waNumber(v.phone)}?text=${encodeURIComponent(`Hi ${v.name.split(" ")[0]}, a reminder about your viewing at ${v.slot}. Here's the location: `)}`} target="_blank" rel="noopener"
                        className="rounded-full border border-line px-3 py-1.5 text-sm font-bold hover:bg-mist">Send location</a>
                      <button onClick={() => updateLead(v.id, { status: done ? "viewing" : "closed" })} className="rounded-full bg-basalt px-3 py-1.5 text-sm font-bold text-white">{done ? "Undo" : "Done"}</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
