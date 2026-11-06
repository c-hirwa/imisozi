import Link from "next/link";
import { AGENCY } from "@/lib/data";
import { Header } from "@/components/site/Header";
import { Logo } from "@/components/Logo";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      {children}
      <footer className="mt-24 bg-basalt text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-sm text-white/70">Homes to rent and buy across Kigali. Every listing visited and photographed by our team.</p>
          </div>
          <div className="text-sm">
            <p className="font-bold">Visit</p>
            <p className="mt-2 text-white/70">{AGENCY.office}</p>
            <p className="text-white/70">Monday to Saturday, 8:00 – 18:00</p>
          </div>
          <div className="text-sm">
            <p className="font-bold">Talk to us</p>
            <p className="mt-2"><a href={`tel:${AGENCY.phoneDisplay.replace(/\s/g, "")}`} className="text-white/70 hover:text-white">{AGENCY.phoneDisplay}</a></p>
            <p><a href={`mailto:${AGENCY.email}`} className="text-white/70 hover:text-white">{AGENCY.email}</a></p>
            <p className="mt-4"><Link href="/agent" className="text-white/50 hover:text-white">Agent sign in</Link></p>
          </div>
        </div>
      </footer>
    </>
  );
}
