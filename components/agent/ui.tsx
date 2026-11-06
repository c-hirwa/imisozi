"use client";
import type { LeadStatus } from "@/lib/store";
import type { Status } from "@/lib/data";

export function H1({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <h1 className="text-3xl font-extrabold tracking-tight">{children}</h1>
      {aside}
    </div>
  );
}

export const LEAD_LABEL: Record<LeadStatus, string> = { new: "New", contacted: "Contacted", viewing: "Viewing booked", closed: "Closed" };
const LEAD_CLS: Record<LeadStatus, string> = { new: "bg-jac text-white", contacted: "bg-sun/40", viewing: "bg-sage", closed: "bg-mist text-muted" };
export const LeadPill = ({ s }: { s: LeadStatus }) => <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${LEAD_CLS[s]}`}>{LEAD_LABEL[s]}</span>;

const ST_CLS: Record<Status, string> = { available: "bg-sage", "under-offer": "bg-sun/40", let: "bg-mist text-muted", sold: "bg-mist text-muted" };
export const StatusDot = ({ s }: { s: Status }) => <span className={`inline-block size-2.5 rounded-full ${ST_CLS[s].split(" ")[0]}`} />;

export function ago(ts: number) {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

export const dayLabel = (ymd: string) => {
  const d = new Date(ymd + "T00:00"); const t = new Date(); t.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
  const s = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  return diff === 0 ? `Today, ${s}` : diff === 1 ? `Tomorrow, ${s}` : diff === -1 ? `Yesterday, ${s}` : s;
};

export const waNumber = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("250") ? d : d.startsWith("0") ? "250" + d.slice(1) : "250" + d;
};
