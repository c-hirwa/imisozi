"use client";

import { useState } from "react";
import { AREAS, img, price } from "@/lib/data";
import { updateLead, type DB, type Lead, type LeadStatus } from "@/lib/store";
import { H1, LEAD_LABEL, LeadPill, ago, dayLabel, waNumber } from "./ui";

function viewDay(d: string) {
  const first = dayLabel(d).split(",")[0];
  return first === "Today" || first === "Tomorrow" || first === "Yesterday" ? first.toLowerCase() : `on ${first}`;
}

export function Leads({ db }: { db: DB }) {
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [openId, setOpenId] = useState<number | null>(null);
  const list = db.leads.filter((l) => filter === "all" || l.status === filter).sort((a, b) => b.createdAt - a.createdAt);
  const open = db.leads.find((l) => l.id === openId);
  const counts = (s: LeadStatus) => db.leads.filter((l) => l.status === s).length;

  return (
    <>
      <H1>Leads</H1>
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-full bg-white p-1 text-sm font-semibold [scrollbar-width:none] sm:w-fit" role="radiogroup" aria-label="Filter leads">
        {(["all", "new", "contacted", "viewing", "closed"] as const).map((f) => (
          <button key={f} role="radio" aria-checked={filter === f} onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 ${filter === f ? "bg-basalt text-white" : "text-muted hover:text-basalt"}`}>
            {f === "all" ? "All" : LEAD_LABEL[f]} <span className="tnum opacity-70">{f === "all" ? db.leads.length : counts(f)}</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? <p className="rounded-2xl bg-white p-6 text-muted">No leads here. New enquiries from the website land in &ldquo;New&rdquo;.</p> : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-white">
          {list.map((l) => {
            const home = db.listings.find((x) => x.id === l.listingId);
            return (
              <li key={l.id}>
                <button onClick={() => setOpenId(l.id)} className={`flex w-full items-center gap-4 px-4 py-3.5 text-left hover:bg-mist/60 ${l.status === "new" ? "bg-jac-soft/40" : ""}`}>
                  {home ? <img src={img(home.photos[0], 120, 120)} alt="" className="size-12 shrink-0 rounded-lg object-cover" /> : <span className="size-12 shrink-0 rounded-lg bg-mist" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{l.name}</span>
                      <span className="text-sm text-muted">{l.kind === "viewing" ? `wants to view ${viewDay(l.date!)} at ${l.slot}` : "asked a question"}</span>
                    </div>
                    <p className="truncate text-sm text-muted">{home ? `${home.title}, ${AREAS[home.area].label}` : l.listingId}</p>
                  </div>
                  <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex"><LeadPill s={l.status} /><span className="text-xs text-muted">{ago(l.createdAt)}</span></div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {open && <LeadDrawer lead={open} db={db} onClose={() => setOpenId(null)} />}
    </>
  );
}

function LeadDrawer({ lead: l, db, onClose }: { lead: Lead; db: DB; onClose: () => void }) {
  const home = db.listings.find((x) => x.id === l.listingId);
  const [notes, setNotes] = useState(l.notes ?? "");
  const first = l.name.split(" ")[0];
  const reply = l.kind === "viewing"
    ? `Hi ${first}, this is Imisozi Homes. Your viewing of "${home?.title}" on ${l.date} at ${l.slot} is confirmed. I'll send the exact location shortly.`
    : `Hi ${first}, this is Imisozi Homes about "${home?.title}" (${l.listingId}). `;
  return (
    <div className="fixed inset-0 z-[1500] flex justify-end" role="dialog" aria-modal="true" aria-label={`Lead from ${l.name}`}>
      <div className="fade-in absolute inset-0 bg-basalt/40" onClick={onClose} />
      <div className="fade-in relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-mist text-xl" aria-label="Close" autoFocus>×</button>
        <p className="text-sm text-muted">{l.kind === "viewing" ? "Viewing request" : "Question"}, {ago(l.createdAt)}</p>
        <h2 className="mt-1 text-2xl font-extrabold">{l.name}</h2>
        <p className="tnum">{l.phone}{l.email ? `, ${l.email}` : ""}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a href={`https://wa.me/${waNumber(l.phone)}?text=${encodeURIComponent(reply)}`} target="_blank" rel="noopener" onClick={() => l.status === "new" && updateLead(l.id, { status: "contacted" })}
            className="rounded-full bg-[#1fa855] py-2.5 text-center text-sm font-bold text-white">Reply on WhatsApp</a>
          <a href={`tel:${l.phone.replace(/\s/g, "")}`} className="rounded-full border border-line py-2.5 text-center text-sm font-bold">Call</a>
        </div>
        {l.kind === "viewing" && <p className="mt-5 rounded-xl bg-sage/60 p-3 font-semibold">{dayLabel(l.date!)} at {l.slot}</p>}
        {l.message && <p className="mt-5 rounded-xl bg-mist p-4">“{l.message}”</p>}
        {home && (
          <div className="mt-5 flex gap-3 rounded-xl border border-line p-3">
            <img src={img(home.photos[0], 200, 200)} alt="" className="size-16 rounded-lg object-cover" />
            <div className="min-w-0">
              <p className="font-semibold leading-snug">{home.title}</p>
              <p className="text-sm text-muted">{home.id}, {AREAS[home.area].label}</p>
              <p className="text-sm font-bold tnum">{price(home.price, "RWF", home.purpose)}</p>
            </div>
          </div>
        )}
        <p className="mt-6 text-sm font-semibold">Status</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["new", "contacted", "viewing", "closed"] as const).map((s) => (
            <button key={s} onClick={() => updateLead(l.id, { status: s })} aria-pressed={l.status === s}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold ${l.status === s ? "border-basalt bg-basalt text-white" : "border-line hover:border-basalt-soft"}`}>{LEAD_LABEL[s]}</button>
          ))}
        </div>
        <label className="mt-6 block text-sm font-semibold">Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => updateLead(l.id, { notes: notes.trim() || undefined })}
            placeholder="Budget, move-in date, what they liked..." className="mt-1.5 min-h-28 w-full rounded-xl border border-line p-3 font-normal focus:border-jac focus:outline-none" />
        </label>
        <p className="mt-1 text-xs text-muted">Saved when you click away.</p>
      </div>
    </div>
  );
}
