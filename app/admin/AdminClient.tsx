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

interface Claim {
  id: string;
  chassis_number: string;
  user_email: string;
  status: string;
  message: string;
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

export default function AdminClient({ submissions, claims }: { submissions: Submission[]; claims: Claim[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tab, setTab] = useState<"submissions" | "claims">("submissions");
  const [claimProcessing, setClaimProcessing] = useState<string | null>(null);
  const [claimResults, setClaimResults] = useState<Record<string, string>>({});
  const [storageMsg, setStorageMsg] = useState("");

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

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return c.chassis_number?.toLowerCase().includes(q) ||
          c.user_email?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [claims, query, statusFilter]);

  async function initStorage() {
    setStorageMsg("Creating storage bucket...");
    const res = await fetch("/api/admin/init-storage", { method: "POST" });
    const data = await res.json();
    setStorageMsg(res.ok ? `Storage setup: ${JSON.stringify(data)}` : `Error: ${JSON.stringify(data)}`);
  }

  async function handleClaim(id: string, action: "approved" | "rejected") {
    setClaimProcessing(id);
    try {
      const res = await fetch("/api/admin/claims", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: action }),
      });
      if (res.ok) {
        setClaimResults(prev => ({ ...prev, [id]: action }));
      } else {
        setClaimResults(prev => ({ ...prev, [id]: "error" }));
      }
    } catch {
      setClaimResults(prev => ({ ...prev, [id]: "error" }));
    }
    setClaimProcessing(null);
  }

  const tabStyle = (active: boolean) => ({
    padding: "10px 20px",
    background: "none",
    border: "none",
    borderBottom: active ? "2px solid #4A90B8" : "2px solid transparent",
    color: active ? "#E2EEF7" : "#4A6A8A",
    fontSize: "12px",
    letterSpacing: "2px",
    cursor: "pointer",
    fontFamily: "Georgia, serif",
  });

  return (
    <main style={{ background: "#080F1A", color: "#E2EEF7", fontFamily: "Georgia, serif", minHeight: "100vh" }}>
      <header className="vv-header">
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>
            <span style={{ color: "#4A90B8" }}>Vin</span><span style={{ color: "#E2EEF7" }}>Vault</span>
          </span>
          <span style={{ color: "#4A90B8", fontSize: "10px", letterSpacing: "4px", marginLeft: "10px" }}>REGISTRY</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
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

      <div className="vv-admin-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 40px 0" }}>
        {/* Stats */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "20px" }}>OVERVIEW</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "16px" }}>
            {[
              { label: "Today", value: stats.today, color: "#4A90B8" },
              { label: "This Week", value: stats.thisWeek, color: "#4A90B8" },
              { label: "All Time", value: stats.total, color: "#4A90B8" },
              { label: "Pending", value: stats.pending, color: "#B8944A" },
              { label: "Approved", value: stats.approved, color: "#4AB87A" },
              { label: "Claims Pending", value: claims.filter(c => c.status === "pending").length, color: "#B8944A" },
            ].map(s => (
              <div key={s.label} style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "16px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: s.color }}>{s.value}</div>
                <div style={{ color: "#8BA5B8", fontSize: "11px", letterSpacing: "1px", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Storage setup */}
        <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={initStorage}
            style={{ background: "#0A1828", border: "1px solid #1E3A5A", color: "#8BA5B8", padding: "8px 16px", fontSize: "12px", cursor: "pointer", fontFamily: "Georgia, serif", letterSpacing: "1px" }}
          >
            ⚙ Init Storage Bucket
          </button>
          {storageMsg && <span style={{ color: "#4A6A8A", fontSize: "12px" }}>{storageMsg}</span>}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #1E3A5A", marginBottom: "24px" }}>
          <button style={tabStyle(tab === "submissions")} onClick={() => setTab("submissions")}>
            SUBMISSIONS ({submissions.length})
          </button>
          <button style={tabStyle(tab === "claims")} onClick={() => setTab("claims")}>
            OWNERSHIP CLAIMS ({claims.filter(c => c.status === "pending").length} pending)
          </button>
        </div>

        {/* Search and filter */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={tab === "submissions" ? "Search chassis, email, market..." : "Search chassis or email..."}
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
            {tab === "submissions" ? `${filtered.length} of ${submissions.length}` : `${filteredClaims.length} of ${claims.length}`}
          </span>
        </div>

        {/* Submissions tab */}
        {tab === "submissions" && (
          <>
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
          </>
        )}

        {/* Claims tab */}
        {tab === "claims" && (
          <>
            <p style={{ color: "#4A90B8", letterSpacing: "3px", fontSize: "11px", marginBottom: "16px" }}>OWNERSHIP CLAIMS</p>
            {claims.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px", color: "#4A6A8A" }}>
                <p>No ownership claims yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredClaims.map(c => {
                  const result = claimResults[c.id];
                  const effectiveStatus = result || c.status;
                  return (
                    <div key={c.id} style={{ background: "#0A1828", border: "1px solid #1E3A5A", padding: "20px 24px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                        <div>
                          <Link href={`/ferrari/288-gto/${c.chassis_number}`} style={{ fontFamily: "monospace", fontSize: "15px", color: "#4A90B8", textDecoration: "none", letterSpacing: "1px" }}>
                            {c.chassis_number}
                          </Link>
                          <p style={{ color: "#8BA5B8", fontSize: "13px", marginTop: "4px" }}>{c.user_email}</p>
                        </div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{
                            background: effectiveStatus === "approved" ? "#0D2A1A" : effectiveStatus === "rejected" ? "#2A0D0D" : "#2A1A0D",
                            color: effectiveStatus === "approved" ? "#4AB87A" : effectiveStatus === "rejected" ? "#E07070" : "#B8944A",
                            padding: "4px 12px", fontSize: "11px", letterSpacing: "1px",
                          }}>{effectiveStatus.toUpperCase()}</span>
                          <span style={{ color: "#4A6A8A", fontSize: "12px" }}>{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {c.message && (
                        <p style={{ color: "#8BA5B8", fontSize: "13px", lineHeight: "1.6", background: "#080F1A", padding: "12px 16px", border: "1px solid #0D1E36", marginBottom: "12px" }}>
                          {c.message}
                        </p>
                      )}
                      {effectiveStatus === "pending" && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            disabled={claimProcessing === c.id}
                            onClick={() => handleClaim(c.id, "approved")}
                            style={{ background: "#0D2A1A", color: "#4AB87A", border: "1px solid #4AB87A", padding: "8px 20px", fontSize: "12px", letterSpacing: "1px", cursor: "pointer", fontFamily: "Georgia, serif" }}
                          >
                            ✓ Approve
                          </button>
                          <button
                            disabled={claimProcessing === c.id}
                            onClick={() => handleClaim(c.id, "rejected")}
                            style={{ background: "#2A0D0D", color: "#E07070", border: "1px solid #E07070", padding: "8px 20px", fontSize: "12px", letterSpacing: "1px", cursor: "pointer", fontFamily: "Georgia, serif" }}
                          >
                            ✗ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <footer style={{ borderTop: "1px solid #1E3A5A", padding: "32px 40px", textAlign: "center", color: "#4A6A8A", fontSize: "13px", marginTop: "60px" }}>
        <span style={{ color: "#4A90B8" }}>Vin</span>Vault Registry © 2026 · Admin
      </footer>
    </main>
  );
}
