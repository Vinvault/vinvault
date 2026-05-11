import type { Metadata } from "next";
import { colors } from "@/app/components/ui/tokens";

export const metadata: Metadata = {
  title: "VinVault Status",
  description: "Internal build status and feature tracking for VinVault v0.1.9.",
  robots: { index: false, follow: false },
};

const VERSION = "v0.1.9";
const LAST_UPDATED = "2026-05-11";

type StatusType = "green" | "yellow" | "red";

interface StatusRow {
  label: string;
  status: StatusType;
  note?: string;
}

interface StatusGroup {
  title: string;
  rows: StatusRow[];
}

const GROUPS: StatusGroup[] = [
  {
    title: "Infrastructure",
    rows: [
      { label: "Server (Hetzner CX33)", status: "green", note: "46.225.232.69" },
      { label: "Supabase (self-hosted)", status: "green", note: "http://10.0.4.2:8000" },
      { label: "Discourse Forum", status: "green", note: "forum.vinvault.net" },
      { label: "Coolify Dashboard", status: "green", note: "coolify.vinvault.net" },
      { label: "Auto-deploy (GitHub→Coolify)", status: "green" },
      { label: "SSL Certificate", status: "green", note: "www.vinvault.net" },
      { label: "Email (Brevo SMTP)", status: "green" },
    ],
  },
  {
    title: "Core Registry",
    rows: [
      { label: "Homepage", status: "green", note: "/" },
      { label: "Ferrari 288 GTO Registry", status: "green", note: "/ferrari/288-gto" },
      { label: "Individual chassis pages", status: "green", note: "/ferrari/288-gto/[chassis]" },
      { label: "Submit a car form", status: "green", note: "/submit" },
      { label: "Admin panel", status: "green", note: "/admin" },
      { label: "Admin login protection", status: "green" },
      { label: "User registration/login", status: "green", note: "/login" },
      { label: "Car ownership claiming", status: "green" },
      { label: "Image upload", status: "green" },
      { label: "Case-insensitive URLs", status: "green" },
      { label: "Custom 404 page", status: "green" },
      { label: "Makes & models database", status: "green", note: "100+ makes loaded" },
    ],
  },
  {
    title: "Spotter Community",
    rows: [
      { label: "Spotters hub", status: "green", note: "/spotters" },
      { label: "Spotter profiles", status: "green", note: "/spotters/[username]" },
      { label: "Spotter events", status: "green", note: "/spotters/events" },
      { label: "Submit a spotting", status: "yellow", note: "/spot · Photo bucket fix needed" },
      { label: "Points system", status: "green" },
      { label: "Leaderboard", status: "green", note: "/leaderboard" },
      { label: "5 test spotter accounts", status: "green" },
    ],
  },
  {
    title: "VIN Lookup",
    rows: [
      { label: "VIN Lookup directory", status: "green", note: "/vin-lookup" },
      { label: "15 countries loaded", status: "green" },
      { label: "Community submission form", status: "green" },
    ],
  },
  {
    title: "My Garage",
    rows: [
      { label: "My Garage tab on profile", status: "green", note: "/profile" },
      { label: "Add/edit garage cars", status: "green", note: "/garage/add" },
      { label: "Car photos upload", status: "green" },
      { label: "Car documents upload", status: "green" },
      { label: "For sale listings", status: "green", note: "/garage/[id]/sell" },
      { label: "Public for sale page", status: "green", note: "/for-sale" },
      { label: "Listing carousel", status: "green" },
      { label: "30-day expiry + renewal", status: "green" },
      { label: "Instagram card generator", status: "green" },
      { label: "CarVertical/Carfax links", status: "green" },
      { label: "Special make request", status: "green" },
      { label: "Previously sold section", status: "green" },
    ],
  },
  {
    title: "Admin System",
    rows: [
      { label: "User management", status: "green" },
      { label: "Role system (9 roles)", status: "green" },
      { label: "Permission matrix page", status: "green" },
      { label: "Points administration", status: "green" },
      { label: "Audit log", status: "green" },
      { label: "Brand/model management", status: "green" },
      { label: "Subscription plans setup", status: "yellow", note: "No Stripe yet" },
      { label: "Forum category auto-create", status: "green" },
    ],
  },
  {
    title: "UI/UX",
    rows: [
      { label: "Warm white + gold theme", status: "yellow", note: "Some pages still fixing" },
      { label: "Sticky transforming header", status: "green" },
      { label: "Mobile bottom navigation", status: "green" },
      { label: "Skeleton loading", status: "yellow", note: "Partial" },
      { label: "Card hover states", status: "green" },
      { label: "Homepage live ticker", status: "yellow" },
      { label: "Chassis ownership timeline", status: "red", note: "Not built" },
      { label: "Chassis card generator", status: "red", note: "Not built" },
      { label: "Swipe gestures", status: "red", note: "Not built" },
      { label: "Pull to refresh", status: "red", note: "Not built" },
    ],
  },
  {
    title: "Content Pages",
    rows: [
      { label: "About", status: "yellow", note: "Color fix in progress" },
      { label: "FAQ", status: "yellow", note: "Color fix in progress" },
      { label: "Terms", status: "yellow", note: "Color fix in progress" },
      { label: "Privacy", status: "yellow", note: "Color fix in progress" },
    ],
  },
  {
    title: "SEO",
    rows: [
      { label: "Meta tags", status: "green" },
      { label: "Sitemap.xml", status: "green" },
      { label: "Robots.txt", status: "green" },
      { label: "Google Search Console", status: "green", note: "Verified" },
    ],
  },
];

