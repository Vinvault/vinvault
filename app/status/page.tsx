import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VinVault Status",
  description: "Internal build status and feature tracking for VinVault v0.1.8.",
  robots: { index: false, follow: false },
};

const VERSION = "v0.1.8";

type StatusDot = "green" | "amber" | "red";

interface Feature {
  name: string;
  status: StatusDot;
  url: string;
  notes?: string;
}

const FEATURES: Feature[] = [
  { name: "Homepage redesign", status: "green", url: "/", notes: "Warm white theme" },
  { name: "Ferrari 288 GTO Registry", status: "green", url: "/ferrari/288-gto", notes: "Live data" },
  { name: "Individual chassis pages", status: "green", url: "/ferrari/288-gto/[chassis]" },
  { name: "Submit a car form", status: "green", url: "/submit" },
  { name: "Admin panel", status: "green", url: "/admin" },
  { name: "User login/register", status: "green", url: "/login" },
  { name: "Car ownership claiming", status: "green", url: "/profile" },
  { name: "Image upload", status: "green", url: "/submit" },
  { name: "Mobile responsive", status: "amber", url: "all", notes: "Bottom nav done, some pages still dark" },
  { name: "SSL certificate", status: "green", url: "www.vinvault.net" },
  { name: "Custom 404 page", status: "green", url: "/wrongurl" },
  { name: "Case-insensitive URLs", status: "green", url: "middleware" },
  { name: "About page", status: "amber", url: "/about", notes: "Color fix in progress" },
  { name: "FAQ page", status: "amber", url: "/faq", notes: "Color fix in progress" },
  { name: "Terms page", status: "amber", url: "/terms", notes: "Color fix in progress" },
  { name: "Privacy page", status: "amber", url: "/privacy", notes: "Color fix in progress" },
  { name: "Email notifications", status: "green", url: "/api/", notes: "Brevo SMTP" },
  { name: "Forum integration", status: "green", url: "forum.vinvault.net" },
  { name: "Auto-deploy pipeline", status: "green", url: "GitHub → Coolify" },
  { name: "Spotters hub", status: "green", url: "/spotters" },
  { name: "Spotter profiles", status: "green", url: "/spotters/[username]" },
  { name: "Spotter events", status: "green", url: "/spotters/events" },
  { name: "Submit a spotting", status: "amber", url: "/spot", notes: "Bucket fix needed" },
  { name: "VIN Lookup directory", status: "green", url: "/vin-lookup" },
  { name: "Leaderboard", status: "green", url: "/leaderboard" },
  { name: "Points system", status: "green", url: "/api/points" },
  { name: "Makes & models database", status: "green", url: "admin" },
  { name: "Discourse forum", status: "green", url: "forum.vinvault.net" },
  { name: "Sticky header", status: "green", url: "all pages" },
  { name: "Mobile bottom nav", status: "green", url: "mobile" },
  { name: "Skeleton loading", status: "amber", url: "registry" },
  { name: "Card hover states", status: "green", url: "registry" },
  { name: "Homepage live ticker", status: "amber", url: "/" },
  { name: "Chassis ownership timeline", status: "red", url: "/ferrari/288-gto/[chassis]" },
  { name: "Chassis card generator", status: "red", url: "/api/chassis-card" },
  { name: "Swipe gestures", status: "red", url: "mobile registry" },
  { name: "Pull to refresh", status: "red", url: "mobile" },
  { name: "Ghost car alert", status: "amber", url: "/" },
  { name: "SEO meta tags", status: "green", url: "all" },
  { name: "Sitemap", status: "green", url: "/sitemap.xml" },
  { name: "Google Search Console", status: "green", url: "verified" },
  { name: "Admin user management", status: "green", url: "/admin" },
  { name: "Admin roles system", status: "green", url: "/admin" },
  { name: "Admin audit log", status: "green", url: "/admin" },
  { name: "Subscription plans", status: "amber", url: "/admin", notes: "No Stripe yet" },
  { name: "Warm white theme", status: "amber", url: "all", notes: "Fix in progress v0.1.8" },
];

