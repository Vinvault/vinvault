export const revalidate = 120;
import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumb from "@/app/components/Breadcrumb";
import AppHeader from "@/app/components/AppHeader";

export const metadata: Metadata = {
  title: "Leaderboard — VinVault",
  description: "Top contributors to the VinVault classic car registry.",
};

interface LeaderEntry {
  email: string;
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  points: number;
}

function badge(points: number): { label: string; color: string; bg: string } {
  if (points >= 1000) return { label: "Expert", color: "#F0C040", bg: "#2A1F00" };
  if (points >= 500) return { label: "Gold", color: "#C8A000", bg: "#1A1400" };
  if (points >= 100) return { label: "Silver", color: "#A0B0C0", bg: "#141820" };
  return { label: "Bronze", color: "#C87840", bg: "#1A1000" };
}

function computePoints(entry: Omit<LeaderEntry, "points">): number {
  return entry.approved * 50 + entry.pending * 10 + Math.max(0, entry.rejected) * -5;
}

async function getLeaderboard(): Promise<LeaderEntry[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/submissions?submitter_email=not.is.null&select=submitter_email,status`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 120 } }
    );
    if (!res.ok) return [];
    const data: { submitter_email: string; status: string }[] = await res.json();

    const map = new Map<string, Omit<LeaderEntry, "points">>();
    data.forEach(({ submitter_email, status }) => {
      if (!submitter_email) return;
      const existing = map.get(submitter_email) ?? { email: submitter_email, total: 0, approved: 0, rejected: 0, pending: 0 };
      existing.total++;
      if (status === "approved") existing.approved++;
      else if (status === "rejected") existing.rejected++;
      else existing.pending++;
      map.set(submitter_email, existing);
    });

    return Array.from(map.values())
      .map(e => ({ ...e, points: computePoints(e) }))
      .filter(e => e.points > 0 || e.total > 0)
      .sort((a, b) => b.points - a.points);
  } catch { return []; }
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(1, local.length - 2))}@${domain}`;
}

export default async function LeaderboardPage() {
  const leaders = await getLeaderboard();

  return (
    <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Georgia, serif", minHeight: "100vh" }}>
      <AppHeader />

      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Leaderboard" }]} />

      <div className="vv-page-container" style={{ maxWidth: "800px" }}>
        <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>COMMUNITY</p>
        <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "16px" }}>Top Contributors</h1>
        <p style={{ color: "#8BA5B8", fontSize: "15px", lineHeight: "1.7", marginBottom: "32px" }}>
          Points are earned by submitting cars and getting them verified. Earn 10 points per submission, +50 when it's approved.
        </p>

        {/* Badge legend */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "40px", flexWrap: "wrap" }}>
          {[
            { label: "Bronze", pts: "0–99", color: "#C87840", bg: "#1A1000" },
            { label: "Silver", pts: "100–499", color: "#A0B0C0", bg: "#141820" },
            { label: "Gold", pts: "500–999", color: "#C8A000", bg: "#1A1400" },
            { label: "Expert", pts: "1000+", color: "#F0C040", bg: "#2A1F00" },
          ].map(b => (
            <span key={b.label} style={{ background: b.bg, color: b.color, padding: "4px 12px", fontSize: "11px", letterSpacing: "1px", border: `1px solid ${b.color}40` }}>
              {b.label} · {b.pts} pts
            </span>
          ))}
        </div>

        {leaders.length === 0 ? (
          <div style={{ border: "1px solid #1E3A5A", padding: "48px", textAlign: "center" }}>
            <p style={{ color: "#4A6A8A", fontSize: "15px", marginBottom: "20px" }}>No contributors yet. Be the first!</p>
            <Link href="/submit" style={{ background: "#4A90B8", color: "#fff", padding: "12px 28px", textDecoration: "none", fontSize: "13px", letterSpacing: "2px" }}>
              SUBMIT A CAR
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {leaders.map((entry, i) => {
              const b = badge(entry.points);
              return (
                <div key={entry.email} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "18px 0", borderBottom: "1px solid #0D1E36", gap: "12px", flexWrap: "wrap",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <span style={{ color: "#1E3A5A", fontSize: "20px", fontWeight: "bold", width: "32px", textAlign: "right", flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <div>
                      <p style={{ fontSize: "14px", marginBottom: "4px", fontFamily: "monospace" }}>{maskEmail(entry.email)}</p>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ background: b.bg, color: b.color, padding: "2px 8px", fontSize: "10px", letterSpacing: "1px" }}>{b.label.toUpperCase()}</span>
                        <span style={{ color: "#4A6A8A", fontSize: "12px" }}>{entry.approved} approved · {entry.total} total</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "22px", fontWeight: "bold", color: "#4A90B8" }}>{entry.points}</p>
                    <p style={{ color: "#4A6A8A", fontSize: "11px", letterSpacing: "1px" }}>PTS</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: "40px", background: "#0A1828", border: "1px solid #1E3A5A", padding: "24px" }}>
          <p style={{ color: "#4A90B8", fontSize: "11px", letterSpacing: "2px", marginBottom: "8px" }}>HOW POINTS WORK</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#8BA5B8", fontSize: "14px" }}>
            <p>Submit a car: <strong style={{ color: "#E2EEF7" }}>+10 pts</strong></p>
            <p>Submission approved: <strong style={{ color: "#4AB87A" }}>+50 pts</strong> bonus</p>
            <p>Submission rejected: <strong style={{ color: "#E07070" }}>-5 pts</strong></p>
            <p>First submission ever: <strong style={{ color: "#4A90B8" }}>+25 pts</strong> bonus (coming soon)</p>
          </div>
        </div>
      </div>

      <footer className="vv-footer">
        <span><span style={{ color: "#4A90B8" }}>Vin</span>Vault Registry © 2026</span>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <Link href="/ferrari/288-gto" style={{ color: "#4A6A8A", textDecoration: "none" }}>Registry</Link>
          <Link href="/leaderboard" style={{ color: "#4A90B8", textDecoration: "none" }}>Leaderboard</Link>
          <Link href="/submit" style={{ color: "#4A6A8A", textDecoration: "none" }}>Submit</Link>
        </div>
      </footer>
    </main>
  );
}
