"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import type { PageData, Sighting, SpotterProfile } from "./page";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function initials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

function trustBadge(level: number) {
  const map: Record<number, { label: string; color: string }> = {
    1: { label: "NEW", color: "#4A6A8A" },
    2: { label: "TRUSTED", color: "#4A90B8" },
    3: { label: "TRUSTED", color: "#4AB87A" },
    4: { label: "EXPERT", color: "#E0C060" },
  };
  const t = map[level] ?? map[1];
  return (
    <span style={{ fontSize: "9px", letterSpacing: "1px", color: t.color, border: `1px solid ${t.color}40`, padding: "2px 6px" }}>
      {t.label}
    </span>
  );
}

function avatarColor(name: string): string {
  const colors = ["#1A3A5A", "#1A4A2A", "#3A1A2A", "#2A1A4A", "#3A2A1A"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length;
  return colors[h];
}

function CarPlaceholder({ chassis, label }: { chassis: string; label?: string }) {
  return (
    <div style={{
      width: "100%", height: "100%", minHeight: "200px",
      background: "linear-gradient(135deg, #0A1828 0%, #0D2A3A 50%, #0A1828 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: "12px", position: "relative",
    }}>
      <span style={{ fontSize: "48px", opacity: 0.4 }}>🏎</span>
      <span style={{ color: "#1E3A5A", fontSize: "11px", letterSpacing: "2px", fontFamily: "monospace" }}>{chassis}</span>
      {label && <span style={{ position: "absolute", top: "12px", left: "12px", background: "#4A90B8", color: "#fff", fontSize: "9px", letterSpacing: "2px", padding: "3px 8px" }}>{label}</span>}
    </div>
  );
}

const COUNTRY_TABS = ["Global", "Monaco", "Sweden", "Denmark", "UK", "Germany", "Italy", "France"] as const;
type CountryTab = typeof COUNTRY_TABS[number];
const COUNTRY_MAP: Record<string, CountryTab> = {
  "Monaco": "Monaco", "Sweden": "Sweden", "Denmark": "Denmark",
  "United Kingdom": "UK", "Germany": "Germany", "Italy": "Italy", "France": "France",
};

function getSlideBadge(s: Sighting, notes?: string): { label: string; color: string } | null {
  if (notes?.toLowerCase().includes("ghost")) return { label: "GHOST CAR FOUND", color: "#E0C060" };
  if (s.status === "verified" && s.confidence_score >= 90) return { label: "VERIFIED", color: "#4AB87A" };
  return { label: "COMMUNITY", color: "#4A90B8" };
}

export default function SpottersClient({ data }: { data: PageData }) {
  const { sightings, profiles, makes, models, stats, ghost } = data;
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lbTab, setLbTab] = useState<CountryTab>("Global");

  const slideshow = sightings.slice(0, 10);

  const nextSlide = useCallback(() => setSlide(s => (s + 1) % Math.max(1, slideshow.length)), [slideshow.length]);
  const prevSlide = useCallback(() => setSlide(s => (s - 1 + slideshow.length) % Math.max(1, slideshow.length)), [slideshow.length]);

  useEffect(() => {
    if (paused || slideshow.length <= 1) return;
    const t = setInterval(nextSlide, 4000);
    return () => clearInterval(t);
  }, [paused, nextSlide, slideshow.length]);

  const filteredProfiles = lbTab === "Global"
    ? profiles
    : profiles.filter(p => COUNTRY_MAP[p.country] === lbTab || p.country === lbTab);

  const feedItems = sightings.slice(0, 20);

  const carName = (s: Sighting) => {
    const make = makes[s.make_id] ?? "";
    const model = models[s.model_id] ?? "";
    return [make, model].filter(Boolean).join(" ") || "Unknown";
  };

  return (
    <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Verdana, sans-serif", minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <section style={{ padding: "72px 40px 56px", borderBottom: "1px solid #1E3A5A", textAlign: "center" }}>
        <p style={{ color: "#4A90B8", letterSpacing: "4px", fontSize: "11px", marginBottom: "20px" }}>THE SPOTTER COMMUNITY</p>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 60px)", fontWeight: "bold", lineHeight: 1.1, marginBottom: "20px" }}>
          Spot Rare Cars.<br />
          <span style={{ color: "#4A90B8" }}>Get Credit. Forever.</span>
        </h1>
        <p style={{ color: "#8BA5B8", fontSize: "16px", maxWidth: "560px", margin: "0 auto 48px", lineHeight: "1.8" }}>
          Every spotting you submit becomes a permanent record on the world's most complete rare car registry.
          Your name stays on that chassis page forever.
        </p>

        {/* Stats bar */}
        <div style={{ display: "flex", gap: "0", justifyContent: "center", flexWrap: "wrap", maxWidth: "760px", margin: "0 auto" }}>
          {[
            { n: stats.total || 5, label: "Total Spottings" },
            { n: stats.spotters || 5, label: "Total Spotters" },
            { n: stats.countries || 5, label: "Countries" },
            { n: stats.chassis || 5, label: "Chassis Found" },
          ].map((s, i) => (
            <div key={i} style={{
              flex: "1 1 160px", padding: "24px 20px",
              borderLeft: i > 0 ? "1px solid #1E3A5A" : "1px solid #1E3A5A",
              borderRight: "1px solid #1E3A5A", borderTop: "1px solid #1E3A5A", borderBottom: "1px solid #1E3A5A",
              marginLeft: i > 0 ? "-1px" : "0",
            }}>
              <p style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: "bold", color: "#4A90B8", marginBottom: "6px" }}>{s.n}</p>
              <p style={{ fontSize: "11px", letterSpacing: "2px", color: "#4A6A8A" }}>{s.label.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ghost Car Alert ── */}
      {ghost && (
        <section style={{ background: "#1A1200", borderBottom: "2px solid #E0C060", padding: "20px 40px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "260px" }}>
            <span style={{ background: "#E0C060", color: "#080F1A", fontSize: "9px", letterSpacing: "2px", padding: "4px 10px", fontWeight: "bold", whiteSpace: "nowrap" }}>
              GHOST CAR ALERT
            </span>
            <div>
              <p style={{ fontWeight: "bold", fontSize: "14px", color: "#E2EEF7", marginBottom: "2px" }}>
                {ghost.make} {ghost.model} — {ghost.chassis}
              </p>
              <p style={{ color: "#A09070", fontSize: "12px" }}>
                Last seen: {ghost.last_location}, {ghost.last_year} · Not spotted in {ghost.years_missing} years
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ color: "#E0C060", fontWeight: "bold", fontSize: "18px" }}>500 POINTS</p>
              <p style={{ color: "#A09070", fontSize: "11px", letterSpacing: "1px" }}>+ GHOST HUNTER BADGE</p>
            </div>
            <Link href="/spot" style={{ background: "#E0C060", color: "#080F1A", padding: "10px 20px", textDecoration: "none", fontSize: "12px", letterSpacing: "2px", fontWeight: "bold", whiteSpace: "nowrap" }}>
              CLAIM REWARD →
            </Link>
          </div>
        </section>
      )}

      {/* ── Sign In Bar ── */}
      <section style={{ background: "#0A1828", borderBottom: "1px solid #1E3A5A", padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <p style={{ color: "#8BA5B8", fontSize: "13px" }}>
          Sign in to submit spottings, earn points, and appear on the leaderboard
        </p>
        <Link href="/login" style={{ background: "#4A90B8", color: "#fff", padding: "10px 24px", textDecoration: "none", fontSize: "12px", letterSpacing: "2px", whiteSpace: "nowrap" }}>
          SIGN IN TO SPOT
        </Link>
      </section>

      {/* ── Slideshow ── */}
      {slideshow.length > 0 && (
        <section style={{ borderBottom: "1px solid #1E3A5A", padding: "48px 40px" }}>
          <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "24px" }}>RECENT SPOTTINGS</p>

          <div
            style={{ position: "relative", border: "1px solid #1E3A5A", overflow: "hidden" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {slideshow.map((s, i) => {
              const badge = getSlideBadge(s, s.notes);
              const name = carName(s);
              return (
                <div key={s.id} style={{ display: i === slide ? "flex" : "none", flexDirection: "row", minHeight: "300px" }}>
                  {/* Photo */}
                  <div style={{ width: "clamp(200px, 40%, 400px)", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                    {s.photo_url ? (
                      <img src={s.photo_url} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <CarPlaceholder chassis={s.chassis_number} label={badge?.label} />
                    )}
                    {s.photo_url && badge && (
                      <span style={{ position: "absolute", top: "12px", left: "12px", background: badge.color, color: "#fff", fontSize: "9px", letterSpacing: "2px", padding: "3px 8px" }}>
                        {badge.label}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#080F1A" }}>
                    <div>
                      <p style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "3px", marginBottom: "12px" }}>
                        {name.toUpperCase()}
                      </p>
                      <p style={{ fontSize: "clamp(18px,3vw,26px)", fontWeight: "bold", marginBottom: "8px" }}>{s.chassis_number}</p>
                      <p style={{ color: "#8BA5B8", fontSize: "14px", marginBottom: "16px", lineHeight: "1.6" }}>
                        {s.notes || "Spotted in the wild."}
                      </p>
                      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", color: "#4A6A8A", fontSize: "13px" }}>
                        <span>📍 {s.location_name}</span>
                        <span>🕐 {timeAgo(s.spotted_at)}</span>
                        <span style={{ color: "#4AB87A" }}>✓ {s.confidence_score}% confidence</span>
                      </div>
                    </div>

                    {/* Spotter */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #1E3A5A" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: avatarColor(s.spotter_username || "?"),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#4A90B8", fontSize: "12px", fontWeight: "bold", flexShrink: 0,
                      }}>
                        {initials(s.spotter_username || "?")}
                      </div>
                      <div>
                        <Link href={`/spotters/${encodeURIComponent(s.spotter_username || "")}`} style={{ color: "#4A90B8", textDecoration: "none", fontSize: "13px", fontWeight: "bold" }}>
                          {s.spotter_username || "anonymous"}
                        </Link>
                        <p style={{ color: "#4A6A8A", fontSize: "11px" }}>{s.country}</p>
                      </div>
                      <div style={{ marginLeft: "auto" }}>
                        <Link href={`/ferrari/288-gto/${encodeURIComponent(s.chassis_number)}`} style={{ color: "#4A6A8A", textDecoration: "none", fontSize: "12px", border: "1px solid #1E3A5A", padding: "6px 14px" }}>
                          View Chassis →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Prev/Next */}
            {slideshow.length > 1 && (
              <>
                <button onClick={prevSlide} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", background: "#080F1A99", border: "1px solid #1E3A5A", color: "#8BA5B8", width: "36px", height: "36px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                <button onClick={nextSlide} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "#080F1A99", border: "1px solid #1E3A5A", color: "#8BA5B8", width: "36px", height: "36px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
              </>
            )}
          </div>

          {/* Dots */}
          {slideshow.length > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
              {slideshow.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)} style={{
                  width: i === slide ? "24px" : "8px", height: "8px", borderRadius: "4px",
                  background: i === slide ? "#4A90B8" : "#1E3A5A", border: "none", cursor: "pointer",
                  transition: "all 0.3s ease", padding: 0,
                }} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Two-column: Feed + Leaderboard ── */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "0", borderBottom: "1px solid #1E3A5A" }} className="vv-spotters-grid">

        {/* Live Feed */}
        <div style={{ borderRight: "1px solid #1E3A5A", padding: "40px" }}>
          <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "24px" }}>LIVE FEED</p>

          {feedItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#4A6A8A" }}>
              <p>No spottings yet.</p>
              <Link href="/spot" style={{ color: "#4A90B8", textDecoration: "none", display: "block", marginTop: "12px" }}>Be the first →</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#1E3A5A" }}>
              {feedItems.map((s) => {
                const name = carName(s);
                const unidentified = !s.chassis_number || s.chassis_number === "UNKNOWN";
                return (
                  <div key={s.id} style={{ background: "#080F1A", display: "flex", gap: "14px", padding: "14px 0", alignItems: "flex-start" }}>
                    {/* Thumbnail */}
                    <div style={{ width: "64px", height: "48px", flexShrink: 0, overflow: "hidden", background: "#0A1828", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {s.photo_url ? (
                        <img src={s.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: "20px", opacity: 0.4 }}>🏎</span>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", flexWrap: "wrap" }}>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: "bold", color: "#E2EEF7", marginBottom: "2px" }}>{name}</p>
                          {unidentified ? (
                            <Link href="/spot" style={{ color: "#E0C060", fontSize: "11px", textDecoration: "none" }}>Help identify chassis →</Link>
                          ) : (
                            <p style={{ fontFamily: "monospace", fontSize: "11px", color: "#4A6A8A" }}>{s.chassis_number}</p>
                          )}
                        </div>
                        <span style={{ color: "#4A6A8A", fontSize: "11px", whiteSpace: "nowrap" }}>{timeAgo(s.spotted_at)}</span>
                      </div>
                      <p style={{ color: "#4A6A8A", fontSize: "12px", marginTop: "4px" }}>📍 {s.location_name}</p>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "6px", flexWrap: "wrap" }}>
                        <Link href={`/spotters/${encodeURIComponent(s.spotter_username || "")}`} style={{ color: "#4A90B8", textDecoration: "none", fontSize: "12px" }}>
                          @{s.spotter_username || "anonymous"}
                        </Link>
                        <span style={{ color: "#1E3A5A" }}>·</span>
                        <span style={{ color: s.confidence_score >= 80 ? "#4AB87A" : s.confidence_score >= 60 ? "#B8944A" : "#E07070", fontSize: "11px" }}>
                          {s.confidence_score}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {sightings.length > 20 && (
            <Link href="/sightings" style={{ display: "block", textAlign: "center", color: "#4A90B8", textDecoration: "none", fontSize: "13px", marginTop: "24px" }}>
              View all {sightings.length} spottings →
            </Link>
          )}
        </div>

        {/* Leaderboard */}
        <div style={{ padding: "40px 32px" }}>
          <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "20px" }}>LEADERBOARD</p>

          {/* Country tabs */}
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "24px" }}>
            {COUNTRY_TABS.map(tab => (
              <button key={tab} onClick={() => setLbTab(tab)} style={{
                background: lbTab === tab ? "#4A90B8" : "none",
                border: `1px solid ${lbTab === tab ? "#4A90B8" : "#1E3A5A"}`,
                color: lbTab === tab ? "#fff" : "#4A6A8A",
                padding: "5px 10px", fontSize: "10px", letterSpacing: "1px",
                cursor: "pointer", fontFamily: "Verdana, sans-serif",
              }}>{tab.toUpperCase()}</button>
            ))}
          </div>

          {filteredProfiles.length === 0 ? (
            <p style={{ color: "#4A6A8A", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>No spotters in this region yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#1E3A5A" }}>
              {filteredProfiles.slice(0, 10).map((p, i) => (
                <div key={p.username} style={{ background: "#080F1A", display: "flex", alignItems: "center", padding: "12px", gap: "12px" }}>
                  {/* Rank */}
                  <span style={{
                    minWidth: "22px", textAlign: "center", fontWeight: "bold",
                    fontSize: i < 3 ? "16px" : "13px",
                    color: i === 0 ? "#E0C060" : i === 1 ? "#A8A8A8" : i === 2 ? "#C87840" : "#4A6A8A",
                  }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </span>

                  {/* Avatar */}
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                    background: avatarColor(p.username),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#4A90B8", fontSize: "11px", fontWeight: "bold",
                  }}>
                    {initials(p.username)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <Link href={`/spotters/${encodeURIComponent(p.username)}`} style={{ color: "#E2EEF7", textDecoration: "none", fontSize: "13px", fontWeight: "bold" }}>
                        {p.username}
                      </Link>
                      {trustBadge(p.trust_level)}
                    </div>
                    <p style={{ color: "#4A6A8A", fontSize: "11px", marginTop: "2px" }}>
                      {p.country} · {p.verified_sightings} spottings
                    </p>
                  </div>

                  {/* Points */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ color: "#4A90B8", fontWeight: "bold", fontSize: "14px" }}>{p.total_points.toLocaleString()}</p>
                    <p style={{ color: "#4A6A8A", fontSize: "10px", letterSpacing: "1px" }}>PTS</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link href="/leaderboard" style={{ display: "block", textAlign: "center", color: "#4A90B8", textDecoration: "none", fontSize: "12px", marginTop: "20px", border: "1px solid #1E3A5A", padding: "10px" }}>
            Full Leaderboard →
          </Link>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "56px 40px", display: "flex", gap: "16px", justifyContent: "center", alignItems: "center", flexWrap: "wrap", borderBottom: "1px solid #1E3A5A" }}>
        <Link href="/spot" style={{ background: "#4A90B8", color: "#fff", padding: "16px 36px", textDecoration: "none", fontSize: "13px", letterSpacing: "2px" }}>
          SUBMIT A SPOTTING
        </Link>
        <Link href="/login?tab=register" style={{ border: "1px solid #4A90B8", color: "#4A90B8", padding: "16px 36px", textDecoration: "none", fontSize: "13px", letterSpacing: "2px" }}>
          CREATE ACCOUNT
        </Link>
      </section>

    </main>
  );
}
