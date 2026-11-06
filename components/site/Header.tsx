"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AGENCY } from "@/lib/data";
import { useSaved } from "@/lib/store";
import { Logo } from "@/components/Logo";
import { setCurrency, useCurrency } from "./currency";

export function Header() {
  const saved = useSaved();
  const cur = useCurrency();
  const path = usePathname();
  const link = (href: string, label: string, active: boolean) => (
    <Link href={href} aria-current={active ? "page" : undefined}
      className={`rounded-full px-3 py-1.5 text-sm font-semibold ${active ? "bg-mist" : "hover:bg-mist"}`}>{label}</Link>
  );
  return (
    <header className="sticky top-0 z-[1100] border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" aria-label="Imisozi Homes home"><Logo /></Link>
        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Main">
          {link("/properties?purpose=rent", "Rent", path === "/properties")}
          {link("/properties?purpose=sale", "Buy", false)}
          {link("/#areas", "Neighbourhoods", false)}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex rounded-full bg-mist p-0.5 text-xs font-bold" role="radiogroup" aria-label="Show prices in">
            {(["RWF", "USD"] as const).map((c) => (
              <button key={c} role="radio" aria-checked={cur === c} onClick={() => setCurrency(c)}
                className={`rounded-full px-2.5 py-1.5 ${cur === c ? "bg-white shadow-sm" : "text-muted"}`}>{c}</button>
            ))}
          </div>
          <Link href="/saved" className="relative flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold hover:bg-mist" aria-label={`Saved homes, ${saved.length}`}>
            <HeartIcon filled={saved.length > 0} />
            <span className="hidden sm:inline">Saved</span>
            {saved.length > 0 && <span key={saved.length} className="pop grid min-w-5 place-items-center rounded-full bg-jac px-1 text-xs font-bold text-white">{saved.length}</span>}
          </Link>
          <a href={`https://wa.me/${AGENCY.whatsapp}?text=${encodeURIComponent("Hi Imisozi Homes, I'd like to list my property with you.")}`}
            target="_blank" rel="noopener" className="hidden rounded-full bg-basalt px-4 py-2 text-sm font-bold text-white hover:bg-basalt-soft lg:block">
            List your property
          </a>
        </div>
      </div>
    </header>
  );
}

export function HeartIcon({ filled, className = "size-5" }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill={filled ? "#6e4fd8" : "none"} stroke={filled ? "#6e4fd8" : "currentColor"} strokeWidth="2" strokeLinejoin="round">
      <path d="M12 20s-7.5-4.6-9.3-9.2C1.4 7.4 3.6 4 7 4c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8C19.5 15.4 12 20 12 20z" />
    </svg>
  );
}
