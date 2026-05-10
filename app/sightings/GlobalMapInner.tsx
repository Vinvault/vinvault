"use client";
import { useEffect, useRef } from "react";
import type L from "leaflet";

interface Sighting {
  id: string;
  chassis_number: string;
  latitude: number;
  longitude: number;
  location_name: string;
  country: string;
  spotted_at: string;
  spotter_email: string;
  photo_url: string;
  notes?: string;
}

interface Props {
  sightings: Sighting[];
  height?: number;
}

export default function GlobalMapInner({ sightings, height = 480 }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = require("leaflet") as typeof import("leaflet");
    (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl = undefined;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });

    const map = L.map(mapRef.current, { center: [30, 10], zoom: 2 });
    mapInstanceRef.current = map;

    L.tileLayer("https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, © <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18,
    }).addTo(map);

    sightings.forEach(s => {
      const lat = Number(s.latitude);
      const lng = Number(s.longitude);
      if (!lat && !lng) return;

      const icon = L.divIcon({
        html: `<div style="width:10px;height:10px;background:#C9A84C;border:2px solid #8EC8F0;border-radius:50%;box-shadow:0 0 4px #C9A84C"></div>`,
        className: "",
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });

      const dateStr = new Date(s.spotted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      const spotterShort = s.spotter_email?.split("@")[0] || "Anonymous";

      L.marker([lat, lng], { icon }).bindPopup(
        L.popup({ maxWidth: 260 }).setContent(`
          <div style="font-family:Verdana,sans-serif;background:#FFFDF8;color:#1A1A1A;padding:8px;min-width:180px">
            ${s.photo_url ? `<img src="${s.photo_url}" style="width:100%;height:100px;object-fit:cover;margin-bottom:8px;border:1px solid #E8E2D8" />` : ""}
            <p style="font-size:11px;color:#C9A84C;margin:0 0 2px">Chassis: ${s.chassis_number}</p>
            <p style="font-size:12px;font-weight:bold;margin:0 0 2px">${s.location_name}, ${s.country}</p>
            <p style="font-size:11px;color:#6A5A4A;margin:0">${dateStr} · by ${spotterShort}</p>
          </div>
        `)
      ).addTo(map);
    });

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, [sightings]);

  return <div ref={mapRef} style={{ width: "100%", height: `${height}px`, background: "#FFFDF8" }} />;
}
