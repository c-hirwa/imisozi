import { AGENCY, PHOTOS, img } from "@/lib/data";
import { Contours } from "@/components/Contours";
import { HeroSearch } from "@/components/site/HeroSearch";
import { HomeSections } from "@/components/site/HomeSections";

export default function Home() {
  return (
    <main>
      <section className="relative isolate overflow-hidden bg-basalt text-white">
        <img src={img(PHOTOS.hero, 2000)} alt="Kigali at sunset, seen across the hills" fetchPriority="high"
          className="absolute inset-0 -z-20 size-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-basalt/90 via-basalt/60 to-basalt/10" />
        <Contours className="absolute inset-0 -z-10 size-full opacity-[.13]" stroke="#fff" />
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 md:pt-28 md:pb-14">
          <h1 className="rise max-w-3xl text-[clamp(2.6rem,6.5vw,5.2rem)] font-extrabold leading-[0.98] tracking-[-0.035em]">
            Find your place on Kigali&apos;s hills.
          </h1>
          <p className="rise mt-5 max-w-xl text-lg text-white/85 [animation-delay:.08s]">
            Houses, apartments and plots to rent or buy. Every home visited and photographed by our team, and viewings you can book in two taps.
          </p>
          <div className="rise mt-10 [animation-delay:.16s]"><HeroSearch /></div>
        </div>
      </section>

      <HomeSections />

      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="relative isolate overflow-hidden rounded-3xl bg-basalt px-6 py-14 text-white sm:px-12">
          <Contours className="absolute inset-0 -z-10 size-full text-jac opacity-40" />
          <h2 className="max-w-xl text-4xl font-extrabold tracking-tight sm:text-5xl">Renting out or selling?</h2>
          <p className="mt-4 max-w-lg text-lg text-white/80">
            We photograph your property, list it here, screen enquiries and run the viewings. You only hear from us when there&apos;s a serious tenant or buyer.
          </p>
          <a href={`https://wa.me/${AGENCY.whatsapp}?text=${encodeURIComponent("Hi Imisozi Homes, I'd like to list my property with you.")}`}
            target="_blank" rel="noopener" className="mt-8 inline-block rounded-full bg-white px-6 py-3 font-bold text-basalt hover:bg-sage">
            Talk to us on WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
