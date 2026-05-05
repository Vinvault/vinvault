"use client";
import { useEffect, useRef } from "react";
import type L from "leaflet";

interface VinService {
  id: string;
  service_name: string;
  country_name: string;
  country_code: string;
  service_url: string;
  description?: string;
  service_type: string;
  is_free: boolean;
  latitude?: number;
  longitude?: number;
}

interface Props {
  services: VinService[];
  height?: number;
}

export default function VinLookupMapInner({ services, height = 500 }: Props) {
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

    const withCoords = services.filter(s => s.latitude && s.longitude);

    withCoords.forEach(s => {
      const color = s.is_free ? "#4AB87A" : "#4A90B8";
      const icon = L.divIcon({
        html: `<div style="width:14px;height:14px;background:${color};border:2px solid #fff;border-radius:50%;box-shadow:0 0 6px ${color}"></div>`,
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const popup = L.popup({ maxWidth: 280 }).setContent(`
        <div style="font-family:Verdana,sans-serif;background:#0A1828;color:#E2EEF7;padding:10px;min-width:200px">
          <p style="font-size:12px;color:${color};margin:0 0 4px;letter-spacing:1px">${s.country_name.toUpperCase()}</p>
          <p style="font-size:13px;font-weight:bold;margin:0 0 6px">${s.service_name}</p>
          ${s.description ? `<p style="font-size:11px;color:#8BA5B8;margin:0 0 8px;line-height:1.5">${s.description}</p>` : ""}
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
            <span style="background:#0D1E36;color:#4A6A8A;padding:2px 8px;font-size:10px">${s.service_type}</span>
            <span style="background:${s.is_free ? "#0D2A1A" : "#0D1E36"};color:${s.is_free ? "#4AB87A" : "#4A6A8A"};padding:2px 8px;font-size:10px">${s.is_free ? "FREE" : "PAID"}</span>
          </div>
          <a href="${s.service_url}" target="_blank" rel="noopener noreferrer" style="display:block;background:#4A90B8;color:#fff;padding:6px 12px;text-decoration:none;font-size:11px;text-align:center">
            Visit Service →
          </a>
        </div>
      `);

      L.marker([s.latitude!, s.longitude!], { icon }).bindPopup(popup).addTo(map);
    });

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, [services]);

  return <div ref={mapRef} style={{ width: "100%", height: `${height}px`, background: "#0A1828" }} />;
}
