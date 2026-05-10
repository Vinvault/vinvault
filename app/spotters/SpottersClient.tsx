"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import type { PageData, Sighting, SpotterProfile } from "./page";
import { colors } from "@/app/components/ui/tokens";
import PullToRefresh from "@/app/components/PullToRefresh";

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
  const map: Record<number, { label: string; color: string; bg: string }> = {
    1: { label: "NEW", color: colors.textMuted, bg: colors.surfaceAlt },
    2: { label: "TRUSTED", color: colors.accentBlue, bg: '#E8F0FA' },
    3: { label: "TRUSTED", color: colors.success, bg: '#E8F4EC' },
    4: { label: "EXPERT", color: colors.accent, bg: '#FBF3E0' },
  };
  const t = map[level] ?? map[1];
  return (
    <span style={{ fontSize: "9px", letterSpacing: "1px", color: t.color, border: `1px solid ${t.color}60`, padding: "2px 6px", fontFamily: "Verdana, sans-serif", background: t.bg }}>
      {t.label}
    </span>
  );
}

function avatarColor(name: string): string {
  const avColors = [colors.accentBlue, "#1A4A2A", "#3A1A2A", "#2A1A4A", "#3A2A1A"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % avColors.length;
  return avColors[h];
}

const COUNTRY_TABS = ["Global", "Monaco", "Sweden", "Denmark", "UK", "Germany", "Italy", "France"] as const;
type CountryTab = typeof COUNTRY_TABS[number];
const COUNTRY_MAP: Record<string, CountryTab> = {
  "Monaco": "Monaco", "Sweden": "Sweden", "Denmark": "Denmark",
  "United Kingdom": "UK", "Germany": "Germany", "Italy": "Italy", "France": "France",
};

function getSlideBadge(s: Sighting, notes?: string): { label: string; color: string; bg: string } | null {
  if (notes?.toLowerCase().includes("ghost")) return { label: "GHOST CAR FOUND", color: colors.accent, bg: '#FBF3E0' };
  if (s.status === "verified" && s.confidence_score >= 90) return { label: "VERIFIED", color: colors.success, bg: '#E8F4EC' };
  return { label: "COMMUNITY", color: colors.accentBlue, bg: '#E8F0FA' };
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
    <main style={{ background: colors.bg, color: colors.textPrimary, fontFamily: 'Georgia, serif', minHeight: '100vh' }}>
      <PullToRefresh />

      {/* Hero */}
      <section style={{ padding: '72px 40px 56px', borderBottom: `1px solid ${colors.border}`, textAlign: 'center', background: colors.surface }}>
        <p style={{ color: colors.accent, letterSpacing: '4px', fontSize: '11px', marginBottom: '20px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
          The Spotter Community
        </p>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 'bold', lineHeight: 1.1, marginBottom: '20px', fontFamily: 'Georgia, serif', color: colors.textPrimary }}>
          Spot Rare Cars.<br />
          <span style={{ color: colors.accent }}>Get Credit. Forever.</span>
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '16px', maxWidth: '560px', margin: '0 auto 48px', lineHeight: '1.8', fontFamily: 'Georgia, serif' }}>
          Every spotting you submit becomes a permanent record on the world's most complete rare car registry.
          Your name stays on that chassis page forever.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
          <Link href="/spot" style={{
            background: colors.accentNavy, color: '#FFFDF8', padding: '13px 32px',
            textDecoration: 'none', fontSize: '11px', letterSpacing: '2px',
            fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase',
          }}>
            Submit a Spotting
          </Link>
          <Link href="/spotters" style={{
            border: `1px solid ${colors.accentNavy}`, color: colors.textPrimary, padding: '13px 32px',
            textDecoration: 'none', fontSize: '11px', letterSpacing: '2px',
            fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase',
          }}>
            View Leaderboard
          </Link>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: '0', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '760px', margin: '0 auto' }}>
          {[
            { n: stats.total || 5, label: 'Total Spottings' },
            { n: stats.spotters || 5, label: 'Total Spotters' },
            { n: stats.countries || 5, label: 'Countries' },
            { n: stats.chassis || 5, label: 'Chassis Found' },
          ].map((s, i) => (
            <div key={i} style={{
              flex: '1 1 160px', padding: '24px 20px',
              border: `1px solid ${colors.border}`,
              marginLeft: i > 0 ? '-1px' : '0',
              background: colors.bg,
            }}>
              <p style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 'bold', color: colors.accent, marginBottom: '6px', fontFamily: 'Georgia, serif' }}>{s.n}</p>
              <p style={{ fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ghost Car Alert */}
      {ghost && (
        <section style={{ background: '#FBF3E0', borderBottom: `2px solid ${colors.accent}`, padding: '20px 40px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
            <span style={{ background: colors.accent, color: colors.accentNavy, fontSize: '9px', letterSpacing: '2px', padding: '4px 10px', fontWeight: 'bold', whiteSpace: 'nowrap', fontFamily: 'Verdana, sans-serif' }}>
              GHOST CAR ALERT
            </span>
            <div>
              <p style={{ fontWeight: 'bold', fontSize: '14px', color: colors.textPrimary, marginBottom: '2px', fontFamily: 'Georgia, serif' }}>
                {ghost.make} {ghost.model} — {ghost.chassis}
              </p>
              <p style={{ color: colors.textSecondary, fontSize: '12px', fontFamily: 'Verdana, sans-serif' }}>
                Last seen: {ghost.last_location}, {ghost.last_year} · Not spotted in {ghost.years_missing} years
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: colors.accent, fontWeight: 'bold', fontSize: '18px', fontFamily: 'Georgia, serif' }}>500 POINTS</p>
              <p style={{ color: colors.textMuted, fontSize: '11px', letterSpacing: '1px', fontFamily: 'Verdana, sans-serif' }}>+ GHOST HUNTER BADGE</p>
            </div>
            <Link href="/spot" style={{ background: colors.accentNavy, color: '#FFFDF8', padding: '10px 20px', textDecoration: 'none', fontSize: '11px', letterSpacing: '2px', fontWeight: 'bold', whiteSpace: 'nowrap', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
              Claim Reward →
            </Link>
          </div>
        </section>
      )}

      {/* Sign In Bar */}
      <section style={{ background: colors.surfaceAlt, borderBottom: `1px solid ${colors.border}`, padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <p style={{ color: colors.textSecondary, fontSize: '13px', fontFamily: 'Georgia, serif' }}>
          Sign in to submit spottings, earn points, and appear on the leaderboard
        </p>
        <Link href="/login" style={{
          background: colors.accentNavy, color: '#FFFDF8', padding: '10px 24px',
          textDecoration: 'none', fontSize: '11px', letterSpacing: '2px', whiteSpace: 'nowrap',
          fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase',
        }}>
          Sign In to Spot
        </Link>
      </section>

      {/* Slideshow */}
      {slideshow.length > 0 && (
        <section style={{ borderBottom: `1px solid ${colors.border}`, padding: '48px 40px', background: colors.bg }}>
          <p style={{ color: colors.accent, letterSpacing: '3px', fontSize: '11px', marginBottom: '24px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Recent Spottings</p>

          <div
            style={{ position: 'relative', border: `1px solid ${colors.border}`, overflow: 'hidden' }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {slideshow.map((s, i) => {
              const badge = getSlideBadge(s, s.notes);
              const name = carName(s);
              return (
                <div key={s.id} style={{ display: i === slide ? 'flex' : 'none', flexDirection: 'row', minHeight: '300px' }}>
                  <div style={{ width: 'clamp(200px, 40%, 400px)', flexShrink: 0, position: 'relative', overflow: 'hidden', background: colors.surfaceAlt }}>
                    {s.photo_url ? (
                      <img src={s.photo_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', minHeight: '200px', background: colors.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
                        <span style={{ fontSize: '48px', opacity: 0.3 }}>🏎</span>
                        <span style={{ color: colors.textMuted, fontSize: '11px', letterSpacing: '2px', fontFamily: 'monospace' }}>{s.chassis_number}</span>
                      </div>
                    )}
                    {badge && (
                      <span style={{ position: 'absolute', top: '12px', left: '12px', background: badge.color, color: '#FFFDF8', fontSize: '9px', letterSpacing: '2px', padding: '3px 8px', fontFamily: 'Verdana, sans-serif' }}>
                        {badge.label}
                      </span>
                    )}
                  </div>

                  <div style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: colors.surface }}>
                    <div>
                      <p style={{ color: colors.accent, fontSize: '11px', letterSpacing: '3px', marginBottom: '12px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
                        {name}
                      </p>
                      <p style={{ fontSize: 'clamp(18px,3vw,26px)', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'Georgia, serif', color: colors.textPrimary }}>{s.chassis_number}</p>
                      <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '16px', lineHeight: '1.6', fontFamily: 'Georgia, serif' }}>
                        {s.notes || 'Spotted in the wild.'}
                      </p>
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', color: colors.textMuted, fontSize: '13px', fontFamily: 'Verdana, sans-serif' }}>
                        <span>📍 {s.location_name}</span>
                        <span>🕐 {timeAgo(s.spotted_at)}</span>
                        <span style={{ color: colors.success }}>✓ {s.confidence_score}% confidence</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: `1px solid ${colors.border}` }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: avatarColor(s.spotter_username || '?'),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#FFFDF8', fontSize: '12px', fontWeight: 'bold', flexShrink: 0,
                      }}>
                        {initials(s.spotter_username || '?')}
                      </div>
                      <div>
                        <Link href={`/spotters/${encodeURIComponent(s.spotter_username || '')}`} style={{ color: colors.accentBlue, textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>
                          {s.spotter_username || 'anonymous'}
                        </Link>
                        <p style={{ color: colors.textMuted, fontSize: '11px', fontFamily: 'Verdana, sans-serif' }}>{s.country}</p>
                      </div>
                      <div style={{ marginLeft: 'auto' }}>
                        <Link href={`/ferrari/288-gto/${encodeURIComponent(s.chassis_number)}`} style={{ color: colors.textMuted, textDecoration: 'none', fontSize: '12px', border: `1px solid ${colors.border}`, padding: '6px 14px', fontFamily: 'Verdana, sans-serif', letterSpacing: '0.5px' }}>
                          View Chassis →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {slideshow.length > 1 && (
              <>
                <button onClick={prevSlide} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: `${colors.surface}CC`, border: `1px solid ${colors.border}`, color: colors.textMuted, width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                <button onClick={nextSlide} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: `${colors.surface}CC`, border: `1px solid ${colors.border}`, color: colors.textMuted, width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
              </>
            )}
          </div>

          {slideshow.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
              {slideshow.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)} style={{
                  width: i === slide ? '24px' : '8px', height: '8px', borderRadius: '4px',
                  background: i === slide ? colors.accent : colors.border, border: 'none', cursor: 'pointer',
                  transition: 'all 0.3s ease', padding: 0,
                }} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Two-column: Feed + Leaderboard */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '0', borderBottom: `1px solid ${colors.border}` }} className="vv-spotters-grid">

        {/* Live Feed */}
        <div style={{ borderRight: `1px solid ${colors.border}`, padding: '40px', background: colors.bg }}>
          <p style={{ color: colors.accent, letterSpacing: '3px', fontSize: '11px', marginBottom: '24px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Live Feed</p>

          {feedItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: colors.textMuted }}>
              <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>No spottings yet.</p>
              <Link href="/spot" style={{ color: colors.accentBlue, textDecoration: 'none', display: 'block', marginTop: '12px', fontFamily: 'Verdana, sans-serif', fontSize: '12px' }}>Be the first →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: colors.border }}>
              {feedItems.map((s) => {
                const name = carName(s);
                const unidentified = !s.chassis_number || s.chassis_number === 'UNKNOWN';
                return (
                  <div key={s.id} style={{ background: colors.surface, display: 'flex', gap: '14px', padding: '14px 0', alignItems: 'flex-start' }}>
                    <div style={{ width: '64px', height: '48px', flexShrink: 0, overflow: 'hidden', background: colors.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${colors.border}` }}>
                      {s.photo_url ? (
                        <img src={s.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '20px', opacity: 0.3 }}>🏎</span>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '2px', fontFamily: 'Georgia, serif' }}>{name}</p>
                          {unidentified ? (
                            <Link href="/spot" style={{ color: colors.accent, fontSize: '11px', textDecoration: 'none', fontFamily: 'Verdana, sans-serif' }}>Help identify chassis →</Link>
                          ) : (
                            <p style={{ fontFamily: 'monospace', fontSize: '11px', color: colors.textMuted }}>{s.chassis_number}</p>
                          )}
                        </div>
                        <span style={{ color: colors.textMuted, fontSize: '11px', whiteSpace: 'nowrap', fontFamily: 'Verdana, sans-serif' }}>{timeAgo(s.spotted_at)}</span>
                      </div>
                      <p style={{ color: colors.textMuted, fontSize: '12px', marginTop: '4px', fontFamily: 'Verdana, sans-serif' }}>📍 {s.location_name}</p>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
                        <Link href={`/spotters/${encodeURIComponent(s.spotter_username || '')}`} style={{ color: colors.accentBlue, textDecoration: 'none', fontSize: '12px', fontFamily: 'Verdana, sans-serif' }}>
                          @{s.spotter_username || 'anonymous'}
                        </Link>
                        <span style={{ color: colors.border }}>·</span>
                        <span style={{ color: s.confidence_score >= 80 ? colors.success : s.confidence_score >= 60 ? colors.warning : colors.error, fontSize: '11px', fontFamily: 'Verdana, sans-serif' }}>
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
            <Link href="/sightings" style={{ display: 'block', textAlign: 'center', color: colors.accentBlue, textDecoration: 'none', fontSize: '13px', marginTop: '24px', fontFamily: 'Verdana, sans-serif' }}>
              View all {sightings.length} spottings →
            </Link>
          )}
        </div>

        {/* Leaderboard */}
        <div style={{ padding: '40px 32px', background: colors.surface }}>
          <p style={{ color: colors.accent, letterSpacing: '3px', fontSize: '11px', marginBottom: '20px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>Leaderboard</p>

          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {COUNTRY_TABS.map(tab => (
              <button key={tab} onClick={() => setLbTab(tab)} style={{
                background: lbTab === tab ? colors.accentNavy : 'none',
                border: `1px solid ${lbTab === tab ? colors.accentNavy : colors.border}`,
                color: lbTab === tab ? '#FFFDF8' : colors.textMuted,
                padding: '5px 10px', fontSize: '10px', letterSpacing: '1px',
                cursor: 'pointer', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase',
                transition: 'all 150ms ease',
              }}>{tab}</button>
            ))}
          </div>

          {filteredProfiles.length === 0 ? (
            <p style={{ color: colors.textMuted, fontSize: '13px', textAlign: 'center', padding: '40px 0', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>No spotters in this region yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: colors.border }}>
              {filteredProfiles.slice(0, 10).map((p, i) => (
                <div key={p.username} style={{ background: colors.surface, display: 'flex', alignItems: 'center', padding: '12px', gap: '12px' }}>
                  <span style={{
                    minWidth: '22px', textAlign: 'center', fontWeight: 'bold',
                    fontSize: i < 3 ? '16px' : '13px',
                    color: i === 0 ? colors.accent : i === 1 ? '#8A8A8A' : i === 2 ? '#A86A2A' : colors.textMuted,
                    fontFamily: 'Georgia, serif',
                  }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </span>

                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: avatarColor(p.username),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#FFFDF8', fontSize: '11px', fontWeight: 'bold', fontFamily: 'Verdana, sans-serif',
                  }}>
                    {initials(p.username)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <Link href={`/spotters/${encodeURIComponent(p.username)}`} style={{ color: colors.textPrimary, textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>
                        {p.username}
                      </Link>
                      {trustBadge(p.trust_level)}
                    </div>
                    <p style={{ color: colors.textMuted, fontSize: '11px', marginTop: '2px', fontFamily: 'Verdana, sans-serif' }}>
                      {p.country} · {p.verified_sightings} spottings
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ color: colors.accent, fontWeight: 'bold', fontSize: '14px', fontFamily: 'Georgia, serif' }}>{p.total_points.toLocaleString()}</p>
                    <p style={{ color: colors.textMuted, fontSize: '10px', letterSpacing: '1px', fontFamily: 'Verdana, sans-serif' }}>PTS</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link href="/leaderboard" style={{ display: 'block', textAlign: 'center', color: colors.accentBlue, textDecoration: 'none', fontSize: '12px', marginTop: '20px', border: `1px solid ${colors.border}`, padding: '10px', fontFamily: 'Verdana, sans-serif', letterSpacing: '0.5px' }}>
            Full Leaderboard →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '56px 40px', display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', borderBottom: `1px solid ${colors.border}`, background: colors.surfaceAlt }}>
        <Link href="/spot" style={{
          background: colors.accentNavy, color: '#FFFDF8', padding: '16px 36px',
          textDecoration: 'none', fontSize: '11px', letterSpacing: '2px',
          fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase',
        }}>
          Submit a Spotting
        </Link>
        <Link href="/login?tab=register" style={{
          border: `1px solid ${colors.accentNavy}`, color: colors.textPrimary, padding: '16px 36px',
          textDecoration: 'none', fontSize: '11px', letterSpacing: '2px',
          fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase',
        }}>
          Create Account
        </Link>
      </section>

    </main>
  );
}
