"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AREAS, FEATURES, STATUS_LABEL, TYPE_LABEL, img, price,
  type AreaId, type Listing, type PropType, type Purpose, type Status,
} from "@/lib/data";
import { deleteListing, nextListingId, saveListing, setListingStatus, type DB } from "@/lib/store";
import { Map } from "@/components/site/Map";
import { H1, StatusDot } from "./ui";

// A small library of sample photos so a demo listing can be created without uploads.
const LIBRARY = [
  "1642667670006-6b3059ccf96d", "1787672358119-25cb4c768d14", "1586228046763-cd367fc926bf", "1721815693498-cc28507c0ba2",
  "1771366260867-7e07094579d7", "1613977257363-707ba9348227", "1784853879843-f3c5aacf2569", "1760235674447-fe0cc115b697",
  "1600494448850-6013c64ba722", "1724582586529-62622e50c0b3", "1628744876497-eb30460be9f6", "1600210492493-0946911123ea",
  "1615874959474-d609969a20ed", "1616594039964-ae9021a400a0", "1774578342100-f779e988c83d", "1617228069096-4638a7ffc906",
  "1600489000022-c2086d79f9d4", "1588854337236-6889d631faa8", "1584622650111-993a426fbf0a", "1761591672132-b4d3588992d1",
];

