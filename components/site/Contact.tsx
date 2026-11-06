"use client";

import { useEffect, useMemo, useState } from "react";
import { AGENCY, type AGENTS, type Listing } from "@/lib/data";
import { addLead, ymd, type Lead } from "@/lib/store";

const SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
const input = "mt-1 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 focus:border-jac focus:outline-none focus:ring-2 focus:ring-jac/20";

export function Contact({ listing: l, agent, off, leads }: { listing: Listing; agent: (typeof AGENTS)[number]; off: boolean; leads: Lead[] }) {
  const [tab, setTab] = useState<"viewing" | "enquiry">("viewing");
  const [days, setDays] = useState<Date[]>([]);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState<string | null>(null);

  // next 10 days except Sundays (computed after mount so prerender stays static)
  useEffect(() => {
    const t = setTimeout(() => {
      const out: Date[] = [];
      for (let i = 1; out.length < 10; i++) { const d = new Date(); d.setDate(d.getDate() + i); if (d.getDay() !== 0) out.push(d); }
      setDays(out);
      setDate(ymd(out[0]));
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const taken = useMemo(() => new Set(leads.filter((x) => x.listingId === l.id && x.kind === "viewing" && x.date === date).map((x) => x.slot)), [leads, l.id, date]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (tab === "viewing" && !slot) return setErr("Pick a time for the viewing.");
    if (!name.trim()) return setErr("Add your name.");
    if (phone.replace(/\D/g, "").length < 9) return setErr("Add a phone number we can reach you on, ideally WhatsApp.");
    if (tab === "enquiry" && !msg.trim()) return setErr("Write your question so we can answer it properly.");
    setErr("");
    addLead({ listingId: l.id, kind: tab, name: name.trim(), phone, message: msg.trim() || undefined, ...(tab === "viewing" ? { date, slot } : {}) });
    const first = agent.name.split(" ")[0];
    if (tab === "viewing") {
      const d = new Date(date + "T00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
      setDone(`Viewing requested for ${d} at ${slot}. ${first} will confirm on WhatsApp within the hour and send you the exact location.`);
    } else setDone(`Question sent. ${first} usually replies within an hour during office hours.`);
  }

  return (
    <div className="rounded-3xl border border-line p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-full bg-jac-soft font-extrabold text-jac">{agent.initials}</span>
        <div>
          <p className="font-bold">{agent.name}</p>
          <p className="text-sm text-muted">{agent.role} agent, usually replies within an hour</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a href={`https://wa.me/${AGENCY.whatsapp}?text=${encodeURIComponent(`Hi ${agent.name.split(" ")[0]}, I'm interested in "${l.title}" (${l.id}).`)}`} target="_blank" rel="noopener"
          className="rounded-full bg-[#1fa855] px-4 py-2.5 text-center text-sm font-bold text-white hover:brightness-95">WhatsApp</a>
        <a href={`tel:${AGENCY.phoneDisplay.replace(/\s/g, "")}`} className="rounded-full border border-line px-4 py-2.5 text-center text-sm font-bold hover:bg-mist">Call</a>
      </div>

      {off ? (
        <p className="mt-5 rounded-2xl bg-mist p-4 text-sm">This home has been {l.status === "let" ? "let" : "sold"}. Have a look at the similar homes below, or ask {agent.name.split(" ")[0]} what&apos;s coming up.</p>
      ) : done ? (
        <div className="fade-in mt-5 rounded-2xl bg-jac-soft p-5">
          <p className="font-bold text-jac-deep">Sent</p>
          <p className="mt-1">{done}</p>
          <button onClick={() => { setDone(null); setSlot(""); setMsg(""); }} className="mt-3 text-sm font-bold text-jac underline underline-offset-4">Send another</button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-5" noValidate>
          <div className="grid grid-cols-2 rounded-full bg-mist p-1 text-sm font-bold" role="tablist">
            {(["viewing", "enquiry"] as const).map((t) => (
              <button type="button" key={t} role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setErr(""); }}
                className={`rounded-full py-2 ${tab === t ? "bg-white shadow-sm" : "text-muted"}`}>
                {t === "viewing" ? "Book a viewing" : "Ask a question"}
              </button>
            ))}
          </div>

          {tab === "viewing" && (
            <>
              <p className="mt-4 text-sm font-semibold">Day</p>
              <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
                {days.map((d) => {
                  const v = ymd(d), on = v === date;
                  return (
                    <button type="button" key={v} onClick={() => { setDate(v); setSlot(""); }} aria-pressed={on}
                      className={`w-14 shrink-0 rounded-xl border py-2 text-center ${on ? "border-jac bg-jac text-white" : "border-line hover:border-basalt-soft"}`}>
                      <span className="block text-xs">{d.toLocaleDateString("en-GB", { weekday: "short" })}</span>
                      <span className="block text-lg font-extrabold leading-tight tnum">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-sm font-semibold">Time</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {SLOTS.map((s) => {
                  const busy = taken.has(s);
                  return (
                    <button type="button" key={s} disabled={busy} onClick={() => setSlot(s)} aria-pressed={slot === s}
                      className={`rounded-lg border py-2 text-sm font-bold tnum disabled:cursor-not-allowed disabled:border-dashed disabled:text-muted/60 disabled:line-through ${slot === s ? "border-jac bg-jac-soft text-jac-deep" : "border-line hover:border-basalt-soft"}`}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="block text-sm font-semibold">Name<input className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
            <label className="block text-sm font-semibold">Phone<input className={input} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" placeholder="078..." /></label>
          </div>
          <label className="mt-3 block text-sm font-semibold">
            {tab === "viewing" ? "Anything we should know? (optional)" : "Your question"}
            <textarea className={`${input} min-h-20`} value={msg} onChange={(e) => setMsg(e.target.value)}
              placeholder={tab === "viewing" ? "Moving date, number of people, pets..." : "Is water included? Can the rent be paid quarterly?"} />
          </label>
          {err && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{err}</p>}
          <button className="mt-4 w-full rounded-full bg-jac py-3.5 font-bold text-white hover:bg-jac-deep">
            {tab === "viewing" ? "Request viewing" : "Send question"}
          </button>
          <p className="mt-2 text-center text-xs text-muted">Viewings are free. We never share your number with the landlord.</p>
        </form>
      )}
    </div>
  );
}
