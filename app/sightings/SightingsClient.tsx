"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import AppHeader from "@/app/components/AppHeader";
import AppFooter from "@/app/components/AppFooter";
import "leaflet/dist/leaflet.css";

const GlobalMapInner = dynamic(() => import("./GlobalMapInner"), {
  ssr: false,
  loading: () => <div style={{ width: "100%", height: "480px", background: "#0A1828", display: "flex", alignItems: "center", justifyContent: "center", color: "#4A6A8A" }}>Loading map...</div>,
});

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
  confidence_score: number;
  status: string;
}

interface SpotterStat { email: string; count: number; }

interface Props {
  sightings: Sighting[];
  spotterStats: SpotterStat[];
}

const COUNTRIES = Array.from(new Set<string>([]));

export default function SightingsClient({ sightings, spotterStats }: Props) {
  const [countryFilter, setCountryFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [chassisFilter, setChassisFilter] = useState("");

  const countries = useMemo(() => {
    const s = new Set(sightings.map(s => s.country).filter(Boolean));
    return Array.from(s).sort();
  }, [sightings]);

  const filtered = useMemo(() => {
    return sightings.filter(s => {
      if (countryFilter && s.country !== countryFilter) return false;
      if (chassisFilter && !s.chassis_number.toLowerCase().includes(chassisFilter.toLowerCase())) return false;
      if (fromDate && s.spotted_at < fromDate) return false;
      if (toDate && s.spotted_at > toDate + "T23:59:59") return false;
      return true;
    });
  }, [sightings, countryFilter, chassisFilter, fromDate, toDate]);

  return (
    <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Verdana, sans-serif", minHeight: "100vh" }}>
      <AppHeader />

      {/* Header */}
      <section className="vv-registry-header">
        <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>CAR SPOTTER NETWORK</p>
        <h1 style={{ fontSize: "42px", fontWeight: "bold", marginBottom: "16px" }}>Global Sightings</h1>
        <p style={{ color: "#8BA5B8", fontSize: "16px", maxWidth: "600px", lineHeight: "1.7" }}>
          {sightings.length} sighting{sightings.length === 1 ? "" : "s"} logged across {countries.length} countr{countries.length === 1 ? "y" : "ies"}.
          {" "}<Link href="/spot" style={{ color: "#4A90B8", textDecoration: "none" }}>Submit a sighting →</Link>
        </p>
      </section>

      {/* Global map */}
      <section style={{ borderBottom: "1px solid #1E3A5A" }}>
        <GlobalMapInner sightings={filtered.filter(s => Number(s.latitude) || Number(s.longitude))} height={480} />
      </section>

      {/* Filters */}
      <section className="vv-registry-filters">
        <input value={chassisFilter} onChange={e => setChassisFilter(e.target.value)} placeholder="Filter by chassis..."
          style={{ background: "#0D1E36", border: "1px solid #1E3A5A", color: "#E2EEF7", padding: "10px 16px", fontSize: "14px", width: "200px", fontFamily: "Verdana, sans-serif", outline: "none" }} />
        <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
          style={{ background: "#0D1E36", border: "1px solid #1E3A5A", color: "#8BA5B8", padding: "10px 16px", fontSize: "14px", fontFamily: "Verdana, sans-serif" }}>
          <option value="">All Countries</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
          style={{ background: "#0D1E36", border: "1px solid #1E3A5A", color: "#8BA5B8", padding: "10px 16px", fontSize: "14px", fontFamily: "Verdana, sans-serif", colorScheme: "dark" }}
          placeholder="From date" />
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
          style={{ background: "#0D1E36", border: "1px solid #1E3A5A", color: "#8BA5B8", padding: "10px 16px", fontSize: "14px", fontFamily: "Verdana, sans-serif", colorScheme: "dark" }} />
        <Link href="/spot" style={{ marginLeft: "auto", background: "#4A90B8", color: "#fff", padding: "10px 24px", textDecoration: "none", fontSize: "14px", whiteSpace: "nowrap" }}>
          + Submit Sighting
        </Link>
      </section>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px", display: "grid", gridTemplateColumns: "1fr 280px", gap: "40px" }}>

        {/* Sightings list */}
        <div>
          <p style={{ color: "#4A6A8A", fontSize: "13px", marginBottom: "24px" }}>Showing {filtered.length} of {sightings.length} sightings</p>
          {filtered.length === 0 ? (
            <p style={{ color: "#4A6A8A", padding: "40px 0" }}>No sightings match your filters.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filtered.map(s => (
                <div key={s.id} style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "16px 20px", display: "flex", gap: "16px", alignItems: "flex-start" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "#4A90B8")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "#1E3A5A")}>
                  {s.photo_url && (
                    <img src={s.photo_url} alt="sighting" style={{ width: "80px", height: "60px", objectFit: "cover", flexShrink: 0, border: "1px solid #1E3A5A" }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", flexWrap: "wrap", gap: "8px" }}>
                      <Link href={`/ferrari/288-gto/${s.chassis_number}`}
                        style={{ fontFamily: "monospace", fontSize: "14px", color: "#4A90B8", textDecoration: "none", letterSpacing: "1px" }}>
                        {s.chassis_number}
                      </Link>
                      <span style={{ color: "#4A6A8A", fontSize: "12px" }}>
                        {new Date(s.spotted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <p style={{ fontSize: "13px", marginBottom: "4px" }}>{s.location_name}, {s.country}</p>
                    <p style={{ color: "#4A6A8A", fontSize: "12px" }}>by {s.spotter_email?.split("@")[0] || "Anonymous"}</p>
                    {s.notes && <p style={{ color: "#8BA5B8", fontSize: "12px", marginTop: "6px", lineHeight: "1.5" }}>{s.notes.slice(0, 120)}{s.notes.length > 120 ? "…" : ""}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Spotter leaderboard */}
        <div>
          <h2 style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "3px", marginBottom: "20px" }}>SPOTTER LEADERBOARD</h2>
          <p style={{ color: "#4A6A8A", fontSize: "11px", marginBottom: "16px" }}>MOST SIGHTINGS THIS MONTH</p>
          {spotterStats.length === 0 ? (
            <p style={{ color: "#4A6A8A", fontSize: "13px" }}>No sightings this month yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {spotterStats.slice(0, 10).map((st, i) => (
                <div key={st.email} style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: i === 0 ? "#E0B87A" : "#4A6A8A", fontSize: "13px", fontWeight: "bold", width: "20px" }}>#{i + 1}</span>
                    <span style={{ color: "#8BA5B8", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "140px", whiteSpace: "nowrap" }}>
                      {st.email.split("@")[0]}
                    </span>
                  </div>
                  <span style={{ color: "#4A90B8", fontSize: "13px", fontWeight: "bold" }}>{st.count}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: "32px" }}>
            <Link href="/spot" style={{ display: "block", background: "#4A90B8", color: "#fff", padding: "12px 20px", textDecoration: "none", fontSize: "13px", textAlign: "center" }}>
              + Submit a Sighting
            </Link>
          </div>
        </div>
      </div>

      <AppFooter />
    </main>
  );
}
