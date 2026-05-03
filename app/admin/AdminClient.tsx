"use client";
import Link from "next/link";
import { useState, useMemo } from "react";

interface Submission {
  id: string;
  chassis_number: string;
  exterior_color: string;
  original_market: string;
  submitter_email: string;
  status: string;
  created_at: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  today: number;
  thisWeek: number;
}

function computeStats(submissions: Submission[]): Stats {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - 6 * 86400000;
  return {
    total: submissions.length,
    pending: submissions.filter(s => s.status === "pending").length,
    approved: submissions.filter(s => s.status === "approved").length,
    rejected: submissions.filter(s => s.status === "rejected").length,
    today: submissions.filter(s => new Date(s.created_at).getTime() >= todayStart).length,
    thisWeek: submissions.filter(s => new Date(s.created_at).getTime() >= weekStart).length,
  };
}

export default function AdminClient({ submissions }: { submissions: Submission[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const stats = useMemo(() => computeStats(submissions), [submissions]);

  const filtered = useMemo(() => {
    return submissions.filter(s => {
      if (statusFilter && s.status !== statusFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return s.chassis_number?.toLowerCase().includes(q) ||
          s.submitter_email?.toLowerCase().includes(q) ||
          s.original_market?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [submissions, query, statusFilter]);

  return (
    <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Georgia, serif", minHeight: "100vh" }}>
      <header className="vv-header">
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>
            <span style={{ color: "#4A90B8" }}>Vin</span><span style={{ color: "#E2EEF7" }}>Vault</span>
          </span>
          <span style={{ color: "#4A90B8", fontSize: "10px", letterSpacing: "4px", marginLeft: "10px" }}>REGISTRY</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ color: "#E07070", fontSize: "11px", letterSpacing: "2px" }}>ADMIN PANEL</div>
          <Link href="/admin/instagram-queue" style={{ color: "#8BA5B8", fontSize: "12px", textDecoration: "none", border: "1px solid #1E3A5A", padding: "5px 12px" }}>
            Instagram Queue
          </Link>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" style={{ background: "none", border: "1px solid #1E3A5A", color: "#4A6A8A", padding: "6px 14px", fontSize: "12px", cursor: "pointer", fontFamily: "Georgia, serif" }}>
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px" }}>
        {/* Stats */}
        <div style={{ marginBottom: "40px" }}>
          <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "20px" }}>OVERVIEW</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "16px" }}>
            {[
              { label: "Today", value: stats.today, color: "#4A90B8" },
              { label: "This Week", value: stats.thisWeek, color: "#4A90B8" },
              { label: "All Time", value: stats.total, color: "#4A90B8" },
              { label: "Pending", value: stats.pending, color: "#B8944A" },
              { label: "Approved", value: stats.approved, color: "#4AB87A" },
              { label: "Rejected", value: stats.rejected, color: "#E07070" },
            ].map(s => (
              <div key={s.label} style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "16px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: s.color }}>{s.value}</div>
                <div style={{ color: "#8BA5B8", fontSize: "11px", letterSpacing: "1px", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search and filter */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search chassis, email, market..."
            style={{ background: "#0D1E36", border: "1px solid #1E3A5A", color: "#E2EEF7", padding: "10px 16px", fontSize: "13px", width: "280px", maxWidth: "100%", fontFamily: "Georgia, serif", outline: "none" }}
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ background: "#0D1E36", border: "1px solid #1E3A5A", color: "#8BA5B8", padding: "10px 16px", fontSize: "13px", fontFamily: "Georgia, serif" }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <span style={{ color: "#4A6A8A", fontSize: "12px", marginLeft: "auto" }}>
            {filtered.length} of {submissions.length}
          </span>
        </div>

        {/* Table */}
        <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>SUBMISSIONS</p>
        {submissions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px", color: "#4A6A8A" }}>
            <p>No submissions yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1E3A5A", color: "#4A90B8", fontSize: "11px", letterSpacing: "2px", textAlign: "left" }}>
                  <th style={{ padding: "14px 12px" }}>CHASSIS</th>
                  <th style={{ padding: "14px 12px" }}>COLOR</th>
                  <th style={{ padding: "14px 12px" }}>MARKET</th>
                  <th style={{ padding: "14px 12px" }}>SUBMITTED</th>
                  <th style={{ padding: "14px 12px" }}>STATUS</th>
                  <th style={{ padding: "14px 12px" }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #0D1E36" }}>
                    <td style={{ padding: "14px 12px", fontFamily: "monospace", fontSize: "13px" }}>{s.chassis_number}</td>
                    <td style={{ padding: "14px 12px", color: "#8BA5B8", fontSize: "13px" }}>{s.exterior_color || "—"}</td>
                    <td style={{ padding: "14px 12px", color: "#8BA5B8", fontSize: "13px" }}>{s.original_market || "—"}</td>
                    <td style={{ padding: "14px 12px", color: "#8BA5B8", fontSize: "13px" }}>{new Date(s.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: "14px 12px" }}>
                      <span style={{
                        background: s.status === "approved" ? "#0D2A1A" : s.status === "rejected" ? "#2A0D0D" : "#2A1A0D",
                        color: s.status === "approved" ? "#4AB87A" : s.status === "rejected" ? "#E07070" : "#B8944A",
                        padding: "4px 10px", fontSize: "11px", letterSpacing: "1px",
                      }}>{s.status?.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <Link href={`/admin/submission/${s.id}`} style={{ color: "#4A90B8", fontSize: "12px", textDecoration: "none", border: "1px solid #1E3A5A", padding: "4px 10px" }}>
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <footer style={{ borderTop: "1px solid #1E3A5A", padding: "32px 40px", textAlign: "center", color: "#4A6A8A", fontSize: "13px" }}>
        <span style={{ color: "#4A90B8" }}>Vin</span>Vault Registry © 2026 · Admin
      </footer>
    </main>
  );
}
