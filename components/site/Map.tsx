"use client";

import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import { price, type Currency, type Listing } from "@/lib/data";

type Props = {
  listings: Listing[];
  currency: Currency;
  activeId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
  /** fixed view instead of fitting to the pins */
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  /** called with the clicked map location (used by the agent's "place pin") */
  onPick?: (lat: number, lng: number) => void;
};

export function Map({ listings, currency, activeId, onSelect, className = "", center, zoom = 13, interactive = true, onPick }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const L = useRef<typeof Leaflet | null>(null);
  const layer = useRef<Leaflet.LayerGroup | null>(null);
  const markers = useRef(new globalThis.Map<string, Leaflet.Marker>());
  const cbs = useRef({ onSelect, onPick });
  const latest = useRef({ listings, currency, activeId, center });
  useEffect(() => {
    cbs.current = { onSelect, onPick };
    latest.current = { listings, currency, activeId, center };
  });

  // create the map once
  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      if (cancelled || !el.current || map.current) return;
      L.current = mod;
      const m = mod.map(el.current, {
        center: center ?? [-1.95, 30.09], zoom, zoomControl: interactive, scrollWheelZoom: interactive,
        dragging: interactive, doubleClickZoom: interactive, touchZoom: interactive, attributionControl: true,
      });
      mod.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19, subdomains: "abcd",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(m);
      m.on("click", (e: Leaflet.LeafletMouseEvent) => cbs.current.onPick?.(e.latlng.lat, e.latlng.lng));
      layer.current = mod.layerGroup().addTo(m);
      map.current = m;
      draw();
    });
    return () => { cancelled = true; map.current?.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reads the latest props from a ref, so it's safe to call from the async map setup
  function draw() {
    const mod = L.current, m = map.current, g = layer.current;
    if (!mod || !m || !g) return;
    const { listings, currency, activeId, center } = latest.current;
    g.clearLayers();
    markers.current.clear();
    listings.forEach((l) => {
      const off = l.status === "let" || l.status === "sold";
      const icon = mod.divIcon({
        className: "pin-wrap", iconSize: [0, 0],
        html: `<span class="pin ${l.purpose} ${off ? "off" : ""} ${l.id === activeId ? "active" : ""}">${price(l.price, currency, l.purpose, true)}</span>`,
      });
      const mk = mod.marker([l.lat, l.lng], { icon, keyboard: true, title: l.title, riseOnHover: true })
        .on("click", () => cbs.current.onSelect?.(l.id)).addTo(g);
      markers.current.set(l.id, mk);
    });
    if (!center && listings.length) {
      m.fitBounds(mod.latLngBounds(listings.map((l) => [l.lat, l.lng])), { padding: [48, 48], maxZoom: 15 });
    }
  }

  // redraw when data or currency change
  useEffect(() => {
    latest.current = { listings, currency, activeId, center };
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings, currency]);

  // highlight without redrawing
  useEffect(() => {
    markers.current.forEach((mk, id) => {
      const pin = mk.getElement()?.querySelector(".pin");
      pin?.classList.toggle("active", id === activeId);
      mk.setZIndexOffset(id === activeId ? 1000 : 0);
    });
  }, [activeId]);

  useEffect(() => {
    if (center && map.current) map.current.setView(center, map.current.getZoom());
  }, [center]);

  return <div ref={el} className={className} role="region" aria-label="Map of properties" />;
}
