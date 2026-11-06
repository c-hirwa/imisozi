"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { resetDemo, useDB } from "@/lib/store";
import { Logo } from "@/components/Logo";
import { Contours } from "@/components/Contours";
import { Overview } from "./Overview";
import { Leads } from "./Leads";
import { Viewings } from "./Viewings";
import { Listings } from "./Listings";

const DEMO_PIN = "2580"; // demo gate only, a real deployment needs server-side auth
const SESSION = "imisozi:agent";
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "leads", label: "Leads" },
  { id: "viewings", label: "Viewings" },
  { id: "listings", label: "Listings" },
] as const;
export type Tab = (typeof TABS)[number]["id"];

export function AgentApp() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    const t = setTimeout(() => { try { setAuthed(sessionStorage.getItem(SESSION) === "1"); } catch { setAuthed(false); } }, 0);
    return () => clearTimeout(t);
  }, []);
  if (authed === null) return <div className="min-h-dvh bg-basalt" />;
  if (!authed) return <Login onOk={() => { try { sessionStorage.setItem(SESSION, "1"); } catch {} setAuthed(true); }} />;
  return <Dashboard onLogout={() => { try { sessionStorage.removeItem(SESSION); } catch {} setAuthed(false); }} />;
}

function Login({ onOk }: { onOk: () => void }) {
  const [pin, setPin] = useState("");
  const [bad, setBad] = useState(false);
  return (
    <div className="relative isolate grid min-h-dvh place-items-center overflow-hidden bg-basalt px-4">
      <Contours className="absolute inset-0 -z-10 size-full text-jac opacity-40" />
      <form onSubmit={(e) => { e.preventDefault(); if (pin === DEMO_PIN) onOk(); else { setBad(true); setPin(""); } }} className="w-full max-w-sm rounded-3xl bg-white p-7">
        <Logo />
        <h1 className="mt-6 text-2xl font-extrabold">Agent sign in</h1>
        <label className="mt-5 block text-sm font-semibold">PIN
          <input value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 4)); setBad(false); }} inputMode="numeric" autoFocus aria-invalid={bad}
            className="mt-1.5 w-full rounded-xl border border-line px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] focus:border-jac focus:outline-none" />
        </label>
        {bad && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">That PIN didn&apos;t match. Try again.</p>}
        <button className="mt-5 w-full rounded-full bg-jac py-3 font-bold text-white hover:bg-jac-deep">Sign in</button>
        <p className="mt-4 text-center text-sm text-muted">Demo PIN: {DEMO_PIN}</p>
      </form>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const db = useDB();
  const [tab, setTab] = useState<Tab>("overview");
  const [toast, setToast] = useState<string | null>(null);
  const seen = useRef<Set<number> | null>(null);

  // tell the agent when a new lead arrives from the website (another tab)
  useEffect(() => {
    if (!db) return;
    const ids = new Set(db.leads.map((l) => l.id));
    const prev = seen.current;
    seen.current = ids;
    if (!prev) return;
    const fresh = db.leads.find((l) => !prev.has(l.id));
    if (!fresh) return;
    const t = setTimeout(() => setToast(`${fresh.kind === "viewing" ? "Viewing request" : "New question"} from ${fresh.name} about ${fresh.listingId}`), 0);
    return () => clearTimeout(t);
  }, [db]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 6000); return () => clearTimeout(t); }, [toast]);

  const newLeads = db?.leads.filter((l) => l.status === "new").length ?? 0;
  useEffect(() => { document.title = newLeads ? `(${newLeads}) Agent dashboard | Imisozi Homes` : "Agent dashboard | Imisozi Homes"; }, [newLeads]);

  return (
    <div className="min-h-dvh bg-mist md:grid md:grid-cols-[230px_1fr]">
      <aside className="sticky top-0 z-[1100] bg-basalt text-white md:h-dvh">
        <div className="flex items-center gap-3 px-4 py-4 md:block md:px-5 md:py-6">
          <Logo light className="[&_span]:text-lg" />
          <button onClick={onLogout} className="ml-auto rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold md:hidden">Sign out</button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] md:flex-col" aria-label="Dashboard">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} aria-current={tab === t.id ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold ${tab === t.id ? "bg-white text-basalt" : "text-white/75 hover:bg-white/10"}`}>
              {t.label}
              {t.id === "leads" && newLeads > 0 && <span className="ml-auto rounded-full bg-jac px-2 py-0.5 text-xs font-bold text-white">{newLeads}</span>}
            </button>
          ))}
        </nav>
        <div className="hidden space-y-2 px-5 pt-8 text-sm md:block">
          <Link href="/" target="_blank" className="block text-white/70 underline underline-offset-4 hover:text-white">View website</Link>
          <button onClick={resetDemo} className="block text-white/50 hover:text-white">Reset demo data</button>
          <button onClick={onLogout} className="block text-white/50 hover:text-white">Sign out</button>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 sm:px-6 md:px-8 md:py-8">
        {!db ? <p className="text-muted">Loading…</p> : (
          <>
            {tab === "overview" && <Overview db={db} go={setTab} />}
            {tab === "leads" && <Leads db={db} />}
            {tab === "viewings" && <Viewings db={db} />}
            {tab === "listings" && <Listings db={db} notify={setToast} />}
          </>
        )}
      </main>
      {toast && (
        <div role="status" className="fade-in fixed bottom-5 left-5 right-5 z-[2000] flex items-center gap-3 rounded-2xl bg-basalt px-5 py-4 text-white shadow-2xl sm:left-auto sm:max-w-md">
          <span className="size-2.5 shrink-0 rounded-full bg-jac" />
          <p className="flex-1 text-sm font-semibold">{toast}</p>
          <button onClick={() => { setTab("leads"); setToast(null); }} className="text-sm font-bold text-sun">Open</button>
        </div>
      )}
    </div>
  );
}