export function Listings({ db, notify }: { db: DB; notify: (m: string) => void }) {
  const [editing, setEditing] = useState<Listing | "new" | null>(null);
  const [q, setQ] = useState("");
  const leadCount = (id: string) => db.leads.filter((l) => l.listingId === id).length;

  if (editing) {
    return (
      <Editor db={db} initial={editing === "new" ? null : editing}
        onCancel={() => setEditing(null)}
        onSaved={(l, isNew) => { setEditing(null); notify(isNew ? `${l.id} is live on the website.` : `${l.id} updated.`); }} />
    );
  }

  const list = db.listings.filter((l) => !q || `${l.title} ${l.id} ${AREAS[l.area].label}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <H1 aside={<button onClick={() => setEditing("new")} className="rounded-full bg-jac px-5 py-2.5 font-bold text-white hover:bg-jac-deep">Add a listing</button>}>Listings</H1>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, reference or area" aria-label="Search listings"
        className="mb-4 w-full max-w-md rounded-full border border-line bg-white px-4 py-2.5 focus:border-jac focus:outline-none" />
      <div className="overflow-x-auto rounded-2xl bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="text-left text-muted">
            <tr>
              <th className="p-3 font-semibold">Home</th><th className="p-3 font-semibold">Price</th>
              <th className="p-3 font-semibold">Status</th><th className="p-3 text-right font-semibold">Views</th>
              <th className="p-3 text-right font-semibold">Leads</th><th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {list.map((l) => (
              <tr key={l.id} className="border-t border-line">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={img(l.photos[0], 140, 100)} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="max-w-72 truncate font-semibold">{l.title}</p>
                      <p className="text-muted">{l.id}, {l.purpose === "rent" ? "rent" : "sale"}, {AREAS[l.area].label}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 font-semibold tnum">{price(l.price, "RWF", l.purpose, true)}</td>
                <td className="p-3">
                  <label className="flex items-center gap-2">
                    <StatusDot s={l.status} />
                    <select aria-label={`Status of ${l.id}`} value={l.status} onChange={(e) => setListingStatus(l.id, e.target.value as Status)}
                      className="rounded-lg border border-line bg-white px-2 py-1.5 font-semibold">
                      {(Object.keys(STATUS_LABEL) as Status[]).filter((s) => l.purpose === "rent" ? s !== "sold" : s !== "let").map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </label>
                </td>
                <td className="p-3 text-right tnum">{l.views}</td>
                <td className="p-3 text-right tnum">{leadCount(l.id)}</td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-3 font-bold">
                    <Link href={`/properties/${l.id}`} target="_blank" className="text-muted hover:text-basalt">View</Link>
                    <button onClick={() => setEditing(l)} className="text-jac hover:underline">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ---------------- editor ----------------

async function compress(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / bmp.width);
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.72);
}

type Form = Omit<Listing, "price" | "beds" | "baths" | "size" | "parking"> & { price: string; beds: string; baths: string; size: string; parking: string };

function Editor({ db, initial, onCancel, onSaved }: { db: DB; initial: Listing | null; onCancel: () => void; onSaved: (l: Listing, isNew: boolean) => void }) {
  const isNew = !initial;
  const [f, setF] = useState<Form>(() => {
    const base: Listing = initial ?? {
      id: nextListingId(db), title: "", purpose: "rent", type: "house", area: "kacyiru", price: 0, beds: 3, baths: 2, size: 150,
      furnished: false, parking: 1, features: [], description: "", photos: [], lat: AREAS.kacyiru.lat, lng: AREAS.kacyiru.lng,
      status: "available", listedAt: Date.now(), agent: "aline", views: 0,
    };
    return { ...base, price: base.price ? String(base.price) : "", beds: String(base.beds), baths: String(base.baths), size: String(base.size), parking: String(base.parking) };
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [lib, setLib] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));
  const plot = f.type === "plot";

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const urls = await Promise.all([...files].slice(0, 8).map(compress));
      setF((p) => ({ ...p, photos: [...p.photos, ...urls] }));
    } finally { setBusy(false); }
  }

  function save() {
    const errs: string[] = [];
    if (f.title.trim().length < 8) errs.push("Give it a title of at least a few words, like “Three-bed house with a garden”.");
    if (!Number(f.price)) errs.push("Add the price in RWF.");
    if (!f.photos.length) errs.push("Add at least one photo. Listings with photos get far more enquiries.");
    if (f.description.trim().length < 30) errs.push("Write a short description, two or three sentences.");
    setErrors(errs);
    if (errs.length) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const l: Listing = {
      ...f, title: f.title.trim(), description: f.description.trim(), price: Number(f.price),
      beds: plot ? 0 : Number(f.beds), baths: plot ? 0 : Number(f.baths), size: Number(f.size) || 0, parking: plot ? 0 : Number(f.parking),
      furnished: plot ? false : f.furnished, agent: f.purpose === "rent" ? "aline" : "david",
    };
    try { saveListing(l); onSaved(l, isNew); }
    catch (e) { setErrors([(e as Error).message]); }
  }

  const input = "mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 font-normal focus:border-jac focus:outline-none";
  const seg = (on: boolean) => `rounded-full px-4 py-2 text-sm font-bold ${on ? "bg-basalt text-white" : "bg-white text-muted border border-line"}`;

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={onCancel} className="mb-4 text-sm font-bold text-muted hover:text-basalt">← Back to listings</button>
      <H1 aside={<span className="text-sm text-muted">{f.id}</span>}>{isNew ? "New listing" : "Edit listing"}</H1>

      {errors.length > 0 && (
        <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-bold">A few things before this can go live:</p>
          <ul className="mt-1 list-disc pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      <div className="space-y-6">
        <Card title="Basics">
          <div className="flex flex-wrap gap-2">
            {(["rent", "sale"] as Purpose[]).map((p) => <button key={p} type="button" onClick={() => set("purpose", p)} className={seg(f.purpose === p)} aria-pressed={f.purpose === p}>{p === "rent" ? "For rent" : "For sale"}</button>)}
          </div>
          <label className="mt-4 block text-sm font-semibold">Title<input className={input} value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Three-bed house with a garden" maxLength={70} /></label>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-semibold">Type
              <select className={input} value={f.type} onChange={(e) => set("type", e.target.value as PropType)}>
                {(Object.keys(TYPE_LABEL) as PropType[]).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Neighbourhood
              <select className={input} value={f.area} onChange={(e) => { const a = e.target.value as AreaId; setF((p) => ({ ...p, area: a, lat: AREAS[a].lat, lng: AREAS[a].lng })); }}>
                {Object.entries(AREAS).sort((a, b) => a[1].label.localeCompare(b[1].label)).map(([id, a]) => <option key={id} value={id}>{a.label}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Price in RWF{f.purpose === "rent" ? " per month" : ""}
              <input className={input} value={f.price} onChange={(e) => set("price", e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder={f.purpose === "rent" ? "800000" : "150000000"} />
              {Number(f.price) > 0 && <span className="mt-1 block text-xs font-normal text-muted tnum">{price(Number(f.price), "RWF", f.purpose)}, about {price(Number(f.price), "USD", f.purpose)}</span>}
            </label>
          </div>
        </Card>

        <Card title="Details">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {!plot && <Num label="Bedrooms" v={f.beds} on={(v) => set("beds", v)} />}
            {!plot && <Num label="Bathrooms" v={f.baths} on={(v) => set("baths", v)} />}
            <Num label={plot ? "Land size (m²)" : "Size (m²)"} v={f.size} on={(v) => set("size", v)} />
            {!plot && <Num label="Parking spaces" v={f.parking} on={(v) => set("parking", v)} />}
          </div>
          {!plot && (
            <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={f.furnished} onChange={(e) => set("furnished", e.target.checked)} className="size-4 accent-jac" /> Furnished
            </label>
          )}
          <p className="mt-5 text-sm font-semibold">What&apos;s included</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {FEATURES.map((ft) => {
              const on = f.features.includes(ft);
              return (
                <button key={ft} type="button" aria-pressed={on} onClick={() => set("features", on ? f.features.filter((x) => x !== ft) : [...f.features, ft])}
                  className={`rounded-full border px-3 py-1.5 text-sm ${on ? "border-jac bg-jac-soft font-semibold text-jac-deep" : "border-line hover:border-basalt-soft"}`}>{ft}</button>
              );
            })}
          </div>
          <label className="mt-5 block text-sm font-semibold">Description
            <textarea className={`${input} min-h-32`} value={f.description} onChange={(e) => set("description", e.target.value)}
              placeholder="What makes it good to live in? Light, garden, road, water, security, what's nearby." />
          </label>
        </Card>

        <Card title="Photos" hint="The first photo is the cover. Uploads are resized on your device before saving.">
          {f.photos.length > 0 && (
            <ul className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {f.photos.map((p, i) => (
                <li key={i} className="group relative">
                  <img src={img(p, 300, 220)} alt="" className={`aspect-[4/3] w-full rounded-xl object-cover ${i === 0 ? "ring-3 ring-jac" : ""}`} />
                  {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-jac px-2 py-0.5 text-xs font-bold text-white">Cover</span>}
                  <div className="absolute inset-x-2 bottom-2 flex gap-1">
                    {i > 0 && <button type="button" onClick={() => set("photos", [p, ...f.photos.filter((_, j) => j !== i)])} className="rounded-full bg-white/95 px-2 py-0.5 text-xs font-bold">Make cover</button>}
                    <button type="button" onClick={() => set("photos", f.photos.filter((_, j) => j !== i))} className="ml-auto rounded-full bg-white/95 px-2 py-0.5 text-xs font-bold" aria-label={`Remove photo ${i + 1}`}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-full bg-basalt px-4 py-2.5 text-sm font-bold text-white hover:bg-basalt-soft">
              {busy ? "Preparing photos…" : "Upload photos"}
              <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
            </label>
            <button type="button" onClick={() => setLib((v) => !v)} aria-expanded={lib} className="rounded-full border border-line bg-white px-4 py-2.5 text-sm font-bold">
              {lib ? "Hide sample photos" : "Pick from sample photos"}
            </button>
          </div>
          {lib && (
            <ul className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-5">
              {LIBRARY.map((p) => {
                const on = f.photos.includes(p);
                return (
                  <li key={p}>
                    <button type="button" aria-pressed={on} onClick={() => set("photos", on ? f.photos.filter((x) => x !== p) : [...f.photos, p])}
                      className={`block w-full overflow-hidden rounded-lg ${on ? "ring-3 ring-jac" : "opacity-85 hover:opacity-100"}`}>
                      <img src={img(p, 200, 150)} alt="" className="aspect-[4/3] w-full object-cover" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Location" hint="Click the map to drop the pin on the exact spot. Visitors only see the area until they book a viewing.">
          <div className="overflow-hidden rounded-xl border border-line">
            <Map listings={[{ ...(f as unknown as Listing), price: Number(f.price) || 0 }]} currency="RWF" center={[f.lat, f.lng]} zoom={15}
              onPick={(lat, lng) => setF((p) => ({ ...p, lat, lng }))} className="h-72 w-full cursor-crosshair" />
          </div>
          <p className="mt-2 text-xs text-muted tnum">{f.lat.toFixed(5)}, {f.lng.toFixed(5)}</p>
        </Card>

        <div className="flex flex-wrap items-center gap-3 pb-10">
          <button onClick={save} className="rounded-full bg-jac px-6 py-3 font-bold text-white hover:bg-jac-deep">{isNew ? "Publish listing" : "Save changes"}</button>
          <button onClick={onCancel} className="rounded-full px-4 py-3 font-bold text-muted">Cancel</button>
          {!isNew && (
            confirmDelete ? (
              <span className="ml-auto flex items-center gap-2 text-sm">
                Delete {f.id} for good?
                <button onClick={() => { deleteListing(f.id); onCancel(); }} className="rounded-full bg-red-700 px-3 py-1.5 font-bold text-white">Delete</button>
                <button onClick={() => setConfirmDelete(false)} className="font-bold text-muted">Keep it</button>
              </span>
            ) : <button onClick={() => setConfirmDelete(true)} className="ml-auto text-sm font-bold text-red-700">Delete listing</button>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 sm:p-6">
      <h2 className="font-bold">{title}</h2>
      {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Num({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <label className="block text-sm font-semibold">{label}
      <input value={v} onChange={(e) => on(e.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric"
        className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 font-normal tnum focus:border-jac focus:outline-none" />
    </label>
  );
}
