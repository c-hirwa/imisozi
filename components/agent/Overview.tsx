"use client";

import { useState } from "react";
import { AREAS, img } from "@/lib/data";
import { ymd, type DB } from "@/lib/store";
import type { Tab } from "./AgentApp";
import { H1, LeadPill, ago, dayLabel } from "./ui";

export function Overview({ db, go }: { db: DB; go: (t: Tab) => void }) {
  const [now] = useState(() => Date.now());
  const today = ymd(new Date(now));
  const in7 = ymd(new Date(now + 7 * 86400000));
  const live = db.listings.filter((l) => l.status === "available" || l.status === "under-offer");
  const newLeads = db.leads.filter((l) => l.status === "new");
  const upcoming = db.leads.filter((l) => l.kind === "viewing" && l.status === "viewing" && l.date! >= today && l.date! <= in7)
    .sort((a, b) => (a.date! + a.slot).localeCompare(b.date! + b.slot));
  const weekLeads = db.leads.filter((l) => now - l.createdAt < 7 * 86400000).length;
  const top = [...live].sort((a, b) => b.views - a.views).slice(0, 5);
  const leadCount = (id: string) => db.leads.filter((l) => l.listingId === id).length;
  const byId = (id: string) => db.listings.find((l) => l.id === id);

  return (
    <>
      <H1 aside={<p className="text-muted">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>}>Good to see you</H1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <button onClick={() => go("leads")} className="rounded-2xl bg-jac p-4 text-left text-white hover:bg-jac-deep">
          <p className="text-sm font-semibold text-white/85">Leads to answer</p>
          <p className="mt-1 text-4xl font-extrabold tnum">{newLeads.length}</p>
        </button>
        <Stat label="Viewings next 7 days" value={upcoming.length} />
        <Stat label="Live listings" value={live.length} sub={`${db.listings.filter((l) => l.status === "under-offer").length} under offer`} />
        <Stat label="Leads this week" value={weekLeads} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl bg-white p-5">
          <div className="flex items-center justify-between"><h2 className="font-bold">Waiting for a reply</h2><button onClick={() => go("leads")} className="text-sm font-bold text-jac">All leads</button></div>
          {newLeads.length === 0 ? <p className="mt-3 text-muted">All caught up.</p> : (
            <ul className="mt-3 divide-y divide-line">
              {newLeads.slice(0, 5).map((l) => (
                <li key={l.id} className="py-3">
                  <div className="flex items-center gap-2"><span className="font-bold">{l.name}</span><LeadPill s={l.status} /><span className="ml-auto text-xs text-muted">{ago(l.createdAt)}</span></div>
                  <p className="text-sm text-muted">About {byId(l.listingId)?.title ?? l.listingId}</p>
                  {l.message && <p className="mt-1 text-sm">“{l.message}”</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl bg-white p-5">
          <div className="flex items-center justify-between"><h2 className="font-bold">Coming up</h2><button onClick={() => go("viewings")} className="text-sm font-bold text-jac">All viewings</button></div>
          {upcoming.length === 0 ? <p className="mt-3 text-muted">No viewings booked this week.</p> : (
            <ul className="mt-3 divide-y divide-line">
              {upcoming.slice(0, 5).map((v) => {
                const l = byId(v.listingId);
                return (
                  <li key={v.id} className="flex items-center gap-3 py-3">
                    <span className="w-14 shrink-0 text-lg font-extrabold tnum">{v.slot}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{v.name}, {l ? AREAS[l.area].label : v.listingId}</p>
                      <p className="text-sm text-muted">{dayLabel(v.date!)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-5">
        <h2 className="font-bold">Most viewed listings</h2>
        <ul className="mt-3 divide-y divide-line">
          {top.map((l) => {
            const max = top[0].views || 1;
            return (
              <li key={l.id} className="flex items-center gap-3 py-3">
                <img src={img(l.photos[0], 120, 120)} alt="" className="size-11 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{l.title}</p>
                  <div className="mt-1 h-1.5 rounded-full bg-mist"><div className="h-1.5 rounded-full bg-jac" style={{ width: `${(l.views / max) * 100}%` }} /></div>
                </div>
                <div className="w-28 text-right text-sm tnum"><span className="font-bold">{l.views}</span> views<br /><span className="text-muted">{leadCount(l.id)} leads</span></div>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-1 text-4xl font-extrabold tnum">{value}</p>
      {sub && <p className="text-sm text-muted">{sub}</p>}
    </div>
  );
}
