"use client";
import { useEffect, useRef } from "react";
import type L from "leaflet";

interface Sighting {
  id: string;
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

function yearColor(spotted_at: string): string {
  const year = new Date(spotted_at).getFullYear();
  const now = new Date().getFullYear();
  const age = now - year;
  if (age <= 0) return "#C9A84C";
  if (age <= 1) return "#2A70A8";
  if (age <= 2) return "#1A5088";
  if (age <= 4) return "#1A3A68";
  return "#0A2A48";
}

export default function SightingsMapInner({ sightings, height = 400 }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const LeafletModule = require("leaflet") as typeof L;
    // Fix default icon paths
    (LeafletModule.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl = undefined;
    LeafletModule.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });

    const defaultCenter: [number, number] = sightings.length > 0
      ? [Number(sightings[0].latitude), Number(sightings[0].longitude)]
      : [48, 10];

    const map = LeafletModule.map(mapRef.current, { center: defaultCenter, zoom: sightings.length > 1 ? 3 : 6, zoomControl: true });
    mapInstanceRef.current = map;

    LeafletModule.tileLayer("https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18,
    }).addTo(map);

    sightings.forEach(s => {
      const lat = Number(s.latitude);
      const lng = Number(s.longitude);
      if (!lat && !lng) return;

      const color = yearColor(s.spotted_at);
      const markerHtml = `<div style="width:14px;height:14px;background:${color};border:2px solid #8EC8F0;border-radius:50%;box-shadow:0 0 6px ${color}"></div>`;
      const icon = LeafletModule.divIcon({ html: markerHtml, className: "", iconSize: [14, 14], iconAnchor: [7, 7] });

      const dateStr = new Date(s.spotted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      const spotterShort = s.spotter_email?.split("@")[0] || "Anonymous";
      const popup = LeafletModule.popup({ maxWidth: 260 }).setContent(`
        <div style="font-family:Verdana,sans-serif;background:#FFFDF8;color:#1A1A1A;padding:8px;min-width:200px">
          ${s.photo_url ? `<img src="${s.photo_url}" style="width:100%;height:120px;object-fit:cover;margin-bottom:8px;border:1px solid #E8E2D8" alt="sighting photo" />` : ""}
          <p style="font-size:12px;color:#C9A84C;margin:0 0 4px">${dateStr}</p>
          <p style="font-size:13px;font-weight:bold;margin:0 0 4px">${s.location_name}, ${s.country}</p>
          <p style="font-size:11px;color:#6A5A4A;margin:0">by ${spotterShort}</p>
          ${s.notes ? `<p style="font-size:12px;color:#6A5A4A;margin:6px 0 0;border-top:1px solid #E8E2D8;padding-top:6px">${s.notes}</p>` : ""}
        </div>
      `);

      LeafletModule.marker([lat, lng], { icon }).bindPopup(popup).addTo(map);
    });

    if (sightings.length > 1) {
      const validSightings = sightings.filter(s => Number(s.latitude) || Number(s.longitude));
      if (validSightings.length > 0) {
        const bounds = LeafletModule.latLngBounds(validSightings.map(s => [Number(s.latitude), Number(s.longitude)] as [number, number]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [sightings]);

  return <div ref={mapRef} style={{ width: "100%", height: `${height}px`, background: "#FFFDF8" }} />;
}
