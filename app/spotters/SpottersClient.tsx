"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import AppHeader from "@/app/components/AppHeader";
import AppFooter from "@/app/components/AppFooter";
import "leaflet/dist/leaflet.css";

const GlobalMapInner = dynamic(() => import("../sightings/GlobalMapInner"), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: "400px", background: "#0A1828", display: "flex", alignItems: "center", justifyContent: "center", color: "#4A6A8A", fontFamily: "Verdana, sans-serif", fontSize: "13px" }}>
      Loading map…
    </div>
  ),
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
  spotter_username: string;
  photo_url: string;
  notes?: string;
  confidence_score: number;
  status: string;
}

interface LeaderboardEntry {
  username: string;
  country: string;
  trust_level: number;
  count: number;
  points: number;
}

interface Props {
  sightings: Sighting[];
  leaderboard: LeaderboardEntry[];
}

const TRUST_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "New", color: "#4A6A8A" },
  2: { label: "Regular", color: "#4A90B8" },
  3: { label: "Trusted", color: "#4AB87A" },
  4: { label: "Expert", color: "#E0C060" },
};

function trustBadge(level: number) {
  const t = TRUST_LABELS[level] ?? TRUST_LABELS[1];
  return (
    <span style={{ fontSize: "9px", letterSpacing: "1px", color: t.color, border: `1px solid ${t.color}`, padding: "2px 6px" }}>
      {t.label.toUpperCase()}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function countryEmoji(country: string) {
  if (!country) return "";
  try {
    const code = country.slice(0, 2).toUpperCase();
    return code.replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
  } catch { return ""; }
}

export default function SpottersClient({ sightings, leaderboard }: Props) {
  const [activeTab, setActiveTab] = useState<"feed" | "map" | "leaderboard">("feed");
  const recent = sightings.slice(0, 20);
  const countries = useMemo(() => new Set(sightings.map(s => s.country).filter(Boolean)).size, [sightings]);

  const tab = (id: "feed" | "map" | "leaderboard", label: string) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        background: "none", border: "none", borderBottom: activeTab === id ? "2px solid #4A90B8" : "2px solid transparent",
        color: activeTab === id ? "#E2EEF7" : "#4A6A8A", padding: "12px 20px", fontSize: "13px",
        cursor: "pointer", fontFamily: "Verdana, sans-serif", letterSpacing: "1px",
      }}
    >
      {label}
    </button>
  );

  return (
    <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Verdana, sans-serif", minHeight: "100vh" }}>
      <AppHeader />

      {/* Hero */}
      <section style={{ padding: "60px 40px 48px", borderBottom: "1px solid #1E3A5A" }}>
        <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>COMMUNITY</p>
        <h1 style={{ fontSize: "42px", fontWeight: "bold", marginBottom: "16px", lineHeight: "1.1" }}>
          The VinVault<br />Spotter Community
        </h1>
        <p style={{ color: "#8BA5B8", fontSize: "15px", maxWidth: "560px", lineHeight: "1.7", marginBottom: "32px" }}>
          {sightings.length} spotting{sightings.length !== 1 ? "s" : ""} logged across {countries} countr{countries !== 1 ? "ies" : "y"}.
          Join the network tracking the world&apos;s rarest cars.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/spot" style={{ background: "#4A90B8", color: "#fff", padding: "12px 24px", textDecoration: "none", fontSize: "13px", letterSpacing: "1px" }}>
            + Submit a Spotting
          </Link>
          <Link href="/spotters/events" style={{ border: "1px solid #1E3A5A", color: "#8BA5B8", padding: "12px 24px", textDecoration: "none", fontSize: "13px", letterSpacing: "1px" }}>
            Upcoming Events →
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: "#0A1828", borderBottom: "1px solid #1E3A5A", padding: "20px 40px", display: "flex", gap: "48px", flexWrap: "wrap" }}>
        {[
          ["Total Spottings", sightings.length],
          ["Countries", countries],
          ["This Month", sightings.filter(s => s.spotted_at >= new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()).length],
          ["Spotters", leaderboard.length],
        ].map(([label, val]) => (
          <div key={String(label)}>
            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#E2EEF7" }}>{val}</div>
            <div style={{ fontSize: "11px", color: "#4A6A8A", letterSpacing: "1px" }}>{label}</div>
          </div>
        ))}
      </section>

      {/* Tabs */}
      <section style={{ borderBottom: "1px solid #1E3A5A", padding: "0 40px", display: "flex", gap: "4px" }}>
        {tab("feed", "Recent Spottings")}
        {tab("map", "Global Map")}
        {tab("leaderboard", "Leaderboard")}
      </section>

      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 40px" }}>

        {/* Feed tab */}
        {activeTab === "feed" && (
          <div>
            {recent.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#4A6A8A" }}>
                <p style={{ fontSize: "15px", marginBottom: "16px" }}>No spottings yet — be the first.</p>
                <Link href="/spot" style={{ color: "#4A90B8", textDecoration: "none" }}>Submit a Spotting →</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#1E3A5A" }}>
                {recent.map(s => (
                  <div key={s.id} style={{ background: "#080F1A", display: "flex", gap: "16px", padding: "16px", alignItems: "flex-start" }}>
                    {s.photo_url && (
                      <img src={s.photo_url} alt="" style={{ width: "80px", height: "60px", objectFit: "cover", flexShrink: 0, border: "1px solid #1E3A5A" }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>
                        {s.chassis_number ? `Chassis ${s.chassis_number}` : "Unknown Chassis"}
                      </div>
                      <div style={{ color: "#8BA5B8", fontSize: "12px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                        <span>{s.location_name}{s.country ? `, ${s.country}` : ""}</span>
                        <span>{formatDate(s.spotted_at)}</span>
                        <span>by {s.spotter_username || s.spotter_email?.split("@")[0] || "Anonymous"}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: "11px", color: "#4A6A8A", letterSpacing: "1px", flexShrink: 0 }}>
                      {s.confidence_score > 0 ? `${s.confidence_score}pts` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {sightings.length > 20 && (
              <div style={{ textAlign: "center", marginTop: "24px" }}>
                <Link href="/sightings" style={{ color: "#4A90B8", textDecoration: "none", fontSize: "13px" }}>
                  View all {sightings.length} spottings →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Map tab */}
        {activeTab === "map" && (
          <div style={{ border: "1px solid #1E3A5A", overflow: "hidden" }}>
            <GlobalMapInner
              sightings={sightings.filter(s => Number(s.latitude) || Number(s.longitude))}
              height={520}
            />
          </div>
        )}

        {/* Leaderboard tab */}
        {activeTab === "leaderboard" && (
          <div>
            <h2 style={{ fontSize: "11px", letterSpacing: "3px", color: "#4A90B8", marginBottom: "24px" }}>
              MONTHLY LEADERBOARD — {new Date().toLocaleString("en", { month: "long", year: "numeric" }).toUpperCase()}
            </h2>
            {leaderboard.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#4A6A8A" }}>
                <p>No spottings this month yet.</p>
                <Link href="/spot" style={{ color: "#4A90B8", textDecoration: "none", display: "block", marginTop: "12px" }}>Be the first →</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#1E3A5A" }}>
                {leaderboard.map((entry, i) => (
                  <div key={entry.username} style={{ background: "#080F1A", display: "flex", alignItems: "center", padding: "16px 20px", gap: "20px" }}>
                    <div style={{ width: "28px", textAlign: "center", fontSize: i === 0 ? "20px" : "14px", color: i === 0 ? "#E0C060" : i === 1 ? "#A8A8A8" : i === 2 ? "#C87840" : "#4A6A8A", fontWeight: "bold" }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Link href={`/spotters/${encodeURIComponent(entry.username)}`} style={{ color: "#E2EEF7", textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}>
                        {entry.username}
                      </Link>
                      {entry.country && <span style={{ marginLeft: "8px", fontSize: "12px", color: "#4A6A8A" }}>{entry.country}</span>}
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      {trustBadge(entry.trust_level)}
                      <span style={{ color: "#E2EEF7", fontSize: "14px", fontWeight: "bold", minWidth: "30px", textAlign: "right" }}>{entry.count}</span>
                      <span style={{ color: "#4A6A8A", fontSize: "11px" }}>spottings</span>
                      <span style={{ color: "#4A90B8", fontSize: "12px", minWidth: "50px", textAlign: "right" }}>{entry.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Events CTA */}
      <section style={{ borderTop: "1px solid #1E3A5A", padding: "48px 40px", display: "flex", gap: "40px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "260px" }}>
          <h2 style={{ fontSize: "11px", letterSpacing: "3px", color: "#4A90B8", marginBottom: "12px" }}>EVENTS</h2>
          <p style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>Cars &amp; Coffee, Rallies &amp; More</p>
          <p style={{ color: "#8BA5B8", fontSize: "13px", lineHeight: "1.7" }}>
            Find upcoming spotter events and car shows in your area. Submit your own event for the community.
          </p>
        </div>
        <Link href="/spotters/events" style={{ border: "1px solid #4A90B8", color: "#4A90B8", padding: "14px 28px", textDecoration: "none", fontSize: "13px", letterSpacing: "1px", whiteSpace: "nowrap" }}>
          View Events →
        </Link>
      </section>

      <AppFooter />
    </main>
  );
}