const EMOJI: Record<StatusType, string> = { green: "🟢", yellow: "🟡", red: "🔴" };
const ROW_BG: Record<StatusType, string> = { green: "#FFFDF8", yellow: "#FFFEF0", red: "#FFF8F8" };

export default function StatusPage() {
  const allRows = GROUPS.flatMap(g => g.rows);
  const greenCount = allRows.filter(r => r.status === "green").length;
  const total = allRows.length;
  const pct = Math.round((greenCount / total) * 100);

  return (
    <main style={{ background: colors.bg, minHeight: "100vh", color: colors.textPrimary, fontFamily: "Georgia, serif" }}>
      <div className="vv-page-container" style={{ maxWidth: "860px" }}>
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <p style={{ color: colors.accent, letterSpacing: "4px", fontSize: "11px", marginBottom: "12px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase" }}>Internal Reference</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "16px", flexWrap: "wrap", marginBottom: "8px" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", fontFamily: "Georgia, serif", margin: 0 }}>VinVault Build Status</h1>
            <span style={{ background: "#FBF3E0", color: colors.accent, border: `1px solid ${colors.accent}40`, padding: "4px 14px", fontSize: "13px", fontFamily: "Verdana, sans-serif", letterSpacing: "1px" }}>{VERSION}</span>
          </div>
          <p style={{ color: colors.textMuted, fontFamily: "Verdana, sans-serif", fontSize: "12px" }}>Last updated: {LAST_UPDATED} · Internal development reference page</p>

          {/* Progress bar */}
          <div style={{ marginTop: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "12px", color: colors.textSecondary }}>{greenCount} of {total} features complete ({pct}%)</span>
            </div>
            <div style={{ background: colors.border, height: "8px", width: "100%" }}>
              <div style={{ background: colors.accent, height: "8px", width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {/* Status groups */}
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {GROUPS.map(group => (
            <section key={group.title}>
              <p style={{ color: colors.accent, letterSpacing: "3px", fontSize: "11px", marginBottom: "12px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase" }}>{group.title}</p>
              <div style={{ border: `1px solid ${colors.border}`, overflow: "hidden" }}>
                {group.rows.map((row, i) => (
                  <div key={row.label} style={{
                    display: "flex", alignItems: "center", gap: "16px",
                    padding: "10px 16px",
                    background: ROW_BG[row.status],
                    borderTop: i > 0 ? `1px solid ${colors.border}` : "none",
                  }}>
                    <span style={{ fontSize: "16px", flexShrink: 0 }}>{EMOJI[row.status]}</span>
                    <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "13px", color: colors.textPrimary, flex: 1 }}>{row.label}</span>
                    {row.note && <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "11px", color: colors.textMuted }}>{row.note}</span>}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Legend */}
        <div style={{ marginTop: "48px", padding: "20px 24px", background: colors.surface, border: `1px solid ${colors.border}` }}>
          <p style={{ color: colors.accent, letterSpacing: "3px", fontSize: "11px", marginBottom: "16px", fontFamily: "Verdana, sans-serif", textTransform: "uppercase" }}>Legend</p>
          <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
            {(["green", "yellow", "red"] as StatusType[]).map(s => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px" }}>{EMOJI[s]}</span>
                <span style={{ fontFamily: "Verdana, sans-serif", fontSize: "12px", color: colors.textSecondary }}>
                  {s === "green" ? "Complete" : s === "yellow" ? "Partial / In Progress" : "Not yet built"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
