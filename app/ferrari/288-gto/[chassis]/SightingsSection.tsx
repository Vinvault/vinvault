"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import "leaflet/dist/leaflet.css";

const SightingsMapInner = dynamic(() => import("./SightingsMapInner"), { ssr: false, loading: () => <div style={{ width: "100%", height: "400px", background: "#0A1828", display: "flex", alignItems: "center", justifyContent: "center", color: "#4A6A8A", fontSize: "13px" }}>Loading map...</div> });

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
  confidence_score: number;
  status: string;
}

interface Props {
  chassis: string;
  initialSightings: Sighting[];
}

export default function SightingsSection({ chassis, initialSightings }: Props) {
  const [sightings] = useState<Sighting[]>(initialSightings);
  const verified = sightings.filter(s => s.status === "approved" || s.status === "pending_community");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "3px", marginBottom: "4px" }}>SPOTTINGS</h2>
          <p style={{ color: "#8BA5B8", fontSize: "13px" }}>
            {verified.length === 0 ? "No spottings recorded yet" : `${verified.length} spotting${verified.length === 1 ? "" : "s"} recorded`}
          </p>
        </div>
        <Link href={`/spot?chassis=${encodeURIComponent(chassis)}`}
          style={{ background: "#4A90B8", color: "#fff", padding: "10px 20px", textDecoration: "none", fontSize: "13px", letterSpacing: "1px" }}>
          + Submit a Spotting
        </Link>
      </div>

      {verified.length > 0 ? (
        <>
          <div style={{ border: "1px solid #1E3A5A", overflow: "hidden", marginBottom: "24px" }}>
            <SightingsMapInner sightings={verified} height={380} />
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
            {[
              { color: "#4A90B8", label: "This year" },
              { color: "#2A70A8", label: "Last year" },
              { color: "#1A5088", label: "2 years ago" },
              { color: "#0A2A48", label: "Older" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "12px", height: "12px", background: item.color, border: "1px solid #8EC8F0", borderRadius: "50%" }} />
                <span style={{ color: "#4A6A8A", fontSize: "11px" }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Sightings list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {verified.slice(0, 5).map(s => (
              <div key={s.id} style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "14px 16px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                {s.photo_url && (
                  <img src={s.photo_url} alt="spotting" style={{ width: "56px", height: "44px", objectFit: "cover", flexShrink: 0, border: "1px solid #1E3A5A" }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.location_name}, {s.country}
                  </p>
                  <p style={{ color: "#4A6A8A", fontSize: "12px" }}>
                    {new Date(s.spotted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    {" · by "}
                    {s.spotter_email?.split("@")[0] || "Anonymous"}
                    {s.status === "pending_community" && <span style={{ marginLeft: "8px", color: "#B8944A", fontSize: "10px" }}>UNCONFIRMED</span>}
                  </p>
                </div>
              </div>
            ))}
            {verified.length > 5 && (
              <Link href={`/sightings?chassis=${chassis}`} style={{ color: "#4A90B8", fontSize: "13px", textDecoration: "none", textAlign: "center", padding: "10px" }}>
                View all {verified.length} spottings →
              </Link>
            )}
          </div>
        </>
      ) : (
        <div style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "32px", textAlign: "center" }}>
          <p style={{ color: "#4A6A8A", fontSize: "14px", marginBottom: "16px" }}>
            No spottings for this chassis yet. Be the first to log one!
          </p>
          <Link href={`/spot?chassis=${encodeURIComponent(chassis)}`}
            style={{ background: "#4A90B8", color: "#fff", padding: "10px 24px", textDecoration: "none", fontSize: "13px" }}>
            Submit First Spotting
          </Link>
        </div>
      )}
    </div>
  );
}
