"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import CountUp from "./components/CountUp";
import NewsletterForm from "./components/NewsletterForm";
import { colors } from "./components/ui/tokens";

const TOTAL_PRODUCED = 272;

interface Sighting { id: string; spotter_username: string; location_name: string; country: string; spotted_at: string; }
interface SpotterProfile { username: string; country: string; total_points: number; verified_sightings: number; }

function avatarColor(name: string): string {
  const avColors = [colors.accentBlue, "#1A4A2A", "#3A1A2A", "#2A1A4A"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % avColors.length;
  return avColors[h];
}

function initials(name: string): string { return name.slice(0, 2).toUpperCase(); }

export default function HomeClient({
  recent,
  documented,
  sightings,
  stats,
  topSpotters,
  ghost,
}: {
  recent: { id: string; chassis_number: string; exterior_color: string; original_market: string; created_at: string }[];
  documented: number;
  sightings: Sighting[];
  stats: { chassis: number; sightings: number; spotters: number; countries: number };
  topSpotters: SpotterProfile[];
  ghost: { chassis: string; make: string; model: string; last_location: string; last_year: number; years_missing: number } | null;
}) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 120);
    return () => clearTimeout(t);
  }, []);

  const pct = documented > 0 ? Math.min(100, Math.round((documented / TOTAL_PRODUCED) * 100)) : 0;

  const tickerItems = sightings.length > 0
    ? sightings.map(s => `Ferrari 288 GTO spotted in ${s.location_name || s.country || "unknown location"}`)
    : ["Ferrari 288 GTO spotted in Monaco", "Ferrari 288 GTO spotted in Copenhagen", "Ferrari 288 GTO spotted in London", "Ferrari 288 GTO spotted in Tokyo", "Ferrari 288 GTO spotted in Maranello"];

  const tickerText = tickerItems.join("  ·  ");

  const btnPrimary: React.CSSProperties = {
    background: colors.accentNavy, color: "#FFFDF8", padding: "12px 28px", textDecoration: "none",
    fontSize: "11px", letterSpacing: "2px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase",
    border: "none", cursor: "pointer", display: "inline-block",
  };
  const btnGold: React.CSSProperties = {
    background: colors.accent, color: colors.accentNavy, padding: "12px 28px", textDecoration: "none",
    fontSize: "11px", letterSpacing: "2px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase",
    border: "none", cursor: "pointer", display: "inline-block", fontWeight: "bold",
  };
  const btnOutline: React.CSSProperties = {
    border: `1px solid ${colors.accent}`, color: colors.accent, padding: "12px 28px", textDecoration: "none",
    fontSize: "11px", letterSpacing: "2px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase",
    display: "inline-block",
  };

  return (
    <main style={{ background: colors.bg, color: colors.textPrimary, fontFamily: "Georgia, serif", minHeight: "100vh" }}>

      {/* ── SECTION 1: HERO ── */}
      <section style={{ background: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{
          maxWidth: "1280px", margin: "0 auto",
          display: "grid", gridTemplateColumns: "1fr 340px", gap: "0",
          padding: "64px 32px",
        }} className="vv-hero-grid">
          {/* Left: Text */}
          <div style={{ paddingRight: "48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ color: colors.accent, fontFamily: "Verdana, sans-serif", fontSize: "9px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "20px" }}>
              Curated Automotive Registry
            </p>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "bold", lineHeight: 1.15, color: colors.textPrimary, marginBottom: "20px" }}>
              The Definitive Record of<br />
              The World's <span style={{ color: colors.accent }}>Rarest Cars</span>
            </h1>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: colors.textSecondary, lineHeight: "1.8", maxWidth: "520px", marginBottom: "32px" }}>
              Community-verified chassis records for the most special, limited, and collectible automobiles ever built. Every VIN documented. Every history preserved.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link href="/ferrari/288-gto" style={btnPrimary}>Browse Registry</Link>
              <Link href="/spot" style={btnOutline}>Submit a Spotting</Link>
            </div>
          </div>

          {/* Right: Recent additions sidebar */}
          <div style={{
            background: colors.surfaceAlt,
            borderLeft: `3px solid ${colors.accent}`,
            padding: "28px 24px",
            display: "flex", flexDirection: "column", gap: "0",
          }}>
            <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "9px", letterSpacing: "3px", color: colors.textMuted, textTransform: "uppercase", marginBottom: "20px" }}>
              Recent Additions
            </p>
            {recent.length === 0 ? (
              <p style={{ color: colors.textMuted, fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "14px" }}>No recent additions yet.</p>
            ) : recent.map((r, i) => (
              <Link key={r.id} href={`/ferrari/288-gto/${r.chassis_number}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: "10px",
                  padding: "14px 0",
                  borderBottom: i < recent.length - 1 ? `1px solid ${colors.border}` : "none",
                }}>
                  <span style={{ color: colors.accent, fontSize: "16px", lineHeight: 1, flexShrink: 0, marginTop: "2px" }}>·</span>
                  <div>
                    <p style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: "bold", color: colors.textPrimary, marginBottom: "3px", letterSpacing: "0.5px" }}>
                      {r.chassis_number}
                    </p>
                    <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "10px", color: colors.textMuted }}>
                      Ferrari 288 GTO{r.exterior_color ? ` · ${r.exterior_color}` : ""}{r.original_market ? ` · ${r.original_market}` : ""}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            <Link href="/ferrari/288-gto" style={{ ...btnPrimary, marginTop: "20px", textAlign: "center", fontSize: "10px" }}>
              View Full Registry →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: LIVE TICKER ── */}
      <div style={{ background: colors.footerBg, height: "40px", overflow: "hidden", display: "flex", alignItems: "center" }}>
        <div className="vv-ticker-inner" style={{ paddingLeft: "40px" }}>
          <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: colors.accent, whiteSpace: "nowrap", letterSpacing: "0.5px" }}>
            {tickerText}{"  ·  "}{tickerText}{"  ·  "}
          </span>
          <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: colors.accent, whiteSpace: "nowrap", letterSpacing: "0.5px" }}>
            {tickerText}{"  ·  "}{tickerText}{"  ·  "}
          </span>
        </div>
      </div>

      {/* ── SECTION 3: STATS BAR ── */}
      <section style={{ background: colors.surface, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}`, padding: "32px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "center", gap: "0", flexWrap: "wrap" }}>
          {[
            { n: stats.chassis || documented, l: "Chassis Tracked" },
            { n: stats.sightings, l: "Spottings" },
            { n: stats.spotters, l: "Spotters" },
            { n: stats.countries, l: "Countries" },
          ].map((s, i) => (
            <div key={s.l} style={{
              textAlign: "center", flex: "1 1 160px", padding: "16px 24px",
              borderLeft: i > 0 ? `1px solid ${colors.border}` : "none",
            }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: "32px", fontWeight: "bold", color: colors.accent }}>
                <CountUp target={s.n} />
              </div>
              <div style={{ fontFamily: "Verdana, sans-serif", fontSize: "9px", letterSpacing: "2px", color: colors.textMuted, marginTop: "6px", textTransform: "uppercase" }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 4: SPLIT — REGISTRY | SPOTTERS ── */}
      <section style={{ background: colors.border, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px" }} className="vv-split-grid">
        <div style={{ background: colors.bg, padding: "40px 32px" }}>
          <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "9px", letterSpacing: "3px", color: colors.accent, textTransform: "uppercase", marginBottom: "12px" }}>The Registry</p>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: "bold", color: colors.textPrimary, marginBottom: "12px" }}>The Registry</h2>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: colors.textSecondary, lineHeight: "1.7", marginBottom: "24px" }}>
            Every chassis of the Ferrari 288 GTO documented, cross-referenced and verified by the community. History preserved for generations.
          </p>
          <Link href="/ferrari/288-gto" style={btnPrimary}>Browse Registry</Link>
        </div>
        <div style={{ background: colors.surfaceAlt, padding: "40px 32px" }}>
          <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "9px", letterSpacing: "3px", color: colors.accent, textTransform: "uppercase", marginBottom: "12px" }}>The Community</p>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: "bold", color: colors.textPrimary, marginBottom: "12px" }}>The Spotter Community</h2>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: colors.textSecondary, lineHeight: "1.7", marginBottom: "24px" }}>
            Earn points for every verified spotting. Build your reputation. Your name stays on the chassis record forever.
          </p>
          <Link href="/spot" style={btnGold}>Submit a Spotting</Link>
        </div>
      </section>

      {/* ── SECTION 5: REGISTRY GRID ── */}
      <section style={{ background: colors.bg, padding: "48px 32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "28px" }}>
            <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "10px", letterSpacing: "3px", color: colors.textMuted, textTransform: "uppercase" }}>Registries</p>
            <Link href="/ferrari/288-gto" style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: colors.accentBlue, textDecoration: "none" }}>View all →</Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {/* Ferrari 288 GTO card */}
            <Link href="/ferrari/288-gto" style={{ textDecoration: "none", color: "inherit" }}>
              <div
                className="vv-card"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderTop: `3px solid ${colors.accent}`,
                  padding: "20px",
                  cursor: "pointer",
                }}
              >
                <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "9px", letterSpacing: "2px", color: colors.textMuted, textTransform: "uppercase", marginBottom: "6px" }}>Ferrari</p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "16px", fontWeight: "bold", color: colors.textPrimary, marginBottom: "4px" }}>288 GTO</p>
                <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: colors.textMuted, marginBottom: "16px" }}>
                  1984–1985 · {documented} of {TOTAL_PRODUCED} documented
                </p>
                <div style={{ background: colors.border, height: "3px", marginBottom: "8px" }}>
                  <div
                    className="vv-progress-fill"
                    style={{
                      background: colors.accent,
                      height: "3px",
                      width: animate ? `${pct}%` : "0%",
                    }}
                  />
                </div>
                <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "10px", color: colors.textMuted }}>{pct}% complete</p>
              </div>
            </Link>

            {/* Coming soon card */}
            <div style={{ background: colors.surface, border: `1px dashed ${colors.border}`, padding: "20px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "140px" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ color: colors.border, fontSize: "24px", marginBottom: "8px" }}>+</p>
                <p style={{ color: colors.textMuted, fontSize: "11px", letterSpacing: "1px", fontFamily: "Verdana, sans-serif" }}>More registries soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: GHOST CAR SPOTLIGHT ── */}
      {ghost && (
        <section style={{ background: colors.footerBg, padding: "48px 32px", borderLeft: `4px solid ${colors.accent}` }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", gap: "32px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "9px", letterSpacing: "2px", color: colors.accent, textTransform: "uppercase", marginBottom: "12px" }}>Ghost Car Alert</p>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: "bold", color: "#FFFDF8", marginBottom: "8px" }}>
                {ghost.make} {ghost.model} — {ghost.chassis}
              </h2>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: "#9A8A7A", lineHeight: "1.7" }}>
                Not spotted in {ghost.years_missing} years. Last seen in {ghost.last_location}, {ghost.last_year}. If you see this car, document it and earn the Ghost Hunter badge.
              </p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: "bold", color: colors.accent, marginBottom: "4px" }}>500 POINTS</p>
              <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "9px", color: "#9A8A7A", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>+ Ghost Hunter Badge</p>
              <Link href="/spot" style={btnGold}>Claim Reward →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 7: LEADERBOARD PREVIEW ── */}
      {topSpotters.length > 0 && (
        <section style={{ background: colors.surface, padding: "48px 32px", borderTop: `1px solid ${colors.border}` }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "28px" }}>
              <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "10px", letterSpacing: "3px", color: colors.textMuted, textTransform: "uppercase" }}>Top Spotters</p>
              <Link href="/leaderboard" style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: colors.accentBlue, textDecoration: "none" }}>Full Leaderboard →</Link>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {topSpotters.map((p, i) => (
                <Link key={p.username} href={`/spotters/${encodeURIComponent(p.username)}`} style={{ textDecoration: "none", flex: "1 1 160px" }}>
                  <div className="vv-card" style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderTop: i === 0 ? `3px solid ${colors.accent}` : `3px solid ${colors.border}`, padding: "16px", textAlign: "center" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%", margin: "0 auto 10px",
                      background: avatarColor(p.username),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#FFFDF8", fontFamily: "Verdana, sans-serif", fontSize: "13px", fontWeight: "bold",
                    }}>
                      {initials(p.username)}
                    </div>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "13px", fontWeight: "bold", color: colors.textPrimary, marginBottom: "4px" }}>{p.username}</p>
                    <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "10px", color: colors.textMuted }}>{p.country || "—"}</p>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "16px", fontWeight: "bold", color: colors.accent, marginTop: "8px" }}>{p.total_points.toLocaleString()} pts</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── How It Works ── */}
      <section style={{ background: colors.bg, padding: "48px 32px", borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "10px", letterSpacing: "3px", color: colors.accent, textTransform: "uppercase", marginBottom: "28px" }}>How It Works</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0" }}>
            {[
              { step: "01", title: "Submit", desc: "Fill in the chassis details — number, color, market, history. Partial info welcome." },
              { step: "02", title: "Review", desc: "Validators cross-reference against factory records, auction catalogs, and known documentation." },
              { step: "03", title: "Verify", desc: "Information checks out, the record is approved and added to the permanent registry." },
              { step: "04", title: "Publish", desc: "The chassis gets its own permanent page, publicly accessible and searchable forever." },
            ].map((item, i) => (
              <div key={item.step} style={{ padding: "24px 28px", borderLeft: i > 0 ? `1px solid ${colors.border}` : "none", borderTop: `3px solid ${colors.accent}` }}>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: "bold", color: colors.accent, marginBottom: "12px", lineHeight: 1 }}>{item.step}</p>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: "16px", fontWeight: "bold", color: colors.textPrimary, marginBottom: "10px" }}>{item.title}</h3>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: colors.textSecondary, lineHeight: "1.7" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: colors.surfaceAlt, borderTop: `1px solid ${colors.border}`, padding: "64px 32px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: "bold", color: colors.textPrimary, marginBottom: "12px" }}>Know a car that's not listed?</h2>
        <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: colors.textSecondary, marginBottom: "32px", maxWidth: "440px", margin: "0 auto 32px", lineHeight: "1.7" }}>
          Help make the registry more complete. Submit chassis details and we'll verify and publish the record.
        </p>
        <Link href="/submit" style={btnPrimary}>Submit a Car</Link>
      </section>

      {/* ── Newsletter ── */}
      <section style={{ borderTop: `1px solid ${colors.border}`, padding: "48px 32px", background: colors.surface }}>
        <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: "Verdana, sans-serif", fontSize: "9px", letterSpacing: "3px", color: colors.accent, textTransform: "uppercase", marginBottom: "12px" }}>Stay Updated</p>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: "bold", color: colors.textPrimary, marginBottom: "10px" }}>Registry Updates</h2>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: colors.textSecondary, lineHeight: "1.7", marginBottom: "24px" }}>
            Get notified when new chassis records are added and when new registries launch.
          </p>
          <NewsletterForm />
        </div>
      </section>

    </main>
  );
}