const DOT: Record<StatusDot, { emoji: string; color: string; label: string; bg: string }> = {
  green: { emoji: "🟢", color: "#2A7A4A", label: "Complete", bg: "#E8F4EC" },
  amber: { emoji: "🟡", color: "#A88A3A", label: "Partial", bg: "#FBF3E0" },
  red:   { emoji: "🔴", color: "#8A2A2A", label: "Missing", bg: "#F4E8E8" },
};

const green = FEATURES.filter(f => f.status === "green").length;
const amber = FEATURES.filter(f => f.status === "amber").length;
const red   = FEATURES.filter(f => f.status === "red").length;

export default function StatusPage() {
  return (
    <div style={{ background: '#F8F6F1', minHeight: '100vh', color: '#1A1A1A', fontFamily: 'Georgia, serif' }}>

      {/* Hero */}
      <section style={{ background: '#FFFDF8', borderBottom: '1px solid #E8E2D8', padding: '48px 32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'Verdana, sans-serif', fontSize: '11px', letterSpacing: '4px', color: '#9A8A7A', textTransform: 'uppercase', marginBottom: '12px' }}>INTERNAL</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: 'bold', color: '#1A1A1A', marginBottom: '12px' }}>VinVault Build Status</h1>
          <p style={{ fontFamily: 'Verdana, sans-serif', fontSize: '13px', color: '#C9A84C', margin: 0, letterSpacing: '1px' }}>
            Version: <strong>{VERSION}</strong>
          </p>
        </div>
      </section>

      {/* Summary */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 32px 0' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {([
            { dot: "green" as StatusDot, count: green },
            { dot: "amber" as StatusDot, count: amber },
            { dot: "red"   as StatusDot, count: red },
          ]).map(({ dot, count }) => (
            <div key={dot} style={{ background: DOT[dot].bg, border: `1px solid ${DOT[dot].color}40`, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>{DOT[dot].emoji}</span>
              <div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: 'bold', color: DOT[dot].color }}>{count}</div>
                <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: '10px', color: '#9A8A7A', textTransform: 'uppercase', letterSpacing: '2px' }}>{DOT[dot].label}</div>
              </div>
            </div>
          ))}
          <div style={{ background: '#FFFDF8', border: '1px solid #E8E2D8', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: 'bold', color: '#1A1A1A' }}>{FEATURES.length}</div>
              <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: '10px', color: '#9A8A7A', textTransform: 'uppercase', letterSpacing: '2px' }}>Total Features</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', marginBottom: '64px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#1A1A1A' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontFamily: 'Verdana, sans-serif', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#FFFDF8', fontWeight: 'normal' }}>Feature</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontFamily: 'Verdana, sans-serif', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#FFFDF8', fontWeight: 'normal', width: '100px' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontFamily: 'Verdana, sans-serif', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#FFFDF8', fontWeight: 'normal', width: '180px' }}>URL</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontFamily: 'Verdana, sans-serif', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#FFFDF8', fontWeight: 'normal' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((f, i) => (
                <tr
                  key={f.name}
                  style={{
                    background: i % 2 === 0 ? '#FFFDF8' : '#F8F6F1',
                    borderBottom: '1px solid #E8E2D8',
                  }}
                >
                  <td style={{ padding: '12px 16px', fontFamily: 'Georgia, serif', fontSize: '14px', color: '#1A1A1A' }}>{f.name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: DOT[f.status].bg,
                      color: DOT[f.status].color,
                      padding: '3px 10px',
                      fontSize: '11px',
                      fontFamily: 'Verdana, sans-serif',
                      border: `1px solid ${DOT[f.status].color}40`,
                    }}>
                      {DOT[f.status].emoji} {DOT[f.status].label}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#6A5A4A' }}>{f.url}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'Georgia, serif', fontSize: '13px', color: '#9A8A7A', fontStyle: f.notes ? 'normal' : 'italic' }}>{f.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
