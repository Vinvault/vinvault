"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import { colors } from "@/app/components/ui/tokens";

const SightingsMapInner = dynamic(
  () => import("../../ferrari/288-gto/[chassis]/SightingsMapInner"),
  {
    ssr: false,
    loading: () => (
      <div style={{ width: "100%", height: "320px", background: colors.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", color: colors.textMuted, fontFamily: "Verdana, sans-serif", fontSize: "13px" }}>
        Loading map…
      </div>
    ),
  }
);

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

interface Badge {
  id: string;
  label: string;
  description: string;
  earned: boolean;
}

interface Profile {
  username: string;
  bio: string;
  country: string;
  trust_level: number;
  total_sightings: number;
  verified_sightings: number;
  total_points: number;
  created_at: string;
}

interface Props {
  profile: Profile;
  sightings: Sighting[];
  badges: Badge[];
  countries: string[];
}

const TRUST: Record<number, { label: string; color: string; description: string }> = {
  1: { label: "New Spotter", color: colors.textMuted, description: "All spottings go to manual review" },
  2: { label: "Regular", color: colors.accentBlue, description: "Auto-publish at confidence 70+" },
  3: { label: "Trusted", color: colors.success, description: "All spottings auto-publish" },
  4: { label: "Expert", color: colors.accent, description: "Can verify others' spottings" },
};

const BADGE_ICONS: Record<string, string> = {
  first_spotter: "👁",
  ghost_hunter: "👻",
  world_traveler: "🌍",
  tifosi: "🐎",
  identifier: "🔍",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ProfileClient({ profile, sightings, badges, countries }: Props) {
  const [tab, setTab] = useState<"photos" | "map">("photos");
  const trust = TRUST[profile.trust_level] ?? TRUST[1];
  const mapSightings = sightings.filter(s => Number(s.latitude) || Number(s.longitude));

  return (
    <main style={{ background: colors.bg, color: colors.textPrimary, fontFamily: 'Georgia, serif', minHeight: '100vh' }}>
      {/* Profile header */}
      <section style={{ padding: '60px 40px 48px', borderBottom: `1px solid ${colors.border}`, background: colors.surface, maxWidth: '900px', margin: '0 auto' }}>
        <p style={{ color: colors.textMuted, fontSize: '11px', letterSpacing: '2px', marginBottom: '20px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>
          <Link href="/spotters" style={{ color: colors.textMuted, textDecoration: 'none' }}>Spotters</Link>
          {" / "}{profile.username.toUpperCase()}
        </p>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: '72px', height: '72px', background: colors.surfaceAlt, border: `2px solid ${colors.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0, fontWeight: 'bold', color: colors.textSecondary }}>
            {profile.username.slice(0, 1).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{profile.username}</h1>
              <span style={{ fontSize: '10px', letterSpacing: '1px', color: trust.color, border: `1px solid ${trust.color}`, padding: '3px 8px', fontFamily: 'Verdana, sans-serif' }}>
                {trust.label.toUpperCase()}
              </span>
            </div>
            {profile.country && <p style={{ color: colors.textSecondary, fontSize: '13px', marginBottom: '8px', fontFamily: 'Verdana, sans-serif' }}>{profile.country}</p>}
            {profile.bio && <p style={{ color: colors.textSecondary, fontSize: '13px', lineHeight: '1.7', maxWidth: '520px' }}>{profile.bio}</p>}
            <p style={{ color: colors.textMuted, fontSize: '11px', marginTop: '8px', fontFamily: 'Verdana, sans-serif' }}>
              Member since {formatDate(profile.created_at)} · {trust.description}
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: colors.surfaceAlt, borderBottom: `1px solid ${colors.border}`, padding: '20px 40px', display: 'flex', gap: '48px', flexWrap: 'wrap', maxWidth: '900px', margin: '0 auto' }}>
        {[
          ["Total Spottings", profile.total_sightings || sightings.length],
          ["Verified", profile.verified_sightings || sightings.filter(s => s.status === "approved" || s.status === "verified").length],
          ["Countries", countries.length],
          ["Points", profile.total_points || sightings.reduce((n, s) => n + (s.confidence_score || 0), 0)],
        ].map(([label, val]) => (
          <div key={String(label)}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.accent, fontFamily: 'Georgia, serif' }}>{val}</div>
            <div style={{ fontSize: '11px', color: colors.textMuted, letterSpacing: '1px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </section>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px' }}>

        {/* Badges */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '11px', letterSpacing: '3px', color: colors.accent, marginBottom: '16px', fontFamily: 'Verdana, sans-serif', textTransform: 'uppercase', fontWeight: 'normal' }}>Achievements</h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {badges.map(b => (
              <div key={b.id} title={b.description} style={{
                background: b.earned ? colors.surface : colors.bg,
                border: `1px solid ${b.earned ? colors.accentBlue : colors.border}`,
                borderTop: b.earned ? `3px solid ${colors.accent}` : `3px solid ${colors.border}`,
                padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: '8px',
                opacity: b.earned ? 1 : 0.5,
                minWidth: '140px',
              }}>
                <span style={{ fontSize: '20px' }}>{BADGE_ICONS[b.id]}</span>
                <div>
                  <div style={{ fontSize: '12px', color: b.earned ? colors.textPrimary : colors.textMuted, fontWeight: b.earned ? 'bold' : 'normal', fontFamily: 'Verdana, sans-serif' }}>{b.label}</div>
                  <div style={{ fontSize: '10px', color: colors.textMuted, fontFamily: 'Verdana, sans-serif' }}>{b.earned ? "Earned" : "Locked"}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sightings tabs */}
        <section>
          <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: `1px solid ${colors.border}` }}>
            {(["photos", "map"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: 'none',
                border: 'none',
                borderBottom: tab === t ? `2px solid ${colors.accent}` : '2px solid transparent',
                color: tab === t ? colors.textPrimary : colors.textMuted,
                padding: '10px 20px',
                fontSize: '13px',
                cursor: 'pointer',
                fontFamily: 'Verdana, sans-serif',
                marginBottom: '-1px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                {t === "photos" ? `Photos (${sightings.filter(s => s.photo_url).length})` : "Map"}
              </button>
            ))}
          </div>

          {tab === "photos" && (
            sightings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: colors.textMuted, fontFamily: 'Verdana, sans-serif' }}>No spottings yet.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                {sightings.filter(s => s.photo_url).map(s => (
                  <div key={s.id} style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: colors.surfaceAlt, border: `1px solid ${colors.border}` }}>
                    <img src={s.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '8px', fontSize: '11px', color: '#FFFDF8', fontFamily: 'Verdana, sans-serif' }}>
                      <div>{s.chassis_number || "Unknown"}</div>
                      <div style={{ opacity: 0.8 }}>{s.location_name} · {formatDate(s.spotted_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "map" && mapSightings.length > 0 && (
            <div style={{ border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
              <SightingsMapInner sightings={mapSightings} height={400} />
            </div>
          )}
          {tab === "map" && mapSightings.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: colors.textMuted, fontFamily: 'Verdana, sans-serif' }}>No location data yet.</div>
          )}
        </section>
      </div>
    </main>
  );
}
